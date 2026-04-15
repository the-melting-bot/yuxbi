<script lang="ts">
  import '$lib/styles/global.css';
  import type { Snippet } from 'svelte';
  import LoadingScreen from '$lib/components/LoadingScreen.svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
  let alienNightMode = $state(false);
  let easterEggBurst = $state(false);
  let showAlienToggle = $state(false);
  let easterEggTimer: ReturnType<typeof setTimeout> | null = null;
  let toggleRevealTimer: ReturnType<typeof setTimeout> | null = null;
  const alienShips = [0, 1, 2];
  const laserRows = [0, 1, 2, 3];

  function triggerEasterEggBurst() {
    easterEggBurst = true;
    if (easterEggTimer) clearTimeout(easterEggTimer);
    easterEggTimer = setTimeout(() => {
      easterEggBurst = false;
    }, 5200);
  }

  function toggleAlienNightMode() {
    alienNightMode = !alienNightMode;
    if (alienNightMode) {
      triggerEasterEggBurst();
    } else {
      easterEggBurst = false;
      if (easterEggTimer) clearTimeout(easterEggTimer);
    }
  }

  function activateFromCheatController() {
    if (!alienNightMode) {
      alienNightMode = true;
    }
    triggerEasterEggBurst();
  }

  $effect(() => {
    alienNightMode;
    document.body.classList.toggle('alien-night-mode', alienNightMode);
    return () => {
      document.body.classList.remove('alien-night-mode');
    };
  });

  $effect(() => {
    function onCheatTrigger() {
      activateFromCheatController();
    }
    window.addEventListener('yuxbi:alien-cheat', onCheatTrigger);
    return () => window.removeEventListener('yuxbi:alien-cheat', onCheatTrigger);
  });

  $effect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Ensure refresh always re-enters from top.
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });

    // Match loading sequence duration so toggle appears after intro.
    toggleRevealTimer = setTimeout(() => {
      showAlienToggle = true;
    }, 4600);

    return () => {
      if (easterEggTimer) clearTimeout(easterEggTimer);
      if (toggleRevealTimer) clearTimeout(toggleRevealTimer);
    };
  });
</script>

