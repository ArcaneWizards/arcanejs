import pino from 'pino';
import * as React from 'react';
import {
  Toolkit,
  ToolkitServerListener,
  ToolkitServerListenerOptions,
} from '@arcanejs/toolkit';

import {
  ToolkitRenderer,
  Group,
  Button,
  TextInput,
  GroupHeader,
} from '@arcanejs/react-toolkit';

const toolkit = new Toolkit({
  log: pino({
    level: 'info',
    transport: {
      target: 'pino-pretty',
    },
  }),
  title: '@arcanejs dynamic-connections example',
});

type ListenerConfig = Record<string, ToolkitServerListenerOptions>;

type ListenerState = Record<
  string,
  | {
      state: 'connecting';
      opts: ToolkitServerListenerOptions;
    }
  | {
      state: 'error';
      error: string;
      opts: ToolkitServerListenerOptions;
    }
  | {
      state: 'connected';
      listener: ToolkitServerListener;
      opts: ToolkitServerListenerOptions;
    }
>;

const App = () => {
  // Current Connections
  const [config, setConfig] = React.useState<ListenerConfig>({
    default: { port: 1332 },
  });

  const listenerState = React.useRef<ListenerState>({});

  const [state, setState] = React.useState(listenerState.current);

  const updateReactState = React.useCallback(() => {
    setState({ ...listenerState.current });
  }, []);

  React.useEffect(() => {
    Object.entries(config).forEach(([key, opts]) => {
      if (!listenerState.current[key]) {
        // New Connection
        listenerState.current[key] = { state: 'connecting', opts };
        toolkit
          .listen(opts)
          .then((listener) => {
            if (!listenerState.current[key]) {
              // It was removed before it connected
              listener.close();
            } else {
              listenerState.current[key] = {
                state: 'connected',
                opts,
                listener,
              };
            }
            updateReactState();
            console.log(`Listener ${key} started on port ${opts.port}`);
          })
          .catch((err) => {
            listenerState.current[key] = {
              state: 'error',
              opts,
              error: `${err}`,
            };
            updateReactState();
            console.error(
              `Failed to start listener ${key} on port ${opts.port}:`,
              err,
            );
          });
      }
    });
    Object.entries(listenerState.current).forEach(([key, state]) => {
      if (!config[key]) {
        // Removed Connection
        if (state.state === 'connected') {
          state.listener.close();
        }
        // Remove it from the state
        delete listenerState.current[key];
      }
    });
    updateReactState();
  }, [config]);

  const nextId = React.useRef(0);

  const [nextListenerPort, setNextListenerPort] = React.useState(1333);
  const [nextListenerHost, setNextListenerHost] = React.useState('');

  const addConnection = () => {
    const id = nextId.current++;
    setConfig({
      ...config,
      [`conn-${id}`]: {
        port: nextListenerPort,
        host: nextListenerHost || undefined,
      },
    });
  };

  return (
    <Group direction="vertical">
      <Group>
        <TextInput
          value={`${nextListenerPort}`}
          onChange={(value) => setNextListenerPort(Number(value))}
        />
        <TextInput
          value={nextListenerHost}
          onChange={(value) => setNextListenerHost(value)}
        />
        <Button key="add" text="Add Listener" onClick={addConnection} />
      </Group>
      <Group direction="vertical">
        {Object.entries(state).map(([key, state]) => (
          <Group
            key={key}
            title={`${key} - ${state.opts.host ?? '*'}:${state.opts.port}`}
          >
            <GroupHeader>
              <Button
                text="Remove"
                onClick={() => {
                  const newConfig = { ...config };
                  delete newConfig[key];
                  setConfig(newConfig);
                }}
              />
            </GroupHeader>
            {state.state === 'connecting' && ' Connecting...'}
            {state.state === 'error' && `Error: ${state.error}`}
            {state.state === 'connected' && 'Connected'}
          </Group>
        ))}
      </Group>
    </Group>
  );
};

ToolkitRenderer.render(<App />, toolkit);
