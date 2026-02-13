import { type FC, type ReactElement } from 'react';
import { CORE_FRONTEND_COMPONENT_RENDERER } from '@arcanejs/toolkit-frontend';
import '@arcanejs/toolkit-frontend/styles/core.css';
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
import './theme-switch.css';
import './theme-colors.css';

const ThemeSwitch: FC<{ info: ThemeSwitchComponentProto }> = () => {
  const { colorSchemePreference, setColorSchemePreference } =
    useColorSchemePreferences();

  return (
    <div className="theme-switch-card">
      <div className="theme-switch-title">Appearance</div>
      <div className="theme-switch-buttons">
        <select
          className="theme-mode-select"
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
        </select>
      </div>
      <div className="theme-mode-note">
        Active preference is <strong>{colorSchemePreference}</strong>. The
        preference is stored in local storage per browser.
      </div>
    </div>
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
});