<LoadingScreen />
{#if showAlienToggle}
  <button
    class="alien-mode-toggle"
    onclick={toggleAlienNightMode}
    aria-pressed={alienNightMode}
    aria-label="Toggle alien night mode"
  >
    {alienNightMode ? 'Disable Alien Night Mode' : 'Alien Night Mode'}
  </button>
{/if}
<div class="noise-overlay" aria-hidden="true"></div>

{#if alienNightMode}
  <div class="alien-night-overlay" aria-hidden="true">
    <div class="night-label">ALIEN NIGHT MODE</div>
    {#if easterEggBurst}
      <div class="laser-stage">
        {#each laserRows as row}
          <span class="laser laser-{row + 1}"></span>
        {/each}
      </div>
      <div class="flying-cow">🐄</div>
    {/if}
    {#each alienShips as ship}
      <div class="flyover flyover-{ship + 1}">
        <div class="flyover-dome"></div>
        <div class="flyover-base"></div>
        <div class="flyover-lights"><span></span><span></span><span></span></div>
      </div>
    {/each}
  </div>
{/if}

<div class="site-shell" class:alien-night-mode-root={alienNightMode}>
  {@render children()}
</div>

<style>
  .alien-mode-toggle {
    position: fixed;
    top: 14px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10002;
    padding: 8px 14px;
    border-radius: 999px;
    border: 2px solid rgba(31, 47, 86, 0.2);
    background: rgba(255, 255, 255, 0.9);
    color: var(--color-text-bright);
    font-family: var(--font-display);
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    box-shadow: 0 5px 0 rgba(31, 47, 86, 0.14);
    transition: transform 0.22s var(--ease-elastic), background 0.2s ease;
  }

  .alien-mode-toggle:hover {
    transform: translateX(-50%) translateY(-2px) rotate(-0.5deg);
  }

  :global(body.alien-night-mode) .alien-mode-toggle {
    background: rgba(12, 22, 48, 0.9);
    border-color: rgba(131, 197, 255, 0.4);
    color: #e8f7ff;
    box-shadow: 0 5px 0 rgba(4, 10, 24, 0.35);
  }

  .alien-night-overlay {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 10001;
    overflow: hidden;
  }

  .night-label {
    position: absolute;
    top: 16px;
    right: 16px;
    font-family: var(--font-display);
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #e3f5ff;
    border: 2px solid rgba(227, 245, 255, 0.3);
    border-radius: 999px;
    background: rgba(9, 20, 44, 0.6);
    padding: 6px 10px;
    animation: chipPulse 1.2s ease-in-out infinite;
  }

  .laser-stage {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.8;
  }

  .laser {
    position: absolute;
    left: -20%;
    width: 140%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #8ed9ff, #f76db8, transparent);
    box-shadow: 0 0 12px rgba(142, 217, 255, 0.4);
    animation: laserSweep 1.2s linear infinite;
  }

  .laser-1 { top: 22%; transform: rotate(-8deg); }
  .laser-2 { top: 38%; transform: rotate(4deg); animation-delay: -0.25s; }
  .laser-3 { top: 56%; transform: rotate(-5deg); animation-delay: -0.5s; }
  .laser-4 { top: 74%; transform: rotate(7deg); animation-delay: -0.75s; }

  @keyframes laserSweep {
    0% { translate: -15% 0; opacity: 0.15; }
    15% { opacity: 0.95; }
    100% { translate: 20% 0; opacity: 0.1; }
  }

  .flying-cow {
    position: absolute;
    left: -90px;
    top: 62%;
    font-size: 3rem;
    filter: drop-shadow(0 0 10px rgba(142, 217, 255, 0.4));
    animation: cowFly 5s linear forwards;
  }

  @keyframes cowFly {
    0% { translate: 0 0; rotate: -8deg; }
    20% { translate: 22vw -24px; rotate: 8deg; }
    50% { translate: 50vw -12px; rotate: -6deg; }
    75% { translate: 75vw -28px; rotate: 6deg; }
    100% { translate: calc(100vw + 160px) -16px; rotate: -4deg; }
  }

  @keyframes chipPulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }

  .flyover {
    position: absolute;
    width: 118px;
    opacity: 0.9;
    filter: drop-shadow(0 0 14px rgba(131, 197, 255, 0.42));
  }

  .flyover-1 {
    top: 16%;
    left: -140px;
    animation: flyAcrossA 12s linear infinite;
  }

  .flyover-2 {
    top: 44%;
    left: -140px;
    transform: scale(0.85);
    animation: flyAcrossB 15s linear infinite;
    animation-delay: -4s;
  }

  .flyover-3 {
    top: 72%;
    left: -140px;
    transform: scale(0.7);
    animation: flyAcrossA 11s linear infinite reverse;
    animation-delay: -6s;
  }

  .flyover-dome {
    width: 58px;
    height: 30px;
    margin: 0 auto -6px;
    border: 2px solid rgba(182, 234, 255, 0.9);
    border-bottom: none;
    border-radius: 999px 999px 0 0;
    background: linear-gradient(180deg, rgba(126, 212, 255, 0.76), rgba(126, 212, 255, 0.25));
  }

  .flyover-base {
    width: 118px;
    height: 36px;
    border: 2px solid rgba(182, 234, 255, 0.9);
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(19, 41, 84, 0.95), rgba(37, 75, 132, 0.85));
  }

  .flyover-lights {
    margin-top: -9px;
    display: flex;
    justify-content: center;
    gap: 10px;
  }

  .flyover-lights span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    border: 1px solid rgba(182, 234, 255, 0.85);
    background: #ffd46a;
    animation: shipBlink 0.9s ease-in-out infinite;
  }

  .flyover-lights span:nth-child(2) { animation-delay: -0.25s; }
  .flyover-lights span:nth-child(3) { animation-delay: -0.5s; }

  @keyframes shipBlink {
    0%, 100% { background: #ffd46a; }
    50% { background: #f76db8; }
  }

  @keyframes flyAcrossA {
    from { translate: 0 0; }
    to { translate: calc(100vw + 280px) 0; }
  }

  @keyframes flyAcrossB {
    0% { translate: 0 0; }
    50% { translate: calc(50vw + 120px) -25px; }
    100% { translate: calc(100vw + 280px) 0; }
  }
</style>
