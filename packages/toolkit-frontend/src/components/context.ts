import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactElement,
} from 'react';

import * as proto from '@arcanejs/protocol';
import { Logger } from '@arcanejs/protocol/logging';

export type StageConnectionState =
  | {
      state: 'connecting' | 'closed';
    }
  | {
      state: 'error';
      error: Error;
    }
  | {
      state: 'connected';
      uuid: string | null;
    };

export type StageContextData = {
  log: Logger;
  sendMessage: <M extends proto.AnyClientComponentMessage>(msg: M) => void;
  call: <Namespace extends string, P, Action extends string & keyof P>(
    msg: proto.CallForPair<Namespace, P, Action>,
  ) => Promise<proto.ReturnForPair<P, Action>>;
  upload: <M extends proto.AnyClientComponentCallUpload>(
    msg: Omit<M, 'requestId'>,
    data: Blob | ReadableStream<Uint8Array>,
  ) => Promise<void>;
  download: <M extends proto.AnyClientComponentCallDownload>(
    msg: Omit<M, 'requestId'>,
  ) => Promise<ReadableStream<Uint8Array<ArrayBuffer>>>;
  addNotificationListener: (
    listener: (msg: proto.BaseNotificationMessage<string, string>) => void,
  ) => void;
  removeNotificationListener: (
    listener: (msg: proto.BaseNotificationMessage<string, string>) => void,
  ) => void;
  renderComponent: (info: proto.AnyComponentProto) => ReactElement;
  connectionUuid: string | null;
  connection: StageConnectionState;
  /**
   * Estimated offset in milliseconds for how far ahead of the server clock
   * the client clock is.
   */
  timeDifferenceMs: number | null;
  lastPingMs: number | null;
  reconnect: () => void;
};

export const StageContext = createContext<StageContextData>(
  new Proxy({} as StageContextData, {
    get: () => {
      throw new Error('Missing StageContext.Provider');
    },
  }),
);

export const useNotificationHandler = <
  T extends proto.BaseNotificationMessage<string, string>,
>(
  typeGuard: (msg: proto.BaseNotificationMessage<string, string>) => msg is T,
  handler: (msg: T) => void,
  dependencyList: unknown[],
) => {
  const { addNotificationListener, removeNotificationListener } =
    useContext(StageContext);

  if (!addNotificationListener || !removeNotificationListener) {
    throw new Error(
      'useNotificationHandler must be used within a StageContext',
    );
  }

  const callback = useCallback(handler, dependencyList);

  useEffect(() => {
    const listener = (msg: proto.BaseNotificationMessage<string, string>) => {
      if (typeGuard(msg)) {
        callback(msg);
      }
    };

    addNotificationListener(listener);
    return () => {
      removeNotificationListener(listener);
    };
  }, [
    addNotificationListener,
    removeNotificationListener,
    typeGuard,
    callback,
  ]);
};
