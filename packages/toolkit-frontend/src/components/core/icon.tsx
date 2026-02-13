import * as React from 'react';

import { cn } from '../../util';

export const ICON_CLASS = 'icon';

interface Props extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Icon name from https://fonts.google.com/icons?icon.style=Outlined
   */
  icon: string;
}

const Icon: React.FunctionComponent<Props> = ({
  icon,
  className,
  ...props
}) => (
  <span
    className={cn(
      `
        inline-block text-arcane-icon leading-none font-normal tracking-normal
        whitespace-nowrap
      `,
      'font-arcane-icon',
      className,
    )}
    {...props}
  >
    {icon}
  </span>
);

export { Icon };
