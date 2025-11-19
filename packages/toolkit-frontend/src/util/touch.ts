import { useState } from 'react';

export function switchToMouseMode(ev: MouseEvent) {
  if (ev.movementX === 0 && ev.movementY === 0) return;
  document.body.classList.remove('touch-mode');
}

export function switchToTouchMode() {
  document.body.classList.add('touch-mode');
}

export function initialiseListeners() {
  window.addEventListener('mousemove', switchToMouseMode);
  window.addEventListener('touchstart', switchToTouchMode, { passive: false });
  window.addEventListener('contextmenu', (e) => {
    if ((e as PointerEvent).pointerType === 'touch') {
      e.preventDefault();
    }
  });
}

export const usePressable = (
  click: () => unknown,
): {
  touching: boolean;
  handlers: {
    onClick: React.MouseEventHandler<unknown>;
    onTouchStart: React.TouchEventHandler<unknown>;
    onTouchMove: React.TouchEventHandler<unknown>;
    onTouchEnd: React.TouchEventHandler<unknown>;
  };
} => {
  const [touching, setTouching] = useState(false);

  return {
    touching,
    handlers: {
      onClick: click,
      onTouchStart: () => {
        setTouching(true);
      },
      onTouchMove: () => {
        setTouching(false);
      },
      onTouchEnd: (event) => {
        if (touching) {
          // Prevent 'click' event (and double press)
          event.preventDefault();
          setTouching(false);
          click();
        }
      },
    },
  };
};

export function trackTouch(
  touch: React.Touch,
  move: (pos: { pageX: number; pageY: number }) => void,
  end: (pos: { pageX: number; pageY: number }) => void,
) {
  const touchMove = (ev: TouchEvent) => {
    ev.preventDefault();
    for (const t of Array.from(ev.changedTouches)) {
      if (t.identifier === touch.identifier) {
        move({ pageX: t.pageX, pageY: t.pageY });
      }
    }
  };

  const touchEnd = (ev: TouchEvent) => {
    for (const t of Array.from(ev.changedTouches)) {
      if (t.identifier === touch.identifier) {
        end({ pageX: t.pageX, pageY: t.pageY });
        window.removeEventListener('touchmove', touchMove);
        window.removeEventListener('touchend', touchEnd);
        window.removeEventListener('touchcancel', touchEnd);
      }
    }
  };

  window.addEventListener('touchmove', touchMove, { passive: false });
  window.addEventListener('touchend', touchEnd);
  window.addEventListener('touchcancel', touchEnd);
}
