import React, { FC } from 'react';

import * as proto from '@arcanejs/protocol/core';
import { TRANSPARENCY_SVG_URI } from './core';
import { cn } from '../util';

interface Props {
  className?: string;
  info: proto.RectComponent;
}

const Rect: FC<Props> = ({ className, info }) => (
  <div
    className={cn(
      `
        h-arcane-rect min-w-arcane-rect overflow-hidden rounded-arcane-btn
        border border-arcane-btn-border bg-repeat
      `,
      info.grow && 'grow',
      className,
    )}
    style={{
      backgroundImage: `url('${TRANSPARENCY_SVG_URI}')`,
      backgroundSize: '10px',
    }}
  >
    <div className={cn('size-full')} style={{ backgroundColor: info.color }} />
  </div>
);

export { Rect };
