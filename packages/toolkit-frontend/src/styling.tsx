import {
  createGlobalStyle,
  css,
  RuleSet,
  ThemeProvider,
} from 'styled-components';
import React from 'react';
import {
  calculateClass,
  useColorSchemePreferences,
  usePreferredColorScheme,
} from './util';

export const GlobalStyle: ReturnType<typeof createGlobalStyle> =
  createGlobalStyle`
body {
  &.touch-mode * {
    cursor: none !important;
  }
}
`;

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
): React.CSSProperties => {
  return {
    ...initialStyle,
    ...themeToCssVariables(theme),
    ...(variableOverrides ?? {}),
  } as React.CSSProperties;
};

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
    <ThemeProvider theme={theme}>
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
    </ThemeProvider>
  );
};

export const BaseStyle: ReturnType<typeof createGlobalStyle> =
  createGlobalStyle`
* {
  box-sizing: border-box;
}

body {
  background: var(--arcane-page-bg);
  margin: 0;
  padding: 0;
  font-size: 14px;
  font-family: sans-serif;
}

.arcane-stage {
  width: 100%;
  height: 100%;
  background: var(--arcane-page-bg);
  color: var(--arcane-text-normal);
  padding: var(--arcane-spacing);
}

.arcane-button {
  position: relative;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 200ms;
  border-radius: 3px;
  border: 1px solid var(--arcane-border-dark);
  overflow: visible;
  display: flex;
  justify-content: center;
  align-items: center;
  outline: none;
  height: 30px;
  color: var(--arcane-text-normal);
  background: var(--arcane-gradient-button);
  text-shadow: var(--arcane-shadow-text);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 1px 0 0 rgba(0, 0, 0, 0.25);
}

.arcane-button:hover {
  outline-color: rgba(243, 243, 245, 0.3);
  background: var(--arcane-gradient-button-hover);
  text-shadow: var(--arcane-shadow-text);
}

.arcane-button:active,
.arcane-button.is-touching,
.arcane-button.is-loading {
  outline-color: rgba(255, 255, 255, 0.3);
  background: var(--arcane-gradient-button-active);
  text-shadow: var(--arcane-shadow-text-active);
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.2),
    0 1px 0 0 rgba(255, 255, 255, 0.15);
  transition-duration: 50ms;
}

.arcane-button.is-error {
  color: var(--arcane-color-red);
  border-color: var(--arcane-color-red);
}

.arcane-button__contents {
  padding: 6px 4px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.arcane-button__contents > * {
  padding: 0;
}

.arcane-button__label {
  padding: 0 4px;
}

.arcane-touch-indicator {
  position: absolute;
  top: -6px;
  right: -6px;
  left: -6px;
  bottom: -6px;
  border-radius: 6px;
  border: 2px solid rgba(0, 0, 0, 0);
  background-color: transparent;
  transition: border-color 300ms;
}

.arcane-button.is-touching .arcane-touch-indicator,
.arcane-button.is-loading .arcane-touch-indicator,
.arcane-switch.touching .arcane-touch-indicator {
  border-color: var(--arcane-hint);
  background-color: rgba(var(--arcane-hint-rgb), 0.2);
  transition: border-color 0s;
}

.arcane-text-input {
  position: relative;
  box-sizing: border-box;
  padding: 6px 8px;
  border-radius: 3px;
  background: var(--arcane-bg-dark-1);
  border: 1px solid var(--arcane-border-dark);
  overflow: hidden;
  box-shadow: var(--arcane-shadow-box-inset);
  color: var(--arcane-text-normal);
  text-shadow: var(--arcane-shadow-text);
}

@media (max-width: 500px) {
  .arcane-text-input {
    flex-basis: 100%;
  }
}

.arcane-switch {
  position: relative;
}

.arcane-switch .inner {
  display: block;
  position: relative;
  overflow: hidden;
  width: 70px;
  min-width: 70px;
  height: 30px;
  border-radius: 3px;
  border: 1px solid var(--arcane-border-dark);
}

.arcane-switch .slider {
  position: absolute;
  top: 0;
  left: 0;
  cursor: pointer;
  transition: left 300ms;
}

.arcane-switch .slider > .on-text,
.arcane-switch .slider > .off-text,
.arcane-switch .slider > .button {
  position: absolute;
  height: 30px;
}

.arcane-switch .slider > .on-text,
.arcane-switch .slider > .off-text {
  width: 40px;
  text-align: center;
  top: 0;
  line-height: 28px;
  text-shadow: var(--arcane-shadow-text-active);
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.2),
    0 1px 0 0 rgba(255, 255, 255, 0.15);
}

.arcane-switch .slider > .on-text {
  left: -40px;
  background: var(--arcane-gradient-hint-pressed);
}

.arcane-switch .slider > .off-text {
  left: 28px;
  background: var(--arcane-gradient-button-active);
}

.arcane-switch .slider > .button {
  top: -1px;
  left: -1px;
  width: 30px;
  background: var(--arcane-gradient-button);
  text-shadow: var(--arcane-shadow-text);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  border: 1px solid var(--arcane-border-dark);
}

.arcane-switch .slider.on {
  left: 40px;
}

.arcane-switch .slider:hover > .button {
  background: var(--arcane-gradient-button-hover);
}

.arcane-group {
  border: 1px solid var(--arcane-border-dark);
}

.arcane-group.no-border {
  border: none;
  margin: 0 !important;
}

.arcane-group__header {
  display: flex;
  align-items: center;
  padding: 5px 2px;
  background: var(--arcane-border-dark);
  border-bottom: 1px solid var(--arcane-border-dark);
}

.arcane-group__header.touching {
  background: var(--arcane-bg-dark-1);
}

.arcane-group__header.collapsed {
  border-bottom: none;
}

.arcane-group__header > * {
  margin: 0 3px;
}

.arcane-group__collapse-icon {
  cursor: pointer;
}

.arcane-group__label {
  display: inline-block;
  border-radius: 3px;
  background: var(--arcane-bg);
  border: 1px solid var(--arcane-bg-light-1);
  padding: 3px 4px;
}

.arcane-group__grow {
  flex-grow: 1;
}

.arcane-group__collapse-bar {
  flex-grow: 1;
  cursor: pointer;
  height: 30px;
}

.arcane-group__children {
  display: flex;
}

.arcane-group__children.is-vertical {
  flex-direction: column;
}

.arcane-group__children.is-horizontal {
  flex-direction: row;
  align-items: center;
}

.arcane-group__children.is-wrap {
  flex-wrap: wrap;
}

.arcane-group__children:not(.is-wrap) {
  flex-wrap: nowrap;
}

.arcane-group__children > * {
  margin: calc(var(--arcane-spacing) / 2);
}

.arcane-group__editable-title {
  display: flex;
  align-items: center;
  border-radius: 3px;
  cursor: pointer;
  padding: 3px 2px;
}

.arcane-group__editable-title > * {
  margin: 0 2px;
}

.arcane-group__editable-title > .icon {
  color: var(--arcane-text-muted);
}

.arcane-group__editable-title:hover {
  background: var(--arcane-bg);
}

.arcane-group__editable-title:hover > .icon {
  color: var(--arcane-hint);
}

.arcane-group__title-input {
  background: none;
  border: none;
  outline: none;
  color: var(--arcane-text-normal);
}

.arcane-tabs {
  display: flex;
  flex-direction: column;
  background: var(--arcane-border-dark);
  border: 1px solid var(--arcane-border-dark);
}

.arcane-tabs__list {
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid var(--arcane-border-dark);
}

.arcane-tabs__item {
  height: calc(var(--arcane-spacing) * 3);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 var(--arcane-spacing);
  cursor: pointer;
  background: var(--arcane-bg-dark-1);
  margin-right: 1px;
}

.arcane-tabs__item:hover,
.arcane-tabs__item.touching {
  background: var(--arcane-bg-light-1);
}

.arcane-tabs__item.current {
  color: var(--arcane-hint);
}

.arcane-tabs__item.current::after {
  content: '';
  border-bottom: 2px solid var(--arcane-hint);
  display: block;
  margin-top: calc(var(--arcane-spacing) / 2);
}
`;

