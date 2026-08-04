# Site Architecture

**Project:** Tajima Ramen
**Last updated:** 2026-07-16
**Phase:** Phase 2 - Strategy and Structure
**For:** Claude Code and Chad. This is a lookup document, not a read-through.

## Purpose

The contract Marco builds against. Defines every page, its URL, its target keyword, its section plan, its required internal links, and its schema.

**Per the Page Build Workflow in `CLAUDE.md`: before building any page, read that page's brief in the Page Briefs section below.** The brief is authoritative for that page. If a brief conflicts with a general rule in this document, the brief wins. If a brief conflicts with `CLIENT_FACTS.md`, `CLIENT_FACTS.md` wins.

Every keyword, volume, and ranking figure here is real, measured, and dated. Provenance in the Data Appendix. Do not substitute intuition for these numbers.

---

## Tier and Attributes

| Attribute | Value | Note |
|---|---|---|
| Tier | **Standard** | |
| Bilingual | **No** | CLAUDE.md lists English/Japanese TBD. The answer is no, and Japanese is the wrong second language. Tijuana is on tajimamx.com (separate domain, Spanish). Plaza Bonita's market is Spanish-primary (National City, 63.5% Hispanic/Latino) and is the only real future case. No Spanish query data exists to justify it now. **Do not build hreflang scaffolding.** |
| Blog | **No at launch** | Existing 75-post archive is a dead press-clipping dump, 410'd (see Migration). Content Engine is a phase 2 decision gated on the Noodle Room launch. |
| Booking | **No** | Walk-in only, all locations. Mercury takes group reservations by phone only. No forms, no `ReserveAction`, `acceptsReservations: false`. |
| Answer Engine (AEO) | **Yes** | See `AEO.md`. `/noodle-room/` and `/faq/` exist for this. |
| PWA | **No** | |
| Online ordering | **Handoff only** | Toast, external. No first-party transaction endpoint. This is why there is no `agents.md` and no UCP manifest. |

---

## Global Rules

Apply to every page unless a brief overrides.

### URLs
- lowercase, hyphenated, trailing slash, no accents, no dates, no `-2` suffixes
- **Existing location URLs do not change.** `/tajima-convoy/` earns 9,704 clicks at position 2.83. Moving it to `/locations/convoy/` is a 301 on the site's best pages during a migration for zero measurable gain. This includes the ugly Maui URL.

> **`SCHEMA.md` correction required:** its `@id` namespace uses `/locations/convoy/#restaurant`. Written before traffic data existed. Update all seven to the real URLs, e.g. `https://tajimaramen.com/tajima-convoy/#restaurant`.

### Canonical host
`https://tajimaramen.com`. 301 everything else at Cloudflare. HSTS on.
**8,361 clicks (~10%) currently land on non-canonical hosts.** `https://www.` 4,480, `http://www.` 2,075, `http://` 1,806.

### UTM handling (required on every page)
All seven GBP profiles link with `?utm_source=gbp&utm_medium=organic`. Google indexes these as separate URLs: **6,590 keyword rows, 10,811 clicks, 160,860 impressions.** Mercury also carries `utm_campaign=menu`.
1. Self-referencing canonical on every page.
2. Strip UTM params at the Cloudflare edge, 301 to clean URL.
3. **Update the website link in all seven GBP profiles at launch.** Redirects are the net; this is the fix.

### Data sources (never hardcode)
| Data | File | Feeds |
|---|---|---|
| Location NAP, hours, parking, amenities | `locations.json` | location pages, `/locations/`, footer, all location schema |
| Menu | `menu.json` (built from Sheet, committed fallback) | `/menu/`, location menu sections, `/happy-hour/`, Menu schema |
| FAQ | `faq.json` | `/faq/`, per-page FAQ blocks, FAQPage schema |
| Nav | `nav.json` | header, footer |
| Site-wide | `site.json` | Organization schema, footer |

### The menu data layer
One row per dish, with a per-location availability column. This single decision produces `/menu/`, each location's correct menu section, `/happy-hour/`'s per-location detail, and each location's schema containing only what that location sells.

| id | section | name | description | price | locations | status | feature | dietary |
|---|---|---|---|---|---|---|---|---|
| tonkotsu | ramen | Traditional Tonkotsu Ramen | ... | 15.50 | convoy,mercury,east-village,college-heights,crown-point,plaza-bonita | live | yes | |
| carnitas | ramen | Carnitas Ramen | ... | 17.50 | convoy,mercury,east-village,college-heights,crown-point,plaza-bonita | live | **no** | |
| jwhisky | drinks | Japanese Whisky | | | mercury | live | no | |
| wagyu | ramen | Wagyu Shoyu Tonkotsu | ... | ? | maui | live | yes | |

- `feature: no` means the item renders as a plain line on `/menu/` and in schema, and **never** in a hero, card, photo slot, or callout. This is how carnitas phases out without anyone remembering a rule.
- Three menus genuinely differ: College Heights (pared-down ramen bar), Plaza Bonita (quick-serve, no alcohol), Maui (own dishes). The `locations` column handles all of it. **Never build a per-location menu page.**
### Where `menu.json` comes from: Toast is the seed, not the live source

**We do not currently have the per-location menus.** We have brand-level prices from the Client DNA and we know that three locations differ. We do not know what each location actually serves. `menu.json` cannot be built without it, and `/menu/` is the highest-confidence page on the project. **This is a launch blocker.** See Open Decisions #12.

**Toast is the only system that knows.** It is the source for the mechanical half:

| Toast supplies | We supply |
|---|---|
| Which items exist per location | The description, in brand voice |
| Price per location | The `feature` flag (the positioning) |
| Availability / visibility | The section grouping |
| Item names | Whether it appears on the site at all |

**Pull once, review, commit. Not a build-time dependency.**

```
scripts/sync-toast-menu.js
  1. Fetch Toast menus, all 7 locations (Menus API V2)
  2. Filter by the `visibility` array (drop POS-only and KIOSK-only entities;
     they are not on the public menu)
  3. Map Toast items to the menu.json schema
  4. Diff against the committed menu.json
  5. Report: new items, price changes, removed items, availability changes
  6. Human reviews, edits descriptions and feature flags, commits
```

The build reads the committed `menu.json`. Toast being down, a token expiring, or an item getting 86'd at 11pm cannot break a deploy or rewrite the site. Run the sync on a cadence (monthly, or before any menu-related work) and treat the diff as the review queue.

**Why not wire Toast live:** its menu is an ordering menu, with modifiers, POS shorthand names, and per-channel visibility. Its job is taking money. It would auto-publish Carnitas Ramen, which is a positioning decision, not a data decision. And `CLAUDE.md` is explicit that menu items, descriptions, and prices are never generated or modified without client approval. A live wire violates that by design.

**Access requirements (verify before scoping):** Toast standard API access requires an active **Toast Restaurant Management Suite (RMS) Essentials** subscription or higher, credentials created by an active employee of the location, and the **Manage Integrations** permission for each location. Seven locations means either seven credential sets or a restaurant management group account. Menus API **V2**, not V3 (V3 is ordering-partner only and needs the `menus.channel:read` scope). **BLOCKED:** does Tajima have RMS Essentials? If not, this is a paid upgrade and the fallback is a manual pull from Amanda.

**Fallback if Toast access doesn't happen:** a Google Sheet fetched at build with a committed fallback JSON. Same schema, same review discipline, more manual maintenance. Toast is better because it is already the operational truth.

### Every page
- Exactly one H1. Ordered headings, no skips.
- One primary CTA per viewport.
- Unique title and meta description, keyword-aligned to the brief.
- Schema per `SCHEMA.md`, generated from the same data as the visible content. Reference the site-wide entity by `@id`; never redefine it.
- `BreadcrumbList` on every page except `/`.
- Alt text on every meaningful image, empty alt on decorative.
- **No `aggregateRating` anywhere.** Self-serving review markup is ineligible for rich results and risks a manual action. Ratings live on GBP and Yelp.

---

## Sitemap

