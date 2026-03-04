import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as esbuild from 'esbuild';
import { PluginItem, transformAsync } from '@babel/core';
import babelPresetReact from '@babel/preset-react';
import babelPresetTypescript from '@babel/preset-typescript';
import babelPluginReactCompiler from 'babel-plugin-react-compiler';

export type ArcaneFrontendBuildOptions = {
  entry: string;
  outfile: string;
  cwd?: string;
  sourcemap?: boolean;
  minify?: boolean;
  conditions?: string[];
  define?: Record<string, string>;
  logLevel?: esbuild.LogLevel;
  reactCompiler?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reactCompilerOptions?: Record<string, any>;
};

const FRONTEND_SOURCE_FILTER = /\.[cm]?[jt]sx?$/;

const createReactCompilerPlugin = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reactCompilerOptions?: Record<string, any>,
): esbuild.Plugin => ({
  name: 'arcane-react-compiler',
  setup(build) {
    build.onLoad({ filter: FRONTEND_SOURCE_FILTER }, async (args) => {
      if (
        args.path.includes(`${path.sep}node_modules${path.sep}`) ||
        args.path.endsWith('.d.ts')
      ) {
        return null;
      }

      const source = await fs.readFile(args.path, 'utf8');
      const ext = path.extname(args.path);
      const isTypeScriptSource =
        ext === '.ts' || ext === '.tsx' || ext === '.mts' || ext === '.cts';
      const transformed = await transformAsync(source, {
        filename: args.path,
        babelrc: false,
        configFile: false,
        sourceMaps: false,
        sourceType: 'module',
        presets: [
          ...(isTypeScriptSource
            ? [
                [
                  babelPresetTypescript,
                  {
                    isTSX: ext === '.tsx',
                    allExtensions: true,
                  },
                ] as const,
              ]
            : []),
          [
            babelPresetReact,
            {
              runtime: 'automatic',
              development: false,
            },
          ],
        ],
        plugins: [
          [babelPluginReactCompiler as PluginItem, reactCompilerOptions ?? {}],
        ],
      });

      if (!transformed?.code) {
        throw new Error(
          `React Compiler did not produce output for ${args.path}`,
        );
      }

      return {
        contents: transformed.code,
        loader: 'js',
        resolveDir: path.dirname(args.path),
      };
    });
  },
});

const createBuildOptions = (
  options: ArcaneFrontendBuildOptions,
): esbuild.BuildOptions => {
  const cwd = options.cwd ?? process.cwd();
  const reactCompiler = options.reactCompiler ?? true;

  return {
    absWorkingDir: cwd,
    entryPoints: [path.resolve(cwd, options.entry)],
    outfile: path.resolve(cwd, options.outfile),
    bundle: true,
    platform: 'browser',
    format: 'iife',
    sourcemap: options.sourcemap ?? true,
    minify: options.minify ?? false,
    logLevel: options.logLevel ?? 'info',
    conditions: options.conditions,
    define: options.define,
    plugins: reactCompiler
      ? [createReactCompilerPlugin(options.reactCompilerOptions)]
      : [],
  };
};

export const buildArcaneFrontend = async (
  options: ArcaneFrontendBuildOptions,
): Promise<esbuild.BuildResult> => {
  return esbuild.build(createBuildOptions(options));
};

export const watchArcaneFrontend = async (
  options: ArcaneFrontendBuildOptions,
): Promise<esbuild.BuildContext> => {
  const context = await esbuild.context(createBuildOptions(options));
  await context.watch();
  return context;
};
