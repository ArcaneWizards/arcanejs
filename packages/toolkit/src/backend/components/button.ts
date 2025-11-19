import * as proto from '@arcanejs/protocol/core';
import { IDMap } from '../util/id-map';

import { Base, EventEmitter, Listenable } from './base';
import { AnyClientComponentCall } from '@arcanejs/protocol';
import { ToolkitConnection } from '../toolkit';

export type Events = {
  click: (connection: ToolkitConnection) => void | Promise<void>;
};

export type ButtonMode = 'normal' | 'pressed';

export type InternalProps = {
  text: string | null;
  icon: string | null;
  mode: ButtonMode;
  error: string | null;
  onClick?: Events['click'] | null;
};

export type Props = Partial<InternalProps>;

const DEFAULT_PROPS: InternalProps = {
  text: null,
  icon: null,
  mode: 'normal',
  error: null,
  onClick: null,
};

export class Button
  extends Base<
    proto.CoreNamespace,
    proto.ButtonComponent,
    InternalProps,
    proto.CoreComponentCalls,
    'press'
  >
  implements Listenable<Events>
{
  /** @hidden */
  private readonly events = new EventEmitter<Events>();

  public constructor(props?: Props) {
    super(DEFAULT_PROPS, props, {
      onPropsUpdated: (oldProps) =>
        this.events.processPropChanges(
          {
            onClick: 'click',
          },
          oldProps,
          this.props,
        ),
    });
    this.triggerInitialPropsUpdate();
  }

  addListener = this.events.addListener;
  removeListener = this.events.removeListener;

  public setText = (text: string | null) => {
    this.updateProps({ text });
    return this;
  };

  public setIcon = (icon: string | undefined | null) => {
    this.updateProps({ icon: icon ?? null });
    return this;
  };

  public setMode = (mode: ButtonMode) => {
    this.updateProps({
      mode,
      error: null,
    });
    return this;
  };

  /** @hidden */
  public getProtoInfo = (idMap: IDMap): proto.ButtonComponent => {
    return {
      namespace: 'core',
      component: 'button',
      key: idMap.getId(this),
      text: this.props.text || '',
      state: this.props.error
        ? { state: 'error', error: this.props.error }
        : { state: this.props.mode },
      icon: this.props.icon ?? undefined,
    };
  };

  /** @hidden */
  public handleCall = (
    call: AnyClientComponentCall,
    connection: ToolkitConnection,
  ) => {
    if (proto.isCoreComponentCall(call, 'press')) {
      return this.events.emit('click', connection).then(() => true as const);
    }
    throw new Error(`Unhandled call action: ${call.action}`);
  };
}
