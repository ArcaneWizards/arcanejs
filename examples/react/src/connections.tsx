import { useContext, useState } from 'react';
import { Toolkit } from '@arcanejs/toolkit';
import { ToolkitRenderer, Group, Button } from '@arcanejs/react-toolkit';
import pino from 'pino';
import {
  ConnectionsContext,
  ConnectionsContextProvider,
} from '@arcanejs/react-toolkit/connections';

const toolkit = new Toolkit({
  log: pino({
    level: 'info',
    transport: {
      target: 'pino-pretty',
    },
  }),
  title: '@arcanejs example',
});

toolkit.start({
  mode: 'automatic',
  port: 1339,
});

const ColorPicker = () => {
  const { connections } = useContext(ConnectionsContext);
  const [counts, setCounts] = useState<Record<string, number | undefined>>({});

  return (
    <Group direction="vertical">
      <Button
        onClick={({ uuid }) =>
          setCounts((current) => ({
            ...current,
            [uuid]: (current[uuid] || 0) + 1,
          }))
        }
        text={'Increment'}
      />
      {connections.map(({ uuid, host, isLoopback, connectionFamily }) => (
        <Group key={uuid} title={uuid}>
          {`Button Presses: ${counts[uuid] || 0}`}
          {`Host: ${host} ${isLoopback ? '(loopback)' : ''}`}
          {`Connection Family: ${connectionFamily || 'unknown'}`}
        </Group>
      ))}
    </Group>
  );
};

ToolkitRenderer.render(
  <ConnectionsContextProvider toolkit={toolkit}>
    <ColorPicker />
  </ConnectionsContextProvider>,

  toolkit,
);
