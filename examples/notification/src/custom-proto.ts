import {
  BaseComponentProto,
  AnyComponentProto,
  BaseNotificationMessage,
} from '@arcanejs/protocol';

export const NOTIFICATION_NAMESPACE = 'notification';

export type NotificationWatcherComponentProto = BaseComponentProto<
  typeof NOTIFICATION_NAMESPACE,
  'notification'
>;

export type NotificationComponent = NotificationWatcherComponentProto;

export const isNotificationComponent = (
  component: AnyComponentProto,
): component is NotificationComponent =>
  component.namespace === NOTIFICATION_NAMESPACE;

export type NotificationDemoNotification = BaseNotificationMessage<
  typeof NOTIFICATION_NAMESPACE,
  'demo-notification'
> & {
  message: string;
};

export const isNotificationDemoNotification = (
  notification: BaseNotificationMessage<string, string>,
): notification is NotificationDemoNotification =>
  notification.namespace === NOTIFICATION_NAMESPACE;
