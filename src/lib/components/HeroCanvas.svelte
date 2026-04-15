<script lang="ts">
  import {
    type Fragment,
    type Vec2,
    createFragment,
    createBurst,
    updateFragment,
    drawFragment,
    DEFAULT_CONFIG
  } from '$lib/motion/physics';
  import { getCursor, initCursorTracking } from '$lib/motion/cursor';

  let canvas: HTMLCanvasElement;
  let animationId: number;

  $effect(() => {
    if (!canvas) return;
    initCursorTracking();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let fragments: Fragment[] = [];
    let config = { ...DEFAULT_CONFIG };
    let time = 0;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      config.bounds = { width, height };

      // Seed ambient fragments
      if (fragments.length < 20) {
        const count = Math.min(Math.floor((width * height) / 20000), 50);
        for (let i = 0; i < count; i++) {
          const f = createFragment(
            Math.random() * width,
            Math.random() * height,
            false
          );
          f.maxLife = 9999; // Ambient fragments live long
          fragments.push(f);
        }
      }
    }

    function spawnAmbient() {
      // Continuously spawn from bottom, floating up (antigravity)
      if (fragments.length < 60 && Math.random() < 0.03) {
        const f = createFragment(
          Math.random() * width,
          height + 20,
          false
        );
        f.vy = -(Math.random() * 0.5 + 0.2);
        f.maxLife = 800 + Math.random() * 400;
        fragments.push(f);
      }
    }

    function drawGrid() {
      const gridSize = 100;
      const cursor = getCursor();
      const cx = cursor.smoothX;
      const cy = cursor.smoothY;

      for (let x = 0; x <= width; x += gridSize) {
        for (let y = 0; y <= height; y += gridSize) {
          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const influence = Math.max(0, 1 - dist / 400);
          const dotSize = 1 + influence * 2;
          const dotOpacity = 0.06 + influence * 0.12;

          ctx!.beginPath();
          ctx!.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(53, 104, 235, ${dotOpacity})`;
          ctx!.fill();
        }
      }
    }

    function drawAtmosphere() {
      // Soft radial glow that follows cursor gently
      const cursor = getCursor();
      const cx = cursor.smoothX || width / 2;
      const cy = cursor.smoothY || height / 2;

      const glow = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 500);
      glow.addColorStop(0, 'rgba(255, 181, 65, 0.18)');
      glow.addColorStop(0.45, 'rgba(53, 104, 235, 0.1)');
      glow.addColorStop(1, 'rgba(255, 246, 223, 0)');
      ctx!.fillStyle = glow;
      ctx!.fillRect(0, 0, width, height);
    }

    function onClick(e: MouseEvent) {
      // Burst fragments on click — the fun interactive moment
      const burst = createBurst(e.clientX, e.clientY, 15);
      fragments.push(...burst);
    }

    function onTouch(e: TouchEvent) {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        const burst = createBurst(t.clientX, t.clientY, 10);
        fragments.push(...burst);
      }
    }

    function animate() {
      time++;
      ctx!.clearRect(0, 0, width, height);

      drawAtmosphere();
      drawGrid();

      const cursor = getCursor();
      const cursorVec: Vec2 = { x: cursor.x, y: cursor.y };

      // Update & draw fragments
      fragments = fragments.filter(f => updateFragment(f, config, cursorVec));

      for (const f of fragments) {
        drawFragment(ctx!, f);
      }

      spawnAmbient();

      animationId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize, { passive: true });
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('touchstart', onTouch, { passive: true });

    resize();
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('touchstart', onTouch);
    };
  });
</script>

<canvas
  bind:this={canvas}
  class="hero-canvas"
  aria-hidden="true"
></canvas>

<style>
  .hero-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    cursor: crosshair;
  }
</style>
