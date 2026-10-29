# Cinematic player, accessibility and platform features

## Player and parent controls

The normal library flow goes through `/library/:id/camera`, now a real, skippable
galaxy warm-up. It asks for hands, gives spoken/visual framing feedback and
practices hand raise, spread arms, both leans and crouch. Seated mode skips crouch.
Buttons and timeouts complete each mini game; **Skip warm-up** and **Continue with
buttons** go straight to the story. Direct bookmarked player URLs still play.

The camera is opt-in and raw video is explicitly hidden. A small glowing skeleton
buddy receives transient rendered pixels, never a camera preview. The hold ring
surrounds it while detecting. Invitations speak after the current plot narration,
show looping ghost demonstrations and fade a gentle glow instead of a visible
countdown. Success renders a particle burst in the same React update and schedules
a sound sting immediately; audio remains subject to browser unlock/mute settings.
Timeouts use the authored warm `onTimeout` response. Permission denial, unavailable
hardware, loading and errors all offer button mode.

Hold **Grown-up settings** continuously for three seconds (pointer, Space or Enter)
to adjust narration rate, sensitivity, seated mode, captions, reduced motion,
volume, camera, classroom/co-op and UI language. Early release/blur cancels the
gate. Preferences persist locally; they contain no images or landmarks. All
buttons work with Tab and Enter/Space. Dialogs trap/restore focus and support
Escape. CSS and JavaScript camera moves respect both OS reduced motion and the
parent setting.

Narration uses Web Speech boundaries for word highlighting. Voices that omit
boundaries use a timing estimate; exact highlighting cannot be guaranteed for
those voices. Set a line's `audioAsset` and register its local URL in
`narrationAudioRegistry` to use an authored recording. `wordTimings` provides exact
`atMs`/`charIndex` marks for recorded clips; without marks the highlight is estimated
from audio progress. Missing or blocked audio falls back to Web Speech. No stock
narration recordings were invented or added.

English/Spanish UI dictionaries live in `src/i18n/index.ts`; core player, camera,
settings and shelf controls use them. Narration supports per-language
`translations: { es: { text, audioAsset? } }` on each line. Missing translations
use the original story text. The editor can author Spanish narration. Built-in
story prose and some older menu/editor copy remain in their authored English;
this is localization support, not a claim that every existing story was translated.

## Character and Rive contract

`engine/Character.tsx` defines a renderer-neutral character with semantic states:
`idle`, `happy`, `scared`, `casting`, `reacting`. Registry adapters retain the
existing SVG rigs/pose names and accept these semantic states. The `jack-rive`
registry example uses Jack's SVG until an artist supplies a file. Use **Load Rive example** in the visual editor to preview `stories/riveExample.ts`, which drives all five semantic moods and the reaction trigger through the shared engine.

Set `riveAssets.jack` in `engine/characterAssets.ts` to a same-origin file under
`public/characters/`. The example expects:

| Rive item        | Type / values                                            |
| ---------------- | -------------------------------------------------------- |
| `StoryCharacter` | State machine name                                       |
| `mood`           | Number: idle 0, happy 1, scared 2, casting 3, reacting 4 |
| `personDetected` | Boolean; glance toward the viewer                        |
| `holdProgress`   | Number 0–1; build excited anticipation                   |
| `react`          | Trigger fired on entering `reacting`                     |

Rive's React canvas runtime is lazy-loaded, and its WASM is self-hosted. `predev`/`prebuild` copy the matching pinned runtime files from npm packages; generated `public/wasm` and `public/rive` files are ignored by Git. No `.riv`
file is included because the artist will create it. Generic characters receive
person/hold feedback; existing cinematic rigs have a subtle anticipation wrapper.

## Background and camera authoring

Scenes may define `layers: [{ assetId, speed, x?, y? }]`. Layers use registered SVG
backgrounds; different speeds create parallax. `cameraActions` has timed `pan`
(x/y), `zoom` (value), and `shake` (intensity) actions, each with `atMs` and
`durationMs`. `engine/camera.ts` interpolates them. Reduced motion returns a still
camera. Existing cinematic scenes keep their original choreography, clock maps,
poses and fades rather than being approximated by new tracks.

