import { useContext } from 'react';
import {
  CORE_FRONTEND_COMPONENT_RENDERER,
  StageContext,
} from '@arcanejs/toolkit-frontend';
import { startArcaneFrontend } from '@arcanejs/toolkit/frontend';
import { FrontendComponentRenderer } from '@arcanejs/toolkit-frontend/types';
import {
  CLOCK_SYNC_NAMESPACE,
  ClockSyncStatusComponentProto,
  isClockSyncComponent,
} from './proto';

const formatMilliseconds = (value: number | null): string =>
  value === null ? 'n/a' : `${value.toFixed(2)} ms`;

const formatTimeDifference = (value: number | null): string => {
  if (value === null) {
    return 'n/a';
  }
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)} ms`;
};

const ClockSyncStatus: React.FC<{ info: ClockSyncStatusComponentProto }> = ({
  info: _info,
}) => {
  const { connectionUuid, lastPingMs, timeDifferenceMs } =
    useContext(StageContext);

  return (
    <div className="flex flex-col gap-1 rounded-[calc(var(--arcane-spacing)*0.4)] border border-arcane-border-light bg-arcane-bg p-arcane shadow-arcane-box-inset">
      <div className="text-[1rem] font-semibold text-arcane-text-active">
        Server Time Sync
      </div>
      <div className="text-[0.9rem] text-arcane-text-muted">
        Enable toolkit.clockSync to activate periodic ping sampling.
      </div>
      <div className="flex flex-col gap-[calc(var(--arcane-spacing)/3)] font-mono text-[0.88rem] text-arcane-text-normal">
        <div>
          <strong>Connection:</strong> {connectionUuid ?? 'not connected'}
        </div>
        <div>
          <strong>Last ping:</strong> {formatMilliseconds(lastPingMs)}
        </div>
        <div>
          <strong>Server time difference:</strong>{' '}
          {formatTimeDifference(timeDifferenceMs)}
        </div>
      </div>
    </div>
  );
};

const CLOCK_SYNC_FRONTEND_COMPONENT_RENDERER: FrontendComponentRenderer = {
  namespace: CLOCK_SYNC_NAMESPACE,
  render: (info): React.ReactElement => {
    if (!isClockSyncComponent(info)) {
      throw new Error(
        `Cannot render non-clock-sync component ${info.namespace}`,
      );
    }
    switch (info.component) {
      case 'clock-sync-status':
        return <ClockSyncStatus info={info} />;
    }
  },
};

startArcaneFrontend({
  renderers: [
    CORE_FRONTEND_COMPONENT_RENDERER,
    CLOCK_SYNC_FRONTEND_COMPONENT_RENDERER,
  ],
});
