import * as proto from '@arcanejs/protocol/core';
import { IDMap } from '../util/id-map';

import { Base, EventEmitter, Listenable } from './base';
import { AnyClientComponentMessage } from '@arcanejs/protocol';
import type { ToolkitConnection, ToolkitRenderContext } from '../toolkit';

export type Events = {
  change: (
    value: number,
    connection: ToolkitConnection,
  ) => void | Promise<void>;
};

type InternalProps = Pick<
  proto.SliderButtonComponent,
  'min' | 'max' | 'step' | 'gradient' | 'grow'
> & {
  value?: number;
  defaultValue?: number;
  onChange?: Events['change'];
};

type RequiredProps = 'value';

export type Props = Pick<InternalProps, RequiredProps> &
  Partial<Omit<InternalProps, RequiredProps>>;

const DEFAULT_PROPS: InternalProps = {
  min: 0,
  max: 255,
  step: 5,
};

export class SliderButton
  extends Base<proto.CoreNamespace, proto.CoreComponent, InternalProps>
  implements Listenable<Events>
{
  /** @hidden */
  private readonly events = new EventEmitter<Events>();

  /**
   * Manually manage the state of the slider,
   * to support both controlled and uncontrolled inputs.
   */
  private _value: null | number = null;

  public constructor(props?: Props) {
    super(DEFAULT_PROPS, props, {
      onPropsUpdated: (oldProps) => {
        this.events.processPropChanges(
          {
            onChange: 'change',
          },
          oldProps,
          this.props,
        ),
          this.onPropsUpdated();
      },
    });
    this.triggerInitialPropsUpdate();
  }

  addListener = this.events.addListener;
  removeListener = this.events.removeListener;

  /** @hidden */
  public getProtoInfo(
    idMap: IDMap,
    _context: ToolkitRenderContext,
  ): proto.CoreComponent {
    return {
      namespace: 'core',
      component: 'slider_button',
      key: idMap.getId(this),
      min: this.props.min,
      max: this.props.max,
      step: this.props.step,
      value: this._value,
      gradient: this.props.gradient,
      grow: this.props.grow,
    };
  }

  /** @hidden */
  public handleMessage(
    message: AnyClientComponentMessage,
    connection: ToolkitConnection,
  ) {
    if (!proto.isCoreComponentMessage(message, 'slider_button')) return;
    const newValue = this.sanitizeNumber(message.value);
    if (this._value === newValue) return;
    if (this.props.value === undefined) {
      // Uncontrolled mode, update state
      this._value = newValue;
      // Tree update has to be manual as we're not updating props
      this.updateTree();
    }
    this.events.emit('change', newValue, connection);
  }

  public setValue(value: number) {
    if (this.props.value) {
      throw new Error('Cannot set value on controlled input');
    }
    const newValue = this.sanitizeNumber(value);
    if (this._value === newValue) return;
    this._value = newValue;
    this.updateTree();
  }

  private sanitizeNumber(value: number) {
    // Return the closest number according to the min, max and step values
    // allowedValue = min + step * i (for some integer i)
    const i = Math.round((value - this.props.min) / this.props.step);
    const v = i * this.props.step + this.props.min;
    // map value to an integer index
    const clampedValue = Math.max(this.props.min, Math.min(this.props.max, v));
    return clampedValue;
  }

  private onPropsUpdated = () => {
    if (this.props.value !== undefined) {
      this._value = this.props.value;
    } else if (this._value === null && this.props.defaultValue) {
      this._value = this.props.defaultValue;
    }
  };
}
