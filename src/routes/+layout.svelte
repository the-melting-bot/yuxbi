<script lang="ts">
  import '$lib/styles/global.css';
  import type { Snippet } from 'svelte';
  import LoadingScreen from '$lib/components/LoadingScreen.svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
  let alienNightMode = $state(false);
  let konamiProgress = 0;
  let shutdownTimer: ReturnType<typeof setTimeout> | null = null;
  const alienShips = [0, 1, 2];

  const konamiCode = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a'
  ];

  /*
  ██████╗ ██╗   ██╗██╗██╗  ████████╗    ██████╗ ██╗   ██╗
  ██╔══██╗██║   ██║██║██║  ╚══██╔══╝    ██╔══██╗╚██╗ ██╔╝
  ██████╔╝██║   ██║██║██║     ██║       ██████╔╝ ╚████╔╝
  ██╔══██╗██║   ██║██║██║     ██║       ██╔══██╗  ╚██╔╝
  ██████╔╝╚██████╔╝██║███████╗██║       ██████╔╝   ██║
  ╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═╝       ╚═════╝    ╚═╝

  ████████╗██╗  ██╗███████╗    ███╗   ███╗███████╗██╗  ████████╗██╗███╗   ██╗ ██████╗
  ╚══██╔══╝██║  ██║██╔════╝    ████╗ ████║██╔════╝██║  ╚══██╔══╝██║████╗  ██║██╔════╝
     ██║   ███████║█████╗      ██╔████╔██║█████╗  ██║     ██║   ██║██╔██╗ ██║██║  ███╗
     ██║   ██╔══██║██╔══╝      ██║╚██╔╝██║██╔══╝  ██║     ██║   ██║██║╚██╗██║██║   ██║
     ██║   ██║  ██║███████╗    ██║ ╚═╝ ██║███████╗███████╗██║   ██║██║ ╚████║╚██████╔╝
     ╚═╝   ╚═╝  ╚═╝╚══════╝    ╚═╝     ╚═╝╚══════╝╚══════╝╚═╝   ╚═╝╚═╝  ╚═══╝ ╚═════╝

  ██████╗  ██████╗ ████████╗
  ██╔══██╗██╔═══██╗╚══██╔══╝
  ██████╔╝██║   ██║   ██║
  ██╔══██╗██║   ██║   ██║
  ██████╔╝╚██████╔╝   ██║
  ╚═════╝  ╚═════╝    ╚═╝

  KONAMI CHEAT CODE:
  ↑ ↑ ↓ ↓ ← → ← → B A
  */

  function activateAlienNightMode() {
    alienNightMode = true;
    if (shutdownTimer) clearTimeout(shutdownTimer);
    shutdownTimer = setTimeout(() => {
      alienNightMode = false;
    }, 30000);
  }

  $effect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Ensure refresh always re-enters from top.
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });

    function onKeydown(e: KeyboardEvent) {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === konamiCode[konamiProgress]) {
        konamiProgress += 1;
        if (konamiProgress >= konamiCode.length) {
          konamiProgress = 0;
          activateAlienNightMode();
        }
      } else {
        konamiProgress = key === konamiCode[0] ? 1 : 0;
      }
    }

    window.addEventListener('keydown', onKeydown);
    return () => {
      window.removeEventListener('keydown', onKeydown);
      if (shutdownTimer) clearTimeout(shutdownTimer);
    };
  });
</script>

<LoadingScreen />
<div class="noise-overlay" aria-hidden="true"></div>
<svelte:body class:alien-night-mode={alienNightMode} />

{#if alienNightMode}
  <div class="alien-night-overlay" aria-hidden="true">
    <div class="night-label">ALIEN NIGHT MODE</div>
    {#each alienShips as ship}
      <div class="flyover flyover-{ship + 1}">
        <div class="flyover-dome"></div>
        <div class="flyover-base"></div>
        <div class="flyover-lights"><span></span><span></span><span></span></div>
      </div>
    {/each}
  </div>
{/if}

{@render children()}

<style>
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
