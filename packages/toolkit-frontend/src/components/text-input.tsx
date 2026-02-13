import React, { FC, useEffect } from 'react';

import * as proto from '@arcanejs/protocol/core';

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
      className={`arcane-text-input ${className ?? ''}`.trim()}
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