```
/                              Home                          P0
/menu/                         Menu                          P0   NEW
/menu/vegan-ramen/             Vegan Ramen                   P2   NEW
/noodle-room/                  The Noodle Room               P0   NEW
/about/                        About / Sam                   P1   NEW (replaces /about-us/)
/locations/                    Locations index               P1
/tajima-convoy/                Convoy                        P1
/tajima-mercury/               Mercury                       P1
/tajima-east-village/          East Village                  P1
/tajima-college-heights/       College Heights               P1
/tajima-crown-point/           Crown Point                   P1
/tajima-plaza-bonita/          Plaza Bonita                  P2
/tajima-ramen-maui-hawaii/     Maui (Kihei)                  P2
/tajima-north-park/            North Park: Closed            P2   REBUILD
/happy-hour/                   Happy Hour                    P1   REBUILD
/order-online/                 Order Online                  P1
/gift-cards/                   Gift Cards                    P3
/press/                        Press                         P3   REBUILD
/careers/                      Careers                       P3   (from /careers-2/)
/faq/                          FAQ                           P2   NEW
```

**19 pages. This is the whole site at launch.** Do not add pages. Do not build `/contact/` (six locations means no single contact; `/locations/` is the contact page). Do not build `/menu/tonkotsu/` ("tonkotsu san diego" has 58 impressions over 15 months). Do not build dish pages beyond vegan.

## Not in scope for v1 (deferred, do not build)

These are real and they are coming. They are not launch work. **Do not build any of them, and do not leave stubs, nav items, or "coming soon" states in the build.**

### `/events/`: TBD, likely phase 2

**Structure is decided if it ships:** one hub, filtered by location. Not six per-location event lists. Same architecture as `/menu/` and `/happy-hour/`: one `events.json`, `locations` column, filter in the UI. Some events apply to all six.

**Justification is not keyword volume.** Every event/party/collab query combined: 49 rows, 8 clicks, 237 impressions over 15 months. Nobody searches "tajima events." The argument is **`Event` schema still earns rich results**. The Google Events carousel and "things to do" surfaces are live real estate, and discovery happens there, not in a blue link. Same logic as `/noodle-room/`: zero demand, real justification.

**BLOCKED on: is there actually a program?** The Parfait Party collab on Mercury's Instagram suggests a recurring cadence. If it's monthly, it's a page. If it's twice a year, it's a GBP post, and an events page reading "no upcoming events" is worse than no page at all.

**If it ships:** P3, `events.json`, `Event` schema per item, location filter, and a **mandatory empty state** that degrades to something useful rather than a dead end.

### Promos: TBD, later

Not a priority. When they land, they are a **data module, never pages.**

```json
{
  "id": "padres-tap-2026",
  "headline": "Every tap beer $3.50",
  "body": "Padres home games. All day.",
  "locations": ["convoy","mercury","east-village","college-heights","crown-point"],
  "starts": "2026-03-26",
  "ends": "2026-09-28",
  "slot": "location-secondary"
}
```

Date-bounded, renders only inside its window, vanishes at the next build with no page left behind. The `locations` array handles exclusions natively (the Padres promo excludes Plaza Bonita).

**The demand isn't there and the precedent is a warning.** Padres/Petco/game-day queries: 17 rows, **0 clicks**, 43 impressions, while a $3.50-tap-beer module currently sits on the home page. Specials/promo/deals: 114 rows, 73 clicks, and the only real one is `tajima special` (62 clicks, branded). Seasonal/holiday: 95 rows, 548 impressions, **1 click**, and every one of them lands on 2021 press posts we are about to 410. That is the corpse of this exact idea: content built for a promo, promo ended, content stayed, now dead weight at click depth 10. **Do not rebuild that pattern in Eleventy.**

**Time-bound promos live on GBP Posts.** Per-location, expire natively, surface in the map pack where the SoLV is, no rebuild, and Amanda already runs the posting. The anniversary campaign was already built that way. That is the established pattern and it is correct.

**Structural things are not promos.** Happy hour is permanent and earns 1,171 clicks, so it has a page. Padres game nights recur every season and are a real reason to choose East Village, so they get a section on `/tajima-east-village/` (moved off the home page: it is a conversion asset, not an acquisition one). Neither is a promo. They are operating facts.

### Catering: TBD, ask

**Small but real demand for something we cannot confirm exists.** `ramen catering san diego, ca` sits at **position 7.60** with 87 impressions. Also `ramen catering near me` (28 impr, 3 clicks), `japanese catering san diego`, `private ramen booth near me`, `crown point catering san diego`. The Client DNA lists catering as `[TBD]`. Connor's read: probably not offered.

**Do not write a line implying catering exists.** If it does, Mercury is the home (90 seats, largest format, the only location taking group reservations) and it is a **section on that page, not a new URL**.

---

# Page Briefs

---

## `/`

| | |
|---|---|
| **Status** | REBUILD |
| **Template** | `home` |
| **Priority** | P0 |
| **Data** | `site.json`, `locations.json`, `menu.json` |

**Target keyword:** `tajima ramen` (29,026 clicks, 42.5% CTR, pos 1.39)
**Secondary:** `tajima` (16,318 clicks, pos 5.42), `tajima ramen san diego` (4,137), `ramen near me` (2,163 clicks, 130,233 impr, pos 8.03)
**Do not target:** `best ramen san diego` (goes to `/tajima-convoy/`), any menu query (goes to `/menu/`)
**Intent:** Navigational + brand. The visitor already knows Tajima and wants routing.
**Conversion goal:** Route to a location, or into the Noodle Room story.

**Title:** `Tajima Ramen | San Diego Craft Japanese Ramen House Since 2001`
**Meta:** Must not contain "authentic." Current live title leads with it.
**H1:** One only. Hero line from the approved slogan set in `voice-tone.md`. Do not write a new one.

**Section plan:**
1. Hero. Approved slogan, one primary CTA, one secondary. Process imagery (a noodle lifted, a hand in the work), never a billboard shout.
2. The Noodle Room, 3 sentences max, link out. This is the growth priority.
3. Location router. All seven, from `locations.json`. Nearest-first if geo is available, otherwise SD then Maui.
4. Menu teaser. Featured bowls only (`feature: yes`). Link to `/menu/`.
5. The 25 years, 2 sentences, link to `/about/`.

**Internal links (required):**
- `/noodle-room/` (in-body, prose, not a footer link)
- `/menu/`
- `/locations/`
- all seven location pages
- `/about/`

**Schema:** `Organization` + `WebSite` + `Person` (Sam) + `ItemList` of locations. Per `SCHEMA.md`. No `Restaurant` on this page.

**Constraints:**
- The current live home page says Tajima makes everything in-house *"at every location."* **Do not carry this forward.** Rollout is unconfirmed and "every location" would include Maui, 2,500 miles from the commissary. See `CLIENT_FACTS.md`.
- The live page also claims noodles use "several types of flour, and water with the perfect pH level." No source. Do not carry forward without one.
- Hero image must not be the `north-park-and-crown-point` poster. North Park is closed.

---

## `/menu/`

| | |
|---|---|
| **Status** | NEW |
| **Template** | `menu` |
| **Priority** | **P0. Highest-confidence page on the project.** |
| **Data** | `menu.json` |

**Target keyword:** `tajima menu` (2,814 clicks, **66.1% CTR**, pos 1.36)
**Secondary:** `tajima ramen menu` (1,820 clicks, 44.8% CTR), `tajima menu san diego` (126 clicks, **78.3% CTR**, pos 1.00), `tajima ramen san diego menu` (113, 40.9%)
**Intent:** Informational, high commercial intent.
**Conversion goal:** Order online, or pick a location.

**Why this page exists:** 573 menu queries, **6,160 clicks, 28,144 impressions**, and there is no menu page. It currently lands on the home page or on PDFs. A Maui menu PDF earns 626 clicks at position 3.87.

**Title:** `Tajima Ramen Menu | Ramen, Izakaya, and Rice Dishes`
**H1:** `Menu`

