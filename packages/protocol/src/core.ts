/* The types in this file are for the core components of @arcanejs
 */

import {
  BaseClientComponentMessage,
  BaseComponentProto,
  AnyComponentProto,
  BaseClientComponentCall,
} from '.';
import { GroupComponentStyle } from './styles';

export type CoreNamespace = 'core';

export type Gradient = Array<{
  /**
   * CSS color value
   */
  color: string;
  /**
   * Position of the color in the gradient, between 0 and 1
   */
  position: number;
}>;

export type ButtonComponent = BaseComponentProto<CoreNamespace, 'button'> & {
  text: string;
  icon?: string;
  state:
    | {
        state: 'normal' | 'pressed';
      }
    | {
        state: 'error';
        error: string;
      };
};

export type GroupCollapsedState = 'open' | 'closed';

export type DefaultGroupCollapsedState = GroupCollapsedState | 'auto';

export type GroupHeaderComponent = BaseComponentProto<
  CoreNamespace,
  'group-header'
> & {
  children: AnyComponentProto[];
};

export type GroupComponent = BaseComponentProto<CoreNamespace, 'group'> &
  GroupComponentStyle & {
    title?: string;
    children: AnyComponentProto[];
    headers?: GroupHeaderComponent[];
    labels?: Array<{
      text: string;
    }>;
    editableTitle: boolean;
    /**
     * If set, allows the group to be collapsed,
     * by default set to the given state
     */
    defaultCollapsibleState?: DefaultGroupCollapsedState;
  };

export type LabelComponent = BaseComponentProto<CoreNamespace, 'label'> & {
  bold?: boolean;
  text: string;
};

export type RectComponent = BaseComponentProto<CoreNamespace, 'rect'> & {
  color: string;
  /**
   * Set to true if the component should increase its size to fill the available space.
   */
  grow?: boolean;
};

export type SliderButtonComponent = BaseComponentProto<
  CoreNamespace,
  'slider_button'
> & {
  min: number;
  max: number;
  step: number;
  value: number | null;
  gradient?: Gradient;
  /**
   * Set to true if the component should increase its size to fill the available space.
   */
  grow?: boolean;
};

export type SwitchComponent = BaseComponentProto<CoreNamespace, 'switch'> & {
  state: 'on' | 'off';
};

export type TabComponent = BaseComponentProto<CoreNamespace, 'tab'> & {
  name: string;
  child?: AnyComponentProto;
};

export type TabsComponent = BaseComponentProto<CoreNamespace, 'tabs'> & {
  tabs: TabComponent[];
};

export type TextInputComponent = BaseComponentProto<
  CoreNamespace,
  'text-input'
> & {
  value: string;
};

export type TimelineState =
  | {
      state: 'playing';
      totalTimeMillis: number;
      effectiveStartTime: number;
      speed: number;
    }
  | {
      state: 'stopped';
      totalTimeMillis: number;
      currentTimeMillis: number;
    };

export type TimelineComponent = BaseComponentProto<
  CoreNamespace,
  'timeline'
> & {
  state: TimelineState;
  title?: string;
  subtitles?: string[];
  source?: {
    name: string;
  };
};

export type CoreComponent =
  | ButtonComponent
  | GroupComponent
  | GroupHeaderComponent
  | LabelComponent
  | RectComponent
  | SliderButtonComponent
  | SwitchComponent
  | TabComponent
  | TabsComponent
  | TextInputComponent
  | TimelineComponent;

export const isCoreComponent = (
  component: AnyComponentProto,
): component is CoreComponent => component.namespace === 'core';

export type ButtonPressMessage = BaseClientComponentCall<
  CoreNamespace,
  'press'
>;

export type GroupTitleChangeMessage =
  BaseClientComponentMessage<CoreNamespace> & {
    component: 'group';
    title: string;
  };

export type SliderButtonUpdateMessage =
  BaseClientComponentMessage<CoreNamespace> & {
    component: 'slider_button';
    value: number;
  };

export type SwitchToggleMessage = BaseClientComponentMessage<CoreNamespace> & {
  component: 'switch';
};

export type TextInputUpdateMessage =
  BaseClientComponentMessage<CoreNamespace> & {
    component: 'text-input';
    value: string;
  };

export type CoreComponentMessage =
  | GroupTitleChangeMessage
  | SliderButtonUpdateMessage
  | SwitchToggleMessage
  | TextInputUpdateMessage;

export interface CoreComponentCalls {
  press: {
    call: ButtonPressMessage;
    return: true;
  };
}

export const isCoreComponentMessage = <
  C extends CoreComponentMessage['component'],
>(
  message: BaseClientComponentMessage<string>,
  component: C,
): message is CoreComponentMessage & { component: C } =>
  message.namespace === 'core' &&
  (message as CoreComponentMessage).component === component;

export const isCoreComponentCall = <A extends keyof CoreComponentCalls>(
  call: BaseClientComponentCall<string, string>,
  action: A,
): call is CoreComponentCalls[A]['call'] =>
  call.namespace === 'core' && call.action === action;
