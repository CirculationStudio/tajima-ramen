# Claude Code prompt: port the approved v2 design into the Eleventy build

Run from the repo root. Work through the phases in order. **Stop at the end of each phase and report.** Do not run the whole thing in one pass.

---

## Context

The client approved a new homepage design. It exists as a standalone prototype at `_reference/tajima-home-v2.html`, built outside the repo for speed during a client review cycle. Your job is to bring that design into the Eleventy build and apply it to the pages that already exist.

**Read first, in this order:**
1. `DESIGN_SYSTEM.md` (just updated to v2, it documents what changed and why)
2. `_reference/tajima-home-v2.html` (the approved reference implementation)
3. `voice-tone.md`, `CLIENT_FACTS.md`, `SITE_ARCHITECTURE.md`, `ARCHITECTURE.md`

**The reference file is the source of truth for tokens and composition.** Where `DESIGN_SYSTEM.md` and the reference file disagree, the file wins and the doc gets corrected.

**Three previously signed decisions are reversed in v2.** `DESIGN_SYSTEM.md` explains each. Do not restore the old behavior: night mode is no longer permanent, a manual theme toggle now ships, light is the default, and there is now a small radius token set.

---

## Phase 1 — Tokens only

Port the `:root`, `[data-mode="day"]` and `[data-mode="night"]` blocks from the reference file into the repo's CSS layer. Copy the values exactly; do not retype from memory and do not "improve" any value.

Wire the theme mechanism: `data-mode` on `<html>`, default `day`, manual toggle only, persisted, no clock or `prefers-color-scheme` trigger.

Do not restyle any page yet.

**Report:** where the tokens now live, how theme state persists, and confirmation that a grep for hex codes outside the token blocks returns nothing.

---

## Phase 2 — Header, footer, base layout

Port the header (`hdr`), the neon monolith, and the footer into the base layout include, so every page picks them up.

Requirements:
- Two logo assets swapped by theme, no CSS filters. Paths are in `DESIGN_SYSTEM.md`.
- Nav: Menu, About, Locations, Noodle Room, plus one red Order Online CTA.
- Theme toggle is currently bound to the logo click. Keep that for now, and add a `TODO` comment referencing open item 2 in `DESIGN_SYSTEM.md`.
- Neon monolith sits directly above the footer.

**Report:** which template files changed, and that every existing page still builds.

---

## Phase 3 — Homepage

Rebuild the homepage template to match the reference file's composition exactly. Section order and rationale are in `DESIGN_SYSTEM.md` under "Page composition."

All copy comes from the reference file. Do not write new copy. The slogan string is exact: `Housemade noodles, crafted daily.`

Two things to preserve that are easy to lose in a port:
- The red locations field uses individually positioned icon elements, not a repeating SVG `<pattern>`. A `<pattern>` renders every tile identically, cannot animate per icon, and failed to span full width. Keep the individual-element approach.
- Type over video and photography keeps its scrims and text shadows. These are load-bearing for legibility, not decoration.

**Report:** a screenshot or description of each section, in both themes.

---

## Phase 4 — Interior pages, in batches

Apply the v2 system to the existing pages. **Do two pages, stop, and report before continuing.**

Suggested order: `/menu/`, `/about/`, then `/locations/`, `/tajima-convoy/`, then `/happy-hour/`, `/order-online/`.

For each page:
- Same header, footer, tokens, radius scale, spacing scale.
- Bento cells get `--radius` (6px). Full-bleed color fields stay sharp.
- No eyebrow labels above headings. Remove any that exist.
- Brush display type at 1.25rem or larger only. Anything smaller becomes body font. This will require changing existing dish captions and small labels on the menu page.
- Keep each page's existing content and internal links. This is a restyle, not a rewrite.

**`/noodle-room/` is excluded.** It runs its own editorial identity (Cormorant Garamond / DM Mono) as a deliberate sub-experience. Do not normalize it into the main system. Update only its header and footer so navigation stays consistent.

**Report after each batch of two.**

---

## Phase 5 — Sweep

- Grep for hex codes in CSS rules outside token blocks. Should be zero.
- Grep for em dashes across templates, content and code comments. Should be zero.
- Grep for banned filler from `DESIGN_SYSTEM.md`. Should be zero.
- Confirm one `h1` per page, no heading level skips.
- Confirm `prefers-reduced-motion` is honored on every animation.
- Confirm every content image has a descriptive `alt`.
- Run the project's build and lint. Fix what fails.

**Report:** results per check, and the list of files changed across all phases.

---

## Do not

- Do not touch `/noodle-room/`'s editorial identity.
- Do not introduce a third typeface. Two families ship.
- Do not apply negative letter-spacing to the brush display face.
- Do not remove text shadows from type over imagery.
- Do not restore eyebrow labels.
- Do not add glow in day mode.
- Do not use a CSS filter on the logo.
- Do not write new copy, and never fabricate a Sam quote.
- Do not deploy to production. Push to a branch and open a PR.
- Do not attempt all phases in one run without stopping to report.

## Known gaps, do not try to solve these

These are tracked as open items and need decisions or assets from outside the repo: Bright Sunshine Caps licensing, the documentary photo shoot, homepage word count, homepage schema, and publishing hours. If you touch a page where one is relevant, note it in your report rather than inventing a fix.
