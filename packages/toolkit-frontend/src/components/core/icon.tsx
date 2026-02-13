import * as React from 'react';

import { calculateClass } from '../../util';

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
    className={calculateClass('arcane-icon', className, ICON_CLASS)}
    {...props}
  >
    {icon}
  </span>
);

export { Icon };
