import path from 'path';
import pino from 'pino';
import { useState } from 'react';
import type { TimelineState } from '@arcanejs/protocol/core';
import { Toolkit, type ToolkitRenderContext } from '@arcanejs/toolkit';
import { Base } from '@arcanejs/toolkit/components/base';
import { IDMap } from '@arcanejs/toolkit/util';
import {
  Button,
  CoreComponents,
  Group,
  Label,
  Timeline,
  ToolkitRenderer,
  prepareComponents,
} from '@arcanejs/react-toolkit';
import { CLOCK_SYNC_NAMESPACE, ClockSyncStatusComponentProto } from './proto';

const toolkit = new Toolkit({
  log: pino({
    level: 'debug',
    transport: {
      target: 'pino-pretty',
    },
  }),
  title: '@arcanejs clock sync status example',
  entrypointJsFile: path.resolve(__dirname, '../dist/clock-sync-entrypoint.js'),
  clockSync: {
    pingIntervalMs: 2000,
  },
});

toolkit.start({
  mode: 'automatic',
  port: 1335,
});

class ClockSyncStatus extends Base<
  typeof CLOCK_SYNC_NAMESPACE,
  ClockSyncStatusComponentProto,
  Record<string, never>
> {
  public constructor() {
    super({});
  }

  public getProtoInfo = (
    idMap: IDMap,
    _context: ToolkitRenderContext,
  ): ClockSyncStatusComponentProto => ({
    namespace: CLOCK_SYNC_NAMESPACE,
    component: 'clock-sync-status',
    key: idMap.getId(this),
  });
}

const C = prepareComponents(CLOCK_SYNC_NAMESPACE, {
  ClockSyncStatus,
});

const App = () => {
  const timelineTotalTimeMillis = 60 * 1000; // 1 minute
  const [timelineState, setTimelineState] = useState<TimelineState>({
    state: 'stopped',
    totalTimeMillis: timelineTotalTimeMillis,
    currentTimeMillis: 0,
  });

  const startTimeline = () => {
    setTimelineState((current) => {
      if (current.state === 'playing') {
        return current;
      }
      return {
        state: 'playing',
        totalTimeMillis: current.totalTimeMillis,
        effectiveStartTime: Date.now() - current.currentTimeMillis,
        speed: 1,
      };
    });
  };

  const resetTimeline = () => {
    setTimelineState((current) => ({
      state: 'stopped',
      totalTimeMillis: current.totalTimeMillis,
      currentTimeMillis: 0,
    }));
  };

  return (
    <Group title="Clock Sync Status" direction="vertical">
      <Label text="This custom component reads StageContext clock sync values." />
      <Label text="Timeline should remain stable even when browser clock differs significantly from server clock." />
      <C.ClockSyncStatus />
      <Group>
        <Button
          text="Start Timeline"
          icon="play_arrow"
          onClick={startTimeline}
        />
        <Button text="Reset Timeline" icon="replay" onClick={resetTimeline} />
      </Group>
      <Timeline
        title="Clock Sync Timeline Demo"
        subtitles={[
          'Simulate a large clock skew by changing browser/client system time.',
          'Playback should stay accurate once ping sync converges.',
        ]}
        source={{ name: 'Server Clock' }}
        state={timelineState}
      />
    </Group>
  );
};

ToolkitRenderer.render(
  <App />,
  toolkit,
  {},
  { componentNamespaces: [CoreComponents, C] },
);
