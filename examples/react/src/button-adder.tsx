import pino from 'pino';
import * as React from 'react';
import { Toolkit } from '@arcanejs/toolkit';

import {
  ToolkitRenderer,
  Group,
  SliderButton,
  GroupHeader,
  Button,
} from '@arcanejs/react-toolkit';

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
  port: 1332,
});

const App = () => {
  const [count, setCount] = React.useState(2);
  const [val, setVal] = React.useState(0);

  const buttons: React.ReactElement[] = [];

  for (let i = 0; i < count; i++) {
    buttons.push(<SliderButton key={i} value={val} onChange={setVal} />);
  }

  return (
    <Group>
      <GroupHeader>
        <Button key="add" text="add" onClick={() => setCount(count + 1)} />
        <Button
          key="remove"
          text="remove"
          onClick={() => setCount(Math.max(0, count - 1))}
        />
        <Button text="max" onClick={() => setVal(255)} />
        <Button text="min" onClick={() => setVal(0)} />
      </GroupHeader>
      <>{buttons}</>
    </Group>
  );
};

ToolkitRenderer.render(<App />, toolkit);
