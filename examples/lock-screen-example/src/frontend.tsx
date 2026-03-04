import { useContext, useMemo, useState } from 'react';
import {
  CORE_FRONTEND_COMPONENT_RENDERER,
  StageContext,
} from '@arcanejs/toolkit-frontend';
import '@arcanejs/toolkit-frontend/styles/core.css';
import { startArcaneFrontend } from '@arcanejs/toolkit/frontend';
import { FrontendComponentRenderer } from '@arcanejs/toolkit-frontend/types';
import {
  AUTH_NAMESPACE,
  AuthComponentCalls,
  ConnectionLockComponentProto,
  isAuthComponent,
} from './proto';
import './frontend.css';

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
        ? 'lock__status lock__status--ok'
        : 'lock__status lock__status--blocked',
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
    <div className="lock">
      <div className="lock__title">{info.title}</div>
      <div className={statusClassName}>
        {info.state === 'unlocked' ? 'Authorized' : 'Locked'}
      </div>
      <div className="lock__connection">{`Connection UUID: ${connectionUuid}`}</div>
      {info.state === 'locked' ? (
        <div className="lock__panel">
          <p className="lock__copy">{info.lockedMessage}</p>
          <input
            className="lock__input"
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
            className="lock__button"
            type="button"
            disabled={!canSubmit}
            onClick={submitPassword}
          >
            {isSubmitting ? 'Checking...' : 'Unlock'}
          </button>
          {errorMessage && <div className="lock__error">{errorMessage}</div>}
        </div>
      ) : (
        info.child && (
          <div className="lock__child">{renderComponent(info.child)}</div>
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
