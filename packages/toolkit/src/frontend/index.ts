import { createRoot } from 'react-dom/client';

import { initialiseListeners } from '@arcanejs/toolkit-frontend/util';

import { rootComponent, Props as RootProps } from './stage';

export type ArcaneFrontendOptions = Pick<
  RootProps,
  'renderers' | 'themeRootProps' | 'loadingState'
>;

export const startArcaneFrontend = (opts: ArcaneFrontendOptions) => {
  initialiseListeners();

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  const root = createRoot(rootElement);
  root.render(rootComponent(opts));
};
