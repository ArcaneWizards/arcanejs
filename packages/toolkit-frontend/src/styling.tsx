import React from 'react';
import {
  calculateClass,
  useColorSchemePreferences,
  usePreferredColorScheme,
} from './util';

export const DARK_THEME = {
  pageBg: '#333',
  colorGreen: '#98c379',
  colorRed: '#e06c75',
  colorAmber: '#d19a66',
  bgDark1: '#252524',
  bg: '#2a2a2b',
  bgLight1: '#353638',
  borderDark: '#151516',
  borderLight: '#1c1d1d',
  borderLighter: '#252524',
  borderLighterer: '#6b6b67',
  hint: '#4286f4',
  hintRGB: '66, 134, 244',
  hintDark1: '#2a77f3',
  textNormal: '#F3F3F5',
  textActive: '#ffffff',
  textMuted: '#777777',
  shadows: {
    boxShadowInset: 'inset 0px 0px 8px 0px rgba(0, 0, 0, 0.3)',
    textShadow: '0 -1px rgba(0, 0, 0, 0.7)',
    textShadowActive: '0 -1px rgba(0, 0, 0, 0.4)',
  },
  gradients: {
    button: 'linear-gradient(to bottom, #4f5053, #343436)',
    buttonHover: 'linear-gradient(to bottom, #5e6064, #393a3b)',
    buttonActive: 'linear-gradient(to bottom, #242525, #37383a)',
    buttonPressedHover: 'linear-gradient(to bottom, #282929, #414243)',
    hintPressed: 'linear-gradient(to bottom,#2a77f3,#4286f4)',
  },
  sizingPx: {
    spacing: 15,
    unitHeight: 40,
  },
};

export type Theme = typeof DARK_THEME;

export const LIGHT_THEME: Theme = {
  pageBg: '#f8f9fa',
  colorGreen: '#22863a',
  colorRed: '#d73a49',
  colorAmber: '#b08800',
  bgDark1: '#e9ecef',
  bg: '#ffffff',
  bgLight1: '#f5f5f5',
  borderDark: '#c7c7c7',
  borderLight: '#d7d7d7',
  borderLighter: '#eaecef',
  borderLighterer: '#f6f8fa',
  hint: '#4286f4',
  hintRGB: '0, 92, 197',
  hintDark1: '#2a77f3',
  textNormal: '#24292e',
  textActive: '#202020',
  textMuted: '#6a737d',
  shadows: {
    boxShadowInset: 'inset 0px 0px 8px 0px rgba(0, 0, 0, 0.05)',
    textShadow: '0 1px rgba(255, 255, 255, 0.7)',
    textShadowActive: '0 1px rgba(255, 255, 255, 0.4)',
  },
  gradients: {
    button: 'linear-gradient(to bottom, #e1e4e8, #d1d5da)',
    buttonHover: 'linear-gradient(to bottom, #d1d5da, #c1c6cc)',
    buttonActive: 'linear-gradient(to bottom, #b1b6bc, #d2d6da)',
    buttonPressedHover: 'linear-gradient(to bottom, #a1a6ac, #91969c)',
    hintPressed: 'linear-gradient(to bottom, #438bff, #85b3ff)',
  },
  sizingPx: DARK_THEME.sizingPx,
};

export type ThemeVariableMap = {
  '--arcane-page-bg': string;
  '--arcane-color-green': string;
  '--arcane-color-red': string;
  '--arcane-color-amber': string;
  '--arcane-bg-dark-1': string;
  '--arcane-bg': string;
  '--arcane-bg-light-1': string;
  '--arcane-border-dark': string;
  '--arcane-border-light': string;
  '--arcane-border-lighter': string;
  '--arcane-border-lighterer': string;
  '--arcane-hint': string;
  '--arcane-hint-rgb': string;
  '--arcane-hint-dark-1': string;
  '--arcane-text-normal': string;
  '--arcane-text-active': string;
  '--arcane-text-muted': string;
  '--arcane-shadow-box-inset': string;
  '--arcane-shadow-text': string;
  '--arcane-shadow-text-active': string;
  '--arcane-gradient-button': string;
  '--arcane-gradient-button-hover': string;
  '--arcane-gradient-button-active': string;
  '--arcane-gradient-button-pressed-hover': string;
  '--arcane-gradient-hint-pressed': string;
  '--arcane-spacing': string;
  '--arcane-unit-height': string;
};

export const themeToCssVariables = (theme: Theme): ThemeVariableMap => ({
  '--arcane-page-bg': theme.pageBg,
  '--arcane-color-green': theme.colorGreen,
  '--arcane-color-red': theme.colorRed,
  '--arcane-color-amber': theme.colorAmber,
  '--arcane-bg-dark-1': theme.bgDark1,
  '--arcane-bg': theme.bg,
  '--arcane-bg-light-1': theme.bgLight1,
  '--arcane-border-dark': theme.borderDark,
  '--arcane-border-light': theme.borderLight,
  '--arcane-border-lighter': theme.borderLighter,
  '--arcane-border-lighterer': theme.borderLighterer,
  '--arcane-hint': theme.hint,
  '--arcane-hint-rgb': theme.hintRGB,
  '--arcane-hint-dark-1': theme.hintDark1,
  '--arcane-text-normal': theme.textNormal,
  '--arcane-text-active': theme.textActive,
  '--arcane-text-muted': theme.textMuted,
  '--arcane-shadow-box-inset': theme.shadows.boxShadowInset,
  '--arcane-shadow-text': theme.shadows.textShadow,
  '--arcane-shadow-text-active': theme.shadows.textShadowActive,
  '--arcane-gradient-button': theme.gradients.button,
  '--arcane-gradient-button-hover': theme.gradients.buttonHover,
  '--arcane-gradient-button-active': theme.gradients.buttonActive,
  '--arcane-gradient-button-pressed-hover': theme.gradients.buttonPressedHover,
  '--arcane-gradient-hint-pressed': theme.gradients.hintPressed,
  '--arcane-spacing': `${theme.sizingPx.spacing}px`,
  '--arcane-unit-height': `${theme.sizingPx.unitHeight}px`,
});

const toThemeRootStyle = (
  theme: Theme,
  variableOverrides?: Partial<ThemeVariableMap>,
  initialStyle?: React.CSSProperties,
): React.CSSProperties =>
  ({
    ...initialStyle,
    ...themeToCssVariables(theme),
    ...(variableOverrides ?? {}),
  }) as React.CSSProperties;

export const ThemeRoot: React.FC<{
  dark: Theme;
  light: Theme;
  children: React.ReactNode;
  themeVariables?: Partial<ThemeVariableMap>;
  rootProps?: React.HTMLAttributes<HTMLDivElement>;
}> = ({ dark, light, children, themeVariables, rootProps }) => {
  const { colorSchemePreference } = useColorSchemePreferences();
  const effectiveTheme = usePreferredColorScheme();
  const theme = effectiveTheme === 'dark' ? dark : light;
  const style = React.useMemo(
    () => toThemeRootStyle(theme, themeVariables, rootProps?.style),
    [theme, themeVariables, rootProps?.style],
  );

  return (
    <div
      {...rootProps}
      className={calculateClass(
        'arcane-theme-root',
        `theme-${colorSchemePreference}`,
        rootProps?.className,
      )}
      style={style}
    >
      {children}
    </div>
  );
};
