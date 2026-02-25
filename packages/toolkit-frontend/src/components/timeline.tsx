import React, { FC, useEffect, useState } from 'react';

import * as proto from '@arcanejs/protocol/core';
import { cn } from '../util';

import { Icon } from './core';

interface Props {
  className?: string;
  info: proto.TimelineComponent;
}

const Timeline: FC<Props> = (props) => {
  const { className, info } = props;

  const frameState = React.useRef<{
    animationFrame: number;
    /** the state that's currenly set */
    state: proto.TimelineState | null;
  }>({
    animationFrame: -1,
    state: null,
  });

  const [currentTimeMillis, setCurrentTimeMillis] = useState<number>(0);

  useEffect(() => {
    frameState.current.state = info.state;
    const recalculateCurrentTimeMillis = () => {
      if (frameState.current.state !== info.state) {
        return;
      }

      if (info.state.state === 'playing') {
        setCurrentTimeMillis(
          (Date.now() - info.state.effectiveStartTime) * info.state.speed,
        );
        frameState.current.animationFrame = window.requestAnimationFrame(
          recalculateCurrentTimeMillis,
        );
      } else {
        setCurrentTimeMillis(info.state.currentTimeMillis);
      }
    };

    recalculateCurrentTimeMillis();

    return () => {
      window.cancelAnimationFrame(frameState.current.animationFrame);
    };
  }, [frameState, info.state]);

  return (
    <div className={cn('grow', className)}>
      <div className={cn('flex')}>
        <div className={cn('grow')}>
          {info.title && (
            <div className={cn('mb-2 text-arcane-title font-bold')}>
              {info.title}
            </div>
          )}
          {info.subtitles?.map((subtitle, k) => (
            <div key={k} className={cn('mb-2 text-arcane-subtitle font-bold')}>
              {subtitle}
            </div>
          ))}
        </div>
        <div className={cn('flex flex-col items-end justify-center')}>
          {info.source?.name}
          <Icon
            className={cn('text-arcane-timeline-indicator')}
            icon={info.state.state === 'playing' ? 'play_arrow' : 'pause'}
          />
        </div>
      </div>
      <div
        className={cn(
          `
            h-arcane-timeline-bar w-full border border-arcane-btn-border
            bg-arcane-btn-border
          `,
        )}
      >
        <div
          className={cn('h-full bg-arcane-hint')}
          style={{
            width: `${Math.min(100, (100 * currentTimeMillis) / info.state.totalTimeMillis)}%`,
          }}
        />
      </div>
    </div>
  );
};

export { Timeline };
