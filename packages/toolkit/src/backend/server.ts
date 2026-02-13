import * as http from 'http';
import { WebSocket } from 'ws';
import * as fs from 'fs';
import * as path from 'path';
import type { ClientMessage, ServerMessage } from '@arcanejs/protocol';
import type { Logger } from '@arcanejs/protocol/logging';
import escapeHTML from 'escape-html';

import {
  ToolkitAdditionalFiles,
  ToolkitHtmlPageContext,
  ToolkitOptions,
  ToolkitStaticFile,
} from './options.js';
import { FONTS } from '../shared/static.js';

// Get the module resolution custom conditions
const parentDir = path.basename(__dirname);

const distDir = () => {
  switch (parentDir) {
    case 'backend':
      return path.resolve(__dirname, '../../dist');
    case 'dist':
      return __dirname;
    default:
      throw new Error(`Server running from unknown location: ${__dirname}`);
  }
};

/**
 * Prepare all available static files at startup,
 * to avoid any risk of directory traversal attacks.
 */
type PreparedStaticFiles = {
  [id: string]: () => Promise<ToolkitStaticFile>;
};

export interface Connection {
  sendMessage(msg: ServerMessage): void;
}

export class Server<
  TAdditionalFiles extends ToolkitAdditionalFiles = Record<never, never>,
> {
  private readonly staticFiles: PreparedStaticFiles;
  private readonly htmlContext: ToolkitHtmlPageContext<TAdditionalFiles>;
  private title: string;

  public constructor(
    private readonly options: ToolkitOptions<TAdditionalFiles>,
    private readonly onNewConnection: (connection: Connection) => void,
    private readonly onClosedConnection: (connection: Connection) => void,
    private readonly onMessage: (
      connection: Connection,
      message: ClientMessage,
    ) => void,
    private readonly log?: Logger,
  ) {
    const entrypoint =
      this.options.entrypointJsFile ??
      path.join(distDir(), 'frontend', 'entrypoint.js');
    if (!entrypoint.endsWith('.js')) {
      throw new Error('Entrypoint file must be a .js file');
    }
    const entrypointMap = entrypoint + '.map';
    const entrypointFilename = path.basename(entrypoint);
    const entrypointMapFilename = path.basename(entrypointMap);
    this.title = options.title ?? '@arcanejs';
    const staticFilePaths = {
      materialSymbolsOutlined: FONTS.materialSymbolsOutlined,
      entrypointJs: entrypointFilename,
      entrypointJsMap: entrypointMapFilename,
    };
    const additionalFiles =
      this.options.additionalFiles ?? ({} as TAdditionalFiles);
    const additionalFileEntries = Object.entries(additionalFiles).map(
      ([relativePath, loader]) =>
        [
          this.toRoutePath(relativePath),
          async () => {
            const asset = await loader();
            if (!Buffer.isBuffer(asset.content)) {
              throw new Error(
                `Additional file "${relativePath}" did not return a Buffer in content`,
              );
            }
            return asset;
          },
        ] as const,
    );

    this.staticFiles = {
      [this.toRoutePath(staticFilePaths.materialSymbolsOutlined)]:
        async () => ({
          content: await fs.promises.readFile(
            this.options.materialIconsFontFile ??
              require.resolve(
                'material-symbols/material-symbols-outlined.woff2',
              ),
          ),
          contentType: 'font/woff2',
        }),
      [this.toRoutePath(staticFilePaths.entrypointJs)]: async () => ({
        content: await fs.promises.readFile(entrypoint),
        contentType: 'text/javascript',
      }),
      [this.toRoutePath(staticFilePaths.entrypointJsMap)]: async () => ({
        content: await fs.promises.readFile(entrypointMap),
        contentType: 'text/plain',
      }),
      ...Object.fromEntries(additionalFileEntries),
    };
    this.htmlContext = {
      title: this.title,
      path: this.options.path,
      coreAssets: {
        materialSymbolsOutlined: this.toSiteRelativeUrl(
          staticFilePaths.materialSymbolsOutlined,
        ),
        entrypointJs: this.toSiteRelativeUrl(staticFilePaths.entrypointJs),
        entrypointJsMap: this.toSiteRelativeUrl(
          staticFilePaths.entrypointJsMap,
        ),
      },
      assetUrls: this.createAssetUrls(),
    } as ToolkitHtmlPageContext<TAdditionalFiles>;

    log?.debug('Static Assets: %o', this.staticFiles);
  }

  public handleHttpRequest = async (
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ): Promise<void> => {
    const requestUrl =
      (req as http.IncomingMessage & { originalUrl?: string }).originalUrl ??
      req.url;
    this.log?.debug('handleHttpRequest %s', requestUrl);
    const pathname = this.parsePathname(requestUrl);
    if (pathname === this.options.path) {
      const content =
        (await this.options.htmlPage?.(this.htmlContext)) ??
        `
          <html>
            <head>
              <title>${escapeHTML(this.htmlContext.title)}</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style type="text/css">
                @font-face {
                  font-family: 'Material Symbols Outlined';
                  font-style: normal;
                  src: url(${this.htmlContext.coreAssets.materialSymbolsOutlined}) format('woff');
                }
              </style>
            </head>
            <body>
              <div id="root"></div>
              <script type="text/javascript" src="${this.htmlContext.coreAssets.entrypointJs}"></script>
            </body>
          </html>`;
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content, 'utf-8');
      return;
    }
    if (pathname && pathname.startsWith(this.options.path)) {
      const relativePath = pathname.substr(this.options.path.length - 1);
      const f = this.staticFiles[relativePath];
      if (f) {
        try {
          const response = await f();
          res.writeHead(200, { 'Content-Type': response.contentType });
          res.end(response.content);
          return;
        } catch (err) {
          if (err instanceof Error) {
            this.log?.error(err);
          } else {
            this.log?.error('Error loading static file: %o', err);
          }
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Expected static file not found', 'utf-8');
          return;
        }
      }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('not found', 'utf-8');
  };

  private parsePathname = (url?: string): string => {
    if (!url) return '';
    try {
      return new URL(url, 'http://127.0.0.1').pathname;
    } catch {
      return url;
    }
  };

  private toRoutePath = (relativePath: string): string => {
    if (!relativePath) {
      throw new Error('Static file path must be non-empty');
    }
    if (relativePath.startsWith('/')) {
      throw new Error(
        `Static file path "${relativePath}" must be relative and not start with "/"`,
      );
    }
    return `/${relativePath}`;
  };

  private toSiteRelativeUrl = (relativePath: string): string => {
    const normalizedPath = relativePath.replace(/^\/+/, '');
    return `${this.options.path}${normalizedPath}`;
  };

  private createAssetUrls =
    (): ToolkitHtmlPageContext<TAdditionalFiles>['assetUrls'] => {
      const urls = {} as ToolkitHtmlPageContext<TAdditionalFiles>['assetUrls'];
      for (const routePath of Object.keys(this.staticFiles)) {
        const relativePath = routePath.replace(/^\/+/, '');
        urls[relativePath as keyof typeof urls] = this.toSiteRelativeUrl(
          relativePath,
        ) as (typeof urls)[keyof typeof urls];
      }
      return urls;
    };

  public handleWsConnection = <S extends WebSocket>(ws: S) => {
    const connection: Connection = {
      sendMessage: (msg) => ws.send(JSON.stringify(msg)),
    };
    this.onNewConnection(connection);
    this.log?.debug('new connection');
    ws.on('message', (msg) =>
      this.onMessage(connection, JSON.parse(msg.toString())),
    );
    ws.on('close', () => this.onClosedConnection(connection));
  };
}
