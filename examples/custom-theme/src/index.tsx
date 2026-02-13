import path from 'path';
import pino from 'pino';
import { useState } from 'react';
import { Toolkit } from '@arcanejs/toolkit';
import {
  Button,
  Group,
  GroupHeader,
  Switch,
  ToolkitRenderer,
} from '@arcanejs/react-toolkit';

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
  port: 1340,
});

const App = () => {
  const [mode, setMode] = useState<'off' | 'on'>('off');
  const [colorIndex, setColorIndex] = useState(0);

  const colorNames = ['Pink', 'Cyan', 'Lime', 'Gold'];

  return (
    <Group title="Colourful Theme Playground">
      <GroupHeader>
        <Button
          text="Rotate Accent"
          onClick={() =>
            setColorIndex((value) => (value + 1) % colorNames.length)
          }
        />
        <Button
          text="Toggle Mode"
          onClick={() => setMode((value) => (value === 'off' ? 'on' : 'off'))}
        />
      </GroupHeader>
      {`Mode: ${mode}`}
      <Switch value={mode} onChange={setMode} />
      {`Active Accent: ${colorNames[colorIndex]}`}
    </Group>
  );
};

ToolkitRenderer.render(<App />, toolkit);
