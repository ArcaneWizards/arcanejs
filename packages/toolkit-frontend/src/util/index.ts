import { useEffect, useState } from 'react';

export * from './touch';

// TODO: move this to a new core-frontend library
export const cn = (...args: (string | undefined | null | false)[]): string =>
  args.filter((a) => !!a).join(' ');

// Backward-compatibility alias; prefer `cn`.
export const calculateClass = cn;

const COLOR_SCHEME_SETTINGS = 'arcane-color-scheme-preference';
export const VALID_COLOR_SCHEME_PREFS = ['auto', 'dark', 'light'] as const;
type ColorSchemePreference = (typeof VALID_COLOR_SCHEME_PREFS)[number];

const isValidColorSchemePreference = (
  value: string | null,
): value is ColorSchemePreference => {
  return VALID_COLOR_SCHEME_PREFS.includes(value as ColorSchemePreference);
};

export const useColorSchemePreferences = () => {
  if (typeof window === 'undefined') {
    return {
      colorSchemePreference: 'auto' as ColorSchemePreference,
      setColorSchemePreference: () => {
        /* no-op on server */
      },
    };
  }

  const [preference, setPreference] = useState<ColorSchemePreference>(
    (window.localStorage.getItem(
      COLOR_SCHEME_SETTINGS,
    ) as ColorSchemePreference) || 'auto',
  );

  const setColorSchemePreference = (newPreference: ColorSchemePreference) => {
    if (!isValidColorSchemePreference(newPreference)) {
      throw new Error(`Invalid color scheme preference: ${newPreference}`);
    }
    window.localStorage.setItem(COLOR_SCHEME_SETTINGS, newPreference);
    // Broadcast event for this tab
    // We do this rather than call `setPreference` directly so that
    // all hooks stay in sync via the storage event listener
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: COLOR_SCHEME_SETTINGS,
        newValue: newPreference,
      }),
    );
  };

  useEffect(() => {
    const onStorageChange = (event: StorageEvent) => {
      if (event.key === COLOR_SCHEME_SETTINGS) {
        const newValue = event.newValue;
        if (isValidColorSchemePreference(newValue)) {
          setPreference(newValue);
        }
      }
    };

    window.addEventListener('storage', onStorageChange);

    return () => {
      window.removeEventListener('storage', onStorageChange);
    };
  }, []);

  return {
    colorSchemePreference: isValidColorSchemePreference(preference)
      ? preference
      : 'auto',
    setColorSchemePreference,
  };
};

export const usePreferredColorScheme = (): 'dark' | 'light' => {
  const { colorSchemePreference } = useColorSchemePreferences();
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setTheme(mediaQuery.matches ? 'dark' : 'light');

      const handleChange = (event: MediaQueryListEvent) => {
        setTheme(event.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);

      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, []);

  return colorSchemePreference === 'auto' ? theme : colorSchemePreference;
};
