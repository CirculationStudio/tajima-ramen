# Design System

**Project:** Tajima Ramen
**Last updated:** 2026-08-26
**Status:** v2. Supersedes the 2026-07-15 version. Client-approved via Andy, August 2026.

## What changed in v2, and why

The July build was reviewed by the client and came back with one note: *"simpler, less crowded, clean look. We also feel there are repetitive information across the website."* They later pointed at the October 2025 Brand Guidelines and asked us to follow those more closely.

Three decisions in the previous version are **reversed** here. They were correctly signed off at the time; the client changed direction. Do not restore the old behavior:

| v1 rule | v2 rule |
|---|---|
| Night mode permanent, no theme toggle | **Light and dark both ship.** Clock-driven in the restaurant's timezone, with a manual toggle that overrides it permanently. **Light is the default.** See Theme trigger. |
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
| `--color-gold` | `#FFC658` | Sesame Gold | Rules, marks, small fills. Never more than 10% of a view on an editorial page. See The gold field for the one exception. |
| `--color-cream` | `#FFFEF4` | Off-White | Light canvas, type on dark. |
| `--color-black` | `#000000` | Black | Logo lockup and pure-black contexts only. |

### Theme trigger

**Clock-driven in America/Los_Angeles, with a manual toggle that wins permanently.**

Two rules, in this order:

1. **A stored choice wins and keeps winning.** If a visitor has ever used the toggle, that value applies and the clock is never consulted for them again. No expiry, and do not add one: a preference that lapses at 18:00 is a toggle that undoes itself, which reads as a bug.
2. **With no stored choice, the clock decides.** Night from **18:00 to 06:00**, day from **06:00 to 18:00**, in **America/Los_Angeles**.

**The zone is the restaurant's, not the visitor's.** The site should be dark when Tajima is in its evening, not when someone in Berlin is in theirs.

**Why those hours.** 18:00 is after sunset in San Diego for roughly half the year and sits squarely inside evening service at every room (they run to 22:00, and to 23:30 on Friday and Saturday at Convoy). 06:00 is before any room opens, the earliest being Plaza Bonita at 10:00, so the flip back to day never happens while a room is serving.

**Fixed hours rather than actual sunset, deliberately.** Sunset in San Diego moves between about 16:45 and 20:00 across the year, so a solar calculation would track the season better. It would also put arithmetic and a failure mode into a blocking script that runs before first paint. A fixed boundary is two comparisons and cannot be wrong in a way anyone notices.

**`prefers-color-scheme` is still not consulted.** The clock answers "is it evening in San Diego". The OS setting answers a different question, and honouring both means deciding which wins.

Implementation: `_includes/components/theme-init.njk` (blocking, pre-paint, reads storage then the clock) and `js/theme.js` (the toggle, whose single `setItem` is also the clock opt-out). They share only the storage key.

#### Revision history, because this item keeps moving

| | Rule | Why it changed |
|---|---|---|
| v1 | Night permanent, no toggle | The original signed direction. |
| v2 | Light and dark both ship, **manual toggle only, no clock, no system trigger**, light default | Client reversed v1. A clock was explicitly excluded at the time. |
| **v3, 2026-09-14** | **Clock-driven in America/Los_Angeles, manual toggle overrides permanently** | Requested by Steve. This does not reinstate v1: light is still the default, the toggle is still manual, and a visitor who touches it never sees the clock again. |

**If you are about to change this back to "manual only", read row v3 first.** v2's "no clock" line was correct when written and was superseded on purpose, not forgotten. The thing v2 was protecting against is a theme that changes under the visitor; rule 1 is what protects against that now.

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

**One exception exists, and it is the only one.** The header's night sign (`.hdr__neon`, "At Night" under the wordmark) is set at `0.875rem`, below the floor. It is granted because it fails to be the thing the floor protects: the floor exists so that brush type **carrying meaning** stays readable, and this carries none. It is two decorative words, `aria-hidden`, on a flat header field at 6.01:1, and a reader who cannot parse it has lost nothing because there is nothing in it to lose. At the floor it measured 82px wide against a 58px wordmark, which made it read as a second brand line rather than as a subtitle to the first.

