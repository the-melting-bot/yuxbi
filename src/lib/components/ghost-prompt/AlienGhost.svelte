<script lang="ts">
  /**
   * AlienGhost — a single floating spectral entity.
   * Three species: 'drifter' (tall classical ghost), 'orb' (round signal-being),
   * 'tendril' (long jellyfish-like creature). All translucent + glowing.
   *
   * The component renders as an absolutely-positioned SVG that drifts on its own.
   * Position, scale, hue, and timing are props so a parent can compose a constellation.
   */
  interface Props {
    species?: 'drifter' | 'orb' | 'tendril';
    x?: number;          // % of container, 0–100
    y?: number;          // % of container, 0–100
    size?: number;       // px
    hue?: 'blue' | 'pink' | 'violet' | 'cyan';
    drift?: number;      // animation duration in seconds
    delay?: number;      // animation delay in seconds
    parallax?: number;   // 0–1 reactive intensity to cursor
    cursorX?: number;    // -1..1 normalized cursor offset (passed by parent)
    cursorY?: number;
    opacity?: number;
    blur?: number;       // px
    spin?: boolean;      // gentle rotation drift
  }

  let {
    species = 'drifter',
    x = 50,
    y = 50,
    size = 90,
    hue = 'blue',
    drift = 14,
    delay = 0,
    parallax = 0.3,
    cursorX = 0,
    cursorY = 0,
    opacity = 0.65,
    blur = 0.4,
    spin = false
  }: Props = $props();

  const hueMap: Record<string, { core: string; glow: string; ring: string }> = {
    blue:   { core: '#7da7ff', glow: '#3568eb', ring: '#bdd0ff' },
    pink:   { core: '#ffb3d8', glow: '#f76db8', ring: '#ffd7ea' },
    violet: { core: '#c2a9ff', glow: '#8d57eb', ring: '#dccaff' },
    cyan:   { core: '#9be0ec', glow: '#3fb6cc', ring: '#c6efef' }
  };

  let palette = $derived(hueMap[hue] ?? hueMap.blue);
  let translateX = $derived(cursorX * parallax * 18);
  let translateY = $derived(cursorY * parallax * 14);
</script>

<div
  class="alien-ghost"
  class:spin
  style="
    left: {x}%;
    top: {y}%;
    width: {size}px;
    height: {size}px;
    --drift: {drift}s;
    --delay: {delay}s;
    --tx: {translateX}px;
    --ty: {translateY}px;
    --opacity: {opacity};
    --blur: {blur}px;
  "
  aria-hidden="true"
