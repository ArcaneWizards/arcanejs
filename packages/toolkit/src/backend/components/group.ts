import * as proto from '@arcanejs/protocol/core';
import { GroupComponentStyle } from '@arcanejs/protocol/styles';
import { IDMap } from '../util/id-map';

import { BaseParent, EventEmitter, Listenable } from './base';
import { Button } from './button';
import {
  AnyClientComponentMessage,
  AnyComponentProto,
} from '@arcanejs/protocol';
import type { ToolkitConnection, ToolkitRenderContext } from '../toolkit';

const GROUP_DEFAULT_STYLE: GroupComponentStyle = {
  direction: 'horizontal',
};

type Label = (proto.GroupComponent['labels'] & Array<unknown>)[number];

type GroupOptions = {
  editableTitle?: boolean;
  defaultCollapsibleState?: proto.GroupComponent['defaultCollapsibleState'];
};

export type Events = {
  'title-changed': (title: string, connection: ToolkitConnection) => void;
};

export type InternalProps = GroupComponentStyle &
  GroupOptions & {
    title: string | null;
    labels: Label[] | null;
    onTitleChanged?: Events['title-changed'];
  };

export type Props = Partial<InternalProps>;

const DEFAULT_PROPS: InternalProps = {
  ...GROUP_DEFAULT_STYLE,
  title: null,
  labels: null,
};

export class GroupHeader extends BaseParent<
  proto.CoreNamespace,
  proto.CoreComponent,
  Record<never, never>
> {
  public validateChildren = () => {
    // All children are valid
  };

  /** @hidden */
  public getProtoInfo = (
    idMap: IDMap,
    context: ToolkitRenderContext,
  ): proto.GroupHeaderComponent => ({
    namespace: 'core',
    component: 'group-header',
    key: idMap.getId(this),
    children: this.getChildren().map((c) => c.getProtoInfo(idMap, context)),
  });
}

/**
 * A collection of components, grouped in either a row or column. Can contain
 * further groups as children to organize components however you wish, and have
 * a number of styling options (such as removing the border).
 *
 * ![](media://images/group_screenshot.png)
 */
export class Group
  extends BaseParent<proto.CoreNamespace, proto.GroupComponent, Props>
  implements Listenable<Events>
{
  /** @hidden */
  private readonly events = new EventEmitter<Events>();

  public constructor(props?: Props) {
    super(DEFAULT_PROPS, props, {
      onPropsUpdated: (oldProps) =>
        this.events.processPropChanges(
          {
            onTitleChanged: 'title-changed',
          },
          oldProps,
          this.props,
        ),
    });
    this.triggerInitialPropsUpdate();
  }

  addListener = this.events.addListener;
  removeListener = this.events.removeListener;

  public validateChildren = () => {
    // All children are valid
  };

  public setOptions = (options: GroupOptions) => {
    this.updateProps(options);
  };

  public setTitle = (title: string) => {
    this.updateProps({ title });
  };

  public addLabel = (label: Label) => {
    this.updateProps({ labels: [...(this.props.labels || []), label] });
  };

  public setLabels = (labels: Label[]) => {
    this.updateProps({ labels });
  };

  public addHeaderChild = <C extends Button>(child: C): C => {
    const header = new GroupHeader({});
    header.appendChild(child);
    this.appendChild(header);
    return child;
  };

  public removeHeaderChild = (child: Button) => {
    for (const c of this.getChildren()) {
      if (c instanceof GroupHeader) {
        c.removeChild(child);
      }
    }
  };

  public removeAllHeaderChildren = () => {
    for (const child of this.getChildren()) {
      if (child instanceof GroupHeader) {
        child.removeAllChildren();
      }
    }
  };

  /** @hidden */
  public getProtoInfo = (
    idMap: IDMap,
    context: ToolkitRenderContext,
  ): proto.GroupComponent => {
    const children: AnyComponentProto[] = [];
    const headers: proto.GroupHeaderComponent[] = [];
    for (const c of this.getChildren()) {
      const childProto = c.getProtoInfo(idMap, context);
      if (
        proto.isCoreComponent(childProto) &&
        childProto.component === 'group-header'
      ) {
        headers.push(childProto);
      } else {
        children.push(childProto);
      }
    }
    return {
      namespace: 'core',
      component: 'group',
      key: idMap.getId(this),
      title: this.props.title ?? undefined,
      direction: this.props.direction ?? DEFAULT_PROPS.direction,
      border: this.props.border,
      wrap: this.props.wrap,
      children,
      headers: headers.length > 0 ? headers : undefined,
      labels: this.props.labels ?? undefined,
      editableTitle: this.props.editableTitle || false,
      defaultCollapsibleState: this.props.defaultCollapsibleState,
    };
  };

  /** @hidden */
  public handleMessage = (
    message: AnyClientComponentMessage,
    connection: ToolkitConnection,
  ) => {
    if (proto.isCoreComponentMessage(message, 'group')) {
      this.events.emit('title-changed', message.title, connection);
    }
  };
}
