import { patchJson } from '@arcanejs/diff';
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { styled } from 'styled-components';

import * as proto from '@arcanejs/protocol';
import {
  BaseStyle,
  GlobalStyle,
  Theme,
  DARK_THEME,
  LIGHT_THEME,
} from '@arcanejs/toolkit-frontend/styling';

import { GroupStateWrapper, StageContext } from '@arcanejs/toolkit-frontend';

import {
  FrontendComponentRenderer,
  FrontendComponentRenderers,
} from '@arcanejs/toolkit-frontend/types';
import { PreferredThemeProvider } from '../../../toolkit-frontend/src/styling';

export type Props = {
  className?: string;
  renderers: FrontendComponentRenderers;
  themes?: {
    dark: Theme;
    light: Theme;
  };
};

type InFlightCall = {
  resolve: (value: unknown) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (reason?: any) => void;
};

type InFlightCalls = {
  nextId: number;
  calls: Map<number, InFlightCall>;
};

const Stage: React.FC<Props> = ({ className, renderers }) => {
  const [root, setRoot] = useState<proto.AnyComponentProto | undefined>(
    undefined,
  );
  const socket = useRef<Promise<WebSocket> | null>(null);
  const uuid = useRef<string | null>(null);

  const calls = useRef<InFlightCalls>({
    nextId: 1,
    calls: new Map(),
  });

  const preparedRenderers = useMemo(() => {
    const prepared: Record<string, FrontendComponentRenderer> = {};

    for (const renderer of renderers) {
      prepared[renderer.namespace] = renderer;
    }

    return prepared;
  }, [renderers]);

  const renderComponent = useCallback(
    (info: proto.AnyComponentProto): JSX.Element => {
      const renderer = preparedRenderers[info.namespace];
      if (!renderer) {
        throw new Error(`no renderer for namespace ${info.namespace}`);
      }
      return renderer.render(info);
    },
    [preparedRenderers],
  );

  const handleMessage = useCallback((msg: proto.ServerMessage) => {
    switch (msg.type) {
      case 'metadata':
        // This should always be the first message
        uuid.current = msg.connectionUuid;
        return;
      case 'tree-full':
        setRoot(msg.root);
        return;
      case 'tree-diff':
        setRoot((prevRoot) => patchJson(prevRoot, msg.diff));
        return;
      case 'call-response': {
        const call = calls.current.calls.get(msg.requestId);
        if (call) {
          calls.current.calls.delete(msg.requestId);
          if (msg.success) {
            call.resolve(msg.returnValue);
          } else {
            call.reject(msg.errorMessage);
          }
        } else {
          console.warn(
            `Received response for unknown call request ID ${msg.requestId}`,
          );
        }
        return;
      }
    }
  }, []);

  const initializeWebsocket = useCallback(async () => {
    console.log('initializing websocket');
    const wsUrl = new URL(window.location.href);
    wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(
      `ws://${window.location.hostname}:${window.location.port}${window.location.pathname}`,
    );
    ws.onmessage = (event) => {
      handleMessage(JSON.parse(event.data));
    };
    ws.onclose = () => {
      console.log('socket closed');
      socket.current = null;
    };
    socket.current = new Promise<WebSocket>((resolve, reject) => {
      ws.onopen = () => {
        resolve(ws);
      };
      ws.onerror = (err) => {
        reject(err);
        socket.current = null;
      };
    });
    return ws;
  }, []);

  const sendMessage = useCallback(async (msg: proto.ClientMessage) => {
    (await (socket.current || initializeWebsocket())).send(JSON.stringify(msg));
  }, []);

  const call = useCallback(
    async <Namespace extends string, P, Action extends string & keyof P>(
      msg: proto.CallForPair<Namespace, P, Action>,
    ): Promise<proto.ReturnForPair<P, Action>> => {
      const requestId = calls.current.nextId++;
      const sendMsg = {
        ...msg,
        requestId,
      };
      const promise: Promise<proto.ReturnForPair<P, Action>> = new Promise(
        (resolve, reject) => {
          calls.current.calls.set(requestId, {
            resolve: resolve as (v: unknown) => void,
            reject,
          });
          (socket.current || initializeWebsocket()).then((s) =>
            s.send(JSON.stringify(sendMsg)),
          );
        },
      );
      return promise;
    },
    [],
  );

  useEffect(() => {
    initializeWebsocket();
  }, [initializeWebsocket]);

  return (
    <StageContext.Provider
      value={{
        sendMessage,
        renderComponent,
        call,
        get connectionUuid() {
          if (!uuid.current) {
            throw new Error('Unexpected missing UUID')!;
          }
          return uuid.current;
        },
      }}
    >
      <GroupStateWrapper openByDefault={false}>
        <div className={className}>
          {root ? (
            renderComponent(root)
          ) : (
            <div className="no-root">
              No root has been added to the light desk
            </div>
          )}
        </div>
      </GroupStateWrapper>
    </StageContext.Provider>
  );
};

const StyledStage = styled(Stage)`
  width: 100%;
  height: 100%;
  background-color: ${(p) => p.theme.pageBg};
  color: ${(p) => p.theme.textNormal};
  padding: ${(p) => p.theme.sizingPx.spacing}px;
`;

export function rootComponent(props: Props) {
  return (
    <PreferredThemeProvider
      dark={props.themes?.dark ?? DARK_THEME}
      light={props.themes?.light ?? LIGHT_THEME}
    >
      <BaseStyle />
      <GlobalStyle />
      <StyledStage {...props} />
    </PreferredThemeProvider>
  );
}
