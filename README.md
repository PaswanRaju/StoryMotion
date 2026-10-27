# StoryMotion

An animated children's story (ages ~5–10) that plays by itself and lets kids, now and
then, help the characters with one simple body movement detected by the webcam:
raise a hand, lean left or right, spread their arms, or duck. Every movement also
has a button, and nothing is ever required: if the child just watches, the story
plays to the end.

Built for HackTX 2026. The demo story is **The Tortoise and the Hare**.

## Run it

```sh
npm install
npm run dev        # open the printed localhost URL in Chrome
```

Story → **The Tortoise and the Hare** → pick a character → **Let's Go**. Click
**Start Camera** (optional), stand or sit 2–3 m back, and relax your arms for a second.
Two invitations appear during the story: _pick a trail_ (lean or raise a hand) and
_gust of leaves_ (spread your arms or duck). The ⤢ button opens cinema mode.

Developer skeleton overlay: add `?debugPose=1` to the player URL.

## Checks

```sh
npm run typecheck && npm run lint && npm test && npm run build
node scripts/browser-smoke.mjs http://127.0.0.1:5173   # with the dev server running
```

The smoke test drives Chrome headless and runs the real pose model on a public test
image. It does not use a physical webcam.

## Privacy

Camera frames are processed in a Web Worker on the device and discarded immediately.
Nothing is recorded, saved, or uploaded. There are no accounts and no personal data.

## How it works

- `src/engine/automaticStory.ts`: pure story timeline with optional interaction moments
- `src/rendering/forest/`: parallax SVG scene, character rigs, camera choreography,
  canvas particles
- `src/vision/`: camera controller, pose worker (MediaPipe Pose Landmarker), and the
  unit-tested one-shot gesture detector
- `src/audio/sfx.ts`: tiny original sound effects synthesized with Web Audio

More: `docs/HACKTX_SUBMISSION.md`, `docs/GESTURE_FEATURE.md`, `docs/GESTURE_QA.md`.

## Data engine and parent tools

Stories now live in `src/stories/` and play through the shared XState engine.
Run `npm run dev` for the app, local visual editor and `/dev/gesture-fixtures`.
Hold **Grown-up settings** for three seconds to access preferences and parent tools.
The generator requires `npx vercel dev` and server-only credentials. No paid API
requests are part of tests.

- [Engine plan](docs/ENGINE_PLAN.md)
- [Gesture fixtures and threshold tuning](docs/GESTURE_ENGINE.md)
- [Cinematic, Rive, accessibility, classroom and PWA contracts](docs/CINEMATIC_AND_PLATFORM.md)
- [Parent generation setup, safety and costs](docs/PARENT_GENERATION.md)
- [Implementation status and release dependencies](docs/IMPLEMENTATION_STATUS.md)

`npm run build` generates the offline service worker and precaches local runtime
assets/models. `npm run preview` serves the production client. An initial online
visit is required before offline use. `node scripts/browser-smoke.mjs
http://127.0.0.1:4173 --models` checks the production app in Chrome with a synthetic
camera image, including optional Face/Hand models and offline navigation.
