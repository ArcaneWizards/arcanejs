import React, { FC, useCallback } from 'react';

import * as proto from '@arcanejs/protocol/core';
import { trackTouch } from '../util/touch';

import { StageContext } from './context';
import { calculateClass, cn } from '../util';
import { TRANSPARENCY_SVG_URI } from './core';

const OPEN_SLIDER_WIDTH = 400;
const SLIDER_PADDING = 15;
const SLIDER_VALUE_WIDTH = 60;
const OPEN_SLIDER_INNER_WIDTH =
  OPEN_SLIDER_WIDTH - SLIDER_PADDING * 4 - SLIDER_VALUE_WIDTH * 2;

const KEYS = {
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  Enter: 'Enter',
  Escape: 'Escape',
};

interface Props {
  className?: string;
  info: proto.SliderButtonComponent;
}

type TouchingState = {
  state: 'touching';
  startValue: number | null;
  startX: number;
  innerLeft: string;
  diff: number;
};

type State =
  | {
      state: 'closed' | 'focused' | 'mouse-down';
    }
  | TouchingState;

type DivStyle = React.HTMLAttributes<HTMLDivElement>['style'];

const NUMBER_FORMATTER = new Intl.NumberFormat(undefined, {
  // A large enough value for most usecases,
  // but to avoid inaccuracies from floating-point maths
  maximumFractionDigits: 10,
});

const getRelativeCursorPosition = (elem: Element, pageX: number) => {
  const rect = elem.getBoundingClientRect();
  return pageX - rect.left;
};

