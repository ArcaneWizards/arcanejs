import React, { FC, useEffect, useState } from 'react';

import * as proto from '@arcanejs/protocol/core';

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
    <div className={`arcane-timeline ${className ?? ''}`.trim()}>
      <div className="arcane-timeline__data">
        <div className="arcane-timeline__metadata">
          {info.title && (
            <div className="arcane-timeline__title">{info.title}</div>
          )}
          {info.subtitles?.map((subtitle, k) => (
            <div key={k} className="arcane-timeline__subtitle">
              {subtitle}
            </div>
          ))}
        </div>
        <div className="arcane-timeline__source">
          {info.source?.name}
          <Icon
            className="arcane-timeline__indicator"
            icon={info.state.state === 'playing' ? 'play_arrow' : 'pause'}
          />
        </div>
      </div>
      <div className="arcane-timeline__bar">
        <div
          className="arcane-timeline__fill"
          style={{
            width: `${Math.min(100, (100 * currentTimeMillis) / info.state.totalTimeMillis)}%`,
          }}
        />
      </div>
    </div>
  );
};

export { Timeline };
