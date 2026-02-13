import { type FC, type ReactElement } from 'react';
import styled from 'styled-components';
import { CORE_FRONTEND_COMPONENT_RENDERER } from '@arcanejs/toolkit-frontend';
import {
  DARK_THEME,
  LIGHT_THEME,
  type Theme,
} from '@arcanejs/toolkit-frontend/styling';
import {
  VALID_COLOR_SCHEME_PREFS,
  useColorSchemePreferences,
} from '@arcanejs/toolkit-frontend/util';
import { FrontendComponentRenderer } from '@arcanejs/toolkit-frontend/types';
import { startArcaneFrontend } from '@arcanejs/toolkit/frontend';
import {
  isThemeComponent,
  THEME_NAMESPACE,
  ThemeSwitchComponentProto,
} from './theme-proto';

const COLORFUL_DARK_THEME: Theme = {
  ...DARK_THEME,
  pageBg: '#0b1120',
  colorGreen: '#5eead4',
  colorRed: '#fb7185',
  colorAmber: '#fbbf24',
  bgDark1: '#111827',
  bg: '#172554',
  bgLight1: '#1d4ed8',
  borderDark: '#0f172a',
  borderLight: '#1e3a8a',
  borderLighter: '#2563eb',
  borderLighterer: '#38bdf8',
  hint: '#22d3ee',
  hintRGB: '34, 211, 238',
  hintDark1: '#0891b2',
  textNormal: '#e2e8f0',
  textActive: '#f8fafc',
  textMuted: '#a5b4fc',
  shadows: {
    boxShadowInset: 'inset 0px 0px 10px 0px rgba(15, 23, 42, 0.6)',
    textShadow: '0 -1px rgba(2, 6, 23, 0.8)',
    textShadowActive: '0 -1px rgba(8, 47, 73, 0.8)',
  },
  gradients: {
    button: 'linear-gradient(to bottom, #2563eb, #1d4ed8)',
    buttonHover: 'linear-gradient(to bottom, #3b82f6, #1e40af)',
    buttonActive: 'linear-gradient(to bottom, #1e3a8a, #1d4ed8)',
    buttonPressedHover: 'linear-gradient(to bottom, #0ea5e9, #2563eb)',
    hintPressed: 'linear-gradient(to bottom, #06b6d4, #0ea5e9)',
  },
  sizingPx: {
    spacing: 24,
    unitHeight: 48,
  },
};

const COLORFUL_LIGHT_THEME: Theme = {
  ...LIGHT_THEME,
  pageBg: '#f0f9ff',
  colorGreen: '#0f766e',
  colorRed: '#be123c',
  colorAmber: '#b45309',
  bgDark1: '#cffafe',
  bg: '#ffffff',
  bgLight1: '#e0f2fe',
  borderDark: '#7dd3fc',
  borderLight: '#38bdf8',
  borderLighter: '#bae6fd',
  borderLighterer: '#fef3c7',
  hint: '#0284c7',
  hintRGB: '2, 132, 199',
  hintDark1: '#0369a1',
  textNormal: '#0f172a',
  textActive: '#020617',
  textMuted: '#334155',
  shadows: {
    boxShadowInset: 'inset 0px 0px 8px 0px rgba(14, 116, 144, 0.12)',
    textShadow: '0 1px rgba(255, 255, 255, 0.85)',
    textShadowActive: '0 1px rgba(255, 255, 255, 0.7)',
  },
  gradients: {
    button: 'linear-gradient(to bottom, #38bdf8, #0ea5e9)',
    buttonHover: 'linear-gradient(to bottom, #67e8f9, #38bdf8)',
    buttonActive: 'linear-gradient(to bottom, #0284c7, #0ea5e9)',
    buttonPressedHover: 'linear-gradient(to bottom, #22d3ee, #38bdf8)',
    hintPressed: 'linear-gradient(to bottom, #0ea5e9, #38bdf8)',
  },
  sizingPx: {
    spacing: 24,
    unitHeight: 48,
  },
};

const ThemeSwitchCard = styled.div`
  background: linear-gradient(
    145deg,
    ${(p) => p.theme.bgLight1},
    ${(p) => p.theme.bg}
  );
  border: 1px solid ${(p) => p.theme.borderLighter};
  border-radius: 14px;
  padding: ${(p) => p.theme.sizingPx.spacing}px;
  margin-bottom: ${(p) => p.theme.sizingPx.spacing}px;
  display: grid;
  gap: 12px;
`;

const ThemeSwitchTitle = styled.div`
  font-weight: 700;
  color: ${(p) => p.theme.textActive};
`;

const ThemeSwitchButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ThemeModeSelect = styled.select`
  border-radius: 10px;
  border: 1px solid ${(p) => p.theme.borderDark};
  padding: 10px 12px;
  font-size: 13px;
  cursor: pointer;
  color: ${(p) => p.theme.textActive};
  background: ${(p) => p.theme.gradients.button};
`;

const ModeNote = styled.div`
  color: ${(p) => p.theme.textMuted};
  font-size: 12px;
`;

const ThemeSwitch: FC<{ info: ThemeSwitchComponentProto }> = () => {
  const { colorSchemePreference, setColorSchemePreference } =
    useColorSchemePreferences();

  return (
    <ThemeSwitchCard>
      <ThemeSwitchTitle>Appearance</ThemeSwitchTitle>
      <ThemeSwitchButtons>
        <ThemeModeSelect
          value={colorSchemePreference}
          onChange={(e) =>
            setColorSchemePreference(
              e.target.value as typeof colorSchemePreference,
            )
          }
        >
          {VALID_COLOR_SCHEME_PREFS.map((mode) => (
            <option key={mode} value={mode}>
              {mode === 'auto' ? 'Auto/System' : `${mode} mode`}
            </option>
          ))}
        </ThemeModeSelect>
      </ThemeSwitchButtons>
      <ModeNote>
        Active preference is <strong>{colorSchemePreference}</strong>. The
        preference is stored in local storage per browser.
      </ModeNote>
    </ThemeSwitchCard>
  );
};

const THEME_FRONTEND_COMPONENT_RENDERER: FrontendComponentRenderer = {
  namespace: THEME_NAMESPACE,
  render: (info): ReactElement => {
    if (!isThemeComponent(info)) {
      throw new Error(`Cannot render non-theme component ${info.namespace}`);
    }

    switch (info.component) {
      case 'theme-switch':
        return <ThemeSwitch key={info.key} info={info} />;
    }
  },
};

startArcaneFrontend({
  renderers: [
    CORE_FRONTEND_COMPONENT_RENDERER,
    THEME_FRONTEND_COMPONENT_RENDERER,
  ],
  themes: {
    dark: COLORFUL_DARK_THEME,
    light: COLORFUL_LIGHT_THEME,
  },
});
