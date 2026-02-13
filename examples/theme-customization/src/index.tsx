import path from 'path';
import pino from 'pino';
import { useState } from 'react';
import { Toolkit } from '@arcanejs/toolkit';
import { Base } from '@arcanejs/toolkit/components/base';
import { IDMap } from '@arcanejs/toolkit/util';
import {
  Button,
  Group,
  SliderButton,
  Switch,
  TextInput,
  ToolkitRenderer,
  CoreComponents,
  prepareComponents,
} from '@arcanejs/react-toolkit';
import { ThemeSwitchComponentProto } from './theme-proto';

const toolkit = new Toolkit({
  log: pino({
    level: 'debug',
    transport: {
      target: 'pino-pretty',
    },
  }),
  title: 'Arcane Theme Customization Example',
  entrypointJsFile: path.resolve(__dirname, '../dist/theme-entrypoint.js'),
});

toolkit.start({
  mode: 'automatic',
  port: 1335,
});

class ThemeSwitch extends Base<
  'theme-demo',
  ThemeSwitchComponentProto,
  Record<string, never>
> {
  public constructor() {
    super({});
  }

  public getProtoInfo = (idMap: IDMap): ThemeSwitchComponentProto => {
    return {
      namespace: 'theme-demo',
      component: 'theme-switch',
      key: idMap.getId(this),
    };
  };
}

const CustomComponents = prepareComponents('theme-demo', {
  ThemeSwitch,
});

const App = () => {
  const [inputValue, setInputValue] = useState('Try typing here');
  const [buttonCount, setButtonCount] = useState(0);
  const [switchValue, setSwitchValue] = useState<'on' | 'off'>('off');
  const [sliderValue, setSliderValue] = useState(35);

  return (
    <Group title="Colorful Theme Demo" direction="vertical">
      <CustomComponents.ThemeSwitch />
      <Group direction="vertical" title="Text input">
        {`Current text: ${inputValue}`}
        <TextInput value={inputValue} onChange={setInputValue} />
      </Group>
      <Group direction="vertical" title="Button">
        {`Button presses: ${buttonCount}`}
        <Button
          text="Press me"
          onClick={() => setButtonCount((current) => current + 1)}
        />
      </Group>
      <Group direction="vertical" title="Switch">
        {`Switch state: ${switchValue}`}
        <Switch value={switchValue} onChange={setSwitchValue} />
      </Group>
      <Group direction="vertical" title="SliderButton">
        {`Slider value: ${sliderValue}`}
        <SliderButton
          value={sliderValue}
          onChange={setSliderValue}
          min={0}
          max={100}
          step={1}
        />
      </Group>
    </Group>
  );
};

ToolkitRenderer.render(
  <App />,
  toolkit,
  {},
  {
    componentNamespaces: [CoreComponents, CustomComponents],
  },
);