const SliderButton: FC<Props> = ({ info, className }) => {
  const { sendMessage } = React.useContext(StageContext);
  const [state, setState] = React.useState<State>({ state: 'closed' });
  const input = React.useRef<HTMLInputElement | null>(null);

  const displayValue = (value: number) => {
    if (info.max === 1 && info.min === 0) {
      return `${Math.round(value * 100)}%`;
    }
    return NUMBER_FORMATTER.format(value);
  };

  const sendValue = useCallback(
    (value: number) =>
      sendMessage<proto.CoreComponentMessage>?.({
        type: 'component-message',
        namespace: 'core',
        componentKey: info.key,
        component: 'slider_button',
        value: value,
      }),
    [sendMessage, info.key],
  );

  const sanitizeValue = useCallback(
    (value: number) => {
      const i = Math.round((value - info.min) / info.step);
      const v = i * info.step + info.min;
      return Math.max(info.min, Math.min(info.max, v));
    },
    [info.min, info.max, info.step],
  );

  const getNewValue = useCallback(
    (startValue: null | number, diff: number) => {
      return sanitizeValue((startValue || 0) + diff);
    },
    [sanitizeValue],
  );

  const getCurrentInputValue = useCallback(
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      const float = parseFloat(e.currentTarget.value);
      return sanitizeValue(isNaN(float) ? info.value || 0 : float);
    },
    [info.value, sanitizeValue],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === KEYS.ArrowDown || e.key === KEYS.ArrowUp) {
      const currentValue = getCurrentInputValue(e);
      const diff = e.key === KEYS.ArrowUp ? info.step : -info.step;
      const newValue = sanitizeValue(currentValue + diff);
      e.currentTarget.value = NUMBER_FORMATTER.format(newValue);
      sendValue(newValue);
    } else if (e.key === KEYS.Enter) {
      const sanitizedValue = getCurrentInputValue(e);
      sendValue(sanitizedValue);
      e.currentTarget.value = NUMBER_FORMATTER.format(sanitizedValue);
    } else if (e.key === KEYS.Escape) {
      input.current?.blur();
    }
  };

  const onFocus = (e: React.SyntheticEvent<HTMLInputElement>) => {
    setState({ state: 'focused' });
    e.currentTarget.value = `${info.value || 0}`;
  };

  const onBlur = () => {
    setState({ state: 'closed' });
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    for (const touch of Array.from(e.changedTouches)) {
      const originalPageX = touch.pageX;
      const cursorPosition = getRelativeCursorPosition(
        e.currentTarget,
        touch.pageX,
      );
      const start = onDown(cursorPosition);
      trackTouch(
        touch,
        (p) => {
          const amntDiff = (p.pageX - originalPageX) / OPEN_SLIDER_INNER_WIDTH;
          const newValueDiff = (info.max - info.min) * amntDiff;
          sendValue(getNewValue(start.startValue, newValueDiff));
          setState({ ...start, diff: newValueDiff });
        },
        (p) => {
          const amntDiff = (p.pageX - originalPageX) / OPEN_SLIDER_INNER_WIDTH;
          const newValueDiff = (info.max - info.min) * amntDiff;
          sendValue(getNewValue(start.startValue, newValueDiff));
          setState({ state: 'closed' });
        },
      );
      return;
    }
  };

  const onDown = (cursorStartPosition: number) => {
    const value = info.value === null ? 0 : info.value;
    /** Value between 0 - 1 representing where between min - max the value is */
    const amnt = (value - info.min) / (info.max - info.min);
    const innerLeft =
      cursorStartPosition -
      amnt * OPEN_SLIDER_INNER_WIDTH -
      SLIDER_PADDING * 2 -
      SLIDER_VALUE_WIDTH +
      'px';
    const start: TouchingState = {
      state: 'touching',
      startValue: info.value,
      startX: cursorStartPosition,
      innerLeft,
      diff: 0,
    };
    setState(start);
    return start;
  };

  const value =
    state.state === 'touching'
      ? getNewValue(state.startValue, state.diff)
      : info.value;
  const valueDisplay = value !== null ? displayValue(value) : '';
  const valueCSSPercent = value
    ? ((value - info.min) / (info.max - info.min)) * 100 + '%'
    : '0';

  const gradientStops =
    info.gradient &&
    info.gradient.map((g) => `${g.color} ${g.position * 100}%`);
  const sliderGradient: DivStyle = gradientStops
    ? {
        background: `linear-gradient(90deg, ${gradientStops.join(', ')}), url(${TRANSPARENCY_SVG_URI})`,
      }
    : undefined;

  return (
    <div
      className={calculateClass(
        'arcane-slider-button',
        className,
        `state-${state.state}`,
        info.grow && 'arcane-slider-button--grow',
      )}
    >
      <div
        className="arcane-slider-button__inner"
        onMouseDown={() => setState({ state: 'mouse-down' })}
        onMouseUp={() => input.current?.focus()}
        onTouchStart={onTouchStart}
        style={state.state === 'touching' ? { left: state.innerLeft } : {}}
      >
        <input
          type="text"
          ref={input}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
        />
        <div
          className={cn(
            `
              -mx-arcane-slider-value-hidden w-arcane-slider-value text-center
              leading-arcane-slider-value-hidden opacity-0
            `,
            state.state === 'touching' && 'mx-arcane-slider-pad opacity-100',
          )}
        >
          {valueDisplay}
        </div>
        <div
          className={calculateClass(
            'arcane-slider-button__display',
            sliderGradient && 'arcane-slider-button__display--gradient',
          )}
          style={sliderGradient}
        >
          <div
            className={cn(
              `h-full bg-arcane-hint`,
              sliderGradient &&
                `border-arcane-btn-border relative border-r-[2px] bg-transparent`,
              sliderGradient &&
                `before:absolute before:w-[4px] before:-top-[5px] before:-bottom-[5px] before:-right-[3px] before:bg-arcane-btn-border`,
              sliderGradient &&
                `after:absolute after:w-[2px] after:-top-[4px] after:-bottom-[4px] after:-right-[2px] after:bg-arcane-btn-text`,
            )}
            style={{ width: valueCSSPercent }}
          ></div>
        </div>
        <div
          className={cn(
            `
              -mx-arcane-slider-value-hidden w-arcane-slider-value text-center
              leading-arcane-slider-value-hidden opacity-0
            `,
            state.state === 'touching' && 'mx-arcane-slider-pad opacity-100',
          )}
        >
          {valueDisplay}
        </div>
      </div>
    </div>
  );
};

export { SliderButton };
