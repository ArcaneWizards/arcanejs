import { BaseComponentProto } from '@arcanejs/protocol';
import { type ReactElement } from 'react';

export type FrontendComponentRenderer = {
  namespace: string;
  render: (component: BaseComponentProto<string, string>) => ReactElement;
};

export type FrontendComponentRenderers = FrontendComponentRenderer[];
