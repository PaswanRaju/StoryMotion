> Current parent-generation implementation and environment setup: [PARENT_GENERATION.md](PARENT_GENERATION.md). The notes below describe earlier project phases.

# API_STATUS

Tracks real, verified status of every external API integration. Never mark a
row `AVAILABLE`/`WORKING` without an actual successful request made and
observed in this project.

## Meta Model API (Muse Spark — dialogue)

| Field                     | Value                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| Status                    | NOT CONFIGURED                                                                              |
| Candidate model ID        | `muse-spark-1.3` (unverified — confirm at https://dev.meta.ai/docs/models)                  |
| Base URL                  | `https://api.meta.ai/v1` (per `.env.example`; unverified)                                   |
| Account access confirmed? | NO — pending human (`META-01` in `docs/HUMAN_HANDOFF.md`)                                   |
| `MODEL_API_KEY` set?      | NO                                                                                          |
| Last successful test call | NEVER                                                                                       |
| Fallback in use           | Authored dialogue only (fallback content not yet written — due Phase 03/06 story authoring) |

## Meta Muse Image (art generation)

| Field                            | Value                            |
| -------------------------------- | -------------------------------- |
| Status                           | NOT CONFIGURED                   |
| Candidate model ID               | `muse-image-1.0` (unverified)    |
| Account access confirmed?        | NO — pending human (`META-01`)   |
| Images generated via Muse so far | 0                                |
| Fallback in use                  | CSS/SVG placeholders (Phase 02+) |

## MediaPipe Tasks Vision — Pose Landmarker

| Field       | Value                                                                     |
| ----------- | ------------------------------------------------------------------------- |
| Status      | INSTALLED, NOT INTEGRATED                                                 |
| Package     | `@mediapipe/tasks-vision` (installed via npm, version per `package.json`) |
| Model file  | Not yet downloaded/pinned — due Phase 05                                  |
| Integration | Due Phase 05                                                              |

## Web Speech API (`speechSynthesis`)

| Field  | Value                                                                                                                      |
| ------ | -------------------------------------------------------------------------------------------------------------------------- |
| Status | NOT YET WIRED                                                                                                              |
| Notes  | Browser-native, no external API/key. Feature-detect at runtime; captions always shown regardless of support. Due Phase 04. |

## Vercel deployment

| Field              | Value          |
| ------------------ | -------------- |
| Status             | NOT CONFIGURED |
| Project connected? | NO             |
| Production URL     | NONE YET       |

---

**Reminder:** per CLAUDE.md §4 and §12, a live Meta integration is never
required for P0. Every beat must have authored fallback dialogue regardless
of API status, and failures must degrade silently to that fallback without
blocking story progression.
