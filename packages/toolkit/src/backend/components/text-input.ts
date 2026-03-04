import * as proto from '@arcanejs/protocol/core';
import { IDMap } from '../util/id-map';

import { Base, EventEmitter, Listenable } from './base';
import { AnyClientComponentMessage } from '@arcanejs/protocol';
import type { ToolkitConnection, ToolkitRenderContext } from '../toolkit';

export type Events = {
  change: (
    value: string,
    connection: ToolkitConnection,
  ) => void | Promise<void>;
};

type InternalProps = {
  value: string | null;
  onChange?: Events['change'];
};

export type Props = Partial<InternalProps>;

const DEFAULT_PROPS: InternalProps = {
  value: null,
};

export class TextInput
  extends Base<proto.CoreNamespace, proto.CoreComponent, InternalProps>
  implements Listenable<Events>
{
  /** @hidden */
  private readonly events = new EventEmitter<Events>();

  public constructor(props?: Props) {
    super(DEFAULT_PROPS, props, {
      onPropsUpdated: (oldProps) =>
        this.events.processPropChanges(
          {
            onChange: 'change',
          },
          oldProps,
          this.props,
        ),
    });
    this.triggerInitialPropsUpdate();
  }

  addListener = this.events.addListener;
  removeListener = this.events.removeListener;

  /** @hidden */
  public getProtoInfo = (
    idMap: IDMap,
    _context: ToolkitRenderContext,
  ): proto.CoreComponent => {
    return {
      namespace: 'core',
      component: 'text-input',
      key: idMap.getId(this),
      value: this.props.value ?? '',
    };
  };

  /** @hidden */
  public handleMessage = (
    message: AnyClientComponentMessage,
    connection: ToolkitConnection,
  ) => {
    if (proto.isCoreComponentMessage(message, 'text-input')) {
      if (this.props.value !== message.value) {
        this.updateProps({ value: message.value });
        this.events.emit('change', message.value, connection);
      }
    }
  };

  public getValue = () => this.props.value;

  public getValidatedValue = <T>(validator: (text: string) => T): null | T =>
    this.props.value === '' ? null : validator(this.props.value || '');

  public setValue = (value: string) => {
    this.updateProps({ value });
  };
}
