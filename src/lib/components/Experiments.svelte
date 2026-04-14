<script lang="ts">
  import { experiments } from '$lib/data/experiments';
  import ExperimentCard from './ExperimentCard.svelte';

  let sectionEl: HTMLElement;
  let visible = $state(false);

  $effect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) visible = true; },
      { threshold: 0.1 }
    );
    if (sectionEl) observer.observe(sectionEl);
    return () => observer.disconnect();
  });
</script>

<section class="experiments section-padding" id="experiments" bind:this={sectionEl}>
  <div class="container">
    <div class="section-header" class:visible>
      <div class="section-label">
        <span class="label-marker">◈</span>
        <span>FEATURED EXPERIMENTS</span>
      </div>
      <h2 class="section-title">Strange tools. Clean builds. Each one does exactly one thing.</h2>
    </div>

    <div class="experiments-grid" class:visible role="list">
      {#each experiments as experiment, i}
        <ExperimentCard {experiment} index={i} />
      {/each}
    </div>
  </div>
</section>

<style>
  .experiments {
    position: relative;
    background: var(--color-bg);
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
    max-width: 640px;
    letter-spacing: -0.01em;
  }

  .experiments-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-6);
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.7s var(--ease-out) 0.15s, transform 0.7s var(--ease-out) 0.15s;
  }

  .experiments-grid.visible {
    opacity: 1;
    transform: translateY(0);
  }

  @media (max-width: 1024px) {
    .experiments-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 640px) {
    .experiments-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
