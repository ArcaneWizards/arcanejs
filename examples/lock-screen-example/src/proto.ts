import {
  AnyComponentProto,
  BaseClientComponentCall,
  BaseComponentProto,
} from '@arcanejs/protocol';

export const AUTH_NAMESPACE = 'auth';

export type ConnectionLockComponentProto = BaseComponentProto<
  typeof AUTH_NAMESPACE,
  'connection-lock'
> & {
  state: 'locked' | 'unlocked';
  title: string;
  lockedMessage: string;
  child: AnyComponentProto | null;
};

export type AuthComponent = ConnectionLockComponentProto;

export const isAuthComponent = (
  component: AnyComponentProto,
): component is AuthComponent => component.namespace === AUTH_NAMESPACE;

export type UnlockComponentCall = BaseClientComponentCall<
  typeof AUTH_NAMESPACE,
  'unlock'
> & {
  password: string;
};

export interface AuthComponentCalls {
  unlock: {
    call: UnlockComponentCall;
    return: {
      success: boolean;
      errorMessage?: string;
    };
  };
}

export const isAuthComponentCall = <A extends keyof AuthComponentCalls>(
  call: BaseClientComponentCall<string, string>,
  action: A,
): call is AuthComponentCalls[A]['call'] =>
  call.namespace === AUTH_NAMESPACE && call.action === action;
