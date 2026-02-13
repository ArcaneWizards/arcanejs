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

type Props = Record<string, unknown>;

const canSetProps = (
  instance: ld.AnyComponent,
): instance is Base<string, BaseComponentProto<string, string>, unknown> =>
  instance instanceof Base;

type ReactToolkitConfig = {
  componentNamespaces: Array<PreparedComponents<any>>;
};

const getPropsToSet = (props: Props): Record<string, unknown> => {
  const updates: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(props)) {
    // Filter out React-only props before passing data to toolkit components.
    if (key !== 'children') {
      updates[key] = val;
    }
  }
  return updates;
};

const setInstanceProps = (
  instance: ld.AnyComponent,
  props: Record<string, unknown>,
) => {
  if (canSetProps(instance)) {
    instance.setProps(props);
  } else {
    throw new Error(`Unexpected Instance: ${instance}`);
  }
};

const scheduleMicrotaskCompat =
  typeof queueMicrotask === 'function'
    ? queueMicrotask
    : (cb: () => void) => {
        Promise.resolve().then(cb);
      };

const reportRendererError = (error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(error);
};

const createContainerCompat = (
  reconciler: any,
  container: ld.Group,
): unknown => {
  const createContainer = reconciler.createContainer as (
    ...args: Array<unknown>
  ) => unknown;

  if (createContainer.length <= 4) {
    // React 18 / reconciler <= 0.30 shape.
    return createContainer(container, 0, false, null);
  }

  // React 19 / reconciler >= 0.31 shape.
  return createContainer(
    container,
    0,
    null,
    false,
    null,
    '',
    reportRendererError,
    reportRendererError,
    reportRendererError,
    null,
  );
};

const ROOT_HOST_CONTEXT = {};

