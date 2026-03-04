import path from 'path';
import { createHash, timingSafeEqual } from 'node:crypto';
import pino from 'pino';
import { useState, type ReactNode } from 'react';
import type {
  AnyClientComponentCall,
  AnyClientComponentMessage,
} from '@arcanejs/protocol';
import {
  Toolkit,
  type ToolkitConnection,
  type ToolkitRenderContext,
} from '@arcanejs/toolkit';
import { AnyComponent, BaseParent } from '@arcanejs/toolkit/components/base';
import { IDMap } from '@arcanejs/toolkit/util';
import {
  Button,
  CoreComponents,
  Group,
  Label,
  ToolkitRenderer,
  prepareComponents,
} from '@arcanejs/react-toolkit';
import {
  AUTH_NAMESPACE,
  AuthComponentCalls,
  ConnectionLockComponentProto,
  isAuthComponentCall,
} from './proto';

const toolkit = new Toolkit({
  log: pino({
    level: 'debug',
    transport: {
      target: 'pino-pretty',
    },
  }),
  title: '@arcanejs lock screen example',
  entrypointJsFile: path.resolve(
    __dirname,
    '../dist/lock-screen-entrypoint.js',
  ),
});

toolkit.start({
  mode: 'automatic',
  port: 1334,
});

type ConnectionLockProps = {
  children?: ReactNode;
  title: string;
  password: string;
  lockedMessage: string;
};

const defaultConnectionLockProps: ConnectionLockProps = {
  title: 'Protected Controls',
  password: 'open-sesame',
  lockedMessage: 'Enter the password to unlock this connection.',
};

class ConnectionLock extends BaseParent<
  typeof AUTH_NAMESPACE,
  ConnectionLockComponentProto,
  ConnectionLockProps,
  AuthComponentCalls,
  'unlock'
> {
  /**
   * Store auth state by connection object identity. Weak references ensure
   * disconnected connections can be garbage collected without explicit cleanup.
   */
  private readonly authorizedConnections = new WeakSet<ToolkitConnection>();

  public constructor(props?: Partial<ConnectionLockProps>) {
    super(defaultConnectionLockProps, props);
  }

  public validateChildren = (children: AnyComponent[]) => {
    if (children.length > 1) {
      throw new Error('ConnectionLock can only have one child');
    }
  };

  private isConnectionAuthorized = (connection: ToolkitConnection) =>
    this.authorizedConnections.has(connection);

  private isPasswordValid = (inputPassword: string): boolean => {
    const expectedDigest = createHash('sha256')
      .update(this.props.password, 'utf8')
      .digest();
    const providedDigest = createHash('sha256')
      .update(inputPassword, 'utf8')
      .digest();
    return timingSafeEqual(expectedDigest, providedDigest);
  };

  public getProtoInfo = (
    idMap: IDMap,
    context: ToolkitRenderContext,
  ): ConnectionLockComponentProto => {
    const isUnlocked = this.isConnectionAuthorized(context.connection);
    const child = isUnlocked
      ? this.getChildren()
          .slice(0, 1)
          .map((component) => component.getProtoInfo(idMap, context))[0] ?? null
      : null;
    return {
      namespace: AUTH_NAMESPACE,
      component: 'connection-lock',
      key: idMap.getId(this),
      state: isUnlocked ? 'unlocked' : 'locked',
      title: this.props.title,
      lockedMessage: this.props.lockedMessage,
      child,
    };
  };

  public routeMessage(
    idMap: IDMap,
    message: AnyClientComponentMessage,
    connection: ToolkitConnection,
  ): void {
    if (idMap.getId(this) === message.componentKey) {
      this.handleMessage(message, connection);
      return;
    }
    if (!this.isConnectionAuthorized(connection)) {
      return;
    }
    for (const child of this.getChildren()) {
      if (idMap.getId(child) === message.componentKey) {
        child.handleMessage(message, connection);
      } else {
        child.routeMessage(idMap, message, connection);
      }
    }
  }

  public async routeCall(
    idMap: IDMap,
    call: AnyClientComponentCall,
    connection: ToolkitConnection,
    callbacks: {
      resolve: (result: unknown) => void;
      reject: (error: unknown) => void;
    },
  ): Promise<void> {
    if (idMap.getId(this) === call.componentKey) {
      this.handleCall(call, connection)
        .then(callbacks.resolve)
        .catch(callbacks.reject);
      return;
    }
    if (!this.isConnectionAuthorized(connection)) {
      callbacks.reject(new Error('Unauthorized connection'));
      return;
    }
    for (const child of this.getChildren()) {
      if (idMap.getId(child) === call.componentKey) {
        child
          .handleCall(call, connection)
          .then(callbacks.resolve)
          .catch(callbacks.reject);
      } else {
        child.routeCall(idMap, call, connection, callbacks);
      }
    }
  }

  public handleCall = async (
    call: AnyClientComponentCall,
    connection: ToolkitConnection,
  ): Promise<AuthComponentCalls['unlock']['return']> => {
    if (!isAuthComponentCall(call, 'unlock')) {
      throw new Error(`Unhandled call action: ${call.action}`);
    }
    if (this.isPasswordValid(call.password)) {
      this.authorizedConnections.add(connection);
      this.updateTree();
      return { success: true };
    }
    return {
      success: false,
      errorMessage: 'Incorrect password.',
    };
  };
}

const C = prepareComponents(AUTH_NAMESPACE, {
  ConnectionLock,
});

const App = () => {
  const [protectedCounter, setProtectedCounter] = useState(0);
  const [lastActorUuid, setLastActorUuid] = useState<string | null>(null);

  return (
    <Group direction="vertical" title="Per-connection lock-screen demo">
      <Label text="Password is configured server-side." />
      <C.ConnectionLock password="open-sesame">
        <Group direction="vertical" title="Unlocked Controls">
          <Label text={`Protected counter: ${protectedCounter}`} />
          <Label text={`Last actor: ${lastActorUuid ?? 'none'}`} />
          <Button
            text="Increment protected counter"
            onClick={(connection) => {
              setProtectedCounter((current) => current + 1);
              setLastActorUuid(connection.uuid);
            }}
          />
        </Group>
      </C.ConnectionLock>
    </Group>
  );
};

ToolkitRenderer.render(
  <App />,
  toolkit,
  {},
  { componentNamespaces: [CoreComponents, C] },
);
