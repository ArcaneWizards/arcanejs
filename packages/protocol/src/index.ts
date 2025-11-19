import { Diff } from '@arcanejs/diff';

export type BaseComponentProto<
  Namespace extends string,
  Component extends string,
> = {
  key: number;
  namespace: Namespace;
  component: Component;
};

export type AnyComponentProto = BaseComponentProto<string, string>;

export type MetadataMessage = {
  type: 'metadata';
  /**
   * The UUID for the current connection
   */
  connectionUuid: string;
};

export type SendTreeMsg = {
  type: 'tree-full';
  root: BaseComponentProto<string, string>;
};

export type UpdateTreeMsg = {
  type: 'tree-diff';
  diff: Diff<BaseComponentProto<string, string>>;
};

export type CallResponseMsg<Namespace extends string, T> = {
  type: 'call-response';
  namespace: Namespace;
  requestId: number;
} & (
  | {
      success: true;
      returnValue: T;
    }
  | {
      success: false;
      errorMessage: string;
    }
);

export type ServerMessage =
  | MetadataMessage
  | SendTreeMsg
  | UpdateTreeMsg
  | CallResponseMsg<string, unknown>;

export type BaseClientComponentMessage<Namespace extends string> = {
  type: 'component-message';
  namespace: Namespace;
  componentKey: number;
};

export type BaseClientComponentCall<
  Namespace extends string,
  Action extends string,
> = {
  type: 'component-call';
  namespace: Namespace;
  componentKey: number;
  requestId: number;
  action: Action;
};

export type BaseClientComponentCallPair<
  Namespace extends string,
  Action extends string,
  Call extends BaseClientComponentCall<Namespace, Action>,
  Return = unknown,
> = {
  call: Call;
  return: Return;
};

// export type BaseClientCallResponsePairs<Namespace extends string, Actions extends string> = {
//   [A in Actions]: BaseClientComponentCallPair<Namespace, A, BaseClientComponentCall<Namespace, A>, unknown>;
// };

export type CallForPair<
  Namespace extends string,
  Pairs,
  Action extends string & keyof Pairs,
> =
  Pairs extends Record<Action, { call: infer R }>
    ? Omit<R & BaseClientComponentCall<Namespace, Action>, 'requestId'>
    : never;

export type ReturnForPair<Pairs, Action extends string & keyof Pairs> =
  Pairs extends Record<Action, { return: infer R }> ? R : never;

export type AnyClientComponentMessage = BaseClientComponentMessage<string>;

export type AnyClientComponentCall = BaseClientComponentCall<string, string>;

export type ClientMessage = AnyClientComponentMessage | AnyClientComponentCall;