export const buttonStateNormal: RuleSet<object> = css`
  color: ${(p) => p.theme.textNormal};
  background: ${(p) => p.theme.gradients.button};
  text-shadow: ${(p) => p.theme.shadows.textShadow};
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 1px 0 0 rgba(0, 0, 0, 0.25);
`;

export const buttonStateNormalHover: RuleSet<object> = css`
  color: ${(p) => p.theme.textNormal};
  outline-color: rgba(243, 243, 245, 0.3);
  background: ${(p) => p.theme.gradients.buttonHover};
  text-shadow: ${(p) => p.theme.shadows.textShadow};
`;

export const buttonStateNormalActive: RuleSet<object> = css`
  color: ${(p) => p.theme.textNormal};
  outline-color: rgba(255, 255, 255, 0.3);
  background: ${(p) => p.theme.gradients.buttonActive};
  text-shadow: ${(p) => p.theme.shadows.textShadowActive};
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.2),
    0 1px 0 0 rgba(255, 255, 255, 0.15);
  transition-duration: 50ms;
`;

const buttonStatePressed: RuleSet<object> = css`
  ${buttonStateNormalActive}
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.1), 0 1px 0 0 rgba(255,255,255,0.15);
`;

const buttonStatePressedHover: RuleSet<object> = css`
  ${buttonStateNormalActive}
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.1), 0 1px 0 0 rgba(255,255,255,0.15);
  background: ${(p) => p.theme.gradients.buttonPressedHover};
`;

