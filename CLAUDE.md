# StoryMotion — Claude Code Build Instructions

> **Project:** StoryMotion, HackTX 2026  
> **Repository location:** put **this file at the repository root** as `CLAUDE.md` (uppercase). Claude Code automatically reads it when launched in that directory.  
> **Mission:** Use Claude Code to implement as much of this web app as possible; involve the human teammate only for decisions, API access, asset review/supply, physical camera tests, and deployment/account approvals.  
> **Priority:** a complete, working, delightful demonstration beats ambitious but unfinished technology.  
> **Effective date:** October 24, 2026. Verify third-party APIs, pricing, and event rules before relying on them.

---

## 0. EXECUTION CONTRACT — READ THIS FIRST

You are the **lead full-stack developer, game engineer, test engineer, and technical project manager**. Build the project in dependency order, writing actual source files and tests, not just giving suggestions. The team wants Claude to do nearly all coding.

### Rules that cannot be compromised

1. **Do the next concrete task, not the whole project in one untested pass.** Deliver a working vertical slice first. Track the active phase in `docs/BUILD_STATUS.md` and keep it current.
2. **Do not start writing hackathon submission code before the allowed hacking period.** The supplied HackTX opening deck states that all code must be written during the hacking period. If the event has not officially begun, prepare/check plans and ask organizers which pre-event assets are permitted; don't create submission code prematurely. Follow any newer official rules if different.
3. **Never invent API access, packages, tests, screenshots, or results.** Inspect actual docs and runtime errors. Only describe a test as passing when you ran it.
4. **No private data or keys in frontend code.** `MODEL_API_KEY` belongs only in local server environment/deployment secrets. Never put it in a `VITE_` variable, source file, logs, screenshots, or Git history.
5. **Camera and pose inference stay local.** Never transmit, record, persist, or send child video, images, or body landmarks to Meta or any backend. Do not collect names, accounts, birthdays, or personal details.
6. **Always keep a fully functional manual/simulated movement mode**, both for accessible play and as a judging fallback. It must use the identical story engine and animations as live movement.
7. **Static controls are REAL UI, not generated screenshots.** Use React for buttons, text, subtitles, dialogs, progress, layout; Muse Image for story backgrounds/characters/props, not for a flattened image of the whole application.
8. **Preserve family connection as a functional experience.** Family Mode is parent + child co-play on the same device: shared choices, encouragement, and a reflection at the end. Not a multi-user account system.
9. **Do not overclaim health/learning outcomes.** Say "designed to encourage movement and shared storytelling," not "clinically improves fitness/bonding."
10. **Do not block development on optional art or AI.** Use attractive programmatically generated vector/CSS placeholder art and prewritten dialogue. Request resources at the relevant handoff and keep moving where possible.
11. **Do not make uncontrolled infrastructure changes.** Ask before installing a high-impact dependency, using paid APIs, changing repository permissions, deploying publicly, or modifying payment/billing settings. Never delete user files or overwrite user-supplied art.
12. **Produce functional code rather than endless plans.** After reading this file, inspect the repository, identify the next incomplete phase, implement it, test it, and report what you actually changed.

### What a good Claude response looks like after each phase

Report succinctly:

```text
PHASE: <number and name>
DONE: <working behaviors, files changed>
TESTS: <exact commands + PASS/FAIL/NOT RUN>
MANUAL TEST: <short click-through procedure>
HUMAN ACTION REQUIRED: <only if necessary; asset/API/test/deploy instructions>
NEXT: <single next phase and any blocker>
```

If user action is required, give **specific** requirements (file path, format, image dimensions, prompt, URL, account steps, and fallback), not a vague "provide assets" request.

---

## 1. PRODUCT — WHAT WE ARE BUILDING AND WHY

**Elevator pitch:** StoryMotion is an interactive 2D storybook for children roughly ages 5–10. Children choose a familiar story and character, hear and see an animated narrative, then perform real-world movements detected by their webcam. Every completed jump, squat, reach, march, or balance action advances the character or transforms the story world. Parents can share story decisions and encourage the child through Family Adventure Mode.

**Why:** Make storytelling more participatory and physically playful; encourage shared imaginative time between children and caregivers. AI enriches art and dialogue **without replacing the human connection**.

**HackTX target:** Three playable stories, four movement challenges each (**12 challenges**), visually distinct story worlds, narrated scenes, choices, responsive animation, local pose detection, completion/reward, and a compelling 90-second judge demo.

**Primary judging narratives:** "Most Entertaining", "Best Pitch", and conditional Meta sponsor track "Bringing People Closer Together with AI". Meta eligibility requires actual appropriate Meta AI model usage and visible parent-child co-play. Do not claim eligibility or official judging outcomes without verifying rules.

**Fundamental game loop:**

```text
Home → Solo/Family Mode → Story Library → Character Select → Camera Setup
→ narrated scene → optional character dialogue + shared choice
→ movement instruction → count real-world exercise → instantaneous character reaction
→ scene consequence → next scene → ending + badge → play another
```

This is **not** Mario-style free-controlled platforming, a fitness tracker, an Episode-style dialogue-only app, or live AI video generation. It is a **living storybook with scripted movement-driven actions**.

---

## 2. DEFINED SCOPE AND ACCEPTANCE

### P0 — Must ship

- Home, Story Library, Character Select, Camera Setup, Story Player, and Story Complete screens.
- Three stories with four defined challenges per story; each can be finished without dead ends.
- Narration text/subtitles, replay speech, next/continue, pause/resume, restart and exit.
- Two choices in at least one narrative beat per story; choice changes a line/visual response and then reconverges.
- Four reusable movement types at minimum: **squat, overhead reach, march, jump**; balance may be real or have timer/manual fallback if unreliable.
- Movement instantly updates progress and character animation; finishing a target triggers a larger consequence animation and next beat.
- Story/player state machine that behaves the same for camera and manual control.
- Camera onboarding with permission, full-body framing feedback, and "Play without camera".
- Scene art for all three worlds. Placeholders permitted early; polished curated art required on hero judging path.
- One same-device **Family Adventure** flow: parent and child choose together, parent gets a visible decision, child handles movements, shared celebration.
- Working deployed HTTPS URL and clear README/demo path. No account required.

### P1 — Strong enhancements once P0 works

- Meta Muse Spark short, safe, context-aware dialogue via server-side proxy + prewritten fallback.
- Meta Muse Image used to create and curate in-game backgrounds/characters; track provenance.
- Five exercise detectors calibrated; rich sprite reactions, parallax, sound effects, animated badges.
- Responsive tablet presentation, adjustable difficulty, polished character choice variants.

### P2 — Do NOT build at HackTX unless everything is finished

- New-story generation on demand, user accounts, cloud saves, leaderboards, full multiplayer networking, an analytics dashboard, voice recording, paid subscriptions, endless levels, complicated branching endings, advanced sprite skeletal rigs, server-stored child data.

### Definition of done

Open production URL in a fresh browser; choose Family, a story, and a character; allow or skip camera; watch/hear narrative; select a parent-assisted choice; demonstrate at least one real webcam action and see immediate reaction; finish 4 challenges (manual fallback works); finish story; replay another. Repeat this for all three stories. Test AI-offline fallback and revoked camera permissions.

---

## 3. STACK AND OFFICIAL SOURCES

Build one TypeScript monorepo with a frontend and only a tiny optional serverless handler.

