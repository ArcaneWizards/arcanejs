import React, { FC, TouchEvent, useMemo, useState } from 'react';

import * as proto from '@arcanejs/protocol/core';

import { calculateClass } from '../util';

import { StageContext } from './context';

const CLASS_TOUCHING = 'touching';

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
      className={calculateClass(
        'arcane-switch',
        className,
        touching && CLASS_TOUCHING,
      )}
      onClick={onClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="arcane-touch-indicator" />
      <div className="inner">
        <div className={'slider' + (info.state === 'on' ? ' on' : '')}>
          <div className="on-text">ON</div>
          <div className="off-text">OFF</div>
          <div className="button" />
        </div>
      </div>
    </div>
  );
};

export { Switch };
