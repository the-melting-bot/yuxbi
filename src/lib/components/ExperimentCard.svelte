<script lang="ts">
  import type { Experiment } from '$lib/data/experiments';

  interface Props {
    experiment: Experiment;
    index: number;
  }

  let { experiment, index }: Props = $props();

  const statusMap = {
    active: { label: 'Active', class: 'status-active' },
    pending: { label: 'Pending', class: 'status-pending' },
    classified: { label: 'Classified', class: 'status-classified' }
  } as const;

  let status = $derived(statusMap[experiment.status]);

  // Tilt physics state
  let cardEl: HTMLElement;
  let tiltX = $state(0);
  let tiltY = $state(0);
  let glowX = $state(50);
  let glowY = $state(50);
  let isHovered = $state(false);
  let floatY = $state(0);

  // Smooth tilt with spring physics
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;
  let rafId: number;

  function onMouseMove(e: MouseEvent) {
    if (!cardEl) return;
    const rect = cardEl.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    targetTiltX = (y - 0.5) * -12;
    targetTiltY = (x - 0.5) * 12;
    glowX = x * 100;
    glowY = y * 100;
  }

  function onMouseEnter() {
    isHovered = true;
    floatY = -6;

    function tick() {
      currentTiltX += (targetTiltX - currentTiltX) * 0.12;
      currentTiltY += (targetTiltY - currentTiltY) * 0.12;
      tiltX = currentTiltX;
      tiltY = currentTiltY;

      if (isHovered) {
        rafId = requestAnimationFrame(tick);
      }
    }
    tick();
  }

  function onMouseLeave() {
    isHovered = false;
    targetTiltX = 0;
    targetTiltY = 0;
    floatY = 0;

    // Spring back
    function springBack() {
      currentTiltX += (0 - currentTiltX) * 0.08;
      currentTiltY += (0 - currentTiltY) * 0.08;
      tiltX = currentTiltX;
      tiltY = currentTiltY;

      if (Math.abs(currentTiltX) > 0.1 || Math.abs(currentTiltY) > 0.1) {
        requestAnimationFrame(springBack);
      } else {
        tiltX = 0;
        tiltY = 0;
      }
    }
    cancelAnimationFrame(rafId);
    springBack();
  }
</script>

<article
  class="experiment-card"
  bind:this={cardEl}
  style="
    --index: {index};
    transform: perspective(800px) rotateX({tiltX}deg) rotateY({tiltY}deg) translateY({floatY}px);
    --glow-x: {glowX}%;
    --glow-y: {glowY}%;
  "
  class:hovered={isHovered}
  onmousemove={onMouseMove}
  onmouseenter={onMouseEnter}
  onmouseleave={onMouseLeave}
  role="listitem"
>
  <!-- Spotlight glow that follows cursor -->
  <div class="card-spotlight" aria-hidden="true"></div>

  <div class="card-header">
    <span class="card-codename">{experiment.codename}</span>
    <span class="card-status {status.class}">
      <span class="status-dot"></span>
      {status.label}
    </span>
  </div>

  <h3 class="card-name">{experiment.name}</h3>

  <p class="card-description">{experiment.description}</p>

  <div class="card-footer">
    <span class="card-category">{experiment.category}</span>
    <span class="card-arrow">→</span>
  </div>

  <div class="card-glow-line" aria-hidden="true"></div>
</article>

<style>
  .experiment-card {
    position: relative;
    padding: var(--space-8);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    background: var(--color-surface);
    overflow: hidden;
    cursor: pointer;
    will-change: transform;
    transform-style: preserve-3d;
    transition:
      box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
      border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    /* Staggered float animation */
    animation: cardFloat calc(6s + var(--index) * 0.5s) ease-in-out infinite;
    animation-delay: calc(var(--index) * -0.8s);
  }

  @keyframes cardFloat {
    0%, 100% { translate: 0 0; }
    50% { translate: 0 -4px; }
  }

  .experiment-card.hovered {
    border-color: rgba(80, 200, 220, 0.3);
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.4),
      0 0 40px rgba(80, 200, 220, 0.06);
    z-index: 2;
  }

  /* Cursor-following spotlight */
  .card-spotlight {
    position: absolute;
    inset: 0;
    opacity: 0;
    background: radial-gradient(
      300px circle at var(--glow-x) var(--glow-y),
      rgba(80, 200, 220, 0.06),
      transparent 60%
    );
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .experiment-card.hovered .card-spotlight {
    opacity: 1;
  }

  /* Top glow line */
  .card-glow-line {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--color-accent), transparent);
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .experiment-card.hovered .card-glow-line {
    opacity: 1;
  }

  .experiment-card.hovered .card-arrow {
    transform: translateX(6px);
    color: var(--color-accent);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-6);
  }

  .card-codename {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-faint);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .card-status {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-display);
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    border: 1px solid;
  }

  .status-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
    animation: statusPulse 2s ease-in-out infinite;
  }

  @keyframes statusPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .status-active {
    color: var(--color-signal-active);
    border-color: rgba(80, 200, 220, 0.3);
    background: rgba(80, 200, 220, 0.06);
  }

  .status-pending {
    color: var(--color-signal-pending);
    border-color: rgba(136, 136, 160, 0.3);
    background: rgba(136, 136, 160, 0.06);
  }

  .status-classified {
    color: var(--color-signal-classified);
    border-color: rgba(144, 96, 192, 0.3);
    background: rgba(144, 96, 192, 0.06);
  }

  .card-name {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--color-text-bright);
    margin-bottom: var(--space-3);
    letter-spacing: -0.01em;
    transition: color 0.3s ease;
  }

  .experiment-card.hovered .card-name {
    color: var(--color-accent);
  }

  .card-description {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    line-height: 1.7;
    margin-bottom: var(--space-8);
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-category {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-faint);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .card-arrow {
    font-size: var(--text-lg);
    color: var(--color-text-faint);
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s ease;
  }

  @media (prefers-reduced-motion: reduce) {
    .experiment-card {
      animation: none !important;
      transform: none !important;
    }
    .experiment-card.hovered {
      transform: none !important;
    }
  }

  @media (max-width: 768px) {
    .experiment-card {
      animation: none;
    }
  }
</style>
