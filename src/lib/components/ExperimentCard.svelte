<script lang="ts">
  import type { Experiment } from '$lib/data/experiments';

  interface Props {
    experiment: Experiment;
    index: number;
    onShelf: boolean;
  }

  let { experiment, index, onShelf }: Props = $props();

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
  let rotate = $state(0);
  let settled = $state(false);

  $effect(() => {
    if (!onShelf || settled) return;
    const timer = setTimeout(() => {
      settled = true;
    }, 600 + index * 80);

    return () => clearTimeout(timer);
  });

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

    targetTiltX = (y - 0.5) * -18;
    targetTiltY = (x - 0.5) * 18;
    rotate = (x - 0.5) * 3.2;
    glowX = x * 100;
    glowY = y * 100;
  }

  function onMouseEnter() {
    isHovered = true;
    floatY = -10;

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
    rotate = 0;

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
    transform: perspective(800px) rotateX({tiltX}deg) rotateY({tiltY}deg) rotateZ({rotate}deg) translateY({floatY}px);
    --glow-x: {glowX}%;
    --glow-y: {glowY}%;
  "
  class:hovered={isHovered}
  class:on-shelf={onShelf}
  class:settled={settled}
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

  <div class="card-doodle" aria-hidden="true">
    {#if experiment.icon === 'lens'}
      <svg viewBox="0 0 80 80" fill="none">
        <circle cx="36" cy="36" r="22" stroke="#2047af" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 5"/>
        <circle cx="36" cy="36" r="11" stroke="#3568eb" stroke-width="3"/>
        <path d="M50 51L66 68" stroke="#2047af" stroke-width="4" stroke-linecap="round"/>
      </svg>
    {:else if experiment.icon === 'radar'}
      <svg viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="24" stroke="#3568eb" stroke-width="3"/>
        <circle cx="40" cy="40" r="14" stroke="#3568eb" stroke-width="3" stroke-dasharray="4 7"/>
        <path d="M40 40L57 26" stroke="#f76db8" stroke-width="4" stroke-linecap="round"/>
        <circle cx="57" cy="26" r="4" fill="#f76db8"/>
      </svg>
    {:else if experiment.icon === 'ghost'}
      <svg viewBox="0 0 80 80" fill="none">
        <path d="M24 51V35C24 25 31 18 40 18C49 18 56 25 56 35V51L51 47L46 51L40 47L34 51L29 47L24 51Z" fill="#ffffff" stroke="#1f2f56" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="35" cy="36" r="3" fill="#1f2f56"/>
        <circle cx="45" cy="36" r="3" fill="#1f2f56"/>
      </svg>
    {:else if experiment.icon === 'table'}
      <svg viewBox="0 0 80 80" fill="none">
        <rect x="16" y="22" width="48" height="36" rx="8" fill="#fff" stroke="#1f2f56" stroke-width="3"/>
        <path d="M16 34H64M32 22V58M48 22V58" stroke="#3568eb" stroke-width="3"/>
        <circle cx="24" cy="28" r="2.5" fill="#f39a19"/>
      </svg>
    {:else if experiment.icon === 'orbit'}
      <svg viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="8" fill="#8d57eb"/>
        <ellipse cx="40" cy="40" rx="26" ry="13" stroke="#1f2f56" stroke-width="3"/>
        <ellipse cx="40" cy="40" rx="13" ry="26" stroke="#3568eb" stroke-width="3"/>
        <circle cx="27" cy="25" r="3.5" fill="#f76db8"/>
      </svg>
    {:else}
      <svg viewBox="0 0 80 80" fill="none">
        <path d="M12 47C20 38 31 36 40 40C49 44 61 43 68 34" stroke="#3568eb" stroke-width="4" stroke-linecap="round"/>
        <path d="M12 57C21 49 31 47 40 50C49 53 60 51 68 43" stroke="#f76db8" stroke-width="4" stroke-linecap="round"/>
        <circle cx="20" cy="29" r="4" fill="#1bb673"/>
      </svg>
    {/if}
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
    border: 2px solid rgba(31, 47, 86, 0.2);
    border-radius: var(--radius-xl);
    background: linear-gradient(180deg, #ffffff 0%, #fff8e9 100%);
    overflow: hidden;
    cursor: pointer;
    will-change: transform;
    transform-style: preserve-3d;
    transition:
      box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
      border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1),
      background 0.4s ease;
    transform-origin: center 70%;
  }

  .experiment-card.on-shelf {
    animation: shelfSettle 0.7s var(--ease-elastic) both;
    animation-delay: calc(var(--index) * 80ms);
  }

  .experiment-card.on-shelf.settled {
    animation: cardFloat calc(7s + var(--index) * 0.45s) ease-in-out infinite;
    animation-delay: calc(var(--index) * -0.7s);
  }

  @keyframes shelfSettle {
    0% { translate: 0 18px; }
    55% { translate: 0 -6px; }
    78% { translate: 0 3px; }
    100% { translate: 0 0; }
  }

  @keyframes cardFloat {
    0%, 100% { translate: 0 0; }
    50% { translate: 0 -6px; }
  }

  .experiment-card.hovered {
    border-color: rgba(53, 104, 235, 0.35);
    box-shadow:
      0 14px 0 rgba(31, 47, 86, 0.14),
      0 0 26px rgba(53, 104, 235, 0.1);
    background: linear-gradient(180deg, #ffffff 0%, #eff4ff 100%);
    z-index: 2;
  }

  /* Cursor-following spotlight */
  .card-spotlight {
    position: absolute;
    inset: 0;
    opacity: 0;
    background: radial-gradient(
      300px circle at var(--glow-x) var(--glow-y),
      rgba(53, 104, 235, 0.13),
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
    background: linear-gradient(90deg, transparent, #f76db8, var(--color-accent), transparent);
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
    border-color: rgba(27, 182, 115, 0.28);
    background: rgba(27, 182, 115, 0.1);
  }

  .status-pending {
    color: var(--color-signal-pending);
    border-color: rgba(243, 154, 25, 0.28);
    background: rgba(243, 154, 25, 0.1);
  }

  .status-classified {
    color: var(--color-signal-classified);
    border-color: rgba(141, 87, 235, 0.3);
    background: rgba(141, 87, 235, 0.1);
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

  .card-doodle {
    width: 68px;
    height: 68px;
    margin-bottom: var(--space-4);
    padding: 8px;
    border-radius: 14px;
    border: 2px solid rgba(31, 47, 86, 0.16);
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0 4px 0 rgba(31, 47, 86, 0.1);
  }

  .card-doodle svg {
    width: 100%;
    height: 100%;
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
