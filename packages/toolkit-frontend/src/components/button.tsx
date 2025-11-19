import React, { FC } from 'react';
import { styled } from 'styled-components';

import * as proto from '@arcanejs/protocol/core';

import {
  buttonStateNormalActive,
  rectButton,
  touchIndicatorNormal,
  touchIndicatorTouching,
} from '../styling';
import { calculateClass, usePressable } from '../util';

import { Icon } from './core';
import { StageContext } from './context';

const TOUCH_INDICATOR_CLASS = 'touch-indicator';
const LOADING_CLASS = 'loading';
const TOUCHING_CLASS = 'touching';
const ERROR_CLASS = 'error';

interface Props {
  className?: string;
  info: proto.ButtonComponent;
}

const ButtonContents = styled.div`
  padding: 6px 4px;
  display: flex;
  justify-content: center;
  align-items: center;

  > * {
    padding: 0;
  }
`;

const ButtonLabel = styled.span`
  padding: 0 4px;
`;

type LocalState =
  | {
      state: 'loading';
    }
  | {
      state: 'error';
      error: string;
    }
  | null;

const Button: FC<Props> = (props) => {
  const { call } = React.useContext(StageContext);
  const [localState, setLocalState] = React.useState<LocalState>(null);
  const state = localState ?? props.info.state;

  const { touching, handlers } = usePressable(async () => {
    try {
      if (!call) return;
      setLocalState({ state: 'loading' });
      await call<'core', proto.CoreComponentCalls, 'press'>?.({
        type: 'component-call',
        namespace: 'core',
        componentKey: props.info.key,
        action: 'press',
      });
      setLocalState(null);
    } catch (e) {
      setLocalState({ state: 'error', error: `${e}` });
    }
  });

  return (
    <div
      className={calculateClass(
        props.className,
        (touching || state.state === 'pressed') && TOUCHING_CLASS,
        state.state === 'loading' && LOADING_CLASS,
        state.state === 'error' && ERROR_CLASS,
      )}
      {...handlers}
      title={state.state === 'error' ? state.error : undefined}
    >
      <div className={TOUCH_INDICATOR_CLASS} />
      <ButtonContents>
        {props.info.icon && <Icon icon={props.info.icon} />}
        {props.info.text && <ButtonLabel>{props.info.text}</ButtonLabel>}
      </ButtonContents>
    </div>
  );
};

const StyledButton: FC<Props> = styled(Button)`
  ${rectButton}
  outline: none;
  height: 30px;
  position: relative;
  overflow: visible;

  .${TOUCH_INDICATOR_CLASS} {
    ${touchIndicatorNormal}
  }

  &.${ERROR_CLASS} {
    color: ${(p) => p.theme.colorRed};
    border-color: ${(p) => p.theme.colorRed};
  }

  &.${TOUCHING_CLASS}, &.${LOADING_CLASS} {
    ${buttonStateNormalActive}

    .${TOUCH_INDICATOR_CLASS} {
      ${touchIndicatorTouching}
    }
  }
`;

export { StyledButton as Button };
