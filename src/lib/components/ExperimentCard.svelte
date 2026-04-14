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
</script>

<article
  class="experiment-card"
  style="animation-delay: {index * 80}ms"
  role="listitem"
>
  <div class="card-header">
    <span class="card-codename">{experiment.codename}</span>
    <span class="card-status {status.class}">{status.label}</span>
  </div>

  <h3 class="card-name">{experiment.name}</h3>

  <p class="card-description">{experiment.description}</p>

  <div class="card-footer">
    <span class="card-category">{experiment.category}</span>
    <span class="card-arrow">→</span>
  </div>

  <div class="card-glow" aria-hidden="true"></div>
</article>

<style>
  .experiment-card {
    position: relative;
    padding: var(--space-8);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    overflow: hidden;
    cursor: pointer;
    transition:
      border-color 0.3s var(--ease-out),
      transform 0.3s var(--ease-out),
      box-shadow 0.3s var(--ease-out);
  }

  .experiment-card:hover {
    border-color: rgba(80, 200, 220, 0.3);
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 40px rgba(80, 200, 220, 0.06);
  }

  .experiment-card:hover .card-glow {
    opacity: 1;
  }

  .experiment-card:hover .card-arrow {
    transform: translateX(4px);
    color: var(--color-accent);
  }

  .card-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--color-accent), transparent);
    opacity: 0;
    transition: opacity 0.3s var(--ease-out);
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
    font-family: var(--font-display);
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    border: 1px solid;
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
    transition: transform 0.3s var(--ease-out), color 0.3s var(--ease-out);
  }
</style>
