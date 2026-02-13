import { isCoreComponent } from '@arcanejs/protocol/core';
import { startArcaneFrontend } from '@arcanejs/toolkit/frontend';
import {
  CORE_FRONTEND_COMPONENT_RENDERER,
  Group,
} from '@arcanejs/toolkit-frontend';
import { DARK_THEME, LIGHT_THEME } from '@arcanejs/toolkit-frontend/styling';
import { FrontendComponentRenderer } from '@arcanejs/toolkit-frontend/types';
import { useColorSchemePreferences } from '@arcanejs/toolkit-frontend/util';
import styled from 'styled-components';

const tastefulDarkTheme = {
  ...DARK_THEME,
  pageBg: '#0f172a',
  bgDark1: '#162033',
  bg: '#1e293b',
  bgLight1: '#2a3650',
  borderDark: '#334155',
  borderLight: '#475569',
  borderLighter: '#526280',
  borderLighterer: '#64748b',
  hint: '#60a5fa',
  hintRGB: '96, 165, 250',
  hintDark1: '#3b82f6',
  colorGreen: '#34d399',
  colorRed: '#f87171',
  colorAmber: '#fbbf24',
  textNormal: '#e2e8f0',
  textActive: '#f8fafc',
  textMuted: '#94a3b8',
  gradients: {
    button: 'linear-gradient(to bottom, #3b4b67, #2b3952)',
    buttonHover: 'linear-gradient(to bottom, #486081, #334763)',
    buttonActive: 'linear-gradient(to bottom, #2a3851, #233146)',
    buttonPressedHover: 'linear-gradient(to bottom, #334763, #2a3b56)',
    hintPressed: 'linear-gradient(to bottom, #3b82f6, #60a5fa)',
  },
};

const tastefulLightTheme = {
  ...LIGHT_THEME,
  pageBg: '#f4f7fb',
  bgDark1: '#e6ecf5',
  bg: '#ffffff',
  bgLight1: '#f8fbff',
  borderDark: '#c7d2e3',
  borderLight: '#d6e0ef',
  borderLighter: '#e2e8f0',
  borderLighterer: '#edf2f8',
  hint: '#4f46e5',
  hintRGB: '79, 70, 229',
  hintDark1: '#4338ca',
  colorGreen: '#10b981',
  colorRed: '#ef4444',
  colorAmber: '#f59e0b',
  textNormal: '#1e293b',
  textActive: '#0f172a',
  textMuted: '#64748b',
  gradients: {
    button: 'linear-gradient(to bottom, #f8fafc, #e2e8f0)',
    buttonHover: 'linear-gradient(to bottom, #ffffff, #e8edf5)',
    buttonActive: 'linear-gradient(to bottom, #dde5f0, #f4f7fb)',
    buttonPressedHover: 'linear-gradient(to bottom, #e7edf6, #f8fbff)',
    hintPressed: 'linear-gradient(to bottom, #4338ca, #4f46e5)',
  },
};

const ThemeControlsContainer = styled.div`
  display: flex;
  gap: ${(p) => p.theme.sizingPx.spacing / 2}px;
  margin-bottom: ${(p) => p.theme.sizingPx.spacing}px;
`;

const ThemeButton = styled.button<{ $selected: boolean }>`
  cursor: pointer;
  border-radius: 999px;
  border: 1px solid ${(p) => (p.$selected ? p.theme.hint : p.theme.borderDark)};
  padding: 6px 12px;
  color: ${(p) => p.theme.textNormal};
  background: ${(p) =>
    p.$selected ? `rgba(${p.theme.hintRGB}, 0.22)` : p.theme.gradients.button};
  box-shadow: ${(p) =>
    p.$selected ? 'none' : 'inset 0 1px 0 rgba(255, 255, 255, 0.15)'};

  &:hover {
    background: ${(p) =>
      p.$selected
        ? `rgba(${p.theme.hintRGB}, 0.28)`
        : p.theme.gradients.buttonHover};
  }
`;

const ThemeControls = () => {
  const { colorSchemePreference, setColorSchemePreference } =
    useColorSchemePreferences();

  return (
    <ThemeControlsContainer>
      <ThemeButton
        type="button"
        $selected={colorSchemePreference === 'auto'}
        onClick={() => setColorSchemePreference('auto')}
      >
        Theme: Auto
      </ThemeButton>
      <ThemeButton
        type="button"
        $selected={colorSchemePreference === 'dark'}
        onClick={() => setColorSchemePreference('dark')}
      >
        Theme: Dark
      </ThemeButton>
      <ThemeButton
        type="button"
        $selected={colorSchemePreference === 'light'}
        onClick={() => setColorSchemePreference('light')}
      >
        Theme: Light
      </ThemeButton>
    </ThemeControlsContainer>
  );
};

const CUSTOM_CORE_RENDERER: FrontendComponentRenderer = {
  namespace: 'core',
  render: (info): JSX.Element => {
    if (!isCoreComponent(info)) {
      throw new Error(`Cannot render non-core component ${info.namespace}`);
    }

    if (info.component === 'group' && info.title === 'Static Theme Showcase') {
      return (
        <>
          <ThemeControls />
          <Group key={info.key} info={info} />
        </>
      );
    }

    return CORE_FRONTEND_COMPONENT_RENDERER.render(info);
  },
};

startArcaneFrontend({
  renderers: [CUSTOM_CORE_RENDERER],
  themes: {
    dark: tastefulDarkTheme,
    light: tastefulLightTheme,
  },
});
