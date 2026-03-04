import { useContext, useMemo, useState } from 'react';
import {
  CORE_FRONTEND_COMPONENT_RENDERER,
  StageContext,
} from '@arcanejs/toolkit-frontend';
import { startArcaneFrontend } from '@arcanejs/toolkit/frontend';
import { FrontendComponentRenderer } from '@arcanejs/toolkit-frontend/types';
import {
  AUTH_NAMESPACE,
  AuthComponentCalls,
  ConnectionLockComponentProto,
  isAuthComponent,
} from './proto';

const ConnectionLock: React.FC<{ info: ConnectionLockComponentProto }> = ({
  info,
}) => {
  const { call, connectionUuid, renderComponent } = useContext(StageContext);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const canSubmit = password.length > 0 && !isSubmitting;

  const statusClassName = useMemo(
    () =>
      info.state === 'unlocked'
        ? 'w-fit rounded-full border border-lock-ok bg-arcane-bg-dark-1 px-lock-status-x py-lock-status-y text-lock-status font-semibold text-lock-ok'
        : 'w-fit rounded-full border border-lock-blocked bg-arcane-bg-dark-1 px-lock-status-x py-lock-status-y text-lock-status font-semibold text-lock-blocked',
    [info.state],
  );

  const submitPassword = async () => {
    if (!call || !canSubmit) return;
    setIsSubmitting(true);
    try {
      const result = await call<
        typeof AUTH_NAMESPACE,
        AuthComponentCalls,
        'unlock'
      >({
        type: 'component-call',
        namespace: AUTH_NAMESPACE,
        componentKey: info.key,
        action: 'unlock',
        password,
      });
      if (result.success) {
        setErrorMessage(null);
        setPassword('');
      } else {
        setErrorMessage(result.errorMessage ?? 'Authentication failed.');
      }
    } catch (error) {
      setErrorMessage(`${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 rounded-lock-card border border-arcane-border-light bg-arcane-bg p-arcane shadow-arcane-box-inset">
      <div className="text-arcane-normal font-semibold text-arcane-text">
        {info.title}
      </div>
      <div className={statusClassName}>
        {info.state === 'unlocked' ? 'Authorized' : 'Locked'}
      </div>
      <div className="font-mono text-lock-status text-arcane-text-muted">{`Connection UUID: ${connectionUuid}`}</div>
      {info.state === 'locked' ? (
        <div className="flex flex-col gap-1">
          <p className="m-0 text-arcane-text">{info.lockedMessage}</p>
          <input
            className="rounded-lock-input border border-arcane-border-light bg-arcane-bg-light-1 px-1 py-1 text-arcane-text"
            type="password"
            value={password}
            placeholder="Password"
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                submitPassword();
              }
            }}
          />
          <button
            className="relative box-border flex h-arcane-btn w-fit cursor-pointer items-center justify-center overflow-visible rounded-arcane-btn border border-arcane-btn-border bg-arcane-grad-btn px-arcane text-arcane-btn-text shadow-arcane-btn text-shadow-arcane-btn transition-all duration-200 outline-none hover:bg-arcane-grad-btn-hover active:bg-arcane-grad-btn-active active:duration-50 active:shadow-arcane-btn-active active:text-shadow-arcane-btn-active disabled:cursor-not-allowed disabled:opacity-[0.55]"
            type="button"
            disabled={!canSubmit}
            onClick={submitPassword}
          >
            {isSubmitting ? 'Checking...' : 'Unlock'}
          </button>
          {errorMessage && (
            <div className="text-lock-blocked">{errorMessage}</div>
          )}
        </div>
      ) : (
        info.child && (
          <div className="rounded-lock-card border border-arcane-border-light bg-arcane-bg-dark-1 p-1">
            {renderComponent(info.child)}
          </div>
        )
      )}
    </div>
  );
};

const AUTH_FRONTEND_COMPONENT_RENDERER: FrontendComponentRenderer = {
  namespace: AUTH_NAMESPACE,
  render: (info): React.ReactElement => {
    if (!isAuthComponent(info)) {
      throw new Error(`Cannot render non-auth component ${info.namespace}`);
    }
    switch (info.component) {
      case 'connection-lock':
        return <ConnectionLock info={info} />;
    }
  },
};

startArcaneFrontend({
  renderers: [
    CORE_FRONTEND_COMPONENT_RENDERER,
    AUTH_FRONTEND_COMPONENT_RENDERER,
  ],
});