**Section plan:**
1. **Location switcher.** Defaults to the full brand menu. Selecting a location filters every section below it, from the `locations` column. Client-side filter on already-rendered data, not a fetch, not a separate URL, no query param that Google can index as a duplicate.
2. One line above the ramen section: the noodles are made in our own room. Link to `/noodle-room/`. This is the only selling on the page.
3. Ramen. Ingredients only. The menu does not sell; the ingredients are the argument.
4. Izakaya.
5. Rice dishes.
6. Dessert.
7. Drinks.

**Why one page and not six (the reasoning, since this comes up):**

| Query type | Clicks | Lands today | Position |
|---|---|---|---|
| **No location in the query** (`tajima menu`, `tajima ramen menu`) | **4,634** | home page | 1.36 |
| **Location in the query** (`tajima ramen convoy menu`, etc.) | **~1,265** | the location page | ~2.0 |

Unlocated queries are **3.7x** the located ones and have no page at all. Located queries **already rank at ~position 2** on the location pages and do not need their own URL; the location page's menu section keeps that working. Four of seven menus are substantively the same (Convoy, Mercury, East Village, Crown Point share a core; Mercury adds sushi and the bar), so six pages would mean four near-duplicates splitting equity. The real variance is three locations: College Heights, Plaza Bonita, Maui. The `locations` column handles all three without an extra page.

**Internal links (required):**
- `/noodle-room/` (top of ramen section)
- `/menu/vegan-ramen/` (from the Vegan Ramen item)
- `/order-online/`
- `/locations/`

**Schema:** `Menu` with `hasMenuSection`. `@id` = `https://tajimaramen.com/menu/#menu`. Prices from `menu.json`, same source as the visible page, so schema and page cannot disagree.

**Constraints:**
- **Never generate, modify, or invent a menu item, description, or price.** `menu.json` is the only source.
- Items with `feature: no` render as plain lines. No photo, no card, no callout. This includes Carnitas Ramen, Tajima Fries, Curry Fries, Cream Cheese Wontons, Crispy Rice Spicy Tuna, Jalapeño Bomb.
- **Gluten-free: no GF noodle exists.** Do not imply one.
- **BLOCKED:** the carnitas decision. See Open Decisions #4. Recommendation is to list it plainly.
- **BLOCKED:** we do not have the per-location menus. See Open Decisions #12. Toast is the seed source. Nothing on this page can be built until `menu.json` exists.

---

## `/menu/vegan-ramen/`

| | |
|---|---|
| **Status** | NEW |
| **Template** | `dish` |
| **Priority** | P2 |
| **Data** | `menu.json` → `vegan` |

**Target keyword:** `vegan ramen san diego` (1,653 impr, **pos 11.30**, 9 clicks)
**Secondary:** `vegan ramen near me` (2,018 impr, pos 10.98, 25 clicks), `vegetarian ramen san diego` (1,284 impr, pos 10.81)
**Intent:** Informational + local.
**Conversion goal:** Pick a location.

**Why this page exists:** 588 vegan queries, 16,186 impressions, only 131 clicks, because we sit on **page two**. Real demand, real authority (2017 Vegan in San Diego runner-up, predates the craft pivot), and the spinach noodle is house-made, which turns a dietary query into a craft answer. **This is the only dish page that earns itself.**

**Title:** `Vegan Ramen in San Diego | Tajima`
**H1:** `Vegan Ramen`

**Section plan:**
1. The bowl. Ingredients from `menu.json`.
2. The spinach noodle: made in the Noodle Room, same as every other Tajima noodle. Link out.
3. Other vegan and vegetarian options (Vegetable Gyoza where offered, Vegetarian Fried Rice, Edamame).
4. Where to get it. Locations from `menu.json` `locations` column.

**Internal links (required):**
- `/noodle-room/`
- `/menu/`
- location pages that serve it (from data)

**Schema:** `WebPage` + `MenuItem` referenced by `@id` from `/menu/#menu`. Do not redefine the item.

**Constraints:** the vegan credibility predates the pivot. Do not frame it as new.

---

## `/noodle-room/`

| | |
|---|---|
| **Status** | NEW |
| **Template** | `editorial` (own visual identity, see `DESIGN_SYSTEM.md`) |
| **Priority** | **P0. The growth priority.** |
| **Data** | `CLIENT_FACTS.md` |

**Target keyword: NONE. This page has no keyword target.**

This is a correction to the Client DNA, which lists "handmade noodles ramen San Diego" as a **Critical** priority keyword. Every handmade / homemade / house-made / fresh-noodle query combined, across fifteen months: **20 rows, 33 impressions, 2 clicks.** The keyword does not exist. Nobody shops for ramen that way, and nobody knows Tajima's noodles are house-made anyway (zero mentions across 2,775 reviews).

**This page is justified on AEO, press, and conversion. Not search volume.** Do not set a ranking KPI on it. See `AEO.md`.

**Intent:** Belief.
**Conversion goal:** Belief, then `/menu/`.

**Title:** `The Noodle Room | Tajima Ramen`
**H1:** `The Noodle Room`

**Section plan:**
1. What it was before. Tajima bought its noodles. They came frozen, from a factory, like almost every ramen shop in America. **Stated as fact, never as a knock.** The reader does the math.
2. The room. Two years to build. Crown Point. A machine imported from Japan.
3. The noodles. Two types in production: the ramen noodle and the spinach noodle for the vegan bowl.
4. The broth. Made every morning in the same building, driven out before service.
5. `[QUOTE PENDING INTERVIEW]` (Sam on why he built it).
6. Where the noodles go. Link to locations.

**Internal links (required):**
- `/menu/`
- `/menu/vegan-ramen/` (from the spinach noodle line)
- `/tajima-crown-point/` (the room is there)
- `/about/`

**Inbound links (this page needs the most of any page on the site):** `/`, all seven location pages, `/menu/`, `/about/`, `/faq/`. It has no external equity and no search demand. It is fed entirely from inside.

**Schema:** `AboutPage` + `Place`. `publicAccess: false`. **No street address and no geo.** It is a working commissary, not a destination, and pinning it invites people to show up. Locality and ZIP (92109) only. **Not a `Restaurant`.**

**Constraints (strict, this is the highest-exposure page on the site):**
- Confirmed and usable: two years to build, machine imported from Japan, two noodle types, broth made every morning and driven to every SD location, previously bought frozen from a factory.
- **Do not write:** "every bowl at every location" (rollout unconfirmed), "made this morning" applied to noodles (confirmed for broth only), any flour type, hydration, water, pH, alkalinity, or aging claim (no source), the charcoal noodle (in development, not in production), "a few miles" (Crown Point to Plaza Bonita is ~17 miles).
- **Do not invent a Sam quote.** Not a paraphrase in quotation marks, not a composite from the video transcript dressed as speech. Use the marker.
- The Noodle Room lead's name is unknown. **Do not write around the gap by inventing a character.**
- **BLOCKED:** Maui's noodles. See Open Decisions.

---

## `/about/`

| | |
|---|---|
| **Status** | NEW (replaces `/about-us/`, which is Lorem Ipsum) |
| **Template** | `editorial` |
| **Priority** | P1 |

**Target keyword:** `sam morikizono`, `tajima ramen owner` (both low volume)
**Intent:** Informational.
**Conversion goal:** Belief, then `/noodle-room/`.

**Title:** `About Tajima Ramen | Founder-Built in San Diego Since 2001`
**H1:** `About`

**Section plan:**
1. Amagasaki. Sam's mother's cooking.
2. Rockford at nineteen. Washing dishes at J.M.K. Nippon. Masa-san.
3. The kitchens. Shogun, Los Angeles. Matsuhisa under Nobu Matsuhisa.
4. 2001, Convoy Street. It was already called Tajima. **"He didn't name it. He made it his."** Use this line here, once. Not in a hero. Do not overuse.
5. The 25 years. Six rooms.
6. The Noodle Room as the next chapter. Link out.
7. `[QUOTE PENDING INTERVIEW]`

**Internal links (required):**
- `/noodle-room/`
- `/locations/`
- `/tajima-convoy/` (the original)

