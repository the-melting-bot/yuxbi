<script lang="ts">
  const year = new Date().getFullYear();
  const cheatCode = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'] as const;
  let progress = $state(0);
  let unlocked = $state(false);

  function pressCheat(btn: 'up' | 'down' | 'left' | 'right' | 'b' | 'a') {
    if (btn === cheatCode[progress]) {
      progress += 1;
      if (progress >= cheatCode.length) {
        progress = 0;
        unlocked = true;
        window.dispatchEvent(new CustomEvent('yuxbi:alien-cheat'));
        setTimeout(() => { unlocked = false; }, 2200);
      }
      return;
    }
    progress = btn === cheatCode[0] ? 1 : 0;
  }
</script>

<footer class="footer">
  <div class="container">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="footer-logo">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect x="2.5" y="2.5" width="27" height="27" rx="8" stroke="currentColor" stroke-width="2" opacity="0.45" stroke-dasharray="3 4"/>
            <path d="M8 10L16 20L24 10" stroke="var(--color-accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="16" cy="24" r="1.5" fill="var(--color-accent)"/>
          </svg>
          <span class="footer-name">yuxbi</span>
        </div>
        <p class="footer-tagline">Weird ideas, clean apps.</p>
      </div>

      <div class="footer-links">
        <div class="footer-col">
          <h4 class="footer-col-title">Lab</h4>
          <a href="#experiments" class="footer-link">Experiments</a>
          <a href="#transmissions" class="footer-link">Transmissions</a>
          <a href="#manifesto" class="footer-link">Manifesto</a>
        </div>

        <div class="footer-col">
          <h4 class="footer-col-title">Signal</h4>
          <span class="footer-link footer-link--muted">More experiments soon</span>
          <span class="footer-link footer-link--muted">API access coming</span>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="cheat-console" role="group" aria-label="Alien mode cheat controller">
        <p class="cheat-title">Enter Yuxbi Cheat Code</p>
        <div class="controller-row">
          <div class="dpad">
            <button class="ctrl up" onclick={() => pressCheat('up')} aria-label="Up">▲</button>
            <button class="ctrl left" onclick={() => pressCheat('left')} aria-label="Left">◀</button>
            <button class="ctrl right" onclick={() => pressCheat('right')} aria-label="Right">▶</button>
            <button class="ctrl down" onclick={() => pressCheat('down')} aria-label="Down">▼</button>
          </div>
          <div class="ab-buttons">
            <button class="ctrl b" onclick={() => pressCheat('b')} aria-label="B button">B</button>
            <button class="ctrl a" onclick={() => pressCheat('a')} aria-label="A button">A</button>
          </div>
        </div>
        <div class="cheat-status">
          <div class="progress-dots" aria-hidden="true">
            {#each Array(cheatCode.length) as _, i}
              <span class:active={i < progress}></span>
            {/each}
          </div>
          {#if unlocked}
            <span class="unlocked">ALIEN MODE ACTIVATED</span>
          {:else}
            <span>Sequence in progress</span>
          {/if}
        </div>
      </div>

      <div class="footer-right">
        <a href="https://themeltingbot.com" class="tmb-pill" target="_blank" rel="noopener noreferrer" aria-label="Built by The Melting Bot">
          <svg class="tmb-pill-icon" width="18" height="20" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <line x1="12" y1="3" x2="12" y2="0" stroke="#7B61FF" stroke-width="2" stroke-linecap="round"/>
            <circle cx="12" cy="0" r="1.5" fill="#7B61FF"/>
            <rect x="1" y="3" width="22" height="16" rx="4" stroke="#3568EB" stroke-width="1.8" fill="none"/>
            <circle cx="8" cy="10" r="2.5" fill="#3568EB"/>
            <circle cx="16" cy="10" r="2.5" fill="#3568EB"/>
            <circle cx="8" cy="10" r="1" fill="#0D0D0D"/>
            <circle cx="16" cy="10" r="1" fill="#0D0D0D"/>
            <path d="M6 15 Q12 19 18 15" stroke="#3568EB" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <path d="M5 19 L5 24 Q5 26 7 26" stroke="#7B61FF" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.6"/>
            <path d="M11 19 L11 27 Q11 29 13 29 Q15 29 15 27 L15 23" stroke="#7B61FF" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.5"/>
            <path d="M19 19 L19 23 Q19 25 21 25" stroke="#7B61FF" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.6"/>
          </svg>
          <span>Built by The Melting Bot</span>
        </a>
      </div>
    </div>
  </div>
</footer>

<style>
  .footer {
    padding-block: var(--space-16) var(--space-8);
    background: linear-gradient(180deg, #ffffff 0%, #fff5de 100%);
    border-top: 2px solid rgba(31, 47, 86, 0.14);
  }

  .footer-inner {
    display: flex;
    justify-content: space-between;
    gap: var(--space-12);
    padding-bottom: var(--space-12);
    border-bottom: 2px dashed rgba(31, 47, 86, 0.18);
    margin-bottom: var(--space-8);
  }

  .footer-brand {
    max-width: 280px;
  }

  .footer-logo {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    color: var(--color-text-bright);
    margin-bottom: var(--space-3);
  }

  .footer-name {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: lowercase;
  }

  .footer-tagline {
    font-size: var(--text-sm);
    color: var(--color-text-faint);
    line-height: 1.6;
  }

  .footer-links {
    display: flex;
    gap: var(--space-16);
  }

  .footer-col {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .footer-col-title {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: var(--space-2);
  }

  .footer-link {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    display: inline-block;
  }

  a.footer-link:hover {
    color: var(--color-accent);
    transform: translateX(3px);
  }

  .footer-link--muted {
    color: var(--color-text-faint);
    font-style: italic;
    opacity: 0.85;
  }

  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-5);
  }
  .footer-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-4);
  }

  .cheat-console {
    padding: 10px 12px;
    border-radius: 16px;
    border: 2px solid rgba(31, 47, 86, 0.2);
    background: rgba(255, 255, 255, 0.88);
    box-shadow: 0 5px 0 rgba(31, 47, 86, 0.12);
    min-width: 280px;
  }

  .cheat-title {
    font-family: var(--font-display);
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    margin-bottom: var(--space-2);
  }

  .controller-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-5);
  }

  .dpad {
    position: relative;
    width: 68px;
    height: 68px;
  }

  .ctrl {
    width: 26px;
    height: 26px;
    border-radius: 8px;
    border: 2px solid rgba(31, 47, 86, 0.24);
    background: #fff;
    color: var(--color-text-bright);
    font-family: var(--font-display);
    font-weight: 700;
    display: grid;
    place-items: center;
    box-shadow: 0 2px 0 rgba(31, 47, 86, 0.15);
    cursor: pointer;
    user-select: none;
  }

  .ctrl:active {
    transform: translateY(1px);
    box-shadow: 0 1px 0 rgba(31, 47, 86, 0.15);
  }

  .ctrl.up { position: absolute; left: 21px; top: 0; }
  .ctrl.left { position: absolute; left: 0; top: 21px; }
  .ctrl.right { position: absolute; right: 0; top: 21px; }
  .ctrl.down { position: absolute; left: 21px; bottom: 0; }

  .ab-buttons {
    display: flex;
    gap: var(--space-2);
    align-items: center;
  }

  .ctrl.a {
    background: #3568eb;
    color: #fff;
    border-color: #22479d;
  }

  .ctrl.b {
    background: #f76db8;
    color: #fff;
    border-color: #b44f86;
  }

  .cheat-status {
    margin-top: var(--space-3);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    font-size: 0.64rem;
    color: var(--color-text-muted);
    letter-spacing: 0.04em;
  }

  .progress-dots {
    display: inline-flex;
    gap: 4px;
  }

  .progress-dots span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(31, 47, 86, 0.2);
  }

  .progress-dots span.active {
    background: var(--color-accent);
  }

  .unlocked {
    color: #1bb673;
    font-weight: 700;
  }


  .tmb-pill {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: 6px 12px;
    border-radius: 999px;
    border: 2px solid rgba(31, 47, 86, 0.2);
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 4px 0 rgba(31, 47, 86, 0.12);
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    text-decoration: none;
    font-weight: 600;
    letter-spacing: 0.01em;
    transition: transform 0.25s var(--ease-elastic), box-shadow 0.25s ease, border-color 0.25s ease;
  }

  .tmb-pill:hover {
    transform: translateY(-2px) rotate(-1deg);
    box-shadow: 0 6px 0 rgba(31, 47, 86, 0.14);
    border-color: rgba(53, 104, 235, 0.35);
  }

  .tmb-pill:active {
    transform: translateY(1px);
    box-shadow: 0 2px 0 rgba(31, 47, 86, 0.14);
  }

  .tmb-pill-icon {
    flex-shrink: 0;
  }

  @media (max-width: 640px) {
    .footer-inner {
      flex-direction: column;
      gap: var(--space-8);
    }

    .footer-links {
      gap: var(--space-8);
    }

    .footer-bottom {
      flex-direction: column;
      gap: var(--space-3);
      text-align: center;
    }

    .footer-right {
      flex-direction: column;
      align-items: flex-end;
    }
  }
</style>
