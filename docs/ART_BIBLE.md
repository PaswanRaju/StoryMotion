# ART_BIBLE

Single source of truth for StoryMotion's visual style. Copy relevant sections
into every art-generation prompt. Sourced from CLAUDE.md §6 and §10 — if this
file and CLAUDE.md ever disagree, CLAUDE.md wins; update this file to match.

## Look and feel

Magical, playful, calming 2D illustrated picture book. Whimsical hand-painted
/ watercolor-inspired style, flat clean readable shapes with soft painted
texture, gentle bright pastels, friendly rounded characters, charming
fairytale forests and cottages, consistent medium-weight edges, soft
lighting, little clutter. **Not** an arcade platformer, not photorealistic,
not horror, not an Episode-style dialogue app.

## Palette

| Name | Hex | Use |
|---|---|---|
| Cream | `#F7F1DF` | Background |
| Sage | `#A9D7A0` | Accent / nature |
| Honey | `#F5BF72` | Primary action / warmth |
| Sky | `#93C8E8` | Secondary action / sky, water |
| Cocoa | `#624A3A` | Text / grounding tone |

Darker accessible variants for text/interactive contrast are defined in
`src/styles/tokens.css` (`--color-*-dark`).

## Typography

Fredoka for headings, Nunito for body/content, both via Google Fonts with
system fallbacks. **Never** draw UI copy inside generated story images —
subtitles and buttons are always real React/CSS, rendered on top.

## Composition rules for generated art

- Side-on or three-quarter side view, appropriate for 2D sprite compositing.
- No text, no letters, no logos, no watermarks, no HUD/buttons baked into images.
- Leave comfortable space near the bottom of backgrounds for subtitles added in code.
- Backgrounds: no playable characters baked in (characters are separate cutouts).
- Characters: full body, transparent background, facing right (code flips for left-facing).
- Consistent camera angle, palette, time of day and ground baseline within
  each story world, except at an intentional scene transition.

## Global art bible prompt (prefix for every generation)

> Create polished 2D artwork for a children's interactive storybook game for
> ages 5–10. Whimsical hand-painted/watercolor-inspired illustrated style,
> flat clean readable shapes with soft painted texture, gentle bright
> pastels (cream, sage green, honey gold, sky blue, warm cocoa brown),
> friendly rounded characters, charming fairytale forests and cottages,
> consistent medium-weight edges, soft lighting, little clutter, side-on or
> three-quarter side view appropriate for 2D animated sprite compositing.
> Keep a consistent visual style across an entire three-story game. No text,
> no letters, no logos, no watermarks, no application buttons or HUD. Leave
> comfortable space near the bottom of background art for subtitles which
> will be added in code.

## Per-asset prompts

See `CLAUDE.md` §10.3 (Batch A), §10.4 (Batch B), §10.5 (Batch C), §10.6
(Batch D props) for the complete, ready-to-paste prompt list per file. Do not
duplicate them here — this file points to the single source of truth so the
two never drift out of sync.

## Consistency workaround (if a generator can't hold a character steady across poses)

Use a single approved idle cutout and animate it with PixiJS transforms
(translate, pivot, tilt, squash/stretch, bounce) rather than chasing
frame-perfect multi-pose generations. Three pigs may share a base sprite with
simple recolors/accessories if visually distinct and honestly labeled (not
disguised as fully separate character art).

## Provenance discipline

Every integrated asset must be logged in `docs/ASSET_MANIFEST.md` with its
actual generator/tool and prompt. Never label non-Meta-generated art as Meta
Muse Image output, and never claim an asset is "final curated art" if it is
actually a placeholder.
