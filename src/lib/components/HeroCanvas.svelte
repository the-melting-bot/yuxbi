<script lang="ts">
  let canvas: HTMLCanvasElement;
  let animationId: number;

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    pulse: number;
    pulseSpeed: number;
  }

  interface FloatingObject {
    x: number;
    y: number;
    baseY: number;
    rotation: number;
    rotationSpeed: number;
    floatSpeed: number;
    floatAmplitude: number;
    scale: number;
    opacity: number;
    phase: number;
    type: 'craft' | 'ring' | 'diamond';
  }

  $effect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let floatingObjects: FloatingObject[] = [];
    let mouseX = 0;
    let mouseY = 0;
    let time = 0;
    let radarAngle = 0;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      initParticles();
      initFloatingObjects();
    }

    function initParticles() {
      const count = Math.min(Math.floor((width * height) / 8000), 120);
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.5 + 0.1,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.02 + 0.005
        });
      }
    }

    function initFloatingObjects() {
      floatingObjects = [];
      const types: FloatingObject['type'][] = ['craft', 'ring', 'diamond'];
      const count = width < 640 ? 3 : 5;
      for (let i = 0; i < count; i++) {
        floatingObjects.push({
          x: Math.random() * width * 0.8 + width * 0.1,
          y: Math.random() * height * 0.6 + height * 0.1,
          baseY: Math.random() * height * 0.6 + height * 0.1,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.005,
          floatSpeed: Math.random() * 0.008 + 0.003,
          floatAmplitude: Math.random() * 30 + 15,
          scale: Math.random() * 0.6 + 0.4,
          opacity: Math.random() * 0.15 + 0.05,
          phase: Math.random() * Math.PI * 2,
          type: types[i % types.length]
        });
      }
    }

    function drawCraft(x: number, y: number, scale: number, rotation: number, opacity: number) {
      ctx!.save();
      ctx!.translate(x, y);
      ctx!.rotate(rotation);
      ctx!.globalAlpha = opacity;

      const s = 40 * scale;

      // UFO body
      ctx!.beginPath();
      ctx!.ellipse(0, 0, s * 1.5, s * 0.4, 0, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(80, 200, 220, ${opacity})`;
      ctx!.lineWidth = 1;
      ctx!.stroke();

      // Dome
      ctx!.beginPath();
      ctx!.ellipse(0, -s * 0.2, s * 0.6, s * 0.35, 0, Math.PI, 0);
      ctx!.strokeStyle = `rgba(80, 200, 220, ${opacity * 0.7})`;
      ctx!.stroke();

      // Glow beneath
      const gradient = ctx!.createRadialGradient(0, s * 0.2, 0, 0, s * 0.2, s * 1.2);
      gradient.addColorStop(0, `rgba(80, 200, 220, ${opacity * 0.3})`);
      gradient.addColorStop(1, 'rgba(80, 200, 220, 0)');
      ctx!.fillStyle = gradient;
      ctx!.fillRect(-s * 1.5, 0, s * 3, s * 1.5);

      ctx!.restore();
    }

    function drawRing(x: number, y: number, scale: number, rotation: number, opacity: number) {
      ctx!.save();
      ctx!.translate(x, y);
      ctx!.rotate(rotation);
      ctx!.globalAlpha = opacity;

      const s = 30 * scale;

      ctx!.beginPath();
      ctx!.ellipse(0, 0, s, s * 0.3, 0, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(80, 200, 220, ${opacity})`;
      ctx!.lineWidth = 1;
      ctx!.stroke();

      ctx!.beginPath();
      ctx!.ellipse(0, 0, s * 0.6, s * 0.18, 0, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(80, 200, 220, ${opacity * 0.5})`;
      ctx!.stroke();

      ctx!.restore();
    }

    function drawDiamond(x: number, y: number, scale: number, rotation: number, opacity: number) {
      ctx!.save();
      ctx!.translate(x, y);
      ctx!.rotate(rotation);
      ctx!.globalAlpha = opacity;

      const s = 20 * scale;
      ctx!.beginPath();
      ctx!.moveTo(0, -s);
      ctx!.lineTo(s * 0.6, 0);
      ctx!.lineTo(0, s);
      ctx!.lineTo(-s * 0.6, 0);
      ctx!.closePath();
      ctx!.strokeStyle = `rgba(80, 200, 220, ${opacity})`;
      ctx!.lineWidth = 1;
      ctx!.stroke();

      ctx!.restore();
    }

    function drawRadar() {
      const cx = width * 0.5;
      const cy = height * 0.45;
      const maxR = Math.min(width, height) * 0.35;

      radarAngle += 0.004;

      // Radar sweep
      const sweepGradient = ctx!.createConicGradient(radarAngle, cx, cy);
      sweepGradient.addColorStop(0, 'rgba(80, 200, 220, 0.04)');
      sweepGradient.addColorStop(0.1, 'rgba(80, 200, 220, 0)');
      sweepGradient.addColorStop(1, 'rgba(80, 200, 220, 0)');

      ctx!.beginPath();
      ctx!.arc(cx, cy, maxR, 0, Math.PI * 2);
      ctx!.fillStyle = sweepGradient;
      ctx!.fill();

      // Concentric rings
      for (let i = 1; i <= 3; i++) {
        ctx!.beginPath();
        ctx!.arc(cx, cy, maxR * (i / 3), 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(80, 200, 220, ${0.04 - i * 0.008})`;
        ctx!.lineWidth = 0.5;
        ctx!.stroke();
      }

      // Crosshair lines
      ctx!.strokeStyle = 'rgba(80, 200, 220, 0.03)';
      ctx!.lineWidth = 0.5;
      ctx!.beginPath();
      ctx!.moveTo(cx - maxR, cy);
      ctx!.lineTo(cx + maxR, cy);
      ctx!.moveTo(cx, cy - maxR);
      ctx!.lineTo(cx, cy + maxR);
      ctx!.stroke();
    }

    function drawGrid() {
      ctx!.strokeStyle = 'rgba(80, 200, 220, 0.02)';
      ctx!.lineWidth = 0.5;

      const gridSize = 80;
      for (let x = 0; x < width; x += gridSize) {
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, height);
        ctx!.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(width, y);
        ctx!.stroke();
      }
    }

    function drawNebula() {
      // Central atmospheric glow
      const cx = width * 0.5;
      const cy = height * 0.4;
      const nebula = ctx!.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.6);
      nebula.addColorStop(0, 'rgba(30, 60, 80, 0.15)');
      nebula.addColorStop(0.3, 'rgba(20, 40, 60, 0.08)');
      nebula.addColorStop(0.7, 'rgba(15, 20, 40, 0.04)');
      nebula.addColorStop(1, 'rgba(10, 10, 15, 0)');
      ctx!.fillStyle = nebula;
      ctx!.fillRect(0, 0, width, height);

      // Secondary nebula puff
      const n2 = ctx!.createRadialGradient(width * 0.7, height * 0.3, 0, width * 0.7, height * 0.3, width * 0.3);
      n2.addColorStop(0, 'rgba(60, 40, 100, 0.06)');
      n2.addColorStop(1, 'rgba(10, 10, 15, 0)');
      ctx!.fillStyle = n2;
      ctx!.fillRect(0, 0, width, height);
    }

    function animate() {
      time++;
      ctx!.clearRect(0, 0, width, height);

      // Background layers
      drawNebula();
      drawGrid();
      drawRadar();

      // Particles
      for (const p of particles) {
        p.x += p.vx + (mouseX - width / 2) * 0.00003;
        p.y += p.vy + (mouseY - height / 2) * 0.00003;
        p.pulse += p.pulseSpeed;

        // Wrap
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const pulseOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(180, 200, 220, ${pulseOpacity})`;
        ctx!.fill();
      }

      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(80, 200, 220, ${0.06 * (1 - dist / 120)})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }

      // Floating objects
      for (const obj of floatingObjects) {
        obj.rotation += obj.rotationSpeed;
        obj.phase += obj.floatSpeed;
        obj.y = obj.baseY + Math.sin(obj.phase) * obj.floatAmplitude;

        if (obj.type === 'craft') {
          drawCraft(obj.x, obj.y, obj.scale, obj.rotation, obj.opacity);
        } else if (obj.type === 'ring') {
          drawRing(obj.x, obj.y, obj.scale, obj.rotation, obj.opacity);
        } else {
          drawDiamond(obj.x, obj.y, obj.scale, obj.rotation, obj.opacity);
        }
      }

      animationId = requestAnimationFrame(animate);
    }

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    resize();
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
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
    pointer-events: none;
  }
</style>
