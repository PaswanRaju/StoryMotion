# ASSET_MANIFEST

Tracks every art/audio asset: logical ID, canonical path, source, provenance,
license, and integration status. Updated whenever an asset is added or
replaced.

Status values: `MISSING` (placeholder in use), `REQUESTED` (asked human),
`SUPPLIED` (raw file received, not yet processed), `INTEGRATED` (converted,
in `public/assets/`, loading correctly in the app).

## Common

| Logical ID | Canonical path                   | Source | License/provenance | Status                |
| ---------- | -------------------------------- | ------ | ------------------ | --------------------- |
| hero       | `public/assets/common/hero.webp` | —      | —                  | MISSING (placeholder) |
| logo       | `public/assets/common/logo.png`  | —      | —                  | MISSING (placeholder) |

## Story: hare (Tortoise and the Hare)

| Logical ID         | Canonical path                                    | Source | License/provenance | Status  |
| ------------------ | ------------------------------------------------- | ------ | ------------------ | ------- |
| bg.start           | `public/assets/hare/backgrounds/start.webp`       | —      | —                  | MISSING |
| bg.trail           | `public/assets/hare/backgrounds/trail.webp`       | —      | —                  | MISSING |
| bg.puddles         | `public/assets/hare/backgrounds/puddles.webp`     | —      | —                  | MISSING |
| bg.bridge          | `public/assets/hare/backgrounds/bridge.webp`      | —      | —                  | MISSING |
| bg.finish          | `public/assets/hare/backgrounds/finish.webp`      | —      | —                  | MISSING |
| char.tortoise.idle | `public/assets/hare/characters/tortoise/idle.png` | —      | —                  | MISSING |
| char.hare.idle     | `public/assets/hare/characters/hare/idle.png`     | —      | —                  | MISSING |

## Story: beanstalk (Jack and the Beanstalk)

| Logical ID           | Canonical path                                           | Source | License/provenance | Status  |
| -------------------- | -------------------------------------------------------- | ------ | ------------------ | ------- |
| bg.cottage           | `public/assets/beanstalk/backgrounds/cottage.webp`       | —      | —                  | MISSING |
| bg.sprout            | `public/assets/beanstalk/backgrounds/sprout.webp`        | —      | —                  | MISSING |
| bg.climb             | `public/assets/beanstalk/backgrounds/climb.webp`         | —      | —                  | MISSING |
| bg.clouds            | `public/assets/beanstalk/backgrounds/clouds.webp`        | —      | —                  | MISSING |
| bg.home              | `public/assets/beanstalk/backgrounds/home.webp`          | —      | —                  | MISSING |
| char.jack.idle       | `public/assets/beanstalk/characters/jack/idle.png`       | —      | —                  | MISSING |
| char.adventurer.idle | `public/assets/beanstalk/characters/adventurer/idle.png` | —      | —                  | MISSING |

## Story: pigs (Three Little Pigs)

| Logical ID          | Canonical path                                     | Source | License/provenance | Status  |
| ------------------- | -------------------------------------------------- | ------ | ------------------ | ------- |
| bg.meadow           | `public/assets/pigs/backgrounds/meadow.webp`       | —      | —                  | MISSING |
| bg.supplies         | `public/assets/pigs/backgrounds/supplies.webp`     | —      | —                  | MISSING |
| bg.walls            | `public/assets/pigs/backgrounds/walls.webp`        | —      | —                  | MISSING |
| bg.roof             | `public/assets/pigs/backgrounds/roof.webp`         | —      | —                  | MISSING |
| bg.complete         | `public/assets/pigs/backgrounds/complete.webp`     | —      | —                  | MISSING |
| char.pig-one.idle   | `public/assets/pigs/characters/pig-one/idle.png`   | —      | —                  | MISSING |
| char.pig-two.idle   | `public/assets/pigs/characters/pig-two/idle.png`   | —      | —                  | MISSING |
| char.pig-three.idle | `public/assets/pigs/characters/pig-three/idle.png` | —      | —                  | MISSING |

## Pose model

| Logical ID      | Canonical path                            | Source                                            | License/provenance                                                   | Status  |
| --------------- | ----------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------- | ------- |
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

## Automatic-story integration update (2026-10-24)

No story video, background, character, or audio files were found in `public/assets`
or `incoming_assets` during the audit. The current player uses original inline SVG
art/animation in `src/rendering/AnimatedStoryScene.tsx` and browser speech synthesis;
it does not request the missing paths listed above. These remain replaceable by the
teammate's future assets without blocking the demo.

The pose model is now loaded remotely from Google's Pose Landmarker Lite float16
revision 1 bundle, with the installed tasks-vision 1.1.1 ES-module WASM runtime.
Exact pinned URLs are in `src/vision/poseAssets.ts`. All three requests returned HTTP
200 and real inference returned 33 landmarks in production-browser validation. No
model file was added to `public/models`. See `GESTURE_QA.md` for the public test image
used exclusively by the browser smoke script; it is not shipped as a story asset.

### Self-hosted pose model (Claude Code session, 2026-10-24) — supersedes "no model file"

| Field    | Value                                                                                                                                                                                                           |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| File     | `public/models/pose_landmarker_lite.task` (5,777,746 bytes)                                                                                                                                                     |
| Source   | `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task` (official MediaPipe model; same URL kept as runtime fallback)                        |
| SHA-256  | `59929e1d1ee95287735ddd833b19cf4ac46d29bc7afddbbf6753c459690d574a`                                                                                                                                              |
| Contents | `pose_detector.tflite`, `pose_landmarks_detector.tflite`                                                                                                                                                        |
| License  | Apache 2.0 per the MediaPipe Pose Landmarker model card — verify on the official model card before final submission                                                                                             |
| Why      | During this session, Google storage downloads ran at <1.3 MB per 40 s, tripping the 30 s camera-loading watchdog. Same-origin loading removed that dependency. WASM still loads from jsdelivr (measured 3–7 s). |

### Story art and sound provenance (2026-10-24)

| Asset                                                                                                    | Source                                                                            | Notes                                        |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------- |
| Forest scene layers, Tortoise, Hare, crowd, shield (`src/rendering/forest/layers.tsx`, `characters.tsx`) | Original SVG written in code for this project (Claude Code, under team direction) | No image files, no stock/AI-generated images |
| Particles (sparkles, leaves, confetti, dust)                                                             | Original canvas drawing (`particles.ts`)                                          | —                                            |
| Sound effects                                                                                            | Synthesized live with Web Audio (`src/audio/sfx.ts`)                              | No audio files, so no licenses needed        |
| Narration                                                                                                | Browser `speechSynthesis` voices                                                  | Captions are always shown                    |

Still missing (optional): curated illustrated art for the Beanstalk and Pigs stories,
and recorded narration. The demo does not depend on either.

## Local vision models and generated runtimes

The pinned Pose model remains unchanged. Phase 3 adds these official MediaPipe
models for local inference and offline caching (never camera uploads):

- `public/models/face_landmarker.task`: https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task
  SHA-256: `64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff`.
- `public/models/hand_landmarker.task`: https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task
  SHA-256: `fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1`.

`npm run assets:sync` copies matching MediaPipe and Rive WASM runtimes from the
pinned npm packages into ignored `public/wasm` and `public/rive` directories.
It runs automatically before dev/build. Rive character artwork is not included;
see CINEMATIC_AND_PLATFORM.md for the artist-supplied file contract.
