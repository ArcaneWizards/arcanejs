import { startArcaneFrontend } from '@arcanejs/toolkit/frontend';
import { CORE_FRONTEND_COMPONENT_RENDERER } from '@arcanejs/toolkit-frontend';
import { DARK_THEME, LIGHT_THEME } from '@arcanejs/toolkit-frontend/styling';

const vibrantDarkTheme = {
  ...DARK_THEME,
  pageBg: '#12002b',
  bgDark1: '#1e0a3c',
  bg: '#2d1457',
  bgLight1: '#44227a',
  borderDark: '#00d1ff',
  borderLight: '#ff66c4',
  borderLighter: '#ffa600',
  borderLighterer: '#7aff66',
  hint: '#00e5ff',
  hintRGB: '0, 229, 255',
  hintDark1: '#00b8d4',
  colorGreen: '#7aff66',
  colorRed: '#ff5f9e',
  colorAmber: '#ffd166',
  textNormal: '#f8f3ff',
  textActive: '#ffffff',
  textMuted: '#cdb7f8',
  gradients: {
    button: 'linear-gradient(to bottom, #ff4ecd, #8f49ff)',
    buttonHover: 'linear-gradient(to bottom, #ff75db, #a76eff)',
    buttonActive: 'linear-gradient(to bottom, #7d3ce8, #ff3fb8)',
    buttonPressedHover: 'linear-gradient(to bottom, #a74fff, #ff61cc)',
    hintPressed: 'linear-gradient(to bottom, #00b8d4, #00e5ff)',
  },
};

const vibrantLightTheme = {
  ...LIGHT_THEME,
  pageBg: '#fff7fb',
  bgDark1: '#ffe0f2',
  bg: '#fff0f9',
  bgLight1: '#fff9e6',
  borderDark: '#ff66c4',
  borderLight: '#00b8d4',
  borderLighter: '#ffd166',
  borderLighterer: '#7aff66',
  hint: '#9b5de5',
  hintRGB: '155, 93, 229',
  hintDark1: '#7e3fd2',
  colorGreen: '#2dbd6e',
  colorRed: '#d7267b',
  colorAmber: '#d98b00',
  textNormal: '#4a245e',
  textActive: '#2f163d',
  textMuted: '#9b7aad',
  gradients: {
    button: 'linear-gradient(to bottom, #ffc1e8, #c5b3ff)',
    buttonHover: 'linear-gradient(to bottom, #ffdbf1, #d8caff)',
    buttonActive: 'linear-gradient(to bottom, #e1cdfd, #ffb0de)',
    buttonPressedHover: 'linear-gradient(to bottom, #f1ddff, #ffc6e6)',
    hintPressed: 'linear-gradient(to bottom, #7e3fd2, #9b5de5)',
  },
};

startArcaneFrontend({
  renderers: [CORE_FRONTEND_COMPONENT_RENDERER],
  themes: {
    dark: vibrantDarkTheme,
    light: vibrantLightTheme,
  },
});
