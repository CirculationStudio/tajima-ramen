# Claude Instructions

**Project:** Tajima Ramen
**Last updated:** 2026-07-15
**For:** Claude Code and Chad (autonomous agent)

## North Star

Tajima Ramen is San Diego's craft Japanese ramen house, making its own noodles on Japanese-imported machines a few miles from every room and simmering its own broth in its own commissary, since 2001. We control the whole process, so the proof is in the bowl, not in the adjectives. Every page should give the person who knows ramen something specific to hold onto, the machine, the flour, the simmer, the room where it happens, and move them to the nearest of six locations. Sam is the source of the standard, present where the story needs him, not decoration on every page. Plainspoken, warm, concrete. The growth priority is the Noodle Room story.

## Purpose

This file contains the rules, standards, and brand constraints that all AI agents must follow when working on this project. This ensures consistency, maintains brand integrity, and prevents generic/machine-generated aesthetics. It is the brand-and-content half wired into the technical half; read it before generating or editing any page so generated pages stay on-brand instead of drifting to the generic center.

The project in one line: Tajima Ramen is a six-location Japanese ramen restaurant group in San Diego, founded by Sam in 2001, built on vertical integration (in-house noodle production and broth commissary). Standard tier build on the Circulation Studio stack (Eleventy v3, Tailwind v4, GitHub, Cloudflare). Attributes: blog [TBD], Answer Engine (llms.txt) [TBD], online ordering integration [TBD], bilingual (English/Japanese) [TBD], performance-first.

## Reference documents (priority order when they conflict)

1. `CLIENT_FACTS.md` [to be created]: the source of truth for every fact about the business. If a fact is not in it and not confirmed, do not publish it. Never invent a name, number, location detail, menu item, or hour.
2. `CONTENT_EVIDENCE.md` [to be created]: the citable-evidence layer for page copy and blog (research stats with sources, usage class, verification status). Every statistic must trace here and be re-confirmed against its primary source before publishing. Never publish anything in its "Do not publish" list.
3. `voice-tone.md`: how everything is written.
4. `DESIGN_SYSTEM.md`: how everything looks, including the Forbidden Patterns.
5. `SITE_ARCHITECTURE.md` and `SCHEMA.md`: what pages exist, their URLs and keywords, their per-page briefs, and their structured data.

`AEO.md` [to be created if needed] covers the answer-engine build (llms.txt spec and AEO content principles). `ARCHITECTURE.md` covers the technical scaffold (Eleventy v3 + Tailwind v4 `@theme` setup, build/start commands, file structure, Cloudflare config).

## Two hard client rules that override everything

1. **Cultural authenticity.** Never invent or misrepresent Japanese culinary traditions, techniques, or terminology. If a specific claim about noodle-making, broth preparation, or Japanese ramen culture cannot be verified, do not publish it. Respect for the craft is non-negotiable.
2. **Never generic food marketing.** No surface may read as generic chain restaurant copy. Every generated page must pass this test: plainspoken, warm, concrete, proof in the bowl not the adjectives. If a draft could read as hyperbolic, corporate, or ingredient-list-flexing without context, revise it.

## House Rules (apply to every task)

- **No em dashes anywhere.** Site, content, docs, code comments. Use commas, periods, parentheses. Hard rule.
- **Commits are surgical.** Never `git add -A`. Stage the specific files a change touches.
- **One thing at a time:** plan it, do it, check it, then move on.
- **Verify web builds locally** (`npm run build` and `npm start`), spot-check, and use the Cloudflare preview URL every branch gets.
- **Back-end changes deploy before front-end** on anything touching both.

## Page Build Workflow

Imperative. This runs on every page build.

**BEFORE building any page, READ:**