## Additional gestures and performance

All four use the shared pure detector lifecycle/config:

- `blow` / `BLOW`: Face Landmarker cheek puff or mouth pucker, never microphone input.
- `climb` / `CLIMB`: alternating arm raises, including seated play.
- `clap` / `CLAP`: hands first apart, then close; Hand Landmarker improves palm proximity. This transition triggers immediately rather than requiring a clap to be held.
- `runInPlace` / `RUN_IN_PLACE`: alternating knees; seated mode uses alternating arms.

Hare has a clap/cheer invitation just before waking, Jack has a climb invitation
at the clouds, and Pigs has a gentle puff while the first pig escapes. Buttons and
warm timeouts accompany every path; all original plot/moral text remains.

Pose inference runs only in active windows at up to 18 fps, with one frame in
flight. Face/Hand models instantiate only when the current interaction needs them;
additional inference is capped at 8 fps. Models are cached for offline use but
are not all instantiated together. Normally all detection runs in a Web Worker.
A browser lacking Worker/worker-canvas support uses the same processor on the main
thread with the same cap; this fallback cannot provide the worker's isolation.
Measure target-device performance before release, especially co-op plus face/hand
models. Synthetic tests do not establish mid-range laptop frame-rate equivalence.

Co-op requests up to two poses and maintains separate detector states. Player 1 is
the left person in the mirrored view, player 2 the right. Nodes can set `player: 1`
or `2`; other-player events are ignored. Use button alternatives if a child leaves
view. No identity, body history or landmarks are saved.

## Library, classroom, creator and offline

My Stories appears on the home screen and library, with saved stories, one sticker
per completed story and a warm recap of actual help. There are no leaderboards or
scores. IndexedDB holds stories and completion recaps locally.

Classroom mode makes the stage/prompts larger and exposes teacher pause, next
scene, replay scene and camera controls. Skipping settles pending invitations
kindly; replay resets the scene's invitations. The visual editor at
`/parent/editor` is behind a parent gate and provides scene/narration/interaction
editing, player assignment, translated narration, inline validation, live preview,
local save and JSON import/export. Imported text is never sent to the generator.

The PWA manifest and generated service worker support installation and offline
built-in/saved stories. `npm run build` precaches all built assets, pinned local
MediaPipe models/WASM, the Rive runtime and any authored audio in `public/`.
The initial cache is about 60 MB, including optional model weights. API calls and
development recorder URLs are never cached. Installation/cache readiness requires
an initial online visit; browser storage quotas or site-data clearing can remove
cached assets. Generation itself needs a network connection.

## Manual release checklist

1. Play every story fully with no camera/input, keyboard-only buttons, and each
   webcam gesture. Check all original scenes/narration/endings and the new moments.
2. Warm up standing and seated; check framing feedback, skip, denial, unavailable
   camera, slow loading and failure. Confirm raw video never appears.
3. Check shadow buddy, hold progress, ghost prompts, immediate particles/sting,
   warm timeout resolutions, paused holds and replay. Test sensitivity at several
   camera distances. Capture adult-only local fixtures where useful.
4. Exercise blow, clap, climb and run with full body, seated alternatives and
   cropped landmarks. Test two people on their mirrored sides and assigned nodes.
5. Test narration speed/volume/mute, recorded-audio failure, real speech boundaries,
   captions, both languages and reduced motion (OS and parent override).
6. Verify three-second parent gates with mouse/touch/keyboard, focus rings, Tab,
   Escape and focus restoration. Check large projector layout and teacher controls.
7. Generate/preview/save with a configured server key; test quota/error behavior,
   reading-age regeneration, optional quiz hands/buttons/no-input and shelf recaps.
8. Edit/import/export/reopen stories, confirm inline errors block invalid previews.
9. Install from a production build, wait for caching, disconnect networking,
   reopen all built-ins and camera models. Test saved stories offline and a new
   service worker update. Verify no frame/landmark/audio/personal-data requests.
