<script lang="ts">
  /**
   * GhostField — atmospheric ghost layer.
   * Renders a haunted vapor field + a constellation of AlienGhosts.
   * Cursor proximity gives the ghosts a subtle parallax shimmer.
   *
   * Density:
   *  - 'ambient' = sparse hero atmosphere (default)
   *  - 'dense'   = busier, used during processing
   *  - 'edge'    = quiet, perimeter-only, used near results
   */
  import AlienGhost from './AlienGhost.svelte';

  interface Props {
    density?: 'ambient' | 'dense' | 'edge';
    processing?: boolean;
    /** Accent hue family used most heavily */
    family?: 'blue' | 'pink' | 'violet' | 'cyan';
  }

  let { density = 'ambient', processing = false, family = 'violet' }: Props = $props();

  let cursorX = $state(0);
  let cursorY = $state(0);
  let host: HTMLDivElement | null = $state(null);

  function onMove(e: MouseEvent) {
    if (!host) return;
    const rect = host.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    cursorX = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2)));
    cursorY = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));
  }
  function onLeave() {
    cursorX = 0;
    cursorY = 0;
  }

  // Constellation per density. Coordinates in % of host.
  type GhostConfig = {
    species: 'drifter' | 'orb' | 'tendril';
    x: number; y: number;
    size: number;
    hue: 'blue' | 'pink' | 'violet' | 'cyan';
    drift: number; delay: number;
    opacity: number; blur: number;
    parallax: number;
    spin?: boolean;
  };

  const ambient: GhostConfig[] = [
    { species: 'drifter', x: 12, y: 22, size: 84, hue: 'violet', drift: 16, delay: 0,   opacity: 0.55, blur: 0.6, parallax: 0.35 },
    { species: 'orb',     x: 86, y: 18, size: 64, hue: 'blue',   drift: 13, delay: 1.2, opacity: 0.6,  blur: 0.4, parallax: 0.55, spin: true },
    { species: 'tendril', x: 78, y: 78, size: 110,hue: 'pink',   drift: 19, delay: 2.4, opacity: 0.45, blur: 0.8, parallax: 0.25 },
    { species: 'drifter', x: 22, y: 78, size: 68, hue: 'cyan',   drift: 17, delay: 3.1, opacity: 0.5,  blur: 0.5, parallax: 0.4 },
    { species: 'orb',     x: 50, y: 8,  size: 38, hue: 'pink',   drift: 11, delay: 0.6, opacity: 0.55, blur: 0.3, parallax: 0.6 },
    { species: 'tendril', x: 6,  y: 52, size: 70, hue: 'violet', drift: 21, delay: 4.0, opacity: 0.4,  blur: 0.8, parallax: 0.2 },
    { species: 'orb',     x: 94, y: 54, size: 28, hue: 'cyan',   drift: 9,  delay: 1.7, opacity: 0.5,  blur: 0.3, parallax: 0.7, spin: true }
  ];

  const dense: GhostConfig[] = [
    ...ambient,
    { species: 'orb',     x: 36, y: 32, size: 22, hue: 'pink',   drift: 7,  delay: 0.2, opacity: 0.7,  blur: 0.2, parallax: 0.8, spin: true },
    { species: 'orb',     x: 64, y: 40, size: 18, hue: 'violet', drift: 6,  delay: 0.9, opacity: 0.7,  blur: 0.2, parallax: 0.9, spin: true },
    { species: 'orb',     x: 44, y: 60, size: 16, hue: 'cyan',   drift: 5,  delay: 1.4, opacity: 0.7,  blur: 0.2, parallax: 1.0, spin: true },
    { species: 'drifter', x: 58, y: 70, size: 50, hue: 'blue',   drift: 12, delay: 2.0, opacity: 0.5,  blur: 0.4, parallax: 0.5 }
  ];

  const edge: GhostConfig[] = [
    { species: 'drifter', x: 4,  y: 20, size: 56, hue: 'violet', drift: 18, delay: 0,   opacity: 0.4,  blur: 0.7, parallax: 0.3 },
    { species: 'orb',     x: 96, y: 14, size: 30, hue: 'pink',   drift: 10, delay: 1.0, opacity: 0.45, blur: 0.4, parallax: 0.55, spin: true },
    { species: 'tendril', x: 92, y: 86, size: 76, hue: 'cyan',   drift: 22, delay: 2.6, opacity: 0.35, blur: 0.9, parallax: 0.2 },
    { species: 'drifter', x: 8,  y: 84, size: 50, hue: 'blue',   drift: 17, delay: 3.4, opacity: 0.4,  blur: 0.7, parallax: 0.3 }
  ];

  let constellation = $derived(
    density === 'dense' ? dense : density === 'edge' ? edge : ambient
  );