- `voice-tone.md` (brand voice and the mandatory writing mechanics)
- this page's brief in `SITE_ARCHITECTURE.md` (its target keyword, section plan, and its specified INTERNAL LINKS)
- `CONTENT_EVIDENCE.md` [when created] (citable verified facts, and the do-not-publish list)
- `CLIENT_FACTS.md` [when created] (business facts, confirmed vs unconfirmed)
- `DESIGN_SYSTEM.md` Forbidden Patterns
- `faq.json` [when created] (the approved answer engine) for this page's relevant FAQs. NOTE: `faq.json` is pending; until it exists, FAQs must be drawn from an approved source or clearly flagged as draft-pending-client-approval, never invented as fact.

**WHILE building:**

- Compose from existing components; never hand-build markup a component covers. New blocks go in the component library, not inline.
- Add the internal links specified in this page's `SITE_ARCHITECTURE.md` brief.
- Voice matches `voice-tone.md` and runs its mechanics (plainspoken, warm, concrete, no hyperbole).
- Any statistic traces to `CONTENT_EVIDENCE.md` [when created]; nothing from the do-not-publish list.
- Facts from data (`site.json` / `nav.json`), never hardcoded.
- Schema: page-specific only (Restaurant, Menu, BreadcrumbList, FAQPage). Reference the site-wide business entity by `@id`; do not redefine Restaurant per page.
- Location data (addresses, hours, phone numbers) always pulled from structured data, never hardcoded per page.

**AFTER building, run this itemized self-check (all must pass before the page is done):**

- Serves the North Star
- Internal links from the brief are present
- Correct schema present, generated from the same data as the visible content, and not duplicating the site-wide business entity
- FAQs come from the approved source (or are flagged draft), not invented
- Any stats are cited and cleared
- Exactly one H1, ordered headings
- Alt text on every meaningful image
- One primary CTA per viewport (e.g., "Find Your Location," "View Menu," "Order Now")
- No em dashes anywhere
- WCAG 2.2 AA (visible focus, keyboard operable, reduced-motion respected)

## Hard Rules (Never Break These)

### Universal constraints

- **NO em dashes anywhere** (use commas, periods, parentheses)
- **NO banned filler phrases** (full list and rationale in `voice-tone.md`):
  - "transform," "unlock," "breakthrough," "revolutionary," "game-changer," "guaranteed"
  - "authentic" without concrete proof (use specific details: "noodles made on Japanese-imported Yamato machines")
  - "award-winning" unless verified with specific award name and year
  - "best [anything]" or "[number] best" claims
  - "simply," "cutting-edge," "elevated," "curated," "artisanal" without context
  - "it's important to note," "in today's fast-paced world"
- **NO unauthorized changes** to client-supplied copy without approval
- **NO AI-generated imagery** posing as real photography where authenticity is claimed
- **NO accessibility overlays** (they raise legal risk, not lower it)

### Code and development standards

- Always reference ARCHITECTURE.md for technical decisions
- Follow the file structure defined in the repo root
- Use semantic HTML for agent-readability
- Build for editability: separate content from layout using clean `_data` files
- Never hardcode markup that a component covers
- Accessibility is built in from the start (WCAG 2.2 AA minimum)
- Commits are surgical: never `git add -A`
- URLs: lowercase, hyphenated, no accents in slugs

### Brand constraints (from DESIGN_SYSTEM.md)

Mirrors the Forbidden Patterns section of DESIGN_SYSTEM.md.

#### Typography

- **Approved fonts:** [To be defined in DESIGN_SYSTEM.md during Phase 3]
- **BANNED:** Inter as a UI font. Noto Serif. Any generic default. [Update once locked fonts are chosen]

#### Colors

- **Approved palette:** [To be defined in DESIGN_SYSTEM.md during Phase 3]
- **BANNED:** generic purple-to-blue or indigo AI gradient, default indigo/violet primary
- **The primary CTA rule:** one primary CTA per visible viewport, maximum. If two CTAs compete in one screen, the design is wrong.

#### Iconography

- **Approved icon system:** inline SVG only, drawn with intent
- **BANNED:** unmodified stock icons, default icons dropped in without intent, external icon CDNs or runtime icon libraries, emojis in any deliverable

