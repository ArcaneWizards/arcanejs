import { AnyComponentProto, BaseComponentProto } from '@arcanejs/protocol';

export const THEME_NAMESPACE = 'theme-demo';

export type ThemeSwitchComponentProto = BaseComponentProto<
  typeof THEME_NAMESPACE,
  'theme-switch'
>;

export type ThemeComponent = ThemeSwitchComponentProto;

export const isThemeComponent = (
  component: AnyComponentProto,
): component is ThemeComponent => component.namespace === THEME_NAMESPACE;
