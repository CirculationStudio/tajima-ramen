# Design System

**Project:** Tajima Ramen
**Last updated:** 2026-08-26
**Status:** v2. Supersedes the 2026-07-15 version. Client-approved via Andy, August 2026.

## What changed in v2, and why

The July build was reviewed by the client and came back with one note: *"simpler, less crowded, clean look. We also feel there are repetitive information across the website."* They later pointed at the October 2025 Brand Guidelines and asked us to follow those more closely.

Three decisions in the previous version are **reversed** here. They were correctly signed off at the time; the client changed direction. Do not restore the old behavior:

| v1 rule | v2 rule |
|---|---|
| Night mode permanent, no theme toggle | **Light and dark both ship.** Manual toggle, no clock or system trigger. **Light is the default.** |
| Dark-surface logo is the only asset that ships | **Two logo assets, one per theme.** No CSS filters on the logo, ever. |
| Sharp corners throughout | **Small radius token set.** 3px controls, 6px cards, 8px media. Full-bleed fields stay sharp. |

The reference implementation is `_reference/tajima-home-v2.html`. When this document and that file disagree, **the file wins** and this document gets corrected.

---

## Color Tokens

### Brand constants (October 2025 Brand Guidelines)

| Token | Hex | Name | Usage |
|---|---|---|---|
| `--color-red` | `#E03C31` | Fire Red / Convoy Red | Logo, CTA fills, the locations field. |
| `--color-red-deep` | `#B5261C` | Fire Red deep | CTA hover only. |
| `--color-gold` | `#FFC658` | Sesame Gold | Rules, marks, small fills. Never more than 10% of a view. |
| `--color-cream` | `#FFFEF4` | Off-White | Light canvas, type on dark. |
| `--color-black` | `#000000` | Black | Logo lockup and pure-black contexts only. |

### Theme ramps

Paste these exactly. Both blocks are live in the reference file.

```css
:root{
  --color-red:#E03C31; --color-red-deep:#B5261C; --color-gold:#FFC658;
  --color-cream:#FFFEF4; --color-black:#000000;
}
[data-mode="day"]{               /* DEFAULT */
  --canvas:#FFFEF4; --canvas-2:#F7F4E9; --surface:#FFFFFF;
  --ink:#141210; --ink-2:rgba(20,18,16,.74); --ink-3:rgba(20,18,16,.5);
  --accent:#D8352A; --rule:rgba(20,18,16,.14); --rule-2:rgba(20,18,16,.26);
  --header-bg:rgba(255,254,244,.96);
  --gold-ink:#8A6410;
  --glow-red:none; --glow-text:none; --glow-gold:none;
}
[data-mode="night"]{
  --canvas:#0B0A0C; --canvas-2:#131114; --surface:#17151A;
  --ink:#FFFEF4; --ink-2:rgba(255,254,244,.76); --ink-3:rgba(255,254,244,.5);
  --accent:#FF4D40; --rule:rgba(255,254,244,.14); --rule-2:rgba(255,254,244,.28);
  --header-bg:rgba(11,10,12,.86);
  --gold-ink:#FFD25E;
  --glow-red:0 0 12px rgba(255,77,64,.5), 0 0 38px rgba(255,77,64,.28), 0 0 78px rgba(255,77,64,.14);
  --glow-text:0 0 8px rgba(255,77,64,.5), 0 0 24px rgba(255,77,64,.3);
  --glow-gold:0 0 10px rgba(255,210,94,.4), 0 0 28px rgba(255,210,94,.2);
}
```

### Two rules that are easy to get wrong

**Accent red differs per theme.** `#D8352A` on cream (4.71:1 with white, passes AA). `#FF4D40` on near-black. True Fire Red `#E03C31` with white text is 4.32:1 and fails, so it is a fill color, not a text-on-red color at body sizes.

**Gold is two values.** `#FFC658` is nearly invisible as type on cream (about 1.4:1). `--gold-ink` handles type: dark gold on light, bright gold on dark. True Sesame Gold stays for rules, marks and fills in both themes.

**Glow is a night-only device.** Every glow token resolves to `none` in day mode. Never hardcode a glow; always read the token, or light mode will show what looks like a rendering bug.

### Rules

- Zero hex codes in CSS rules outside the token blocks. Verified by grep on every build.
- `rgba()` inline is permitted for scrims, overlays and glows only.
- No gradients as a brand device. The one exception is the gold hairline rule (`transparent → gold → transparent`) and photo scrims.

---

## Radius

New in v2. Small values only. 10px and above reads as a SaaS dashboard and was rejected in review.

```css
--radius-sm:3px;   /* buttons, toggles, small controls */
--radius:6px;      /* cards, bento cells, photo tiles */
--radius-lg:8px;   /* large feature media */
```

**Full-bleed color fields, the header, and the hero never get a radius.** Rounding the corner of a color field is what makes a page look templated.

---

## Typography

