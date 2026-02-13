import _ from 'lodash';
import { diffJson } from '@arcanejs/diff/diff';
import {
  DEFAULT_LIGHT_DESK_OPTIONS,
  InitializationOptions,
  ToolkitAdditionalFiles,
  ToolkitOptions,
} from './options';
import { Connection, Server } from './server';
import { IDMap } from './util/id-map';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { Group } from './components/group';
import {
  AnyComponent,
  EventEmitter,
  Listenable,
  Parent,
} from './components/base';
import {
  ClientMessage,
  AnyComponentProto,
  AnyClientComponentCall,
} from '@arcanejs/protocol';

export type ToolkitConnection = {
  uuid: string;
};

type ConnectionMetadata = {
  /**
   * The publicly-exposed connection object that can be shared throughout
   * the library, and externally.
   */
  publicConnection: ToolkitConnection;
  lastTreeSent: AnyComponentProto | undefined;
};

export type Events = {
  'new-connection': (connection: ToolkitConnection) => void;
  'closed-connection': (connection: ToolkitConnection) => void;
};

export type ToolkitServerListenerOptions = {
  port: number;
  host?: string;
};

export type ToolkitServerListener = {
  close: () => void;
};

export class Toolkit<
    TAdditionalFiles extends ToolkitAdditionalFiles = Record<never, never>,
  >
  implements Parent, Listenable<Events>
{
  private readonly options: ToolkitOptions<TAdditionalFiles>;
  /**
   * Mapping from components to unique IDs that identify them
   */
  private readonly componentIDMap = new IDMap();
  private readonly connections = new Map<Connection, ConnectionMetadata>();
  private rootGroup: Group | null = null;

  /** @hidden */
  private readonly events = new EventEmitter<Events>();
  private readonly server: Server<TAdditionalFiles>;

  constructor(options: Partial<ToolkitOptions<TAdditionalFiles>> = {}) {
    this.options = {
      ...DEFAULT_LIGHT_DESK_OPTIONS,
      ...options,
    } as ToolkitOptions<TAdditionalFiles>;
    if (
      !this.options.path.endsWith('/') ||
      !this.options.path.startsWith('/')
    ) {
      throw new Error(
        `path must start and end with "/", set to: ${this.options.path}`,
      );
    }
    this.server = new Server(
      this.options,
      this.onNewConnection,
      this.onClosedConnection,
      this.onMessage,
      this.options.log,
    );
  }

  public addListener = this.events.addListener;
  public removeListener = this.events.removeListener;

  public start = (opts: InitializationOptions<TAdditionalFiles>) => {
    if (opts.mode === 'automatic') {
      this.listen({ port: opts.port }).then(() => {
        const url = `http://localhost:${opts.port}${this.options.path}`;
        opts.onReady?.(url);
        this.options.log?.info(`Light Desk Started: ${url}`);
      });
    } else if (opts.mode === 'express') {
      const wss = new WebSocketServer({
        server: opts.server,
      });
      wss.on('connection', this.server.handleWsConnection);
      opts.express.get(`${this.options.path}*`, this.server.handleHttpRequest);
    } else if (opts.mode === 'manual') {
      opts.setup(this.server);
    } else {
      throw new Error(`Unsupported mode`);
    }
  };

  public listen = ({
    port,
    host,
  }: ToolkitServerListenerOptions): Promise<ToolkitServerListener> => {
    const httpServer = createServer(this.server.handleHttpRequest);
    const wss = new WebSocketServer({
      server: httpServer,
    });
    wss.on('connection', this.server.handleWsConnection);
    const close = () => {
      wss.close();
      httpServer.close();
      httpServer.closeAllConnections();
      // After a short delay, destroy any remaining sockets
      setTimeout(() => {
        wss.clients.forEach((client) => client.terminate());
      }, 1000);
    };
    return new Promise((resolve, reject) => {
      httpServer.on('error', (err) => {
        reject(err);
      });
      wss.on('error', (err) => {
        reject(err);
      });
      try {
        httpServer.listen({ port, host }, () => {
          resolve({
            close,
          });
        });
      } catch (err) {
        reject(err);
      }
    });
  };

  public setRoot = (group: Group) => {
    if (this.rootGroup) {
      // TODO
      throw new Error('Can only set root group once');
    }
    this.rootGroup = group;
    this.rootGroup.setParent(this);
  };

  public log() {
    return this.options.log ?? null;
  }

  public getConnections = (): ToolkitConnection[] => {
    return [...this.connections.values()].map((c) => c.publicConnection);
  };

  public updateTree = _.throttle(
    () => {
      setImmediate(() => {
        if (!this.rootGroup) return;
        const root = this.rootGroup.getProtoInfo(this.componentIDMap);
        for (const [connection, meta] of this.connections.entries()) {
          connection.sendMessage({
            type: 'tree-diff',
            diff: diffJson(meta.lastTreeSent, root),
          });
          meta.lastTreeSent = root;
        }
      });
    },
    10,
    { leading: true, trailing: true },
  );

  public removeChild = (component: AnyComponent) => {
    if (this.rootGroup === component) {
      this.rootGroup = null;
      component.setParent(null);
      // TODO: update tree with empty tree
    }
  };

  private onNewConnection = (connection: Connection) => {
    const lastTreeSent =
      this.rootGroup?.getProtoInfo(this.componentIDMap) ?? undefined;
    const uuid = uuidv4();
    const publicConnection: ToolkitConnection = {
      get uuid() {
        return uuid;
      },
    };
    this.connections.set(connection, { publicConnection, lastTreeSent });
    this.events.emit('new-connection', publicConnection);
    connection.sendMessage({
      type: 'metadata',
      connectionUuid: uuid,
    });
    if (lastTreeSent) {
      connection.sendMessage({
        type: 'tree-full',
        root: lastTreeSent,
      });
    }
  };

  private onClosedConnection = (connection: Connection) => {
    this.log()?.debug('removing connection');
    const con = this.connections.get(connection);
    this.connections.delete(connection);
    if (con) {
      this.events.emit('closed-connection', con.publicConnection);
    }
  };

  private handleCall = async (
    connection: Connection,
    publicConnection: ToolkitConnection,
    call: AnyClientComponentCall,
  ) => {
    try {
      const rg = this.rootGroup;
      if (rg) {
        const returnValue = await new Promise((resolve, reject) =>
          rg.routeCall(this.componentIDMap, call, publicConnection, {
            resolve,
            reject,
          }),
        );
        connection.sendMessage({
          type: 'call-response',
          namespace: call.namespace,
          requestId: call.requestId,
          success: true,
          returnValue,
        });
      } else {
        throw new Error('No root group set');
      }
    } catch (err) {
      connection.sendMessage({
        type: 'call-response',
        namespace: call.namespace,
        requestId: call.requestId,
        success: false,
        errorMessage: `${err}`,
      });
    }
  };

  private onMessage = (connection: Connection, message: ClientMessage) => {
    const con = this.connections.get(connection);
    if (!con) {
      this.log()?.warn(`got message from unknown connection`);
      return;
    }
    const { publicConnection } = con;
    this.log()?.debug(
      'got message: %o from %s',
      message,
      publicConnection.uuid,
    );
    switch (message.type) {
      case 'component-message':
        if (this.rootGroup)
          this.rootGroup.routeMessage(
            this.componentIDMap,
            message,
            publicConnection,
          );
        break;
      case 'component-call':
        this.handleCall(connection, publicConnection, message);
        break;
    }
  };
}
