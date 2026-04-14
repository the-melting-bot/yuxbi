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

  const lines = [
    'Useful things do not have to be boring.',
    'Weird things do not have to be messy.',
    'Small software can still feel like magic.',
    'The internet should still surprise people.',
    'One purpose is enough if it is the right one.',
    'Every experiment here was built because nothing else like it existed.'
  ];
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
            style="transition-delay: {i * 120 + 200}ms"
            class:visible
          >
            {line}
          </p>
        {/each}
      </div>

      <div class="manifesto-sig" class:visible>
        <span class="sig-line"></span>
        <span class="sig-text">— Yuxbi Lab</span>
      </div>
    </div>
  </div>

  <!-- Atmospheric accent -->
  <div class="manifesto-glow" aria-hidden="true"></div>
</section>

<style>
  .manifesto {
    position: relative;
    background: var(--color-bg);
    overflow: hidden;
  }

  .manifesto-inner {
    max-width: 720px;
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
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: 500;
    color: var(--color-text-muted);
    line-height: 1.4;
    max-width: 100%;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out), color 0.3s ease;
  }

  .manifesto-line.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .manifesto-line:hover {
    color: var(--color-text-bright);
  }

  .manifesto-sig {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-top: var(--space-12);
    opacity: 0;
    transition: opacity 0.6s var(--ease-out) 1s;
  }

  .manifesto-sig.visible {
    opacity: 0.4;
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
    background: radial-gradient(ellipse, rgba(80, 200, 220, 0.04) 0%, transparent 70%);
    pointer-events: none;
  }

  @media (max-width: 640px) {
    .manifesto-line {
      font-size: var(--text-lg);
    }
  }
</style>
