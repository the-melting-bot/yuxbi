<script lang="ts">
  import { getCursor } from '$lib/motion/cursor';

  let sectionEl: HTMLElement;
  let visible = $state(false);
  let ufoOffset = $state({ x: 0, y: 0 });
  let beamOffset = $state({ x: 0, y: 0 });
  let alienOffset = $state({ x: 0, y: 0 });
  let beamMode = $state<'blue' | 'pink' | 'rainbow'>('blue');
  let alienMood = $state<'calm' | 'hyped' | 'mischief'>('calm');
  let interactionCount = $state(0);
  let secretUnlocked = $state(false);
  let abductPopups = $state<{ id: number; x: number; y: number; glyph: string }[]>([]);
  let popupId = 0;

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
          ufoOffset = {
            x: ufoOffset.x + (cx * 26 - ufoOffset.x) * 0.06,
            y: ufoOffset.y + (cy * 14 - ufoOffset.y) * 0.06
          };
          beamOffset = {
            x: beamOffset.x + (cx * 18 - beamOffset.x) * 0.04,
            y: beamOffset.y + (cy * 8 - beamOffset.y) * 0.04
          };
          alienOffset = {
            x: alienOffset.x + (cx * -14 - alienOffset.x) * 0.04,
            y: alienOffset.y + (cy * -6 - alienOffset.y) * 0.04
          };
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

  function registerInteraction() {
    interactionCount += 1;
    if (interactionCount >= 5) {
      secretUnlocked = true;
    }
  }

  function cycleBeamMode() {
    beamMode = beamMode === 'blue' ? 'pink' : beamMode === 'pink' ? 'rainbow' : 'blue';
    registerInteraction();
  }

  function cycleAlienMood() {
    alienMood = alienMood === 'calm' ? 'hyped' : alienMood === 'hyped' ? 'mischief' : 'calm';
    registerInteraction();
  }

  function spawnAbduction(e: MouseEvent) {
    if (!sectionEl) return;
    const rect = sectionEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const glyphs = ['👽', '🛸', '✨', '◉', '✦'];
    const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
    const id = popupId++;
    abductPopups = [...abductPopups, { id, x, y, glyph }];
    registerInteraction();
    setTimeout(() => {
      abductPopups = abductPopups.filter((item) => item.id !== id);
    }, 900);
  }

  function spawnCenterAbduction() {
    if (!sectionEl) return;
    const rect = sectionEl.getBoundingClientRect();
    const centerEvent = {
      clientX: rect.left + rect.width * 0.5,
      clientY: rect.top + rect.height * 0.62
    } as MouseEvent;
    spawnAbduction(centerEvent);
  }

  function handleKeyAction(e: KeyboardEvent, action: () => void) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  }

  function handleUfoClick(e: MouseEvent) {
    e.stopPropagation();
    cycleBeamMode();
  }

  function handleAlienClick(e: MouseEvent) {
    e.stopPropagation();
    cycleAlienMood();
  }
</script>

