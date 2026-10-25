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
Two invitations appear during the story: *pick a trail* (lean or raise a hand) and
*gust of leaves* (spread your arms or duck). The ⤢ button opens cinema mode.

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
