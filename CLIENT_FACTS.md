# CLIENT_FACTS.md

The single source of truth for facts about Tajima Ramen. Any page copy, schema value, metadata, or claim must trace back to this file. If a fact is not here and not confirmed, do not publish it. When in doubt, leave a placeholder and flag it, never invent.

Source: Tajima Client DNA v1 (May 19, 2026), Tajima Brand Positioning v1 (May 2026), the October 2025 Brand Guidelines, Sam Morikizono's Noodle Room video transcript, BrightLocal review exports (Convoy and Mercury, July 2026), and GBP audits (Convoy and College Heights). Fields marked CONFIRM are open with the client and must not be published as settled until resolved.

---

## The two hard rules for this brand

1. **Show the work, never claim it.** Tajima's entire position rests on things that are physically true: a room, a machine, a broth pot, 25 years. The moment copy asserts quality instead of demonstrating it, the position collapses into the same soft authenticity language every competitor uses. Never write "authentic." Write the fact that would make someone conclude it. See voice-tone.md.
2. **This is a sharpening, not a rebrand.** Tajima led with welcome for 25 years and it worked. We now lead with craft, and the welcome stays underneath. Nothing on any surface may suggest a break with the past, a new era, a relaunch, or that the previous product was inferior. The brand walks into the next decade more itself, not someone else. If a line reads like an announcement, it is wrong.

---

## Identity

- Public / trade name: Tajima Ramen
- Legal name: Tajima Holdings, Inc. is the entity named in 2024 to 2025 Japanese corporate filings, with Sam Morikizono listed as representative. The **US operating entity name is CONFIRM** and must not be published until resolved.
- Founder and owner: Isamu "Sam" Morikizono. Sole owner. Still runs the business.
- Year established: 2001. **The restaurant existed under the Tajima name before Sam took it over.** He did not name it. This is a positioning asset, not a footnote.
- Type: Japanese ramen house. Multi-location, founder-led, centrally supplied.
- Category: craft Japanese ramen house. Not fusion, not a single-bowl purist shop, not a national chain, not minimalist import luxury.
- Locations: 8 total. 6 in San Diego (Convoy, Mercury, East Village, College Heights, Crown Point, Plaza Bonita), 1 in Tijuana, 1 in Maui. **North Park is permanently closed as of early 2026.**
- Production: a Crown Point commissary simmers broth daily for all San Diego locations and houses the Noodle Room, which produces house-made noodles. This is the strategic hub of the entire brand.
- Site scope: **CONFIRM** whether tajimaramen.com carries Tijuana and Maui or whether they are separate properties. This blocks the schema graph and the locations index. Do not half-include them.

**Known site defect:** the official site currently contradicts itself on location count (8 in one place, 6+4+1=11 in another, reality is 6+1+1=8). This must be fixed before any new positioning work goes live.

---

## NAP (must be byte-identical everywhere: site, GBP, Yelp, Apple, directories)

There is no single brand NAP. Tajima is six San Diego addresses, and each is its own citation entity. The Convoy address is the canonical **primary** for brand-level purposes only.

**Citation health is a known problem.** The Convoy GBP audit scored 25/100. Name inconsistency exists across platforms (Apple Maps shows "Tajima," Facebook shows "Tajima (Convoy)"). A suite number discrepancy exists across directories. Every NAP value below must be reconciled against GBP before it ships, because the site will propagate whatever we pick.

### Location 1: Convoy (the original, the flagship)
- Address: **4681 Convoy Street STE H, San Diego, CA 92111-2330** (RESOLVED 2026-08-03, see below)
- Phone: **(858) 576-7244**
- GPS: CONFIRM (pull from GBP)
- GBP URL: CONFIRM
- Yelp: https://www.yelp.com/biz/tajima-ramen-convoy-san-diego
- Opened 2001. Lot parking. Full menu plus expanded izakaya. Communal table seating.
- Languages: English, Japanese, Spanish
- Highest review volume of any location (40 of 154 in the 2025 five-star sample).

