import React, { FC, type ReactNode } from 'react';
import { styled } from 'styled-components';

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
    <div className={calculateClass(className, `color-${color}`)}>
      <LastNestedColor.Provider value={nextColor(color)}>
        {children}
      </LastNestedColor.Provider>
    </div>
  );
};

NestedContent.displayName = 'NestedContent';

const StyledNestedContent: FC<NestContentProps> = styled(NestedContent)`
  padding: ${(p) => p.theme.sizingPx.spacing / 2}px;
  box-shadow: ${(p) => p.theme.shadows.boxShadowInset};

  &.color-dark {
    background: ${(p) => p.theme.bgDark1};
  }

  &.color-lighter {
    background: ${(p) => p.theme.bg};
  }

  &.color-lighterer {
    background: ${(p) => p.theme.bgLight1};
  }
`;

export { StyledNestedContent as NestedContent };
