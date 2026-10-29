# StoryMotion — Art Direction

_Source of truth for how StoryMotion looks and moves. Tokens live in
`src/styles/tokens.css` (CSS) and `src/ui/tokens.ts` (TypeScript mirror for
animation code). Components live in `src/ui/`; every state is on show at
`/dev/ui-gallery` in dev builds._

## 1. Style in one sentence

**A soft, glowing picture book you can step into.** Everything feels
illustrated and touchable, with gentle depth: rounded, puffy shapes; light
coming from above; warm rim light on edges; soft contact shadows; distant
things hazy and blue. Nothing should look like a flat admin dashboard: no hairline
borders on white, no grey boxes, no sharp corners, no dense tables in
child-facing screens.

| Do | Don't |
| --- | --- |
| Chunky rounded shapes (radius ≥ 16px, pills for actions) | Square corners, 1px grey borders |
| Light from the top: gloss highlight on top, darker edge underneath | Flat single-colour fills |
| Depth through layers: glow behind, contact shadow below | Drop shadows that are grey or offset sideways |
| One clear focal point per screen, lit brighter than the rest | Many equal-weight boxes competing |
| Illustrations and emoji-scale icons for children | Text-only controls for children |

## 2. Colour

**Galaxy hub (app chrome: home, library, settings, dialogs).** A deep indigo
night (`--hub-void #070a24` → `--hub-deep #121046` → `--hub-indigo #241a6a`)
lit by nebula violet `#7b5cff`, pink `#ff6fcf` and cyan `#4fd6ff`, with
starlight `#fff6d8` and gold `#ffd36e` reserved for **the thing to press**.
Body text `#eef0ff`; muted text `#b9c0e8` (≥ 7:1 on the hub).

**Story worlds.** Each world has its own warm daylight palette, kept separate
from the hub so stepping into a story feels like stepping outside.

| World | Key colours | Mood |
| --- | --- | --- |
| Hare's forest race | sky `#8fd0f5`→`#fff0c4`, sun `#ffd25e`, far hills `#b5d8cf`, near hills `#8cc584`, trees `#4d9659`, track `#e4bb7c`, accent `#ff8c5a` | fresh morning → bright noon → golden finish |
| Jack's farm / sky / castle | field `#f2d596`, sky `#a6dbff`, cloud `#fffdf6`, vine `#3fae5c`/`#9be37a`, castle `#9a8fc0`, gold `#ffcf3f`, dusk `#3a2f6e` | cosy farm → airy, dizzy sky → hushed castle |
| Pigs' countryside | meadow `#b5df8a`, straw `#f1d27a`, wood `#c08a55`, brick `#d06b4f`, sky `#bfe5ff`, storm `#59648c`, blush `#ffa4b6` | sunny building site → blustery but never scary |

Candy buttons: **primary** = sunrise gold→orange (main action), **secondary**
= sky cyan→blue (alternatives), **magic** = lilac→pink (gesture/magic
actions), **ghost** = glass (back, minor actions). Text on candy is dark ink
`#24123a` (contrast ≥ 7:1 on gold and cyan).

## 3. Typography (self-hosted, works offline)

- **Display / headings / buttons: Fredoka** (variable, rounded, friendly) via
  `@fontsource-variable/fredoka`, weights 500–700.
- **Body and captions: Nunito** (variable, very readable) via
  `@fontsource-variable/nunito`, weights 400–800.
- Both are SIL OFL 1.1 and bundled by Vite into `dist/`, so the app needs no
  font CDN (Google Fonts links were removed from `index.html`).
- Scale: `--fs-display` clamp(2.5→4.5rem) for titles; `--fs-caption`
  clamp(1.25→1.75rem) for story captions (read from across the room); body
  1–1.125rem; never below 0.875rem.

## 4. Shape, depth and lighting

- Radii: `--radius-md 16px`, `--radius-lg 24px`, `--radius-xl 36px`, pills for
  buttons and badges.
