import React, { FC, TouchEvent, useMemo, useState } from 'react';

import * as proto from '@arcanejs/protocol/core';

import { cn } from '../util';

import { StageContext } from './context';

interface Props {
  className?: string;
  info: proto.SwitchComponent;
}

const Switch: FC<Props> = ({ className, info }) => {
  const { sendMessage } = React.useContext(StageContext);
  const [touching, setTouching] = useState(false);

  const onClick = useMemo(
    () => () => {
      sendMessage<proto.CoreComponentMessage>?.({
        type: 'component-message',
        namespace: 'core',
        componentKey: info.key,
        component: 'switch',
      });
    },
    [sendMessage, info.key],
  );

  const onTouchStart = useMemo(
    () => (event: TouchEvent<HTMLDivElement>) => {
      event.preventDefault();
      setTouching(true);
    },
    [],
  );

  const onTouchEnd = useMemo(
    () => (event: TouchEvent<HTMLDivElement>) => {
      event.preventDefault();
      setTouching(false);
      onClick();
    },
    [],
  );

  return (
    <div
      className={cn('relative', className)}
      onClick={onClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className={cn(
          `
            pointer-events-none absolute -inset-arcane-touch-indicator
            rounded-arcane-touch-indicator border-2 border-transparent
            bg-transparent transition-colors duration-300
          `,
          touching && 'border-arcane-hint bg-arcane-hint-soft duration-0',
        )}
      />
      <div
        className={cn(
          `
            relative block h-arcane-switch-knob w-arcane-switch-track
            min-w-arcane-switch-track overflow-hidden rounded-arcane-btn border
            border-arcane-btn-border
          `,
        )}
      >
        <div
          className={cn(
            `absolute top-0 left-0 cursor-pointer transition-all duration-300`,
            info.state === 'on' && 'left-arcane-switch-label',
          )}
        >
          <div
            className={cn(
              `
                absolute top-0 -left-arcane-switch-label h-arcane-switch-knob
                w-arcane-switch-label bg-arcane-grad-hint-pressed text-center
                leading-arcane-switch-label shadow-arcane-btn-active
                text-shadow-arcane-btn-active
              `,
            )}
          >
            ON
          </div>
          <div
            className={cn(
              `
                absolute top-0 left-arcane-switch-off-left h-arcane-switch-knob
                w-arcane-switch-label bg-arcane-grad-btn-active text-center
                leading-arcane-switch-label shadow-arcane-btn-active
                text-shadow-arcane-btn-active
              `,
            )}
          >
            OFF
          </div>
          <div
            className={cn(
              `
                absolute -top-px -left-px size-arcane-btn rounded-arcane-btn
                border border-arcane-btn-border bg-arcane-grad-btn
                shadow-arcane-btn text-shadow-arcane-btn
                hover:bg-arcane-grad-btn-hover
              `,
            )}
          />
        </div>
      </div>
    </div>
  );
};

export { Switch };