| Role | Family | Notes |
|---|---|---|
| Display | **Bright Sunshine Caps** | Always all-caps. Brush face. |
| Body / UI | **Calps Regular** | All body copy, nav, buttons, captions, labels. |

Fallback stacks as written in the reference file:

```css
--font-display:'Bright Sunshine Caps','Bebas Neue',Impact,sans-serif;
--font-body:'Calps','Barlow',-apple-system,BlinkMacSystemFont,sans-serif;
--font-ui:'Calps','Barlow',sans-serif;
```

**Bright Sunshine Caps is display-only, and there is a hard size floor.** It is a brush face: below roughly `1.25rem` it stops being legible, especially over photography. Dish names, location names, section headings and the wordmark: yes. Prices, captions, nav, buttons, body: never. This was a real defect caught in review, not a preference.

**No third typeface.** A geometric sans was proposed for nav and buttons during review and rejected. Two families ship.

**No negative letter-spacing on display type.** Brush glyphs collide. Tracking tokens are positive only.

**Faux-bold for emphasis.** Bright Sunshine Caps ships one weight. Where emphasis is needed, use `-webkit-text-stroke:.022em currentColor` with `paint-order:stroke fill`. Never `font-weight:bold` on the display face.

### Type over photography

Display type over video or photos needs both a scrim and a shadow. Stripping shadows was proposed in review and rejected: it broke legibility on the hero and statement sections. Keep `text-shadow:0 2px 16px rgba(0,0,0,.7)` or heavier on any type over an image.

---

## Spacing

8px baseline grid.

```css
--space-1:.25rem;  --space-2:.5rem;   --space-3:.75rem;  --space-4:1rem;
--space-5:1.5rem;  --space-6:2rem;    --space-7:2.5rem;  --space-8:3rem;
--space-9:4rem;    --space-10:5rem;   --space-11:6rem;   --space-12:11rem;
```

`--space-12` is intentionally large. It is the gap between major sections and it is what makes the page read as calm.

Gutter: `--gutter:clamp(1.25rem,4vw,3rem)`. Max width: `--layout-max:82rem`.

---

## Page composition

The approved homepage order, and the reason for it:

1. **Hero.** Full-bleed video, logo lockup centered, slogan beneath. Composition follows Brand Guidelines page 19. No nav overlay, no stat bar, nothing else in frame.
2. **Intro.** Two columns, copy left, photo right in a gold offset frame.
3. **Three pillars.** Cards, icons from the brand icon family.
4. **Statement.** Full-bleed photo, display-scale slogan, one CTA.
5. **Bowls.** Three photo tiles. The house trio is Red, Black, White. Exactly three.
6. **Locations.** Full-bleed red field with the icon pattern.
7. **Neon monolith + footer.**

**Alternate the weight.** Never put two full-bleed heavyweight sections next to each other. A photo section butting directly into a color field was rejected in review as looking amateurish, and the fix was structural, a calm canvas section between them, not a gradient fade.

**No gradient fades between sections.** A dark photo fading into cream reads as fog. Hard edges between a photo and a solid field are correct.

---

## Components

Strict BEM. Blocks: `hdr`, `hero`, `sect`, `card`, `bowl`, `stmt`, `red`, `neon`, `ftr`, `tgl`.

### Header
Sticky, `--header-bg`, backdrop blur, one hairline bottom border. Contains: logo, four nav links, one red Order Online CTA. The logo links home. **The theme toggle lives in the footer**, next to the colophon, as the `tgl` block. It was bound to the logo click in the reference file; that was a prototype affordance and it is resolved.

### Logo
Two assets, swapped by theme, no filters:
- dark surfaces: `Tajima Logo red logo white text.png`
- light surfaces: `tajima brand assets_digital_RGB-07.png`

Never recolor the logo with CSS. A filter-based fake was shipped in an earlier draft and turned the mark pink.

### CTAs
One red CTA per viewport. The header CTA is red, so any CTA in view alongside it is hairline-outlined or cream. Red on the red field is invisible; use `--color-cream`.

### The red locations field
The one place red is a background rather than an accent. Cream icon pattern behind at 9-11% opacity, neutral dark wash over it so type stays readable, gold accents, cream CTA. Icons are individually positioned elements, not a repeating `<pattern>`, so each can animate independently and the field always covers full width.

### Icon family
32 SVGs traced from the October 2025 guidelines sheet, in `src/_includes/icons/`. Inline them so `currentColor` works; never `<img>`. Large and cropping off the edge reads as brand; small and scattered reads as confetti.

---

## Forbidden Patterns

### Banned defaults
- **NO** Inter, and no third typeface of any kind.
- **NO** gradients as a brand device.
- **NO** em dashes anywhere. Site, content, docs, code comments.
- **NO** AI-generated imagery posing as real photography.
- **NO** hex codes in CSS rules outside the token blocks.
- **NO** eyebrow labels above headings. A small uppercase kicker with a dash rule above every headline was removed in review as the single most templated element on the page. Headlines carry themselves.
- **NO** glow in day mode.
- **NO** brush display type below 1.25rem.

