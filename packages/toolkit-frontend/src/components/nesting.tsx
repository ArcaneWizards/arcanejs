import React, { FC, type ReactNode } from 'react';

import { cn } from '../util';

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
      className={cn(
        'p-2 shadow-arcane-box-inset',
        color === 'dark' && 'bg-arcane-bg-dark-1',
        color === 'lighter' && 'bg-arcane-bg',
        color === 'lighterer' && 'bg-arcane-bg-light-1',
        className,
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