| Need | Tool | Notes / source |
|---|---|---|
| App | React + Vite + TypeScript | https://vite.dev/guide/ |
| Story/world renderer | PixiJS v8 | https://pixijs.com/8.x/guides ; mount Pixi imperatively in React if bindings add friction |
| Body landmarks | `@mediapipe/tasks-vision` Pose Landmarker Web | https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js |
| Story validation | Zod | Schema and cross-reference checks; pure modules tested with Vitest |
| Testing | Vitest + React Testing Library | Add Playwright smoke testing only if quick and environment supports it |
| Narration | Web Speech API `speechSynthesis` | https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis ; captions always visible |
| Meta dialogue | Meta Model API / Muse Spark | https://dev.meta.ai/docs/overview ; https://dev.meta.ai/docs/models |
| Meta art | Muse Image | Generate offline/precompute art; check account/model quota and event asset rules |
| Server secret | Vercel Function or equivalent serverless API | Secret `MODEL_API_KEY`; no key in bundle |
| Deploy | Vercel HTTPS (or equivalent) | Camera normally requires HTTPS or localhost |
| Fonts | Fredoka + Nunito via Google Fonts | https://fonts.google.com ; use fallbacks |
| Sounds | Original sounds or appropriately licensed libraries | Check and log each sound's license; avoid unverified reuse |
| Collaboration | Git/GitHub, Claude Code | https://code.claude.com/docs ; repo-root `CLAUDE.md` |

**Meta clarification:** At time of planning, Muse Spark is a text model, Muse Image generates/edits images, and **Muse Voice Transcribe is speech-to-text, NOT narration/TTS**. Prefer browser TTS for the demo. Verify current model names and endpoints against official docs. Candidate Spark model ID: `muse-spark-1.3`; candidate Image ID: `muse-image-1.0`; never assume access without a successful test request. Meta API access, pricing, available locations, and quotas may change.

**MediaPipe caution:** `detectForVideo()` is synchronous on Web and can block the UI thread. Throttle processing (starting target 10–15 inferences/sec), reuse landmark buffers, clean up; move inference to a worker only if supported and needed. Render Pixi at a reasonable independent rate. Test on the actual laptop.

---

## 4. TEAM / HUMAN HANDOFF PROTOCOL

The human teammate is busy. **Maximize Claude-written code and minimize unnecessary human work.** Whenever an external resource is needed:

1. First inspect if the resource already exists in `public/assets`, `docs`, `.env` or a connected service. Never ask to upload something present.
2. If missing, add an entry to `docs/HUMAN_HANDOFF.md` with a unique ID and status `REQUESTED`, `SUPPLIED`, `VERIFIED`, or `SKIPPED`.
3. Ask the human with this exact structure:

```text
🧑 HUMAN ACTION REQUIRED — [ASSET-01 / META-01 / CAMERA-01 / DEPLOY-01]
WHY: <why it matters and whether critical>
ACTION: <numbered concrete steps>
SOURCE/URL: <official website or verified license-bearing asset source>
GENERATE WITH PROMPT: <complete copy-paste prompt, if artwork>
SAVE AS: <exact repository-relative file path>
SPEC: <size, aspect, alpha, format, composition, art constraints>
SEND/REPORT BACK: <which file, screenshot, status, or error to give Claude>
CAN CLAUDE CONTINUE?: <YES using placeholder/fallback, or NO and why>
```

4. Continue building independent code while waiting for noncritical input; leave a clean placeholder. Do **not** falsely claim the actual art/API has been integrated.
5. When the human provides assets, inspect names, dimensions, transparency, margins, art consistency, and legal use; report mismatches and offer conversion/cropping scripts. Do not silently replace the approved originals.
6. Ask the human to approve only true irreversible / paid / external actions (secret provisioning, billing, public deployment, irreversible code or art replacement).
7. For each phase, show **what to test by clicking**, because the human will test real physical movements and visual feel.

### Only these require a hard pause

- Before paying, changing API billing, entering secrets on someone else's service, or publicly deploying to an unapproved project/account.
- Before using any nonfree/unclearly licensed third-party art in the final submission.
- If the event rules prohibit an anticipated process and no compliant alternative is available.
- If the developer explicitly asks you to stop.

Art approval is a soft gate: keep implementing with placeholders until assets arrive. A denied camera or unavailable Meta account must **never** halt P0.

---

## 5. REPOSITORY LAYOUT — CREATE / MAINTAIN

Use this structure (adjust only when a concrete technical reason requires it):

```text
storymotion/
├─ CLAUDE.md                      # this file; project instructions
├─ README.md
├─ package.json
├─ vite.config.ts
├─ tsconfig.json
├─ .env.example                   # keys listed, NO real values
├─ .gitignore
├─ api/
│  └─ meta-dialogue.ts            # serverless HTTP entrypoint (optional P1)
├─ public/
│  ├─ assets/
│  │  ├─ common/{logo,ui,fx,audio}/
│  │  ├─ hare/{backgrounds,characters,props,audio}/
│  │  ├─ beanstalk/{backgrounds,characters,props,audio}/
│  │  └─ pigs/{backgrounds,characters,props,audio}/
│  └─ models/
│     └─ pose_landmarker_lite.task   # or document official CDN/model location
├─ src/
│  ├─ app/{App.tsx,router.tsx}
│  ├─ components/
│  │  ├─ layout/{AppShell,Header,PrimaryButton}.tsx
│  │  ├─ home/{Hero,ModeSelect}.tsx
│  │  ├─ library/{StoryCard,StoryGrid}.tsx
│  │  ├─ characters/{CharacterCard,CharacterPicker}.tsx
│  │  ├─ camera/{CameraSetup,CameraPreview,PoseStatus}.tsx
│  │  ├─ player/{StoryPlayer,NarrationPanel,DialoguePanel,ChoicePanel,ChallengePanel,PlayerToolbar,PauseDialog}.tsx
│  │  └─ completion/{CompletionScreen,RewardBadge}.tsx
│  ├─ data/{stories,characters,assets}/
│  ├─ engine/{types,schema,validateStory,storyMachine,storySelector}.ts
│  ├─ rendering/{SceneCanvas,SceneRenderer,assetLoader,animations}.ts(x)
│  ├─ vision/{camera,poseLandmarker,normalizer,movementDetector,detectors,calibration}.ts
│  ├─ audio/{narrator,sfx}.ts
│  ├─ ai/{metaDialogueClient,fallbackDialogue}.ts
│  ├─ hooks/{useStoryEngine,usePoseTracking,useSpeech}.ts
│  ├─ styles/{tokens,global,components}.css
│  ├─ tests/
│  └─ main.tsx
├─ scripts/{check-assets,convert-assets,validate-stories}.*
└─ docs/
   ├─ PRODUCT_SPEC.docx          # if human copied earlier document
   ├─ BUILD_PLAN.docx            # if human copied earlier document
   ├─ BUILD_STATUS.md            # CLAUDE creates/updates
   ├─ HUMAN_HANDOFF.md           # CLAUDE creates/updates
   ├─ ASSET_MANIFEST.md          # CLAUDE creates/updates
   ├─ ART_BIBLE.md               # CLAUDE creates
   ├─ API_STATUS.md              # CLAUDE creates
   ├─ QA.md                      # CLAUDE creates
   └─ DEMO.md                    # CLAUDE creates
```

**Documentation source of truth:** Prior product spec and step-by-step build plan, if present, are background. This `CLAUDE.md` governs execution and handoffs. If a document conflicts with explicit human instructions in chat, follow the newest human instruction, document the decision, and preserve story scope.

