<script lang="ts">
  let phase = $state(0); // 0=warming crayons, 1=drawing stars, 2=beaming in, 3=launching weirdness
  let progress = $state(0);
  let opacity = $state(1);
  let done = $state(false);
  let sparkles: { x: number; y: number; size: number; delay: number }[] = $state([]);

  const messages = [
    'WARMING UP CRAYONS',
    'DOODLING THE STARS',
    'BEAMING IN THE WEIRD',
    'LIFT OFF: LAB IS LIVE'
  ];

  $effect(() => {
    const stars = [];
    for (let i = 0; i < 24; i++) {
      stars.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 8 + Math.random() * 14,
        delay: i * 0.07
      });
    }
    sparkles = stars;

    const startTime = Date.now();
    const totalDuration = 3600;

    function tick() {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / totalDuration, 1);

      progress = t;

      if (t < 0.3) phase = 0;
      else if (t < 0.55) phase = 1;
      else if (t < 0.8) phase = 2;
      else phase = 3;

      if (t >= 1) {
        opacity = 0;
        setTimeout(() => { done = true; }, 700);
        return;
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
</script>

{#if !done}
  <div
    class="loading-screen"
    style="opacity: {opacity}; pointer-events: {opacity > 0.5 ? 'all' : 'none'}"
    aria-live="polite"
    role="status"
  >
    <div class="cartoon-space" aria-hidden="true">
      {#each sparkles as s, i}
        <div
          class="sparkle"
          style="
            left: {s.x}%;
            top: {s.y}%;
            width: {s.size}px;
            height: {s.size}px;
            --delay: {s.delay}s;
          "
        >
          {i % 3 === 0 ? '✦' : i % 3 === 1 ? '✧' : '✶'}
        </div>
      {/each}
    </div>

    <div class="assembly-container">
      <div class="ufo-loader" class:launching={progress > 0.82}>
        <div class="ufo-dome"></div>
        <div class="ufo-base"></div>
        <div class="ufo-lights"><span></span><span></span><span></span><span></span><span></span></div>
      </div>
      <div class="beam-loader" class:active={progress > 0.4}></div>
      <div class="mascot" class:active={progress > 0.2}>
        <div class="head"><span></span></div>
        <div class="body"></div>
      </div>
    </div>

    <div class="status-area">
      <p class="status-message">{messages[phase]}</p>
      <p class="status-brand">YUXBI LAB</p>
      <div class="progress-bar">
        <div class="progress-fill" style="width: {progress * 100}%"></div>
      </div>
    </div>
  </div>
{/if}

<style>
  .loading-screen {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: var(--color-bg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-12);
    transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1);
    background:
      radial-gradient(circle at 18% 16%, rgba(247, 109, 184, 0.2), transparent 26%),
      radial-gradient(circle at 82% 20%, rgba(53, 104, 235, 0.18), transparent 24%),
      radial-gradient(circle at 50% 85%, rgba(255, 199, 97, 0.3), transparent 36%),
      var(--color-bg);
    animation: loadingFailsafeHide 0.8s ease 6s forwards;
  }

  @keyframes loadingFailsafeHide {
    to {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
  }

  .cartoon-space {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .sparkle {
    position: absolute;
    display: grid;
    place-items: center;
    color: var(--color-secondary);
    opacity: 0.45;
    animation: sparkleFloat 2.8s ease-in-out infinite;
    animation-delay: var(--delay);
  }

  @keyframes sparkleFloat {
    0%, 100% { translate: 0 0; opacity: 0.35; }
    50% { translate: 0 -8px; opacity: 0.95; }
  }

  .assembly-container {
    position: relative;
    width: 320px;
    height: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ufo-loader {
    position: absolute;
    top: 68px;
    left: 50%;
    width: 170px;
    margin-left: -85px;
    animation: loaderDrift 2.5s ease-in-out infinite;
    z-index: 3;
  }

  .ufo-loader.launching {
    animation: loaderLaunch 0.7s ease-in both;
  }

  @keyframes loaderDrift {
    0%, 100% { translate: 0 0; }
    50% { translate: 0 -10px; }
  }

  @keyframes loaderLaunch {
    to { translate: 0 -120px; opacity: 0; }
  }

  .ufo-dome {
    width: 92px;
    height: 52px;
    margin: 0 auto -8px;
    border: 3px solid rgba(31, 47, 86, 0.45);
    border-bottom: none;
    border-radius: 999px 999px 0 0;
    background: linear-gradient(180deg, rgba(133, 209, 255, 0.9), rgba(166, 232, 255, 0.56));
  }

  .ufo-base {
    width: 170px;
    height: 58px;
    border: 3px solid #1f2f56;
    border-radius: 999px;
    background: linear-gradient(180deg, #ffffff, #e9f1ff);
    box-shadow: 0 9px 0 rgba(31, 47, 86, 0.16);
  }

  .ufo-lights {
    margin-top: -14px;
    display: flex;
    justify-content: center;
    gap: 10px;
  }

  .ufo-lights span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid #1f2f56;
    background: #ffd46a;
    animation: loaderBlink 1.2s ease-in-out infinite;
  }

  .ufo-lights span:nth-child(2) { animation-delay: -0.2s; }
  .ufo-lights span:nth-child(3) { animation-delay: -0.4s; }
  .ufo-lights span:nth-child(4) { animation-delay: -0.6s; }
  .ufo-lights span:nth-child(5) { animation-delay: -0.8s; }

  @keyframes loaderBlink {
    0%, 100% { background: #ffd46a; }
    50% { background: #f76db8; }
  }

  .beam-loader {
    position: absolute;
    top: 144px;
    left: 50%;
    width: 220px;
    height: 150px;
    margin-left: -110px;
    clip-path: polygon(38% 0%, 62% 0%, 100% 100%, 0% 100%);
    background: linear-gradient(180deg, rgba(127, 190, 255, 0.32), rgba(127, 190, 255, 0));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .beam-loader.active {
    opacity: 1;
    animation: beamWobble 1.6s ease-in-out infinite;
  }

  @keyframes beamWobble {
    0%, 100% { opacity: 0.85; }
    50% { opacity: 0.45; }
  }

  .mascot {
    position: absolute;
    top: 204px;
    left: 50%;
    width: 60px;
    margin-left: -30px;
    opacity: 0;
    transform: scale(0.8);
    transition: opacity 0.2s ease, transform 0.25s var(--ease-elastic);
  }

  .mascot.active {
    opacity: 1;
    transform: scale(1);
    animation: mascotBounce 1.1s ease-in-out infinite;
  }

  .head {
    width: 52px;
    height: 38px;
    margin: 0 auto -6px;
    border: 3px solid #1f2f56;
    border-radius: 999px;
    background: linear-gradient(180deg, #89f084, #49d46b);
    position: relative;
  }

  .head::before,
  .head::after {
    content: '';
    position: absolute;
    top: 12px;
    width: 8px;
    height: 11px;
    border-radius: 999px;
    background: #1f2f56;
  }

  .head::before { left: 14px; }
  .head::after { right: 14px; }

  .head span {
    position: absolute;
    top: -12px;
    left: 50%;
    width: 4px;
    height: 12px;
    margin-left: -2px;
    border-radius: 999px;
    background: #1f2f56;
  }

  .head span::before {
    content: '';
    position: absolute;
    top: -6px;
    left: -4px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid #1f2f56;
    background: #ffd46a;
  }

  .body {
    width: 38px;
    height: 42px;
    margin: 0 auto;
    border: 3px solid #1f2f56;
    border-radius: 999px;
    background: linear-gradient(180deg, #6de378, #36c45c);
  }

  @keyframes mascotBounce {
    0%, 100% { translate: 0 0; }
    50% { translate: 0 -5px; }
  }

  .status-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
  }

  .status-message {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    letter-spacing: 0.2em;
    text-transform: uppercase;
    min-height: 1.2em;
    transition: opacity 0.2s ease;
    animation: statusHop 0.9s ease-in-out infinite;
  }

  .status-brand {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    color: var(--color-text-bright);
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  @keyframes statusHop {
    0%, 100% { translate: 0 0; }
    50% { translate: 0 -3px; }
  }

  .progress-bar {
    width: 220px;
    height: 14px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 999px;
    border: 2px solid rgba(31, 47, 86, 0.18);
    overflow: hidden;
    box-shadow: inset 0 1px 0 rgba(31, 47, 86, 0.06);
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #f76db8, #3568eb 50%, #49d46b);
    border-radius: 999px;
    transition: width 0.15s ease;
    box-shadow: 0 0 10px rgba(53, 104, 235, 0.35);
  }

  @media (prefers-reduced-motion: reduce) {
    .sparkle,
    .ufo-loader,
    .beam-loader,
    .mascot,
    .status-message {
      animation: none !important;
    }
  }
</style>
