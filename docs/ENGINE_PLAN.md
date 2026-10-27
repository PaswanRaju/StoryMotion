# Phase 1A: data-driven story engine

## Current architecture

`data/stories/scenes.ts` owns ordered scene lists, narration, durations, cast,
plot events, and scene-local invitation times. `automaticStory.ts` projects these
into absolute moments and advances a reducer every 200 ms. Story time freezes at
an invitation while a separate response window counts down. Camera setup lets
story time continue, defers an invitation, and gracefully skips expired moments.
`StoryPlayerPage` owns narration, reaction captions, sound cues, pause/restart,
camera callbacks and completion navigation. `momentCopy.ts` supplies prompts,
buttons and outcome narration. The library registry supplies metadata.

Rendering is deliberately cinematic: ForestRaceScene uses a mapped global clock;
Jack's grow/climb/cloud scenes use BeanstalkScene's tall-world clock; the other
Jack and Pig scenes use SVG StorybookScene definitions. Their positions, poses,
transitions and effects are authored functions of time. Rewriting those functions
as discrete animation steps in this phase would risk visual regressions.

## New architecture

- `engine/schema.ts`: Zod data contract and reference/graph validation. A scene
  owns narration lines, background asset id, initial character placements, timed
  actions, sounds, transitions, interactions and its next scene or ending.
- `stories/`: the three authored story files and a catalog. Story definitions
  contain only serializable data. Existing timeline helpers become projections
  of this catalog so rendering and playback share one source of truth.
- `engine/registry.tsx`: asset and character adapters, including existing
  cinematic compositions. Choreography remains inside those registered assets;
  new scenes can use individual registered characters and timed actions.
- `engine/storyMachine.ts`: XState v5 scene, narrating, interaction, reaction,
  nextScene and ending states. A 200 ms clock sends events, preserving the old
  timing contract. Pause, camera setup, gesture, button and timeout are events.
  Outcomes may continue the current scene or jump to a different scene. Graph
  validation rejects dangling references, unreachable scenes and possible loops.
- `StoryPlayer`: generic presentation driven by the machine and story data.
  Narration remains best effort and never gates story progress. Routing supplies
  metadata and completion navigation. Detection is enabled only in interaction
  windows; camera permission and local calibration remain independent.

## Migration steps

1. Add XState v5 (Zod and Vitest are already installed).
2. Define schemas, registries and validation, including all-branch termination.
3. Move authored scene lists into story files and compile the existing copy into
   serializable schema data; leave compatibility projections for renderer/tests.
4. Replace reducer playback with the generic XState machine and adapt the player
   without changing its markup, CSS, narration keys or timing.
5. Gate gesture recognition in the local pose worker during interaction windows.
6. Add schema, graph, state-machine fake-clock and generic-rendering tests. Run
   typecheck, lint, the complete tests and production build. Manually check all
   three stories with webcam, buttons and no input, pause/restart and mute.

## Validation contract

`validateStory` parses unknown input, then validates ids against an injected
registry catalog (the application uses its actual rendering registry). Every
scene and every possible success/timeout branch must terminate; cycles are
rejected even if they have an exit, since they permit a non-ending path. A null
outcome destination means resume the remainder of the current scene, not a loop.
Existing cinematic assets encapsulate positions and time-based pose changes;
these are intentionally preserved rather than duplicated in story data.

XState API reference: https://stately.ai/docs/cheatsheet (v5).

## Implemented details

All three authored definitions are plain, schema-typed objects. Prompt and
reaction copy moved into their interaction nodes; the old copy module was
removed. Storybook sound schedules moved from renderer definitions into scene
data. Existing cinematic compositions still own their exact poses, positions,
clock mappings and fades. Their cast entries use the explicit `cinematic`
animation state; generic scenes use individual rig states and placements.

`StoryPlayerPage` supplies routing; `StoryPlayer` validates and plays any story
using the registry. New prompts narrate by default; migrated prompts explicitly
retain their previous caption-only invitation behavior, preserving their audio.
The original reducer remains only as a compatibility API/regression oracle for
existing tests; the app's player does not import or execute it.

The worker keeps local tracking and calibration available outside windows but
skips gesture classification. Window changes clear pending recognition state;
controller callbacks also reject in-flight results after recognition closes.
No camera frames or landmarks leave the local browser/worker pipeline.

Manual review checklist:

- Play Hare, Jack and Pigs through their endings without starting a camera or
  touching any invitation. Compare narration, scene transitions, music/sounds,
  character choreography and completion screens with the previous version.
- Repeat using every visible button, including both left/right choices, and
  repeat with the webcam's brief gestures. Wrong/early gestures do nothing.
- Check seated hand raise, spread arms and both leans; check crouch with a
  registry-authored crouch invitation and a full-body view.
- Start the camera before an invitation and midway through one; deny permission
  and allow a slow setup. Invitations resume with full windows or kindly skip.
- Pause mid-window, resume, restart from the pause dialog, mute/unmute, replay
  narration, switch tabs and use fullscreen. Check that no stale gesture fires
  after a window closes and the camera never displays raw video.

Suggested next phase: author a fourth story entirely from individual registry
rigs, and migrate cinematic choreography into reusable animation tracks only
with visual baselines and recorded browser comparisons in place.
