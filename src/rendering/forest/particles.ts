import { toStage } from './timeline';
import type { Camera } from './timeline';

/**
 * Lightweight canvas particle field (no dependency). World-space particles follow the
 * camera; screen-space ones (ambient pollen) do not. Capped to stay cheap.
 */
export type ParticleKind =
  | 'spark'
  | 'pollen'
  | 'confetti'
  | 'leaf'
  | 'dust'
  | 'flash'
  /** Expanding glow ring; `size` is its final radius. */
  | 'ring';
type Particle = {
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  rot: number;
  vr: number;
  gravity: number;
  screen: boolean;
};
export type ShieldZone = { x: number; y: number; rx: number; ry: number } | null;

const MAX_PARTICLES = 450;
const random = (a: number, b: number) => a + Math.random() * (b - a);
export const SPARK_COLORS = ['#fff4c2', '#ffd36e', '#ffe9a8', '#bfe8ff', '#ffc2e2'];
export const CONFETTI_COLORS = ['#e8775f', '#f5bf72', '#7fb8de', '#a9d7a0', '#d99ad0', '#fff4c2'];
export const LEAF_COLORS = ['#6cb663', '#93d27a', '#e0b44f', '#d98a4a'];

const glowCache = new Map<string, HTMLCanvasElement>();
function glow(color: string) {
  let sprite = glowCache.get(color);
  if (!sprite) {
    sprite = document.createElement('canvas');
    sprite.width = sprite.height = 64;
    const ctx = sprite.getContext('2d');
    if (ctx) {
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.25, color);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
    }
    glowCache.set(color, sprite);
  }
  return sprite;
}

export class ParticleField {
  private list: Particle[] = [];

  get count() {
    return this.list.length;
  }

  clear() {
    this.list = [];
  }

  /** `delay` (s) holds a particle invisible before it starts, for staged effects. */
  add(
    kind: ParticleKind,
    x: number,
    y: number,
    {
      delay = 0,
      ...options
    }: Partial<Omit<Particle, 'kind' | 'x' | 'y'>> & { delay?: number } = {},
  ) {
    if (this.list.length >= MAX_PARTICLES) return;
    this.list.push({
      kind,
      x,
      y,
      vx: 0,
      vy: 0,
      max: 1.5,
      size: 10,
      color: '#fff4c2',
      rot: random(0, Math.PI * 2),
      vr: 0,
      gravity: 0,
      screen: false,
      ...options,
      life: -delay,
    });
  }

  /** Radial burst of sparkles around a world point. */
  burst(x: number, y: number, count: number, colors = SPARK_COLORS, speed = 420) {
    for (let i = 0; i < count; i++) {
      const angle = random(0, Math.PI * 2);
      const v = random(speed * 0.3, speed);
      this.add('spark', x, y, {
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v - 80,
        max: random(0.8, 1.6),
        size: random(6, 14),
        color: colors[i % colors.length],
        gravity: 160,
      });
    }
    this.add('flash', x, y, { max: 0.7, size: 260, color: colors[0] });
  }

  /** Magic answer to the leaf gust: every leaf in the air becomes a sparkle. */
  leavesToSparkles() {
    for (const p of this.list)
      if (p.kind === 'leaf') {
        p.kind = 'spark';
        p.vy -= 120;
        p.gravity = -40;
        p.color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];
        p.size *= 0.6;
        p.life = 0;
        p.max = 1.2;
      }
  }

  update(dt: number, shield: ShieldZone) {
    const next: Particle[] = [];
    for (const p of this.list) {
      p.life += dt;
      if (p.life >= p.max) continue;
      if (p.life < 0) {
        next.push(p);
        continue;
      }
      p.vy += p.gravity * dt;
      if (p.kind === 'confetti' || p.kind === 'leaf') {
        p.vx *= 1 - 0.6 * dt;
        p.x += Math.sin(p.life * 3 + p.rot) * 30 * dt;
      }
      if (p.kind === 'pollen') p.x += Math.sin(p.life * 1.3 + p.rot) * 12 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (shield && p.kind === 'leaf') {
        // Leaves glance off the magic bubble instead of passing through.
        const dx = (p.x - shield.x) / shield.rx;
        const dy = (p.y - shield.y) / shield.ry;
        const d = Math.hypot(dx, dy);
        if (d < 1 && d > 0.001) {
          p.x = shield.x + (dx / d) * shield.rx;
          p.y = shield.y + (dy / d) * shield.ry;
          const nx = dx / d,
            ny = dy / d;
          const dot = p.vx * nx + p.vy * ny;
          if (dot < 0) {
            p.vx -= 1.8 * dot * nx;
            p.vy -= 1.8 * dot * ny;
          }
        }
      }
      next.push(p);
    }
    this.list = next;
  }

  draw(ctx: CanvasRenderingContext2D, cam: Camera) {
    for (const p of this.list) {
      if (p.life < 0) continue;
      const k = p.life / p.max;
      const pos = p.screen ? p : toStage(p.x, p.y, cam);
      const scale = p.screen ? 1 : cam.zoom;
      const fade = k < 0.15 ? k / 0.15 : 1 - Math.max(0, (k - 0.6) / 0.4);
      ctx.save();
      ctx.translate(pos.x, pos.y);
      switch (p.kind) {
        case 'flash': {
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = (1 - k) * 0.8;
          const s = p.size * (0.5 + k) * scale;
          ctx.drawImage(glow(p.color), -s / 2, -s / 2, s, s);
          break;
        }
        case 'spark':
        case 'pollen': {
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = fade * (p.kind === 'pollen' ? 0.55 : 1);
          const s = p.size * 3 * scale;
          ctx.drawImage(glow(p.color), -s / 2, -s / 2, s, s);
          if (p.kind === 'spark') {
            ctx.rotate(p.rot);
            ctx.fillStyle = '#ffffff';
            const r = p.size * 0.9 * scale;
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
              const a = (i * Math.PI) / 4;
              const len = i % 2 ? r * 0.28 : r;
              ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
            }
            ctx.fill();
          }
          break;
        }
        case 'confetti': {
          ctx.globalAlpha = fade;
          ctx.rotate(p.rot);
          ctx.scale(1, Math.cos(p.life * 8 + p.rot));
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size * scale * 0.5, -p.size * scale * 0.3, p.size * scale, p.size * scale * 0.6);
          break;
        }
        case 'leaf': {
          ctx.globalAlpha = fade;
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * scale, p.size * 0.45 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(40,80,30,0.35)';
          ctx.lineWidth = 1.5 * scale;
          ctx.beginPath();
          ctx.moveTo(-p.size * scale, 0);
          ctx.lineTo(p.size * scale, 0);
          ctx.stroke();
          break;
        }
        case 'ring': {
          const grow = 1 - (1 - k) ** 3;
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = 1 - k;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = Math.max(1, 16 * (1 - k) * scale);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * (0.12 + 0.88 * grow) * scale, p.size * 0.78 * (0.12 + 0.88 * grow) * scale, 0, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
        case 'dust': {
          ctx.globalAlpha = (1 - k) * 0.45;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * (0.6 + k) * scale, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
      }
      ctx.restore();
    }
  }
}
