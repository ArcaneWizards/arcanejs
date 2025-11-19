import Reconciler from 'react-reconciler';
import React from 'react';
import { DefaultEventPriority } from 'react-reconciler/constants';
import * as ld from '@arcanejs/toolkit';
import { Base, BaseParent } from '@arcanejs/toolkit/components/base';
import type { Props as GroupProps } from '@arcanejs/toolkit/components/group';
import { LoggerContext } from './logging';
import { PreparedComponents, prepareComponents } from './registry';
import { BaseComponentProto } from '@arcanejs/protocol';
import { CoreComponents } from './core';

type Type = string;
type Props = Record<string, unknown>;
type Container = ld.Group;
type Instance = ld.AnyComponent;
type TextInstance = ld.Label;

type SuspenseInstance = any;
type HydratableInstance = any;
type PublicInstance = any;
type HostContext = any;
type UpdatePayload = any;
type _ChildSet = any;
type TimeoutHandle = any;
type NoTimeout = number;

type LightDeskHostConfig = Reconciler.HostConfig<
  Type,
  Props,
  Container,
  Instance,
  TextInstance,
  SuspenseInstance,
  HydratableInstance,
  PublicInstance,
  HostContext,
  UpdatePayload,
  _ChildSet,
  TimeoutHandle,
  NoTimeout
>;

const canSetProps = (
  instance: ld.AnyComponent,
): instance is Base<string, BaseComponentProto<string, string>, unknown> =>
  instance instanceof Base;

type ReactToolkitConfig = {
  componentNamespaces: Array<PreparedComponents<any>>;
};

