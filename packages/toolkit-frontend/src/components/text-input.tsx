import React, { FC, useEffect } from 'react';

import * as proto from '@arcanejs/protocol/core';
import { cn } from '../util';

import { StageContext } from './context';

interface Props {
  className?: string;
  info: proto.TextInputComponent;
}

const TextInput: FC<Props> = ({ className, info }) => {
  const { sendMessage } = React.useContext(StageContext);
  const ref = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Manually update value of text input if it doesn't match
    if (ref.current && ref.current.value !== info.value) {
      ref.current.value = info.value;
    }
  }, [info.value]);

  return (
    <input
      className={cn(
        `
          relative box-border overflow-hidden rounded-arcane-btn border
          border-arcane-btn-border bg-arcane-bg-dark-1 px-1 py-0.5
          text-arcane-text shadow-arcane-box-inset text-shadow-arcane-btn
        `,
        className,
      )}
      defaultValue={info.value}
      ref={ref}
      onChange={(ev) =>
        sendMessage<proto.CoreComponentMessage>?.({
          type: 'component-message',
          namespace: 'core',
          componentKey: info.key,
          component: 'text-input',
          value: ev.target.value,
        })
      }
    />
  );
};

export { TextInput };
