# StoryMotion — Agent Instructions

## Project
StoryMotion is an interactive children's storytelling web app. Kids interact with animated stories using brief body gestures detected by webcam (Google MediaPipe Pose Landmarker).
Stack: React, TypeScript, Vite, SVG/CSS animations, Web Speech API narration, Web Audio sound effects.
Current stories: The Tortoise and the Hare, Jack and the Beanstalk, The Three Little Pigs.
Core loop: Watch → Move Once → Character Reacts → Story Continues.

## Product rules (never break these)
- Story-first: every story keeps a complete intro, plot, climax, and conclusion. Gestures enrich the story; they never change its moral.
- No failure states: every interactive moment has a timeout that continues the story gracefully.
- Every gesture has a clickable button alternative.
- Stories must play fully without camera access.
- Brief gestures only; no continuous movement required.
- Privacy: camera frames are processed locally in the browser only. Never record, store, upload, or send camera frames or landmarks to any server or API. Never show raw camera video to the child (pose skeleton overlays are fine).
- Child-friendly: large touch targets, voice-first instructions, simple language.

## Engineering rules
- TypeScript strict mode; avoid `any`.
- Keep the three existing stories working with no visual or behavioral regressions unless the task asks for a change.
- Match the existing code style and folder structure; prefer small, focused modules.
- Before finishing, run typecheck, lint (if configured), tests, and `npm run build`, and fix any failures.
- Explain any new dependency in your summary.
- End every task with a summary: what changed, files touched, a manual test checklist (especially webcam gestures, which you cannot test yourself), and suggested follow-ups.

## Git
- Do not create commits. Never add Co-authored-by trailers, "Generated with" lines, or any AI attribution in commit messages, PR descriptions, or code comments. Leave all changes for the maintainer to review and commit.