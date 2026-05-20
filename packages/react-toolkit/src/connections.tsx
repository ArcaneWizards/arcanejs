import { BaseNotificationMessage } from '@arcanejs/protocol';
import type { Toolkit, ToolkitConnection } from '@arcanejs/toolkit';
import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

type ConnectionsContextData = {
  connections: ToolkitConnection[];
  sendNotification: <T extends BaseNotificationMessage<string, string>>(
    notification: T,
    filter?: (connection: ToolkitConnection) => boolean,
  ) => void;
};

export const ConnectionsContext = createContext<ConnectionsContextData>(
  new Proxy({} as ConnectionsContextData, {
    get: () => {
      throw new Error(
        'Can\t use ConnectionsContext without ConnectionsContextProvider',
      );
    },
  }),
);

type ConnectionsContextProviderProps = {
  toolkit: Toolkit;
  children: ReactNode;
};

export const ConnectionsContextProvider: FC<
  ConnectionsContextProviderProps
> = ({ toolkit, children }) => {
  const [connections, setConnections] = useState<ToolkitConnection[]>([]);

  useEffect(() => {
    const onNewConnection = (connection: ToolkitConnection) => {
      setConnections((current) => [...current, connection]);
    };

    const onClosedConnection = (connection: ToolkitConnection) => {
      setConnections((current) => current.filter((c) => c !== connection));
    };

    toolkit.addListener('new-connection', onNewConnection);
    toolkit.addListener('closed-connection', onClosedConnection);

    setConnections(toolkit.getConnections());

    return () => {
      toolkit.removeListener('new-connection', onNewConnection);
      toolkit.removeListener('closed-connection', onClosedConnection);
    };
  }, [toolkit]);

  const sendNotification = toolkit.sendNotification.bind(toolkit);

  return (
    <ConnectionsContext.Provider value={{ connections, sendNotification }}>
      {children}
    </ConnectionsContext.Provider>
  );
};

export const useNotificationSender = <
  T extends BaseNotificationMessage<string, string>,
>(
  namespace: T['namespace'],
  notification: T['notification'],
): ((
  notification: Omit<T, 'type' | 'namespace' | 'notification'>,
  filter?: (connection: ToolkitConnection) => boolean,
) => void) => {
  const { sendNotification } = useContext(ConnectionsContext);

  return useCallback(
    (notificationData, filter) => {
      sendNotification(
        {
          type: 'notification',
          namespace,
          notification,
          ...notificationData,
        },
        filter,
      );
    },
    [namespace, notification, sendNotification],
  );
};
