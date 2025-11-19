/* The types in this file are for the core components of @arcanejs
 */

import {
  BaseClientComponentMessage,
  BaseComponentProto,
  AnyComponentProto,
  BaseClientComponentCall,
} from '@arcanejs/protocol';

export const CUSTOM_NAMESPACE = 'custom';

export type StopwatchComponentProto = BaseComponentProto<
  typeof CUSTOM_NAMESPACE,
  'stopwatch'
> & {
  state:
    | { type: 'stopped'; timeMillis: number }
    | { type: 'started'; startedAt: number };
  child: AnyComponentProto | null;
};

export type CustomComponent = StopwatchComponentProto;

export const isCustomComponent = (
  component: AnyComponentProto,
): component is CustomComponent => component.namespace === CUSTOM_NAMESPACE;

export type StopwatchPressMessage = BaseClientComponentMessage<
  typeof CUSTOM_NAMESPACE
> & {
  component: 'stopwatch';
  button: 'start-stop';
};

export type StopwatchGetTime = BaseClientComponentCall<
  typeof CUSTOM_NAMESPACE,
  'request-time'
>;

export interface CustomComponentCalls {
  'request-time': {
    call: StopwatchGetTime;
    return: string;
  };
}

export type CustomComponentMessage = StopwatchPressMessage;

export const isCustomComponentMessage = <
  C extends CustomComponentMessage['component'],
>(
  message: BaseClientComponentMessage<string>,
  component: C,
): message is CustomComponentMessage & { component: C } =>
  message.namespace === 'custom' &&
  (message as CustomComponentMessage).component === component;

export const isCustomComponentCall = <A extends keyof CustomComponentCalls>(
  call: BaseClientComponentCall<string, string>,
  action: A,
): call is CustomComponentCalls[A]['call'] =>
  call.namespace === 'custom' && call.action === action;