>
  <svg viewBox="0 0 120 120" fill="none" preserveAspectRatio="xMidYMid meet">
    <defs>
      <radialGradient id="g-glow-{hue}-{species}-{x}-{y}" cx="50%" cy="50%" r="55%">
        <stop offset="0%" stop-color={palette.core} stop-opacity="0.95" />
        <stop offset="55%" stop-color={palette.glow} stop-opacity="0.45" />
        <stop offset="100%" stop-color={palette.glow} stop-opacity="0" />
      </radialGradient>
      <radialGradient id="g-body-{hue}-{species}-{x}-{y}" cx="50%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.96" />
        <stop offset="60%" stop-color={palette.ring} stop-opacity="0.7" />
        <stop offset="100%" stop-color={palette.glow} stop-opacity="0.35" />
      </radialGradient>
    </defs>

    <!-- ambient halo -->
    <circle cx="60" cy="60" r="58" fill="url(#g-glow-{hue}-{species}-{x}-{y})" />

    {#if species === 'drifter'}
      <!-- classic spectral drifter: dome head, wavy hem -->
      <path
        d="M30 60
           C30 42 42 28 60 28
           C78 28 90 42 90 60
           L90 86
           C84 92 80 84 74 90
           C68 96 64 86 60 92
           C56 86 52 96 46 90
           C40 84 36 92 30 86
           Z"
        fill="url(#g-body-{hue}-{species}-{x}-{y})"
        stroke={palette.glow}
        stroke-opacity="0.38"
        stroke-width="1.2"
      />
      <!-- two soft eye-marks -->
      <ellipse cx="51" cy="58" rx="3" ry="4" fill={palette.glow} opacity="0.65" />
      <ellipse cx="69" cy="58" rx="3" ry="4" fill={palette.glow} opacity="0.65" />
      <!-- tiny antenna -->
      <line x1="60" y1="28" x2="60" y2="20" stroke={palette.glow} stroke-width="1.2" stroke-linecap="round" />
      <circle cx="60" cy="19" r="1.8" fill={palette.glow} />
    {:else if species === 'orb'}
      <!-- signal orb being -->
      <circle cx="60" cy="60" r="32" fill="url(#g-body-{hue}-{species}-{x}-{y})" stroke={palette.glow} stroke-opacity="0.35" stroke-width="1" />
      <!-- inner ring -->
      <circle cx="60" cy="60" r="20" fill="none" stroke={palette.glow} stroke-opacity="0.45" stroke-width="0.8" stroke-dasharray="2 4" />
      <!-- pupil -->
      <circle cx="60" cy="60" r="4" fill={palette.glow} opacity="0.85" />
      <!-- 3 satellites -->
      <circle cx="92" cy="48" r="2.4" fill={palette.glow} opacity="0.75" />
      <circle cx="28" cy="72" r="1.8" fill={palette.glow} opacity="0.65" />
      <circle cx="78" cy="92" r="1.4" fill={palette.glow} opacity="0.55" />
    {:else}
      <!-- tendril jelly being -->
      <ellipse cx="60" cy="48" rx="28" ry="22" fill="url(#g-body-{hue}-{species}-{x}-{y})" stroke={palette.glow} stroke-opacity="0.3" stroke-width="0.8" />
      <ellipse cx="60" cy="42" rx="20" ry="14" fill={palette.ring} opacity="0.45" />
      <!-- tendrils -->
      <path d="M40 64 Q42 78 36 92 Q34 100 38 108" stroke={palette.glow} stroke-opacity="0.55" stroke-width="1.4" stroke-linecap="round" fill="none" />
      <path d="M50 68 Q52 82 48 96 Q46 102 50 110" stroke={palette.glow} stroke-opacity="0.5" stroke-width="1.2" stroke-linecap="round" fill="none" />
      <path d="M60 70 Q62 86 58 100 Q56 108 60 114" stroke={palette.glow} stroke-opacity="0.45" stroke-width="1" stroke-linecap="round" fill="none" />
      <path d="M70 68 Q72 82 68 96 Q66 102 70 110" stroke={palette.glow} stroke-opacity="0.5" stroke-width="1.2" stroke-linecap="round" fill="none" />
      <path d="M80 64 Q82 78 76 92 Q74 100 78 108" stroke={palette.glow} stroke-opacity="0.55" stroke-width="1.4" stroke-linecap="round" fill="none" />
      <!-- eye -->
      <ellipse cx="55" cy="44" rx="2.5" ry="3.5" fill={palette.glow} opacity="0.7" />
      <ellipse cx="65" cy="44" rx="2.5" ry="3.5" fill={palette.glow} opacity="0.7" />
    {/if}
  </svg>
</div>

<style>
  .alien-ghost {
    position: absolute;
    transform: translate(-50%, -50%) translate(var(--tx, 0px), var(--ty, 0px));
    transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
    opacity: var(--opacity, 0.65);
    filter: blur(var(--blur, 0.4px));
    pointer-events: none;
    will-change: transform;
    animation: ghost-drift var(--drift, 14s) ease-in-out infinite;
    animation-delay: var(--delay, 0s);
  }
  .alien-ghost svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .alien-ghost.spin svg {
    animation: ghost-spin calc(var(--drift, 14s) * 1.8) linear infinite;
    transform-origin: center;
  }

  @keyframes ghost-drift {
    0%, 100% {
      transform: translate(-50%, -50%) translate(var(--tx, 0px), var(--ty, 0px));
    }
    25% {
      transform: translate(-50%, -50%) translate(calc(var(--tx, 0px) - 14px), calc(var(--ty, 0px) - 18px));
    }
    50% {
      transform: translate(-50%, -50%) translate(calc(var(--tx, 0px) + 8px), calc(var(--ty, 0px) - 24px));
    }
    75% {
      transform: translate(-50%, -50%) translate(calc(var(--tx, 0px) + 16px), calc(var(--ty, 0px) - 6px));
    }
  }
  @keyframes ghost-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .alien-ghost,
    .alien-ghost.spin svg {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
