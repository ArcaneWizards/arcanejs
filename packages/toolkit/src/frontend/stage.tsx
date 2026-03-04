import { patchJson } from '@arcanejs/diff';
import React, {
  ReactElement,
  ReactNode,
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

import * as proto from '@arcanejs/protocol';
import { ThemeRoot } from '@arcanejs/toolkit-frontend/styling';

import {
  GroupStateWrapper,
  StageConnectionState,
  StageContext,
  StageContextData,
} from '@arcanejs/toolkit-frontend';

import {
  FrontendComponentRenderer,
  FrontendComponentRenderers,
} from '@arcanejs/toolkit-frontend/types';
import { calculateClass } from '@arcanejs/toolkit-frontend/util';

export type Props = {
  className?: string;
  renderers: FrontendComponentRenderers;
  themeRootProps?: React.HTMLAttributes<HTMLDivElement>;
  loadingState?: () => ReactNode;
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

type InFlightPing = {
  sentAtUnixMs: number;
  sentAtPerfMs: number;
};

type InFlightPings = {
  nextId: number;
  pings: Map<number, InFlightPing>;
};

type BestPing = {
  pingMs: number;
  timeDifferenceMs: number;
};

const Stage: React.FC<Props> = ({ className, renderers, loadingState }) => {
  const [root, setRoot] = useState<proto.AnyComponentProto | undefined>(
    undefined,
  );
  const socket = useRef<Promise<WebSocket> | null>(null);
  const [connection, setConnection] = useState<StageConnectionState>({
    state: 'connecting',
  });
  const [clockSync, setClockSync] =
    useState<proto.MetadataMessage['clockSync']>(null);
  const [lastPingMs, setLastPingMs] = useState<number | null>(null);
  const [bestPing, setBestPing] = useState<BestPing | null>(null);

  const calls = useRef<InFlightCalls>({
    nextId: 1,
    calls: new Map(),
  });
  const pings = useRef<InFlightPings>({
    nextId: 1,
    pings: new Map(),
  });

  const preparedRenderers = useMemo(() => {
    const prepared: Record<string, FrontendComponentRenderer> = {};

    for (const renderer of renderers) {
      prepared[renderer.namespace] = renderer;
    }

    return prepared;
  }, [renderers]);

  const renderComponent = useCallback(
    (info: proto.AnyComponentProto): ReactElement => {
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
        setConnection({ state: 'connected', uuid: msg.connectionUuid });
        setClockSync(msg.clockSync);
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
      case 'pong': {
        const ping = pings.current.pings.get(msg.pingId);
        if (!ping) {
          console.warn(
            `Received pong response for unknown ping ID ${msg.pingId}`,
          );
          return;
        }
        pings.current.pings.delete(msg.pingId);

        const roundTripMs = performance.now() - ping.sentAtPerfMs;
        const estimatedClientMidpointMs = ping.sentAtUnixMs + roundTripMs / 2;
        const nextTimeDifferenceMs =
          estimatedClientMidpointMs - msg.serverTimeMillis;

        setLastPingMs(roundTripMs);
        setBestPing((current) =>
          // No best ping yet
          current === null ||
          // Better ping than current best, so this will likely be more precise
          roundTripMs < current.pingMs ||
          // Time difference has changed significantly, so this is likely more accurate even if ping isn't better
          Math.abs(nextTimeDifferenceMs - current.timeDifferenceMs) >
            roundTripMs
            ? {
                pingMs: roundTripMs,
                timeDifferenceMs: nextTimeDifferenceMs,
              }
            : current,
        );
        return;
      }
    }
  }, []);

  const initializeWebsocket = useCallback(async () => {
    // Close existing socket if present
    if (socket.current) {
      socket.current.then((s) => s.close()).catch((err) => console.error(err));
      socket.current = null;
    }
    console.log('initializing websocket');
    const wsUrl = new URL(window.location.href);
    wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    wsUrl.hash = ''; // Websocket URLs cannot contain a fragment
    const ws = new WebSocket(wsUrl.href);
    ws.onmessage = (event) => {
      handleMessage(JSON.parse(event.data));
    };
    ws.onclose = () => {
      setConnection({ state: 'closed' });
      console.log('socket closed');
      socket.current = null;
    };
    socket.current = new Promise<WebSocket>((resolve, reject) => {
      ws.onopen = () => {
        console.log('socket opened');
        setConnection({ state: 'connected', uuid: null });
        resolve(ws);
      };
      ws.onerror = (err) => {
        setConnection({
          state: 'error',
          error:
            err instanceof Error
              ? err
              : new Error('Unable to connect', { cause: err }),
        });
        console.error('socket error', err);
        reject(err);
        socket.current = null;
      };
    });
    // Return promise rather than WebSocket directly to ensure that
    // it's fully opened before initializeWebsocket is resolved.
    return socket.current;
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

  useEffect(() => {
    if (connection.state !== 'connected' && clockSync !== null) {
      setClockSync(null);
    }

    setLastPingMs(null);
    setBestPing(null);
    pings.current.pings.clear();

    if (connection.state !== 'connected' || clockSync === null) {
      return;
    }

    const sendPing = () => {
      const pingId = pings.current.nextId++;
      pings.current.pings.set(pingId, {
        sentAtUnixMs: Date.now(),
        sentAtPerfMs: performance.now(),
      });
      sendMessage({
        type: 'ping',
        pingId,
      }).catch((error) => {
        pings.current.pings.delete(pingId);
        console.error('Unable to send ping', error);
      });
    };

    sendPing();
    const interval = window.setInterval(sendPing, clockSync.pingIntervalMs);
    return () => {
      window.clearInterval(interval);
    };
  }, [clockSync, connection.state, sendMessage]);

  const stageContext: StageContextData = useMemo(
    () => ({
      sendMessage,
      renderComponent,
      call,
      connectionUuid: connection.state === 'connected' ? connection.uuid : null,
      connection,
      timeDifferenceMs: bestPing?.timeDifferenceMs ?? null,
      lastPingMs,
      reconnect: () => void initializeWebsocket(),
    }),
    [
      sendMessage,
      renderComponent,
      call,
      initializeWebsocket,
      connection,
      bestPing,
      lastPingMs,
    ],
  );

  return (
    <StageContext.Provider value={stageContext}>
      <GroupStateWrapper openByDefault={false}>
        <div className={className}>
          {root
            ? renderComponent(root)
            : loadingState?.() ?? (
                <div className="arcane-stage__no-root">
                  No root has been added to the light desk
                </div>
              )}
        </div>
      </GroupStateWrapper>
    </StageContext.Provider>
  );
};

export function rootComponent(props: Props) {
  return (
    <ThemeRoot rootProps={props.themeRootProps}>
      <Stage
        {...props}
        className={calculateClass('arcane-stage', props.className)}
      />
    </ThemeRoot>
  );
}
