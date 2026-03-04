import { AnyComponentProto, BaseComponentProto } from '@arcanejs/protocol';

export const CLOCK_SYNC_NAMESPACE = 'clock-sync';

export type ClockSyncStatusComponentProto = BaseComponentProto<
  typeof CLOCK_SYNC_NAMESPACE,
  'clock-sync-status'
>;

export type ClockSyncComponent = ClockSyncStatusComponentProto;

export const isClockSyncComponent = (
  component: AnyComponentProto,
): component is ClockSyncComponent =>
  component.namespace === CLOCK_SYNC_NAMESPACE;
