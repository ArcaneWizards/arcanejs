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
        `
          relative box-border flex h-arcane-btn cursor-pointer items-center
          justify-center overflow-visible rounded-arcane-btn border
          border-arcane-btn-border bg-arcane-grad-btn text-arcane-btn-text
          shadow-arcane-btn transition-all duration-200 outline-none
          text-shadow-arcane-btn
          hover:bg-arcane-grad-btn-hover
          active:bg-arcane-grad-btn-active active:shadow-arcane-btn-active
          active:duration-50 active:text-shadow-arcane-btn-active
        `,
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
          `
            pointer-events-none absolute -inset-1.5 rounded-md border-2
            border-transparent bg-transparent transition-colors duration-300
          `,
          (touching || state.state === 'loading') &&
            'border-arcane-hint bg-arcane-hint-soft duration-0',
        )}
      />
      <div className={cn('flex items-center justify-center px-0.5')}>
        {props.info.icon && <Icon icon={props.info.icon} />}
        {props.info.text && (
          <span className={cn('px-1')}>{props.info.text}</span>
        )}
      </div>
    </div>
  );
};

export { Button };
