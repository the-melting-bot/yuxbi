<script lang="ts">
  let sectionEl: HTMLElement;
  let visible = $state(false);
  let revealedLines = $state(0);

  const lines = [
    'Useful things do not have to be boring.',
    'Weird things do not have to be messy.',
    'Small software can still feel like magic.',
    'The internet should still surprise people.',
    'One purpose is enough if it is the right one.',
    'Every experiment here was built because nothing else like it existed.'
  ];

  $effect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          visible = true;
          // Stagger reveal each line with dramatic timing
          let i = 0;
          function next() {
            if (i <= lines.length) {
              revealedLines = i;
              i++;
              setTimeout(next, 250);
            }
          }
          setTimeout(next, 300);
        }
      },
      { threshold: 0.2 }
    );
    if (sectionEl) observer.observe(sectionEl);
    return () => observer.disconnect();
  });
</script>

<section class="manifesto section-padding" id="manifesto" bind:this={sectionEl}>
  <div class="container">
    <div class="manifesto-inner" class:visible>
      <div class="section-label">
        <span class="label-marker">△</span>
        <span>MANIFESTO</span>
      </div>

      <div class="manifesto-lines">
        {#each lines as line, i}
          <p
            class="manifesto-line"
            class:revealed={i < revealedLines}
            class:current={i === revealedLines - 1}
          >
            <span class="line-number">{String(i + 1).padStart(2, '0')}</span>
            <span class="line-text">{line}</span>
          </p>
        {/each}
      </div>

      <div class="manifesto-sig" class:visible={revealedLines >= lines.length}>
        <span class="sig-line"></span>
        <span class="sig-text">— Yuxbi Lab</span>
      </div>
    </div>
  </div>

  <!-- Atmospheric glow -->
  <div class="manifesto-glow" aria-hidden="true"></div>
</section>

<style>
  .manifesto {
    position: relative;
    background: var(--color-bg);
    overflow: hidden;
  }

  .manifesto-inner {
    max-width: 800px;
    opacity: 0;
    transition: opacity 0.5s var(--ease-out);
  }

  .manifesto-inner.visible {
    opacity: 1;
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
    margin-bottom: var(--space-12);
  }

  .label-marker {
    font-size: 0.7em;
    opacity: 0.6;
  }

  .manifesto-lines {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .manifesto-line {
    display: flex;
    align-items: baseline;
    gap: var(--space-5);
    opacity: 0;
    transform: translateY(20px) translateX(-10px);
    transition:
      opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
      transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
      color 0.3s ease;
    cursor: default;
  }

  .manifesto-line.revealed {
    opacity: 1;
    transform: translateY(0) translateX(0);
  }

  .manifesto-line.current .line-text {
    color: var(--color-text-bright);
    text-shadow: 0 0 24px rgba(53, 104, 235, 0.2);
  }

  .line-number {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-accent);
    opacity: 0.4;
    letter-spacing: 0.08em;
    flex-shrink: 0;
    min-width: 2ch;
  }

  .line-text {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: 500;
    color: var(--color-text-muted);
    line-height: 1.4;
    transition: color 0.5s ease, text-shadow 0.5s ease;
  }

  .manifesto-line:hover .line-text {
    color: var(--color-text-bright);
  }

  .manifesto-sig {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-top: var(--space-12);
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.8s var(--ease-out), transform 0.8s var(--ease-out);
  }

  .manifesto-sig.visible {
    opacity: 0.4;
    transform: translateY(0);
  }

  .sig-line {
    width: 32px;
    height: 1px;
    background: var(--color-accent);
  }

  .sig-text {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    color: var(--color-text-faint);
    letter-spacing: 0.08em;
  }

  .manifesto-glow {
    position: absolute;
    bottom: -200px;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 400px;
    background: radial-gradient(ellipse, rgba(53, 104, 235, 0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  @media (max-width: 640px) {
    .line-text {
      font-size: var(--text-lg);
    }

    .line-number {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .manifesto-line {
      opacity: 1;
      transform: none;
    }
    .manifesto-line.current .line-text {
      text-shadow: none;
    }
  }
</style>
