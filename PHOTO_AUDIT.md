# Photo audit: why the photography is not on the site

**Run 2026-09-09.** Read-only. No alt was written and no photograph was placed.

**The headline: 210 photographs on disk, 25 placed on the site. 12 per cent.**
Most of the remaining 185 are not blocked by anything but unwritten alt text.

---

## 1. Disk against manifest

| | count |
|---|---|
| Files in `public/images/photo/` | **210** |
| Entries in `photos.json` `photos{}` | **164** |
| Excluded, listed but not mapped | **46** |
| In the manifest but missing from disk | **0** |

**There is no drift.** The 46 are excluded deliberately and each is listed with a reason:

- **18** on `DO_NOT_FEATURE_FLAGGED`, a client policy list, not a defect.
- **13** on `MAUI_PROCESS_FLAGGED`: Maui photographs that appear to show noodle or broth production, held because whether Maui's process matches Crown Point is unconfirmed.
- **15** on `UNMAPPED`: the filename does not resolve to a location, a dish or a subject, or it matches two dishes at once.

## 2. Alt text

| | count |
|---|---|
| Manifest entries with reviewed alt | **25** |
| Manifest entries still `[DRAFT, NEEDS REVIEW]` | **139** |

Of the 139, **83 also carry `needsEyes`**: the filename does not say what the photograph shows, so somebody has to open the file before alt can be written. That is 48 Maui, 31 Convoy, and 4 across the other rooms.

### Draft alt by subject and location

| Subject | Location | Count |
|---|---|---|
| Room | College Heights | **18** |
| Room | Crown Point | 2 |
| Room | Mercury | 2 |
| Dish | Convoy | 17 |
| Dish | Maui | 6 |
| Dish | no location token | 8 |
| Process (drinks) | Convoy | 3 |
| Unclassified | Maui | 48 |
| Unclassified | Convoy | 31 |
| Unclassified | College Heights, Crown Point, Mercury | 4 |

Commissary is the exception: all **5** commissary frames already have reviewed alt. They are blocked by a placement decision, not by alt.

## 3. What is actually blocked, and by what

### 5 files: `proposedUseLocked` plus a `proposedUseNote`

All five commissary steam-tank frames, all with reviewed alt. One shared note, and what it forbids is **the automatic proposal of `/noodle-room/`**, not use of the photographs:

> The manifest script would propose `/noodle-room/` for any process photo with a null location. That is not safe here: `/noodle-room/` names Crown Point in its own hero subtitle and again in its meta list, so a photograph placed there inherits a location claim from the page around it even if its own caption makes none.

One of the five is on the home page. **Four are sitting unused with finished alt.** They need a human to say which page they go on, which is fifteen minutes of judgement, not a shoot.

### 14 files: `UNCONFIRMED-LOCATION`

A recognised subject with no location token. Nine are dishes (chicken katsu, miso soup, pork gyoza, karaage); five are the commissary set. **This does not block use on a page that makes no location claim**, such as `/menu/`. It blocks use on a location page.

### 18 files: the do-not-feature list

Carnitas Ramen, Tajima Fries, Curry Fries, Cream Cheese Wontons, Crispy Rice Spicy Tuna, Jalapeño Bomb. **This is current policy, not a stale rule.** The 2026-08-04 Carnitas resolution reads "listed plainly on `/menu/`, `feature: no`, and nowhere else: no photo, no card, no callout, no hero." Excluding the photographs is that decision working correctly.

### 13 files: Maui process

Held on `SITE_ARCHITECTURE.md` Open Decision #1. Needs the client answer on whether Maui makes its own noodles.

### 15 files: unmapped

Needs a human to name the subject. Mostly appetisers whose filenames carry no location token.

## 4. The four specific questions

