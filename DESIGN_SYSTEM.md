# Design System

**Project:** Tajima Ramen
**Last updated:** 2026-07-15

## Brand Overview

Tajima is San Diego's craft Japanese ramen house, making its own noodles on Japanese-imported machines and simmering its own broth in its own commissary. The design system exists to make that legible without saying it.

The verbal lane is plainspoken craft specificity. The visual lane is process, hands, steam, wood, and ceramic, with red as a sharpened accent rather than the dominant field. Red is a flame inside the kitchen, not a billboard on the freeway.

**Direction approved (client, via Amanda):** hybrid. **Convoy Red** is the main brand voice and governs the home page and all primary templates. The **Bento grid** is the layout system applied to interior pages. **Night mode is permanent for this build.** The day-mode token set is retained in the cascade but is not user-switchable and is not a shipping surface. Do not build a theme toggle.

**The Noodle Room is a deliberate exception.** It runs its own editorial identity (Cormorant Garamond / DM Mono, single `:root`, no day/night system). It is a sub-experience inside the site, not a page in the main template family. Do not normalize it into Convoy Red.

**Reference implementations (approved, client-signed):**
- `tajima-home.html` (Convoy Red, canonical token source)
- `tajima-menu.html` (bento-in-Convoy pattern, interior page reference)
- `tajima-noodle-room.html` (editorial sub-experience)

Assets served from Bunny.net.

