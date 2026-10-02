import { Diff, JSONValue } from '@arcanejs/diff';

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
  clockSync: {
    /**
     * How often the frontend should send ping requests.
     */
    pingIntervalMs: number;
  } | null;
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

export type BaseNotificationMessage<
  Namespace extends string,
  Notification extends string,
> = {
  type: 'notification';
  namespace: Namespace;
  notification: Notification;
};

export type PongResponseMessage = {
  type: 'pong';
  pingId: number;
  /**
   * Server clock time in milliseconds.
   */
  serverTimeMillis: number;
};

export type ServerMessage =
  | MetadataMessage
  | SendTreeMsg
  | UpdateTreeMsg
  | CallResponseMsg<string, unknown>
  | BaseNotificationMessage<string, string>
  | PongResponseMessage;

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

export type BaseClientComponentCallUpload<
  Namespace extends string,
  Action extends string,
> = {
  type: 'component-call-upload';
  namespace: Namespace;
  componentKey: number;
  requestId: number;
  action: Action;
};

export type BaseClientComponentCallDownload<
  Namespace extends string,
  Action extends string,
> = {
  type: 'component-call-download';
  namespace: Namespace;
  componentKey: number;
  requestId: number;
  action: Action;
};

export type AnyClientComponentMessage = BaseClientComponentMessage<string>;

export type AnyClientComponentCall = BaseClientComponentCall<string, string>;

export type AnyClientComponentCallUpload = BaseClientComponentCallUpload<
  string,
  string
>;

export type AnyClientComponentCallDownload = BaseClientComponentCallDownload<
  string,
  string
>;

export type PingRequestMessage = {
  type: 'ping';
  pingId: number;
};

export type ArcaneJSLogEntryStackFrame = {
  message: string;
  stack: string | null;
  cause: ArcaneJSLogEntryStackFrame | null;
} & Partial<Record<string, JSONValue>>;

export type ArcaneJSLogEntry = {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  stack?: ArcaneJSLogEntryStackFrame;
};

export type ClientLogMessage = {
  type: 'log';
  entry: ArcaneJSLogEntry;
};

export type ClientMessage =
  | AnyClientComponentMessage
  | AnyClientComponentCall
  | AnyClientComponentCallUpload
  | AnyClientComponentCallDownload
  | PingRequestMessage
  | ClientLogMessage;
