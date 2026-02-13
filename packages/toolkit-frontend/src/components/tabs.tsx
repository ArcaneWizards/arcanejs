import React, { FC } from 'react';

import * as proto from '@arcanejs/protocol/core';

import { calculateClass } from '../util';

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
    <div className="arcane-tabs">
      <div className="arcane-tabs__list">
        {props.info.tabs.map((tab, i) => (
          <div
            key={i}
            className={calculateClass(
              'arcane-tabs__item',
              touching === i && 'touching',
              currentTab === i && 'current',
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
          </div>
        ))}
      </div>
      <NestedContent>{tab?.child && renderComponent(tab.child)}</NestedContent>
    </div>
  );
};

export { Tabs };