### Banned filler
elevated • curated • immersive • culinary journey • authentic (as a claim) • passion / passionate about • dive into • crafted with love • truly • a feast for the senses • our story began • memorable dining experience • guaranteed to keep you coming back • perfectly paired
Retired 2025 voice: "All Slurps Welcome," "Come Get Some Slizzurp," "I'm Late for Ramen"

### Banned content
- **No fusion framing.** Never Japanese-Mexican, Japanese-Californian, or Baja anything, in any copy or image.
- **Carnitas Ramen: listed, never featured.** The rule from Brand Positioning is that it stays on the printed menu, is kept out of marketing photography, social storytelling and website hero content, and phases out naturally. So it appears on `/menu/` as a plain line with `feature: false`, no photo, no callout, no hero, and it appears nowhere else on the site. This line previously read as an outright ban, which was wrong: Open Decision #4 resolved on 2026-08-04 that the dish is active at all seven locations per the live Toast menus. See `menu.json` `_carnitasNote`.
- **No North Park.** Permanently closed.
- **No sushi in the brand voice.** Mercury and Maui only, handled location-specifically.
- **No copy implying the previous product was inferior.**
- Do not surface the 2020 "not too authentic" quote, the cancelled 2024-2025 acquisition, or the 1994 date discrepancy.
- **No fabricated Sam quotes.** No Sam attribution of any kind until the founder interview is recorded.

### Banned visual
Glossy studio bowl shots with no context • neon-saturated interiors • graffiti overlays on photos • stock "young people laughing" energy • oversaturated reds that crush detail • cool-toned lighting • bowl-on-dark-background-with-chopsticks stock

---

## Copy constants

- Slogan, exact string: **`Housemade noodles, crafted daily.`** One word, no hyphen. This is a deliberate exception to the `house-made` spelling in `voice-tone.md`; do not "correct" other instances to match.
- Hero slogan set and all display lines come from `voice-tone.md`. Do not write new hero copy at build time.
- The house trio is Red, Black, White. Three bowls. Spicy Sesame is not part of the trio.
- **No simmer time. No number of hours, ever.** `CLIENT_FACTS.md` confirms only that broth is simmered every morning in the Crown Point commissary and driven to the San Diego locations. It gives no duration. "12h Tonkotsu" was cut from the footer spec strip once (see `site.json` `_specNote`) and "simmered twelve hours" was cut from the homepage trio card again in the v2 port; the figure has no source and keeps reappearing. Do not publish one until someone gets it from Sam.
- **The noodle cadence is unconfirmed.** "crafted daily", "cut daily", "cut that morning". `CLIENT_FACTS.md` confirms the daily cadence for the *broth*, not the noodles. These ship pending a client answer; see the flagged list in `site.json` `_sloganNote`. One answer resolves all of them.

---

## Accessibility

WCAG 2.1 AA.

- 4.5:1 normal text, 3:1 large. Verify accent red per theme; see the note above.
- Gold is never body text on cream.
- Visible `:focus-visible` on every interactive element.
- `prefers-reduced-motion` honored on every animation, including the drifting icon field.
- Semantic HTML5. One `h1` per page. No heading level skips.
- Every content image gets a descriptive `alt`.
- Theme toggle is a real `<button>` with `aria-pressed`.

---

## Open Items

1. **Bright Sunshine Caps licensing.** Still unresolved, and now load-bearing: hero slogan, all section headings, dish names, location names, the neon wordmark. Confirm the Demo file clears for commercial web embedding before launch. This is the largest single risk in the build.
2. ~~**Move the theme toggle off the logo** before launch.~~ **CLOSED.** The toggle is the `tgl` block in the footer, beside the colophon; the logo links home. It is a real `<button>` with `aria-pressed`, ships `hidden` and is revealed by `js/theme.js`, so it is absent from the accessibility tree when it would not work. Its visible label is its accessible name.
3. **Documentary photography.** Current imagery is GBP and menu photography. The Noodle Room and commissary shoot is still the asset every page depends on.
4. **Homepage word count.** Approximately **250 words** as built, against a **700+** target for the ranking goals in `AEO.md`. The gap widened rather than closed: the reference file's `craft` and `feed` sections, which carried most of the missing copy, were rejected in review and are not built. **Close it with copy inside the seven existing sections, never by adding a section back.** Nothing may be padded in to hit the number; the copy has to earn its place under `voice-tone.md` and trace to `CLIENT_FACTS.md` like everything else.
5. ~~**No schema on the homepage yet.**~~ **CLOSED.** `src/_data/schema.js:428` defines the `home` graph and the built page emits it: `Organization`, `Person` (Sam), `WebSite`, `ItemList` of locations, which is exactly what the `/` brief in `SITE_ARCHITECTURE.md` specifies. No `Restaurant` on this page, as required.
6. **No hours or phone anywhere on the homepage.** Top UX gap. Hours still need confirmation from a primary source before publishing.