<section class="about section-padding" id="about" bind:this={sectionEl}>
  <div class="container">
    <div class="about-inner" class:visible>
      <div class="about-label">
        <span class="label-marker">◆</span>
        <span>WHAT THIS IS (IN WEIRD TERMS)</span>
        <span class="label-doodle" aria-hidden="true">~oOo~</span>
      </div>

      <h2 class="about-headline">Not a portfolio. Not a SaaS page. Not a normal anything.</h2>

      <div
        class="encounter-stage"
        role="button"
        tabindex="0"
        aria-label="Spawn weird floating artifacts"
        onclick={spawnAbduction}
        onkeydown={(e) => handleKeyAction(e, spawnCenterAbduction)}
      >
        <div class="star-scribble star-a" aria-hidden="true">✦</div>
        <div class="star-scribble star-b" aria-hidden="true">✧</div>
        <div class="star-scribble star-c" aria-hidden="true">✶</div>

        <div
          class="ufo"
          role="button"
          tabindex="0"
          aria-label="Change UFO beam mode"
          style="transform: translate({ufoOffset.x}px, {ufoOffset.y}px);"
          onclick={handleUfoClick}
          onkeydown={(e) => handleKeyAction(e, cycleBeamMode)}
        >
          <div class="ufo-dome"></div>
          <div class="ufo-base"></div>
          <div class="ufo-lights">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>

        <div
          class="tractor-beam"
          class:pink={beamMode === 'pink'}
          class:rainbow={beamMode === 'rainbow'}
          style="transform: translate({beamOffset.x}px, {beamOffset.y}px);"
          aria-hidden="true"
        ></div>

        <div
          class="alien-crew"
          class:hyped={alienMood === 'hyped'}
          class:mischief={alienMood === 'mischief'}
          role="button"
          tabindex="0"
          aria-label="Toggle alien mood"
          style="transform: translate({alienOffset.x}px, {alienOffset.y}px);"
          onclick={handleAlienClick}
          onkeydown={(e) => handleKeyAction(e, cycleAlienMood)}
        >
          <div class="alien alien-big"><span></span></div>
          <div class="alien alien-small"><span></span></div>
        </div>

        {#each abductPopups as popup (popup.id)}
          <span class="abduct-popup" style="left:{popup.x}px; top:{popup.y}px;" aria-hidden="true">
            {popup.glyph}
          </span>
        {/each}

        <article class="message-orb orb-left">
          <h3>Weird-Product Lab</h3>
          <p>A home for useful little experiments that feel strange in exactly the right way.</p>
        </article>
        <article class="message-orb orb-mid">
          <h3>Roadmap = Odd Ideas</h3>
          <p>Every concept starts as “too weird,” then gets polished into one clear useful tool.</p>
        </article>
        <article class="message-orb orb-right">
          <h3>Small but Magical</h3>
          <p>Clean execution, playful energy, and software artifacts built to surprise people.</p>
        </article>

        <div class="encounter-hints" aria-hidden="true">
          <span>tap UFO to swap beam mode</span>
          <span>tap aliens to change mood</span>
          <span>click anywhere to spawn artifacts</span>
        </div>

        {#if secretUnlocked}
          <div class="secret-chip" role="status" aria-live="polite">
            EASTER EGG UNLOCKED: INTERGALACTIC WEIRD MODE
          </div>
        {/if}
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

  .encounter-stage {
    position: relative;
    min-height: 360px;
    border: 2px solid rgba(31, 47, 86, 0.16);
    border-radius: 28px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.75), rgba(250, 233, 184, 0.8));
    box-shadow: 0 10px 0 rgba(31, 47, 86, 0.1);
    overflow: hidden;
    padding: var(--space-10) var(--space-6) var(--space-8);
    cursor: crosshair;
  }

  .star-scribble {
    position: absolute;
    color: var(--color-secondary);
    opacity: 0.55;
    animation: twinkle 3.5s ease-in-out infinite;
  }

  .star-a { top: 14%; left: 11%; }
  .star-b { top: 8%; right: 15%; animation-delay: -1.2s; }
  .star-c { top: 34%; right: 8%; animation-delay: -2.2s; }

  @keyframes twinkle {
    0%, 100% { opacity: 0.35; scale: 1; }
    50% { opacity: 0.8; scale: 1.16; }
  }

  .ufo {
    position: absolute;
    top: 28px;
    left: 50%;
    width: 170px;
    margin-left: -85px;
    z-index: 3;
    animation: drift 4.2s ease-in-out infinite;
    will-change: transform;
    cursor: pointer;
  }

  .ufo-dome {
    width: 92px;
    height: 52px;
    margin: 0 auto -8px;
    border: 3px solid rgba(31, 47, 86, 0.42);
    border-bottom: none;
    border-radius: 999px 999px 0 0;
    background: linear-gradient(180deg, rgba(133, 209, 255, 0.9), rgba(166, 232, 255, 0.56));
  }

  .ufo-base {
    width: 170px;
    height: 58px;
    border: 3px solid #1f2f56;
    border-radius: 999px;
    background: linear-gradient(180deg, #fefefe, #e9f1ff);
    box-shadow: 0 8px 0 rgba(31, 47, 86, 0.16);
  }

  .ufo-lights {
    margin-top: -14px;
    display: flex;
    justify-content: center;
    gap: 14px;
  }

  .ufo-lights span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid #1f2f56;
    background: #ffd46a;
    box-shadow: 0 0 0 2px rgba(255, 212, 106, 0.2);
    animation: blink 1.6s ease-in-out infinite;
  }

  .ufo-lights span:nth-child(2) { animation-delay: -0.2s; }
  .ufo-lights span:nth-child(3) { animation-delay: -0.45s; }
  .ufo-lights span:nth-child(4) { animation-delay: -0.7s; }

  @keyframes blink {
    0%, 100% { background: #ffd46a; }
    45% { background: #f76db8; }
  }

  .tractor-beam {
    position: absolute;
    top: 108px;
    left: 50%;
    width: 220px;
    height: 180px;
    margin-left: -110px;
    background: linear-gradient(
      180deg,
      rgba(127, 190, 255, 0.25) 0%,
      rgba(127, 190, 255, 0.14) 45%,
      rgba(255, 246, 223, 0) 100%
    );
    clip-path: polygon(38% 0%, 62% 0%, 100% 100%, 0% 100%);
    filter: blur(0.3px);
    z-index: 1;
    animation: beamPulse 2.6s ease-in-out infinite;
  }

  .tractor-beam.pink {
    background: linear-gradient(
      180deg,
      rgba(247, 109, 184, 0.32) 0%,
      rgba(247, 109, 184, 0.14) 45%,
      rgba(255, 246, 223, 0) 100%
    );
  }

  .tractor-beam.rainbow {
    background: linear-gradient(
      180deg,
      rgba(53, 104, 235, 0.28) 0%,
      rgba(247, 109, 184, 0.22) 32%,
      rgba(73, 212, 91, 0.22) 62%,
      rgba(255, 246, 223, 0) 100%
    );
  }

  @keyframes beamPulse {
    0%, 100% { opacity: 0.85; }
    50% { opacity: 0.48; }
  }

  .alien-crew {
    position: absolute;
    bottom: 52px;
    left: 50%;
    margin-left: -58px;
    display: flex;
    gap: 18px;
    z-index: 2;
    will-change: transform;
    cursor: pointer;
  }

  .alien-crew.hyped .alien {
    animation-duration: 1.25s;
    scale: 1.05;
  }

  .alien-crew.mischief .alien::before,
  .alien-crew.mischief .alien::after {
    background: #f76db8;
  }

  .alien {
    position: relative;
    border: 3px solid #1f2f56;
    border-radius: 999px;
    background: linear-gradient(180deg, #89f084, #48d66c);
    animation: bob 2.8s ease-in-out infinite;
  }

  .alien-big {
    width: 48px;
    height: 64px;
  }

  .alien-small {
    width: 34px;
    height: 48px;
    margin-top: 12px;
    animation-delay: -1.1s;
  }

  .alien::before,
  .alien::after {
    content: '';
    position: absolute;
    top: 16px;
    width: 9px;
    height: 13px;
    border-radius: 999px;
    background: #1f2f56;
  }

  .alien::before { left: 11px; }
  .alien::after { right: 11px; }

  .alien span {
    position: absolute;
    top: -14px;
    left: 50%;
    width: 4px;
    height: 14px;
    margin-left: -2px;
    border-radius: 999px;
    background: #1f2f56;
  }

  .alien span::before {
    content: '';
    position: absolute;
    top: -6px;
    left: -4px;
    width: 12px;
    height: 12px;
    border: 2px solid #1f2f56;
    border-radius: 50%;
    background: #ffd46a;
  }

  @keyframes bob {
    0%, 100% { translate: 0 0; }
    50% { translate: 0 -6px; }
  }

  @keyframes drift {
    0%, 100% { translate: 0 0; }
    50% { translate: 0 -8px; }
  }

  .message-orb {
    position: absolute;
    width: min(30%, 260px);
    padding: var(--space-5);
    border: 2px solid rgba(31, 47, 86, 0.2);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.88);
    box-shadow: 0 6px 0 rgba(31, 47, 86, 0.12);
    backdrop-filter: blur(4px);
    animation: orbFloat 4.5s ease-in-out infinite;
  }

  .message-orb h3 {
    font-size: var(--text-sm);
    margin-bottom: var(--space-2);
    color: var(--color-text-bright);
  }

  .message-orb p {
    font-size: var(--text-sm);
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  .orb-left {
    left: 4%;
    top: 38%;
  }

  .orb-mid {
    left: 35%;
    bottom: 5%;
    animation-delay: -1.2s;
  }

  .orb-right {
    right: 4%;
    top: 43%;
    animation-delay: -2.1s;
  }

  @keyframes orbFloat {
    0%, 100% { translate: 0 0; }
    50% { translate: 0 -8px; }
  }

  .encounter-hints {
    position: absolute;
    left: var(--space-5);
    bottom: var(--space-4);
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    z-index: 6;
  }

  .encounter-hints span {
    font-family: var(--font-display);
    font-size: 0.65rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    background: rgba(255, 255, 255, 0.85);
    border: 2px solid rgba(31, 47, 86, 0.14);
    border-radius: 999px;
    padding: 4px 8px;
  }

  .abduct-popup {
    position: absolute;
    transform: translate(-50%, -50%);
    font-size: 1rem;
    pointer-events: none;
    z-index: 7;
    animation: popupFloat 0.9s ease-out forwards;
  }

  @keyframes popupFloat {
    0% { opacity: 0; scale: 0.7; translate: -50% -50%; }
    15% { opacity: 1; scale: 1; translate: -50% -62%; }
    100% { opacity: 0; scale: 1.25; translate: -50% -110%; }
  }

  .secret-chip {
    position: absolute;
    right: var(--space-5);
    bottom: var(--space-4);
    z-index: 8;
    font-family: var(--font-display);
    font-size: 0.65rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #fff;
    background: linear-gradient(90deg, #1f2f56, #3568eb, #f76db8);
    border: 2px solid rgba(31, 47, 86, 0.18);
    border-radius: 999px;
    padding: 6px 10px;
    box-shadow: 0 5px 0 rgba(31, 47, 86, 0.14);
    animation: chipIn 0.35s var(--ease-elastic);
  }

  @keyframes chipIn {
    from { opacity: 0; translate: 0 12px; }
    to { opacity: 1; translate: 0 0; }
  }

  @media (max-width: 768px) {
    .encounter-stage {
      min-height: 620px;
      padding: var(--space-8) var(--space-4);
    }

    .message-orb {
      position: relative;
      width: 100%;
      margin-top: var(--space-4);
      left: auto;
      right: auto;
      top: auto;
      bottom: auto;
    }

    .orb-mid,
    .orb-right {
      animation-delay: 0s;
    }

    .ufo {
      top: 18px;
    }

    .tractor-beam {
      top: 90px;
      height: 150px;
    }

    .alien-crew {
      bottom: 300px;
    }

    .encounter-hints {
      left: var(--space-4);
      right: var(--space-4);
      bottom: var(--space-3);
    }

    .secret-chip {
      left: var(--space-4);
      right: var(--space-4);
      bottom: 70px;
      text-align: center;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ufo,
    .alien,
    .tractor-beam,
    .message-orb,
    .star-scribble {
      animation: none !important;
      transform: none !important;
    }
  }
</style>
