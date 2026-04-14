/**
 * Global cursor state for reactive motion across components.
 * Smoothed with spring interpolation for organic feel.
 */

import { springLerp } from './physics';

interface CursorState {
  x: number;
  y: number;
  smoothX: number;
  smoothY: number;
  velX: number;
  velY: number;
  active: boolean;
}

let state: CursorState = {
  x: 0, y: 0,
  smoothX: 0, smoothY: 0,
  velX: 0, velY: 0,
  active: false
};

let initialized = false;
let prevX = 0;
let prevY = 0;

export function initCursorTracking() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  function onMove(e: MouseEvent) {
    state.velX = e.clientX - prevX;
    state.velY = e.clientY - prevY;
    prevX = e.clientX;
    prevY = e.clientY;
    state.x = e.clientX;
    state.y = e.clientY;
    state.active = true;
  }

  function onTouch(e: TouchEvent) {
    if (e.touches.length > 0) {
      const t = e.touches[0];
      state.x = t.clientX;
      state.y = t.clientY;
      state.active = true;
    }
  }

  function onLeave() {
    state.active = false;
  }

  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('touchmove', onTouch, { passive: true });
  window.addEventListener('mouseleave', onLeave);

  // Update smoothed values on animation frame
  function tick() {
    state.smoothX = springLerp(state.smoothX, state.x, 0.06);
    state.smoothY = springLerp(state.smoothY, state.y, 0.06);
    requestAnimationFrame(tick);
  }
  tick();
}

export function getCursor(): CursorState {
  return state;
}
