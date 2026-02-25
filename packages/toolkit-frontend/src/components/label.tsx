import React, { FC } from 'react';

import * as proto from '@arcanejs/protocol/core';
import { cn } from '../util';

interface Props {
  className?: string;
  info: proto.LabelComponent;
}

const Label: FC<Props> = ({ className, info }) => (
  <div
    className={cn(
      'font-normal whitespace-nowrap',
      info.bold && 'font-bold',
      className,
    )}
  >
    {info.text}
  </div>
);

export { Label };