const buttonStatePressedActive: RuleSet<object> = buttonStateNormalActive;

const buttonStateDisabled: RuleSet<object> = css`
  ${buttonStateNormal}

  cursor: default;
  background: ${(p) => p.theme.bg} !important;
  color: rgba(${(p) => p.theme.textNormal}, 0.4);
`;

const button: RuleSet<object> = css`
  position: relative;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 200ms;
  border-radius: 3px;
  border: 1px solid ${(p) => p.theme.borderDark};
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  outline-color: transparent;
  ${buttonStateNormal}

  &:hover {
    ${buttonStateNormalHover}
  }

  &:active {
    ${buttonStateNormalActive}
  }
`;

export const buttonPressed: RuleSet<object> = css`
  ${buttonStatePressed}

  &:hover {
    ${buttonStatePressedHover}
  }

  &:active {
    ${buttonStatePressedActive}
  }
`;

export const buttonDisabled: RuleSet<object> = css`
  ${buttonStateDisabled}

  &:hover, &:active {
    ${buttonStateDisabled}
  }
`;

export const rectButton: RuleSet<object> = button;

export const touchIndicatorNormal: RuleSet<object> = css`
  position: absolute;
  top: -6px;
  right: -6px;
  left: -6px;
  bottom: -6px;
  border-radius: 6px;
  border: 2px solid rgba(0, 0, 0, 0);
  background-color: none;
  transition: border-color 300ms;
`;

export const touchIndicatorTouching: RuleSet<object> = css`
  border-color: ${(p) => p.theme.hint};
  background-color: rgba(${(p) => p.theme.hintRGB}, 0.2);
  transition: border-color 0s;
`;

export const PreferredThemeProvider: React.FC<{
  dark: Theme;
  light: Theme;
  children: React.ReactNode;
}> = ({ dark, light, children }) => {
  const theme = usePreferredColorScheme();

  return (
    <ThemeProvider theme={theme === 'dark' ? dark : light}>
      {children}
    </ThemeProvider>
  );
};
