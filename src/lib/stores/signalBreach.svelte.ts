/**
 * Signal Breach store — global state for the cheat-code unlock.
 *
 * Activated by:
 *   - keyboard Konami sequence (UP UP DOWN DOWN LEFT RIGHT LEFT RIGHT B A)
 *   - on-screen keypad in the Footer
 *   - dispatched window event 'yuxbi:signal-breach' (legacy compat)
 *
 * Persists for the current browser tab via sessionStorage.
 * Toggle off cleanly via the corner indicator's "release" button.
 */

import { browser } from '$app/environment';

const STORAGE_KEY = 'yuxbi:signal-breach:v1';

// Konami code, normalised
export const BREACH_SEQUENCE = [
  'up','up','down','down','left','right','left','right','b','a'
] as const;
export type BreachKey = (typeof BREACH_SEQUENCE)[number];

// Statuses get remapped in breach mode
export const BREACH_STATUS_MAP: Record<string, string> = {
  Active: 'Transmitting',
  Pending: 'Off-grid',
  Classified: 'Unsealed'
};

// Soft micro-quotes scattered in unlocked mode
export const BREACH_WHISPERS = [
  'The lab remembers you.',
  'Signal drift detected.',
  'Internal field active.',
  'The shelf is no longer stable.',
  'You were not supposed to find this.'
];

interface BreachState {
  unlocked: boolean;
  burst: boolean; // brief unlock burst overlay
  message: string; // status message during burst
}

function createStore() {
  let unlocked = $state(false);
  let burst = $state(false);
  let message = $state('Sequence accepted.');
  let burstTimer: ReturnType<typeof setTimeout> | null = null;

  function hydrate() {
    if (!browser) return;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw === '1') unlocked = true;
    } catch {
      /* ignore */
    }
  }

  function persist() {
    if (!browser) return;
    try {
      if (unlocked) sessionStorage.setItem(STORAGE_KEY, '1');
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  const messages = [
    'Sequence accepted.',
    'Hidden layer opened.',
    'Signal breach detected.',
    'Internal field active.'
  ];

  function activate(opts: { silent?: boolean } = {}) {
    const wasUnlocked = unlocked;
    unlocked = true;
    persist();
    if (!opts.silent) {
      message = messages[Math.floor(Math.random() * messages.length)];
      burst = true;
      if (burstTimer) clearTimeout(burstTimer);
      burstTimer = setTimeout(() => {
        burst = false;
      }, 2400);
    }
    if (browser && !wasUnlocked) {
      window.dispatchEvent(new CustomEvent('yuxbi:signal-breach'));
    }
  }

  function release() {
    unlocked = false;
    burst = false;
    if (burstTimer) {
      clearTimeout(burstTimer);
      burstTimer = null;
    }
    persist();
  }

  function dismissBurst() {
    burst = false;
    if (burstTimer) {
      clearTimeout(burstTimer);
      burstTimer = null;
    }
  }

  return {
    get unlocked() {
      return unlocked;
    },
    get burst() {
      return burst;
    },
    get message() {
      return message;
    },
    hydrate,
    activate,
    release,
    dismissBurst
  };
}

export const signalBreach = createStore();
export type { BreachState };