#### Voice

Plainspoken, warm, concrete. Use "I" for Sam's personal voice, "we" for the restaurant group. Show the craft through specifics (the machine, the flour, the simmer), not through adjectives. See `voice-tone.md` for the full brand voice and the mandatory content mechanics.

## Forbidden Patterns (the anti-slop standard, from DESIGN_SYSTEM.md)

If a generated page shows any of these, it drifted and must be fixed:

- Em dashes.
- Inter as a UI font [or other banned fonts once defined]. Noto Serif or Manjari [or other superseded fonts]. These are superseded.
- More than three corner radii (the system is pills, cards, inputs, nothing else).
- Generic purple-to-blue or indigo AI gradient. Any 2010s-style gradient on the CTA.
- Default indigo/violet primary. [Update with actual primary color once locked]
- More than one primary CTA competing in a single viewport.
- Stock default icons dropped in without intent. External icon CDNs loaded at runtime.
- Emojis in professional deliverables.
- Stock "generic Asian restaurant" or "zen spa" imagery. AI-generated imagery posing as real photography.
- Serif used for functional UI, or sans used for the emotional headline moment [adjust based on actual type system].
- Banned filler copy (full list in voice-tone.md): "transform," "unlock," "revolutionary," "authentic" without proof, "award-winning" without citation, "best," "simply," "elevated," "curated," "artisanal" without context, "it's important to note," "in today's fast-paced world."

## Content mechanics (run before shipping any copy)

From voice-tone.md [to be completed], these are pass/fail:

1. Concrete over abstract: any claim about quality must be supported by a specific detail (the machine, the flour, the simmer time, the room).
2. Plainspoken check: read it aloud; it should not read like generic food marketing or a corporate mission statement.
3. Banned-word scan (search for "simply," "authentic" without context, "elevated," "curated," "artisanal" without proof).
4. Sam appears where the story needs him, not as decoration on every page.
5. Every location-related page makes it easy to find the nearest of six locations.

Voice in one line: plainspoken, warm, concrete.

## Menu and pricing content (strict)

- Menu items, descriptions, and prices are NEVER generated or modified without explicit client approval
- If menu data is provided in structured format (JSON, CSV, etc.), use it as the single source of truth
- Never invent menu items, ingredients, or pricing
- Allergen and dietary information must come from verified client data only
- When in doubt, flag as `[TO BE CONFIRMED BY CLIENT]` rather than guessing

## Location data (strict)

All location data (addresses, hours, phone numbers, neighborhood names, parking details) must be:
- Pulled from a single structured data source (e.g., `locations.json`)
- Never hardcoded per page
- Verified against Google Business Profile data when available
- Consistent across all pages and schema markup

Never invent location details. If a location's information is incomplete, flag it as `[TO BE CONFIRMED]`.

## Statistics (do not repeat unsubstantiated figures)

Every statistic traces to `CONTENT_EVIDENCE.md` [when created] and must be re-confirmed against its primary source and refreshed to the current year before publishing. Never present research averages or third-party claims as promises about this restaurant's food or service.

## Component Usage

[Document reusable components and their correct usage patterns after Phase 5]

### Heroes
[Guidelines]

### Cards
[Guidelines]

### Forms
[Guidelines]

### CTAs
[Guidelines]

## Content Guidelines

### If content provenance = client-supplied

- DO NOT rewrite client copy without explicit approval
- Editorial pass for obvious errors only, with changes confirmed back to client

### If content provenance = agency-AI

- Follow voice-tone.md for all copy generation
- Never invent claims, credentials, or facts that cannot be verified
- All generated copy must be reviewed before deployment

### All provenance types

- Legal, pricing, menu, and claims content NEVER auto-generated or auto-edited
- Schema/structured data must match visible content exactly
- Alt text on every meaningful image, empty alt on decorative images

## SEO and Structured Data

