import path from 'path';
import pino from 'pino';
import { useState, useRef } from 'react';
import { Toolkit } from '@arcanejs/toolkit';

import {
  CoreComponents,
  Button,
  Group,
  GroupHeader,
  ToolkitRenderer,
  prepareComponents,
} from '@arcanejs/react-toolkit';
import { AnyComponent, BaseParent } from '@arcanejs/toolkit/components/base';
import { IDMap } from '@arcanejs/toolkit/util';
import {
  CustomComponentCalls,
  isCustomComponentCall,
  isCustomComponentMessage,
  StopwatchComponentProto,
} from './custom-proto';
import {
  AnyClientComponentCall,
  AnyClientComponentMessage,
} from '@arcanejs/protocol';

const toolkit = new Toolkit({
  log: pino({
    level: 'debug',
    transport: {
      target: 'pino-pretty',
    },
  }),
  entrypointJsFile: path.resolve(__dirname, '../dist/custom-entrypoint.js'),
});

toolkit.start({
  mode: 'automatic',
  port: 1330,
});

type StopwatchProps = {
  timeOffsetSeconds: number;
};

class Stopwatch extends BaseParent<
  'custom',
  StopwatchComponentProto,
  StopwatchProps,
  CustomComponentCalls,
  'request-time'
> {
  private state: StopwatchComponentProto['state'] = {
    type: 'stopped',
    timeMillis: 0,
  };

  public getProtoInfo(idMap: IDMap): StopwatchComponentProto {
    return {
      namespace: 'custom',
      component: 'stopwatch',
      key: idMap.getId(this),
      state:
        this.state.type === 'started'
          ? {
              type: 'started',
              startedAt:
                this.state.startedAt - this.props.timeOffsetSeconds * 1000,
            }
          : {
              type: 'stopped',
              timeMillis:
                this.state.timeMillis + this.props.timeOffsetSeconds * 1000,
            },
      child:
        this.getChildren()
          .slice(0, 1)
          .map((c) => c.getProtoInfo(idMap))[0] ?? null,
    };
  }

  /** @hidden */
  public handleMessage = (message: AnyClientComponentMessage) => {
    if (isCustomComponentMessage(message, 'stopwatch')) {
      if (message.button === 'start-stop') {
        if (this.state.type === 'stopped') {
          this.state = {
            type: 'started',
            startedAt: Date.now() - this.state.timeMillis,
          };
        } else {
          this.state = {
            type: 'stopped',
            timeMillis: Date.now() - this.state.startedAt,
          };
        }
        this.updateTree();
      }
    }
  };

  /** @hidden */
  public handleCall = async (call: AnyClientComponentCall) => {
    if (isCustomComponentCall(call, 'request-time')) {
      const timeString =
        this.state.type === 'stopped'
          ? `${this.state.timeMillis / 1000}`
          : `${(Date.now() - this.state.startedAt) / 1000}`;
      return `The time is now: ${timeString}`;
    }
    throw new Error(`Unhandled call action: ${call.action}`);
  };

  public validateChildren = (children: AnyComponent[]) => {
    if (children.length > 1) {
      throw new Error('Tab can only have one child');
    }
  };

  public reset = () => {
    this.state = {
      type: 'stopped',
      timeMillis: 0,
    };
    this.updateTree();
  };
}

const C = prepareComponents('custom', {
  Stopwatch,
});

const App = () => {
  const [offset, setOffset] = useState(0);
  const stopwatchRef = useRef<Stopwatch>(null);

  return (
    <Group title="Some custom component is in here">
      <GroupHeader>
        <Button
          text="Add time"
          onClick={() => setOffset((current) => current + 1)}
        />
        <Button
          text="Remove time"
          onClick={() => setOffset((current) => current - 1)}
        />
      </GroupHeader>
      {`Time Offset: ${offset} seconds`}
      <C.Stopwatch ref={stopwatchRef} timeOffsetSeconds={offset}>
        <Button text="Reset" onClick={() => stopwatchRef.current?.reset()} />
      </C.Stopwatch>
    </Group>
  );
};

ToolkitRenderer.render(
  <App />,
  toolkit,
  {},
  {
    componentNamespaces: [CoreComponents, C],
  },
);