**Asset resolution:** use logical asset IDs mapped to paths, not hard-coded URLs sprinkled through UI components. Missing asset → polished placeholder + warning visible in development console, never a runtime crash.

---

## 6. DESIGN SYSTEM AND SHARED UX REQUIREMENTS

**Look:** magical, playful, calming 2D illustrated picture book. Soft, warm and slightly textured art. This is *not* an arcade platformer, a photorealistic game, a horror story, or an Episode clone.

**Global palette:** cream `#F7F1DF`, sage `#A9D7A0`, honey `#F5BF72`, sky `#93C8E8`, cocoa text `#624A3A`. Add darker accessible text/interactive colors as necessary to pass contrast checks.

**Typography:** Fredoka headings and Nunito content, with system fallbacks; never draw UI copy inside story images.

**Dimensions:** laptop judging viewport 1280×800 first; story canvas 16:9; tablet responsive second; mobile optional but no broken horizontal overflow.

**Principles:** big round touch-friendly controls (target ≥44px), simple words, friendly tone, always-on readable subtitles, explicit progress, restrained motion, clearly visible active character, no misleading disabled states, input-independent game engine.

**Screens and elements to implement (all are real interactive UI):**

1. **Home** — logo/wordmark; inviting hero artwork; "Start Adventure" CTA; Solo Adventure / Family Adventure options; "How It Works" 3-step modal; audio toggle; quick privacy note.
2. **Story Library** — 3 visual cards, story title, theme, 1-sentence teaser, start button; completed badge optional; no locked content.
3. **Character Select** — story-specific candidates; character art; one-line persona; clickable selection state; Back and "Let's Go".
4. **Camera Setup** — camera usage explanation; browser permission request; video preview; silhouette/full-body framing guide; tracking/model statuses; "Try a movement" indicator; "Play without camera" and Retry; safety clearance reminder.
5. **Story Player shell** — Pixi Canvas (main 16:9), top title/chapter + pause/restart/mute; 2-line subtitle/narration panel, speaker label, replay; choice buttons when needed; challenge instruction + progress + encouraging feedback; small optional live camera inset with turn-off control. Camera thumbnail must not block key scene; no video recording.
6. **Pause Dialog** — resume, replay instruction, restart chapter/story, exit to library. A paused game must not count movements or continue narration behind the modal.
7. **Ending / Reward** — character celebration, one-sentence moral, named badge, family reflection for Family Mode, replay and another story CTA.
8. **Global error/empty states** — no camera, model loading, body out of frame, narration unavailable, AI timeout, art missing, mobile unsupported; must offer an action.

**Motion-to-feedback:** each valid repetition → counter increments and sprite clearly reacts within moments; finishing the target → celebratory mini-animation and story progression, never silently auto-skip.

**Narrative pacing:** brief spoken narration (typically 15–30 sec), interactive beats, ~3–6 minute complete story depending on child. Manual "Continue" and "Replay" present regardless of speech support.

---

## 7. THREE CANONICAL STORIES — BUILD EXACTLY THESE FIRST

Content is *prewritten and reviewed*; AI may create brief within-scene variations, not alter morals or invent physical tasks. Aim for five narrative scenes each, four challenges each, one optional choice each, and an ending.

### Story A — `hare`: The Tortoise and the Hare

- **Selectable:** Tortoise (`tortoise`) or Hare (`hare`); same safe exercise requirements, viewpoint-specific dialogue/animation.
- **World:** horizontally progressing woodland race, forest parallax, puddles, narrow bridge, finish line.
- **Theme:** patience, perseverance, overconfidence. Preserve classic tortoise-wins lesson even if kid chooses hare; Hare can learn graciously.
- **Opening:** hare brags; tortoise invites friendly race; the player chooses a character.
- **Challenges in order:**
  1. `hare-start`: **march in place, 12 steps** → selected character begins racing.
  2. `hare-puddles`: **jump, 6 repetitions** → selected character crosses puddles.
  3. `hare-bridge`: **balance, 6 seconds** → bridge crossing. If balance detector unstable use alternate/manual timer.
  4. `hare-finale`: **squat, 5 repetitions** → final effort; play finish-line scene and classic moral.
- **Choice:** take safe forest path / ask an animal for guidance; changes narrator response and character expression, reconverges.
- **Narrative arc:** bragging + challenge → race begins → muddy obstacles → hare sleeps and tortoise perseveres → finish and lesson.
- **Background IDs:** `start`, `trail`, `puddles`, `bridge`, `finish`.

### Story B — `beanstalk`: Jack and the Beanstalk

- **Selectable:** Jack (`jack`) or young adventurer (`adventurer`). If art for both unavailable, visually keep Jack as MVP and retain distinct choice copy only if not deceptive.
- **World:** tall magic beanstalk / upward scene transition / floating cloud bridge / cozy home.
- **Theme:** curiosity, courage, thoughtful decisions. Tell an age-appropriate, not-scary version.
- **Challenges:**
  1. `bean-plant`: **squat, 5 reps** → magical beans planted and sprout.
  2. `bean-climb`: **overhead reach, 8 reps** → climb up growing vine; background scrolls up.
  3. `bean-cloud`: **balance, 6 seconds** → cross cloud bridge.
  4. `bean-home`: **march, 12 steps** → travel safely back home.
- **Choice:** choose sunny cloud route / quiet cloud route; dialogue variations reconverge.
- **Background IDs:** `cottage`, `sprout`, `climb`, `clouds`, `home`.

### Story C — `pigs`: The Three Little Pigs

- **Selectable:** Pig 1/2/3 (`pig-one`, `pig-two`, `pig-three`); share animation templates if necessary.
- **World:** fixed countryside building site; objects are added/replaced as a house is constructed.
- **Theme:** planning, preparation, teamwork. Wolf should be mischievous rather than frightening.
- **Challenges:**
  1. `pigs-collect`: **squat, 6 reps** → collect building supplies.
  2. `pigs-walls`: **overhead reach, 8 reps** → walls rise/brick pieces stack.
  3. `pigs-roof`: **jump, 6 reps** → roof pieces lock into place.
  4. `pigs-wind`: **balance, 6 seconds** → house stays strong against wind.
- **Choice:** straw / wood / brick planning conversation, or roof option. To preserve a satisfying ending, dialogue can explain strengths and encourage choosing sturdy materials without punishing a child or changing exercise targets.
- **Background IDs:** `meadow`, `supplies`, `walls`, `roof`, `complete`.

### Adjusting difficulty

All counts are **proposed demo defaults**, not required exercise targets for children. Add a `difficultyMultiplier` or configurable per-activity target; never require increasingly intense exercise for story success. Give alternate seated/assisted or manual interactions. Do not use health or fitness tracking claims.

---

## 8. DATA CONTRACTS — FREEZE BEFORE PARALLEL WORK

Write `src/engine/types.ts`, Zod schema, validators, tests FIRST. Type names can be refined, but these semantic fields must exist:

```ts
type StoryId = 'hare' | 'beanstalk' | 'pigs';
type Mode = 'solo' | 'family';
type Movement = 'march' | 'jump' | 'squat' | 'reach' | 'balance';
type BeatType = 'narration' | 'dialogue' | 'choice' | 'challenge' | 'animation' | 'ending';

type StoryBeat = {
  id: string;
  type: BeatType;
  sceneId: string;               // maps to assets / scene definitions
  speaker?: string;
  text?: string;                  // preapproved fallback for every narrated/AI beat
  characterPose?: string;
  nextId?: string;                // absent only at ending or mapped via choice
  choices?: Array<{ id: string; label: string; nextId: string }>;
  movement?: Movement;
  target?: number;                // reps or seconds according to movement type
  animation?: string;            // declarative command, NEVER arbitrary JS
  allowAiVariation?: boolean;
  familyPrompt?: string;
};

type Story = {
  id: StoryId;
  title: string;
  summary: string;
  characters: Array<{ id: string; name: string; assetId: string }>;
  initialBeatId: string;
  beats: StoryBeat[];
  badge: { title: string; description: string };
};

type MovementEvent = {
  movement: Movement;
  kind: 'completed_rep' | 'hold_progress';
  at: number;
  value?: number;               // delta / elapsed seconds, not raw landmarks
};
```

