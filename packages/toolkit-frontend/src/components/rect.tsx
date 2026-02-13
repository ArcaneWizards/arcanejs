import React, { FC } from 'react';

import * as proto from '@arcanejs/protocol/core';
import { TRANSPARENCY_SVG_URI } from './core';
import { calculateClass } from '../util';

interface Props {
  className?: string;
  info: proto.RectComponent;
}

const CLS_GROW = 'grow';

const Rect: FC<Props> = ({ className, info }) => (
  <div
    className={calculateClass(
      'arcane-rect',
      className,
      info.grow && `arcane-rect--${CLS_GROW}`,
    )}
    style={{ backgroundImage: `url('${TRANSPARENCY_SVG_URI}')` }}
  >
    <div
      className="arcane-rect__inner"
      style={{ backgroundColor: info.color }}
    />
  </div>
);

export { Rect };
