<script lang="ts">
  import { transmissions } from '$lib/data/transmissions';

  let sectionEl: HTMLElement;
  let visible = $state(false);
  let activeIndex = $state(-1);
  let scanPosition = $state(0);

  const typeIcons: Record<string, string> = {
    log: '▸',
    signal: '◉',
    note: '▹',
    alert: '◆'
  };

  $effect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          visible = true;
          startScanAnimation();
        }
      },
      { threshold: 0.15 }
    );
    if (sectionEl) observer.observe(sectionEl);

    return () => observer.disconnect();
  });

  function startScanAnimation() {
    // Stagger reveal each transmission entry
    let i = 0;
    function revealNext() {
      if (i < transmissions.length) {
        activeIndex = i;
        i++;
        setTimeout(revealNext, 200);
      }
    }
    setTimeout(revealNext, 400);

    // Continuous scan line
    let scanRaf: number;
    function animateScan() {
      scanPosition = (scanPosition + 0.3) % 100;
      scanRaf = requestAnimationFrame(animateScan);
    }
    animateScan();
  }
</script>

<section class="transmissions section-padding" id="transmissions" bind:this={sectionEl}>
  <!-- Scan line effect -->
  <div class="scan-line" style="top: {scanPosition}%" aria-hidden="true"></div>

  <div class="container">
    <div class="section-header" class:visible>
      <div class="section-label">
        <span class="label-marker">◎</span>
        <span>TRANSMISSION FEED</span>
        <span class="live-indicator">
          <span class="live-dot"></span>
          LIVE
        </span>
      </div>
      <h2 class="section-title">Recovered signals from the lab.</h2>
      <p class="section-sub">Intercepted notes, field reports, and operational logs.</p>
    </div>

    <div class="feed" class:visible role="list">
      {#each transmissions as tx, i}
        <article
          class="tx-entry"
          class:revealed={i <= activeIndex}
          role="listitem"
        >
          <div class="tx-timeline">
            <div class="tx-dot" class:active={i <= activeIndex}>
              <span class="tx-ping" class:active={i === activeIndex}></span>
            </div>
            {#if i < transmissions.length - 1}
              <div class="tx-line" class:active={i < activeIndex}></div>
            {/if}
          </div>

          <div class="tx-content">
            <div class="tx-meta">
              <span class="tx-sequence">{tx.sequence}</span>
              <span class="tx-divider">·</span>
              <span class="tx-timestamp">{tx.timestamp}</span>
            </div>

            <div class="tx-label">
              <span class="tx-icon">{typeIcons[tx.type]}</span>
              <span>{tx.label}</span>
            </div>

            <p class="tx-body">{tx.content}</p>
          </div>
        </article>
      {/each}
    </div>
  </div>
</section>

<style>
  .transmissions {
    position: relative;
    background: linear-gradient(180deg, #fff0cc 0%, #ffe7ba 100%);
    overflow: hidden;
    border-block: 2px solid rgba(31, 47, 86, 0.12);
  }

  /* Scanning line */
  .scan-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(53, 104, 235, 0.15) 20%,
      rgba(53, 104, 235, 0.35) 50%,
      rgba(53, 104, 235, 0.15) 80%,
      transparent 100%
    );
    pointer-events: none;
    z-index: 1;
    box-shadow: 0 0 16px rgba(53, 104, 235, 0.16);
  }

  .section-header {
    margin-bottom: var(--space-12);
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out);
  }

  .section-header.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .section-label {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-accent);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: var(--space-6);
  }

  .label-marker {
    font-size: 0.7em;
    opacity: 0.6;
  }

  .live-indicator {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    margin-left: var(--space-4);
    padding: 2px 8px;
    border-radius: var(--radius-full);
    background: rgba(53, 104, 235, 0.1);
    border: 2px solid rgba(53, 104, 235, 0.2);
    font-size: 0.7rem;
    letter-spacing: 0.15em;
  }

  .live-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--color-accent);
    animation: livePulse 1.5s ease-in-out infinite;
  }

  @keyframes livePulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .section-title {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--color-text-bright);
    margin-bottom: var(--space-3);
  }

  .section-sub {
    font-size: var(--text-base);
    color: var(--color-text-muted);
  }

  .feed {
    max-width: 720px;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.7s var(--ease-out) 0.15s, transform 0.7s var(--ease-out) 0.15s;
  }

  .feed.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .tx-entry {
    display: flex;
    gap: var(--space-6);
    padding-bottom: var(--space-8);
    opacity: 0;
    transform: translateX(-10px);
    transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .tx-entry.revealed {
    opacity: 1;
    transform: translateX(0);
  }

  .tx-timeline {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    padding-top: var(--space-1);
  }

  .tx-dot {
    position: relative;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-border);
    border: 2px solid #ffe9c2;
    flex-shrink: 0;
    transition: background 0.4s ease, box-shadow 0.4s ease;
  }

  .tx-dot.active {
    background: var(--color-accent);
    box-shadow: 0 0 10px rgba(53, 104, 235, 0.3);
  }

  .tx-ping {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 1px solid var(--color-accent);
    opacity: 0;
    pointer-events: none;
  }

  .tx-ping.active {
    animation: pingExpand 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes pingExpand {
    0% { transform: scale(0.5); opacity: 0.8; }
    100% { transform: scale(2.5); opacity: 0; }
  }

  .tx-line {
    width: 1px;
    flex: 1;
    background: var(--color-border);
    margin-top: var(--space-2);
    transition: background 0.4s ease;
  }

  .tx-line.active {
    background: linear-gradient(to bottom, rgba(80, 200, 220, 0.3), var(--color-border));
  }

  .tx-content {
    flex: 1;
  }

  .tx-meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }

  .tx-sequence {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-accent);
    letter-spacing: 0.1em;
    font-weight: 500;
  }

  .tx-divider {
    color: var(--color-text-faint);
  }

  .tx-timestamp {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-faint);
    letter-spacing: 0.04em;
  }

  .tx-label {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: var(--space-3);
    padding: var(--space-1) var(--space-3);
    border: 2px solid rgba(31, 47, 86, 0.16);
    border-radius: var(--radius-sm);
    background: rgba(255, 255, 255, 0.65);
  }

  .tx-icon {
    color: var(--color-accent);
    font-size: 0.7em;
  }

  .tx-body {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    line-height: 1.7;
  }

  @media (max-width: 640px) {
    .tx-timeline {
      display: none;
    }

    .tx-entry {
      padding-left: var(--space-4);
      border-left: 1px solid var(--color-border);
    }

    .tx-entry.revealed {
      border-left-color: rgba(80, 200, 220, 0.2);
    }

    .scan-line {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .tx-entry {
      opacity: 1;
      transform: none;
    }
    .scan-line {
      display: none;
    }
    .tx-ping {
      animation: none !important;
    }
  }
</style>