**Schema:** `AboutPage`, `mainEntity` → `#founder` by `@id`. Do not redefine the Person.

**Constraints:**
- Matsuhisa: write "worked at Matsuhisa under Nobu Matsuhisa." **No year, no city, no title.** All undocumented.
- Founding date is **2001**. Older press says 1994. It is wrong. Do not use it, do not correct it publicly.
- Do not mention the cancelled 2024-25 Japanese acquisition.
- Do not use or engage the 2020 "too authentic" quote.
- Every sentence is a fact. No sentence tells the reader what to think about the facts. That restraint is the voice.

---

## `/locations/`

| | |
|---|---|
| **Status** | REBUILD |
| **Template** | `locations-index` |
| **Priority** | P1 |
| **Data** | `locations.json` |

**Target keyword:** `tajima locations`, `tajima ramen locations`
**Intent:** Navigational. **This is a router, not a destination.**
**Conversion goal:** Get the visitor to the right location page in one click.

**Current state:** 297,154 impressions, 557 clicks, **0.19% CTR.** The meta description is literally the single word `EIGHT`. So are `og:description` and `twitter:description`. The H1 reads `8 Loctions`. The `og:image` is `Tajima-North-Park-5.jpg`, a closed restaurant.

**Title:** `Tajima Ramen Locations | Six in San Diego, Plus Maui`
**Meta:** Write a real one. This single fix is worth more than most of the build.
**H1:** `Locations`

**Section plan:**
1. Six San Diego locations, from data. Each: neighborhood, address, phone, hours, one line on what's different here.
2. Maui, separately. Different market.
3. Tijuana: outbound link to tajimamx.com. Not a card.
4. North Park: one line, closed, link to the closure page.

**Internal links (required):** all seven location pages, `/tajima-north-park/`, `/menu/`

**Schema:** `CollectionPage` + `ItemList` referencing each `Restaurant` by `@id`. Does not redefine them.

**Constraints:**
- **The count is six San Diego locations. Eight total including Tijuana and Maui.** The current site says 8 in the heading and "six across San Diego, four in Tijuana, and one in Maui" (= 11) in the footer, one scroll apart. Fix both.
- North Park does not get a card.

---

## Location page template (applies to all seven)

Read this plus the individual brief below it.

**Template:** `location` | **Data:** `locations.json` → `[slug]`

**Universal section plan:**
1. Hero. This room, this neighborhood. Real photography of this location.
2. Address, hours, phone, parking. **From `locations.json`. Never hardcoded.**
3. What's different here. **The one section that must not be templated.** See individual briefs.
4. Menu section for this location, from `menu.json` filtered by `locations`. Link to `/menu/`.
5. Happy hour for this location, from data. Link to `/happy-hour/`.
6. One line: the noodles in your bowl are made in our own room in Crown Point. Link to `/noodle-room/`.
7. Order online, this location's Toast URL.

**Universal internal links (required on every location page):**
- `/noodle-room/` (in-body prose, not footer)
- `/menu/`
- `/locations/`
- `/happy-hour/`
- nearest neighbour only (see per-brief). **Not all six.**

**Universal schema:** `Restaurant` + `WebPage`. `@id` = `https://tajimaramen.com/[slug]/#restaurant`. `parentOrganization` → `#organization`. `acceptsReservations: false` on all seven. `hasMenu` → the right menu `@id`.

**Universal constraints:**
- NAP is **byte-identical to GBP**. Not the current website, not the Client DNA. Table below.
- `openingHoursSpecification`: **BLOCKED** on confirmed hours. Every DNA hours value is marked verify. Do not publish hours the door does not honor.
- No page mentions Carnitas Ramen, fusion framing, or North Park.

### NAP (GBP is the source of truth)

| Location | Address | Phone |
|---|---|---|
| Convoy | **4681 Convoy Street STE H**, San Diego, CA **92111-2330** | (858) 576-7244 |
| Mercury | 4411 Mercury Street #110, San Diego, CA 92111 | (858) 278-5367 |
| East Village | 901 E Street, San Diego, CA 92101-6511 | (619) 431-5820 |
| College Heights | 6061 El Cajon Boulevard Suite 2, San Diego, CA 92115 | (619) 269-0838 |
| Crown Point | 3782 Ingraham Street, San Diego, CA 92109 | (858) 203-3674 |
| Plaza Bonita | 3030 Plaza Bonita Road #2445, National City, CA 91950 | (619) 773-6164 |
| Maui | 1819 South Kihei Road, D105, Kihei, HI 96753 | (808) 214-5702 |

**The Convoy suite is STE H.** The DNA says "Suite A," which appears on **zero of 84 tracked Convoy listings** and was never real. The live conflict is STE H (GBP, data-axle with matching ZIP+4 92111-2330, bippermedia, restaurantguru, restaurantji, sirved) versus Ste I (MapQuest DA 88, yellowbot, giftly). Google's public display shows no suite, which is normal suppression and does not change the record. **Publish STE H.**

**Business name is `Tajima Ramen [Location]`** everywhere, matching GBP.

---

## `/tajima-convoy/`

| | |
|---|---|
| **Status** | REBUILD |
| **Priority** | P1 |
| **Traffic** | 9,704 clicks, 678,630 impr, pos 6.92 |
| **Map pack ("ramen")** | **ARP 5.47, SoLV 26.5%** |

**Target keyword:** `tajima convoy` (pos 2.83)
**Secondary:** `ramen convoy` (182 clicks, pos 2.83), `convoy ramen` (69, pos 2.33), `ramen in convoy` (42, pos 3.26), `best ramen san diego` (130 clicks, pos 8.61; **this page owns it, not the home page**), `okonomiyaki san diego` (56 clicks, pos 8.03)
**Intent:** Local + brand.

**Title:** `Tajima Ramen Convoy | The Original, on Convoy Street Since 2001`
**H1:** `Convoy`

**What's different here (section 3):** The original. 2001. The room Sam took over when it was already called Tajima. Communal tables. Full menu plus the expanded izakaya. Japanese, English, Spanish spoken. **Keep okonomiyaki on the page.** It earns 56 clicks and it is a real quirk of this room.

**Nearest neighbour link:** `/tajima-mercury/` only.

**Constraints:**
- **This page is doing the worst work of the six on the money keyword despite being the flagship.** ARP 5.47, SoLV 26.5%, in the densest ramen market in San Diego (Menya Ultra, RakiRaki, Santouka all within the grid). It is competing with the category, not with the other Tajimas. Content quality matters more here than anywhere.
- **Must not be a near-duplicate of Mercury.** They are two miles apart, same ZIP, and `localstack.com` already lists Convoy at Mercury's address while `frankiapp.com` has Convoy in Los Angeles. Google is not cleanly resolving these entities. Write them as different places.
- Three conflicting Yelp URLs are in circulation. **BLOCKED** on `sameAs`. See Open Decisions.
- GBP secondary categories should add `Noodle shop` (currently the only location that has it; all seven should).

---

## `/tajima-mercury/`

| | |
|---|---|
| **Status** | REBUILD |
| **Priority** | P1 |
| **Traffic** | 2,075 clicks, 267,989 impr, pos 5.27 |
| **Map pack ("ramen")** | **ARP 9.54, SoLV 4.1%. Worst of the six by a distance.** |

**Target keyword:** `tajima mercury`
**Secondary:** `ramen kearny mesa`, sushi and bar queries
**Intent:** Local + brand + group dining.

**Title:** `Tajima Ramen Mercury | Izakaya, Sushi, and Full Bar in Kearny Mesa`
**H1:** `Mercury`

**What's different here (section 3):** **The izakaya.** The only Tajima with sushi. The only full bar: craft cocktails, Japanese whisky, full wine list. The biggest room, ~90 seats, three TVs. Built for groups. Opened 2007. On-site parking.

**Nearest neighbour link:** `/tajima-convoy/` only.

**Schema:** `servesCuisine` adds `Sushi`. Amenities add full bar and on-site parking. **`acceptsReservations` stays `false`.** Group reservations are phone-only at one location and schema has no honest way to express that.

