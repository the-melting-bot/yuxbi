<script lang="ts">
  let sectionEl: HTMLElement;
  let visible = $state(false);

  $effect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) visible = true; },
      { threshold: 0.2 }
    );
    if (sectionEl) observer.observe(sectionEl);
    return () => observer.disconnect();
  });
</script>

<section class="about section-padding" id="about" bind:this={sectionEl}>
  <div class="container">
    <div class="about-inner" class:visible>
      <div class="about-label">
        <span class="label-marker">◆</span>
        <span>WHAT THIS IS</span>
      </div>

      <h2 class="about-headline">Not a portfolio. Not a SaaS page. Not a normal anything.</h2>

      <div class="about-grid">
        <div class="about-card">
          <div class="card-icon">⬡</div>
          <p>Yuxbi is a weird-product lab. A home for strange digital experiments that do one thing, and do it well.</p>
        </div>
        <div class="about-card">
          <div class="card-icon">◇</div>
          <p>Every experiment starts as an idea too odd for a normal product roadmap. Here, that is the roadmap.</p>
        </div>
        <div class="about-card">
          <div class="card-icon">△</div>
          <p>Clean execution. Strange purpose. Each tool is a small, polished artifact designed to be useful in unexpected ways.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .about {
    position: relative;
    background: var(--color-bg);
  }

  .about-inner {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.7s var(--ease-out), transform 0.7s var(--ease-out);
  }

  .about-inner.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .about-label {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-accent);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: var(--space-8);
  }

  .label-marker {
    font-size: 0.6em;
    opacity: 0.6;
  }

  .about-headline {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--color-text-bright);
    max-width: 720px;
    margin-bottom: var(--space-12);
    letter-spacing: -0.01em;
  }

  .about-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-6);
  }

  .about-card {
    padding: var(--space-8);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    transition: border-color var(--transition-interactive),
                box-shadow var(--transition-interactive);
  }

  .about-card:hover {
    border-color: rgba(80, 200, 220, 0.2);
    box-shadow: var(--shadow-glow);
  }

  .card-icon {
    font-size: var(--text-xl);
    color: var(--color-accent);
    margin-bottom: var(--space-4);
    opacity: 0.6;
  }

  .about-card p {
    font-size: var(--text-base);
    color: var(--color-text-muted);
    line-height: 1.7;
  }

  @media (max-width: 768px) {
    .about-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
