import React from 'react';
import { calculateClass, useColorSchemePreferences } from './util';

export const ThemeRoot: React.FC<{
  children: React.ReactNode;
  rootProps?: React.HTMLAttributes<HTMLDivElement>;
}> = ({ children, rootProps }) => {
  const { colorSchemePreference } = useColorSchemePreferences();

  return (
    <div
      {...rootProps}
      className={calculateClass(
        'arcane-theme-root',
        `theme-${colorSchemePreference}`,
        rootProps?.className,
      )}
    >
      {children}
    </div>
  );
};