**Validator conditions:** unique beat IDs; all `nextId`/choice links exist; exactly one reachable ending; every story has 4 reachable challenge beats; no accidental cycles in normal play; all choice options explicit; valid exercise targets; all referenced assets resolve or placeholder is permitted; all user-facing narration has authored fallback; allowable tags only; no arbitrary code in JSON.

**Story engine states:** `loading`, `narrating`, `awaitingChoice`, `challenging`, `celebrating`, `transitioning`, `paused`, `complete`, `error`. Events `START`, `NEXT`, `PICK`, `MOVEMENT`, `TIMER_TICK`, `PAUSE`, `RESUME`, `RESTART`, `EXIT`. Ignore movement events when not challenging and when paused, guard duplicates/cooldowns. Choice and chapter behavior deterministic. Pure reducer/state machine testable without browser, camera or Pixi.

**Save/restart:** in-memory state only for MVP; optional session persistence may store *only* story ID/progress, no camera data. Restart fully resets story progress and pending movement states.

---

## 9. PHASE-BY-PHASE BUILD PROCEDURE

**Do one phase at a time. At each step run `npm run build`, `npm run lint`, and `npm test` (or the scripts that exist), fix errors, and update `docs/BUILD_STATUS.md`.** Do not wait for permission to do ordinary non-destructive coding/tests; do ask before external deploy or billing.

### PHASE 00 — Preflight / project rules (15–25 min target)

**Claude does:**

1. Check current time relative to hackathon start / ask human to confirm hacking has started before coding submission.
2. Inspect repository and any `docs/PRODUCT_SPEC.docx` or `docs/BUILD_PLAN.docx`; don't claim to have read them if absent or unreadable.
3. Check `node`, `npm`, Git and network/package manager availability. Use current compatible Node LTS.
4. Create `docs/BUILD_STATUS.md`, `docs/HUMAN_HANDOFF.md`, `docs/ASSET_MANIFEST.md`, `docs/ART_BIBLE.md`, `docs/API_STATUS.md` with truthful status.
5. Identify critical decisions: production host, Meta access, current asset directory, team size. Use defaults where appropriate and avoid blocking.
6. Tell human precisely which **early assets and credentials** they can prepare while Claude codes. See Section 10.

**Gate:** repo status recorded; coding window confirmed; project conventions understood.

### PHASE 01 — Scaffold and design tokens (30–60 min)

**Claude does:**

1. Scaffold Vite `react-ts` app. Add PixiJS v8, MediaPipe Tasks Vision, Zod, Vitest, React Testing Library, minimal icons (e.g., lucide-react), eslint/formatter. Confirm compatible versions rather than guessing.
2. Add `npm run dev`, `build`, `test`, `lint`, `typecheck` scripts, and `.gitignore` for `.env*` (except example), node_modules, dist.
3. Create `src/styles/tokens.css` and global styles with color palette, type, spacing, accessible controls, breakpoints, reduced motion, and CSS fallback art.
4. Add typed navigation/routing, error boundary and placeholder screens. Configure relative production asset URLs correctly.
5. Create `.env.example` with `MODEL_API_KEY=` (server only), `META_MODEL_ID=` and notes, not actual secrets.

**Human action:** approve overall style from running local page. Do not ask for art yet unless hero asset genuinely blocks visual review.

**Gate:** app starts; first screens render with placeholders; build/lint/typecheck pass.

### PHASE 02 — All navigable screens (1.5–2 hours)

**Claude does:**

1. Build Home, Story Library, Character Select, Camera Setup shell, Story Player shell, Completion with real navigation and temporary sample state.
2. Implement Solo/Family mode switch; show parent decision CTA in family route.
3. Build reusable StoryCard, CharacterCard, NarrationPanel, ChallengeCard, ChoicePanel, PauseDialog, RewardBadge, progress bar and camera placeholder.
4. Create Story data registry showing three story cards even before assets are delivered.
5. Add component accessibility tests: labeled controls, keyboard tabbing, modal close/focus, progress announcements.

**Gate:** user can click through all screens and back; no dead controls; routes preserve selected story/character/mode.

### PHASE 03 — Story schema, state engine, test fixtures (1.5–2 hours)

**Claude does:**

1. Implement Section 8 contracts and Zod validation; define named story IDs, art mapping and error states.
2. Implement pure reducer/state machine for narration, choice, challenge, consequence and ending.
3. Add simulated movement buttons in developer/manual mode; use same engine event contract as real camera detector.
4. Implement story data (at minimum outline all 3 and fully write first); validate graph and reachable endings.
5. Add tests for all transitions, repeating input, pause/resume/restart, target completion, missing asset fallback.

**Gate:** 12 configured challenge beats validate; first story completes using simulated movement events without webcam.

### PHASE 04 — PixiJS 2D renderer and FIRST complete story (2–3 hours)

**Claude does:**

1. Mount a single PixiJS canvas in `SceneCanvas`; create renderer with `background`, `midground`, `props`, `character`, `foreground`, `effects` layers.
2. Create animation commands: `enter`, `idle`, `moveLeftToRight`, `hop`, `reach`, `climb`, `balance`, `collect`, `constructWall`, `roofAssemble`, `celebrate`, `pageTurn`.
3. Tween simple transforms/tints/visibility; don't depend on video or complex multi-frame AI sprite sheets. Preload current and next scene; destroy resources properly.
4. Implement **The Tortoise and the Hare** fully: 5 narrative scenes, 4 exercises, one decision, 2 character choices, moral, reward. Use procedural vector placeholders if art missing.
5. Connect each manual movement event to small immediate reaction; target completion triggers scene consequence before advancing.
6. Connect Web Speech narration via feature-detected `speechSynthesis` with captions, replay/skip, voice fallback and cancellation on scene changes.
7. Capture an optional test screenshot of working app if tooling permits; never fabricate images.

**Human action:** first art batch for Tortoise/Hare if ready; give visual review feedback on character scale, story pace, button location.

**Gate:** judge could demonstrate first story end-to-end in manual mode with polished enough UI and audible/text narrative.

### PHASE 05 — Real camera + motion detection (3–4 hours)

**Claude does:**

1. Implement `getUserMedia()` with permission prompts only after user chooses camera; properly stop all tracks and close pose model on unmount/exit.
2. Load official Pose Landmarker `.task` model from documented source or pinned official CDN; record source/license/version in `docs/ASSET_MANIFEST.md`.
3. Run video-mode pose inference at throttled frequency; calibrate camera placement and baseline body proportions; detect missing/partial body and tracking quality.
4. Normalize pose landmarks and apply smoothing; write **pure, separately testable** detectors with thresholds configurable, not magic numbers buried in React components:
   - **Squat**: standing → visibly bent knees/hips → stand; count only upon full return.
   - **Reach**: wrist above shoulder/head threshold → return below reset threshold; left/right alternate acceptable.
   - **March**: alternating raised knee or alternating step pattern with reset.
   - **Jump**: calibrated pelvis elevation and return to ground, with sufficient cooldown; robust to camera shake/arm movement; human must verify physically.
   - **Balance**: one-foot-raised hold and adequate body visibility; pause/reset or guide user if tracking lost. If unreliable, use accessible timer/manual mode.
