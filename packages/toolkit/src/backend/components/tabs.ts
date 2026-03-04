import * as proto from '@arcanejs/protocol/core';
import { IDMap } from '../util/id-map';

import { AnyComponent, BaseParent } from './base';
import type { ToolkitRenderContext } from '../toolkit';

type TabDefinition = {
  name: string;
  component: AnyComponent;
};

type InternalTabProps = {
  name: string;
};

export type TabProps = InternalTabProps;

export class Tab extends BaseParent<
  proto.CoreNamespace,
  proto.CoreComponent,
  InternalTabProps
> {
  public validateChildren = (children: AnyComponent[]) => {
    if (children.length > 1) {
      throw new Error('Tab can only have one child');
    }
  };

  /** @hidden */
  public getProtoInfo = (
    idMap: IDMap,
    context: ToolkitRenderContext,
  ): proto.TabComponent => ({
    namespace: 'core',
    component: 'tab',
    key: idMap.getId(this),
    name: this.props.name,
    child: this.getChildren()
      .slice(0, 1)
      .map((c) => c.getProtoInfo(idMap, context))[0],
  });
}

type InternalTabsProps = Record<never, never>;

export type TabsProps = InternalTabsProps;

export class Tabs extends BaseParent<
  proto.CoreNamespace,
  proto.CoreComponent,
  InternalTabsProps
> {
  public validateChildren = (children: AnyComponent[]) => {
    for (const child of children) {
      if (!(child instanceof Tab)) {
        throw new Error('Tabs can only have Tab children');
      }
    }
  };

  public constructor(props?: TabsProps) {
    super({}, { ...props });
  }

  public addTabs(...tabs: TabDefinition[]) {
    for (const t of tabs) {
      const tab = new Tab({ name: t.name });
      tab.appendChildren(t.component);
      this.appendChild(tab);
    }
  }

  public addTab<C extends AnyComponent>(name: string, component: C): C {
    this.addTabs({ name, component });
    return component;
  }

  /** @hidden */
  public getProtoInfo(
    idMap: IDMap,
    context: ToolkitRenderContext,
  ): proto.TabsComponent {
    return {
      namespace: 'core',
      component: 'tabs',
      key: idMap.getId(this),
      tabs: this.getChildren().map((c) =>
        (c as Tab).getProtoInfo(idMap, context),
      ),
    };
  }
}
