import React, { FC } from 'react';

import * as proto from '@arcanejs/protocol/core';
import { calculateClass } from '../util';

interface Props {
  className?: string;
  info: proto.LabelComponent;
}

const Label: FC<Props> = ({ className, info }) => (
  <div
    className={calculateClass(
      'arcane-label',
      className,
      info.bold && 'arcane-label--bold',
    )}
  >
    {info.text}
  </div>
);

export { Label };
