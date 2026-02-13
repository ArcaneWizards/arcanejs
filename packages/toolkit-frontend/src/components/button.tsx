import React, { FC } from 'react';

import * as proto from '@arcanejs/protocol/core';

import { calculateClass, usePressable } from '../util';

import { Icon } from './core';
import { StageContext } from './context';

interface Props {
  className?: string;
  info: proto.ButtonComponent;
}

type LocalState =
  | {
      state: 'loading';
    }
  | {
      state: 'error';
      error: string;
    }
  | null;

const Button: FC<Props> = (props) => {
  const { call } = React.useContext(StageContext);
  const [localState, setLocalState] = React.useState<LocalState>(null);
  const state = localState ?? props.info.state;

  const { touching, handlers } = usePressable(async () => {
    try {
      if (!call) return;
      setLocalState({ state: 'loading' });
      await call<'core', proto.CoreComponentCalls, 'press'>?.({
        type: 'component-call',
        namespace: 'core',
        componentKey: props.info.key,
        action: 'press',
      });
      setLocalState(null);
    } catch (e) {
      setLocalState({ state: 'error', error: `${e}` });
    }
  });

  return (
    <div
      className={calculateClass(
        'arcane-button',
        props.className,
        (touching || state.state === 'pressed') && 'is-touching',
        state.state === 'loading' && 'is-loading',
        state.state === 'error' && 'is-error',
      )}
      {...handlers}
      title={state.state === 'error' ? state.error : undefined}
    >
      <div className="arcane-touch-indicator" />
      <div className="arcane-button__contents">
        {props.info.icon && <Icon icon={props.info.icon} />}
        {props.info.text && (
          <span className="arcane-button__label">{props.info.text}</span>
        )}
      </div>
    </div>
  );
};

export { Button };
