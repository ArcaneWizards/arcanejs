import _ from 'lodash';
import { diffJson } from '@arcanejs/diff/diff';
import {
  DEFAULT_LIGHT_DESK_OPTIONS,
  InitializationOptions,
  ToolkitAdditionalFiles,
  ToolkitClockSyncOptions,
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
  CallDownloadResponse,
  CallUploadResponse,
  EventEmitter,
  Listenable,
  Parent,
} from './components/base';
import {
  ClientMessage,
  AnyComponentProto,
  AnyClientComponentCall,
  AnyClientComponentCallUpload,
  AnyClientComponentCallDownload,
  BaseNotificationMessage,
} from '@arcanejs/protocol';
import { Readable } from 'node:stream';
import { randomBytes } from 'node:crypto';
import { performance } from 'node:perf_hooks';

export type ToolkitConnection = {
  uuid: string;
};

export type ToolkitRenderContext = {
  connection: ToolkitConnection;
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

type ToolkitClockSyncConfig = {
  pingIntervalMs: number;
};

const normalizeClockSyncOptions = (
  clockSync: false | ToolkitClockSyncOptions | undefined,
): ToolkitClockSyncConfig | null => {
  if (!clockSync) {
    return null;
  }

  const { pingIntervalMs } = clockSync;

  if (!Number.isFinite(pingIntervalMs) || pingIntervalMs <= 0) {
    throw new Error(
      `clockSync.pingIntervalMs must be a positive number, got: ${pingIntervalMs}`,
    );
  }

  return {
    pingIntervalMs,
  };
};

type ActiveFileTransfer<T> = {
  connection: Connection;
  handler: T;
};

export class Toolkit<
    TAdditionalFiles extends ToolkitAdditionalFiles = Record<never, never>,
  >
  implements Parent, Listenable<Events>
{
  private readonly options: ToolkitOptions<TAdditionalFiles>;
  private readonly clockSync: ToolkitClockSyncConfig | null;
  /**
   * Mapping from components to unique IDs that identify them
   */
  private readonly componentIDMap = new IDMap();
  private readonly connections = new Map<Connection, ConnectionMetadata>();
  private rootGroup: Group | null = null;

  /** @hidden */
  private readonly events = new EventEmitter<Events>();
  private readonly server: Server<TAdditionalFiles>;

  private readonly uploads = new Map<
    string,
    ActiveFileTransfer<CallUploadResponse>
  >();
  private readonly downloads = new Map<
    string,
    ActiveFileTransfer<CallDownloadResponse>
  >();

  constructor(options: Partial<ToolkitOptions<TAdditionalFiles>> = {}) {
    this.options = {
      ...DEFAULT_LIGHT_DESK_OPTIONS,
      ...options,
    } as ToolkitOptions<TAdditionalFiles>;
    this.clockSync = normalizeClockSyncOptions(this.options.clockSync);
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
      this.onUpload,
      this.onDownload,
      this.options.log,
    );
  }

  public addListener = this.events.addListener;
  public removeListener = this.events.removeListener;

  public start = (opts: InitializationOptions<TAdditionalFiles>) => {
    this.checkForPerfIssues();
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

  /**
   * Perform a delayed check to see if performance entries are being created,
   * which may indicate that react-reconciler is running in development mode,
   * or some other source of performance overhead.
   */
  public checkForPerfIssues = (timeout = 1_000) => {
    setTimeout(() => {
      const entries = performance.getEntries().length;
      if (entries > 0) {
        this.log()?.warn(
          `PERF ISSUES:
============================= PERF CHECKS ENABLED ==============================
Performance entries are being created (${entries}),
this probably means you are running react-reconciler in development mode.

Make sure you set NODE_ENV=production to avoid performance issues & memory leaks
================================================================================
`,
        );
      }
    }, timeout);
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
        for (const [connection, meta] of this.connections.entries()) {
          const root = this.rootGroup.getProtoInfo(this.componentIDMap, {
            connection: meta.publicConnection,
          });
          const diff = diffJson(meta.lastTreeSent, root);
          if (diff.type === 'match') continue;
          connection.sendMessage({
            type: 'tree-diff',
            diff,
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
    const uuid = uuidv4();
    const publicConnection: ToolkitConnection = {
      get uuid() {
        return uuid;
      },
    };
    const lastTreeSent =
      this.rootGroup?.getProtoInfo(this.componentIDMap, {
        connection: publicConnection,
      }) ?? undefined;
    this.connections.set(connection, {
      publicConnection,
      lastTreeSent,
    });
    this.events.emit('new-connection', publicConnection);
    connection.sendMessage({
      type: 'metadata',
      connectionUuid: uuid,
      clockSync: this.clockSync
        ? {
            pingIntervalMs: this.clockSync.pingIntervalMs,
          }
        : null,
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
      // Clean up any active uploads/downloads for this connection
      let inProgressUploads = 0;
      let inProgressDownloads = 0;
      for (const [id, upload] of this.uploads.entries()) {
        if (upload.connection === connection) {
          this.uploads.delete(id);
          inProgressUploads++;
        }
      }
      for (const [id, download] of this.downloads.entries()) {
        if (download.connection === connection) {
          this.downloads.delete(id);
          inProgressDownloads++;
        }
      }
      if (inProgressUploads > 0 || inProgressDownloads > 0) {
        this.log()?.info(
          `Connection closed with ${inProgressUploads} in-progress uploads and ${inProgressDownloads} in-progress downloads`,
        );
      }
      this.events.emit('closed-connection', con.publicConnection);
    }
  };

  private handleCall = async (
    connection: Connection,
    publicConnection: ToolkitConnection,
    call:
      | AnyClientComponentCall
      | AnyClientComponentCallUpload
      | AnyClientComponentCallDownload,
  ) => {
    try {
      const rg = this.rootGroup;
      if (rg) {
        const handlerValue = await new Promise((resolve, reject) =>
          rg.routeCall(this.componentIDMap, call, publicConnection, {
            resolve,
            reject,
          }),
        );
        let returnValue: unknown;
        if (call.type === 'component-call') {
          returnValue = handlerValue;
        } else if (call.type === 'component-call-upload') {
          const uploadHandler = handlerValue as CallUploadResponse;
          const secureId = randomBytes(32).toString('hex');
          this.uploads.set(secureId, {
            connection,
            handler: uploadHandler,
          });
          returnValue = secureId;
        } else if (call.type === 'component-call-download') {
          const downloadHandler = handlerValue as CallDownloadResponse;
          const secureId = randomBytes(32).toString('hex');
          this.downloads.set(secureId, {
            connection,
            handler: downloadHandler,
          });
          returnValue = secureId;
        }
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
    } catch (cause) {
      const error = new Error(`Error handling call`, { cause });
      this.log()?.error(error);
      connection.sendMessage({
        type: 'call-response',
        namespace: call.namespace,
        requestId: call.requestId,
        success: false,
        errorMessage: `${cause}`,
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
    try {
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
        case 'component-call-upload':
        case 'component-call-download':
          this.handleCall(connection, publicConnection, message);
          break;
        case 'ping': {
          connection.sendMessage({
            type: 'pong',
            pingId: message.pingId,
            serverTimeMillis: Date.now(),
          });
          break;
        }
      }
    } catch (cause) {
      const error = new Error(
        `Error handling message: ${JSON.stringify(message)}`,
        { cause },
      );
      this.log()?.error(error);
    }
  };

  private onUpload = async (id: string, data: Readable) => {
    const upload = this.uploads.get(id);
    if (!upload) {
      throw new Error(`No upload handler found for id: ${id}`);
    }
    await upload.handler(data);
    this.uploads.delete(id);
  };

  private onDownload = async (id: string): Promise<CallDownloadResponse> => {
    const download = this.downloads.get(id);
    if (!download) {
      throw new Error(`No download handler found for id: ${id}`);
    }
    return download.handler;
  };

  public sendNotification = (
    notification: BaseNotificationMessage<string, string>,
    filter?: (connection: ToolkitConnection) => boolean,
  ) => {
    for (const [connection, meta] of this.connections.entries()) {
      if (!filter || filter(meta.publicConnection)) {
        connection.sendMessage(notification);
      }
    }
  };
}