5. Emit generic `MovementEvent` to engine only during appropriate active beat. Inference and UI are decoupled.
6. Expose status: camera initializing, model loading, no body, too close/far, tracking active, please reset stance, camera denied.
7. Unit test detectors on synthetic sequences (standing alone, partial motion, valid rep, retrigger, tracking loss). Avoid counting arm movement as jumps.

**HUMAN REQUIRED — CAMERA-01 (hard physical verification; manual-mode fallback remains):**

- Use a real laptop webcam; place laptop at roughly chest/waist height if possible and stand far enough away to fit the entire body; remove obstacles and ensure good lighting.
- Test 5 correct and 5 incorrect attempts for each detector; squat, reach, march, jump, balance. Note missed reps/double counts.
- Test standing still for 15 seconds, stepping out of frame, permission denied, light changes, re-entry, and pause.
- Report real observed counts, browser, camera, OS, distance, lighting, and any errors back to Claude; a local video recording is **not** needed.
- Claude adjusts thresholds based on findings and documents outcomes in `docs/QA.md`.

**Gate:** minimum 3 movement detectors work on the demo laptop without repeated false counts; all others have manual fallback; no camera data uploaded.

### PHASE 06 — Story 2 and Story 3 (2–4 hours)

**Claude does:**

1. Author complete Jack and Beanstalk story JSON and narration, 4 challenge nodes, one choice, moral, ending.
2. Implement vertical vine progression using Pixi transforms/background layers rather than separate physics gameplay.
3. Author Three Little Pigs with supplies → wall → roof → wind/finished house; represent construction with prop sprite visibility and stage transitions.
4. Reuse all components, input detectors, and state engine — **do not fork three apps or write three separate camera loops.**
5. Add all character choices with tasteful visible variation; avoid broken alternate sprite paths.
6. Add automatic validation tests for exactly 4 reachable challenge nodes/story and one reachable ending/story.

**Human action:** deliver remaining background/character assets if ready. Claude continues with placeholders until supplied.

**Gate:** all 3 stories playable through ending using manual mode, including one parent choice in Family Mode.

### PHASE 07 — Meta AI and final art (1.5–3 hours; can run in parallel)

**Claude does:**

1. Read `docs/API_STATUS.md` and user's verified Meta access status before building API-specific code.
2. For **art generation**, create prompts and a manifest (Section 10); supply ready-to-paste prompts to human or write a local one-time asset generator script **only if** human authorizes use of a real API key and costs and the current official image endpoint is confirmed.
3. For **dialogue**, create `/api/meta-dialogue` serverless endpoint with strict input allowlist (`storyId`, `beatId`, `characterId`, `mode`, `choiceId`) and server-side context lookup from trusted canonical story manifests.
4. Use Muse Spark to request a short (≤2 sentences), gentle, age-appropriate character reaction or parent-child prompt. Validate output via Zod, length limits, no unsafe instructions, no private information; if malformed, timeout (~3 sec), 429, 500 or offline, return authored fallback.
5. Never send actual camera data, child name, raw text fields from arbitrary input, or free-form identifying prompts to AI. Parent-approved discrete choices only.
6. Call AI only at selected story beats / family-choice moments, not on every movement or every render frame.
7. Store Meta model, endpoint and response metadata (without secrets) in `docs/API_STATUS.md`, document screenshot/usage evidence for sponsor judges.
8. Integrate real curated artwork in a stable asset registry; optimize large backgrounds to WebP and cutouts to transparent PNG. If no transparent art is available, use clipping/masking or CSS illustration fallback; don't ship weird white rectangles around sprites.

**HUMAN REQUIRED — META-01:**

- Go to https://dev.meta.ai/ and confirm that Meta Model API access is available to your account and region. Review pricing/quotas and get permission before any paid calls.
- Create a project/key as official portal instructs; **do not paste the key into chat, Git, screenshots, or `CLAUDE.md`**. Put it only in your own local `.env` / secret store and Vercel env settings.
- Run a minimal server-side test call based on current official docs; report only success, accessible model ID, errors/HTTP status, and quotas (without token).
- If account access or Muse Image is unavailable, use high-quality user-provided/generated alternative assets with their provenance. For sponsor submission, accurately describe what Meta technology was or was not actually used.

**Gate:** AI dialogue works from serverless (or is honestly marked unavailable), failure never blocks story, user-provided art used as approved. P0 is already playable without Meta API.

### PHASE 08 — Polish / reliability / accessibility (2–3 hours)

**Claude does:**

1. Improve character transitions and background parallax, keep art coherent across scenes; add small sound effects (licensed or original) after assets are stable.
2. Ensure interactive UI fits laptop at 1280×800, tablet at ~768px, remains readable, contrast sufficient, subtitles never overlap camera preview.
3. Add reduced-motion support; allow manual/seated alternatives without guilt or negative scoring.
4. Verify camera permission denied/revoked, lost tracking, bad lighting, no speech synthesis, network/AI offline, missing assets, pause/resume, return to library, restart.
5. Check for animation/stream memory leaks, duplicate render loops, excessive CPU; don't freeze UI when pose tracking runs.
6. Run tests/build/lint and create `docs/QA.md` with **actual** pass/fail, known issues and risk priority. Never mark a real-camera test as passing if only a simulated test ran.

**Human action:** play through all 3 stories (4 challenges each) in manual and at least one in webcam mode; review pacing/readability/story art and parent-child experience.

**Gate:** complete flows, no blocking errors, demo laptop stable.

### PHASE 09 — Deploy, submit, and judge rehearsal (final 1.5–2.5 hours)

**Claude does:**

1. Confirm intended Vercel project/account with human. Configure React SPA routing and `/api/meta-dialogue` handling, if used, without exposing keys. Build production and confirm no secret strings in bundled output.
2. Request authorization for public deployment; deploy only after confirmation. Test `getUserMedia()` from real production HTTPS (localhost behavior is not sufficient proof).
3. Write `README.md`: problem, architecture, tech stack, authoring structure, local setup, .env instructions, privacy, track alignment, supported browser/device and demo steps.
4. Create `docs/DEMO.md`: 90-second demo script, tested judge path, which motion to demonstrate first (usually jump/reach), known fallbacks and manual mode button location.
5. Prepare honest evidence checklist for Meta: actual model ID, what output/assets were genuinely generated by Muse, screenshots of real usage, original art prompts and provenance. Do not misrepresent another model's generated work as Meta's.
6. Guide human through Devpost project submission without inventing links, event rules, or submission success. Verify current event deadlines from organizer/Devpost.

**HUMAN REQUIRED — DEPLOY-01:**

- Approve hosting provider and project, connect account, set deployment secret `MODEL_API_KEY` server-side as instructed, authorize any billing/usage.
- Open public URL in fresh/incognito browser; test camera permission, a rep, audio, all screen routing, mobile/tablet responsiveness and AI fallback.
- Record real demo video/screenshots only with consenting adult participants; do not publish identifiable child recordings without appropriate permission.
- Supply live URL and observed behavior/errors to Claude for final fixes; personally submit Devpost entry.

**Gate:** production URL and README verified; completion flow + fallback demonstrated; `docs/BUILD_STATUS.md` reflects what truly shipped.

---

