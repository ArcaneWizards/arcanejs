import {
  CORE_FRONTEND_COMPONENT_RENDERER,
  StageContext,
} from '@arcanejs/toolkit-frontend';
import { FrontendComponentRenderer } from '@arcanejs/toolkit-frontend/types';
import { startArcaneFrontend } from '@arcanejs/toolkit/frontend';
import {
  CustomComponentCalls,
  isCustomComponent,
  StopwatchComponentProto,
  StopwatchPressMessage,
} from './custom-proto';
import { useContext, useEffect, useState } from 'react';
import {
  useColorSchemePreferences,
  usePressable,
  VALID_COLOR_SCHEME_PREFS,
} from '@arcanejs/toolkit-frontend/util';

const display = (time: StopwatchComponentProto['state']) => {
  if (time.type === 'stopped') {
    return `${time.timeMillis / 1000}`;
  } else {
    return `${(Date.now() - time.startedAt) / 1000}`;
  }
};

const Stopwatch: React.FC<{ info: StopwatchComponentProto }> = ({ info }) => {
  const {
    sendMessage,
    call,
    renderComponent,
    connectionUuid,
    connection,
    reconnect,
  } = useContext(StageContext);
  const { colorSchemePreference, setColorSchemePreference } =
    useColorSchemePreferences();
  const { handlers } = usePressable(() =>
    sendMessage<StopwatchPressMessage>?.({
      type: 'component-message',
      namespace: 'custom',
      componentKey: info.key,
      component: 'stopwatch',
      button: 'start-stop',
    }),
  );
  const { handlers: callHandler } = usePressable(() =>
    call<'custom', CustomComponentCalls, 'request-time'>?.({
      type: 'component-call',
      namespace: 'custom',
      componentKey: info.key,
      action: 'request-time',
    }).then((time) => {
      alert(`Response: ${time}`);
    }),
  );

  const { handlers: reconnectHandler } = usePressable(reconnect);

  const [timeDisplay, setDimeDisplay] = useState(display(info.state));

  useEffect(() => {
    setDimeDisplay(display(info.state));
    if (info.state.type === 'started') {
      let requestedFrame: number;
      const updateDisplay = () => {
        setDimeDisplay(display(info.state));
        requestedFrame = requestAnimationFrame(updateDisplay);
      };
      requestedFrame = requestAnimationFrame(updateDisplay);
      return () => cancelAnimationFrame(requestedFrame);
    }
  }, [info.state]);

  return (
    <div className="flex flex-col items-center border border-stopwatch-danger p-1">
      <div className="px-1 text-stopwatch-success">{`Connection State: ${connection.state}`}</div>
      <div className="px-1 text-stopwatch-success">{`Connection UUID: ${connectionUuid}`}</div>
      <button
        className="relative box-border mb-[10px] flex h-arcane-btn cursor-pointer items-center justify-center overflow-visible rounded-arcane-btn border border-arcane-btn-border bg-arcane-grad-btn px-1 py-0.5 text-arcane-btn-text shadow-arcane-btn text-shadow-arcane-btn transition-all duration-200 outline-none hover:bg-arcane-grad-btn-hover active:bg-arcane-grad-btn-active active:duration-50 active:shadow-arcane-btn-active active:text-shadow-arcane-btn-active"
        {...reconnectHandler}
      >
        Reconnect
      </button>
      <div
        className="cursor-pointer px-1 text-stopwatch-danger transition-opacity hover:opacity-50"
        {...handlers}
      >
        {timeDisplay}
      </div>
      <button
        className="relative box-border mb-[10px] flex h-arcane-btn cursor-pointer items-center justify-center overflow-visible rounded-arcane-btn border border-arcane-btn-border bg-arcane-grad-btn px-1 py-0.5 text-arcane-btn-text shadow-arcane-btn text-shadow-arcane-btn transition-all duration-200 outline-none hover:bg-arcane-grad-btn-hover active:bg-arcane-grad-btn-active active:duration-50 active:shadow-arcane-btn-active active:text-shadow-arcane-btn-active"
        {...callHandler}
      >
        Request time from server
      </button>
      {info.state.type === 'stopped' && info.child && (
        <div className="w-full border border-stopwatch-accent p-1">
          {renderComponent(info.child)}
        </div>
      )}
      <div className="flex items-center gap-0.5 text-arcane-text">
        Change Theme:
        <select
          className="rounded-arcane-btn border border-arcane-btn-border bg-arcane-grad-btn px-1 py-0.5 text-arcane-text shadow-arcane-btn text-shadow-arcane-btn"
          value={colorSchemePreference}
          onChange={(e) =>
            setColorSchemePreference(
              e.target.value as typeof colorSchemePreference,
            )
          }
        >
          {VALID_COLOR_SCHEME_PREFS.map((pref) => (
            <option key={pref} value={pref}>
              {pref}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const CUSTOM_FRONTEND_COMPONENT_RENDERER: FrontendComponentRenderer = {
  namespace: 'custom',
  render: (info): React.ReactElement => {
    if (!isCustomComponent(info)) {
      throw new Error(`Cannot render non-core component ${info.namespace}`);
    }
    switch (info.component) {
      case 'stopwatch':
        return <Stopwatch info={info} />;
    }
  },
};

startArcaneFrontend({
  renderers: [
    CORE_FRONTEND_COMPONENT_RENDERER,
    CUSTOM_FRONTEND_COMPONENT_RENDERER,
  ],
});
