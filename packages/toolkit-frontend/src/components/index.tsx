import { isCoreComponent } from '@arcanejs/protocol/core';

export * as code from './core';

import { Button } from './button';
import {
  StageContext,
  StageContextData,
  StageConnectionState,
} from './context';
import { Group, GroupStateWrapper } from './group';
import { Label } from './label';
import { NestedContent } from './nesting';
import { Rect } from './rect';
import { SliderButton } from './slider-button';
import { Switch } from './switch';
import { Tabs } from './tabs';
import { TextInput } from './text-input';
import { Timeline } from './timeline';
import { FrontendComponentRenderer } from '../types';

export {
  Button,
  StageContext,
  Group,
  GroupStateWrapper,
  Label,
  NestedContent,
  Rect,
  SliderButton,
  Switch,
  Tabs,
  TextInput,
  Timeline,
};

export type { StageContextData, StageConnectionState };

export const CORE_FRONTEND_COMPONENT_RENDERER: FrontendComponentRenderer = {
  namespace: 'core',
  render: (info): JSX.Element => {
    if (!isCoreComponent(info)) {
      throw new Error(`Cannot render non-core component ${info.namespace}`);
    }
    switch (info.component) {
      case 'button':
        return <Button key={info.key} info={info} />;
      case 'group':
        return <Group key={info.key} info={info} />;
      case 'label':
        return <Label key={info.key} info={info} />;
      case 'rect':
        return <Rect key={info.key} info={info} />;
      case 'slider_button':
        return <SliderButton key={info.key} info={info} />;
      case 'switch':
        return <Switch key={info.key} info={info} />;
      case 'tabs':
        return <Tabs key={info.key} info={info} />;
      case 'text-input':
        return <TextInput key={info.key} info={info} />;
      case 'timeline':
        return <Timeline key={info.key} info={info} />;
      // Parent-Specific Components
      case 'group-header':
      case 'tab':
        throw new Error(
          `Cannot render ${info.component} outside of expected parents`,
        );
    }
  },
};
