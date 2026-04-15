<script lang="ts">
  import { getCursor } from '$lib/motion/cursor';

  let sectionEl: HTMLElement;
  let visible = $state(false);
  let cardOffsets = $state([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 }
  ]);

  $effect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) visible = true; },
      { threshold: 0.15 }
    );
    if (sectionEl) observer.observe(sectionEl);

    let rafId: number;
    function tick() {
      const cursor = getCursor();
      if (cursor.active && sectionEl) {
        const rect = sectionEl.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const cx = (cursor.x - rect.left) / rect.width - 0.5;
          const cy = (cursor.y - rect.top) / rect.height - 0.5;
          // Each card reacts differently
          for (let i = 0; i < 3; i++) {
            const multiplier = (i + 1) * 3;
            const dir = i % 2 === 0 ? 1 : -1;
            cardOffsets[i] = {
              x: cardOffsets[i].x + (cx * multiplier * dir - cardOffsets[i].x) * 0.04,
              y: cardOffsets[i].y + (cy * multiplier - cardOffsets[i].y) * 0.04
            };
          }
        }
      }
      rafId = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  });
</script>

<section class="about section-padding" id="about" bind:this={sectionEl}>
  <div class="container">
    <div class="about-inner" class:visible>
      <div class="about-label">
        <span class="label-marker">◆</span>
        <span>WHAT THIS IS</span>
        <span class="label-doodle" aria-hidden="true">~◌~</span>
      </div>

      <h2 class="about-headline">Not a portfolio. Not a SaaS page. Not a normal anything.</h2>

      <div class="about-grid">
        {#each [
          { icon: '⬡', text: 'Yuxbi is a weird-product lab. A home for strange digital experiments that do one thing, and do it well.' },
          { icon: '◇', text: 'Every experiment starts as an idea too odd for a normal product roadmap. Here, that is the roadmap.' },
          { icon: '△', text: 'Clean execution. Strange purpose. Each tool is a small, polished artifact designed to be useful in unexpected ways.' }
        ] as card, i}
          <div
            class="about-card"
            style="
              transform: translate({cardOffsets[i].x}px, {cardOffsets[i].y}px);
              animation-delay: {i * 0.1}s;
            "
          >
            <div class="card-icon-wrapper">
              <span class="card-icon">{card.icon}</span>
            </div>
            <p>{card.text}</p>
          </div>
        {/each}
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
    transition: opacity 0.8s var(--ease-out), transform 0.8s var(--ease-out);
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

  .label-doodle {
    color: var(--color-secondary);
    letter-spacing: 0.02em;
    font-size: 0.85rem;
    opacity: 0.75;
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
    border: 2px solid rgba(31, 47, 86, 0.18);
    border-radius: var(--radius-xl);
    background: linear-gradient(180deg, #ffffff 0%, #fff5dd 100%);
    will-change: transform;
    transition:
      border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    animation: aboutFloat 7s ease-in-out infinite;
  }

  @keyframes aboutFloat {
    0%, 100% { translate: 0 0; }
    50% { translate: 0 -5px; }
  }

  .about-card:hover {
    border-color: rgba(53, 104, 235, 0.35);
    box-shadow:
      0 8px 0 rgba(31, 47, 86, 0.14),
      0 0 24px rgba(53, 104, 235, 0.08);
  }

  .card-icon-wrapper {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    background: rgba(53, 104, 235, 0.08);
    border: 2px solid rgba(53, 104, 235, 0.15);
    margin-bottom: var(--space-5);
  }

  .card-icon {
    font-size: var(--text-lg);
    color: var(--color-accent);
    opacity: 0.7;
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
    .about-card {
      animation: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .about-card {
      animation: none !important;
      transform: none !important;
    }
  }
</style>
