import React, { FC } from 'react';

import * as proto from '@arcanejs/protocol/core';

import { cn, usePressable } from '../util';

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
      className={cn(
        'arcane-button',
        'relative box-border cursor-pointer border outline-none',
        'rounded-arcane-btn border-arcane-btn-border h-arcane-btn',
        'overflow-visible transition-all duration-200',
        'flex items-center justify-center text-arcane-btn-text bg-arcane-grad-btn hover:bg-arcane-grad-btn-hover',
        'text-shadow-arcane-btn shadow-arcane-btn',
        'active:bg-arcane-grad-btn-active active:text-shadow-arcane-btn-active active:shadow-arcane-btn-active',
        'active:duration-50',
        (touching || state.state === 'pressed' || state.state === 'loading') &&
          'bg-arcane-grad-btn-active',
        (touching || state.state === 'pressed' || state.state === 'loading') &&
          'text-shadow-arcane-btn-active',
        (touching || state.state === 'pressed' || state.state === 'loading') &&
          'shadow-arcane-btn-active',
        (touching || state.state === 'pressed' || state.state === 'loading') &&
          'duration-50',
        state.state === 'error' && 'border-arcane-btn-err text-arcane-btn-err',
        props.className,
      )}
      {...handlers}
      title={state.state === 'error' ? state.error : undefined}
    >
      <div
        className={cn(
          'pointer-events-none absolute -inset-1.5 rounded-md border-2 border-transparent bg-transparent transition-colors duration-300',
          (touching || state.state === 'loading') &&
            'border-arcane-hint bg-arcane-hint-soft duration-0',
        )}
      />
      <div className="flex items-center justify-center px-1 py-1.5">
        {props.info.icon && <Icon icon={props.info.icon} />}
        {props.info.text && <span className="px-1">{props.info.text}</span>}
      </div>
    </div>
  );
};

export { Button };