const hostConfig = ({
  componentNamespaces,
}: ReactToolkitConfig): LightDeskHostConfig => {
  const processedNamespaces: Record<string, PreparedComponents<any>> = {};
  for (const namespace of componentNamespaces) {
    if (processedNamespaces[namespace._namespace]) {
      throw new Error(`Duplicate namespace: ${namespace._namespace}`);
    }
    processedNamespaces[namespace._namespace] = namespace;
  }

  return {
    supportsMutation: true,
    supportsPersistence: false,
    noTimeout: -1,
    isPrimaryRenderer: true,
    supportsHydration: false,

    afterActiveInstanceBlur: () => null,
    appendChild: (parentInstance, child) => {
      if (parentInstance instanceof BaseParent) {
        parentInstance.appendChild(child);
      } else {
        throw new Error(`Unexpected Parent: ${parentInstance}`);
      }
    },
    appendInitialChild: (parentInstance, child) => {
      if (parentInstance instanceof BaseParent) {
        parentInstance.appendChild(child);
      } else {
        throw new Error(`Unexpected Parent: ${parentInstance}`);
      }
    },
    appendChildToContainer(container, child) {
      container.appendChild(child);
    },
    beforeActiveInstanceBlur: () => null,
    cancelTimeout: (id) => clearTimeout(id),
    clearContainer: (container) => container.removeAllChildren(),
    commitMount: () => {
      throw new Error(`Unexpected call to commitMount()`);
    },
    commitUpdate(
      instance,
      updatePayload,
      _type,
      _prevProps,
      _nextProps,
      _internalHandle,
    ) {
      if (canSetProps(instance)) {
        instance.setProps(updatePayload);
      } else {
        throw new Error(`Unexpected Instance: ${instance}`);
      }
    },
    commitTextUpdate: (textInstance, _oldText, newText) =>
      textInstance.setText(newText),
    createInstance: (type, props) => {
      const [namespace, typeName] = type.split(':', 2);
      if (!namespace || !typeName) {
        throw new Error(`Invalid type: ${type}`);
      }
      const components = processedNamespaces[namespace];
      if (!components) {
        throw new Error(`Unknown component namespace: ${namespace}`);
      }
      const creator = components._creators[typeName];
      if (!creator) {
        throw new Error(
          `Unable to render <${typeName} />, not provided to renderer.`,
        );
      }
      const instance = creator(props);
      return instance;
    },
    createTextInstance: (text) => new ld.Label({ text }),
    detachDeletedInstance: () => null,
    getChildHostContext: (parentHostContext) => parentHostContext,
    getCurrentEventPriority: () => DefaultEventPriority,
    getInstanceFromNode: () => {
      throw new Error('Not yet implemented.');
    },
    getInstanceFromScope: () => {
      throw new Error('Not yet implemented.');
    },
    getPublicInstance: (instance) => instance,
    getRootHostContext: () => null,
    insertBefore: (parentInstance, child, beforeChild) => {
      if (parentInstance instanceof BaseParent) {
        parentInstance.insertBefore(child, beforeChild);
      } else {
        throw new Error(`Unexpected Parent: ${parentInstance}`);
      }
    },
    insertInContainerBefore: (container, child, beforeChild) =>
      container.insertBefore(child, beforeChild),
    finalizeInitialChildren: () => false,
    prepareForCommit: () => null,
    preparePortalMount: () => null,
    prepareScopeUpdate: () => null,
    prepareUpdate: (
      _instance,
      _type,
      _oldProps,
      newProps,
      _rootContainer,
      _hostContext,
    ) => {
      const updates: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(newProps)) {
        // Filter out extra props from set properties
        if (key !== 'children') {
          updates[key] = val;
        }
      }
      if (Object.keys(updates).length) {
        return updates;
      } else {
        return null;
      }
    },
    removeChild(parentInstance, child) {
      if (parentInstance instanceof BaseParent) {
        parentInstance.removeChild(child);
      } else {
        throw new Error(`Unexpected Parent: ${parentInstance}`);
      }
    },
    removeChildFromContainer: (container, child) =>
      container.removeChild(child),
    resetAfterCommit: () => null,
    resetTextContent: () => {
      throw new Error(`Unexpected call to resetTextContent()`);
    },
    scheduleTimeout: (fn, delay) => setTimeout(fn, delay),
    shouldSetTextContent: () => false,

    // Not-implemented
    hideInstance: () => {
      // eslint-disable-next-line no-console
      console.log('Not-implemented: hideInstance');
    },
    hideTextInstance: () => {
      // eslint-disable-next-line no-console
      console.log('Not-implemented: hideTextInstance');
    },
    unhideInstance: () => {
      // eslint-disable-next-line no-console
      console.log('Not-implemented: unhideInstance');
    },
    unhideTextInstance: () => {
      // eslint-disable-next-line no-console
      console.log('Not-implemented: unhideTextInstance');
    },
  };
};

export const ToolkitRenderer = {
  renderGroup: (
    component: JSX.Element,
    container: ld.Group,
    config: ReactToolkitConfig = {
      componentNamespaces: [CoreComponents],
    },
  ) => {
    const reconciler = Reconciler(hostConfig(config) as LightDeskHostConfig);
    const root = (reconciler as any).createContainer(container, 0, false, null);
    const componentWithContexts = (
      <LoggerContext.Provider value={container.log}>
        {component}
      </LoggerContext.Provider>
    );
    reconciler.updateContainer(componentWithContexts, root, null);
  },
  render: (
    component: JSX.Element,
    container: ld.Toolkit,
    rootGroupProps?: GroupProps,
    config: ReactToolkitConfig = {
      componentNamespaces: [CoreComponents],
    },
  ) => {
    const group = new ld.Group({ direction: 'vertical', ...rootGroupProps });
    container.setRoot(group);
    ToolkitRenderer.renderGroup(component, group, config);
  },
};

export { CoreComponents, prepareComponents };

// Export core components

export const Button = CoreComponents.Button;
export const Group = CoreComponents.Group;
export const GroupHeader = CoreComponents.GroupHeader;
export const Label = CoreComponents.Label;
export const Rect = CoreComponents.Rect;
export const SliderButton = CoreComponents.SliderButton;
export const Switch = CoreComponents.Switch;
export const Tab = CoreComponents.Tab;
export const Tabs = CoreComponents.Tabs;
export const TextInput = CoreComponents.TextInput;
export const Timeline = CoreComponents.Timeline;
