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
 * Prepare all available static files lazily,
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
  private staticFiles: PreparedStaticFiles | null = null;
  private htmlContext: ToolkitHtmlPageContext<TAdditionalFiles> | null = null;
  private staticFilesInitPromise: Promise<void> | null = null;
  private readonly title: string;

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
    this.title = options.title ?? '@arcanejs';
  }

  private getEntrypointPaths = () => {
    const entrypoint =
      this.options.entrypointJsFile ??
      path.join(distDir(), 'frontend', 'entrypoint.js');
    if (!entrypoint.endsWith('.js')) {
      throw new Error('Entrypoint file must be a .js file');
    }
    const entrypointMap = entrypoint + '.map';
    const entrypointCss = entrypoint.replace(/\.js$/, '.css');
    const entrypointCssMap = entrypointCss + '.map';
    return {
      entrypoint,
      entrypointMap,
      entrypointCss,
      entrypointCssMap,
      entrypointFilename: path.basename(entrypoint),
      entrypointMapFilename: path.basename(entrypointMap),
      entrypointCssFilename: path.basename(entrypointCss),
      entrypointCssMapFilename: path.basename(entrypointCssMap),
    };
  };

  private fileExists = async (filePath: string): Promise<boolean> => {
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  };

  private ensureStaticFilesInitialized = async (): Promise<void> => {
    if (this.staticFiles && this.htmlContext) return;
    if (this.staticFilesInitPromise) return this.staticFilesInitPromise;

    this.staticFilesInitPromise = (async () => {
      const {
        entrypoint,
        entrypointMap,
        entrypointCss,
        entrypointCssMap,
        entrypointFilename,
        entrypointMapFilename,
        entrypointCssFilename,
        entrypointCssMapFilename,
      } = this.getEntrypointPaths();
      const [hasEntrypointMap, hasEntrypointCss, hasEntrypointCssMap] =
        await Promise.all([
          this.fileExists(entrypointMap),
          this.fileExists(entrypointCss),
          this.fileExists(entrypointCssMap),
        ]);

      const staticFilePaths = {
        materialSymbolsOutlined: FONTS.materialSymbolsOutlined,
        entrypointJs: entrypointFilename,
        ...(hasEntrypointMap ? { entrypointJsMap: entrypointMapFilename } : {}),
        ...(hasEntrypointCss ? { entrypointCss: entrypointCssFilename } : {}),
        ...(hasEntrypointCssMap
          ? { entrypointCssMap: entrypointCssMapFilename }
          : {}),
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
        ...(hasEntrypointMap
          ? {
              [this.toRoutePath(entrypointMapFilename)]: async () => ({
                content: await fs.promises.readFile(entrypointMap),
                contentType: 'text/plain',
              }),
            }
          : {}),
        ...(hasEntrypointCss
          ? {
              [this.toRoutePath(entrypointCssFilename)]: async () => ({
                content: await fs.promises.readFile(entrypointCss),
                contentType: 'text/css',
              }),
            }
          : {}),
        ...(hasEntrypointCssMap
          ? {
              [this.toRoutePath(entrypointCssMapFilename)]: async () => ({
                content: await fs.promises.readFile(entrypointCssMap),
                contentType: 'text/plain',
              }),
            }
          : {}),
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
          entrypointJsMap: hasEntrypointMap
            ? this.toSiteRelativeUrl(entrypointMapFilename)
            : null,
          entrypointCss: hasEntrypointCss
            ? this.toSiteRelativeUrl(entrypointCssFilename)
            : null,
          entrypointCssMap: hasEntrypointCssMap
            ? this.toSiteRelativeUrl(entrypointCssMapFilename)
            : null,
        },
        assetUrls: this.createAssetUrls(this.staticFiles),
      } as ToolkitHtmlPageContext<TAdditionalFiles>;

      this.log?.debug('Static Assets: %o', this.staticFiles);
    })();

    this.staticFilesInitPromise.catch(() => {
      this.staticFilesInitPromise = null;
      this.staticFiles = null;
      this.htmlContext = null;
    });
    return this.staticFilesInitPromise;
  };

  public handleHttpRequest = async (
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ): Promise<void> => {
    try {
      await this.ensureStaticFilesInitialized();
    } catch (err) {
      if (err instanceof Error) {
        this.log?.error(err);
      } else {
        this.log?.error('Error preparing static files: %o', err);
      }
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Unable to prepare static files', 'utf-8');
      return;
    }
    const htmlContext = this.htmlContext;
    const staticFiles = this.staticFiles;
    if (!htmlContext || !staticFiles) {
      throw new Error('Static assets were not initialized');
    }

    const requestUrl =
      (req as http.IncomingMessage & { originalUrl?: string }).originalUrl ??
      req.url;
    this.log?.debug('handleHttpRequest %s', requestUrl);
    const pathname = this.parsePathname(requestUrl);
    if (pathname === this.options.path) {
      const content =
        (await this.options.htmlPage?.(htmlContext)) ??
        `
          <html>
            <head>
              <title>${escapeHTML(htmlContext.title)}</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style type="text/css">
                @font-face {
                  font-family: 'Material Symbols Outlined';
                  font-style: normal;
                  src: url(${htmlContext.coreAssets.materialSymbolsOutlined}) format('woff');
                }
              </style>
              ${
                htmlContext.coreAssets.entrypointCss
                  ? `<link rel="stylesheet" href="${htmlContext.coreAssets.entrypointCss}" />`
                  : ''
              }
            </head>
            <body>
              <div id="root"></div>
              <script type="text/javascript" src="${htmlContext.coreAssets.entrypointJs}"></script>
            </body>
          </html>`;
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content, 'utf-8');
      return;
    }
    if (pathname && pathname.startsWith(this.options.path)) {
      const relativePath = pathname.substr(this.options.path.length - 1);
      const f = staticFiles[relativePath];
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

  private createAssetUrls = (
    staticFiles: PreparedStaticFiles,
  ): ToolkitHtmlPageContext<TAdditionalFiles>['assetUrls'] => {
    const urls = {} as ToolkitHtmlPageContext<TAdditionalFiles>['assetUrls'];
    for (const routePath of Object.keys(staticFiles)) {
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
