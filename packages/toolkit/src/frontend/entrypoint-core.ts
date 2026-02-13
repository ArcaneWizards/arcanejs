import { CORE_FRONTEND_COMPONENT_RENDERER } from '@arcanejs/toolkit-frontend';
import '@arcanejs/toolkit-frontend/styles/core.css';
import { startArcaneFrontend } from '.';

startArcaneFrontend({
  renderers: [CORE_FRONTEND_COMPONENT_RENDERER],
});
