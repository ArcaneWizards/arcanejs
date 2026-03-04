declare module '@babel/core' {
  export type PluginItem = unknown;

  export function transformAsync(
    source: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: Record<string, any>,
  ): Promise<{ code?: string } | null>;
}

declare module 'babel-plugin-react-compiler' {
  const plugin: unknown;
  export default plugin;
}

declare module '@babel/preset-react' {
  const preset: unknown;
  export default preset;
}

declare module '@babel/preset-typescript' {
  const preset: unknown;
  export default preset;
}
