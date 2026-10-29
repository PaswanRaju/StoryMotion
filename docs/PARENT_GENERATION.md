# Parent story generation

Open **Grown-up settings** by continuously holding the button (pointer, Space,
or Enter) for three seconds, then choose **Generate a story**. The studio at
`/parent/create` also has its own gate, so a direct URL does not expose the form.
Choose only a registered hero/setting, lesson, age, length and optional quiz.
There are no fields for names, locations, recordings or personal details.
Preview a result, then save it to the local **My Stories** shelf.

## Server setup

Set server environment variables in Vercel and `.env.local` for local Vercel
execution. Never prefix secrets with `VITE_` and never commit `.env.local`.

| Variable                      | Purpose                                                             |
| ----------------------------- | ------------------------------------------------------------------- |
| `OPENAI_API_KEY`              | Server-only generation/moderation credential                        |
| `STORY_SIGNING_SECRET`        | Optional secret for approved-source tokens; defaults to the API key |
| `STORY_MODEL`                 | Structured-output model; default `gpt-4o-mini`                      |
| `RATE_LIMIT_REDIS_REST_URL`   | Upstash-compatible Redis REST URL                                   |
| `RATE_LIMIT_REDIS_REST_TOKEN` | Redis REST credential                                               |
| `RATE_LIMIT_SALT`             | Random server secret used when hashing quota keys                   |

Use `npx vercel dev` to run the Vercel function and frontend together. The first
run may ask you to link a Vercel project. `npm run dev` runs the Vite frontend
only; built-in stories, editor, local library and gesture recorder work there,
but generation requires the serverless endpoint. No deployment is needed for
local testing. `npm run preview` serves the production client, not API functions.

`api/generate-story.ts` accepts POST and validates a strict dropdown-only
request. The endpoint rejects unknown fields, including landmarks, audio, names
and arbitrary text. It uses `StoryProvider` from `generation/service.ts`; the
OpenAI adapter lives only under `api/`. Substitute another adapter implementing
`generate` and `isSafe` to change providers without changing the player.

The provider requests strict structured draft JSON. The service checks plot
stages and 3–5 interactions, compiles the draft into the engine's Zod story
schema, validates all ids/routes, and moderates the entire generated story.
Invalid or flagged attempts receive validation feedback and are retried at most
twice (three generation attempts total). No rejected content is returned. A
missing key, model refusal, moderation failure or exhausted retry budget produces
a friendly error; built-in stories remain available.

No camera data, landmarks, audio, imported/editor-authored text or personal
information is sent to the endpoint/provider. The request contains only enums,
a random plot seed, language and the quiz toggle. Reading-age changes also carry an opaque, server-signed copy of a previously approved story and its recipe; edited/imported text cannot forge that token. API responses use `no-store`;
provider requests use `store: false`. There is no account or server story database.
Quotas retain only a salted hash of the platform-supplied IP for ten minutes.

Production requires shared Redis rate limiting and fails closed if it is not
configured/available. Development has a bounded process-local limiter. The
quota is five requests per ten minutes per hashed address; retries count within
one request. The parent hold gate prevents accidental child access; it is not
an authentication system. Configure provider spending limits and hosting controls
for a public endpoint.

## Local stories, reading age and questions

IndexedDB holds saved story JSON, the non-personal recipe and completion stickers.
The shelf and saved player work offline after the app is cached. Storage errors
are reported without blocking previews; deleting browser site data deletes saves.
No generated story is saved automatically.

Saved generated stories have **Change reading age** behind a parent gate. The
server verifies the saved opaque source token and locks all original selections
except age. It prompts a rewrite of the approved original and checks that scene
order/ids and interaction ids/gestures are preserved. It then validates and
moderates the rewrite again. No server story storage is needed. A new age-specific
id preserves the original version. Model phrasing can vary; preview the adapted
story. Rotating the signing/API key invalidates old adaptation tokens without
preventing local playback of saved stories.

Optional questions have two choices and a correct answer. The ending presents
them without a score or failure message. Use left/right hand raises for A/B,
buttons or keyboard. A ten-second timeout supplies a warm reminder and continues.

## Costs and checks

A request can produce up to three model outputs (10,000 output tokens per attempt)
plus moderation calls. Medium stories, retries, longer prompts and regeneration
increase use. Watch provider input/output token usage, hosting execution time and
Redis requests. No paid provider calls are made by unit tests or this implementation
session. Verify current prices and model access in your own account:
[OpenAI API pricing](https://developers.openai.com/api/docs/pricing),
[structured output documentation](https://developers.openai.com/api/docs/guides/structured-outputs),
[moderation documentation](https://developers.openai.com/api/docs/guides/moderation).

Tests mock the provider and cover valid results, validation feedback, moderation
rejection, retries, forbidden request fields, rate limits and missing keys. Real
provider/account integration still needs a configured key and an explicit test
from the parent studio. Review generated content before sharing it with children.
