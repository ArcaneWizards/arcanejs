import {
  CORE_FRONTEND_COMPONENT_RENDERER,
  useNotificationHandler,
} from '@arcanejs/toolkit-frontend';
import { FrontendComponentRenderer } from '@arcanejs/toolkit-frontend/types';
import { startArcaneFrontend } from '@arcanejs/toolkit/frontend';
import {
  NotificationWatcherComponentProto,
  isNotificationComponent,
  NOTIFICATION_NAMESPACE,
  isNotificationDemoNotification,
} from './custom-proto';

const NotificationWatcher: React.FC<{
  info: NotificationWatcherComponentProto;
}> = () => {
  useNotificationHandler(
    isNotificationDemoNotification,
    ({ message }) => {
      alert(`Received notification with message: ${message}`);
    },
    [],
  );

  return null;
};

const CUSTOM_FRONTEND_COMPONENT_RENDERER: FrontendComponentRenderer = {
  namespace: NOTIFICATION_NAMESPACE,
  render: (info): React.ReactElement => {
    if (!isNotificationComponent(info)) {
      throw new Error(`Cannot render non-core component ${info.namespace}`);
    }
    switch (info.component) {
      case 'notification':
        return <NotificationWatcher info={info} />;
    }
  },
};

startArcaneFrontend({
  renderers: [
    CORE_FRONTEND_COMPONENT_RENDERER,
    CUSTOM_FRONTEND_COMPONENT_RENDERER,
  ],
});
