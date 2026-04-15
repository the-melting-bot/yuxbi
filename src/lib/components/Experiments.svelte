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
      <p class="section-sub">Hover to examine. Click anywhere in the hero to leave your mark.</p>
    </div>

    <div class="shelf-wrap" class:visible>
      <div class="shelf-rail shelf-rail-top" aria-hidden="true"></div>
      <div class="experiments-grid" role="list">
      {#each experiments as experiment, i}
        <ExperimentCard {experiment} index={i} />
      {/each}
      </div>
      <div class="shelf-rail shelf-rail-bottom" aria-hidden="true"></div>
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
    margin-bottom: var(--space-3);
  }

  .section-sub {
    font-size: var(--text-sm);
    color: var(--color-text-faint);
  }

  .shelf-wrap {
    position: relative;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.7s var(--ease-out) 0.15s, transform 0.7s var(--ease-out) 0.15s;
    padding: var(--space-10) var(--space-6);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(255, 244, 219, 0.8));
    border: 2px solid rgba(31, 47, 86, 0.16);
    border-radius: 26px;
    box-shadow: 0 8px 0 rgba(31, 47, 86, 0.1);
  }

  .shelf-wrap.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .shelf-rail {
    position: absolute;
    left: var(--space-6);
    right: var(--space-6);
    height: 16px;
    border-radius: 999px;
    border: 2px solid rgba(31, 47, 86, 0.16);
    background: linear-gradient(180deg, #ffd88f, #ffc86a);
    box-shadow: 0 4px 0 rgba(31, 47, 86, 0.12);
  }

  .shelf-rail-top {
    top: -12px;
  }

  .shelf-rail-bottom {
    bottom: -12px;
  }

  .experiments-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-6);
  }

  @media (max-width: 1024px) {
    .experiments-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 640px) {
    .shelf-wrap {
      padding-inline: var(--space-4);
    }

    .shelf-rail {
      left: var(--space-4);
      right: var(--space-4);
    }

    .experiments-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
