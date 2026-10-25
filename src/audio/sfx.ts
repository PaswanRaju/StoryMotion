/**
 * Tiny original sound effects synthesized with Web Audio — no audio files or licenses
 * involved. Best effort: if audio is unavailable or still locked by the browser's
 * autoplay policy, nothing plays and nothing else is affected.
 */
export type Sfx =
  | 'invite'
  | 'magic'
  | 'shield'
  | 'duck'
  | 'path'
  | 'finish'
  // Interface cues
  | 'click'
  | 'hover'
  | 'select'
  | 'start'
  | 'toggle'
  | 'cameraOn'
  | 'cameraOff'
  | 'recognized'
  | 'celebrate';

/** UI/story sound effects switch (narration has its own toggle). */
let enabled = true;
export function setSfxEnabled(value: boolean) {
  enabled = value;
}
export const sfxEnabled = () => enabled;
/** Anti-spam: the same cue is not repeated within this window. */
const MIN_GAP_MS = 120;
const lastPlayed = new Map<Sfx, number>();

let context: AudioContext | null = null;
function audio() {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    context ??= new Ctor();
    if (context.state === 'suspended') void context.resume().catch(() => {});
    return context;
  } catch {
    return null;
  }
}

/** Call from a click/tap so later automatic sounds are allowed to play. */
export function unlockSfx() {
  audio();
}

function tone(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  { type = 'sine', volume = 0.12, slideTo }: { type?: OscillatorType; volume?: number; slideTo?: number } = {},
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

export function playSfx(name: Sfx) {
  if (!enabled) return;
  const now = performance.now();
  if (now - (lastPlayed.get(name) ?? -Infinity) < MIN_GAP_MS) return;
  lastPlayed.set(name, now);
  const ctx = audio();
  if (!ctx || ctx.state !== 'running') return;
  const t = ctx.currentTime + 0.01;
  switch (name) {
    case 'click':
      tone(ctx, 880, t, 0.07, { volume: 0.05, slideTo: 1320 });
      break;
    case 'hover':
      tone(ctx, 1760, t, 0.05, { volume: 0.015 });
      break;
    case 'select':
      tone(ctx, 660, t, 0.12, { type: 'triangle', volume: 0.07 });
      tone(ctx, 990, t + 0.07, 0.18, { type: 'triangle', volume: 0.06 });
      break;
    case 'start':
      [392, 523, 659, 784].forEach((f, i) =>
        tone(ctx, f, t + i * 0.07, 0.3, { type: 'triangle', volume: 0.07 }),
      );
      tone(ctx, 1568, t + 0.3, 0.6, { volume: 0.03 });
      break;
    case 'toggle':
      tone(ctx, 740, t, 0.08, { type: 'square', volume: 0.025 });
      tone(ctx, 988, t + 0.06, 0.1, { type: 'square', volume: 0.02 });
      break;
    case 'cameraOn':
      tone(ctx, 523, t, 0.15, { volume: 0.06, slideTo: 1046 });
      tone(ctx, 1318, t + 0.14, 0.3, { volume: 0.04 });
      break;
    case 'cameraOff':
      tone(ctx, 784, t, 0.2, { volume: 0.05, slideTo: 392 });
      break;
    case 'recognized':
      tone(ctx, 1318, t, 0.12, { volume: 0.035 });
      tone(ctx, 1760, t + 0.06, 0.16, { volume: 0.03 });
      break;
    case 'celebrate':
      [523, 659, 784, 1046, 1318].forEach((f, i) =>
        tone(ctx, f, t + i * 0.1, i === 4 ? 0.9 : 0.25, { type: 'triangle', volume: 0.08 }),
      );
      [2093, 2637, 3136].forEach((f, i) =>
        tone(ctx, f, t + 0.55 + i * 0.08, 0.4, { volume: 0.025 }),
      );
      break;
    case 'invite':
      tone(ctx, 784, t, 0.35, { volume: 0.08 });
      tone(ctx, 1046, t + 0.14, 0.45, { volume: 0.07 });
      break;
    case 'magic':
      [1046, 1318, 1568, 2093, 2637].forEach((f, i) =>
        tone(ctx, f, t + i * 0.07, 0.5, { type: 'triangle', volume: 0.07 }),
      );
      break;
    case 'shield':
      tone(ctx, 330, t, 0.6, { type: 'triangle', volume: 0.1, slideTo: 660 });
      tone(ctx, 990, t + 0.25, 0.6, { volume: 0.06 });
      break;
    case 'duck':
      tone(ctx, 520, t, 0.25, { type: 'triangle', volume: 0.1, slideTo: 240 });
      tone(ctx, 260, t + 0.45, 0.25, { type: 'triangle', volume: 0.08, slideTo: 520 });
      break;
    case 'path':
      tone(ctx, 587, t, 0.2, { type: 'triangle', volume: 0.09 });
      tone(ctx, 880, t + 0.12, 0.35, { type: 'triangle', volume: 0.09 });
      break;
    case 'finish':
      [523, 659, 784, 1046].forEach((f, i) =>
        tone(ctx, f, t + i * 0.13, i === 3 ? 0.8 : 0.25, { type: 'triangle', volume: 0.1 }),
      );
      break;
  }
}
