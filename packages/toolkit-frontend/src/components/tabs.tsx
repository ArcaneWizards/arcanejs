import React, { FC } from 'react';

import * as proto from '@arcanejs/protocol/core';

import { cn } from '../util';

import { StageContext } from './context';
import { NestedContent } from './nesting';

interface Props {
  info: proto.TabsComponent;
}

const Tabs: FC<Props> = (props) => {
  const { renderComponent } = React.useContext(StageContext);
  const [touching, setTouching] = React.useState<null | number>(null);
  const [currentTab, setCurrentTab] = React.useState<number>(0);
  const tab = props.info.tabs[currentTab];

  return (
    <div
      className={cn(
        'flex flex-col border border-arcane-btn-border bg-arcane-btn-border',
      )}
    >
      <div className={cn('flex flex-row border-b border-arcane-btn-border')}>
        {props.info.tabs.map((tab, i) => (
          <div
            key={i}
            className={cn(
              `
                relative mr-px flex h-arcane-tabs-item cursor-pointer
                items-center bg-arcane-bg-dark-1 px-arcane
                hover:bg-arcane-bg-light-1
              `,
              touching === i && 'bg-arcane-bg-light-1',
              currentTab === i && 'text-arcane-hint',
            )}
            onClick={() => setCurrentTab(i)}
            onTouchStart={(event) => {
              event.preventDefault();
              setTouching(i);
            }}
            onTouchEnd={(event) => {
              event.preventDefault();
              setTouching(null);
              setCurrentTab(i);
            }}
          >
            {tab.name}
            {currentTab === i ? (
              <span
                className={cn(
                  'absolute inset-x-2 bottom-1 h-0.5 bg-arcane-hint',
                )}
              />
            ) : null}
          </div>
        ))}
      </div>
      <NestedContent>{tab?.child && renderComponent(tab.child)}</NestedContent>
    </div>
  );
};

export { Tabs };
