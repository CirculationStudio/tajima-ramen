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

### 18 files: the do-not-feature list. RESOLVED 2026-09-16.

Carnitas Ramen, Tajima Fries, Curry Fries, Cream Cheese Wontons, Crispy Rice Spicy Tuna, Jalapeño Bomb.

This section read "**This is current policy, not a stale rule**" and concluded that excluding the photographs was the decision working correctly. It was not. "Do not feature" governs heroes, cards and callouts, and it was being enforced as "does not exist" by dropping the files from the manifest, which is a stronger rule than `CLIENT_FACTS.md` states.

All five dishes are now listed with their photographs in the menu body, never a hero or a callout, which is the treatment Carnitas has had since 2026-09-10. Five frames placed, each opened and looked at, each with alt written from the frame.

**The count in this heading was also wrong, and so was the claim that the files were absent.** Thirteen files across the five dishes, eleven of which the manifest was hiding, and `dishPhotos.js` carried a note concluding they had "no local file" at all. They were on disk the whole time. The note could not see them because the thing that would have shown them was the manifest they had been excluded from.

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

---

## 8. The dish shot list, by room

**Added 2026-09-15**, after the menu rebuild. Sections 1 to 7 above are about
room, exterior and process photography and still stand. This section is about
**food**, and it is the first time we have been able to say what is missing
dish by dish rather than "we need food photos".

Two things made it countable. Connor's dish sheet gave us the real per-room
menus, 74 dishes against the 14 the site used to hold. And the manifest rule
that scoped a photograph to the room named in its filename was amended: it is
right for a room and was wrong for a bowl, because a bowl of Tajima Red is the
same bowl in every room. Together those turned "five of seven rooms have no
dish photography" into a real number per room.

### Coverage today

Counted at build time from the photographs we hold with written alt, against
the dishes each room actually lists. The build prints this table on every run.

| Room | Dishes listed | Photographed | Coverage | Menu renders |
| --- | ---: | ---: | ---: | --- |
| Maui | 8 | 8 | 100% | with photographs |
| Crown Point | 21 | 20 | 95% | with photographs |
| East Village | 26 | 23 | 88% | with photographs |
| College Heights | 24 | 19 | 79% | with photographs |
| Convoy | 34 | 26 | 76% | with photographs |
| Plaza Bonita | 13 | 8 | 62% | type only |
| **Mercury** | **47** | **22** | **47%** | **type only** |

**Coverage decides how the menu looks.** Where enough of the dishes are
photographed, the room's menu renders a photograph beside every dish. Where too
many would be blank tiles, it renders cleanly as type instead, because a grid
that is mostly empty frames reads as broken images rather than as a menu. The
cut is at 70 percent, and it is checked automatically on every build: the day a
room's photography lands, its menu starts showing food on its own.

**Mercury is the ask.** It is the largest menu we have, 47 dishes, and fewer
than half are photographed. Its sushi band is one photograph against seven
blanks and its monthly specials are eight for eight.

### What Mercury needs: 25 dishes

| Section | Count | Dishes |
| --- | ---: | --- |
| Monthly Special | 8 | Tsukune Yakitori, Momo Yakitori, Beef Yakitori, Tuna Sashimi, Salmon Sashimi, Yellowtail Sashimi, Sashimi Combo, Takowasa |
| Sushi | 7 | Carnitas Roll, Crunchy Dragon Roll, Mercury Roll, Rainbow Roll, Spicy Roll, Tajima Roll, 163 Roll |
| Izakaya | 6 | Tajima Fries, Cream Cheese Wontons, Crispy Rice Spicy Tuna, Shrimp Tempura, Vegetable Tempura, Miso Soup |
| Rice | 2 | Shrimp Fried Rice, Tuna Poke |
| Dessert | 1 | Mochi Ice Cream |
| Kids | 1 | Teriyaki Chicken |

Sushi and the specials board are 15 of the 25 and are the half that matters:
they are the dishes only Mercury serves, so nothing from another room can ever
fill them.

### What Plaza Bonita needs: 5 dishes

Onigiri, Mini Ramen, and the three combo sets (Tajima Ramen with an onigiri,
with mini karaage, with mini gyoza). Small list, and it is the whole gap
between 62 percent and a menu with photographs. The combos are plated
presentations nobody has shot, not dishes we hold elsewhere.

### The other five rooms are close, and mostly not a shoot

| Room | Still missing | Of those, a frame already exists in Connor's sheet |
| --- | ---: | --- |
| Crown Point | 1 | 1 (Crispy Rice Spicy Tuna) |
| East Village | 3 | 2 (Tajima Fries, Crispy Rice Spicy Tuna) |
| College Heights | 5 | 3 (Tajima Fries, Cream Cheese Wontons, Crispy Rice Spicy Tuna) |
| Convoy | 8 | 5 (the above plus Curry Fries, Jalapeño Bomb) |

**These are a permission question, not a photographer's question.** Every one of
those frames exists and is named in the sheet. They were not placed because all
five dishes sit on the do-not-feature list in `CLIENT_FACTS.md`, and a
photograph in the sheet is a catalog entry, not a permission. Carnitas already
sets the pattern the other way: listed plainly with its photograph in the menu
body, never a hero or a callout. **If the same ruling covers these five, Crown
Point reaches 100 percent, East Village and College Heights clear 90, and
Convoy goes to 91**, with nobody picking up a camera.

It does not rescue Mercury or Plaza Bonita. Mercury would move from 47 to 53
percent and both rooms would still render as type. Those two need the shoot.

### Two frames we are holding rather than placing

- **Tajima Roll** and **Spicy Roll.** The sheet maps Mercury's menu rows to
  photographs shot at Kihei. A California Roll is a standard construction and
  travels between kitchens; a roll a kitchen invented and named after itself
  does not, and Mercury has a Mercury Roll of its own, which is the tell. Are
  Mercury's and Maui's the same roll? If yes, two of Mercury's seven sushi gaps
  close today.
- **Shrimp Fried Rice.** Rejected on sight. The plate in focus is fried rice
  with pork and vegetables and no shrimp in it; the shrimp is in a noodle dish
  on a second plate behind it, out of focus. Either the file is misnamed or the
  shot was composed around the wrong plate. Worth reshooting either way.

### Priority, if the shoot is one day

1. **Mercury sushi, 7 dishes.** Highest count, exclusive to the room, and the
   band that reads worst today.
2. **Mercury monthly specials, 8 dishes.** Same argument, and they are the
   dishes the room changes seasonally, so a repeatable setup pays off.
3. **Plaza Bonita, 5 dishes.** Small, and it is that room's entire gap.
4. **Mercury izakaya and rice, 8 dishes.**
5. Vegetable Tempura at Mercury replaces the frame we already flagged: the
   filename says vegetable and the photograph contains shrimp (section 6).