</script>

<div
  class="ghost-field"
  class:processing
  class:dense={density === 'dense'}
  bind:this={host}
  onmousemove={onMove}
  onmouseleave={onLeave}
  role="presentation"
  aria-hidden="true"
>
  <!-- vapor layers -->
  <div class="vapor vapor-{family}"></div>
  <div class="vapor vapor-secondary"></div>

  {#each constellation as g, i (i)}
    <AlienGhost {...g} cursorX={cursorX} cursorY={cursorY} />
  {/each}

  <!-- shimmer particles -->
  <div class="shimmer">
    {#each Array(14) as _, i}
      <span
        class="spark"
        style="
          left: {(i * 73) % 100}%;
          top: {(i * 41) % 100}%;
          animation-duration: {6 + (i % 5)}s;
          animation-delay: {(i * 0.4) % 4}s;
        "
      ></span>
    {/each}
  </div>
</div>

<style>
  .ghost-field {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: auto; /* capture mouse, but children are pointer-events: none */
    z-index: 0;
  }

  /* vapor */
  .vapor {
    position: absolute;
    inset: -10%;
    pointer-events: none;
    background:
      radial-gradient(ellipse 60% 40% at 30% 30%, rgba(141, 87, 235, 0.16), transparent 60%),
      radial-gradient(ellipse 50% 35% at 75% 70%, rgba(247, 109, 184, 0.14), transparent 60%),
      radial-gradient(ellipse 65% 45% at 60% 20%, rgba(53, 104, 235, 0.12), transparent 60%);
    filter: blur(40px);
    animation: vapor-drift 26s ease-in-out infinite;
    opacity: 0.85;
    mix-blend-mode: multiply;
  }
  .vapor-secondary {
    background:
      radial-gradient(ellipse 45% 30% at 20% 75%, rgba(63, 182, 204, 0.10), transparent 60%),
      radial-gradient(ellipse 40% 30% at 85% 35%, rgba(141, 87, 235, 0.10), transparent 60%);
    animation-duration: 34s;
    animation-direction: reverse;
    opacity: 0.7;
  }
  .vapor-pink   { filter: blur(40px) hue-rotate(-10deg); }
  .vapor-violet { filter: blur(40px) hue-rotate(0deg);   }
  .vapor-blue   { filter: blur(40px) hue-rotate(15deg);  }
  .vapor-cyan   { filter: blur(40px) hue-rotate(35deg);  }

  @keyframes vapor-drift {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50%      { transform: translate(-3%, -2%) scale(1.04); }
  }

  /* shimmer */
  .shimmer {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .spark {
    position: absolute;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(189, 208, 255, 0.6) 50%, transparent 100%);
    animation: spark-pulse ease-in-out infinite;
    opacity: 0;
  }
  @keyframes spark-pulse {
    0%, 100% { opacity: 0; transform: translateY(0) scale(0.8); }
    20%      { opacity: 0.9; transform: translateY(-4px) scale(1); }
    50%      { opacity: 0.55; transform: translateY(-12px) scale(0.9); }
    80%      { opacity: 0.2; transform: translateY(-22px) scale(0.7); }
  }

  /* during processing — accelerate everything subtly */
  .ghost-field.processing .vapor {
    animation-duration: 14s;
  }
  .ghost-field.processing .spark {
    animation-duration: 3s !important;
  }

  @media (prefers-reduced-motion: reduce) {
    .vapor, .spark, .ghost-field.processing .vapor, .ghost-field.processing .spark {
      animation: none !important;
    }
    .spark { opacity: 0.3; }
  }
</style>