const hostConfig = ({ componentNamespaces }: ReactToolkitConfig) => {
  const processedNamespaces: Record<string, PreparedComponents<any>> = {};
  for (const namespace of componentNamespaces) {
    if (processedNamespaces[namespace._namespace]) {
      throw new Error(`Duplicate namespace: ${namespace._namespace}`);
    }
    processedNamespaces[namespace._namespace] = namespace;
  }

  const hostTransitionContext = React.createContext<unknown>(null);
  let currentUpdatePriority = DefaultEventPriority;

  const config: any = {
    supportsMutation: true,
    supportsPersistence: false,
    noTimeout: -1,
    isPrimaryRenderer: true,
    supportsHydration: false,
    supportsMicrotasks: true,
    NotPendingTransition: null,
    HostTransitionContext: hostTransitionContext,

    afterActiveInstanceBlur: () => null,
    appendChild: (parentInstance: ld.AnyComponent, child: ld.AnyComponent) => {
      if (parentInstance instanceof BaseParent) {
        parentInstance.appendChild(child);
      } else {
        throw new Error(`Unexpected Parent: ${parentInstance}`);
      }
    },
    appendInitialChild: (
      parentInstance: ld.AnyComponent,
      child: ld.AnyComponent,
    ) => {
      if (parentInstance instanceof BaseParent) {
        parentInstance.appendChild(child);
      } else {
        throw new Error(`Unexpected Parent: ${parentInstance}`);
      }
    },
    appendChildToContainer(container: ld.Group, child: ld.AnyComponent) {
      container.appendChild(child);
    },
    beforeActiveInstanceBlur: () => null,
    cancelTimeout: (id: ReturnType<typeof setTimeout>) => clearTimeout(id),
    clearContainer: (container: ld.Group) => container.removeAllChildren(),
    commitMount: (_instance: ld.AnyComponent, _type: string, _props: Props) => {
      throw new Error(`Unexpected call to commitMount()`);
    },
    commitUpdate(instance: ld.AnyComponent, ...args: Array<unknown>) {
      if (typeof args[0] === 'string') {
        // React 19 signature: (instance, type, prevProps, nextProps, handle)
        const nextProps = args[2] as Props;
        setInstanceProps(instance, getPropsToSet(nextProps));
        return;
      }

      // React 18 signature: (instance, updatePayload, type, prevProps, nextProps, handle)
      const updatePayload = args[0] as Record<string, unknown> | null;
      if (updatePayload) {
        setInstanceProps(instance, updatePayload);
        return;
      }
      const nextProps = args[3] as Props | undefined;
      if (nextProps) {
        setInstanceProps(instance, getPropsToSet(nextProps));
      }
    },
    commitTextUpdate: (
      textInstance: ld.Label,
      _oldText: string,
      newText: string,
    ) => textInstance.setText(newText),
    createInstance: (type: string, props: Props) => {
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
    createTextInstance: (text: string) => new ld.Label({ text }),
    detachDeletedInstance: () => null,
    getChildHostContext: (parentHostContext: unknown) => parentHostContext,
    getCurrentEventPriority: () => DefaultEventPriority,
    getCurrentUpdatePriority: () => currentUpdatePriority,
    getInstanceFromNode: () => {
      throw new Error('Not yet implemented.');
    },
    getInstanceFromScope: () => {
      throw new Error('Not yet implemented.');
    },
    getPublicInstance: (instance: ld.AnyComponent) => instance,
    getRootHostContext: () => ROOT_HOST_CONTEXT,
    insertBefore: (
      parentInstance: ld.AnyComponent,
      child: ld.AnyComponent,
      beforeChild: ld.AnyComponent,
    ) => {
      if (parentInstance instanceof BaseParent) {
        parentInstance.insertBefore(child, beforeChild);
      } else {
        throw new Error(`Unexpected Parent: ${parentInstance}`);
      }
    },
    insertInContainerBefore: (
      container: ld.Group,
      child: ld.AnyComponent,
      beforeChild: ld.AnyComponent,
    ) => container.insertBefore(child, beforeChild),
    finalizeInitialChildren: () => false,
    maySuspendCommit: () => false,
    preloadInstance: () => false,
    prepareForCommit: () => null,
    preparePortalMount: () => null,
    prepareScopeUpdate: () => null,
    prepareUpdate: (
      _instance: ld.AnyComponent,
      _type: string,
      _oldProps: Props,
      newProps: Props,
      _rootContainer: ld.Group,
      _hostContext: unknown,
    ): Record<string, unknown> | null => {
      const updates = getPropsToSet(newProps as Props);
      return Object.keys(updates).length ? updates : null;
    },
    requestPostPaintCallback: (callback: (endTime: number) => void) => {
      setTimeout(() => callback(Date.now()), 0);
    },
    removeChild(parentInstance: ld.AnyComponent, child: ld.AnyComponent) {
      if (parentInstance instanceof BaseParent) {
        parentInstance.removeChild(child);
      } else {
        throw new Error(`Unexpected Parent: ${parentInstance}`);
      }
    },
    removeChildFromContainer: (container: ld.Group, child: ld.AnyComponent) =>
      container.removeChild(child),
    resetAfterCommit: () => null,
    resetTextContent: () => {
      throw new Error(`Unexpected call to resetTextContent()`);
    },
    resetFormInstance: () => null,
    resolveEventTimeStamp: () => Date.now(),
    resolveEventType: () => null,
    resolveUpdatePriority: () => currentUpdatePriority,
    scheduleTimeout: (fn: () => void, delay?: number) => setTimeout(fn, delay),
    scheduleMicrotask: scheduleMicrotaskCompat,
    setCurrentUpdatePriority: (newPriority: number) => {
      currentUpdatePriority = newPriority;
    },
    shouldAttemptEagerTransition: () => false,
    shouldSetTextContent: () => false,
    startSuspendingCommit: () => null,
    suspendInstance: () => null,
    trackSchedulerEvent: () => null,
    waitForCommitToBeReady: () => null,

    hideInstance: () => null,
    hideTextInstance: () => null,
    unhideInstance: () => null,
    unhideTextInstance: () => null,
  };

  return config;
};

export const ToolkitRenderer = {
  renderGroup: (
    component: React.ReactElement,
    container: ld.Group,
    config: ReactToolkitConfig = {
      componentNamespaces: [CoreComponents],
    },
  ) => {
    const reconciler = Reconciler(hostConfig(config) as any) as any;
    const root = createContainerCompat(reconciler, container);
    const componentWithContexts = (
      <LoggerContext.Provider value={container.log}>
        {component}
      </LoggerContext.Provider>
    );
    reconciler.updateContainer(componentWithContexts, root, null, undefined);
  },
  render: (
    component: React.ReactElement,
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
