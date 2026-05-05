<script lang="ts">
  import '$lib/styles/global.css';
  import type { Snippet } from 'svelte';
  import LoadingScreen from '$lib/components/LoadingScreen.svelte';
  import { signalBreach, BREACH_SEQUENCE } from '$lib/stores/signalBreach.svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  // Konami detector
  let progress = 0;

  function keyToken(e: KeyboardEvent): string | null {
    switch (e.key) {
      case 'ArrowUp':
        return 'up';
      case 'ArrowDown':
        return 'down';
      case 'ArrowLeft':
        return 'left';
      case 'ArrowRight':
        return 'right';
      case 'b':
      case 'B':
        return 'b';
      case 'a':
      case 'A':
        return 'a';
      default:
        return null;
    }
  }

  function isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (target.isContentEditable) return true;
    return false;
  }

  function onKeyDown(e: KeyboardEvent) {
    if (signalBreach.unlocked) return; // already in
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (isTypingTarget(e.target)) return;

    const token = keyToken(e);
    if (!token) {
      if (progress > 0) progress = 0;
      return;
    }

    if (token === BREACH_SEQUENCE[progress]) {
      progress += 1;
      if (progress >= BREACH_SEQUENCE.length) {
        progress = 0;
        signalBreach.activate();
      }
    } else {
      // mismatch — reset, but if this key is the start of the sequence, count it
      progress = token === BREACH_SEQUENCE[0] ? 1 : 0;
    }
  }

  $effect(() => {
    signalBreach.hydrate();
    document.body.classList.toggle('signal-breach', signalBreach.unlocked);
    return () => {
      document.body.classList.remove('signal-breach');
    };
  });

  $effect(() => {
    function onLegacyCheat() {
      signalBreach.activate();
    }
    function onBreach() {
      signalBreach.activate();
    }
    window.addEventListener('yuxbi:alien-cheat', onLegacyCheat);
    window.addEventListener('yuxbi:signal-breach-trigger', onBreach);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('yuxbi:alien-cheat', onLegacyCheat);
      window.removeEventListener('yuxbi:signal-breach-trigger', onBreach);
      window.removeEventListener('keydown', onKeyDown);
    };
  });

  $effect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  });

  function release() {
    signalBreach.release();
  }

  function dismissBurst() {
    signalBreach.dismissBurst();
  }
</script>

<LoadingScreen />

<div class="noise-overlay" aria-hidden="true"></div>

