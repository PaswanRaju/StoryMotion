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
  | 'celebrate'
  // Story events (scene cues)
  | StorySfx;
/** Sounds tied to visible story events. Short, gentle, and synthesized. */
export const STORY_SFX = [
  'moo',
  'sad',
  'step',
  'sparkle',
  'door',
  'whoosh',
  'thump',
  'flap',
  'boom',
  'ding',
  'cluck',
  'yawn',
  'snore',
  'gasp',
  'roar',
  'creak',
  'slide',
  'chop',
  'crash',
  'cheer',
  'rustle',
  'stone',
  'brick',
  'sniff',
  'inhale',
  'blow',
  'patter',
  'stomp',
  'idea',
  'bonk',
  'clank',
  'splash',
  'pop',
  'retreat',
] as const;
export type StorySfx = (typeof STORY_SFX)[number];

/** UI/story sound effects switch (narration has its own toggle). */
let enabled = true;
let masterVolume = 0.8;
export function setSfxVolume(value: number) {
  masterVolume = Math.max(0, Math.min(1, value));
}
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
  {
    type = 'sine',
    volume = 0.12,
    slideTo,
  }: { type?: OscillatorType; volume?: number; slideTo?: number } = {},
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  if (slideTo)
    osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(
    Math.max(0.0001, volume * masterVolume),
    start + 0.02,
  );
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

let noiseBuffer: AudioBuffer | null = null;
/** Filtered white noise: wind, rustles, splashes, crashes. */
function noise(
  ctx: AudioContext,
  start: number,
  duration: number,
  {
    type = 'bandpass',
    frequency = 1000,
    slideTo,
    q = 1,
    volume = 0.1,
    attack = 0.02,
  }: {
    type?: BiquadFilterType;
    frequency?: number;
    slideTo?: number;
    q?: number;
    volume?: number;
    attack?: number;
  } = {},
) {
  if (!noiseBuffer || noiseBuffer.sampleRate !== ctx.sampleRate) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(frequency, start);
  if (slideTo)
    filter.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(
    Math.max(0.0001, volume * masterVolume),
    start + attack,
  );
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(start);
  source.stop(start + duration + 0.05);
}

