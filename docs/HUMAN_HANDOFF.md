# HUMAN_HANDOFF

Tracks every external resource request to the human teammate. Status values:
`REQUESTED`, `SUPPLIED`, `VERIFIED`, `SKIPPED`.

| ID | What | Status | Notes |
|---|---|---|---|
| EVENT-01 | Confirm hacking period has started | VERIFIED | Human confirmed 2026-10-24 — proceeding with Phase 00/01. |
| ART-01 | Batch A essential art (7 images, see CLAUDE.md §10.3) | REQUESTED | Not yet needed to unblock Phase 02 (placeholders/CSS suffice); will prompt again at Phase 02–04 per protocol below. |
| ART-02 | Batch B backgrounds (beanstalk, pigs, remaining hare) | REQUESTED | Due at Phase 05–06. |
| ART-03 | Batch C character cutouts + poses | REQUESTED | Due at Phase 06–07. |
| META-01 | Meta Model API access/billing confirmation, `MODEL_API_KEY` | REQUESTED | Due at Phase 07. Not needed before then — P0 does not depend on it. |
| CAMERA-01 | Physical webcam detector testing | REQUESTED | Due at Phase 05 onward. |
| AUDIO-01 | Licensed SFX or approval of procedural Web Audio sounds | REQUESTED | Optional, Phase 08. |
| DEPLOY-01 | Vercel project/account approval, secret provisioning, public deploy | REQUESTED | Due at Phase 09. Hard pause per CLAUDE.md §4 — will not deploy publicly without explicit approval. |
| DEMO-01 | Approve final 90-second demo path | REQUESTED | Due at Phase 09. |

## 🧑 HUMAN ACTION REQUIRED — ART-01 (soft gate — not blocking)

**WHY:** Batch A is the minimum viable polished art (hare world backgrounds +
tortoise/hare character cutouts + home hero). Not critical yet — Phase 02
builds real screens with CSS/placeholder art first. Useful to have ready by
Phase 04 (first complete playable story).

**ACTION:**
1. Go to an image generator you're authorized to use (e.g. Meta Muse Image at
   https://dev.meta.ai/ if your account has access, otherwise another
   permitted tool).
2. Generate the 7 images using the exact prompts in `CLAUDE.md` §10.3
   (prefixed with the global art bible prompt in §10.1).
3. Save the raw output files into `incoming_assets/` (any name is fine — I'll
   map and convert them).

**SOURCE/URL:** https://dev.meta.ai/ (Muse Image) or another licensed source you choose.

**GENERATE WITH PROMPT:** See `CLAUDE.md` §10.1 (prefix) + §10.3 (the 7 specific prompts).

**SAVE AS:** Drop originals in `incoming_assets/`; I will convert/crop/rename
to the canonical paths listed in §10.2–10.3 (e.g.
`public/assets/hare/backgrounds/start.webp`).

**SPEC:** Backgrounds 16:9 (ideal 1920×1080); character cutouts transparent
PNG, 512–1024px tall, full body, facing right.

**SEND/REPORT BACK:** Tell me which files you dropped and which tool/model
generated them (for provenance logging in `docs/ASSET_MANIFEST.md`).

**CAN CLAUDE CONTINUE?:** YES — using CSS/SVG placeholders and procedural art
until this is supplied. Not blocking Phase 02.

## 🧑 HUMAN ACTION REQUIRED — META-01 (not due yet, flagged early per protocol)

**WHY:** Needed only for P1 (Meta Spark dialogue, Muse Image generation).
P0 ships fully without it using authored fallback dialogue. Flagging now so
you can check account access while Claude builds Phases 02–06.

**ACTION:**
1. Visit https://dev.meta.ai/ and confirm your account/region has Model API
   access, and check current pricing/quota.
2. If you proceed, create a project/API key per the official portal's current
   instructions.
3. **Do not paste the key into chat, Git, screenshots, or CLAUDE.md.** Put it
   only in your local `.env` (see `.env.example` — already in `.gitignore`)
   and later in Vercel's project environment settings.
4. Report back only: success/failure, the accessible model ID, any HTTP
   status/error codes, and quota limits — never the key itself.

**SOURCE/URL:** https://dev.meta.ai/docs/overview and https://dev.meta.ai/docs/models

**SAVE AS:** `.env` (local only, gitignored) — key `MODEL_API_KEY`.

**SEND/REPORT BACK:** Account status (enabled/not enabled/region-restricted),
model ID if accessible, error text if not.

**CAN CLAUDE CONTINUE?:** YES — P0 phases (00–06, 08–09 minus live Meta calls)
do not depend on this at all.

## 🧑 HUMAN ACTION REQUIRED — CAMERA-01 (not due yet, flagged early)

**WHY:** Real webcam detector calibration (squat/reach/march/jump/balance)
can only be verified on real hardware with a real body in frame — I cannot
simulate this truthfully.

**ACTION:** Will send detailed step-by-step instructions when Phase 05 is
reached (pose detectors must exist first). No action needed from you now.

**CAN CLAUDE CONTINUE?:** YES — Phases 00–04 build the full manual/simulated
movement mode first, which is the P0 fallback and primary dev path anyway.

## 🧑 HUMAN ACTION REQUIRED — DEPLOY-01 (not due yet, flagged early)

**WHY:** Public deployment, billing, and account connection are irreversible/
external actions requiring your explicit approval per CLAUDE.md §4 and the
hard-pause rules in §0.

**ACTION:** Will ask for your Vercel account/project preference at Phase 09,
right before deploy — not before.

**CAN CLAUDE CONTINUE?:** YES — all phases before 09 only need local dev/build/test.
