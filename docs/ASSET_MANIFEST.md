# ASSET_MANIFEST

Tracks every art/audio asset: logical ID, canonical path, source, provenance,
license, and integration status. Updated whenever an asset is added or
replaced.

Status values: `MISSING` (placeholder in use), `REQUESTED` (asked human),
`SUPPLIED` (raw file received, not yet processed), `INTEGRATED` (converted,
in `public/assets/`, loading correctly in the app).

## Common

| Logical ID | Canonical path | Source | License/provenance | Status |
|---|---|---|---|---|
| hero | `public/assets/common/hero.webp` | — | — | MISSING (placeholder) |
| logo | `public/assets/common/logo.png` | — | — | MISSING (placeholder) |

## Story: hare (Tortoise and the Hare)

| Logical ID | Canonical path | Source | License/provenance | Status |
|---|---|---|---|---|
| bg.start | `public/assets/hare/backgrounds/start.webp` | — | — | MISSING |
| bg.trail | `public/assets/hare/backgrounds/trail.webp` | — | — | MISSING |
| bg.puddles | `public/assets/hare/backgrounds/puddles.webp` | — | — | MISSING |
| bg.bridge | `public/assets/hare/backgrounds/bridge.webp` | — | — | MISSING |
| bg.finish | `public/assets/hare/backgrounds/finish.webp` | — | — | MISSING |
| char.tortoise.idle | `public/assets/hare/characters/tortoise/idle.png` | — | — | MISSING |
| char.hare.idle | `public/assets/hare/characters/hare/idle.png` | — | — | MISSING |

## Story: beanstalk (Jack and the Beanstalk)

| Logical ID | Canonical path | Source | License/provenance | Status |
|---|---|---|---|---|
| bg.cottage | `public/assets/beanstalk/backgrounds/cottage.webp` | — | — | MISSING |
| bg.sprout | `public/assets/beanstalk/backgrounds/sprout.webp` | — | — | MISSING |
| bg.climb | `public/assets/beanstalk/backgrounds/climb.webp` | — | — | MISSING |
| bg.clouds | `public/assets/beanstalk/backgrounds/clouds.webp` | — | — | MISSING |
| bg.home | `public/assets/beanstalk/backgrounds/home.webp` | — | — | MISSING |
| char.jack.idle | `public/assets/beanstalk/characters/jack/idle.png` | — | — | MISSING |
| char.adventurer.idle | `public/assets/beanstalk/characters/adventurer/idle.png` | — | — | MISSING |

## Story: pigs (Three Little Pigs)

| Logical ID | Canonical path | Source | License/provenance | Status |
|---|---|---|---|---|
| bg.meadow | `public/assets/pigs/backgrounds/meadow.webp` | — | — | MISSING |
| bg.supplies | `public/assets/pigs/backgrounds/supplies.webp` | — | — | MISSING |
| bg.walls | `public/assets/pigs/backgrounds/walls.webp` | — | — | MISSING |
| bg.roof | `public/assets/pigs/backgrounds/roof.webp` | — | — | MISSING |
| bg.complete | `public/assets/pigs/backgrounds/complete.webp` | — | — | MISSING |
| char.pig-one.idle | `public/assets/pigs/characters/pig-one/idle.png` | — | — | MISSING |
| char.pig-two.idle | `public/assets/pigs/characters/pig-two/idle.png` | — | — | MISSING |
| char.pig-three.idle | `public/assets/pigs/characters/pig-three/idle.png` | — | — | MISSING |

## Pose model

| Logical ID | Canonical path | Source | License/provenance | Status |
|---|---|---|---|---|
| pose-landmarker | `public/models/pose_landmarker_lite.task` | MediaPipe official CDN (to be pinned in Phase 05) | Apache 2.0 (MediaPipe) — verify exact model card at integration time | MISSING |

## Audio

No audio files sourced yet. Per CLAUDE.md §10.6: narration uses browser
`speechSynthesis`; SFX will be either explicitly licensed (human-sourced,
with recorded license terms) or procedurally generated Web Audio (no file
dependency) — never an unverified web-search MP3.

## Notes

- Every entry above is currently `MISSING` because Phase 01 only scaffolds
  the app; no art has been requested or supplied yet. Section 10 prompts are
  ready to hand off (see `docs/HUMAN_HANDOFF.md` ART-01) when useful, but
  nothing blocks Phase 02 on this.
- Missing-asset fallback behavior (CSS/SVG placeholder, dev-console warning,
  never a crash) will be implemented as part of the asset loader in Phase 04.