**Constraints:**
- **Mercury is invisible in the pack. SoLV 4.1% on "ramen."** Convoy, two miles away, is at 26.5%. Same market. This is the clearest evidence of Convoy/Mercury cannibalization on the project.
- **Mercury ranks worst of all six for `izakaya` (ARP 12.84)** despite being the only izakaya. Whatever repositioning is intended is not landing.
- **Must not be a near-duplicate of Convoy.**
- Mercury's Facebook page (`facebook.com/TajimaMercury`) has no address at all, flagged "not found" by the citation tracker. Mercury has **225 tracked citations with 36 duplicates** versus Convoy's 84 with 6. `acompio.us` has it in ZIP 92103 (Hillcrest).
- **OPEN:** Tajima plans to drop "Ramen" from Mercury's name. If it happens, GBP must follow (Google requires the real-world name). **Do not rename during the migration.** See Open Decisions.

---

## `/tajima-east-village/`

| | |
|---|---|
| **Status** | REBUILD |
| **Priority** | P1 |
| **Traffic** | 1,875 clicks, 368,189 impr, pos 5.90 |
| **Map pack** | `ramen` ARP 3.24, SoLV 67.4% · **`happy hour near me` ARP 1.00** |

**Target keyword:** `ramen near petco park`
**Secondary:** `ramen downtown san diego` (53 clicks, pos 4.66), `ramen east village san diego`, `tajima east village`
**Intent:** Local + brand + event-adjacent.

**Title:** `Tajima Ramen East Village | Ramen Near Petco Park, Downtown San Diego`
**H1:** `East Village`

**What's different here (section 3):** Walking distance from Petco Park. Opened 2016, interior by Paul Basile (BASILE Studio), ~64 seats. Six taps of local craft beer. **Padres home game nights: every tap beer $3.50, all day.** Street parking and nearby paid lots.

**Nearest neighbour link:** none. Nothing is close.

**Constraints:**
- **This location owns happy hour in the map pack. ARP 1.00.** Lead the happy hour section here and link hard to `/happy-hour/`.
- **Extended hours on Padres home game nights** means `openingHoursSpecification` cannot be static. Either model game nights accurately or omit them and let GBP carry it. **Do not publish hours the door does not honor.**
- Title currently reads "Best Asian Restaurant & Happy Hour." Both "best" and "Asian restaurant" are off-positioning and "best" is a banned claim.

---

## `/tajima-college-heights/`

| | |
|---|---|
| **Status** | REBUILD |
| **Priority** | P1 |
| **Traffic** | 4,066 clicks, 437,199 impr, pos 5.21 |
| **Map pack ("ramen")** | ARP 2.06, SoLV 87.8%. Strong. |

**Target keyword:** `tajima college area` (76 clicks, **50% CTR**, pos 1.31)
**Secondary:** `ramen near sdsu`, `tajima ramen college heights`
**Intent:** Local + brand.

**Title:** `Tajima Ramen College Heights | Ramen Bar Near SDSU`
**H1:** `College Heights`

**What's different here (section 3):** The Ramen Bar format. **Pared-down menu, not the full menu.** Open-kitchen layout. 20+ craft beer taps. Opened 2020. Serves the SDSU community. Street parking. English and Spanish.

**Nearest neighbour link:** none.

**Schema:** **needs its own `Menu` entity**, not the brand menu. Pointing it at `/menu/#menu` would advertise dishes it does not sell.

