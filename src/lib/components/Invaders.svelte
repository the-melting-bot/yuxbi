<script lang="ts">
  /**
   * Yuxbi Signal Breach — Invaders mini-game.
   * Auto-launched after a successful Signal Breach unlock.
   * Retro CRT phosphor aesthetic. Keyboard + touch controls.
   */

  import { untrack } from 'svelte';

  interface Props {
    open: boolean;
    onClose: () => void;
  }

  let { open, onClose }: Props = $props();

  // ---- Canvas / world ---------------------------------------------------
  const W = 480; // internal world width
  const H = 640; // internal world height
  let canvasEl: HTMLCanvasElement | undefined = $state();
  let rafId = 0;
  let lastTs = 0;

  // ---- HUD state --------------------------------------------------------
  let score = $state(0);
  let highScore = $state(0);
  let wave = $state(1);
  let lives = $state(3);
  let status: 'intro' | 'playing' | 'won' | 'lost' = $state('intro');
  let bannerMessage = $state('');

  // ---- Game entities ----------------------------------------------------
  type Vec = { x: number; y: number };
  type Bullet = Vec & { vy: number; alive: boolean; from: 'player' | 'alien' };
  type Alien = Vec & { alive: boolean; row: number; col: number };
  type Particle = Vec & { vx: number; vy: number; life: number; color: string };

  const ROWS = 5;
  const COLS = 8;
  const ALIEN_W = 28;
  const ALIEN_H = 22;
  const ALIEN_GAP_X = 14;
  const ALIEN_GAP_Y = 18;

  let player = { x: W / 2, y: H - 60, w: 38, h: 14, speed: 280 };
  let aliens: Alien[] = [];
  let bullets: Bullet[] = [];
  let particles: Particle[] = [];
  let alienDir = 1; // 1 = right, -1 = left
  let alienStepTimer = 0;
  let alienShootTimer = 0;
  let alienBaseStep = 0.7;
  let alienStep = 0.7;
  let descendQueued = false;

  // ---- Input ------------------------------------------------------------
  let keys = { left: false, right: false, fire: false };
  let touchLeft = $state(false);
  let touchRight = $state(false);
  let touchFire = $state(false);
  let lastFireAt = 0;
  const FIRE_COOLDOWN = 360; // ms

  function onKeyDown(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      keys.left = true;
      e.preventDefault();
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      keys.right = true;
      e.preventDefault();
    }
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === 'Enter') {
      keys.fire = true;
      e.preventDefault();
    }
  }
  function onKeyUp(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === 'Enter')
      keys.fire = false;
  }

  // ---- Setup ------------------------------------------------------------
  function spawnAliens(currentWave: number) {
    aliens = [];
    const totalW = COLS * ALIEN_W + (COLS - 1) * ALIEN_GAP_X;
    const startX = (W - totalW) / 2;
    const startY = 70;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        aliens.push({
          x: startX + c * (ALIEN_W + ALIEN_GAP_X),
          y: startY + r * (ALIEN_H + ALIEN_GAP_Y),
          alive: true,
          row: r,
          col: c
        });
      }
    }
    alienDir = 1;
    alienStepTimer = 0;
    alienShootTimer = 0;
    // Difficulty curve: Wave 1 forgiving, Wave 5 punishing.
    // Step time = how long aliens wait between moves (lower = faster).
    alienBaseStep = Math.max(0.14, 0.85 - (currentWave - 1) * 0.13);
    alienStep = alienBaseStep;
  }

  function resetGame() {
    score = 0;
    wave = 1;
    lives = 3;
    bullets = [];
    particles = [];
    player.x = W / 2;
    spawnAliens(wave);
    status = 'playing';
    bannerMessage = '';
  }

  function nextWave() {
    wave += 1;
    bullets = [];
    spawnAliens(wave);
  }

  function endGame(won: boolean) {
    status = won ? 'won' : 'lost';
    bannerMessage = won ? 'All clear · transmission saved' : 'Field collapsed · stand down';
    if (score > highScore) {
      highScore = score;
      try {
        localStorage.setItem('yuxbi:invaders:hi', String(highScore));
      } catch {
        /* ignore */
      }
    }
  }

  // ---- Update -----------------------------------------------------------
  function fire() {
    const now = performance.now();
    if (now - lastFireAt < FIRE_COOLDOWN) return;
    // limit player bullets to 2 on screen at once
    const playerBullets = bullets.filter((b) => b.from === 'player' && b.alive).length;
    if (playerBullets >= 2) return;
    bullets.push({ x: player.x, y: player.y - 12, vy: -480, alive: true, from: 'player' });
    lastFireAt = now;
  }

  function spawnParticles(x: number, y: number, color: string, count = 10) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 60 + Math.random() * 120;
      particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 0.5 + Math.random() * 0.3,
        color
      });
    }
  }

  function update(dt: number) {
    if (status !== 'playing') return;

    // Player input
    const dir =
      (keys.left || touchLeft ? -1 : 0) + (keys.right || touchRight ? 1 : 0);
    player.x += dir * player.speed * dt;
    player.x = Math.max(player.w / 2 + 8, Math.min(W - player.w / 2 - 8, player.x));

    if (keys.fire || touchFire) fire();

    // Bullets
    for (const b of bullets) {
      if (!b.alive) continue;
      b.y += b.vy * dt;
      if (b.y < -10 || b.y > H + 10) b.alive = false;
    }

    // Alien stepping
    alienStepTimer += dt;
    const aliveAliens = aliens.filter((a) => a.alive);
    // Speed up as aliens are killed
    const remainingFactor = aliveAliens.length / (ROWS * COLS);
    alienStep = Math.max(0.06, alienBaseStep * (0.4 + remainingFactor * 0.8));

    if (alienStepTimer >= alienStep) {
      alienStepTimer = 0;
      const stepX = 8;
      const stepY = 12;

      let hitEdge = false;
      for (const a of aliveAliens) {
        const nextX = a.x + alienDir * stepX;
        if (nextX < 12 || nextX + ALIEN_W > W - 12) {
          hitEdge = true;
          break;
        }
      }

      if (hitEdge) {
        alienDir *= -1;
        for (const a of aliens) if (a.alive) a.y += stepY;
      } else {
        for (const a of aliens) if (a.alive) a.x += alienDir * stepX;
      }

      // Lose if any alien crosses player line
      for (const a of aliveAliens) {
        if (a.y + ALIEN_H >= player.y - 8) {
          endGame(false);
          return;
        }
      }
    }

    // Alien shooting — interval shrinks with wave + as aliens are killed.
    // Wave 4+ can fire double-shot bursts. Wave 5 bullets are faster.
    alienShootTimer += dt;
    const shootInterval = Math.max(0.28, 1.5 - wave * 0.16 - (1 - remainingFactor) * 0.45);
    if (alienShootTimer >= shootInterval && aliveAliens.length > 0) {
      alienShootTimer = 0;
      // Pick the lowest alien in a random column
      const cols = new Map<number, Alien>();
      for (const a of aliveAliens) {
        const cur = cols.get(a.col);
        if (!cur || a.y > cur.y) cols.set(a.col, a);
      }
      const shooters = [...cols.values()];
      // From wave 4 on, occasionally fire two bullets at once.
      const burstChance = wave >= 5 ? 0.55 : wave >= 4 ? 0.3 : 0;
      const shotCount = burstChance > 0 && Math.random() < burstChance ? 2 : 1;
      const bulletSpeed = 220 + wave * 22;
      const used = new Set<number>();
      for (let s = 0; s < shotCount && shooters.length > used.size; s++) {
        let shooter: Alien;
        let attempts = 0;
        do {
          shooter = shooters[Math.floor(Math.random() * shooters.length)];
          attempts++;
        } while (used.has(shooter.col) && attempts < 8);
        used.add(shooter.col);
        bullets.push({
          x: shooter.x + ALIEN_W / 2,
          y: shooter.y + ALIEN_H,
          vy: bulletSpeed,
          alive: true,
          from: 'alien'
        });
      }
    }

    // Collisions: player bullets vs aliens
    for (const b of bullets) {
      if (!b.alive || b.from !== 'player') continue;
      for (const a of aliens) {
        if (!a.alive) continue;
        if (b.x >= a.x && b.x <= a.x + ALIEN_W && b.y >= a.y && b.y <= a.y + ALIEN_H) {
          a.alive = false;
          b.alive = false;
          score += 10 * (ROWS - a.row); // top rows worth more
          spawnParticles(a.x + ALIEN_W / 2, a.y + ALIEN_H / 2, '#8ed9ff', 12);
          break;
        }
      }
    }

    // Collisions: alien bullets vs player
    for (const b of bullets) {
      if (!b.alive || b.from !== 'alien') continue;
      const px = player.x;
      const py = player.y;
      if (
        b.x >= px - player.w / 2 &&
        b.x <= px + player.w / 2 &&
        b.y >= py - player.h / 2 &&
        b.y <= py + player.h / 2
      ) {
        b.alive = false;
        lives -= 1;
        spawnParticles(px, py, '#f76db8', 18);
        if (lives <= 0) {
          endGame(false);
          return;
        }
      }
    }

    // Particles
    for (const p of particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 60 * dt;
    }
    particles = particles.filter((p) => p.life > 0);
    bullets = bullets.filter((b) => b.alive);

    // Wave clear
    if (aliveAliens.length === 0) {
      if (wave >= 5) {
        endGame(true);
      } else {
        nextWave();
      }
    }
  }

  // ---- Render -----------------------------------------------------------
  function render(ctx: CanvasRenderingContext2D) {
    // Background — deep space gradient
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#070b1a');
    g.addColorStop(1, '#0f1840');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Star field (deterministic)
    ctx.fillStyle = 'rgba(232, 247, 255, 0.55)';
    for (let i = 0; i < 60; i++) {
      const x = (i * 113) % W;
      const y = (i * 79 + ((performance.now() * 0.02) | 0)) % H;
      ctx.fillRect(x, y, 1, 1);
    }

    // Aliens
    for (const a of aliens) {
      if (!a.alive) continue;
      drawAlien(ctx, a.x, a.y, a.row);
    }

    // Player
    drawPlayer(ctx, player.x, player.y);

    // Bullets
    for (const b of bullets) {
      if (!b.alive) continue;
      ctx.fillStyle = b.from === 'player' ? '#8ed9ff' : '#f76db8';
      ctx.fillRect(b.x - 1.5, b.y - 6, 3, 10);
    }

    // Particles
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6));
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 2, 2);
    }
    ctx.globalAlpha = 1;

    // Scanlines overlay
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#000';
    for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
    ctx.globalAlpha = 1;

    // Frame border
    ctx.strokeStyle = 'rgba(142, 217, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(6, 6, W - 12, H - 12);
  }

  function drawAlien(ctx: CanvasRenderingContext2D, x: number, y: number, row: number) {
    // Pixel-art aliens: 3 designs alternating by row
    const palette = ['#8ed9ff', '#b9b3ff', '#f76db8', '#5fe3a4', '#ffd46a'];
    const color = palette[row % palette.length];
    ctx.fillStyle = color;

    const px = 3; // pixel size
    // 8x6 pattern grid
    const patterns = [
      // crab
      [
        '..XX..XX..',
        '.XXXXXXXX.',
        'XXX.XX.XXX',
        'XXXXXXXXXX',
        '.X.X..X.X.',
        'X.X....X.X'
      ],
      // squid
      [
        '...XXXX...',
        '..XXXXXX..',
        '.XX.XX.XX.',
        '.XXXXXXXX.',
        '..X.XX.X..',
        '.X.X..X.X.'
      ],
      // octo
      [
        '..XXXXXX..',
        '.XXXXXXXX.',
        'XX.XXXX.XX',
        'XXXXXXXXXX',
        '.X.XXXX.X.',
        'X.X....X.X'
      ]
    ];
    const p = patterns[row % patterns.length];
    for (let r = 0; r < p.length; r++) {
      for (let c = 0; c < p[r].length; c++) {
        if (p[r][c] === 'X') {
          ctx.fillRect(x + c * px - 3, y + r * px, px, px);
        }
      }
    }
  }

  function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#5fe3a4';
    const px = 3;
    const pat = ['....XX....', '...XXXX...', '..XXXXXX..', 'XXXXXXXXXX'];
    for (let r = 0; r < pat.length; r++) {
      for (let c = 0; c < pat[r].length; c++) {
        if (pat[r][c] === 'X') {
          ctx.fillRect(x - 15 + c * px, y - 9 + r * px, px, px);
        }
      }
    }
    // glow
    ctx.fillStyle = 'rgba(95, 227, 164, 0.18)';
    ctx.fillRect(x - 22, y + 3, 44, 4);
  }

  // ---- Loop -------------------------------------------------------------
  function loop(ts: number) {
    if (!canvasEl || !open) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    if (lastTs === 0) lastTs = ts;
    const dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;

    update(dt);
    render(ctx);

    rafId = requestAnimationFrame(loop);
  }

  // ---- Lifecycle --------------------------------------------------------
  $effect(() => {
    // Only react to `open` transitioning. Game-internal $state (wave, score,
    // lives, etc.) is mutated by the loop and must NOT re-trigger this effect,
    // or every wave-clear would re-run resetGame and pin wave at 1.
    const isOpen = open;
    if (!isOpen) {
      cancelAnimationFrame(rafId);
      lastTs = 0;
      return;
    }

    return untrack(() => {
      // Restore high score
      try {
        const saved = localStorage.getItem('yuxbi:invaders:hi');
        if (saved) highScore = parseInt(saved, 10) || 0;
      } catch {
        /* ignore */
      }

      // Pixelated rendering
      if (canvasEl) {
        canvasEl.width = W;
        canvasEl.height = H;
        const ctx = canvasEl.getContext('2d');
        if (ctx) ctx.imageSmoothingEnabled = false;
      }

      resetGame();
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      rafId = requestAnimationFrame(loop);

      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        lastTs = 0;
      };
    });
  });

  // ---- Touch handlers ---------------------------------------------------
  function onTouchPress(which: 'left' | 'right' | 'fire', e: PointerEvent) {
    e.preventDefault();
    (e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId);
    if (which === 'left') touchLeft = true;
    if (which === 'right') touchRight = true;
    if (which === 'fire') touchFire = true;
  }
  function onTouchRelease(which: 'left' | 'right' | 'fire', e: PointerEvent) {
    e.preventDefault();
    if (which === 'left') touchLeft = false;
    if (which === 'right') touchRight = false;
    if (which === 'fire') touchFire = false;
  }

  function handleReplay() {
    resetGame();
  }

  function handleClose() {
    onClose();
  }
