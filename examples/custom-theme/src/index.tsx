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
  const [lightsArmed, setLightsArmed] = useState<'off' | 'on'>('off');
  const [coolingArmed, setCoolingArmed] = useState<'off' | 'on'>('off');

  return (
    <Group title="Static Theme Showcase">
      <GroupHeader>
        <Button text="Start Cue" onClick={() => undefined} />
        <Button text="Stop Cue" onClick={() => undefined} />
      </GroupHeader>

      {
        'These controls are intentionally unrelated to theme customization. Theme colors come from src/frontend.tsx.'
      }

      {`Lights Armed: ${lightsArmed}`}
      <Switch value={lightsArmed} onChange={setLightsArmed} />

      {`Cooling Armed: ${coolingArmed}`}
      <Switch value={coolingArmed} onChange={setCoolingArmed} />

      <Button text="Record Snapshot" onClick={() => undefined} />
    </Group>
  );
};

ToolkitRenderer.render(<App />, toolkit);
