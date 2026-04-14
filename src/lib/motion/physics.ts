/**
 * Yuxbi Antigravity Physics System
 * Lightweight custom physics for floating fragments, cursor reactivity, and elastic motion.
 * No external dependencies — pure math.
 */

export interface Vec2 {
  x: number;
  y: number;
}

export interface Fragment {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  angularVel: number;
  width: number;
  height: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'dash' | 'dot' | 'ring' | 'diamond';
  friction: number;
}

export interface PhysicsConfig {
  gravity: number;        // negative = antigravity (upward drift)
  friction: number;       // air resistance
  cursorForce: number;    // how strongly cursor pushes particles
  cursorRadius: number;   // radius of cursor influence
  bounds: { width: number; height: number };
}

const DEFAULT_CONFIG: PhysicsConfig = {
  gravity: -0.015,
  friction: 0.995,
  cursorForce: 0.08,
  cursorRadius: 200,
  bounds: { width: 1920, height: 1080 }
};

// Yuxbi brand fragment colors — teal/cyan palette, no bright rainbow
const FRAGMENT_COLORS = [
  'rgba(80, 200, 220, 0.7)',   // teal
  'rgba(100, 180, 255, 0.6)',  // light blue
  'rgba(144, 96, 192, 0.5)',   // violet
  'rgba(180, 200, 220, 0.4)',  // ghost white
  'rgba(60, 220, 180, 0.5)',   // mint
  'rgba(200, 200, 240, 0.3)',  // pale lavender
];

export function createFragment(x: number, y: number, burst = false): Fragment {
  const types: Fragment['type'][] = ['dash', 'dot', 'ring', 'diamond'];
  const type = types[Math.floor(Math.random() * types.length)];
  const speed = burst ? (Math.random() * 4 + 2) : (Math.random() * 0.5 + 0.1);
  const angle = Math.random() * Math.PI * 2;

  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - (burst ? 2 : 0),
    rotation: Math.random() * Math.PI * 2,
    angularVel: (Math.random() - 0.5) * 0.06,
    width: type === 'dash' ? (Math.random() * 16 + 6) : (Math.random() * 6 + 3),
    height: type === 'dash' ? (Math.random() * 3 + 1.5) : (Math.random() * 6 + 3),
    opacity: Math.random() * 0.6 + 0.2,
    color: FRAGMENT_COLORS[Math.floor(Math.random() * FRAGMENT_COLORS.length)],
    life: 0,
    maxLife: burst ? (Math.random() * 200 + 100) : (Math.random() * 600 + 400),
    type,
    friction: 0.992 + Math.random() * 0.006
  };
}

export function createBurst(x: number, y: number, count = 20): Fragment[] {
  const fragments: Fragment[] = [];
  for (let i = 0; i < count; i++) {
    fragments.push(createFragment(x, y, true));
  }
  return fragments;
}

export function updateFragment(f: Fragment, config: PhysicsConfig, cursor: Vec2): boolean {
  // Apply antigravity
  f.vy += config.gravity;

  // Cursor repulsion/attraction
  const dx = f.x - cursor.x;
  const dy = f.y - cursor.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < config.cursorRadius && dist > 1) {
    const force = (1 - dist / config.cursorRadius) * config.cursorForce;
    f.vx += (dx / dist) * force;
    f.vy += (dy / dist) * force;
  }

  // Apply friction
  f.vx *= f.friction;
  f.vy *= f.friction;

  // Update position
  f.x += f.vx;
  f.y += f.vy;

  // Update rotation
  f.rotation += f.angularVel;
  f.angularVel *= 0.998;

  // Lifecycle
  f.life++;
  const lifeRatio = f.life / f.maxLife;
  if (lifeRatio > 0.7) {
    f.opacity *= 0.98;
  }

  // Wrap horizontal
  if (f.x < -50) f.x = config.bounds.width + 50;
  if (f.x > config.bounds.width + 50) f.x = -50;

  // Dead if faded or off-screen vertically
  return f.opacity > 0.01 && f.y > -100 && f.y < config.bounds.height + 100;
}

export function drawFragment(ctx: CanvasRenderingContext2D, f: Fragment) {
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(f.rotation);
  ctx.globalAlpha = f.opacity;

  switch (f.type) {
    case 'dash':
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.roundRect(-f.width / 2, -f.height / 2, f.width, f.height, 1);
      ctx.fill();
      break;

    case 'dot':
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.arc(0, 0, f.width / 2, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'ring':
      ctx.strokeStyle = f.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, f.width / 2, 0, Math.PI * 2);
      ctx.stroke();
      break;

    case 'diamond':
      ctx.fillStyle = f.color;
      const s = f.width / 2;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(s * 0.6, 0);
      ctx.lineTo(0, s);
      ctx.lineTo(-s * 0.6, 0);
      ctx.closePath();
      ctx.fill();
      break;
  }

  ctx.restore();
}

/** Lerp with spring-like easing */
export function springLerp(current: number, target: number, stiffness = 0.08, damping = 0.85): number {
  return current + (target - current) * stiffness;
}

/** Elastic easing for hover effects */
export function elasticOut(t: number): number {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
}

export { DEFAULT_CONFIG };
