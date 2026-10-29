/**
 * TypeScript mirror of the motion and palette tokens in src/styles/tokens.css
 * for code that animates from JS (Web Animations API, canvas, Pixi). Keep the
 * two files in sync; docs/ART_DIRECTION.md is the source of truth.
 */
export const duration = {
  instant: 90,
  fast: 150,
  base: 260,
  slow: 480,
  scene: 900,
  spring: 620,
} as const;

export const easing = {
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  anticipate: 'cubic-bezier(0.36, 0, 0.66, -0.56)',
} as const;

export const palette = {
  hub: {
    void: '#070a24',
    deep: '#121046',
    indigo: '#241a6a',
    violet: '#7b5cff',
    pink: '#ff6fcf',
    cyan: '#4fd6ff',
    starlight: '#fff6d8',
    gold: '#ffd36e',
  },
  hare: {
    skyTop: '#8fd0f5',
    skyLow: '#fff0c4',
    sun: '#ffd25e',
    hillFar: '#b5d8cf',
    hillNear: '#8cc584',
    tree: '#4d9659',
    track: '#e4bb7c',
    shade: '#2e5a3c',
    accent: '#ff8c5a',
  },
  beanstalk: {
    field: '#f2d596',
    sky: '#a6dbff',
    cloud: '#fffdf6',
    vine: '#3fae5c',
    vineLight: '#9be37a',
    castle: '#9a8fc0',
    gold: '#ffcf3f',
    night: '#3a2f6e',
  },
  pigs: {
    meadow: '#b5df8a',
    straw: '#f1d27a',
    wood: '#c08a55',
    brick: '#d06b4f',
    sky: '#bfe5ff',
    storm: '#59648c',
    blush: '#ffa4b6',
  },
} as const;

/** Upper bound for simultaneous decorative particles in any one burst. */
export const MAX_BURST_PARTICLES = 8;
