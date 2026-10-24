# BUILD_STATUS

Last updated: 2026-10-24 (Phase 02 complete)

## Current phase

**PHASE 02 — All navigable screens: DONE**

## What actually exists right now

### Phase 01 (scaffold) — unchanged, see git history for detail
Vite + React 19 + TS, pixi.js v8, @mediapipe/tasks-vision, zod,
react-router-dom, lucide-react; vitest/RTL/ESLint/prettier; design tokens;
typed router; ErrorBoundary; `.env.example`; full directory skeleton.

### Phase 02 additions

- **Session state** (`src/app/SessionContext.tsx`): in-memory-only `mode`
  ('solo'/'family'), `characterId`, `audioEnabled` — no persistence, no
  account, per CLAUDE.md §8.
- **Story data registry** (`src/data/stories/registry.ts`): all 3 stories
  (hare, beanstalk, pigs) with title, theme, teaser, moral, badge, and
  character rosters. CSS-gradient `coverBackground` placeholders stand in
  for real art.
- **Demo beat content** (`src/data/stories/demoBeats.ts`): one sample
  narration → choice → reaction → challenge sequence per story, explicitly
  marked as temporary Phase 02 demo content, NOT the authored Phase 06
  script.
- **Home** (`components/home/{HomePage,Hero,ModeSelect,HowItWorksModal}.tsx`):
  hero section, Solo/Family mode toggle (persists via session), "How It
  Works" accessible modal, audio on/off toggle, privacy note.
- **Story Library** (`components/library/{StoryLibraryPage,StoryGrid,
  StoryCard,StoryNotFound}.tsx`): all 3 stories always shown/unlocked,
  current-mode banner with a "Change" link back to Home. `StoryNotFound`
  is the shared fallback for any invalid `:storyId` route param.
- **Character Select** (`components/characters/{CharacterSelectPage,
  CharacterPicker,CharacterCard}.tsx`): per-story roster, family-mode
  "pick together" prompt, selection required before "Let's Go" enables.
- **Camera Setup** (`components/camera/{CameraSetupPage,CameraSetup,
  CameraPreview,PoseStatus}.tsx`): full interaction shell (idle → requesting
  → granted/denied/skipped) driven by a **simulated** timer, not a real
  `getUserMedia()` call — that's explicitly Phase 05. "Play without camera"
  always available; safety/privacy copy shown.
- **Story Player shell** (`components/player/{StoryPlayerPage,
  PlayerToolbar,NarrationPanel,DialoguePanel,ChoicePanel,ChallengePanel,
  PauseDialog}.tsx`): toolbar (mute/restart/pause), a demo narration→choice→
  reaction→challenge flow, manual "I did it!" rep counting (the permanent
  manual-mode path per CLAUDE.md §0 rule 6), and a Pause Dialog that freezes
  rep-counting and choice input while open.
- **Completion** (`components/completion/{CompletionPage,RewardBadge}.tsx`):
  moral line, badge, family-mode reflection prompt, "Play Again" /
  "Choose Another Story" CTAs.
- **Shared a11y infrastructure**: `components/layout/Modal.tsx` (focus trap,
  Escape-to-close, focus restore on close — used by both Pause Dialog and
  How-It-Works) and `components/layout/ProgressBar.tsx` (`role="progressbar"`
  with `aria-valuenow`/`aria-valuetext` + a visually-hidden live-region
  announcement).

## What does NOT exist yet (do not assume otherwise)

- No story engine / state machine / Zod schema (Phase 03) — the Player's
  narration→choice→challenge flow is local `useState` demo wiring, not the
  typed `StoryBeat` graph from CLAUDE.md §8.
- No PixiJS scene rendering (Phase 04) — all "scenes" are CSS gradient boxes
  with an emoji.
- No camera / MediaPipe pose detection (Phase 05) — Camera Setup is fully
  simulated.
- Only `hare`'s first challenge/choice has demo content; `beanstalk`/`pigs`
  use the same demo pattern but not their full authored 4-challenge arcs
  (Phase 06).
- No Meta AI integration (Phase 07), no deployment (Phase 09), no curated art
  (ART-01/02/03 still open, not blocking).
- No git commits for this phase yet until this report is reviewed (committing
  now).

## TESTS (actually run, this session)

| Command | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (0 errors, 0 warnings) |
| `npm run build` | PASS (339 KB JS / 107 KB gzip, 4.9 KB CSS) |
| `npm test` | PASS (14/14 across 8 test files) |

Test files added this phase: `ModeSelect`, `Modal` (focus trap/Escape/focus
restore), `ProgressBar` (ARIA values + live-region text, clamping),
`ChallengePanel` (manual rep button → Continue swap), `CharacterSelectPage`
(disabled-until-selected + not-found fallback), `StoryPlayerPage`
(narration→choice→challenge flow, pause freezes counting + focus restore),
`CompletionPage` (family reflection shown only in family mode).

**Not run:** a real visual browser click-through. The Claude-in-Chrome
extension was not connected in this session, so I could not personally watch
the app render. I confirmed the dev server serves every route with HTTP 200
and relied on the RTL test suite (real jsdom rendering + real click/keyboard
events) for interaction coverage. A human visual pass is still worth doing.

## MANUAL TEST (click-through — for the human to actually run)

1. `npm run dev`, open the printed local URL.
2. Home: toggle Solo/Family, open "How It Works" (check Escape closes it and
   focus returns to the button that opened it), toggle Sound On/Off, click
   "Start Adventure".
3. Story Library: see all 3 cards with the current mode banner; click any
   story's "Start This Story".
4. Character Select: "Let's Go" is disabled until you click a character card
   (in Family mode you'll also see a "pick together" banner); click a
   character, then "Let's Go".
5. Camera Setup: click "Allow Camera" → see a brief "Requesting…" then a
   placeholder preview; or click "Play without camera" instead. Either way,
   "Continue" becomes enabled.
6. Story Player: click through Continue → pick a choice → Continue → tap
   "I did it!" repeatedly until the progress bar fills → Continue. Try the
   pause (⏸) button mid-challenge: confirm the rep button is no longer
   reachable, "Resume" closes the dialog and refocuses the pause button.
7. Completion: see the moral, badge, and (Family mode only) the reflection
   prompt; try both "Play This Story Again" and "Choose Another Story".
8. Try an invalid URL like `/library/nope/characters` — should show the
   friendly "couldn't find that story" screen, not a crash.

## NEXT

**Phase 03 — Story schema, state engine, test fixtures.** Implement the real
`StoryBeat`/`Story`/`MovementEvent` types and Zod schema from CLAUDE.md §8,
the pure state-machine reducer, and replace the Phase 02 demo `useState`
flow in `StoryPlayerPage` with it. No blocker.