| | Answer |
|---|---|
| **Any photograph of Sam Morikizono?** | **No. Zero photographs of any person, anywhere in the 210.** A filename scan for sam, morikizono, founder, owner, chef, portrait, staff, team, crew, headshot returns only false positives on unrelated tokens. |
| **Any Carnitas Ramen photograph?** | **Yes, six.** Three Convoy, two Kihei, one chicken-katsu-bun-carnitas. All excluded to the do-not-feature list by current policy. The photographs exist; the decision forbids them. |
| **Any miso or soup photograph?** | **Yes, three.** `miso-soup-large-mercury-only.webp` is already placed on `/tajima-mercury/`. `tajima-appetizer-miso-soup-01` and `-02` are unused with draft alt and no location token. |
| **Any Convoy interior or room photograph?** | **No. Zero.** All 60 Convoy files are food or drinks. A filename scan for interior, room, dining, exterior, storefront, bar, counter, table, signage, neon, patio, wall returns nothing. This is the gap behind the `/tajima-convoy/` hero still hotlinking the old WordPress site. |

## 5. Which pages could use which currently-blocked photographs

| Page | Available today if alt were written | Count |
|---|---|---|
| `/tajima-college-heights/` | 18 more room frames, every one at placeable size (1280x853 or larger). The page currently shows 3. | **18** |
| `/menu/` and `/tajima-convoy/` | Convoy dish frames with a resolved dish token: chicken fried rice, chicken katsu bun, chicken teriyaki, chicken ramen, garlic edamame, karaage, tajima black, vegan ramen | **13** |
| `/menu/` | Convoy frames of dishes not in `menu.json` at all: curry ramen, katsu curry, pork chashu bowl, pork fried rice, salmon poke, takoyaki, tebasaki wings, crunchy cucumber salad, kimchi, edamame, cinnamon churros, vegetarian fried rice | **~28** |
| `/happy-hour/` | **The only drinks photography in the set**: three Convoy house mixed drinks and three margaritas, all 1280x853. The page currently ships with no imagery at all and its own comment says no drink photograph exists. That comment is wrong. | **6** |
| `/tajima-crown-point/` | 1 more dining-room frame. The second is the neon exterior held on the 3784-versus-3782 street number, which is a decision, not alt. | **1** |
| `/about/`, `/noodle-room/` | 4 unused commissary frames with finished alt, pending a placement ruling | **4** |
| `/tajima-mercury/` | Nothing usable. Its only two room frames are 612x284 and 1000x750, genuinely too small. | **0** |

## 6. The answer to the question

### Solvable today, no client input needed

- **18 College Heights room photographs.** The single largest win. Turns a three-frame gallery into a real one.
- **6 drinks photographs** that would give `/happy-hour/` its first imagery.
- **13 Convoy dish photographs** with resolved dish tokens.
- **4 commissary frames** that need a placement ruling, not a shoot.

**Roughly 41 photographs are one alt-writing pass away from being placeable.** Another ~28 Convoy dish frames need someone to open them first, which is work but not a blocker.

### Blocked on a client decision

- 18 do-not-feature (policy is current and correct)
- 13 Maui process (Open Decision #1)
- 15 unmapped (needs a subject ruling)
- 1 Crown Point neon exterior (street number contradicts our own published NAP)
- 1 vegetable tempura (the filename says vegetable, the photograph contains shrimp)

### Blocked on a photograph that does not exist

- **Sam.** Nothing. `/about/` is a page about a man of whom we hold no picture.
- **Convoy, the founding room.** Nothing. Directly causes the `/tajima-convoy/` hotlink launch blocker.
- **Plaza Bonita and East Village rooms.** Nothing. East Village has exactly one photograph and it is a plate of shishito peppers.
- **Mercury, at usable resolution.** Two frames, both too small.
- **The Noodle Room itself, and any process shot outside the commissary tanks.**

### The shape of it

The empty space on this site is **mostly solvable today**. The three pages that cannot be fixed without the shoot are `/about/`, `/tajima-convoy/` and the two roomless location pages, and those are exactly the pages where the missing photograph is the story. Everything else is waiting on alt text.

## 7. One thing that is not a photograph problem

`menu.json` supplies its own `alt` for the 11 dishes it images, which bypasses the `roomPhotos.js` draft-alt guard. **Four of those 11 point at manifest entries whose alt is still `[DRAFT, NEEDS REVIEW]`.** The pages are fine, because `menu.json`'s alt is reviewed, but the manifest understates how much reviewed alt exists and the guard cannot see that path. Noted, not a defect to fix blind.