</script>

{#if open}
  <div
    class="invaders-shell"
    role="dialog"
    aria-modal="true"
    aria-label="Signal Breach arcade"
  >
    <div class="invaders-frame">
      <header class="invaders-hud">
        <div class="hud-left">
          <span class="hud-label">Score</span>
          <span class="hud-value">{score.toString().padStart(5, '0')}</span>
        </div>
        <div class="hud-mid">
          <span class="hud-label">Wave</span>
          <span class="hud-value">{wave} / 5</span>
        </div>
        <div class="hud-right">
          <span class="hud-label">Hi</span>
          <span class="hud-value">{highScore.toString().padStart(5, '0')}</span>
          <span class="hud-lives" aria-label="Lives remaining">
            {#each Array(Math.max(0, lives)) as _}
              <span class="life-pip" aria-hidden="true"></span>
            {/each}
          </span>
        </div>
      </header>

      <div class="invaders-stage">
        <canvas bind:this={canvasEl} class="invaders-canvas"></canvas>

        {#if status !== 'playing'}
          <div class="invaders-banner">
            <div class="banner-tag">Signal Breach · Arcade</div>
            <div class="banner-message">{bannerMessage || 'Defend the lab'}</div>
            <div class="banner-meta">
              {#if status === 'won'}
                Final score · {score}
              {:else if status === 'lost'}
                Final score · {score}
              {:else}
                Five waves. They get faster. Don't let them land.
              {/if}
            </div>
            <div class="banner-actions">
              <button class="banner-btn primary" onclick={handleReplay}>
                {status === 'intro' ? 'Begin' : 'Play again'}
              </button>
              <button class="banner-btn ghost" onclick={handleClose}>
                {status === 'intro' ? 'Skip' : 'Exit'}
              </button>
            </div>
          </div>
        {/if}
      </div>

      <button
        class="invaders-close"
        type="button"
        onclick={handleClose}
        aria-label="Close arcade"
      >
        ×
      </button>

      <div class="invaders-controls" aria-hidden={status !== 'playing'}>
        <button
          class="ctrl-btn ctrl-left"
          type="button"
          aria-label="Move left"
          onpointerdown={(e) => onTouchPress('left', e)}
          onpointerup={(e) => onTouchRelease('left', e)}
          onpointercancel={(e) => onTouchRelease('left', e)}
          onpointerleave={(e) => onTouchRelease('left', e)}
        >◀</button>
        <button
          class="ctrl-btn ctrl-fire"
          type="button"
          aria-label="Fire"
          onpointerdown={(e) => onTouchPress('fire', e)}
          onpointerup={(e) => onTouchRelease('fire', e)}
          onpointercancel={(e) => onTouchRelease('fire', e)}
          onpointerleave={(e) => onTouchRelease('fire', e)}
        >FIRE</button>
        <button
          class="ctrl-btn ctrl-right"
          type="button"
          aria-label="Move right"
          onpointerdown={(e) => onTouchPress('right', e)}
          onpointerup={(e) => onTouchRelease('right', e)}
          onpointercancel={(e) => onTouchRelease('right', e)}
          onpointerleave={(e) => onTouchRelease('right', e)}
        >▶</button>
      </div>

      <div class="invaders-hint">
        <span class="hint-desktop">← → move · space to fire · esc to exit</span>
        <span class="hint-mobile">Hold buttons to move · tap fire</span>
      </div>
    </div>
  </div>
{/if}

<style>
  .invaders-shell {
    position: fixed;
    inset: 0;
    z-index: 10200;
    background: rgba(5, 8, 22, 0.94);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    display: grid;
    place-items: center;
    padding: clamp(8px, 2vw, 24px);
    color: #d8e6ff;
    font-family: 'Courier New', ui-monospace, monospace;
    animation: shellIn 0.35s ease-out;
    overflow: hidden;
  }

  @keyframes shellIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .invaders-frame {
    position: relative;
    width: 100%;
    max-width: 540px;
    height: 100%;
    max-height: 880px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: clamp(10px, 2vw, 18px);
    border: 2px solid rgba(142, 217, 255, 0.35);
    border-radius: 18px;
    background:
      radial-gradient(ellipse at top, rgba(53, 104, 235, 0.12), transparent 60%),
      rgba(7, 11, 26, 0.85);
    box-shadow: 0 0 40px rgba(53, 104, 235, 0.25);
  }

  .invaders-close {
    position: absolute;
    top: 10px;
    right: 12px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid rgba(232, 239, 255, 0.25);
    background: rgba(7, 11, 26, 0.7);
    color: rgba(232, 239, 255, 0.75);
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    display: grid;
    place-items: center;
    z-index: 4;
    padding: 0;
    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  }
  .invaders-close:hover {
    background: rgba(247, 109, 184, 0.2);
    color: #fff;
    border-color: rgba(247, 109, 184, 0.6);
  }

  /* HUD */
  .invaders-hud {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border: 1px solid rgba(142, 217, 255, 0.22);
    border-radius: 10px;
    background: rgba(13, 21, 46, 0.65);
    font-size: 0.7rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }
  .hud-left { justify-self: start; }
  .hud-mid { justify-self: center; }
  .hud-right { justify-self: end; display: inline-flex; align-items: center; gap: 8px; }
  .hud-label {
    color: rgba(232, 239, 255, 0.45);
    margin-right: 6px;
  }
  .hud-value {
    color: #8ed9ff;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .hud-lives {
    display: inline-flex;
    gap: 3px;
    margin-left: 4px;
  }
  .life-pip {
    width: 8px;
    height: 8px;
    background: #5fe3a4;
    box-shadow: 0 0 6px rgba(95, 227, 164, 0.6);
    /* pixelated pip */
    clip-path: polygon(40% 0, 60% 0, 60% 25%, 100% 25%, 100% 75%, 60% 75%, 60% 100%, 40% 100%, 40% 75%, 0 75%, 0 25%, 40% 25%);
  }

  /* Stage / canvas */
  .invaders-stage {
    position: relative;
    flex: 1 1 auto;
    display: grid;
    place-items: center;
    min-height: 0;
    border-radius: 10px;
    overflow: hidden;
    background: #050817;
  }

  .invaders-canvas {
    display: block;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  }

  /* Banner overlay (intro / win / lose) */
  .invaders-banner {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(5, 8, 22, 0.78);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    text-align: center;
    padding: 24px;
    animation: bannerIn 0.4s ease-out;
  }
  @keyframes bannerIn {
    from { opacity: 0; transform: scale(0.97); }
    to { opacity: 1; transform: scale(1); }
  }
  .banner-tag {
    font-size: 0.62rem;
    letter-spacing: 0.32em;
    color: rgba(232, 239, 255, 0.55);
    margin-bottom: 12px;
    text-transform: uppercase;
  }
  .banner-message {
    font-size: clamp(1.15rem, 3.4vw, 1.6rem);
    color: #fff;
    margin-bottom: 6px;
    letter-spacing: 0.04em;
    font-weight: 600;
  }
  .banner-meta {
    font-size: 0.72rem;
    color: rgba(232, 239, 255, 0.55);
    margin-bottom: 20px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .banner-actions {
    display: inline-flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .banner-btn {
    padding: 10px 18px;
    border-radius: 999px;
    border: 1px solid rgba(142, 217, 255, 0.35);
    background: transparent;
    color: #d8e6ff;
    font-family: inherit;
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
  }
  .banner-btn.primary {
    background: linear-gradient(180deg, rgba(95, 227, 164, 0.85), rgba(53, 104, 235, 0.85));
    border-color: transparent;
    color: #050817;
    font-weight: 700;
  }
  .banner-btn.primary:hover { transform: translateY(-1px); }
  .banner-btn.ghost:hover {
    background: rgba(232, 239, 255, 0.06);
    color: #fff;
  }

  /* Touch controls */
  .invaders-controls {
    display: grid;
    grid-template-columns: 1fr 1.6fr 1fr;
    gap: 10px;
    padding: 6px 4px 0;
  }
  .ctrl-btn {
    border: 1px solid rgba(142, 217, 255, 0.3);
    background: rgba(13, 21, 46, 0.7);
    color: #8ed9ff;
    border-radius: 12px;
    font-family: inherit;
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    padding: 14px 6px;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    transition: background 0.12s ease, transform 0.08s ease, border-color 0.12s ease;
  }
  .ctrl-btn:active {
    background: rgba(142, 217, 255, 0.25);
    transform: scale(0.97);
    border-color: rgba(142, 217, 255, 0.6);
  }
  .ctrl-fire {
    color: #5fe3a4;
    font-size: 0.92rem;
    border-color: rgba(95, 227, 164, 0.45);
    background: rgba(13, 21, 46, 0.85);
  }
  .ctrl-fire:active {
    background: rgba(95, 227, 164, 0.28);
    border-color: rgba(95, 227, 164, 0.7);
  }

  .invaders-hint {
    text-align: center;
    font-size: 0.6rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(232, 239, 255, 0.4);
    padding-top: 2px;
  }

  .hint-mobile { display: none; }

  /* Hide desktop touch controls on hover-capable pointer (still keep them tappable on touch); on small screens prefer touch */
  @media (hover: hover) and (pointer: fine) {
    .invaders-controls {
      display: none;
    }
    .hint-desktop { display: inline; }
    .hint-mobile { display: none; }
  }
  @media (hover: none) {
    .hint-desktop { display: none; }
    .hint-mobile { display: inline; }
  }

  /* Tighter on short screens */
  @media (max-height: 640px) {
    .invaders-frame {
      gap: 6px;
      padding: 8px;
    }
    .ctrl-btn { padding: 10px 6px; }
  }

  /* Reduced motion: still playable, just no overlay animation */
  @media (prefers-reduced-motion: reduce) {
    .invaders-shell, .invaders-banner {
      animation: none;
    }
  }
</style>