## 10. HUMAN-GENERATED ARTWORK — EXACT REQUESTS AND PROMPTS

**The human must know what to generate, how, where it belongs, and what to send back.** Claude owns the art pipeline, request formatting, post-processing scripts, optimization, validation and integration. Human owns access to AI art generation, curation/approval and transfers when Claude lacks direct image-generation API access.

### 10.1 Art creation source and rules

**Preferred source for Meta-track evidence:** https://dev.meta.ai/ → Muse Image (`muse-image-1.0`) if enabled in the account. Otherwise use another art generator the team is allowed to use or original illustrations; **label the real source honestly**. AI art may require manual cutout/background removal. Any third-party assets must have clear licensing. Do not assume a specific tool supports transparency, consistent sprite sheets, or requested image dimensions: verify actual output and convert/edit if needed.

**Global art bible prompt (use as prefix for EVERY art generation):**

> Create polished 2D artwork for a children's interactive storybook game for ages 5–10. Whimsical hand-painted/watercolor-inspired illustrated style, flat clean readable shapes with soft painted texture, gentle bright pastels (cream, sage green, honey gold, sky blue, warm cocoa brown), friendly rounded characters, charming fairytale forests and cottages, consistent medium-weight edges, soft lighting, little clutter, side-on or three-quarter side view appropriate for 2D animated sprite compositing. Keep a consistent visual style across an entire three-story game. **No text, no letters, no logos, no watermarks, no application buttons or HUD.** Leave comfortable space near the bottom of background art for subtitles which will be added in code.

**Critical:** Do NOT generate a flat screenshot of the game UI for use as final interface. Generate separate **backgrounds, character cutouts, and optional foreground props**. Claude assembles them with PixiJS.

### 10.2 Save formats / naming / placement

| Asset class | Preferred specification | File destination |
|---|---|---|
| Backgrounds | landscape 16:9, ideal 1920×1080 or highest practical output; `.webp` final after review | `public/assets/<story>/backgrounds/<sceneId>.webp` |
| Character cutouts | transparent PNG, about 512–1024 px tall, full body, same style/scale, facing right (flip by code), clean margins | `public/assets/<story>/characters/<characterId>/<pose>.png` |
| Props | transparent PNG, appropriate scale, clean crop | `public/assets/<story>/props/<propId>.png` |
| Cover thumbnails | landscape 4:3 or 16:9, 800–1200 px wide, optional derived from backgrounds | `public/assets/<story>/cover.webp` |
| Home hero | landscape 16:9, about 1600×900, inviting multi-story world | `public/assets/common/hero.webp` |
| App icon | square, no copyrighted logos or in-image text needed | `public/assets/common/logo.png` |
| UI decorations | optional PNG/SVG textures, not a screenshot of controls | `public/assets/common/ui/` |
| SFX | short, licensed/owned `.mp3` or `.ogg` | `public/assets/common/audio/` |

If human drops files into `incoming_assets/`, Claude should inspect and copy/convert to these canonical paths after approval; never rename a user's original without a copy.

### 10.3 **Batch A — essential first art (request at Phase 02–04)**

Ask for these **seven** high-value images first (minimum viable polished demo). If time is very tight, request just `hare/start.webp`, `tortoise/idle.png`, `hare/idle.png` first.

1. `public/assets/hare/backgrounds/start.webp` — "Storybook forest race starting line, winding dirt trail going from left to right, welcoming woodland animal spectators, late-morning sunlight, ample open track across middle, no main tortoise or hare baked into background."
2. `public/assets/hare/backgrounds/puddles.webp` — "Same consistent fairytale forest world, a trail with several broad shallow puddles and stepping stones along horizontal route, no characters."
3. `public/assets/hare/backgrounds/bridge.webp` — "Same forest, charming narrow wooden bridge crossing a gentle clear stream, readable path, safe and friendly, no characters."
4. `public/assets/hare/backgrounds/finish.webp` — "Same woodland race trail ending with bunting and playful animal audience, empty foreground for characters, no written finish-line text."
5. `public/assets/hare/characters/tortoise/idle.png` — "Single full-body adorable cartoon tortoise, small green shell-backed character, three-quarter side profile facing right, confident kind expression, entire silhouette visible, isolated on plain background suitable for transparent cutout, no ground/shadow/environment, no text."
6. `public/assets/hare/characters/hare/idle.png` — "Single full-body adorable cartoon brown hare, expressive long ears, side profile facing right, friendly slightly overconfident expression, same illustrated style and perceived scale as tortoise, isolated for transparent cutout, no environment/text."
7. `public/assets/common/hero.webp` — "Wide magical storybook panorama subtly blending enchanted forest racetrack, towering magic beanstalk, and cozy house-building meadow into one cohesive children's picture-book world, empty space for UI overlay, no embedded words or buttons."

**Save note:** AI image generators usually return PNG/JPEG. The human may provide the originals in `incoming_assets/`. Claude will crop, remove backgrounds where feasible, convert and optimize, and validate outputs. Don't assume images already have an alpha channel.

### 10.4 **Batch B — remaining 3-story backgrounds (request at Phase 05–06)**

**Forest race** (5 total):
- `hare/backgrounds/trail.webp`: forest running trail where hare can rest near a tree and tortoise continue steadily; no baked-in playable character.
- (plus `start`, `puddles`, `bridge`, `finish` from Batch A).

**Jack and Beanstalk** (5):
- `beanstalk/backgrounds/cottage.webp`: humble fairytale cottage, soil patch and empty sky, pre-planting.
- `beanstalk/backgrounds/sprout.webp`: glowing green magical beanstalk beginning to grow next to cottage.
- `beanstalk/backgrounds/climb.webp`: tall beanstalk with repeatable vines/leaves and vertical space; camera should scroll UP.
- `beanstalk/backgrounds/clouds.webp`: floating cloud bridge and friendly distant castle, airy and bright; no terrifying giant.
- `beanstalk/backgrounds/home.webp`: warm cottage and garden under sunset light, room for victory celebration.

**Three Little Pigs** (5):
- `pigs/backgrounds/meadow.webp`: empty countryside building lot with grass, sunny sky, forest edge.
- `pigs/backgrounds/supplies.webp`: matching building lot with organized raw materials, keep central build zone clear.
- `pigs/backgrounds/walls.webp`: same site/angle with some wall construction context but avoid full prebuilt house; props will build it.
- `pigs/backgrounds/roof.webp`: matching site with scaffolding / room for assembling roof.
- `pigs/backgrounds/complete.webp`: celebration-ready countryside site, keep house as separate foreground prop if possible.

**Important consistency constraint:** same camera angle, palette, time of day and ground baseline within each story, except intentional scene transition. Generate/edit using preceding scene as reference when tool supports it. At least 1920×1080 target where achievable.

### 10.5 **Batch C — characters and action poses (request at Phase 06–07)**

**Character IDs, first required art, optional poses:**

| Character | Base file | Optional action files (prioritize left to right) |
|---|---|---|
| Tortoise | `hare/characters/tortoise/idle.png` | `walk.png`, `balance.png`, `happy.png` |
| Hare | `hare/characters/hare/idle.png` | `run.png`, `jump.png`, `happy.png` |
| Jack | `beanstalk/characters/jack/idle.png` | `climb.png`, `reach.png`, `happy.png` |
| Adventurer | `beanstalk/characters/adventurer/idle.png` | `reach.png`, `happy.png` |
| Pig one | `pigs/characters/pig-one/idle.png` | `carry.png`, `build.png`, `happy.png` |
| Pig two | `pigs/characters/pig-two/idle.png` | `carry.png`, `build.png`, `happy.png` |
| Pig three | `pigs/characters/pig-three/idle.png` | `carry.png`, `build.png`, `happy.png` |