> ### Where the concepts actually are, corrected 2026-08-05
>
> This section previously said all three were **"Hosted at `cdn.circulationstudio.com/tajima-temp/design-concepts/`."** **That is true of two of them and false of the third.** Checked 2026-08-05 with a request per file:
>
> | Concept | CDN |
> |---|---|
> | `tajima-menu.html` | **200** |
> | `tajima-noodle-room.html` | **200** |
> | `tajima-home.html` | **404** |
> | `tajima-locations.html`, `tajima-convoy.html`, `tajima-about.html`, `happy-hour.html`, `order-online.html` | **404** (never listed here, but real, and ported from) |
>
> **`tajima-home.html` is the one that matters most and it is the one that is missing.** This doc names it the canonical token source, and eleven CSS files were ported from it. There are also five further signed concepts the build was ported from that this section never listed at all.
>
> All eight lived only in an untracked `inspo/` directory on one machine. **That directory was deleted on 2026-08-05** (`SITE_ARCHITECTURE.md` Open Decision #27) and the porting notes across the codebase were rewritten to name the concept without a path, since no path resolves for six of the eight.
>
> **The tokens themselves are not at risk.** `src/css/base/theme.css` is the live token set and is committed; it is now the operative source, not a port of one. What is gone is the visual record of how a component was originally drawn.
>
> **Action: re-upload the six missing concepts to the CDN path above, from the design source, and update this table.** Until then, treat this doc and the shipped CSS as the reference of record and do not expect to compare either against a concept file.

---

## Color Tokens

### Brand constants (from Tajima Brand Guidelines, October 2025)

| Token | Hex | Name | Usage |
|---|---|---|---|
| `--color-red` | `#E03C31` | Fire Red / Convoy Red | Logo, brand mark, key callouts, accent rules, single primary CTA per view. Accent, never a background field. |
| `--color-gold` | `#FFC658` | Sesame Gold | Rare accent. Per official guidelines, never more than 10% of any visual element. |
| `--color-cream` | `#FFFEF4` | Off-White | Warmer than pure white. Type on dark, chrome surfaces. |
| `--color-black` | `#000000` | Black | Reserved for the logo lockup and pure-black contexts. Not the page background. |

### System constants (never invert, never respond to theme)

These exist because anything overlaying a photograph or sitting inside a colored pill is chrome. Its color is determined by its function, not by the theme around it. This was the root cause of the invisible-pill bug in concept 01 and the rule is now structural.

```css
--color-system-cream:     #FFFEF4;
--color-system-cream-90:  rgba(255, 254, 244, 0.94);
--color-system-cream-70:  rgba(255, 254, 244, 0.82);
--color-system-ink:       #0D0D0A;
--color-system-ink-90:    rgba(13, 13, 10, 0.92);
--color-system-ink-70:    rgba(13, 13, 10, 0.70);
```

**Rule:** photo overlays, caption pills, location plate pills, and scrim text use `--color-system-*` exclusively. Never `--color-ink` or `--color-canvas` on a photo overlay.

### Convoy Red night surface ramp

```css
/* The live ramp. Operative source: src/css/base/theme.css, which is committed.
   Reproduced here for reading, not for pasting: if these two ever disagree,
   theme.css is right and this block is stale. */
--color-canvas:      #0a0a07;                      /* base page, warm near-black */
--color-canvas-2:    #111110;                      /* raised cards and bento cells */
--color-canvas-3:    #1a1a17;                      /* nested / inset surfaces */
--color-surface:     #1a1a17;
--color-surface-2:   #252522;
--color-ink:         #fffef4;                      /* primary type on canvas */
--color-ink-2:       rgba(255, 254, 244, 0.78);    /* secondary type */
--color-ink-3:       rgba(255, 254, 244, 0.55);    /* meta, captions */
--color-ink-4:       rgba(255, 254, 244, 0.32);    /* faintest, labels */
--color-rule:        rgba(255, 254, 244, 0.10);    /* 1px rules, cell borders */
--color-rule-strong: rgba(255, 254, 244, 0.22);
```

> ### Resolved 2026-08-05. This was a stale blocker, and it named a file that no longer exists.
>
> This block previously held **seven empty stubs** and an open item reading *"the tuned ramp ... live only in the approved `tajima-home.html`. Marco or Steve: open the file, copy the `:root` block, and replace this stub."*
>
> **It was already done.** `src/css/base/theme.css` says so in its own header: *"Values below are PASTED from that file's `:root` and theme blocks, not retyped from memory. This closes DESIGN_SYSTEM.md Open Items #1 and #3."* The build has shipped these values the whole time; only this document lagged.
>
> That lag became a live hazard on 2026-08-05, when `inspo/` was deleted: the instruction pointed at a file that is gone and is not on the CDN either (see the hosting correction above). Anyone following it would have hit a dead end on a blocker that was not actually blocking.
>
> **Same failure shape as the Convoy "Suite A" and Carnitas corrections:** a priority document left asserting something the build had already moved past. `theme.css` is the operative source for these values now. There is nothing left to paste.

### Rules

- Zero hex codes anywhere in CSS outside `:root`. This is verified by grep on every build and it currently passes on all three concept files. Any hex in a rule is a defect.
- `rgba()` inline is permitted only for transparency variations (backdrop blur, scrims, glow rings). Roughly 15 occurrences in the reference build, all intentional.
- No gradient as a brand device. Red does not fade into anything.

---

## Typography

**Production font system:** the 2025 Brand fonts (the "KPR font style"). Confirmed as production, not placeholder.

| Role | Family | Notes |
|---|---|---|
| Display | **Bright Sunshine Caps** | Always all-caps. Use is restricted (see below). |
| Body | **Calps Regular** | Clean legible sans. Default for all body copy and UI. |
| Web body alt | Acumin Variable Concept Regular | Per guidelines' Use of Type page. |
| Noodle Room display | **Cormorant Garamond** | Sub-experience only. Never in the main template family. |
| Noodle Room mono | **DM Mono** | Sub-experience only. Labels, specs, captions. |

**Bright Sunshine Caps restriction.** It reads streetwear, not craft. Reserved for pull quotes, merch, and limited-time promotional moments. It is **not** standard headline typography and must not be the default `h1`/`h2` on craft-led storytelling pages. When in doubt, do not use it.

```css
--font-display:   'Bright Sunshine Caps', /* fallback stack per file */;
--font-body:      'Calps', /* fallback stack per file */;
/* Noodle Room only */
--font-editorial: 'Cormorant Garamond', 'Hoefler Text', Georgia, 'Times New Roman', serif;
--font-mono:      'DM Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
```

### Weights

Declared by name, never as `bold` or `lighter`.

```css
--weight-regular:  400;
--weight-medium:   500;
--weight-semibold: 600;
--weight-bold:     700;
```

Every family ships an explicit fallback stack. No implicit fallbacks, no thin stacks.

---

## Spacing

8px baseline grid. Every padding, gap, and margin references the scale. No `0.95rem`, no `1.3rem`, no `2.4rem`.

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  24px;
--space-6:  32px;
--space-7:  40px;
--space-8:  48px;
--space-9:  64px;
--space-10: 80px;
--space-11: 96px;
```

Radius, shadow, and motion values are tokenized on the same principle. Pull the exact values from the reference `:root`.

Gutters use explicit clamp-based values plus body-level safety padding. This was a corrected production defect (left-side padding collapse) and the fix is now part of the system, not a patch.

---

## Components

Strict BEM. Blocks in the reference build: `site-header`, `bento`, `cell`, `hero`, `menu`, `story`, `locations`, `tagline`, `site-footer`. Elements use `__`, modifiers use `--` (`cell--pad-md`, `menu__dish--wide`, `eyebrow--red`).

### Heroes
Full-bleed process imagery or video. One `h1`. One primary CTA. The hero image is a noodle being lifted or a hand in the work, never a billboard shout. Hero copy comes from the approved slogan set (see `voice-tone.md`); do not write new hero lines at build time.

### Cards (bento cells)
`cell` block with padding modifiers on the 8px scale. Cells carry a hairline border, not a drop shadow. Caption pills inside cells use system-constant tokens, never theme tokens. `<article>` for content cells, `<figure>` + `<figcaption>` for image cells.

### CTAs
One red CTA per viewport. Red on a CTA is the accent budget spent, so the surrounding view stays neutral. Secondary actions are hairline-outlined, never a second red.

### Forms
No booking or reservation forms. Tajima is walk-in only across all locations (Mercury takes group reservations by phone). Form patterns are limited to online-ordering handoff and contact. Visible labels, visible focus, no placeholder-as-label.

---

## Forbidden Patterns (Anti-Slop Standard)

Mirrored verbatim into `.claude/CLAUDE.md`.

### Banned defaults

- **NO** Inter font. The brand fonts are named above.
- **NO** generic purple-to-blue AI gradients. No brand gradients at all.
- **NO** default stock icons without customization.
- **NO** em dashes anywhere. Site, content, docs, code comments. Use commas, periods, parentheses. Hard rule.
- **NO** AI-generated imagery posing as real photography. This brand's entire claim is that the work is real. Faking the proof kills the positioning.
- **NO** theme toggle. Night mode is permanent.
- **NO** hex codes in CSS rules outside `:root`.

### Banned filler phrases

Generic:
- "Unlock your potential"
- "Leverage our expertise"
- "Cutting-edge solutions"
- "Seamless experience"
- "Game-changing"

Brand-specific (from the Client DNA and Brand Positioning):
- elevated
- curated
- immersive
- culinary journey
- authentic (as a claim; show it instead)
- passion / passionate about
- dive into
- crafted with love
- truly / truly authentic
- a feast for the senses
- our story began
- Retired 2025 voice: "All Slurps Welcome," "Come Get Some Slizzurp," "I'm Late for Ramen"

### Banned content patterns

- **No fusion framing.** Tajima is a Japanese ramen house, not Japanese-Mexican or Japanese-Californian. **Carnitas Ramen does not appear on this site**, in copy, photography, or menu hero content. It stays on the printed menu only.
- **No copy that implies the previous product was inferior.** The story is what we built, not what we fixed.
- **No North Park.** Permanently closed. Six San Diego locations, plus Tijuana and Maui.
- **No sushi in the brand voice.** Mercury and Maui only, handled location-specifically.
- Do not surface the 2020 "not too authentic" quote, the cancelled 2024–2025 acquisition, or the 1994 date discrepancy.

### Banned visual patterns

- Glossy studio bowl shots with no environmental context
- High-saturation neon kitchen or restaurant interiors
- Graffiti or hand-lettered overlays on photographs
- "Stylish young people laughing at a table" stock energy
- Oversaturated reds that crush ingredient detail
- Cold blue or cool-toned lighting
- Generic bowl-on-dark-background-with-chopsticks stock shots

### Brand choices (what replaces the defaults)

- **Chosen fonts:** Calps (body), Bright Sunshine Caps (restricted display), Cormorant Garamond + DM Mono (Noodle Room only)
- **Chosen palette:** Convoy Red night. Warm near-black canvas, cream type, Fire Red `#E03C31` as accent, Sesame Gold `#FFC658` under 10%
- **Custom iconography:** minimal. Prefer photography and typography over icons. Any icon is custom-drawn to the brand line weight, never a stock set dropped in
- **Brand voice principles:** see `voice-tone.md`. Show the work. Name things. Stay short. No Japanese poetry. Sound like a person, not a brand

---

## Logo Rules

Non-negotiable equity: the red circle, the kanji 但馬, the flame motif, the wordmark.

**Do:** resize proportionately, maintain the clear space rule (50% of logo height and width on all sides), use the correct color version for the background, use the Primary Logo wherever possible.

**Don't:** alter colors, lock up additional text, alter the shape, add elements or shadows, place in a holding shape, outline, rotate, or change the relationship of the components.

Logo images are theme-independent in this build (night mode is permanent), so the dark-surface version is the only one that ships. Do not wire theme-conditional logo swaps.

---

## Accessibility Standards

WCAG 2.1 AA minimum.

- Color contrast: 4.5:1 normal text, 3:1 large text. Verify Fire Red against the night canvas before using it as type; it is safest as a rule, mark, or fill rather than body copy.
- Color never the only carrier of information.
- Visible `:focus-visible` ring on every interactive element.
- `prefers-reduced-motion` honored on every animation.
- Semantic HTML5 throughout: `<header>`, `<main>`, `<nav>`, `<section>`, `<article>`, `<figure>` + `<figcaption>`, `<address>`, `<blockquote>`, `<footer>`. No `<div class="cell">` scaffolding.
- Every image gets a descriptive `alt`. Zero empty alts on content imagery.
- `aria-label` / `aria-labelledby` on landmarks. Clean h1 to h2 to h3 hierarchy, no skips.

---

## Design Approval Gate

Before any code is written:

- [x] Ana (Visual Media Manager) approves creative direction
- [x] Steve (founder) approves design direction
- [x] Client provides written sign-off on mockups (Amanda, hybrid direction: Convoy Red main voice, bento on interior pages, night mode permanent)
- [x] Design passes the Anti-Slop Gate (distinctiveness check)

---

## Open Items

1. **Paste the Convoy Red `:root` ramp** from `tajima-home.html` into the Color Tokens section. Blocking for any new template work.
2. **Confirm the Bright Sunshine Caps and Calps fallback stacks** as written in the reference file, and confirm licensing covers web embedding.
3. **Confirm radius, shadow, and motion token values** against the reference `:root`.
4. **Photography does not exist yet.** The documentary Noodle Room and commissary shoot is the asset every page depends on. Until it lands, no page ships with placeholder or AI imagery.
