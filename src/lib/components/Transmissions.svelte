<script lang="ts">
  import { transmissions } from '$lib/data/transmissions';

  let sectionEl: HTMLElement;
  let visible = $state(false);

  $effect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) visible = true; },
      { threshold: 0.15 }
    );
    if (sectionEl) observer.observe(sectionEl);
    return () => observer.disconnect();
  });

  const typeIcons: Record<string, string> = {
    log: '▸',
    signal: '◉',
    note: '▹',
    alert: '◆'
  };
</script>

<section class="transmissions section-padding" id="transmissions" bind:this={sectionEl}>
  <div class="container">
    <div class="section-header" class:visible>
      <div class="section-label">
        <span class="label-marker">◎</span>
        <span>TRANSMISSION FEED</span>
      </div>
      <h2 class="section-title">Recovered signals from the lab.</h2>
      <p class="section-sub">Intercepted notes, field reports, and operational logs.</p>
    </div>

    <div class="feed" class:visible role="list">
      {#each transmissions as tx, i}
        <article class="tx-entry" style="animation-delay: {i * 100}ms" role="listitem">
          <div class="tx-timeline">
            <div class="tx-dot"></div>
            {#if i < transmissions.length - 1}
              <div class="tx-line"></div>
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
    background: var(--color-surface);
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
  }

  .tx-timeline {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    padding-top: var(--space-1);
  }

  .tx-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-accent-dim);
    border: 2px solid var(--color-surface);
    box-shadow: 0 0 8px rgba(80, 200, 220, 0.3);
    flex-shrink: 0;
  }

  .tx-line {
    width: 1px;
    flex: 1;
    background: linear-gradient(to bottom, var(--color-border), transparent);
    margin-top: var(--space-2);
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
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: rgba(15, 15, 24, 0.4);
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
  }
</style>
