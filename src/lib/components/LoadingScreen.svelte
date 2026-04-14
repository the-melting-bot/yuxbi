<script lang="ts">
  let phase = $state(0); // 0=assembling, 1=calibrating, 2=launching, 3=done
  let progress = $state(0);
  let opacity = $state(1);
  let done = $state(false);
  let fragments: { x: number; y: number; r: number; s: number; dx: number; dy: number; delay: number }[] = $state([]);

  const messages = [
    'INITIALIZING LAB SYSTEMS',
    'CALIBRATING SIGNAL ARRAY',
    'ENGAGING DRIFT PROTOCOL',
    'LABORATORY ACTIVE'
  ];

  $effect(() => {
    // Generate fragment positions (converge to center)
    const frags = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dist = 120 + Math.random() * 80;
      frags.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        r: Math.random() * 360,
        s: Math.random() * 0.5 + 0.5,
        dx: (Math.random() - 0.5) * 200,
        dy: (Math.random() - 0.5) * 200,
        delay: i * 0.04
      });
    }
    fragments = frags;

    // Progress animation
    const startTime = Date.now();
    const totalDuration = 2200;

    function tick() {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / totalDuration, 1);

      progress = t;

      if (t < 0.3) phase = 0;
      else if (t < 0.55) phase = 1;
      else if (t < 0.8) phase = 2;
      else phase = 3;

      if (t >= 1) {
        // Fade out
        opacity = 0;
        setTimeout(() => { done = true; }, 600);
        return;
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
</script>

{#if !done}
  <div
    class="loading-screen"
    style="opacity: {opacity}; pointer-events: {opacity > 0.5 ? 'all' : 'none'}"
    aria-live="polite"
    role="status"
  >
    <!-- Magnetic assembly fragments -->
    <div class="assembly-container">
      {#each fragments as frag, i}
        <div
          class="fragment"
          style="
            --start-x: {frag.dx}px;
            --start-y: {frag.dy}px;
            --target-x: {frag.x}px;
            --target-y: {frag.y}px;
            --rotation: {frag.r}deg;
            --scale: {frag.s};
            --delay: {frag.delay}s;
            --progress: {progress};
          "
          class:assembled={progress > 0.4}
          class:launched={progress > 0.75}
        >
          {#if i % 3 === 0}
            <svg width="20" height="4" viewBox="0 0 20 4" fill="none">
              <rect width="20" height="4" rx="2" fill="rgba(80,200,220,0.6)"/>
            </svg>
          {:else if i % 3 === 1}
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <circle cx="4" cy="4" r="3" stroke="rgba(100,180,255,0.5)" stroke-width="1"/>
            </svg>
          {:else}
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 0L7 5L5 10L3 5Z" fill="rgba(144,96,192,0.5)"/>
            </svg>
          {/if}
        </div>
      {/each}

      <!-- Central logo mark -->
      <div class="logo-mark" class:visible={progress > 0.3}>
        <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
          <rect x="2" y="2" width="28" height="28" rx="6" stroke="rgba(80,200,220,0.5)" stroke-width="1.5"/>
          <path d="M8 10L16 20L24 10" stroke="var(--color-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="16" cy="24" r="1.5" fill="var(--color-accent)"/>
        </svg>
      </div>
    </div>

    <!-- Status text -->
    <div class="status-area">
      <p class="status-message">{messages[phase]}</p>
      <div class="progress-bar">
        <div class="progress-fill" style="width: {progress * 100}%"></div>
      </div>
    </div>
  </div>
{/if}

<style>
  .loading-screen {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: var(--color-bg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-12);
    transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .assembly-container {
    position: relative;
    width: 280px;
    height: 280px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .fragment {
    position: absolute;
    left: 50%;
    top: 50%;
    transform:
      translate(
        calc(-50% + var(--start-x)),
        calc(-50% + var(--start-y))
      )
      rotate(calc(var(--rotation) + 180deg))
      scale(0.3);
    opacity: 0;
    animation: fragmentAssemble 1.2s cubic-bezier(0.16, 1, 0.3, 1) var(--delay) forwards;
  }

  .fragment.assembled {
    filter: drop-shadow(0 0 6px rgba(80, 200, 220, 0.3));
  }

  .fragment.launched {
    animation: fragmentLaunch 0.5s cubic-bezier(0.4, 0, 1, 1) forwards;
  }

  @keyframes fragmentAssemble {
    0% {
      transform:
        translate(
          calc(-50% + var(--start-x)),
          calc(-50% + var(--start-y))
        )
        rotate(calc(var(--rotation) + 180deg))
        scale(0.3);
      opacity: 0;
    }
    100% {
      transform:
        translate(
          calc(-50% + var(--target-x)),
          calc(-50% + var(--target-y))
        )
        rotate(var(--rotation))
        scale(var(--scale));
      opacity: 1;
    }
  }

  @keyframes fragmentLaunch {
    0% {
      opacity: 1;
    }
    100% {
      transform:
        translate(
          calc(-50% + var(--target-x) * 3),
          calc(-50% + var(--target-y) * 3 - 100px)
        )
        rotate(calc(var(--rotation) + 90deg))
        scale(0.2);
      opacity: 0;
    }
  }

  .logo-mark {
    position: absolute;
    opacity: 0;
    transform: scale(0.5);
    transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    filter: drop-shadow(0 0 20px rgba(80, 200, 220, 0.3));
  }

  .logo-mark.visible {
    opacity: 1;
    transform: scale(1);
  }

  .status-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
  }

  .status-message {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    letter-spacing: 0.2em;
    text-transform: uppercase;
    min-height: 1.2em;
    transition: opacity 0.2s ease;
  }

  .progress-bar {
    width: 160px;
    height: 2px;
    background: var(--color-border);
    border-radius: 1px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--color-accent);
    border-radius: 1px;
    transition: width 0.15s ease;
    box-shadow: 0 0 8px rgba(80, 200, 220, 0.4);
  }

  @media (prefers-reduced-motion: reduce) {
    .fragment {
      animation: none !important;
      opacity: 1;
      transform: translate(calc(-50% + var(--target-x)), calc(-50% + var(--target-y)))
                 rotate(var(--rotation)) scale(var(--scale));
    }
    .fragment.launched {
      animation: none !important;
      opacity: 0;
    }
  }
</style>