Four tests, and an exception has to pass **all** of them:

1. Decorative. It carries no information the page needs.
2. `aria-hidden`. It is not in the accessibility tree, so nothing depends on it being read.
3. Not over photography. It sits on a flat field with measured contrast.
4. Nothing is lost if it is illegible. If the answer is "the reader would miss something", it is not decorative and the floor applies.

Anything that fails any of the four goes back to `1.25rem`. Do not add a second exception by pointing at this one; point at the four tests.

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

**Sticky offset. Anything pinned above the header has to be in the header's `top`.**

`.hdr` is `position: sticky; top: var(--sticky-top, 0px)`. It is a variable and not `0` because a second element pinned to the top of the scrollport occupies the same strip, and the one with the higher `z-index` simply covers the other. That is not hypothetical: the preview build's announcement banner is also `position: sticky; top: 0` above the header in stacking order, so on scroll it pinned over the header and the header rendered clipped. Any future announcement bar, cookie strip or seasonal notice does the same thing.

The contract, for anything that pins above the header:

1. Give it `data-sticky-bar`. `src/js/sticky-top.js` sums the heights of those elements and writes the total to `--sticky-top` on `:root`, kept current by a `ResizeObserver` so a bar that wraps to two lines on a phone is measured rather than assumed. A bar in normal flow is ignored, because a bar that scrolls away does not displace anything.
2. **Also declare a static `--sticky-top` in CSS** next to the bar's own styles, sized to its usual height. With JavaScript off the script does not run and CSS is the only source of the value. A bar that ships without one falls back to `0px` and the clipping comes back.

On a build with no such element the value is unset, the `0px` fallback applies, and the header behaves exactly as it always did. Verified at five scroll positions on three page types in both themes.

### Logo
Two assets, swapped by theme, no filters:
- dark surfaces: `Tajima Logo red logo white text.png`
- light surfaces: `tajima brand assets_digital_RGB-07.png`

Never recolor the logo with CSS. A filter-based fake was shipped in an earlier draft and turned the mark pink.

### CTAs
One red CTA per viewport. The header CTA is red, so any CTA in view alongside it is hairline-outlined or cream. Red on the red field is invisible; use `--color-cream`.

### The gold field

**Corrected 2026-09-09, and the correction goes the other way from the usual one: the guidelines authorise more than this document did.**

The line above, "rules, marks, small fills, never more than 10% of a view", describes the editorial surfaces and it is right for them. It is not what the brand guidelines show. October 2025 guidelines, Section 5.1 Digital Application, page 18, runs **Sesame Gold as a full-bleed field carrying black body type**, at roughly 17% of that layout, and again as dish panels with black brush headings and a red button. The same spread also shows the black header band, thin full-bleed red stripes between bands, the starburst badge in red with a white stroke and white brush type, and a red field carrying the ghosted line-art pattern with a gold hairline.

This document's own brand constants derive from those guidelines, so where the two disagree the guidelines win and this document changes.

**Scope: `/happy-hour/` and nothing else.** That is the only promotional page in the build, and page 18 is a promotional application (an email campaign), not an editorial one. A location page or the home page taking a gold field is a decision, not a licence this section grants.

**Rules that come with it.**
- Black on Sesame Gold measures **12.49 to 1** for the title and **10.91** for body copy, off a real render. It is the highest-contrast pairing in the build.
- **Red on gold is 2.24 to 1 and fails at any size.** On a gold field, emphasis is weight and rule, never colour. The `<em>` inside a title on this field stays ink and takes a red underline.
- **Gold as type on the red field is 3.33 to 1 and fails.** Gold on red is for rules and marks. Type on red is cream, which measures 5.09.
- Cream on Fire Red is **4.27 to 1**, which clears AA for large text and fails it for normal text, so the starburst's brush type has a hard 1.5rem (24px) floor.
- The field is full-bleed and therefore **sharp**. Cards take the radius scale; colour fields do not.
- The field does not change between day and night. A brand colour field is the same colour in both, the way the red locations field is.