function storySound(ctx: AudioContext, name: StorySfx, t: number) {
  switch (name) {
    case 'moo':
      tone(ctx, 150, t, 0.9, { type: 'sawtooth', volume: 0.05, slideTo: 115 });
      tone(ctx, 300, t, 0.9, { type: 'triangle', volume: 0.03, slideTo: 230 });
      break;
    case 'sad':
      tone(ctx, 392, t, 0.35, { type: 'triangle', volume: 0.05 });
      tone(ctx, 330, t + 0.3, 0.6, {
        type: 'triangle',
        volume: 0.05,
        slideTo: 294,
      });
      break;
    case 'step':
      noise(ctx, t, 0.08, { type: 'lowpass', frequency: 500, volume: 0.06 });
      noise(ctx, t + 0.28, 0.08, {
        type: 'lowpass',
        frequency: 450,
        volume: 0.05,
      });
      break;
    case 'sparkle':
      [1568, 2093, 2637, 3136].forEach((f, i) =>
        tone(ctx, f, t + i * 0.06, 0.35, { volume: 0.03 }),
      );
      break;
    case 'door':
      noise(ctx, t, 0.12, { type: 'lowpass', frequency: 300, volume: 0.12 });
      tone(ctx, 110, t, 0.18, { type: 'triangle', volume: 0.1, slideTo: 70 });
      break;
    case 'whoosh':
      noise(ctx, t, 0.7, {
        frequency: 400,
        slideTo: 2400,
        q: 0.8,
        volume: 0.08,
        attack: 0.25,
      });
      break;
    case 'thump':
      tone(ctx, 90, t, 0.4, { volume: 0.22, slideTo: 40 });
      noise(ctx, t, 0.2, { type: 'lowpass', frequency: 220, volume: 0.12 });
      break;
    case 'flap':
      [0, 0.09, 0.18].forEach((d) =>
        noise(ctx, t + d, 0.07, { frequency: 1800, q: 0.7, volume: 0.05 }),
      );
      break;
    case 'boom':
      tone(ctx, 98, t, 0.5, { type: 'sawtooth', volume: 0.06, slideTo: 82 });
      tone(ctx, 147, t, 0.5, { type: 'triangle', volume: 0.05, slideTo: 123 });
      break;
    case 'ding':
      tone(ctx, 1318, t, 0.9, { type: 'triangle', volume: 0.07 });
      tone(ctx, 1976, t + 0.05, 0.9, { volume: 0.04 });
      break;
    case 'cluck':
      [0, 0.14, 0.26].forEach((d, i) =>
        tone(ctx, 700 + i * 120, t + d, 0.08, {
          type: 'square',
          volume: 0.03,
          slideTo: 500,
        }),
      );
      break;
    case 'yawn':
      tone(ctx, 220, t, 1.1, { type: 'sawtooth', volume: 0.035, slideTo: 140 });
      break;
    case 'snore':
      noise(ctx, t, 0.9, {
        type: 'lowpass',
        frequency: 260,
        volume: 0.07,
        attack: 0.4,
      });
      tone(ctx, 70, t, 0.9, { type: 'sawtooth', volume: 0.03 });
      break;
    case 'gasp':
      noise(ctx, t, 0.25, {
        frequency: 1400,
        slideTo: 2600,
        volume: 0.05,
        attack: 0.05,
      });
      break;
    case 'roar':
      tone(ctx, 130, t, 0.6, { type: 'sawtooth', volume: 0.07, slideTo: 98 });
      noise(ctx, t, 0.5, { type: 'lowpass', frequency: 600, volume: 0.05 });
      break;
    case 'creak':
      tone(ctx, 180, t, 0.8, { type: 'sawtooth', volume: 0.03, slideTo: 260 });
      break;
    case 'slide':
      tone(ctx, 1200, t, 0.6, { volume: 0.05, slideTo: 300 });
      break;
    case 'chop':
      noise(ctx, t, 0.09, { frequency: 1600, q: 2, volume: 0.12 });
      tone(ctx, 320, t, 0.12, { type: 'triangle', volume: 0.08, slideTo: 200 });
      break;
    case 'crash':
      noise(ctx, t, 1.3, {
        type: 'lowpass',
        frequency: 1800,
        slideTo: 200,
        volume: 0.16,
      });
      tone(ctx, 60, t, 0.9, { volume: 0.18, slideTo: 35 });
      break;
    case 'cheer':
      [523, 659, 784, 1046].forEach((f, i) =>
        tone(ctx, f, t + i * 0.08, 0.3, { type: 'triangle', volume: 0.06 }),
      );
      break;
    case 'rustle':
      noise(ctx, t, 0.3, {
        type: 'highpass',
        frequency: 3000,
        volume: 0.04,
        attack: 0.08,
      });
      break;
    case 'stone':
      tone(ctx, 140, t, 0.16, { type: 'triangle', volume: 0.12, slideTo: 90 });
      noise(ctx, t, 0.08, { type: 'lowpass', frequency: 900, volume: 0.06 });
      break;
    case 'brick':
      tone(ctx, 520, t, 0.07, { type: 'square', volume: 0.03 });
      tone(ctx, 260, t + 0.02, 0.12, { type: 'triangle', volume: 0.07 });
      break;
    case 'sniff':
      [0, 0.16].forEach((d) =>
        noise(ctx, t + d, 0.12, {
          frequency: 2500,
          q: 1.5,
          volume: 0.04,
          attack: 0.06,
        }),
      );
      break;
    case 'inhale':
      noise(ctx, t, 1.2, {
        frequency: 500,
        slideTo: 1600,
        q: 0.8,
        volume: 0.06,
        attack: 0.9,
      });
      break;
    case 'blow':
      noise(ctx, t, 1.4, {
        frequency: 1400,
        slideTo: 300,
        q: 0.6,
        volume: 0.14,
        attack: 0.08,
      });
      break;
    case 'patter':
      [0, 0.12, 0.24, 0.36, 0.48].forEach((d, i) =>
        tone(ctx, i % 2 ? 300 : 340, t + d, 0.05, {
          type: 'triangle',
          volume: 0.04,
        }),
      );
      break;
    case 'stomp':
      [0, 0.25, 0.5].forEach((d) =>
        tone(ctx, 120, t + d, 0.15, {
          type: 'triangle',
          volume: 0.1,
          slideTo: 70,
        }),
      );
      break;
    case 'idea':
      tone(ctx, 988, t, 0.15, { type: 'triangle', volume: 0.06 });
      tone(ctx, 1318, t + 0.12, 0.3, { type: 'triangle', volume: 0.06 });
      break;
    case 'bonk':
      tone(ctx, 660, t, 0.2, { type: 'square', volume: 0.04, slideTo: 330 });
      break;
    case 'clank':
      tone(ctx, 880, t, 0.3, { type: 'triangle', volume: 0.06 });
      tone(ctx, 1245, t, 0.25, { volume: 0.03 });
      break;
    case 'splash':
      noise(ctx, t, 0.8, {
        type: 'highpass',
        frequency: 1200,
        slideTo: 400,
        volume: 0.13,
        attack: 0.01,
      });
      [0.15, 0.3, 0.42].forEach((d, i) =>
        tone(ctx, 900 + i * 300, t + d, 0.08, { volume: 0.03, slideTo: 1600 }),
      );
      break;
    case 'pop':
      tone(ctx, 600, t, 0.08, { volume: 0.05, slideTo: 1200 });
      break;
    case 'retreat':
      [392, 370, 349, 311].forEach((f, i) =>
        tone(ctx, f, t + i * 0.28, i === 3 ? 0.7 : 0.25, {
          type: 'sawtooth',
          volume: 0.035,
        }),
      );
      break;
  }
}

export function playSfx(name: Sfx) {
  if (!enabled || masterVolume === 0) return;
  const now = performance.now();
  if (now - (lastPlayed.get(name) ?? -Infinity) < MIN_GAP_MS) return;
  lastPlayed.set(name, now);
  const ctx = audio();
  if (!ctx || ctx.state !== 'running') return;
  const t = ctx.currentTime + 0.01;
  if ((STORY_SFX as readonly string[]).includes(name)) {
    storySound(ctx, name as StorySfx, t);
    return;
  }
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
        tone(ctx, f, t + i * 0.1, i === 4 ? 0.9 : 0.25, {
          type: 'triangle',
          volume: 0.08,
        }),
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
      tone(ctx, 260, t + 0.45, 0.25, {
        type: 'triangle',
        volume: 0.08,
        slideTo: 520,
      });
      break;
    case 'path':
      tone(ctx, 587, t, 0.2, { type: 'triangle', volume: 0.09 });
      tone(ctx, 880, t + 0.12, 0.35, { type: 'triangle', volume: 0.09 });
      break;
    case 'finish':
      [523, 659, 784, 1046].forEach((f, i) =>
        tone(ctx, f, t + i * 0.13, i === 3 ? 0.8 : 0.25, {
          type: 'triangle',
          volume: 0.1,
        }),
      );
      break;
  }
}
