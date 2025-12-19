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
import styled from 'styled-components';
import { useContext, useEffect, useState } from 'react';
import {
  useColorSchemePreferences,
  usePressable,
  VALID_COLOR_SCHEME_PREFS,
} from '@arcanejs/toolkit-frontend/util';

const StyledDiv = styled.div`
  padding: 10px;
  border: 1px solid red;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Connection = styled.div`
  padding: 10px;
  color: green;
`;

const Time = styled.div`
  cursor: pointer;
  padding: 10px;
  color: red;

  &:hover {
    opacity: 0.5;
  }
`;

const Button = styled.button`
  margin-bottom: 10px;
`;

const ChildrenContainer = styled.div`
  border: 1px solid blue;
  padding: 10px;
`;

const display = (time: StopwatchComponentProto['state']) => {
  if (time.type === 'stopped') {
    return `${time.timeMillis / 1000}`;
  } else {
    return `${(Date.now() - time.startedAt) / 1000}`;
  }
};

const Stopwatch: React.FC<{ info: StopwatchComponentProto }> = ({ info }) => {
  const { sendMessage, call, renderComponent, connectionUuid } =
    useContext(StageContext);
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
    <StyledDiv>
      <Connection>{`Connection UUID: ${connectionUuid}`}</Connection>
      <Time {...handlers}>{timeDisplay}</Time>
      <Button {...callHandler}>Request time from server</Button>
      {info.state.type === 'stopped' && info.child && (
        <ChildrenContainer>{renderComponent(info.child)}</ChildrenContainer>
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
    </StyledDiv>
  );
};

const CUSTOM_FRONTEND_COMPONENT_RENDERER: FrontendComponentRenderer = {
  namespace: 'custom',
  render: (info): JSX.Element => {
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