**The guidelines' content is not in scope and this is not negotiable.** That artifact features North Park, which is closed, Tijuana as a peer location, Carnitas Ramen with a hero photograph, "ALL SLURPS WELCOME", which is retired voice, and "Authentic Japanese roots", which is banned copy. Colour, field and badge treatment only.

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
- **NO** AI-generated imagery posing as real photography. (Machine-UPSCALED real photography is a separate, narrower case: see Banned content, including the merge warning on `preview/location-photos`.)
- **NO** hex codes in CSS rules outside the token blocks.
- **NO** eyebrow labels above headings. A small uppercase kicker with a dash rule above every headline was removed in review as the single most templated element on the page. Headlines carry themselves.
- **NO** glow in day mode.
- **NO** brush display type below 1.25rem, with exactly one recorded exception (`.hdr__neon`) and four tests it had to pass. See Typography.

### Banned filler
elevated • curated • immersive • culinary journey • authentic (as a claim) • passion / passionate about • dive into • crafted with love • truly • a feast for the senses • our story began • memorable dining experience • guaranteed to keep you coming back • perfectly paired
Retired 2025 voice: "All Slurps Welcome," "Come Get Some Slizzurp," "I'm Late for Ramen"

### Banned content
- **No AI-generated imagery posing as real photography.** Unchanged and absolute.

  **A machine-upscaled real photograph is not that, and the distinction is drawn here so nobody has to guess.** An upscaled photograph is a picture of the actual room, taken by an actual camera, with more pixels than it started with. AI-generated imagery is a picture of a room that does not exist. The first is a resolution compromise and may ship with the compromise on the record; the second may never ship at all.

  **One file in the build is upscaled:** the `/tajima-convoy/` hero, `tajima-convoy-interior-dining-room-upscaled.jpg`, supplied by the client at review 2026-09-10. It is flagged `aiUpscaled` in `photos.json` with a note saying what was done to it and that it is to be replaced when the shoot lands. It is deliberately **not** flagged `placeholder`, because the placeholder guard fails the build and this photograph has to ship: it is what closed the WordPress hotlink below. Grep `aiUpscaled` to find every such file.

  **Where the line moves, it moves toward disclosure, not toward permission.** If a future asset is generated rather than enlarged, it does not get this treatment; it does not go on the site.

  ---

  #### READ THIS BEFORE MERGING `preview/location-photos` TO PRODUCTION

  **22 machine-enhanced location photographs are placed on that branch and the client has not verified any of them.** They are the only thing on it that is not cleared to ship.

  **The visible warning is gone.** Until 2026-09-14 every page of that deploy carried a black and hazard-yellow banner reading "Preview build. Location photography is AI-enhanced and for review only." It was removed on request. Nothing about the photographs changed when it came off, and nobody looking at the preview now is told anything. **The constraint survives only here and in the manifest flags.** That is the whole reason this section exists.

  **What is on that branch:** Connor supplied 21 room photographs on 2026-09-09, processed through ChatGPT from source photography, plus the Maui exterior. They are placed as the location-page heroes, in the galleries, on the seven mega menu cards and on the `/locations/` cards. Every one is flagged `aiUpscaled` with an `aiUpscaledNote` in `photos.json`. Run `grep -l aiUpscaled src/_data/photos.json` and read the notes; `node -e` over `roomPhotos.js` lists which are actually placed.

  **They displace real frames, deliberately.** College Heights normally shows seven genuine photographs and Crown Point three. They are untouched in the repo and they are what production serves today. Merging replaces genuine photography with machine-processed photography on those two rooms.

  **Verification status, from the structural check run when they arrived:** College Heights and Crown Point verify against a known-real control. Maui passes both checks, brand mark and door number against the published NAP. Mercury is consistent but its reference frames are too small to be conclusive. **Convoy fails: its brand mark is distorted, proven against the control.** East Village and Plaza Bonita are unverifiable. None of that is a client sign-off, which is the thing that is actually missing.

  **What indexing protection is still on the branch, and what it is not.** `noindex, nofollow` on every page in `layouts/base.njk`, an `X-Robots-Tag` on `/*` in `public/_headers`, and a blanket `public/robots.txt`. All three stay and all three are branch-only. **They stop a crawler. They do not stop a merge.** Deleting them is part of merging to production, so the moment the merge happens the last mechanical guard is gone too.

  **Before merging, one of two things has to be true:** Sam has confirmed the rooms, or the AI-enhanced set comes out and the genuine frames go back. There is no third option where it ships quietly because the banner is no longer there to argue with.
