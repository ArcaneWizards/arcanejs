import path from 'path';
import pino from 'pino';
import { useContext } from 'react';
import { Toolkit } from '@arcanejs/toolkit';

import {
  CoreComponents,
  Button,
  Group,
  ToolkitRenderer,
  prepareComponents,
} from '@arcanejs/react-toolkit';
import { Base } from '@arcanejs/toolkit/components/base';
import { IDMap } from '@arcanejs/toolkit/util';
import {
  NOTIFICATION_NAMESPACE,
  NotificationDemoNotification,
  NotificationWatcherComponentProto,
} from './custom-proto';
import {
  ConnectionsContext,
  ConnectionsContextProvider,
  useNotificationSender,
} from '@arcanejs/react-toolkit/connections';

const toolkit = new Toolkit({
  log: pino({
    level: 'debug',
    transport: {
      target: 'pino-pretty',
    },
  }),
  entrypointJsFile: path.resolve(__dirname, '../dist/custom-entrypoint.js'),
});

toolkit.start({
  mode: 'automatic',
  port: 1330,
});

class NotificationWatcher extends Base<
  typeof NOTIFICATION_NAMESPACE,
  NotificationWatcherComponentProto,
  Record<string, never>
> {
  public getProtoInfo(idMap: IDMap): NotificationWatcherComponentProto {
    return {
      namespace: NOTIFICATION_NAMESPACE,
      component: 'notification',
      key: idMap.getId(this),
    };
  }
}

const C = prepareComponents(NOTIFICATION_NAMESPACE, {
  NotificationWatcher,
});

const App = () => {
  const { connections } = useContext(ConnectionsContext);
  const sendNotification = useNotificationSender<NotificationDemoNotification>(
    NOTIFICATION_NAMESPACE,
    'demo-notification',
  );

  return (
    <Group title="Click the button to trigger a notification">
      <C.NotificationWatcher />

      <Button
        text="Send notification to all connections"
        onClick={() => sendNotification({ message: 'Hello, world!' })}
      />
      {connections.map(({ uuid }) => (
        <Button
          key={uuid}
          text={`Send notification to ${uuid}`}
          onClick={() =>
            sendNotification(
              { message: 'Hello, world!' },
              (connection) => connection.uuid === uuid,
            )
          }
        />
      ))}
    </Group>
  );
};

ToolkitRenderer.render(
  <ConnectionsContextProvider toolkit={toolkit}>
    <App />
  </ConnectionsContextProvider>,
  toolkit,
  {},
  {
    componentNamespaces: [CoreComponents, C],
  },
);