> **Correction, 2026-08-03 (build night).** This entry previously read "Suite A" and marked the suite CONFIRM and blocking. **That was wrong and it is now resolved: the suite is STE H.**
>
> Source: the `NAP (GBP is the source of truth)` table in `SITE_ARCHITECTURE.md`, under the Location page template. Its finding: **"Suite A" appears on zero of 84 tracked Convoy listings and was never real.** The genuine live conflict was STE H (GBP, data-axle with a matching ZIP+4 of 92111-2330, bippermedia, restaurantguru, restaurantji, sirved) against Ste I (MapQuest DA 88, yellowbot, giftly). Google's public display shows no suite at all, which is normal suppression and does not change the record. The instruction is explicit: **publish STE H.**
>
> This mattered because `CLIENT_FACTS.md` is first in the `CLAUDE.md` priority order, so an agent following the priority order literally would have published a suite number that has never existed on any listing, into schema, onto a page, and out into the citation graph the Convoy audit already scored 25/100.
>
> Phones, and the street addresses and ZIPs for all seven locations, come from the same table and are now filled in below. **Hours remain the one NAP field still blocked** (`SITE_ARCHITECTURE.md` Open Decision #9).

### Location 2: Mercury
- Address: **4411 Mercury Street #110, San Diego, CA 92111** (per the `SITE_ARCHITECTURE.md` NAP table, 2026-08-03)
- Neighborhood: **Kearny Mesa.** (Restored 2026-08-03: the NAP paste above replaced the line that carried this, which was the only place the file attributed Kearny Mesa to Mercury. Corroborated by `SITE_ARCHITECTURE.md`, whose `/tajima-mercury/` title is "Izakaya, Sushi, and Full Bar in Kearny Mesa".)
- Phone: **(858) 278-5367**
- GPS / GBP URL / Yelp: CONFIRM
- Opened 2007. Largest format, roughly 90 seats, three 40-inch TVs. On-site parking.
- **Sushi: CORRECTED 2026-08-04.** This entry previously read "The only location with sushi." **That was wrong.** East Village's live Toast catalog carries a Salmon Sushi Hand Roll and a Spicy Tuna Sushi Hand Roll, both $6.50. Mercury is **not** the only San Diego location with sushi. What Mercury uniquely has is the full sushi *programme*: four sashimi plates and eleven specialty rolls, against East Village's two hand rolls. Write scale, not exclusivity. Source: `src/_data/toastMenus/mercury.json` and `east-village.json`, pulled 2026-08-04.
- Full bar, craft cocktails, Japanese whisky, full wine list. Expanded izakaya program.
- Group reservations accepted by phone. Not walk-in-only in the same sense as the others, but **do not emit `acceptsReservations: true`** (see Booking and Access).
- Runs Yelp Ads. A performance audit is the decision gate before any rating campaign.

### Location 3: East Village
- Address: **901 E Street, San Diego, CA 92101-6511** (per the `SITE_ARCHITECTURE.md` NAP table, 2026-08-03)
- Neighborhood: **East Village, in downtown San Diego.** (Restored 2026-08-03, same cause as Mercury above. "East Village" is itself a neighborhood target in Service Area; "downtown" is the parent district and is how the East Village persona is described.)
- Phone: **(619) 431-5820**
- GPS / GBP URL / Yelp: CONFIRM
- Opened 2016. Interior by Paul Basile (BASILE Studio). Roughly 64 seats. Street parking and nearby paid lots.
- Walking distance from Petco Park. Six taps of local craft beer. Padres game-night beer specials and extended hours on home game nights.
- Second-highest review volume (32 of 154 in the 2025 sample).

### Location 4: College Heights
- Also known as Tajima Ramen Bar, College Heights.
- Address: **6061 El Cajon Boulevard Suite 2, San Diego, CA 92115** (per the `SITE_ARCHITECTURE.md` NAP table, 2026-08-03)
- Phone: **(619) 269-0838**
- GPS / GBP URL / Yelp: CONFIRM
- Opened 2020. **Pared-down ramen-bar menu, not the full menu.** Open-kitchen layout. 20+ craft beer taps. Street parking.
- Languages: English, Spanish.

### Location 5: Crown Point
- Address: **3782 Ingraham Street, San Diego, CA 92109**
- Phone: **(858) 203-3674**
- GPS / GBP URL / Yelp: CONFIRM
- Opened January 12, 2025 (per 2025 Japanese corporate filing). Roughly 2,000 sq ft. Street parking.
- **Houses the commissary and the Noodle Room.** Broth for every San Diego location is made here every morning. ZIP 92109 confirmed via job listings.
- Strong local craft beer focus. Matcha-forward non-alcoholic program.

### Location 6: Plaza Bonita
- Address: **3030 Plaza Bonita Road #2445, National City, CA 91950** (per the `SITE_ARCHITECTURE.md` NAP table, 2026-08-03)
- Phone: **(619) 773-6164**
- GPS / GBP URL / Yelp: CONFIRM
- Opened late 2020. **Quick-serve, food court format. Limited menu. No alcohol.** Mall parking, mall hours.
- Languages: Spanish (primary), English.
- South Bay's only Tajima. National City is 63.5% Hispanic/Latino per US Census QuickFacts.
- Lowest review volume of all SD locations (5 of 154 in the 2025 sample).

### Tijuana
- **CONFIRM operating count.** Older public materials reference up to four Tijuana locations. Current site materials are inconsistent. Get the truth before anything publishes.
- Currency MXN. Languages: Spanish primary, English, Japanese.

### Maui (Kihei)
- Address: **1819 South Kihei Road, D105, Kihei, HI 96753** (per the `SITE_ARCHITECTURE.md` NAP table, 2026-08-03)
- Phone: **(808) 214-5702**
- Yelp: https://www.yelp.com/biz/tajima-ramen-maui-kihei
- Full ramen menu, sushi rolls (similar to Mercury), izakaya plates.
- **Noodles: every ramen item on Maui's live Toast menu is labelled "HM Noodles"** (observed 2026-08-04). Stronger evidence than the `...HM-Noodles...Kihei.jpg` filename it supersedes, because it comes from Tajima's own operational system and is applied consistently rather than appearing once. **It is not confirmation.** "HM" is presumed to mean house-made, which is an inference, and the label says nothing about mechanism: made on site, shipped in, or a tag inherited from the San Diego catalog. All three read identically in Toast and all three change what the site may say. **Still blocked**, see `SITE_ARCHITECTURE.md` Open Decision #1.

### Brand-level
- Website: https://tajimaramen.com
- CMS: WordPress **CONFIRM**
- Public email: CONFIRM
- Timezone: America/Los_Angeles (Pacific). Maui is Pacific/Honolulu.
- Price range: $$
- Payment accepted: Visa, Mastercard, American Express, Discover, Apple Pay, Google Pay, cash
- Average check per person: $22 to $28 (one ramen, one appetizer, one drink)
- Employee count: **CONFIRM.** Estimate is 150 to 200 across all locations including commissary and Noodle Room production. Keep it soft or omit.

---

## Hours (FLAGGED, do not ship schema hours until resolved)

Every hours value in the Client DNA is marked verify. Hours have changed multiple times across 2024 to 2026. **Do not populate `openingHoursSpecification` from this file.** Pull from GBP, confirm with Tajima, then ship.

- Convoy per DNA: Mon to Thu and Sun 11:00 AM to 10:00 PM; Fri and Sat 11:00 AM to 11:00 PM. **All CONFIRM.**
- Mercury, East Village, College Heights, Crown Point: CONFIRM per location.
- Plaza Bonita: mall hours, typically 10 or 11 AM to 7 or 9 PM. **Mall hours are not restaurant hours and must not be copied from the Convoy pattern.**
- **East Village runs extended hours on Padres home game nights.** This means the hours block cannot be static. Either model game nights accurately or omit them and let GBP carry it. Do not publish hours the door does not honor.
- Holiday note: typically regular hours on most US holidays except Thanksgiving and Christmas Day. Verify quarterly.

---

## The team

Publish only confirmed names and roles. Do not attribute a title, a technique, or a quote to any named person unless it is confirmed below.

- **Isamu "Sam" Morikizono.** Founder and owner. Born and raised in Amagasaki, near Osaka. Moved to the US at 19 to work at J.M.K. Nippon in Rockford, Illinois, where he was mentored by a kitchen veteran known as Masa-san. Worked through Japanese kitchens including Shogun in Los Angeles and Matsuhisa under Nobu Matsuhisa before taking over the Convoy restaurant in 2001. Listed as representative of Tajima Holdings, Inc. in 2024 to 2025 Japanese corporate filings.
- **Noodle Room lead: UNKNOWN.** The role exists (job listings prove it). We do not have the name. **This is a top-priority gap.** The brand story needs a second human character and we do not write around the gap by inventing one.
- **Executive chef / culinary director: UNKNOWN.** Not publicly documented. CONFIRM via Sam.
- **General manager / operations lead: UNKNOWN.** Not publicly documented. CONFIRM via Sam.

**Front-of-house names appearing repeatedly in five-star reviews:** Joanne, Jayce, Alec, Mark, Brandon, Stephanie, Sahari, Natasha, Marilyn Elizabeth, Kali, Austin. Locations and titles CONFIRM. These names are real and they are the evidence for the service claim, but **do not publish a named staff profile without that person's consent and Tajima's approval.**

**Service is the most-praised element of the brand.** 131 of 154 five-star reviews in the 2025 sample mention service, ahead of food. This is operationally produced, not marketing language.

---

## Quotes (strict: this is the biggest exposure on the project)

**Sam has not been interviewed yet.** Everything below follows from that.

CONFIRMED and usable:
- "Ramen is freedom." (Beyondish Chef Q&A, 2026)

OFF LIMITS:
- The 2020 San Diego Magazine quote about not wanting ramen "too authentic." Do not use it, do not engage it, do not publicly acknowledge the shift away from it. It is the reason the interview matters.

**Do not write a Sam quote.** Not a paraphrase in quotation marks, not a composite from the video transcript dressed up as speech, not a "something he would say." A fabricated founder quote on a site whose entire argument is "this is real" is the one mistake that cannot be walked back. Pages that want a quote get a `[QUOTE PENDING INTERVIEW]` marker, and those markers are a launch blocker by design.

Facts from the video transcript may be written **as prose in the brand voice**, never as speech. See voice-tone.md Quote Rules.

---

## The Noodle Room (the differentiator, handle precisely)

CONFIRMED (Sam video transcript):
- Tajima previously bought noodles. They came frozen, from a factory.
- Sam spent **two years** building the Noodle Room.
- The noodle machine was **imported from Japan**.
- **Two noodle types** are currently in production: the ramen noodle and the spinach noodle (which goes into the vegan bowl).
- Broth is made **every morning** in the same Crown Point building and manually delivered to every San Diego location.

NOT CONFIRMED, do not publish:
- **Rollout status.** House-made noodles are rolling out to all locations. Whether every location has switched over is unknown. Write "made in our own Noodle Room," **not** "every bowl at every location," until this is answered. The site cannot make a claim the kitchen has not finished delivering.
- **Noodle production cadence.** "Made this morning" is confirmed for **broth only**. It is not confirmed for noodles. This is the easiest wrong sentence on the whole site to write, and the approved slogan makes it likelier.
- **Distance framing.** "A few miles" is true for the beach locations and false for South Bay (Crown Point to Plaza Bonita is roughly 17 miles). Prefer "in Crown Point," "across town," or "in our own kitchen." Use a mileage number only if someone measures it.
- **Charcoal noodle.** Referenced as in development. Not in production. Do not publish.
- Any claim about flour type, hydration, water, alkalinity, or aging time. Nobody has told us any of it.

**Press footprint: zero.** The Noodle Room has almost no existing coverage. Zero mentions of "house-made" or "handmade" noodles appear across 2,775 captured reviews (Convoy and Mercury). This is an asset, not a gap. Nobody knows this yet, which means the launch narrative is entirely ours to frame, and the copy is telling people for the first time rather than reminding them.

---

## The menu

Signature dishes and confirmed prices (current as of the menu file, **prices drift, treat as CONFIRM before shipping schema `offers`**):

- Traditional Tonkotsu Ramen, $15.50. The foundation dish.
- Tajima Red / Tajima Black / Tajima White, $17.50 each. The signature trio.
- Spicy Sesame Ramen, $17.50. A widely-praised crave dish.
- Chicken Ramen, $17.00.
- Vegan Ramen, $17.00. **House-made spinach noodles.** Vegan credibility predates the craft pivot (Best of 2017 Runner-Up, Vegan in San Diego).
- Miso Ramen, $18.50.
- Pork Gyoza, $7.50.
- Karaage, $8.50. Most universally available izakaya item across all locations.
- Garlic Edamame, $5.50. Most-mentioned appetizer in five-star reviews.
- Matcha Panna Cotta, $6.00. The signature dessert.

**Menus differ by location.** Convoy, Mercury, East Village, and Crown Point run the full menu. **College Heights runs a pared-down ramen-bar menu. Plaza Bonita runs a limited quick-serve menu with no alcohol.** ~~Mercury and Maui are the only locations with sushi.~~ **CORRECTED 2026-08-04: false. East Village carries two sushi hand rolls. Mercury has the only full sushi programme in San Diego; Maui has rolls of its own. Publish scale, never exclusivity.** Publishing one menu across six locations advertises dishes some of them do not sell, and this finding is the proof: nobody had checked, and the assumption was wrong somewhere.

**Lead with:** tonkotsu, the Red/Black/White trio, Spicy Sesame, Vegan, Chicken, Pork Gyoza, Karaage, Garlic Edamame, Matcha Panna Cotta.

**Do not feature:** Carnitas Ramen, Tajima Fries, Curry Fries, Cream Cheese Wontons, Crispy Rice Spicy Tuna, Jalapeño Bomb. These are real dishes real customers order. They are not hidden, they are not the brand voice.

### Carnitas Ramen: OPEN DECISION, blocks the menu page and its schema

Carnitas Ramen ($17.50) is on the menu at all six SD locations and was the **most-reviewed ramen** in the 2025 five-star sample (15 mentions). It runs 19:1 positive at Mercury. Brand positioning says phase it out quietly and do not feature it in new content.

Schema must mirror the visible page, so "does the menu page list it" is one decision with two consequences:
- **Listed:** schema lists it. No photo, no callout, no hero placement. Just a line.
- **Omitted:** schema omits it, and Tajima ships a website menu that contradicts the menu on the table.

**RESOLVED 2026-08-04.** Confirmed **active at all seven locations** via live Toast menus. Listed plainly on `/menu/`, `feature: no`, and nowhere else: no photo, no card, no callout, no hero, no fusion framing. It is now in `menu.json` with `locations` populated for all seven, the only row carrying real availability data.

⚠️ **`DESIGN_SYSTEM.md` and `voice-tone.md` still ban it outright** and will read as forbidding what was just shipped. See `SITE_ARCHITECTURE.md` Open Decision #21. The intent of those rules survives untouched; only the absolute "does not appear on this site" is now wrong.

### Retail

- **Genbe.** Tea from Kyoto, sold at Maui. Confirmed 2026-08-04 as **genuine Tajima retail stock**, not third-party or unrelated product that happened to land in the asset folder. The Genbe files in the Bunny photo folder are therefore safe to use and carry no mislabelling risk. Standard rules still apply: a Genbe photograph is a photograph of tea. It is not evidence about noodles, broth, or any location's process.

### Dietary
- Vegan: Vegan Ramen (spinach noodles, soy-based broth, tofu), Vegetable Gyoza where offered, Vegetarian Fried Rice, Edamame.
- Vegetarian: several rice and appetizer options.
- **Gluten-free: no GF noodle option exists.** Do not imply one. Some dishes may be prepared GF; the honest line is to ask staff.
- Allergens present across the menu: soy, wheat, shellfish, egg, dairy.

---

## Booking and access

- **Walk-in only at all locations. No reservations.** Mercury accepts group reservations by phone.
- **Do not emit `acceptsReservations: true` or any ReserveAction anywhere.** Schema has no honest way to express "phone only, groups only, one location," so the accurate value is `false`.
- Takeout at all locations. Delivery via third-party platforms (Grubhub, DoorDash, UberEats), varies by location.
- Online ordering via Toast. **Per-location ordering URLs RESOLVED 2026-08-05**, click-tested, all seven, one pattern (`order.toasttab.com/online/<slug>`). Recorded in `locations.json` and tabulated in `SITE_ARCHITECTURE.md` under `/order-online/`. Two slugs are knowingly stale and deliberately unedited (Crown Point routes through `tajima-pacific-beach`, Plaza Bonita through `suite-2075` while the real suite is 2445). A Toast slug is internal routing, not a NAP value: **never reconcile a slug against an address.**
- Catering: CONFIRM.
- Private dining and events: Mercury is the largest format and the appropriate venue. No formal private dining program confirmed.

---

## Service area and local targets

- Primary market: San Diego, California.
- Neighborhood targets: Convoy / Kearny Mesa, East Village, College Area, Crown Point, Pacific Beach, Plaza Bonita / National City.
- Secondary markets: Chula Vista, National City, La Mesa, Pacific Beach, Tijuana (BC, Mexico), Kihei (Maui, Hawaii).
- Service radius: walk-in dining plus roughly 3-mile delivery per location via third-party partners.
- **North Park is a legacy target only. The location is closed. It does not appear in new copy, new schema, or new pages.**

Priority keywords: "best ramen San Diego," "tonkotsu San Diego," "ramen Convoy," "ramen East Village San Diego," and **"handmade noodles ramen San Diego" (critical, this is the new positioning anchor)**. Also: vegan ramen San Diego, ramen Pacific Beach, ramen near Petco Park, Japanese restaurant Convoy, best ramen Kearny Mesa, ramen near SDSU, ramen Plaza Bonita, Tajima Ramen menu, Sam Morikizono, noodle room San Diego.

---

## The differentiators (three tiers)

1. **Production infrastructure.** House-made noodles from Tajima's own Noodle Room, on a machine imported from Japan. Broth simmered every morning in Tajima's own commissary and driven to every San Diego location. Most American ramen chains buy both. Tajima makes both.
2. **Founder lineage and tenure.** Sam trained through Japanese kitchens including Matsuhisa under Nobu Matsuhisa, took over Convoy in 2001, and still runs the business. 25 years in San Diego, not 25 months. A real chef in a real chain: most US multi-location ramen operations have either a chef and no scale, or scale and no chef.
3. **Operational warmth.** Service is named in reviews more often than food is (131 of 154). Six neighborhoods, each with its own character. Walk in, no reservation, no queue theater.

Use this structure whenever the craft claim needs support. Tier 1 is the news. Tier 2 is why it is credible. Tier 3 is why people come back. Do not lead with Tier 3 and do not let Tier 2 turn into a founder-worship page. Sam is the source of the standard, present where the story needs him, not decoration on every page.

**Competitive positioning statement:** In a San Diego ramen category where Menya Ultra owns craft tonkotsu mastery, RakiRaki owns chef-led specialty, and JINYA owns polished national chain, Tajima owns the lane no one else can credibly claim: the founder-built San Diego craft Japanese house, 25 years deep, now making its own noodles.

---

## Verified-versus-flagged data (research integrity, read before writing any statistic)

Known traps. Do not repeat the unsubstantiated versions.

- **Founding date.** Tajima opened in 2001. Older press (San Diego Magazine) says 1994. **1994 is wrong.** Do not use it, do not engage it, do not publicly correct it.
- **Location count.** Six San Diego, eight total. The official site currently contradicts itself. Until it is fixed, write "six San Diego locations" and do not publish a global total.
- **BrightLocal Yelp data is not complete.** The tool captures reviews only from the date a location is connected, with no historical backfill, and stores truncated preview text. Convoy's 1,114 captured Yelp reviews are roughly 21% of the 5,202 on the live page (monitoring from March 2019). Mercury's 533 captured cover a window from November 2019 against roughly 2,300 live. **Any Yelp figure from an export must be labeled with its coverage window.** Google data on both exports is complete.
- **Review counts and ratings are live numbers.** Never hardcode them into copy. They will be wrong within a week.
- **`aggregateRating` must not be published.** Google treats a business marking up ratings about itself as ineligible for rich results and it risks a manual action. The DNA has these fields marked TBD. They stay empty. Ratings live on GBP and Yelp, which is where they already display.
- **The Yelp 4.0 chase is a distraction and is not the plan.** The gap between required and actual review pace is 10 to 30x, and the current 3.8 already displays as four stars. Do not build copy or CTAs around a rating target.
- **Mercury's rating slid over five years**, bottoming at 3.85 in 2024 with recovery through 2025 to 2026. Service in the main dining room (a seated-then-forgotten pattern) is the primary driver of negatives at 1.9:1. **Broth and noodles have flipped net-negative in the current era at Mercury.** This is internal context. It never appears on the site, and it is a reason the craft copy has to be backed by the operation, not just written.
- **Employee count (150 to 200) is an estimate.** Do not publish it as fact.
- **National City demographics (63.5% Hispanic/Latino)** are US Census QuickFacts. Cite as such if ever used. This informs Plaza Bonita content strategy; it does not go on the site.
- **Instagram: roughly 23K followers, 2,145 posts.** A moving number. Context only, never copy.

---

## Press and authority assets (thin, and that is the opportunity)

- **2026:** Beyondish Chef Q&A, "Ramen Is Freedom." The most useful recent founder profile.
- **2022:** San Diego Magazine, Best Restaurants 2022, Runner-Up for Best Ramen.
- **2022:** Eater San Diego, "Where to Dine Solo in San Diego," featured North Park's from-scratch ramen. **North Park is closed. Do not link or reference.**
- **2022:** Edible San Diego, "Ramen Hacks According to a Ramen Chef."
- **2021:** San Diego Sun, "Tajima Ramen Turns 20!"
- **2020:** San Diego Magazine, "The Great Ramen Hunt: Tajima," longform by Troy Johnson. **Contains the off-limits quote. Handle with care.**
- **2019:** Nardcast podcast, "Exploring Ramen with Isamu 'Sam' Morikizono."
- **2018:** Vegan in San Diego, Best of 2017 Runner-Up, Vegan Ramen.

**The Noodle Room has no press.** Baseline is zero. Target is 5+ tier-one features within six months of public launch (San Diego Magazine, Eater San Diego, San Diego Union-Tribune, Thrillist, Edible San Diego). The launch moment has not been designed yet and the narrative is fully open.

---

## Canonical social and directory URLs (for sameAs and citations)

Brand level:
- Website: https://tajimaramen.com
- Instagram: https://www.instagram.com/tajimaramen/
- Facebook: https://www.facebook.com/TajimaRamen/ **(verify)**
- LinkedIn: CONFIRM
- TikTok: CONFIRM (verify presence)
- YouTube: CONFIRM

Per location (these belong on the location entity, never on the brand entity):
- GBP URLs: **CONFIRM, all six.** Primary category: Ramen restaurant. Secondary: Japanese restaurant. **The Convoy audit flagged a generic "Restaurant" secondary that should become "Noodle Shop."**
- Yelp: Convoy confirmed (above), Maui confirmed (above). **The other six CONFIRM.**
- Apple Business Connect: **not set up. Coordination item with Tajima.**
- TripAdvisor: CONFIRM per location.
- Delivery platforms: Toast, Grubhub, DoorDash, UberEats, varies per location.

Directories to audit and reconcile: **citation cleanup across key platforms is in scope manually. Broad automated cleanup via data aggregators is an optional priced upgrade, roughly a few hundred dollars per location per year.**

Ratings for schema: **do not publish.** See Verified-versus-flagged.

---

## Who we're writing for (personas)

Five readers. Same brand, different rooms. The craft story is the connective tissue.

1. **Kenji, the Convoy regular** (28 to 45, $75K to $150K, Kearny Mesa weekly, engineer / healthcare / trades / food professional). Asian-food-literate, comparison-shops Convoy, has eaten enough ramen to know which shops are coasting. Searches "best tonkotsu San Diego," "Convoy ramen," "Menya Ultra vs Tajima," specific dish names. Chooses on specific verifiable craft signals. Will read the whole menu. Will queue if the bowl earns it. Fears soft authenticity language, restaurants that look better than they taste, chains that lost their standard at scale. **When the audience is ambiguous, write for him.**
2. **Maria, the East Village diner** (25 to 40, $60K to $130K, downtown). Wants a great fast bowl before a Padres game or after work. Hates feeling like she is eating at a chain. Searches "ramen near Petco Park," "where to eat before Padres game." Chooses on walking distance, game-night beer, fast service that does not feel rushed, room for 4 to 6. Fears tourist traps and slow service when she has a game to make.
3. **Dion, the North Park / Hillcrest evening regular** (28 to 48, $70K to $140K, creative professional, design-aware, LGBTQ-inclusive). Eats out 2 to 3 times a week. Cares who runs the place. Reads menus before going. Searches founder stories, chef interviews, sourcing language. Will adopt and evangelize a craft brand he trusts. Fears generic Asian-fusion, influencer-bait, anywhere that explains itself in clichés.
4. **The Crown Point neighbor.** Lives within walking or biking distance. Comes back weekly. Wants a reliable bowl and a calm room more than a destination experience.
5. **The Plaza Bonita family.** South Bay, family-driven, mall traffic, value-aware, Spanish-primary, more likely to choose recognizable favorites. **The craft story lands softer here.** The food being recognizably itself matters more than the Noodle Room. Location copy adjusts. Brand voice does not.

**Growth-priority reminder:** the Noodle Room story is the growth priority. Weight content, internal linking, and press toward it.

---

## Competitors (how we differentiate, for copy that needs to know)

**Never name a competitor on the site.** This is background so differentiation lands.

- **Menya Ultra.** The sharpest craft and noodle messaging in San Diego. Says noodles are homemade daily with only salt and lye water. Owner Takashi Endo is a ramen master with 18 years of noodle development; first US shop in San Diego, 2017. Michelin Bib Gourmand. **This is the real threat: they already own the noodle claim publicly.** We win on menu breadth, tenure (2001 vs 2017), founder narrative through Matsuhisa, and a fuller experience. Telling the Noodle Room story publicly neutralizes their primary advantage. Not telling it leaves the lane to them.
- **RakiRaki.** Tokyo-born chef-founder Junya Watanabe. Convoy since 2012. Organic mochi noodles. Serious chef-led identity. Smaller footprint, less recognizable off Convoy. We win on tenure, multi-neighborhood platform, brand system.
- **JINYA Ramen Bar.** Polished national chain. Markets 20-hour broths and handmade noodles. Strong recognition. Reads corporate; founder identity is invisible. **Same craft claims, less credible source.** We are the founder-led San Diego alternative.
- **Underbelly (CH Projects).** Strong design, nightlife adjacency, scene credibility. Less Japan-rooted, more atmosphere than bowl. We win on Japanese rootedness and focus on the bowl.
- **Hokkaido Ramen Santouka (inside Mitsuwa).** Japanese import, strong recognition, recognized tonkotsu signature. Food-court setting, no standalone identity. They win on errand-run convenience. We win on everything else.

---

## Messaging

**Current tagline:** "Neighborhood Ramen Spot." Being evolved. Do not use in new work.

**Locked slogan set** (approved, do not write new hero lines at build time):
- "Better noodles weren't for sale. So we made them." Web hero, primary.
- "House noodles. House rules." Wall and merch.
- "Two years building the room. A lifetime building the bowl." Press.
- "Made this morning. Served now." **Broth only.** See the Noodle Room section.

**"He didn't name it. He made it his."** The strongest line in the research file. It belongs on the site once, probably on About. Not in a hero. Do not overuse.

**Content themes:**
1. The Noodle Room. Process, the people who run it, what is different about a Tajima noodle, why house-made matters.
2. Sam's story. Amagasaki to Rockford to Matsuhisa to Convoy, told in chapters.
3. The bowls. Named dishes told with specificity. Not "our ramen" but "this ramen."
4. The neighborhoods. Six locations, each with its own character.
5. The crew. Service is the most-praised attribute. Profile them. Name them (with consent).

**Off-limits topics (hard):**
- The 2020 San Diego Magazine "too authentic" quote. Replaced, not engaged.
- The cancelled 2024 to 2025 Japanese corporate acquisition. Never narrate publicly without Tajima's direct guidance.
- Carnitas Ramen and any fusion framing of the brand.
- North Park.
- The 1994 date discrepancy.
- Competitor names.
- Any claim that the previous product was inferior.
- Retired 2025 voice: "All Slurps Welcome," "Come Get Some Slizzurp," "I'm Late for Ramen."

---

## Approved origin story (from the public record and Sam's video, cleared for prose use, not as quotes)

**The founding (for /about):** Sam Morikizono grew up in Amagasaki, near Osaka, eating his mother's cooking. He came to the United States at nineteen and washed dishes at a Japanese restaurant in Rockford, Illinois, where a kitchen veteran called Masa-san took him on. He worked his way through kitchens, including Shogun in Los Angeles and a stretch at Matsuhisa under Nobu Matsuhisa. In 2001 he took over a small, struggling Japanese restaurant on Convoy Street. It was already called Tajima. He didn't name it. He made it his. Twenty-five years later there are six of them across San Diego.

**The Noodle Room (for /noodle-room):** For twenty-five years Tajima bought its noodles. They came frozen, from a factory, like almost every ramen shop in America. Sam spent two years building a room in Crown Point so that would stop being true. There is a machine in it that came over from Japan. It makes two kinds of noodle right now, the ramen noodle and the spinach noodle that goes into the vegan bowl. The broth is made in the same building every morning and driven out to the locations before service.

Note what the second story does not do: it does not call the old noodles bad. It says what they were and then says what changed. The reader does the math. That restraint is the voice.

**Both stories are provisional until the interview.** They are assembled from the public record and Sam's video, not from him telling them. They are accurate and they are safe to publish as prose. They will get better when he tells them himself.

---

## Open questions that block specific content (do not guess)

1. **The Sam interview.** Blocks every `[QUOTE PENDING INTERVIEW]` marker on the site. The single largest gap on the project.
2. **Noodle rollout status.** Blocks any "every location" claim. (Interview Q14.)
3. **Noodle production cadence.** Blocks applying "made this morning" to noodles. (Interview Q13.)
4. **The Noodle Room lead's name.** Blocks the second character in the brand story. (Interview Q12.)
5. **Carnitas decision.** Blocks the menu page and its schema.
6. ~~**Convoy suite number.**~~ **RESOLVED 2026-08-03: STE H.** See the correction note under Location 1.
7. ~~**Exact addresses** for Mercury, East Village, College Heights, Plaza Bonita.~~ **RESOLVED 2026-08-03** from the `SITE_ARCHITECTURE.md` NAP table. All seven are filled in above.
8. **GPS, GBP URLs, and Yelp URLs**, all seven. Still blocks the `sameAs` and `geo` blocks. **Phones are resolved** (2026-08-03, NAP table). **Ordering URLs are resolved** (2026-08-05, click-test); see Booking and access.
9. **Authoritative hours** per location. Blocks `openingHoursSpecification`.
10. **Tijuana operating count** and **Tijuana / Maui site scope.** Blocks the schema graph and the locations index.
11. **US legal entity name.** Blocks `Organization.legalName`.
12. **Location count fix** on the current official site. Blocks launch hygiene.
13. **Public brand email and CMS.** Blocks contact page and migration planning.
14. **Staff consent** for named profiles. Blocks the crew content theme.
15. **Photography.** The documentary Noodle Room and commissary shoot does not exist yet. It is the asset every page depends on, and no page ships with placeholder or AI imagery.