**Constraints:**
- Current title says "Ramen La Mesa & Near SDSU." **La Mesa is a different city.** Drop it.
- GBP primary is currently `Japanese restaurant` (Connor's test). Despite that, this location wins `ramen` at ARP 2.06 and **loses `japanese restaurants` at ARP 13.88.** See Open Decisions.

---

## `/tajima-crown-point/`

| | |
|---|---|
| **Status** | REBUILD |
| **Priority** | P1 |
| **Traffic** | 987 clicks, 150,540 impr, pos 7.10 |
| **Map pack ("ramen")** | **ARP 1.61, SoLV 93.9%. Best of the six.** |

**Target keyword:** `ramen pacific beach` (123 clicks, pos 4.59)
**Secondary:** `ramen crown point` (77 clicks, pos 7.26), `tajima crown point`
**Intent:** Local + brand.

**Title:** `Tajima Ramen Crown Point | Ramen in Pacific Beach, San Diego`
**H1:** `Crown Point`

**What's different here (section 3):** **The room is here.** The commissary and the Noodle Room are in this building. Broth for every San Diego location is made here every morning and driven out before service. Opened January 2025, ~2,000 sq ft. Strong local craft beer program (Mother Earth, Modern Times, Stone, Harland, Fall, Second Chance). Matcha-forward non-alcoholic program.

**Nearest neighbour link:** none.

**Internal links (additional, required):** `/noodle-room/` gets a **prominent** link here, not just the universal one-liner. This is the only location page where the Noodle Room is the differentiator rather than a footnote.

**Schema:** `containedInPlace` relationship to `/noodle-room/#place`.

**Constraints:**
- **The Toast ordering URL for this location says `tajima-pacific-beach-3782-ingraham-street`.** The site, GBP, and Toast disagree on this store's name. Live NAP inconsistency. Flag it; do not silently pick one.
- Do not publish the Noodle Room's street address on this page. Locality only.

---

## `/tajima-plaza-bonita/`

| | |
|---|---|
| **Status** | REBUILD |
| **Priority** | P2 |
| **Traffic** | 797 clicks, 48,965 impr, pos 9.61 |
| **Map pack ("ramen")** | ARP 2.53, SoLV 81.6%. Strong. |

**Target keyword:** `ramen plaza bonita` (54 clicks, pos 4.81)
**Secondary:** `tajima plaza bonita`
**Intent:** Local + brand.

**Title:** `Tajima Ramen Plaza Bonita | Ramen in National City`
**H1:** `Plaza Bonita`

**What's different here (section 3):** Quick-serve, mall format. **Limited menu. No alcohol.** Mall hours, not restaurant hours. Opened late 2020. South Bay's only Tajima. Mall parking.

**Nearest neighbour link:** none.

**Schema:** **needs its own limited `Menu` entity.** `knowsLanguage: ["es", "en"]`. Amenity list drops alcohol.

**Constraints:**
- **The craft story lands softer here.** National City is 63.5% Hispanic/Latino, family-driven, mall traffic, value-aware. The food being recognizably itself matters more than the Noodle Room. **Location copy adjusts. Brand voice does not.** Keep the Noodle Room line short.
- Mall hours are not restaurant hours. Do not copy the Convoy pattern.
- The current site's `tel:` href for this location is empty (`tel:+1%20`) while the number displays. Fix.

---

## `/tajima-ramen-maui-hawaii/`

| | |
|---|---|
| **Status** | REBUILD |
| **Priority** | P2 |
| **Traffic** | 1,392 clicks, 99,369 impr, pos 5.68. **The only page on the site growing** (72 → 110 → 128 across Q1 2026). |

**Target keyword:** `ramen kihei` (315 clicks, **14.2% CTR**, pos 3.70)
**Secondary:** `ramen maui` (130), `kihei ramen` (71, 14.5% CTR), `best ramen maui` (61), `ramen kihei maui` (57, 18.3% CTR), `ramen in kihei` (74, 11.1% CTR)
**Intent:** Local + brand + tourist.

**Title:** `Tajima Ramen Maui | Ramen in Kihei, Hawaii`
**H1:** `Maui`

**What's different here:** **Maui is not a location page in the same family as the six SD stores.** Different market, different menu, different timezone, 2,500 miles from the commissary. **It carries its own full menu inline.**

**Section plan (overrides the location template):**
1. Hero.
2. Address, hours, phone, parking.
3. **Full Maui menu inline**, from `menu.json` filtered to `maui`. Includes dishes that exist nowhere else (there is a Wagyu Shoyu Tonkotsu in the 2026 image files that appears in no other source).
4. Sushi rolls (Maui and Mercury only).
5. Order online.

**Internal links:** `/` and `/locations/` only. **Do not cross-link Maui into the San Diego set.** Different market.

**Constraints:**
- **BLOCKED: Maui's noodles.** Crown Point supplies San Diego. **Do not apply any "our noodles" or "our broth" claim to Maui until this is answered.** The filename `Tajima-Ramen-HM-Noodles-Raw-Angle-Five-Kihei.jpg` hints at local production, which would be a real find. Until confirmed, this page carries no Noodle Room claim.
- **The `www` host issue is concentrated here.** Maui queries land on `https://www.tajimaramen.com` (4,480 clicks). The canonical redirect matters more for Maui than anywhere.
- Three Maui menu PDFs are indexed and competing (07.24, 12.15.2024, 251209). All 301 here. The 07.24 PDF earned **626 clicks at position 3.87** before it was deindexed in February.
- Currency USD. Timezone `Pacific/Honolulu`, not `America/Los_Angeles`.

---

## `/tajima-north-park/`

| | |
|---|---|
| **Status** | **REBUILD, do not redirect** |
| **Template** | `closure` |
| **Priority** | P2 |
| **Traffic** | **2,833 clicks, 336,878 impr, 313 queries.** The fifth-biggest page on the site. |

**Target keyword:** `tajima north park` (1,334 clicks, **pos 1.64**)
**Secondary:** `tajima ramen north park` (414), `tajima ramen north park menu` (110), `ramen north park` (80)
**Intent:** Navigational, stale.
**Conversion goal:** **Route the human to Crown Point or East Village.**

**Why this page is not a 301:** a redirect to `/locations/` discards 2,833 clicks of intent and answers a question nobody asked. Build a real page that stays and captures it.

**Title:** `Tajima Ramen North Park Has Closed | Find Your Nearest Tajima`
**H1:** `North Park is closed`

**Section plan:**
1. The location is closed. Plain, short, no apology theater, no nostalgia.
2. The two nearest rooms: Crown Point and East Village. Address, hours, distance for each.
3. Nothing else.

**Internal links (required):** `/tajima-crown-point/`, `/tajima-east-village/`, `/locations/`

**Schema:** `WebPage` only. **No `Restaurant` entity. No address. No hours.** The store does not exist.

**Constraints:**
- **BLOCKED: needs Sam's sign-off.** This is a public statement about a closure and it is the "clean public note" the Brand Positioning doc has been asking for since May.
- **North Park's GBP is still live and still points here.** Its address is `3015 Adams Avenue STE 102B, 92116`, which is Normal Heights, not North Park. That profile needs to be marked permanently closed, separately from this page.
- **Dependency:** 148 internal links currently point at this page, all from the press archive being 410'd. Expect that number to drop to near zero by design. This page will be fed from `/locations/` instead.
- Do not link the 2022 Eater "Where to Dine Solo" piece anywhere on the site. It is about this location.

---

## `/happy-hour/`

| | |
|---|---|
| **Status** | **REBUILD and link it.** Currently orphaned with zero internal links. |
| **Template** | `hub` |
| **Priority** | P1 |
| **Data** | `menu.json` (happy hour section) |
| **Traffic** | 1,361 clicks with **no internal links at all** |

**Target keyword:** `tajima happy hour` (773 clicks, **49.0% CTR**, pos 2.02)
**Secondary:** `tajima ramen happy hour` (195, 42.6%), `tajima happy hour san diego` (129, 37.8%)
**Intent:** Brand + topic.
**Conversion goal:** Pick a location.

**Why this page exists:** `/happy-hour/` catches **1,107 happy-hour clicks across 165 queries. All six location pages combined catch 32.** A page with zero internal links outperforms the entire location set by 35x. The reason is structural: "tajima happy hour" contains no location. A location page cannot answer it.

**Title:** `Tajima Happy Hour | San Diego`
**H1:** `Happy Hour`

**Section plan:**
1. One line: happy hour runs at most locations and the details vary.
2. Per-location happy hour, from data. Days, times, what's on it.
3. Padres game nights: every tap beer $3.50, all day, at participating SD locations, excludes Plaza Bonita.
4. Plaza Bonita: no alcohol. Say it plainly.

**Internal links (required):** all six SD location pages, `/menu/`, `/locations/`

**Schema:** `WebPage`. No `Menu` entity (happy hour is a subset of the location menus already covered).

**Constraints:**
- **East Village has ARP 1.00 for `happy hour near me` in the map pack.** Every other location is 12-14. Lead with East Village.
- This must be in the nav. Its whole problem was that it was invisible internally.

---

## `/order-online/`

| | |
|---|---|
| **Status** | REBUILD |
| **Template** | `hub` |
| **Priority** | P1 |
| **Traffic** | 5,648 clicks, 355,269 impr, pos 5.17. **Third-biggest page on the site.** |

**Target keyword:** `tajima order online`
**Intent:** Transactional.
**Conversion goal:** Hand off to the right Toast URL in one click.

**Title:** `Order Tajima Ramen Online | Pickup and Delivery`
**H1:** `Order Online`

**Section plan:** One card per location. Name, neighborhood, Toast link. Nothing else. This page's only job is not to be in the way.

**Internal links:** `/locations/`, `/menu/`

**Schema:** `WebPage`. `OrderAction` lives on each `Restaurant` entity, not here.

**Constraints:**
- **The current site has two different Toast URL patterns**, one in the nav (`/tajima-convoy/v2/online-order`) and one in the body (`/tajima-convoy/v3/?mode=fulfillment`). Pick one. Verify all seven resolve.
- Crown Point's Toast URL says `tajima-pacific-beach`. Flag, do not silently fix.
- Plaza Bonita uses a `toasttakeout.page.link` shortlink, not a `toasttab.com` URL.

---

## `/gift-cards/`

| | |
|---|---|
| **Status** | REBUILD |
| **Priority** | P3 |
| **Traffic** | 224 clicks, **120,847 impr, 0.19% CTR** |

**Target keyword:** `tajima gift card`
**Intent:** Transactional.

**Title:** `Tajima Ramen Gift Cards`
**H1:** `Gift Cards`

**Internal links:** `/locations/`, `/menu/`

**Constraints:** 120,847 impressions at 0.19% is the same pathology as `/locations/`. Whatever the title and meta currently say, they are not earning the click. Write real ones.

---

## `/press/`

| | |
|---|---|
| **Status** | **REBUILD as an outbound index** |
| **Priority** | P3 |

**Target keyword:** none.
**Intent:** Utility. **This is the page journalists land on at the Noodle Room launch.**

**Title:** `Tajima Ramen in the Press`
**H1:** `Press`

**Section plan:** A curated list linking **out** to live articles on their own sites. Do not host clippings. Publication, headline, year, outbound link.

**Approved:** San Diego Magazine (multiple, incl. The Great Ramen Hunt 2020), Eater San Diego, San Diego Union-Tribune, Thrillist, Fodor's Travel, Westways, San Diego Reader, Edible San Diego, Crown City Magazine ("Craft Ramen Spots in San Diego," 2021), Beyondish ("Ramen Is Freedom," 2026), Nardcast (2019), Vegan in San Diego (2018).

**Constraints:**
- **Do not link the 2022 Eater "Where to Dine Solo" piece.** It is about North Park, which is closed.
- **Do not link the three ABC/KSBY EDD work-search stories.** Sam was quoted as an employer. Nothing to do with ramen.
- The 2020 San Diego Magazine profile contains the off-limits "too authentic" quote. It may be listed. Do not pull quotes from it.
- Awards: only with a specific name and year. `San Diego Magazine Best Restaurants 2022, Runner-Up for Best Ramen` is verified. `Vegan in San Diego, Best of 2017 Runner-Up, Vegan Ramen` is verified.

---

## `/careers/`

| | |
|---|---|
| **Status** | REBUILD (from `/careers-2/`) |
| **Priority** | P3 |
| **Traffic** | 602 clicks, pos 11.34 |

**Target keyword:** `tajima jobs`, `tajima careers`
**Intent:** Transactional.
**Title:** `Careers at Tajima Ramen`
**H1:** `Careers`
**Internal links:** `/about/`, `/locations/`

**Constraints:** the `-2` slug is a WordPress collision artifact. 301 the old URL.

---

## `/faq/`

| | |
|---|---|
| **Status** | NEW |
| **Priority** | P2 |
| **Data** | `faq.json` |

**Target keyword:** none. **This page exists for the answer engines.**

Google restricted FAQ rich results to government and health sites in 2023, so this earns nothing in blue links. It is still the only machine-readable surface where the Noodle Room questions get answered. See `AEO.md`.

**Title:** `Tajima Ramen FAQ`
**H1:** `Questions`

**Priority questions (from `AEO.md` answer targets):**
1. Does Tajima make its own noodles?
2. Where are Tajima's noodles made?
3. What is the Noodle Room?
4. How many Tajima locations are there in San Diego?
5. Does Tajima take reservations?
6. Does Tajima have vegan ramen?
7. Who owns Tajima Ramen?
8. Is there gluten-free ramen? (Answer: no GF noodle exists.)

**Internal links (required):** `/noodle-room/`, `/menu/vegan-ramen/`, `/locations/`, `/about/`

**Schema:** `FAQPage`. **Every `name` and `text` value copied from the rendered page, never written separately.** If an editor changes the page and not the schema, the page is broken.

**Constraints:**
- **FAQs come from `faq.json` only.** Until it exists, flag as draft-pending-client-approval. **Never invent one as fact.**
- Answer in the first sentence. No preamble. These are written to be lifted by a machine.

---

# Migration

## Redirect map

| Old | New | Why |
|---|---|---|
| `https://www.tajimaramen.com/*` | `https://tajimaramen.com/*` | 4,480 clicks |
| `http://www.tajimaramen.com/*` | `https://tajimaramen.com/*` | 2,075 clicks |
| `http://tajimaramen.com/*` | `https://tajimaramen.com/*` | 1,806 clicks |
| `/*?utm_source=*` | clean URL | 10,811 clicks |
| `/about-us/` | `/about/` | Lorem Ipsum. Zero equity. |
| `/careers-2/` | `/careers/` | 602 clicks |
| `/contact-us/` | `/locations/` | orphan, 1 impr |
| `/home-4/` | `/` | orphan duplicate home page |
| `/tajima-hillcrest-drink-menu/` | `/menu/` | orphan, 45 clicks, pos 32.89. Hillcrest is gone. |
| `/reservation/` | **410** | dead form, walk-in only. Do not redirect a reservation URL to a page saying we take none. |
| `/blog-slider/` | **410** | test page |
| `/wp-content/uploads/2024/07/Tajima-maui-food-menu-07.24.pdf` | `/tajima-ramen-maui-hawaii/` | **626 clicks, pos 3.87** |
| `/wp-content/uploads/2024/12/Tajima-maui-food-menu-12.15.2024.pdf` | `/tajima-ramen-maui-hawaii/` | 249 clicks |
| `/wp-content/uploads/2025/12/Tajima-maui-full-Menu-251209.pdf` | `/tajima-ramen-maui-hawaii/` | 206 clicks |
| `/wp-content/uploads/2024/12/2024-11_tajima-cp-food-menu_11x17.pdf` | `/menu/` | 418 clicks |
| `/wp-content/uploads/2021/11/Crown-City-Magazine_Tajima.pdf` | **410** | 3 clicks on 10,757 impr |
| `/2020/*`, `/2021/*`, `/2022/*` (75 posts) | **410** | see below |
| `/category/press/*` (8 pages) | **410** | duplicate archive |
| `/press/page/2-5/` | **410** | the other duplicate archive |
| `/author/tajimaramen/*` | **410** | author archive |

## Killing the press archive: 410, not 301

75 posts, ~230 words each, dead since May 2022, in **two parallel paginated archives**, reaching click depth 10. Combined traffic: ~50 clicks a year. Three are ABC/KSBY EDD stories.

410 them. Do **not** 301 to `/press/`. Mass-redirecting 75 unrelated URLs to one page reads as soft 404 and helps nothing.

## Do before launch, not at launch

`/about-us/` is **Lorem Ipsum, published, and listed in `page-sitemap.xml`.** Google can reach it. Noindex or 410 it this week.

## Pre-existing stack

WordPress, Elementor 4.1.5, Rank Math, Sure Sites Inc. `header-sitemap.xml` and `footer-sitemap.xml` are leaking Elementor template parts into the sitemap index. Do not reproduce.

---

# Content Provenance

- **Copy:** agency-produced, AI-assisted, human-approved. Every line ships through a human. See `voice-tone.md`.
- **Images: do not exist.** The documentary Noodle Room and commissary shoot has not happened. **No page ships with placeholder or AI imagery.** The positioning is that the work is real; faking the proof kills it. Largest non-copy dependency on the project.
- **Deadline:** gated on the Sam interview. Every `[QUOTE PENDING INTERVIEW]` marker is a launch blocker by design.

---

# Open Decisions

Each blocks something specific. Do not guess. Flag `[TO BE CONFIRMED]` per `CLAUDE.md`.

| # | Decision | Blocks | Owner |
|---|---|---|---|
| 1 | **Maui's noodles.** Crown Point supplies SD. Maui is 2,500 miles away. Either Maui makes its own (filename `...HM-Noodles...Kihei.jpg` hints at it) or it buys them and every "our noodles" claim scopes to San Diego. | `/tajima-ramen-maui-hawaii/`, `/`, `/noodle-room/` | Sam / Amanda |
| 2 | **Rollout status.** Is every SD location on house-made noodles? | any "every location" claim sitewide | Amanda (Interview Q14) |
| 3 | **Noodle cadence.** "Made this morning" is confirmed for broth only. | `/noodle-room/`, slogan use | Amanda (Q13) |
| 4 | **Carnitas.** Recommendation: list plainly on `/menu/`, `feature: no`, nowhere else. A website menu contradicting the printed menu is a front-of-house problem, not a quiet phase-out. | `/menu/` and its schema | Sam |
| 5 | **North Park closure copy.** | `/tajima-north-park/` (2,833 clicks) | Sam |
| 6 | **Mercury rename.** If "Ramen" drops, GBP must follow (Google requires the real-world name; a keyword in it is a suspension risk). **Do not rename during the migration.** 225 citations with 36 duplicates means redoing all of them, and stacking a rename on a migration makes attribution impossible. Launch, stabilize, then rename in one push. | `/tajima-mercury/` naming and schema | Sam / Steve |
| 7 | **Canonical Yelp and Facebook URLs.** Convoy has three conflicting Yelp URLs (tracker: `tajima-ramen-convoy-san-diego-3`; footer: `tajima-ramen-house-san-diego-11`; DNA: `tajima-ramen-convoy-san-diego`). Mercury has two. Facebook has a brand page, a legacy `pages/Tajima/327708408981`, and per-location pages. | `sameAs` on all seven | Connor |
| 8 | **GBP category test.** Revert College Heights and Mercury to `Ramen restaurant`? Evidence below. | GBP, not the build | Connor / Steve |
| 9 | **Confirmed hours, all seven.** Every DNA value is marked verify. | `openingHoursSpecification` | Amanda |
| 10 | **Legal entity.** Footer says `Tajima Restaurants Inc.` The DNA says `Tajima Holdings, Inc.` (the Japanese filing entity, not the US operator). Verify against CA SoS. | `Organization.legalName` | Steve |
| 11 | **Noodle Room lead's name.** | second character in the brand story | Sam (Q12) |
| 12 | **The per-location menus. We don't have them.** We have brand-level prices and we know three locations differ. We don't know what each location actually serves. **Toast is the seed source** (see The menu data layer). Needs: does Tajima have Toast RMS Essentials or higher, and who has Manage Integrations on the seven locations? If Toast access is a dead end, fallback is a manual pull from Amanda. | **`/menu/`, every location menu section, every Menu schema entity. The highest-confidence page on the project cannot be built without it.** | Amanda / Marco |
| 13 | **Is there an events program?** Recurring cadence, or two things a year? The Parfait Party collab suggests recurring. Determines whether `/events/` is a phase 2 page or a GBP post. | `/events/` (deferred, not v1) | Amanda |
| 14 | **Does Tajima do catering?** `ramen catering san diego` sits at position 7.60. DNA says `[TBD]`. Connor doubts it. **Do not imply it exists either way until answered.** | a Mercury section, if yes. Not a page. | Amanda |
| 15 | **`DESIGN_SYSTEM.md`'s font section contradicts the signed reference.** The doc restricts Bright Sunshine Caps to pull quotes, merch, and promo moments and says it must not be the default `h1`/`h2` on craft-led pages. The signed `tajima-home.html` ships `data-fonts="brand"`, which makes it exactly that. **Resolved in favor of the signed file** (Steve, build night): the reference is the higher authority per the doc's own "paste, don't retype" instruction, and the build ships `theme.fonts: "brand"` in `site.json`. **The doc still needs the follow-up edit** so the restriction note matches what shipped. Editorial fonts remain a one-value flip if this reverses. | `DESIGN_SYSTEM.md` accuracy, not the build | Steve / Ana |
| 16 | **Brand font licensing and hosting.** Bright Sunshine Caps and Calps load as `.ttf` from `cdn.circulationstudio.com/tajima-temp/`, carried over from the reference concepts. `DESIGN_SYSTEM.md` Open Item #2 has web-embedding licensing unconfirmed for both. Needs: confirm the license covers web embedding, then self-host as `woff2` under `public/fonts/` to drop the third-party connection off the critical render path and cut the TTF payload. | launch (both a licensing exposure and an LCP cost) | Steve / Ana |

## On #8, the category test

Connor switched College Heights and Mercury to `Japanese restaurant` primary to test whether Tajima could win outside ramen. There is no before-scan, so this is cross-sectional, not a true before/after. But:

- **Neither Japanese-primary location wins `japanese restaurants`.** College Heights ARP 13.88, Mercury 13.25. Convoy, with `Ramen restaurant` primary, ranks **better** at 12.00.
- **Nobody ranks for `japanese restaurants`.** All six are 12-15 ARP, ~2% SoLV.
- **Convoy vs Mercury is the cleanest natural experiment available.** Same market, two miles apart. Convoy (Ramen primary) ARP 5.47, SoLV 26.5%. Mercury (Japanese primary) ARP 9.54, SoLV 4.1%.
- **`ramen` is the only keyword Tajima owns in the pack.** SoLV is ~2% for restaurants, japanese restaurants, asian restaurants, and happy hour across all six. Ramen ranges 4% to 94%.

**Recommendation: revert both to `Ramen restaurant`, and add `Noodle shop` as a secondary on all seven** (only Convoy has it today). The test did not produce a win on its target category and Mercury is at 4% SoLV on the only keyword that matters. Caveat honestly: College Heights holds ARP 2.06 on `ramen` with Japanese primary, so the category is not the dominant variable. Market density is. Convoy and Mercury are losing because they sit inside San Diego's densest ramen market, next to Menya Ultra and RakiRaki, not because of a dropdown.

---

# Data Appendix

## Provenance

| Source | Detail |
|---|---|
| SEOcrawl GSC export | 30-04-2025 to 14-07-2026. 25,219 queries, 147 pages. |
| SEOcrawl monthly | Pages and Queries, Jan / Feb / Mar 2026 |
| BrightLocal Citation Tracker | Convoy (84 listings), Mercury (225) |
| GBP export | all seven locations, incl. North Park |
| SEO PowerSuite crawl | 98 pages |
| Local Falcon | 6 locations x 6 keywords, 7x7 grid, 1mi (EV 0.8mi), 2026-07-11 |
| Live fetches | `/`, `/locations/`, sitemap index, page sitemap, post sitemap |

## Local Falcon, 2026-07-11 (ARP / SoLV)

| Location | ramen | restaurants | japanese restaurants | asian restaurants | izakaya | happy hour near me |
|---|---|---|---|---|---|---|
| Crown Point | **1.61 / 93.9%** | 2.00 / 2% | 12.46 / 10.2% | 13.25 / 2% | 6.23 / 18.4% | 2.00 / 2% |
| College Heights | **2.06 / 87.8%** | 2.00 / 2% | 13.88 / 2% | 3.00 / 2% | 7.40 / 14.3% | 14.25 / 2% |
| Plaza Bonita | **2.53 / 81.6%** | 2.00 / 2% | 15.13 / 2% | 1.00 / 2% | 7.31 / 10.2% | 2.00 / 2% |
| East Village | 3.24 / 67.4% | 12.67 / 2% | 12.67 / 2% | 9.67 / 2% | 8.86 / 6.1% | **1.00 / 2%** |
| Convoy | **5.47 / 26.5%** | 13.50 / 2% | 12.00 / 2% | 13.00 / 0% | 15.83 / 2% | 14.38 / 2% |
| Mercury | **9.54 / 4.1%** | 9.00 / 2% | 13.25 / 2% | 1.00 / 2% | 12.84 / 4.1% | 12.14 / 2% |

Read: **ramen is the only keyword with real map visibility.** Everything else sits at ~2% SoLV, which means ranking at one grid point out of 49. The `asian restaurants` ARP 1.00 at Mercury and Plaza Bonita are artifacts of that: ranked first at one square, nowhere else (ATRP 20.59 and 20.63).

## Why the site is declining (context, not a build task)

Q1 2026: clicks 6,583 → 5,094 → 3,361. Impressions 270,957 → 177,307. **But positions held or improved** (home page 8.88 → 6.70). Brand clicks fell 31% (6,237 → 4,304); **non-brand impressions fell only 8%.** "tajima ramen" 2,395 → 1,555. "tajima" 1,313 → 865.

78,534 of 87,921 annual clicks are brand queries. **Fewer people are searching for Tajima by name. No technical fix addresses that; the positioning work does.** The site's job is to convert what arrives and stop leaking the rest.

Seasonality cannot be tested: SEOcrawl's archive begins 30 April 2025 and GSC's 16-month window erased Jan-Mar 2025 before the property was connected. The clean like-for-like figure is the July YoY: **-38% clicks, -27% impressions.**

Nothing happened in February. The slide is smooth and starts in January.

## Known data defects (do not re-derive)

- **March Pages export has Convoy at 204 clicks; March Queries export has it at 355.** Keyword-level clicks cannot exceed page-level clicks. The Pages row is broken. **Convoy's apparent 75% March collapse is an artifact.** Query-level Convoy is flat: 207 → 187 → 162 clicks, impressions 1,143 → 1,046 → 1,141.
- The `urlView` export's Trend columns claim Convoy is +147% against an unstated comparison window. Do not quote.
- The first aggregate export's Trend columns were empty (`Trend Clicks` == `Clicks`).
- The first February Queries export covered a single day (01-02-2026 to 01-02-2026, 187 clicks). Superseded by the full-month pull (6,422 clicks).

---

# How we'll know it worked

The brand-demand problem is not a site problem, so ranking screenshots will not tell this story.

| Measure | Baseline | Target |
|---|---|---|
| Menu intent captured | 6,160 clicks landing on a home page or a PDF | `/menu/` ranks for `tajima menu`, absorbs them, PDFs gone |
| Noodle Room citation share | **documented zero** (0 house-made mentions across 2,775 reviews; ~0 press) | Ask the engines the 8 `AEO.md` targets pre-launch, record, re-ask at 90 and 180 days |
| Non-brand impressions | ~46-53K/month, flat while brand collapses | first place the positioning work shows up |
| Convoy SoLV on `ramen` | 26.5% | the flagship should not be fifth of six |
| Mercury SoLV on `ramen` | 4.1% | anything |

**Do not set a ranking KPI on `handmade noodles ramen San Diego`.** It has 33 impressions in fifteen months. The DNA calls it Critical. It is not a keyword.