**Reusable character prompt:**

> Same exact art style, colors, shape proportions, facial features and clothing as the approved reference character sheet. Create ONE [CHARACTER] in [IDLE / JUMP / RUN / CLIMB / CARRY / REACH / HAPPY] pose, full-body 2D clean silhouette, 3/4 side-facing right, character entirely within frame, neutral plain background easy to remove, no environmental props, no text, no logo. Intended to be composited as a separately animated game character.

**Consistency workaround:** If a generator changes character appearance between poses, **use a single approved idle cutout and animate it with PixiJS transforms** (translate, pivot, tilt, squash/stretch, bounce). Do not stall trying to create 25 frame-perfect images. Three pigs can use one base sprite recolored or with simple accessory overlays if visually clear; do not mislabel duplicate characters as separate art.

**Narrative-only characters:** gentle wolf, nonthreatening giant, woodland audience can be small prop PNGs or drawn in backgrounds; not necessary as fully animated selectable characters.

### 10.6 **Batch D — props / effects / audio (optional late polish)**

**Target props (Claude may draw SVG/code substitutes if unavailable):**

- Forest: `puddle.png`, `bridge.png` (if needed), `finish-banner.png`, `tree.png`, `leaves.png`.
- Beanstalk: `seed.png`, `vine-segment.png`, `cloud.png`, `magic-sparkle.png`.
- Pigs: `brick.png`, `wood.png`, `straw.png`, `wall-segment.png`, `roof.png`, `finished-house.png`, `wind-swirls.png`.
- Shared: `confetti.png`, `star.png`, `badge-frame.png`; optional splash/logo.

**Prop generation prompt:**

> One isolated 2D storybook game prop: [OBJECT], consistent with existing children's pastel watercolor-inspired character set. Three-quarter side view where appropriate, simple readable silhouette, no background, no lettering or logos, suitable for transparent PNG, no distracting shadow. Centered with complete margins.

**Audio:** browser `speechSynthesis` for narrator and dialogue; manually added licensed simple chime, pop, success jingle, and page turn. The human should only source sounds with verified reuse licenses and give Claude original URL, author and license terms. If time is limited, synthesize very short, gentle procedural sound effects in Web Audio with no asset dependency. Never add unverified MP3s from web search.

### 10.7 Artwork submission checklist the human should use

```text
[ ] I generated/selected art using a source permitted by hackathon rules.
[ ] I saved original files (no watermark) in incoming_assets/ or supplied a folder.
[ ] I identified which images were made with Meta Muse Image versus other tools.
[ ] Backgrounds have no built-in subtitles/buttons/playable heroes.
[ ] Character images are whole-body and have consistent style, view and approximate scale.
[ ] Transparent backgrounds supplied where possible (otherwise marked for cleanup).
[ ] I sent exact filenames or a zip; Claude can map them to canonical paths.
[ ] Any third-party sound/font/texture has recorded provenance and license.
```

**Claude actions after receiving assets:** check `file` signatures/image sizes/alpha, reject corrupted files, map source → manifest, preserve originals, resize/compress to fit web, test loading in browser, log generator/model and prompt in `docs/ASSET_MANIFEST.md` and show user exact deficiencies.

---

## 11. EXTERNAL ACCESS AND RESOURCES HUMAN MUST PROVIDE

| Request ID | When | Exactly what human does | What Claude can do meanwhile |
|---|---|---|---|
| `EVENT-01` | Before code start | Confirm hacking clock started and ask organizer whether pre-generated AI art and prewritten instructions are allowed | Review docs and plan only |
| `ART-01` | Phase 02–04 | Supply/approve Batch A images, saved names above, with generator provenance | Build working CSS/SVG placeholders |
| `ART-02` | Phase 05–06 | Supply/approve backgrounds for Jack and Pigs and missing forest scene | Finish story JSON and animations using placeholders |
| `ART-03` | Phase 06–07 | Supply selected character cutouts, optional poses and props | Animate base cutouts with Pixi transforms |
| `META-01` | Phase 07 | Enable/verify Meta Model API, billing/quotas; set `MODEL_API_KEY` privately; provide accessible model IDs/status | Use vetted dialogue fallback and no live API calls |
| `CAMERA-01` | Phase 05 onward | Run physical webcam tests; report browser/distance/results | Unit-test detector traces and manual mode |
| `AUDIO-01` | Phase 08 optional | Supply properly licensed chimes/page turn or approve procedural sound | Use subtitles/TTS and generated Web Audio sounds |
| `DEPLOY-01` | Phase 09 | Approve/connect Vercel/deployment account, secret settings, public URL, confirm real-camera HTTPS tests | Verify local production build and prepare config |
| `DEMO-01` | Phase 09 | Approve final 90-second story path; optionally record consenting adult-only video | Write storyboard and demo guide |

**Do not request GitHub credentials as plaintext.** The human can authenticate locally through standard GitHub/CLI login. Never ask for a private API key to be pasted in chat.

---

## 12. META AI SERVER-SIDE CONTRACT AND CONTINGENCY

**Purpose:** Meta models generate *short constrained reaction dialogue* and approved story art. They do not control exercise goals, core plot, story routing, or child safety. Parent-child collaboration must be observable in real gameplay, not just stated in pitch.

**Client request (only allowlisted IDs):**

```json
{
  "storyId": "hare",
  "beatId": "hare-bridge-choice",
  "characterId": "tortoise",
  "mode": "family",
  "choiceId": "ask-for-help"
}
```

**Server response (validated):**

```json
{
  "speaker": "Tortoise",
  "line": "What a clever idea! Let's listen to our friends and cross carefully.",
  "tone": "encouraging",
  "source": "meta"
}
```

`source` may be `fallback` if timeout/error. Never fake a `meta` result. The endpoint must avoid reflected arbitrary user content; validate incoming story/beat IDs against canonical data and map them to a fixed safe prompt. Do not send parent or child names, demographics, images, audio or exact movement data. Server only uses `MODEL_API_KEY`; use documented base URL `https://api.meta.ai/v1` and check current request schema. Budget/rate-limit usage and fail gracefully.

**Sample safe prompt for server (adapt to schema):**

> You write one or two short, warm, age-appropriate lines of dialogue for an illustrated interactive children's story. Do not introduce new story facts that contradict the preapproved plot. Do not change movement instructions, prescribe physical intensity, use frightening content, request private information, or address the child by name. The current approved story context is [SERVER-CONTROLLED STORY SUMMARY]. The character is [ALLOWLISTED CHARACTER]. Parent/child selected [ALLOWLISTED CHOICE]. Return only valid JSON with speaker, line, and tone, maximum 30 words in `line`. Encourage teamwork and agency without claiming measurable developmental benefits.

**Important:** prewritten authored dialogue should cover every beat even if live Muse unavailable. For Meta eligibility, demonstrate genuine call or actual Muse Image generation with accurate provenance; track names and timing of real generated assets in manifest.

---

## 13. TESTS, BENCHMARKS AND QUALITY GATES

**Automated tests Claude must write and run:**