- Title tag and meta description must be unique per page, keyword-aligned from SITE_ARCHITECTURE.md
- Implement JSON-LD schema exactly as specified in SCHEMA.md
- Validate all schema blocks at validator.schema.org
- FAQPage schema must match visible FAQ exactly (business-critical for AI answers)
- Schema must not regress (it's how clients get found in AI answers)
- Never emit `aggregateRating` or `Review` schema with placeholder or fabricated values
- Use Restaurant schema (not just LocalBusiness) with menuUrl, servesCuisine, and acceptsReservations properties

## Performance Standards

### Core Web Vitals targets (75th percentile)

- **LCP:** < 2.5s
- **INP:** < 200ms
- **CLS:** < 0.1

### Asset optimization

- Hero images: `loading="eager"` + `fetchpriority="high"` + preload
- Below-fold images: `loading="lazy"`
- All images: explicit width/height attributes (prevents layout shift)
- Target < 300KB per image
- Serve WebP/AVIF with fallback

### JavaScript discipline

- Keep scripts minimal
- Defer or async everything non-critical
- No long main-thread tasks
- No `transition: all` (causes INP issues)

## Build Workflow

For building a content page, follow the Page Build Workflow above; that BEFORE / WHILE / AFTER loop is authoritative for pages. This section is the general build loop for everything else.

1. Read all relevant documentation before making changes:
   - ARCHITECTURE.md for technical structure
   - DESIGN_SYSTEM.md for brand constraints
   - SITE_ARCHITECTURE.md for content strategy
   - SCHEMA.md for structured data requirements
   - voice-tone.md for copy guidelines (if applicable)

2. Make changes following all constraints above

3. Verify accessibility, performance, and brand compliance

4. Test build: `npm run build`

5. Check preview deployment before considering complete

## What Claude Code and Chad Should NOT Do

- Never generate or modify legal disclaimers, privacy policies, or terms without explicit instruction
- Never modify menu items, pricing, or allergen information without verification
- Never claim awards, certifications, or accolades not verified by client
- Never use stock photography where real/authentic imagery is required
- Never skip accessibility requirements to move faster
- Never compromise performance targets for visual effects
- Never invent Japanese culinary terms or techniques without verification

## What Claude Code and Chad SHOULD Do

- Proactively flag potential accessibility issues
- Suggest performance improvements when noticed
- Point out inconsistencies with DESIGN_SYSTEM.md constraints
- Recommend structured data opportunities aligned with SCHEMA.md
- Ensure all work is agent-readable (semantic HTML, clean structure)
- Build with the assumption that both humans and AI agents will consume the content
- Flag when menu data, location data, or cultural claims need client verification

## When Unsure

Stop and flag it rather than guessing. A `[TO BE CONFIRMED]` placeholder with a note is correct; an invented fact is a failure. The open questions that block specific content are listed at the bottom of CLIENT_FACTS.md [when created].

## Documentation References

- `CLIENT_FACTS.md` [to be created]: business facts, confirmed vs unconfirmed.
- `CONTENT_EVIDENCE.md` [to be created]: citable verified stats, and the do-not-publish list.
- `voice-tone.md`: how it reads (brand voice and writing mechanics).
- `DESIGN_SYSTEM.md`: how it looks (tokens, components, Forbidden Patterns).
- `SITE_ARCHITECTURE.md`: the pages, their target keywords, and their internal links.
- `SCHEMA.md`: structured data per page type.
- `AEO.md` [to be created if needed]: the answer-engine build (llms.txt spec and AEO principles).
- `COMPONENT_COVERAGE.md` [to be created]: page recipes and the component coverage map.
- `reference/` [to be created]: the approved finished design source.

## References

- See `.claude/README.md` for how different agents should use this file
- See `.claude/AUDIT_AGENT.md` for the quarterly audit checklist
- See all root-level .md files for detailed specifications

---

**Remember:** This site is built to be distinctive, accessible, performant, and agent-readable. Every choice should serve those goals. The proof is in the bowl, not in the adjectives.
