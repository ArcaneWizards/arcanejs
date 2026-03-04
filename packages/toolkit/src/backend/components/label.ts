import * as proto from '@arcanejs/protocol/core';
import { LabelComponentStyle } from '@arcanejs/protocol/styles';
import { IDMap } from '../util/id-map';

import { Base } from './base';
import type { ToolkitRenderContext } from '../toolkit';

type InternalProps = LabelComponentStyle & {
  text: string | null;
};

export type Props = InternalProps;

/**
 * A simple text component. Could be used to label components in a desk, or for
 * more dynamic purposes such as displaying the status of something.
 *
 * ![](media://images/label_screenshot.png)
 */
export class Label extends Base<
  proto.CoreNamespace,
  proto.LabelComponent,
  InternalProps
> {
  public constructor(props?: Props) {
    super({ text: null }, props);
  }

  /** @hidden */
  public getProtoInfo(
    idMap: IDMap,
    _context: ToolkitRenderContext,
  ): proto.LabelComponent {
    return {
      namespace: 'core',
      component: 'label',
      key: idMap.getId(this),
      bold: this.props.bold,
      text: this.props.text ?? '',
    };
  }

  public setText(text: string): Label {
    this.updateProps({
      text,
    });
    return this;
  }
}
