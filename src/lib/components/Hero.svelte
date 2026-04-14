<script lang="ts">
  import HeroCanvas from './HeroCanvas.svelte';

  let visible = $state(false);

  $effect(() => {
    const timer = setTimeout(() => { visible = true; }, 100);
    return () => clearTimeout(timer);
  });
</script>

<section class="hero" id="hero">
  <HeroCanvas />

  <div class="hero-content container" class:visible>
    <div class="hero-badge">
      <span class="badge-dot"></span>
      <span class="badge-text">Laboratory active</span>
    </div>

    <h1 class="hero-headline">Weird ideas,<br />clean apps.</h1>

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

    <div class="hero-signal">
      <span class="signal-line"></span>
      <span class="signal-text">SIGNAL STRENGTH — NOMINAL</span>
      <span class="signal-line"></span>
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
    background: var(--color-bg);
  }

  .hero-content {
    position: relative;
    z-index: 10;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-8);
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
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
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    background: rgba(15, 15, 24, 0.6);
    backdrop-filter: blur(10px);
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
    50% { opacity: 0.5; box-shadow: 0 0 8px var(--color-accent); }
  }

  .badge-text {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
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

  .hero-sub {
    font-size: var(--text-lg);
    color: var(--color-text-muted);
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
    border-radius: var(--radius-lg);
    font-family: var(--font-display);
    font-size: var(--text-sm);
    font-weight: 500;
    letter-spacing: 0.02em;
    text-decoration: none;
    cursor: pointer;
    transition: all var(--transition-interactive);
  }

  .btn-primary {
    background: var(--color-accent);
    color: var(--color-bg);
    box-shadow: 0 0 20px rgba(80, 200, 220, 0.2);
  }

  .btn-primary:hover {
    background: #60d8ec;
    box-shadow: 0 0 30px rgba(80, 200, 220, 0.35);
    transform: translateY(-2px);
  }

  .btn-primary:active {
    transform: translateY(0);
  }

  .btn-ghost {
    border: 1px solid var(--color-border);
    color: var(--color-text);
    background: rgba(15, 15, 24, 0.4);
    backdrop-filter: blur(10px);
  }

  .btn-ghost:hover {
    border-color: var(--color-accent-dim);
    color: var(--color-accent);
    transform: translateY(-2px);
  }

  .btn-ghost:active {
    transform: translateY(0);
  }

  .btn-icon {
    font-size: 0.85em;
    opacity: 0.7;
  }

  .hero-signal {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-top: var(--space-8);
    opacity: 0.3;
  }

  .signal-line {
    width: 40px;
    height: 1px;
    background: var(--color-accent);
  }

  .signal-text {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-faint);
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .hero-fade {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(to bottom, transparent, var(--color-bg));
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

    .hero-signal {
      display: none;
    }
  }
</style>