<!-- Sitewide signal-wave overlay (subtle, only in unlocked mode) -->
{#if signalBreach.unlocked}
  <div class="breach-field" aria-hidden="true">
    <svg class="breach-waves" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none">
      <path class="wave wave-1"
        d="M0 220 Q 240 180 480 220 T 960 220 T 1440 220"
        stroke="currentColor" stroke-width="1.2" fill="none" />
      <path class="wave wave-2"
        d="M0 460 Q 240 420 480 460 T 960 460 T 1440 460"
        stroke="currentColor" stroke-width="1.2" fill="none" />
      <path class="wave wave-3"
        d="M0 700 Q 240 660 480 700 T 960 700 T 1440 700"
        stroke="currentColor" stroke-width="1.2" fill="none" />
    </svg>
    <div class="breach-grid"></div>
  </div>

  <div class="breach-indicator" role="status">
    <span class="breach-dot" aria-hidden="true"></span>
    <span class="breach-indicator-label">Internal field active</span>
    <button
      class="breach-release"
      onclick={release}
      aria-label="Release signal breach"
      title="Release"
    >
      ×
    </button>
  </div>
{/if}

<!-- Unlock burst overlay -->
{#if signalBreach.burst}
  <div
    class="breach-burst"
    role="status"
    aria-live="polite"
    onclick={dismissBurst}
    onkeydown={(e) => { if (e.key === 'Escape') dismissBurst(); }}
    tabindex="-1"
  >
    <div class="breach-scan" aria-hidden="true"></div>
    <div class="breach-burst-center">
      <div class="breach-burst-mark" aria-hidden="true">
        <svg viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="30" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 5" />
          <circle cx="40" cy="40" r="18" stroke="currentColor" stroke-width="1.5" />
          <circle cx="40" cy="40" r="3" fill="currentColor" />
        </svg>
      </div>
      <div class="breach-burst-label">Signal Breach</div>
      <div class="breach-burst-message">{signalBreach.message}</div>
      <div class="breach-burst-meta">Sequence verified · session continuity established</div>
    </div>
  </div>
{/if}

<div class="site-shell" class:signal-breach-root={signalBreach.unlocked}>
  {@render children()}
</div>

<style>
  /* ------------------------------------------------------------------
   * Signal Breach — alternate lab visuals
   * Activated when body.signal-breach is set.
   * Subtle, cinematic, deliberate. Respects prefers-reduced-motion.
   * ------------------------------------------------------------------ */

  .breach-field {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    color: rgba(53, 104, 235, 0.22);
    opacity: 0;
    animation: breachFadeIn 1.4s ease-out 0.2s forwards;
  }

  .breach-waves {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .wave {
    opacity: 0.55;
    stroke-dasharray: 4 8;
  }

  .wave-1 { animation: waveDrift 18s linear infinite; }
  .wave-2 { animation: waveDrift 24s linear infinite reverse; opacity: 0.4; }
  .wave-3 { animation: waveDrift 30s linear infinite; opacity: 0.3; }

  @keyframes waveDrift {
    from { stroke-dashoffset: 0; }
    to { stroke-dashoffset: -240; }
  }

  .breach-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(to right, rgba(53, 104, 235, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(53, 104, 235, 0.05) 1px, transparent 1px);
    background-size: 64px 64px;
    mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
  }

  @keyframes breachFadeIn {
    to { opacity: 1; }
  }

  /* Corner indicator — bottom-right to stay clear of nav at top */
  .breach-indicator {
    position: fixed;
    bottom: 22px;
    right: 22px;
    z-index: 10002;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px 7px 12px;
    border-radius: 999px;
    border: 1px solid rgba(53, 104, 235, 0.35);
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 4px 0 rgba(31, 47, 86, 0.12);
    font-family: var(--font-display);
    font-size: 0.64rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-accent);
    animation: indicatorIn 0.55s var(--ease-elastic) both;
    animation-delay: 0.2s;
  }

  @keyframes indicatorIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .breach-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--color-accent);
    box-shadow: 0 0 0 0 rgba(53, 104, 235, 0.6);
    animation: breachPulse 1.6s ease-in-out infinite;
  }

  @keyframes breachPulse {
    0% { box-shadow: 0 0 0 0 rgba(53, 104, 235, 0.55); }
    70% { box-shadow: 0 0 0 10px rgba(53, 104, 235, 0); }
    100% { box-shadow: 0 0 0 0 rgba(53, 104, 235, 0); }
  }

  .breach-indicator-label {
    font-weight: 600;
  }

  .breach-release {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1px solid rgba(31, 47, 86, 0.22);
    background: transparent;
    color: var(--color-text-muted);
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    display: grid;
    place-items: center;
    padding: 0;
    margin-left: 2px;
    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  }

  .breach-release:hover {
    background: rgba(53, 104, 235, 0.1);
    color: var(--color-accent);
    border-color: rgba(53, 104, 235, 0.5);
  }

  /* Unlock burst */
  .breach-burst {
    position: fixed;
    inset: 0;
    z-index: 10100;
    background: radial-gradient(ellipse at center, rgba(13, 21, 46, 0.78) 0%, rgba(13, 21, 46, 0.92) 100%);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    color: #e8efff;
    display: grid;
    place-items: center;
    cursor: pointer;
    overflow: hidden;
    animation: burstFade 2.4s ease-out forwards;
  }

  @keyframes burstFade {
    0% { opacity: 0; }
    8% { opacity: 1; }
    85% { opacity: 1; }
    100% { opacity: 0; }
  }

  .breach-scan {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(142, 217, 255, 0.85), transparent);
    box-shadow: 0 0 24px rgba(142, 217, 255, 0.55);
    top: 0;
    animation: breachScan 2.0s cubic-bezier(0.7, 0, 0.3, 1) forwards;
  }

  @keyframes breachScan {
    0% { top: 0; opacity: 0.2; }
    20% { opacity: 1; }
    100% { top: 100%; opacity: 0.4; }
  }

  .breach-burst-center {
    text-align: center;
    transform: translateY(-12px);
    animation: burstCenterIn 0.7s var(--ease-out) 0.15s both;
  }

  @keyframes burstCenterIn {
    from { opacity: 0; transform: translateY(-4px) scale(0.96); }
    to { opacity: 1; transform: translateY(-12px) scale(1); }
  }

  .breach-burst-mark {
    width: 56px;
    height: 56px;
    margin: 0 auto var(--space-4);
    color: #8ed9ff;
    animation: markSpin 7s linear infinite;
  }

  .breach-burst-mark svg { width: 100%; height: 100%; }

  @keyframes markSpin {
    from { transform: rotate(0); }
    to { transform: rotate(360deg); }
  }

  .breach-burst-label {
    font-family: var(--font-display);
    font-size: 0.72rem;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: rgba(232, 239, 255, 0.7);
    margin-bottom: var(--space-3);
  }

  .breach-burst-message {
    font-family: var(--font-display);
    font-size: clamp(1.4rem, 3.4vw, 2rem);
    font-weight: 500;
    color: #ffffff;
    letter-spacing: 0.01em;
    margin-bottom: var(--space-3);
  }

  .breach-burst-meta {
    font-family: var(--font-display);
    font-size: 0.64rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(232, 239, 255, 0.45);
  }

  /* ------------------------------------------------------------------
   * Sitewide effects when body.signal-breach is active.
   * Use :global() to reach beyond layout scope.
   * ------------------------------------------------------------------ */

  /* Subtle background tint */
  :global(body.signal-breach) {
    background: linear-gradient(180deg, #f7f9ff 0%, #fff5de 100%);
  }

  /* Soft levitation of cards */
  :global(body.signal-breach .experiment-card) {
    animation: breachLevitate calc(7s + var(--index, 0) * 0.4s) ease-in-out infinite !important;
    animation-delay: calc(var(--index, 0) * -0.6s) !important;
    border-color: rgba(53, 104, 235, 0.28) !important;
    box-shadow: 0 6px 0 rgba(31, 47, 86, 0.12), 0 0 24px rgba(53, 104, 235, 0.08) !important;
  }

  :global(body.signal-breach .experiment-card.hovered) {
    animation-play-state: paused !important;
  }

  @keyframes breachLevitate {
    0%, 100% { translate: 0 0; }
    50% { translate: 0 -8px; }
  }

  /* Soft accent glow on hero badge in breach mode */
  :global(body.signal-breach .hero-badge) {
    border-color: rgba(53, 104, 235, 0.4) !important;
    background: rgba(255, 255, 255, 0.88) !important;
  }

  /* Reveal hidden footer microcopy in breach mode */
  :global(.breach-whisper) {
    display: none;
  }

  :global(body.signal-breach .breach-whisper) {
    display: inline-block;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .wave-1, .wave-2, .wave-3,
    .breach-dot,
    .breach-burst-mark,
    .breach-scan {
      animation: none !important;
    }
    :global(body.signal-breach .experiment-card) {
      animation: none !important;
    }
    .breach-burst {
      animation: burstFadeReduced 2.4s ease-out forwards;
    }
  }

  @keyframes burstFadeReduced {
    0% { opacity: 0; }
    20% { opacity: 1; }
    85% { opacity: 1; }
    100% { opacity: 0; }
  }

  @media (max-width: 640px) {
    .breach-indicator {
      bottom: 14px;
      right: 14px;
      font-size: 0.58rem;
      padding: 6px 8px 6px 10px;
    }
  }
</style>
