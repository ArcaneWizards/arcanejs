import {
  CORE_FRONTEND_COMPONENT_RENDERER,
  StageContext,
} from '@arcanejs/toolkit-frontend';
import '@arcanejs/toolkit-frontend/styles/core.css';
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
import './frontend.css';

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
    <div className="custom-stopwatch">
      <div className="custom-stopwatch__connection">{`Connection State: ${connection.state}`}</div>
      <div className="custom-stopwatch__connection">{`Connection UUID: ${connectionUuid}`}</div>
      <button className="custom-stopwatch__button" {...reconnectHandler}>
        Reconnect
      </button>
      <div className="custom-stopwatch__time" {...handlers}>
        {timeDisplay}
      </div>
      <button className="custom-stopwatch__button" {...callHandler}>
        Request time from server
      </button>
      {info.state.type === 'stopped' && info.child && (
        <div className="custom-stopwatch__children">
          {renderComponent(info.child)}
        </div>
      )}
      <div>
        Change Theme:
        <select
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
