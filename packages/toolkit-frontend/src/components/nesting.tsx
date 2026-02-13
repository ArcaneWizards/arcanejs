import React, { FC, type ReactNode } from 'react';

import { calculateClass } from '../util';

type GroupColor = 'dark' | 'lighter' | 'lighterer';

function nextColor(currentColor: GroupColor): GroupColor {
  switch (currentColor) {
    case 'dark':
      return 'lighter';
    case 'lighter':
      return 'dark';
    case 'lighterer':
      return 'dark';
  }
}

const LastNestedColor = React.createContext<GroupColor>('dark');

type NestContentProps = {
  className?: string;
  children?: ReactNode;
};

const NestedContent: FC<NestContentProps> = ({ className, children }) => {
  const color = React.useContext(LastNestedColor);

  return (
    <div
      className={calculateClass(
        'arcane-nested-content',
        className,
        `color-${color}`,
      )}
    >
      <LastNestedColor.Provider value={nextColor(color)}>
        {children}
      </LastNestedColor.Provider>
    </div>
  );
};

NestedContent.displayName = 'NestedContent';

export { NestedContent };
