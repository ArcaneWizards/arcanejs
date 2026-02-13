import type * as http from 'http';

import type { Application } from 'express';
import { Server } from './server';
import { Logger } from '@arcanejs/protocol/logging';
import { FONTS } from '../shared/static';

export type ToolkitStaticFile = {
  contentType: string;
  content: Buffer;
};

export type ToolkitStaticFileResolver = () => Promise<ToolkitStaticFile>;

export type ToolkitAdditionalFiles = Record<string, ToolkitStaticFileResolver>;

export type ToolkitCoreAssetRelativePath =
  | typeof FONTS.materialSymbolsOutlined
  | `${string}.js`
  | `${string}.js.map`
  | `${string}.css`;

export type ToolkitHtmlPageContext<
  TAdditionalFiles extends ToolkitAdditionalFiles,
> = {
  title: string;
  path: string;
  coreAssets: {
    materialSymbolsOutlined: string;
    entrypointJs: string;
    entrypointJsMap: string;
    entrypointCss: string | null;
  };
  assetUrls: Record<
    ToolkitCoreAssetRelativePath | Extract<keyof TAdditionalFiles, string>,
    string
  >;
};

export interface ToolkitOptions<
  TAdditionalFiles extends ToolkitAdditionalFiles = Record<never, never>,
> {
  /**
   * What window title should the toolkit be initialized with?
   */
  title?: string;
  /**
   * What path should be used to serve the light desk.
   *
   * This is important if a express server will be used that serves other paths.
   */
  path: string;
  /**
   * An optional object that can be used to output log events,
   * we recommend using `pino` for this,
   * as log levels etc... can be controlled.
   *
   * You can also always use `console` for logging,
   * but this will be quite verbose.
   */
  log?: Logger;
  /**
   * The entrypoint file that should be used to serve the light desk.
   *
   * This is only needed if you have defined custom extensions,
   * and need to load custom frontend code that includes your extensions.
   *
   * This will allow access to both the js file and the `.js.map` file,
   * that matches this name.
   */
  entrypointJsFile?: string;
  /**
   * If it's not possible to automatically resolve and import the
   * material-symbols package in node_modules
   * (for example when bundling an electron app),
   * you can provide the path to the material-symbols-outlined.woff2 file here.
   */
  materialIconsFontFile?: string;
  /**
   * Additional static assets that should be exposed from the toolkit path.
   *
   * The object key is the relative request path (for example `styles/app.css`),
   * and the loader returns the response payload and content type.
   */
  additionalFiles?: TAdditionalFiles;
  /**
   * Optional custom HTML renderer for the root page.
   *
   * Receives resolved site-relative URLs for all available static assets,
   * including toolkit defaults and files provided by `additionalFiles`.
   */
  htmlPage?: (
    context: ToolkitHtmlPageContext<TAdditionalFiles>,
  ) => string | Promise<string>;
}

export const DEFAULT_LIGHT_DESK_OPTIONS: ToolkitOptions = {
  path: '/',
};

export type InitializationOptions<
  TAdditionalFiles extends ToolkitAdditionalFiles = Record<never, never>,
> =
  /** automatically start a simple  */
  | {
      mode: 'automatic';
      port: number;
      /**
       * Optional callback that is called when the server is ready,
       * with the url that the server is running on.
       */
      onReady?: (url: string) => void;
    }
  /** Create a websocket server that attaches to an existing express and http server */
  | { mode: 'express'; express: Application; server: http.Server }
  /** Create a websocket server that attaches to an existing express and http server */
  | { mode: 'manual'; setup: (server: Server<TAdditionalFiles>) => void };
