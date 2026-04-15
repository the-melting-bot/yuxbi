<script lang="ts">
  import HeroCanvas from './HeroCanvas.svelte';
  import { getCursor, initCursorTracking } from '$lib/motion/cursor';

  let visible = $state(false);
  let heroEl: HTMLElement;

  // Parallax offsets driven by cursor
  let offsetX = $state(0);
  let offsetY = $state(0);

  $effect(() => {
    initCursorTracking();
    const timer = setTimeout(() => { visible = true; }, 200);

    let rafId: number;
    function tick() {
      const cursor = getCursor();
      if (cursor.active && heroEl) {
        const rect = heroEl.getBoundingClientRect();
        const cx = (cursor.x - rect.left) / rect.width - 0.5;
        const cy = (cursor.y - rect.top) / rect.height - 0.5;
        offsetX += (cx * 12 - offsetX) * 0.04;
        offsetY += (cy * 8 - offsetY) * 0.04;
      }
      rafId = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafId);
    };
  });
</script>

<section class="hero" id="hero" bind:this={heroEl}>
  <HeroCanvas />

  <!-- Floating decorative elements that react to cursor -->
  <div class="hero-floaters" aria-hidden="true">
    <div class="floater floater-1" style="transform: translate({offsetX * 2.5}px, {offsetY * 2.5}px)">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="18" stroke="rgba(53,104,235,0.25)" stroke-width="1"/>
        <circle cx="20" cy="20" r="8" stroke="rgba(53,104,235,0.15)" stroke-width="0.5"/>
      </svg>
    </div>
    <div class="floater floater-2" style="transform: translate({-offsetX * 1.8}px, {-offsetY * 1.5}px)">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10Z" fill="rgba(247,109,184,0.28)"/>
      </svg>
    </div>
    <div class="floater floater-3" style="transform: translate({offsetX * 3}px, {-offsetY * 2}px)">
      <svg width="30" height="6" viewBox="0 0 30 6" fill="none">
        <rect width="30" height="6" rx="3" fill="rgba(255,181,65,0.35)"/>
      </svg>
    </div>
    <div class="floater floater-4" style="transform: translate({-offsetX * 2}px, {offsetY * 3}px)">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="16" height="16" rx="3" stroke="rgba(53,104,235,0.25)" stroke-width="1" transform="rotate(15 10 10)"/>
      </svg>
    </div>
    <div class="floater floater-5" style="transform: translate({offsetX * 1.5}px, {offsetY * 2.2}px)">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 0L10 6L16 8L10 10L8 16L6 10L0 8L6 6Z" fill="rgba(27,182,115,0.28)"/>
      </svg>
    </div>
  </div>

  <div class="hero-content container" class:visible style="transform: translate({offsetX * 0.5}px, {offsetY * 0.3}px)">
    <div class="hero-badge">
      <span class="badge-dot"></span>
      <span class="badge-text">Laboratory active</span>
    </div>

    <h1 class="hero-headline">
      <span class="word-float" style="--float-delay: 0s">Weird</span>
      <span class="word-float" style="--float-delay: 0.05s">ideas,</span>
      <br />
      <span class="word-float" style="--float-delay: 0.1s">clean</span>
      <span class="word-float" style="--float-delay: 0.15s">apps.</span>
    </h1>

    <p class="hero-sub">
      Yuxbi is a digital lab for strange but useful experiments.
      One-purpose tools built from ideas too weird for anywhere else.
    </p>

    <div class="hero-actions">
      <a href="#experiments" class="btn btn-primary">
        <span class="btn-icon">◈</span>
        View Experiments
      </a>
      <a href="#transmissions" class="btn btn-ghost">
        <span class="btn-icon">◎</span>
        Enter Transmission
      </a>
    </div>

    <div class="hero-hint">
      <span class="hint-text">click anywhere to create fragments</span>
    </div>
  </div>

  <div class="hero-fade" aria-hidden="true"></div>
</section>

