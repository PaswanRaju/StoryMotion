# Phase 1B: gesture recognition and local fixtures

## Implementation

`src/gestures/index.ts` is the pure entry point: pass state, the frame's 33
MediaPipe landmarks and timestamp, and receive a new state, an optional event,
and tracking information (`pending`, `progress` in [0, 1], `crouchAvailable`).
`vision/bodyGestures.ts` remains a compatibility export for existing callers.

`normalize.ts` centers each pose on the shoulders, corrects x for the frame's
aspect ratio, divides by shoulder width, and applies an exponential moving
average to those body-relative coordinates. Low-visibility/nonfinite points
are dropped immediately, never filled from an old pose. Only the latest EMA
and calibration measurements exist in worker memory; no history is retained by
normal playback. A timestamp gap clears partial holds rather than counting time
without observations.

Each detector in `detectors/` implements the same `GestureDetector` interface.
Its prepared frame contains landmarks, timestamp and the shared measurements
computed once by the coordinator. `step` returns lifecycle state, event, hold
progress and availability. Each gesture moves through idle → detecting →
triggered → cooldown. A held gesture fires once; it needs a visible neutral pose
and cooldown before firing again. Global arbitration preserves the existing
priority (wide arms, raised hand, crouch, leans) and prevents concurrent gestures.
The gesture ids and story input events have not changed.

Lean direction is reflected for the mirrored view. Hip-relative leaning is used
when possible, with shoulder tilt as a seated fallback. A previously hip-relative
lean cannot rearm just because the hips disappear. Crouch needs visible hips,
knees and ankles plus a standing baseline; a seated starting pose does not
silently calibrate as standing. The camera UI reports the button alternative
when crouch is unavailable and shows an accessible hold-progress ring.

The camera/model can warm up after an explicit click, but frame capture and pose
inference run only in active interaction windows (the recorder explicitly opens
a development test window). The controller caps inference at 18 fps with one
frame in flight; the worker also rejects disabled frames. No inference watchdog
expires while the model is intentionally idle. Pause/close resets pending holds.

### MediaPipe WASM loading in dev

`WASM_ROOT` (`src/vision/poseAssets.ts`) must stay an **absolute** URL. The
pinned SDK loads its runtime with `import(wasmLoaderPath)`, and the face/hand
models append `?instance=N` so each lazy task gets a fresh `ModuleFactory`. In
`npm run dev`, Vite rewrites that dynamic import in the prebundled dep with
`__vite__injectQuery(url, 'import')`, which adds `?import` to root-relative
paths. Vite then refuses `/wasm/...?import&instance=N` as a public-dir import
("This file is in /public ... should not be imported from source code").
`injectQuery` ignores URLs that don't start with `.` or `/`, so an absolute
`http(s)://…/wasm` root is requested unchanged and served by Vite's normal
public middleware (and by any static host in production). No custom Vite plugin
is needed.

## Record a local fixture

1. Run `npm run dev` and open `/dev/gesture-fixtures` on localhost.
2. Use **Start camera**, allow permission, and choose the gesture label (or
   `neutral` for a negative example). The preview shows a skeleton only.
3. Select **Start recording**. Relax for about one second for calibration, make
   one brief gesture, then relax again. Include standing before crouch; include
   returning to neutral when testing rearming/cooldown.
4. Select **Stop recording**, then **Download JSON**. **Clear samples** discards
   the in-memory sequence. Captures stop at one minute or 1,080 frames. Leaving
   or hiding the page stops the camera; unmounting discards samples.
5. Review the JSON locally. Add intentionally chosen examples under
   `src/tests/fixtures/` if you want to keep them, and pass the parsed JSON to
   `replayFixture()` from `src/gestures/fixtures.ts` in a Vitest test. Compare
   emitted events and approximate timestamps with the intended gesture label.

The JSON includes version, label, mirror setting and frames with relative
milliseconds, aspect ratio, and x/y/visibility landmarks. It contains no images,
video, audio or identifiers. This explicit development recorder is the only
landmark-history exception requested for Phase 1B: no upload, browser storage or
server endpoint exists. Normal story playback never requests fixture samples.
The route, recorder module and landmark-export branch are excluded from the
production build. Recorded fixtures are not checked in automatically.

## Tune recognition

Edit **`src/gestures/config.ts`**. Distances use shoulder widths, angles use
degrees, and times use milliseconds.

- `gestures.<ID>.holdMs` (300 by default): increase toward 400–500 to reject
  incidental motion; decrease only after testing short intentional movements.
- `gestures.<ID>.cooldownMs` and `timing.neutralMs`: control repeated input.
  Both neutral rearming and cooldown must complete.
- `visibility` (0.6): higher rejects uncertain points; lower helps partial views
  but can increase false triggers. Missing legs must keep crouch unavailable.
- `landmarkAlpha` (0.55): lower smooths more but adds response delay; higher
  responds faster but passes more jitter.
- `hand`, `spread`, `lean`, `crouch`: adjust one geometric threshold at a time.
  Keep neutral thresholds separated from trigger thresholds for hysteresis.
- `calibration`, `model`, and `inference`: readiness tolerances, MediaPipe
  confidence and the 18 fps cap. `legacyHand` preserves the retired hand-only
  helper's compatibility tests; runtime stories use the five detector settings.

Use fixtures from multiple distances, seated/full-body views and negative/noisy
sequences before changing defaults. Run `npm test`, `npm run typecheck`,
`npm run lint`, and `npm run build`. Synthetic tests cover all five gestures at
four body scales, jitter/noise, occlusion, mirrored direction, lifecycle phases,
progress, cooldown, recorder bounds and camera scheduling. Real webcam fixtures
still need to be captured and reviewed on the target devices.

## CI and manual verification

`.github/workflows/ci.yml` runs `npm ci`, typecheck, lint (zero warnings), tests
and a production build on every push and pull request using Node 24. It does
not request camera access, publish artifacts or deploy the app.

Manual checklist: play all three stories using webcam gestures, buttons, and no
input. Test hand raise, wide arms and both leans seated and at several distances;
check crouch in a full-body developer fixture and verify it is unavailable when
cropped. Pause/restart midway through a hold, hold a pose past triggering, relax
and repeat, deny permission, switch tabs, and confirm the raw camera is hidden.
Use `?debugPose=1` for skeleton/FPS diagnostics; inference should stop between
invitations. Record/download/clear fixtures and confirm the route is absent in
`npm run preview`.

References: [MediaPipe landmark semantics](https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker),
[GitHub Node CI guide](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs).

Phase 3 clap is an open-to-close temporal event: its hold time is zero so brief contact is not missed between hand-model frames. Other gestures retain their configured hold windows.
