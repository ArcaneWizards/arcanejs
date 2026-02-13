import React, {
  EventHandler,
  FC,
  KeyboardEvent,
  ReactNode,
  SyntheticEvent,
  useContext,
  useState,
} from 'react';

import * as proto from '@arcanejs/protocol/core';

import { calculateClass, usePressable } from '../util';

import { StageContext } from './context';
import { Icon } from './core';
import { NestedContent } from './nesting';

interface Props {
  className?: string;
  info: proto.GroupComponent;
}

const GroupStateContext = React.createContext<{
  isCollapsed: (
    key: number,
    defaultState: proto.DefaultGroupCollapsedState,
  ) => boolean;
  toggleCollapsed: (key: number) => void;
}>({
  isCollapsed: () => {
    throw new Error('missing GroupStateContext');
  },
  toggleCollapsed: () => {
    throw new Error('missing GroupStateContext');
  },
});

export const GroupStateWrapper: React.FunctionComponent<{
  /**
   * Whether new groups using `auto` should be open by default.
   */
  openByDefault: boolean;
  children: ReactNode;
}> = ({ openByDefault, children }) => {
  const [state, setState] = useState<
    Record<number, proto.GroupCollapsedState | undefined>
  >({});

  const isCollapsed = (
    key: number,
    defaultState: proto.DefaultGroupCollapsedState,
  ): boolean => {
    let match = state[key];
    if (!match) {
      match =
        defaultState === 'auto'
          ? openByDefault
            ? 'open'
            : 'closed'
          : defaultState;
      setState((current) => ({
        ...current,
        [key]: match,
      }));
    }
    return match === 'closed';
  };

  const toggleCollapsed = (key: number) => {
    setState((current) => ({
      ...current,
      [key]: current[key] === 'closed' ? 'open' : 'closed',
    }));
  };

  return (
    <GroupStateContext.Provider value={{ isCollapsed, toggleCollapsed }}>
      {children}
    </GroupStateContext.Provider>
  );
};

const Group: FC<Props> = ({ className, info }) => {
  const groupState = useContext(GroupStateContext);
  const { renderComponent, sendMessage } = useContext(StageContext);
  const [editingTitle, setEditingTitle] = useState(false);
  const children = (
    <div
      className={calculateClass(
        'arcane-group__children',
        info.direction === 'vertical' ? 'is-vertical' : 'is-horizontal',
        info.wrap && 'is-wrap',
      )}
    >
      {info.children.map(renderComponent)}
    </div>
  );
  const collapsible = !!info.defaultCollapsibleState;
  const collapsed = info.defaultCollapsibleState
    ? groupState.isCollapsed(info.key, info.defaultCollapsibleState)
    : false;
  const collapsePressable = usePressable(() =>
    groupState.toggleCollapsed(info.key),
  );

  const showTitle = info.title || info.editableTitle;

  const displayHeader = [
    showTitle,
    info.labels?.length,
    info.headers?.length,
    collapsible,
  ].some((v) => v);

  const updateTitle: EventHandler<SyntheticEvent<HTMLInputElement>> = (e) => {
    sendMessage<proto.CoreComponentMessage>?.({
      type: 'component-message',
      namespace: 'core',
      componentKey: info.key,
      component: 'group',
      title: e.currentTarget.value,
    });
    setEditingTitle(false);
  };

  const keyDown: EventHandler<KeyboardEvent<HTMLInputElement>> = (e) => {
    if (e.key == 'Enter') {
      updateTitle(e);
    }
  };

  const hasBorder = info.border || displayHeader;

  const childrenElements = hasBorder ? (
    <NestedContent>{children}</NestedContent>
  ) : (
    children
  );

  return (
    <div
      className={calculateClass(
        'arcane-group',
        className,
        !hasBorder && 'no-border',
      )}
    >
      {displayHeader ? (
        <div
          className={calculateClass(
            'arcane-group__header',
            collapsePressable.touching && 'touching',
            collapsible && collapsed && 'collapsed',
          )}
        >
          {collapsible && (
            <Icon
              className="arcane-group__collapse-icon"
              icon={collapsed ? 'arrow_right' : 'arrow_drop_down'}
              {...collapsePressable.handlers}
            />
          )}
          {info.labels?.map((l, index) => (
            <span key={`${l.text}-${index}`} className="arcane-group__label">
              {l.text}
            </span>
          ))}
          {showTitle &&
            (info.editableTitle ? (
              editingTitle ? (
                <input
                  className="arcane-group__title-input"
                  // Focus input when it's created
                  ref={(input) => input?.focus()}
                  onBlur={updateTitle}
                  onKeyDown={keyDown}
                  defaultValue={info.title}
                />
              ) : (
                <span
                  className="arcane-group__editable-title"
                  onClick={() => setEditingTitle(true)}
                >
                  <span>{info.title}</span>
                  <Icon className="icon" icon="edit" />
                </span>
              )
            ) : (
              <span>{info.title}</span>
            ))}
          {collapsible ? (
            <span
              className="arcane-group__collapse-bar"
              {...collapsePressable.handlers}
            />
          ) : (
            <span className="arcane-group__grow" />
          )}
          {info.headers?.map((h) => h.children.map((c) => renderComponent(c)))}
        </div>
      ) : null}
      {collapsible && collapsed ? null : childrenElements}
    </div>
  );
};

Group.displayName = 'Group';

export { Group };
