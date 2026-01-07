import { createContext } from 'react';

import * as proto from '@arcanejs/protocol';

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
  sendMessage:
    | (<M extends proto.AnyClientComponentMessage>(msg: M) => void)
    | null;
  call:
    | (<Namespace extends string, P, Action extends string & keyof P>(
        msg: proto.CallForPair<Namespace, P, Action>,
      ) => Promise<proto.ReturnForPair<P, Action>>)
    | null;
  renderComponent: (info: proto.AnyComponentProto) => JSX.Element;
  connectionUuid: string | null;
  connection: StageConnectionState;
  reconnect: () => void;
};

export const StageContext = createContext<StageContextData>(
  new Proxy({} as StageContextData, {
    get: () => {
      throw new Error('Missing StageContext.Provider');
    },
  }),
);