<style>
  .hero {
    position: relative;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: transparent;
  }

  /* === Floating decorative elements === */
  .hero-floaters {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 5;
  }

  .floater {
    position: absolute;
    will-change: transform;
    transition: transform 0.1s linear;
  }

  .floater-1 {
    top: 15%;
    left: 12%;
    animation: gentleFloat 8s ease-in-out infinite;
  }

  .floater-2 {
    top: 25%;
    right: 15%;
    animation: gentleFloat 6s ease-in-out infinite reverse;
  }

  .floater-3 {
    bottom: 30%;
    left: 8%;
    animation: gentleFloat 10s ease-in-out infinite;
    animation-delay: -2s;
  }

  .floater-4 {
    top: 60%;
    right: 10%;
    animation: gentleFloat 7s ease-in-out infinite;
    animation-delay: -4s;
  }

  .floater-5 {
    top: 40%;
    left: 30%;
    animation: gentleFloat 9s ease-in-out infinite reverse;
    animation-delay: -1s;
  }

  @keyframes gentleFloat {
    0%, 100% { translate: 0 0; }
    25% { translate: 8px -12px; }
    50% { translate: -4px -20px; }
    75% { translate: 12px -8px; }
  }

  /* === Hero content === */
  .hero-content {
    position: relative;
    z-index: 10;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-8);
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1),
                transform 1s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform;
  }

  .hero-content.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    border: 2px solid rgba(31, 47, 86, 0.22);
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.72);
    backdrop-filter: blur(8px);
    box-shadow: 0 5px 0 rgba(31, 47, 86, 0.12);
  }

  .badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-accent);
    animation: pulse-dot 2s ease-in-out infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; box-shadow: 0 0 4px var(--color-accent); }
    50% { opacity: 0.5; box-shadow: 0 0 12px var(--color-accent); }
  }

  .badge-text {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .hero-headline {
    font-family: var(--font-display);
    font-size: var(--text-hero);
    font-weight: 600;
    color: var(--color-text-bright);
    letter-spacing: -0.02em;
    line-height: 1.05;
  }

  .word-float {
    display: inline-block;
    animation: wordDrift 6s ease-in-out infinite;
    animation-delay: var(--float-delay);
  }

  @keyframes wordDrift {
    0%, 100% { translate: 0 0; }
    50% { translate: 0 -4px; }
  }

  .hero-sub {
    font-size: var(--text-lg);
    color: var(--color-text);
    max-width: 540px;
    line-height: 1.6;
  }

  .hero-actions {
    display: flex;
    gap: var(--space-4);
    margin-top: var(--space-4);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-6);
    border-radius: 16px;
    font-family: var(--font-display);
    font-size: var(--text-sm);
    font-weight: 500;
    letter-spacing: 0.02em;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .btn-primary {
    background: var(--color-accent);
    color: #fff;
    border: 2px solid #1f2f56;
    box-shadow: 0 6px 0 #1f2f56;
  }

  .btn-primary:hover {
    background: #4478ff;
    transform: translateY(-4px) scale(1.03) rotate(-1deg);
  }

  .btn-primary:active {
    transform: translateY(2px) scale(0.99);
    transition-duration: 0.1s;
    box-shadow: 0 3px 0 #1f2f56;
  }

  .btn-ghost {
    border: 2px solid var(--color-border);
    color: var(--color-text-bright);
    background: #fff;
    box-shadow: 0 6px 0 rgba(31, 47, 86, 0.14);
  }

  .btn-ghost:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
    transform: translateY(-4px) scale(1.03) rotate(1deg);
  }

  .btn-ghost:active {
    transform: translateY(2px) scale(0.99);
    transition-duration: 0.1s;
    box-shadow: 0 3px 0 rgba(31, 47, 86, 0.14);
  }

  .btn-icon {
    font-size: 0.85em;
    opacity: 0.7;
  }

  .hero-hint {
    margin-top: var(--space-6);
    opacity: 0.55;
  }

  .hint-text {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .hero-fade {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(to bottom, transparent, rgba(255, 246, 223, 0.95));
    z-index: 5;
  }

  @media (max-width: 640px) {
    .hero-headline {
      font-size: var(--text-3xl);
    }

    .hero-actions {
      flex-direction: column;
      width: 100%;
      max-width: 280px;
    }

    .btn {
      justify-content: center;
    }

    .hero-hint {
      display: none;
    }

    .floater {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .word-float,
    .floater {
      animation: none !important;
    }
    .hero-content {
      transition: opacity 0.3s ease;
      transform: none !important;
    }
  }
</style>