- Story schemas: 3 IDs, 4 challenges/story, linked beats valid, reachable ending, all fallback narration present, invalid choice rejected.
- Story engine: NEXT/PICK/MOVEMENT/TIMER_TICK, freeze on pause, ignore duplicate events, restart resets, manual and camera paths equivalent.
- Detectors: no reps on idle/partial motions, correct rep cycles, reset before next, duplicate frame does not increment, tracking loss does not complete pose.
- AI endpoint: allowed IDs succeed with mocked Meta; invalid input denied; 3-second timeout gives authored fallback; bad JSON, 429, 500, no key and network offline do not block progress.
- UI: story cards route correctly; character choice is visible; continue/skip/replay; accessible button names; pause modal works; keyboard navigation.
- Assets: all referenced filenames exist or are intentional placeholders; missing image never crashes renderer.

**Real human tests (Claude cannot truthfully automate):**

- Physically test squat/reach/march/jump/balance in actual judging conditions.
- Check narration volume and subtitles standing a few feet from screen.
- Test full-family shared choice flow with adult participants, without recording children.
- Confirm scene composition, consistency of character scale, smooth visual reactions.
- Test fresh-device HTTPS camera permission and serverless Meta fallback.

**Performance guidelines (targets, not guarantees):** readable interaction at ~1280×800; movement feedback feels near-instant; cap inference load; avoid scene texture leaks; preload next scene; never wait on AI to count movement or unblock plot; no raw recording or personally identifying data.

**QA reporting:** each check has `PASS`, `FAIL`, `NOT_RUN`, or `MANUAL_REQUIRED`; provide relevant browser/OS/machine and reproducing steps. Do not mark all green merely because `npm run build` succeeded.

---

## 14. CLAUDE CODE WORKFLOW — MAXIMUM AI-WRITTEN CODE, MINIMUM REWORK

### First prompt a human should give Claude Code

```text
Read CLAUDE.md from the repository root in full. You are StoryMotion's lead engineer.
First inspect the repository and docs, determine which phase is incomplete, and
confirm whether the HackTX hacking period has begun. If yes, implement PHASE 00
and PHASE 01 only, using placeholders where artwork is missing. Actually create
and test files. Set up docs/BUILD_STATUS.md and docs/HUMAN_HANDOFF.md.
Do not ask me generic planning questions. Ask me only for the exact human-only
resources specified in CLAUDE.md. At the end, show files changed, actual test
results, anything I need to give you (with exact paths/prompts), and the next step.
```

### Subsequent prompts

Use **one bounded prompt per milestone**, for example:

```text
Read CLAUDE.md and docs/BUILD_STATUS.md. Implement the next incomplete phase
only. Preserve all passing behavior. Use test-driven development for the story
engine/detectors. Run typecheck, build, lint, and tests; fix failures. Update
BUILD_STATUS and HUMAN_HANDOFF. Give me exact click-through manual checks.
```

Or to isolate a broken module:

```text
Fix the MediaPipe jump detector only. Diagnose from the observed test notes in
docs/QA.md. Do not redesign any screen or rewrite the story engine. Add a unit
test for the failure, apply a minimal fix, run tests and report actual results.
```

### Efficient parallel coding (if multiple Claude sessions / teammates)

Only parallelize after Section 8's data contracts are stable. Safe separate ownership: (A) React UI; (B) pure story engine + JSON; (C) vision adapter/detectors; (D) curated art + asset pipeline; (E) Meta serverless. Use separate Git branches and merge in dependency order; **one integration owner** resolves conflicts. Do not have two agents modify the same screen/story schema concurrently. Assign each task testable file boundaries and a precise "done" condition.

### Commit discipline and permissions

- Commit after each clean tested milestone **if local Git is configured**. Ask before force pushes, resetting commits, deleting branches, or overwriting user files.
- Favor changes localized to one phase; avoid broad unrelated refactors.
- Never use a destructive `rm -rf` or arbitrary cleanup outside the repo; never exfiltrate secret env values.
- Pin package versions in lockfile, run `npm audit` as advisory but don't destabilize the build with indiscriminate major updates.
- Keep a running issues list and actionable human resource list.
- Prefer lower-dependency implementations when the existing stack suffices.

---

## 15. DEMO AND HACKATHON RULES

**Recommended 90-second judge path:**

1. **0–15s:** "Stories normally keep kids sitting and watching. StoryMotion makes children active characters and helps families play together."
2. **15–30s:** choose Family Adventure → Tortoise and Hare → character; show delightful art.
3. **30–55s:** child/adult volunteer completes 3–5 jump/reach movements; on-screen character responds on *every* move.
4. **55–70s:** parent selects a path; if Muse live, show an authentic AI response; if not, honestly present vetted dialogue fallback.
5. **70–85s:** show progress, story consequence and story/celebration; rapidly show Jack and Three Pigs to prove reusable engine.
6. **85–90s:** "React + PixiJS + MediaPipe local pose detection + Meta AI for curated illustration and safe personalized dialogue. Camera frames never leave the device."

**HackTX opening deck facts to verify against current organizer pages:** 24-hour hacking; all code written during hacking period; submissions via https://hacktx26.devpost.com ; deck said soft submissions Saturday 11:30 PM, final Sunday 11:30 AM, up to 3 tracks excluding Best Overall/Novice; judging Sunday afternoon. Check event site/Discord for changes before promising timeline or submission counts.

**Honest track positioning:** Most Entertaining is a natural fit. Best Pitch benefits from crisp live movement feedback. Meta track only strong if **real** Meta models are used and **real** shared parent-child interaction is a feature, not a marketing sentence. Preserve evidence of actual Meta output and art provenance. Do not claim any prize or guaranteed eligibility.

---

## 16. CONTINGENCY LADDER — NEVER LOSE THE DEMO

If blocked, pivot quickly in this order (keep user informed, don't silently fake capabilities):

| Problem | Safe fallback | Do not sacrifice |
|---|---|---|
| Meta API unavailable | Authored deterministic dialogue and approved non-Meta art | Full story flow; accurate sponsor claims |
| Muse Image inconsistent / missing | Hero art + consistent programmatic vector placeholders, single sprite per character | Coherent style and visible animation |
| Balance/jump detector unreliable | Squat/reach/march; accessible manual input on affected beat | 4 story beats per story |
| PixiJS integration painful | Simple React + CSS transform layered scenes | Movement-to-visible-consequence interaction |
| Text-to-speech unavailable | Readable subtitles + Continue + optional preapproved prerecorded audio | Story comprehension |
| Serverless deployment broken | Static site with all 3 stories and API fallback; document AI unavailable | Public working HTTPS app |
| Child webcam framing difficult | Simple setup guidance and manual mode | Dignity, accessibility and safety |
| Time running low | One ultra-polished judge path and 2 shorter but complete experiences | 3 selectable and completable storylines |

**Non-negotiable: No dead-end story, no exposed secret, no child video uploads, no false test claims.**

---

## 17. WHAT TO DO IMMEDIATELY UPON READING THIS FILE

1. Confirm you're in project root and this file exists as `CLAUDE.md` (not `claude.md` if case-sensitive).
2. Read `docs/BUILD_STATUS.md` if it exists; check reality of files and test scripts instead of trusting notes alone.
3. Confirm hackathon implementation is allowed to begin. If not, limit activity to non-code planning and resource requests.
4. If allowed, start Phase 00 → Phase 01, actually write files and run commands.
5. **Immediately show human ART-01 first-batch requirements and META-01 account readiness checklist**, but do not block P0 coding waiting for them.
6. Keep a single next step, concise truthful completion report, and specific human handoff tasks after every milestone.

**End state:** a delightful, story-first, motion-controlled family storytelling web app that a judge can open and play in under a minute, with three narrative worlds and a technically credible Meta integration if available.
