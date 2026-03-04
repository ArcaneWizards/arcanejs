import { type FC, type ReactElement } from 'react';
import { CORE_FRONTEND_COMPONENT_RENDERER } from '@arcanejs/toolkit-frontend';
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

const ThemeSwitch: FC<{ info: ThemeSwitchComponentProto }> = () => {
  const { colorSchemePreference, setColorSchemePreference } =
    useColorSchemePreferences();

  return (
    <div className="mb-2 grid gap-theme-switch-card-gap rounded-theme-switch-card border border-theme-switch-card-border bg-theme-switch-card p-arcane">
      <div className="font-bold text-theme-switch-text-active">Appearance</div>
      <div className="flex items-center gap-theme-switch-row-gap">
        <select
          className="cursor-pointer rounded-theme-switch-select border border-theme-switch-select-border bg-arcane-grad-btn px-theme-switch-select-x py-theme-switch-select-y text-theme-switch-select text-theme-switch-text-active shadow-arcane-btn text-shadow-arcane-btn"
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
      <div className="text-theme-switch-note text-arcane-text-muted">
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
