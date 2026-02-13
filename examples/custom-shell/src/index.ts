import { readFile } from 'fs/promises';
import { join } from 'path';
import { Button, Group, Label, Toolkit } from '@arcanejs/toolkit';
import pino from 'pino';

const additionalFiles = {
  'custom-shell.css': async () => ({
    contentType: 'text/css; charset=utf-8',
    content: await readFile(join(__dirname, 'custom-shell.css')),
  }),
};

const toolkit = new Toolkit<typeof additionalFiles>({
  title: 'Arcane Custom Shell Example',
  path: '/custom-shell/',
  log: pino({
    transport: {
      target: 'pino-pretty',
    },
  }),
  additionalFiles,
  htmlPage: ({ title, coreAssets, assetUrls }) => `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${title}</title>
        <style>
          @font-face {
            font-family: 'Material Symbols Outlined';
            font-style: normal;
            src: url(${coreAssets.materialSymbolsOutlined}) format('woff');
          }
        </style>
        <link rel="stylesheet" href="${assetUrls['custom-shell.css']}">
      </head>
      <body>
        <h1 class="custom-shell-header">ArcaneJS Custom Shell</h1>
        <div id="root"></div>
        <script type="text/javascript" src="${coreAssets.entrypointJs}"></script>
      </body>
    </html>
  `,
});

toolkit.start({
  mode: 'automatic',
  port: 3000,
  onReady: (url) => {
    console.log(`Custom shell example running at ${url}`);
  },
});

const root = new Group({
  direction: 'vertical',
  title: 'Controls',
});

const clicksLabel = new Label({ text: 'Clicks: 0' });
const button = new Button({
  text: 'Click me',
  icon: 'touch_app',
});

let clicks = 0;
button.addListener('click', () => {
  clicks += 1;
  clicksLabel.setText(`Clicks: ${clicks}`);
});

root.appendChildren(clicksLabel, button);
toolkit.setRoot(root);
