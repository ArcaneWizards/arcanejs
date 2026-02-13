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

import { cn, usePressable } from '../util';

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
      className={cn(
        'flex gap-2',
        info.direction === 'vertical' && 'flex-col',
        info.direction === 'horizontal' && 'items-center',
        info.wrap ? 'flex-wrap' : 'flex-nowrap',
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
      className={cn(
        hasBorder ? 'border border-arcane-btn-border' : 'm-0 border-none',
        className,
      )}
    >
      {displayHeader ? (
        <div
          className={cn(
            `
              flex items-center gap-0.5 border-b border-arcane-btn-border
              bg-arcane-btn-border p-1
            `,
            collapsePressable.touching && 'bg-arcane-bg-dark-1',
            collapsible && collapsed && 'border-b-0',
          )}
        >
          {collapsible && (
            <Icon
              className={cn('mx-0.5 cursor-pointer')}
              icon={collapsed ? 'arrow_right' : 'arrow_drop_down'}
              {...collapsePressable.handlers}
            />
          )}
          {info.labels?.map((l, index) => (
            <span
              key={`${l.text}-${index}`}
              className={cn(
                `
                  mx-0.5 inline-block rounded-arcane-btn border
                  border-arcane-bg-light-1 bg-arcane-bg px-1 py-0.5
                `,
              )}
            >
              {l.text}
            </span>
          ))}
          {showTitle &&
            (info.editableTitle ? (
              editingTitle ? (
                <input
                  className={cn(
                    `
                      border-none bg-transparent px-0.5 text-arcane-normal
                      text-arcane-text outline-none
                    `,
                  )}
                  // Focus input when it's created
                  ref={(input) => input?.focus()}
                  onBlur={updateTitle}
                  onKeyDown={keyDown}
                  defaultValue={info.title}
                />
              ) : (
                <span
                  className={cn(
                    `
                      group flex cursor-pointer items-center gap-0.5
                      rounded-arcane-btn px-0.5 text-arcane-normal
                      hover:bg-arcane-bg
                    `,
                  )}
                  onClick={() => setEditingTitle(true)}
                >
                  <span>{info.title}</span>
                  <Icon
                    className={cn(
                      `
                        text-arcane-text-muted
                        group-hover:text-arcane-hint
                      `,
                    )}
                    icon="edit"
                  />
                </span>
              )
            ) : (
              <span>{info.title}</span>
            ))}
          {collapsible ? (
            <span
              className={cn('mx-0.5 h-arcane-btn grow cursor-pointer')}
              {...collapsePressable.handlers}
            />
          ) : (
            <span className={cn('grow')} />
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
