import * as proto from '@arcanejs/protocol/core';
import { IDMap } from '../util/id-map';

import { Base, EventEmitter, Listenable } from './base';
import { AnyClientComponentMessage } from '@arcanejs/protocol';
import type { ToolkitConnection, ToolkitRenderContext } from '../toolkit';

export type Events = {
  change: (
    state: 'on' | 'off',
    connection: ToolkitConnection,
  ) => void | Promise<void>;
};

type InternalProps = {
  value?: 'on' | 'off';
  defaultValue?: 'on' | 'off';
  onChange?: Events['change'];
};

export type Props = Partial<InternalProps>;

const DEFAULT_PROPS: InternalProps = {};

export class Switch
  extends Base<proto.CoreNamespace, proto.CoreComponent, InternalProps>
  implements Listenable<Events>
{
  /** @hidden */
  private readonly events = new EventEmitter<Events>();

  /**
   * Manually manage the state of the switch,
   * to support both controlled and uncontrolled inputs.
   */
  private _value: null | 'on' | 'off' = null;

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
      component: 'switch',
      key: idMap.getId(this),
      state: this._value ?? 'off',
    };
  }

  /** @hidden */
  public handleMessage(
    message: AnyClientComponentMessage,
    connection: ToolkitConnection,
  ) {
    if (proto.isCoreComponentMessage(message, 'switch')) {
      // Toggle state value
      const state = this._value === 'on' ? 'off' : 'on';
      if (this.props.value === undefined) {
        // Uncontrolled mode, update state
        this._value = state;
        // Tree update has to be manual as we're not updating props
        this.updateTree();
      }
      this.events.emit('change', state, connection);
    }
  }

  public setValue(state: 'on' | 'off') {
    if (this.props.value) {
      throw new Error('Cannot set value on controlled input');
    }
    this._value = state;
    // Tree update has to be manual as we're not updating props
    this.updateTree();
  }

  private onPropsUpdated = () => {
    if (this.props.value !== undefined) {
      this._value = this.props.value;
    } else if (this._value === null && this.props.defaultValue) {
      this._value = this.props.defaultValue;
    }
  };
}