- **Raised candy edge:** a darker band (`--edge-depth`, 4–8px) under every
  button; the face sits on it and sinks onto it when pressed.
- **Rim light:** `--rim-light` = 1px inner highlight on top + slight inner
  shade at the bottom. Characters get the same idea as a lighter stroke on the
  side facing the light.
- **Soft shadows:** `--shadow-soft`, `--shadow-float` (large, low-opacity,
  tinted toward the background, never pure grey); `--shadow-contact` (tight,
  dark ellipse under things touching the ground).
- **Glow:** `--glow-gold | cyan | violet` box-shadow halos. Glows are on a
  pseudo-element whose **opacity** animates.
- **Atmospheric haze:** distant layers are lighter, lower-contrast and bluer;
  cards fade their art into the body with a gradient haze.
- Panels come in three kinds: **glass** (near-opaque indigo gradient with rim
  light; app chrome), **glow** (glass + breathing aura; the one thing to look
  at), **scroll** (warm parchment with rolled ends; story text and grown-up
  reading).

## 5. Motion

Motion is **springy and bouncy, with anticipation and follow-through** — but
short, and never in the way of reading.

| Token | Value | Use |
| --- | --- | --- |
| `--duration-instant` | 90ms | press-down |
| `--duration-fast` | 150ms | hover colour |
| `--duration-base` | 260ms | fades, glows |
| `--duration-slow` | 480ms | progress, panels |
| `--duration-spring` | 620ms | release spring, pop-ins |
| `--duration-scene` | 900ms | scene transitions |
| `--ease-out` | cubic-bezier(0.16,1,0.3,1) | most things |
| `--ease-bounce` | cubic-bezier(0.34,1.56,0.64,1) | overshoot entrances |
| `--ease-anticipate` | cubic-bezier(0.36,0,0.66,-0.56) | pull back before a move |
| `--ease-spring` | `linear()` spring with wobble | release, toggles, cards |

Principles: squash on contact, stretch on speed; anticipation before big
moves (hop starts with a squat); follow-through (ears, tails, ribbons settle
after the body stops); curved paths, not straight lines; stagger groups by
~120ms.

**Performance rules.** Animate only `transform` and `opacity` (and SVG
`stroke-dashoffset` on small rings). No `filter: blur()`/SVG blur or glow
filters, and no `backdrop-filter` on new UI: use pre-rendered gradients and
box-shadows instead. Cap decorative particles (`MAX_BURST_PARTICLES = 8` per
burst). Pause off-screen loops.

**Reduced motion** (OS setting *or* the grown-up "Reduce motion" toggle, which
sets `data-reduced-motion` on `<html>`): every duration token becomes 0;
pop-ins become fades; no squash, tilt, hop, sparkle burst or breathing glow.
State is still communicated through colour, glow and position.

## 6. Components (src/ui)

`Button` (primary / secondary / magic / ghost; sm, md for grown-ups, lg = 64px
default for children, xl = 88px hero), `IconButton` (round / squircle,
optional caption), `ButtonLink`, `Panel`, `Dialog`, `Card` and `SelectCard`,
`Toggle`, `Slider`, `Select`, `ProgressBar`, `ProgressRing`, `Badge`,
`Medal`, `ToastProvider`/`useToast`. Every interactive control has a visible
gold/cyan focus ring (`--glow-focus`), a clear disabled look (desaturated,
already pressed down, not-allowed cursor), and plays the shared UI sound
through `data-sfx` (handled once in `hooks/useUiSounds`).

## 7. Accessibility floor

- Child-facing targets ≥ 64px; grown-up controls ≥ 44px.
- Text contrast ≥ 4.5:1 (captions ≥ 7:1, with a soft backdrop behind them over
  busy scenes).
- Nothing is conveyed by motion or colour alone; every gesture keeps a button.
- No raw camera video is ever shown; only illustrated companions and
  skeleton-style overlays.