- **No fusion framing.** Never Japanese-Mexican, Japanese-Californian, or Baja anything, in any copy or image.
- **Carnitas Ramen: permanent, and it has a photograph. CORRECTED 2026-09-10, at client review.** This line has now been wrong twice in opposite directions, so read the whole thing. It first read as an outright ban. Open Decision #4 corrected that on 2026-08-04 to 'listed, never featured', on the strength of a Brand Positioning line about phasing the dish out quietly. **The client has now confirmed the dish is permanent and gets a photograph.** It appears on `/menu/` with a photograph. `feature` stays `false`, which keeps it out of the location-page bentos and the per-room lists, because 'permanent and photographed' is not 'promote it everywhere'; flipping that flag is a one-line change if the client asks. The fusion-framing ban above is untouched and still absolute: the dish may be shown, the framing may not. See `menu.json` `_carnitasNote`.
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
- ~~**The noodle cadence is unconfirmed.**~~ **CONFIRMED 2026-09-09 by the client, at all locations including Maui.** "crafted daily", "cut daily" and "cut that morning" are all sourced. The five template cautions are removed and `site.json` `_sloganNote` carries the record. **Two things this did NOT confirm and both are still hard rules: the rollout claim** ("every bowl at every location", Open Decision #2) **and the production clock.** Daily is not the same sentence as everywhere, and it is not a timetable.

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

   **A build guard now protects the standard while we wait, added 2026-09-09.** Every photograph on the site is Tajima's own, and the moment that is most likely to break is the one nobody plans for: the shoot lands late, a page needs a frame this week, and a stock image goes in "just for now". `src/_data/roomPhotos.js` sweeps the whole photo manifest at module load and throws on any entry marked `placeholder: true`, which fails `npm run build`. `npm run build` also runs `npm run test:photos` first, so a stale or half-registered manifest fails before Eleventy starts.

   Registering a stand-in is three fields on its `photos.json` entry (`placeholder`, `placeholderSource`, `placeholderNote`) and all three are required; a partial registration fails too, because it reads as handled and is not. `TAJIMA_ALLOW_PLACEHOLDERS=1 npm run build` is a client-preview escape hatch and nothing else. Cloudflare does not set it, so a placeholder that builds on a laptop still fails the deploy.

   **What it does not catch, stated plainly:** it can only see what somebody marked. A stock file dropped into `public/images/photo/` and referenced from `menu.json` with hand-written alt is invisible to this guard and to the draft-alt guard both. The guard makes an honest registration binding. It does not make a dishonest one impossible. The rule it backs is unchanged: never a stock room, storefront or plated bowl, ever; stock only for a subject no Tajima photograph could cover, and never presented as Tajima. See `_placeholderRule` in `photos.json`.
4. **Homepage word count.** Approximately **250 words** as built, against a **700+** target for the ranking goals in `AEO.md`. The gap widened rather than closed: the reference file's `craft` and `feed` sections, which carried most of the missing copy, were rejected in review and are not built. **Close it with copy inside the seven existing sections, never by adding a section back.** Nothing may be padded in to hit the number; the copy has to earn its place under `voice-tone.md` and trace to `CLIENT_FACTS.md` like everything else.
5. ~~**No schema on the homepage yet.**~~ **CLOSED.** `src/_data/schema.js:428` defines the `home` graph and the built page emits it: `Organization`, `Person` (Sam), `WebSite`, `ItemList` of locations, which is exactly what the `/` brief in `SITE_ARCHITECTURE.md` specifies. No `Restaurant` on this page, as required.
6. **No hours or phone anywhere on the homepage.** Top UX gap. Hours still need confirmation from a primary source before publishing.
7. ~~**LAUNCH BLOCKER: `/tajima-convoy/` loads its hero photograph from `tajimaramen.com`.**~~ **CLOSED 2026-09-10.** The client supplied an interior photograph of the room at review. It is downloaded into `public/images/photo/`, curated through `roomPhotos.js` like every other placed photograph, and passes the same build guards. **No image in the build now loads from `tajimaramen.com`**, so the new site and the old one no longer depend on each other in either direction.

   **It is machine-upscaled and that is on the record**, flagged `aiUpscaled` in `photos.json` with a note. It is a real photograph of the real room at a resolution it was enlarged into, not generated imagery, and the distinction is written into Banned content above. **Item 3 still wants a Convoy frame from the documentary shoot** and this one gets replaced when that lands.

   (The image's `alt` and caption both said "storefront" and were corrected in the v2 port; the photograph is the dining room. That part was already fixed.)

9. **NO SPECIAL-HOURS DATA, AND THE LIVE OPEN STATUS WILL BE WRONG ON A HOLIDAY.** Added 2026-09-14 with the status itself.

   The seven location pages now compute "Open until 22:00" or "Opens at 11:30" in the browser from the `hours` array in `locations.json`. That array carries a weekly pattern and nothing else. **On a holiday closure the page will say a room is open.**

   This is not hypothetical and the data to fix it already exists somewhere else: Connor's 2026-09-09 Google Business Profile export carries a special-hours field, and it showed **2026-07-04 closed at five locations and reduced hours at Plaza Bonita**. That was noted at the time as a field GBP holds if a holiday schedule is ever needed. It is now needed.

   **What closing it takes:** a `specialHours` array on each location (date, plus either closed or an opens/closes pair), a request to Connor for the current and forthcoming dates, and a date check ahead of the weekday lookup in `js/hours.js`. The same array should then feed `openingHoursSpecification` as `OpeningHoursSpecification` entries with `validFrom` and `validThrough`, so the graph and the visible status stay one source, which is the rule the weekly hours already follow.

   **Until then, the honest mitigation is that the static hours rows are unchanged and still authoritative on the page**, and the status is additive: a reader who does not trust it can read the published times directly above it. The status is also absent entirely with JavaScript off and on Maui, which has no hours at all.

8. **LAUNCH BLOCKER: eight media assets load from `cdn.circulationstudio.com/tajima-temp/`.** Separate from item 7 and a different owner: that one is the client's old WordPress site, this one is ours, and "temp" is in the path.

   | Page | Asset |
   |---|---|
   | `/` | `videos/tajima-san-diego-web-background-full.mp4` |
   | `/noodle-room/` | `videos/tajima-brand-video-web-1080p.mp4` |
   | `/noodle-room/` | `videos/tajima-san-diego-web-background-full.mp4` |
   | `/noodle-room/` | five images, including the poster frame for the brand film |
   | `/about/` | `videos/tajima-brand-video-web-1080p.mp4`, added 2026-09-09 |

   **The brand film is 46.8 MB.** That is why `/about/` sets `preload="none"`: nothing is fetched until a reader presses play, verified as zero mp4 requests on page load. Its real runtime is **1:20** (80.45s by the mvhd atom), not the 60 seconds it is often described as, and nobody on this project has watched it end to end, so no page asserts what is in it.

   **What resolves this:** the videos need a permanent home, either committed to `public/` or served from a stable production bucket rather than one named temp. Committing 46.8 MB to git is not obviously right, so this needs a decision, not just a copy. Until then, every one of these pages depends on a bucket whose name says it is going away.
