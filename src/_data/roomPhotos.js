// Curated room photography, per location.
//
// WHY THIS FILE EXISTS RATHER THAN READING photos.json DIRECTLY.
//
// photos.json is a manifest, not a selection. It carries 24 College Heights
// photographs and a template that looped over all of them would put 24 near
// duplicate interiors on one page. Which four go on a page is an editorial
// decision, so it is written down here by hand, in order, with the caption
// each one carries.
//
// photos.json stays the source of truth for what a file IS: its path, its
// real pixel dimensions, and its alt text. This file only says which ones
// appear and in what order. Nothing is duplicated between the two.
//
// TWO BUILD-TIME GUARDS, both deliberate.
//
// `lookup` throws if a filename is not in the manifest, and throws again if
// the manifest's alt text is still the generator's `[DRAFT, NEEDS REVIEW]`
// placeholder. Returning something empty instead is the exact failure this
// repo has already shipped twice: a renamed data key rendered an empty <nav>
// on all 17 pages and reported nothing, and `where()` still returns [] for a
// misspelled key (SITE_ARCHITECTURE.md Open Decisions #18 and #19). A photo
// with no reviewed alt text is an accessibility defect that a silent fallback
// would hide, so it stops the build instead.
//
// This is why reviewed alt text exists for exactly the photos placed on a
// page. Writing alt for all 159 mapped photos up front would be inventing
// descriptions of images nobody has chosen to use yet.
//
// TO ADD A LOCATION: give it a `gallery`, optionally a `hero`, write real alt
// text into photos.json for each file named, and the build will tell you if
// you missed one.
//
// `hero` is optional. A full location page has a split hero with a photo slot;
// a stub page does not, and only renders the gallery. Crown Point is the first
// entry without one.
//
// ONLY THREE LOCATIONS HAVE ROOM PHOTOGRAPHY AT ALL. Of the 205 files,
// College Heights has 24 and Crown Point has 6. Mercury has exactly two room
// frames and they are 612x284 and 1000x750, too small to place. East Village
// has one photograph and it is a plate of shishito peppers, not a room.
// Convoy has 60 and every one of them is food. So the gate in
// location-gallery.njk is not defensive coding for a hypothetical: four of the
// seven rooms genuinely have nothing to show, and the documentary shoot that
// would fix that is CLIENT_FACTS.md open question #15.

import photos from "./photos.json" with { type: "json" };

// CAPTIONS SAY WHAT IS IN THE FRAME, 2026-09-09. These used to read "The
// room", "The counter", "The neon". A caption that names a generic part of a
// restaurant tells a reader nothing they cannot see, and tells a reader who
// cannot see it nothing at all. Each one now names what is actually in the
// photograph, drawn from the reviewed alt in photos.json rather than written
// separately, so the two cannot contradict each other. The `tag` carries the
// one detail worth pulling out of the frame.
//
// The College Heights tap tag reads "Twenty-plus taps", not "21". The 21 is a
// count of the live Toast catalog, not a number Tajima publishes, and the
// approved way to say it is twenty-plus. See CLIENT_FACTS.md, Location 4.

const CURATED = {
  "college-heights": {
    hero: {
      file: "tajima-college-heights-exterior-night-signage.webp",
      caption: "6061 El Cajon Boulevard, after dark",
    },
    gallery: [
      {
        file: "tajima-college-heights-interior-dining-room-01.webp",
        caption: "Long maple tables, the open kitchen at the far end",
        tag: "Before service",
        wide: true,
      },
      {
        file: "tajima-college-heights-ramen-bar-counter-craft-beer-taps.webp",
        caption: "The counter, and the tap wall behind it",
        tag: "Twenty-plus taps",
      },
      {
        file: "tajima-college-heights-interior-manga-wall-01.webp",
        caption: "The corridor papered in manga pages",
        tag: "Maple slats",
      },
      // FOUR ADDED 2026-09-09, chosen for range rather than count. This room
      // has 18 more frames with reviewed-quality material in them; these four
      // are the ones that show something the first three do not. Everything
      // else in that 18 is another angle on the counter, another night
      // exterior, or another pass down the same aisle, and photos.json still
      // carries them with draft alt rather than alt written for a page nobody
      // is going to put them on.
      //
      // The four: the room toward the open kitchen, the ordering counter head
      // on with its wayfinding, the window side with the booths and the slat
      // screen, and the manga wall close enough to read.
      {
        // Not `wide`. With the existing wide frame first, seven cells lay out
        // as 6+3+3 then 3+3+3+3, two full rows. Making this one wide too left
        // a single orphan cell on a third row.
        file: "tajima-college-heights-interior-dining-room-09.webp",
        caption: "Down the aisle to the open kitchen",
        tag: "Before service",
      },
      {
        file: "tajima-college-heights-dining-room-bar-counter-wide.webp",
        caption: "The counter you order at",
        tag: "Order here",
      },
      {
        file: "tajima-college-heights-interior-dining-room-03.webp",
        caption: "The window side, and the slat screen",
        tag: "Two-tops",
      },
      {
        file: "tajima-college-heights-interior-manga-wall-02.webp",
        caption: "The manga pages, close enough to read",
        tag: "Detail",
      },
    ],
  },

  // Crown Point. No `hero`: this is still a stub page (src/location-stub.njk)
  // and the stub hero has no photo slot. The gallery renders on its own.
  //
  // Three of the six, not all six. Dropped: the second arched-ceiling frame
  // and the second surfboard frame, both near duplicates of the ones kept.
  //
  // ALSO DROPPED, AND NOT FOR COMPOSITION:
  // tajima-crown-point-exterior-night-signage-neon-ramen.webp is the best wide
  // exterior in the set, and it is held back because the street number on the
  // wall reads 3784 while every record we publish says 3782 Ingraham Street
  // (locations.json, CLIENT_FACTS.md, the NAP table, and Toast's own page).
  // Publishing it would put a visible contradiction of our own NAP on the
  // page of a brand whose Convoy citation audit already scored 25/100. It may
  // well be the neighbouring unit's number. Nobody has checked, so it waits.
  // The neon detail frame carries the exterior instead and shows no number.
  // Mercury and East Village have no room photography worth placing, but they
  // do have food of their own. `dishes` is a separate set from `gallery` so a
  // location can have either, both, or neither.
  //
  // These are the only two locations where this applies. Convoy has 60 food
  // photographs and already shows them in its own gallery; Maui has 54 and is
  // held for a separate pass because it is a different market with its own
  // menu; College Heights, Crown Point and Plaza Bonita have no dish
  // photography at all.
  //
  // EXCLUDED, and not for composition:
  // vegetable-tempura-large-mercury-only.webp is Mercury's third food frame
  // and it is held back. The filename says vegetable tempura; the photograph
  // plainly contains shrimp among the broccoli and green beans. Captioning it
  // as a vegetable dish would publish a dietary claim the image itself
  // contradicts, and CLAUDE.md says allergen and dietary information comes
  // from verified client data only. Needs a ruling on what the dish is.
  mercury: {
    dishes: [
      {
        file: "shrimp-tempura-large-mercury-only.webp",
        caption: "Shrimp tempura, with grated daikon and a lemon wedge",
        wide: true,
      },
      {
        file: "miso-soup-large-mercury-only.webp",
        caption: "Miso soup, scallion and wakame, in a red lacquer bowl",
      },
    ],
  },

  "east-village": {
    dishes: [
      {
        file: "shishito-peppers-large-ev-only.webp",
        caption: "Blistered shishito peppers, glossed with sauce",
        wide: true,
      },
    ],
  },

  // CONVOY DRINKS, added 2026-09-09.
  //
  // The only drinks photography in the entire 210-file set, and it is all
  // Convoy. /happy-hour/ shipped with no imagery on the strength of a comment
  // in its own markup saying no drink photograph existed in the manifest.
  // Six did. The comment was written from the curated sets in this file rather
  // than from photos.json, which is the difference between "not curated" and
  // "does not exist", and PHOTO_AUDIT.md caught it.
  //
  // ONE FRAME, ON CONVOY'S CARD, AND NOWHERE ELSE. photos.json's _rule is that
  // a photograph reaches a location's surface only if its filename names that
  // location, so these cannot dress the other five rooms' cards no matter how
  // much better a six-photo grid would look. Five rooms with no drinks
  // photography render no photo, which is the same graceful-degradation rule
  // the galleries follow.
  //
  // margaritas-06 is the pick for a card at roughly 350px: three glasses in a
  // row, high contrast against dark wood, and the silhouettes survive being
  // shrunk. The overhead crop (margaritas-01) and the four-drink line-ups read
  // as texture at that size. All six now have reviewed alt and the other five
  // are waiting on a Convoy surface, most obviously /tajima-convoy/, which has
  // no drinks imagery either.
  convoy: {
    // THE HERO. Added 2026-09-10, and it closes DESIGN_SYSTEM.md open item 7.
    //
    // /tajima-convoy/ loaded its hero photograph from tajimaramen.com, the
    // live WordPress site this project replaces, because there was no Convoy
    // room photograph anywhere in the repo: all 60 Convoy files were food or
    // drinks. That made the highest-traffic page on the site depend on the old
    // site staying up, in either direction.
    //
    // The client supplied an upscaled interior at review. It is a REAL
    // photograph of this room, machine-enlarged, and it is flagged
    // `aiUpscaled` in photos.json with the full note. It is not a placeholder
    // and does not trip the placeholder guard: a placeholder is an image of
    // something else, and this is the right room at the wrong resolution.
    // Replace it when the shoot lands.
    hero: {
      file: "tajima-convoy-interior-dining-room-upscaled.jpg",
      caption: "The Convoy dining room",
    },

    // ONE DISH FRAME, TO FILL THE ONE EMPTY CELL. /tajima-convoy/ renders its
    // food bento from menu.json, which yields eleven photographs at Convoy.
    // Eleven cells in a four-column bento is two full rows and a row of three,
    // so the grid has had a literal hole in its last row since it was built.
    //
    // This is the twelfth cell and nothing more. It is NOT a second gallery
    // and it is not an argument for widening the page into a per-room catalog.
    //
    // WHY THIS DISH. Chicken Katsu Bun is not in menu.json, which carries the
    // brand menu, and that is exactly why it belongs on THIS page: the section
    // above it promises "an izakaya list that runs deeper here than anywhere
    // else in the house", and until now the section illustrated that claim
    // with eleven photographs of the brand menu. It is confirmed at this room
    // by the client's own current print collateral, the 2026-07 Convoy food
    // menu in public/menus/, which this page links to: "CHICKEN KATSU BUN,
    // steamed bun with crispy chicken cutlet glazed in a house sauce,
    // shredded cabbage, and mayo mustard".
    //
    // NO PRICE, and no caption text beyond the dish name, because the price on
    // that printed menu is per location and menu.json _priceStatus is still
    // open.
    dishes: [
      {
        file: "tajima-ramen-convoy-chicken-katsu-bun-04.webp",
        caption: "Chicken Katsu Bun",
        tag: "Convoy izakaya",
      },
    ],
    drinks: [
      {
        file: "tajima-ramen-convoy-margaritas-06.webp",
        caption: "Photographed at Convoy",
      },
    ],
  },

  "crown-point": {
    gallery: [
      {
        file: "tajima-crown-point-exterior-night-neon-ramen-sign-detail.webp",
        caption: "The red neon arrow on the corner, at night",
        tag: "Ingraham Street",
        wide: true,
      },
      {
        file: "tajima-crown-point-dining-room-arched-wood-ceiling-wide.webp",
        caption: "The dining room under its barrel-vaulted ceiling",
        tag: "Before service",
      },
      {
        file: "tajima-crown-point-bar-seating-surfboard-dining-room-view.webp",
        caption: "The counter, with the red surfboard above it",
        tag: "Cedar wall",
      },
    ],
  },
};

// The one photograph the Locations mega menu shows in all seven cards.
//
// WHY ONE PHOTO SEVEN TIMES, AND WHY THIS ONE.
//
// Only two of the seven rooms have photography of themselves, so a nav that
// showed each location its own photo would show two real rooms and five
// holding slots. An inconsistent mix reads as broken. One deliberately
// generic dish, repeated, reads as a known placeholder state, which is what
// this is until the other five rooms are shot.
//
// It is NOT location-specific on purpose, and that is what keeps it inside
// photos.json's governing rule: a photo reaches a *location page* only if its
// filename names that location. This file names no location (`location: null`
// in the manifest), so putting it in the Convoy card is not a claim that it
// was taken at Convoy. A Convoy-tagged dish photo in the College Heights slot
// would have broken that rule outright, which rules out all 60 Convoy frames
// and all 54 Maui frames.
//
// Karaage rather than gyoza or edamame: menu.json has it at all seven
// locations (edamame is at six), and CLIENT_FACTS.md independently calls it
// "the most universally available izakaya item across all locations." The one
// dish that is true everywhere is the right dish for the slot that appears
// everywhere. It is also shot on a wooden table rather than on seamless,
// which keeps it clear of the DESIGN_SYSTEM.md ban on "glossy studio bowl
// shots with no environmental context."
//
// The card renders it with alt="" because in that context it is decorative:
// it identifies nothing about the location, and seven identical alt strings
// in a links list is noise. Real alt text still exists in photos.json, both
// because the guard below requires it and because alt is a property of the
// context, not of the file.
//
// REPLACE THIS PER LOCATION, do not extend it, once the rooms are shot.
const PLACEHOLDER = {
  file: "tajima-appetizer-karaage-02.webp",
  caption: null,
};

// NOTE, 2026-08-05: an ABOUT set lived here and was removed the same day.
//
// It curated a College Heights frame and a Crown Point frame for /about/.
// Both were cut from that page on review: they were chosen because they are
// the only rooms with photography, not because either belongs to Sam's story,
// and the Crown Point frame sat next to the Noodle Room chapter where it read
// as a picture of the commissary, which it is not.
//
// Do not re-add a set here for /about/ until the real photographs exist. That
// page wants Convoy (the founding room), the commissary, and Sam. None of the
// three is in the manifest. All three are in the photography ask drafted
// under SITE_ARCHITECTURE.md Open Decision #30.

const DRAFT = "[DRAFT";

// ===========================================================================
// PLACEHOLDER SWEEP. Added 2026-09-09.
//
// WHAT IT IS FOR. Every photograph on this site today is Tajima's own. That is
// a standard, not an accident, and the moment it is most likely to slip is the
// one nobody plans for: the documentary shoot lands late, a page needs a frame
// this week, and a stock image goes in "just for now". This throws at module
// load, which fails `npm run build`, so a placeholder cannot reach production
// by being forgotten. It has to be removed, or the build has to be run with an
// explicit flag by someone who typed the flag on purpose.
//
// It guards nothing on the day it ships, and that is the point. A gate
// installed after the thing it prevents is a post-mortem.
//
// HOW TO REGISTER ONE. In photos.json, on that file's entry:
//
//   "placeholder": true,
//   "placeholderSource": "https://... the page it came from",
//   "placeholderNote": "what real photograph replaces it, and who is shooting it"
//
// and write honest alt describing what is actually in the frame, not what we
// wish were in it. All three fields are required. Half a registration is worse
// than none, because it looks handled.
//
// HOW TO PREVIEW ONE. TAJIMA_ALLOW_PLACEHOLDERS=1 npm run build
// The flag is for a client preview, never for a production deploy. Cloudflare
// builds from a clean environment and does not set it, so a placeholder that
// builds on someone's laptop still fails the deploy.
//
// THE RULES THIS ENFORCES, from the photography standard: never a stock room,
// storefront or plated bowl, ever, under any flag. Stock is only for generic
// subjects that no Tajima photograph could cover, such as raw ingredients or
// texture, and it is never presented as Tajima. This code cannot judge a
// subject. It can only make sure a human registered the decision, said where
// the image came from, and named the photograph that replaces it.
//
// WHAT IT DOES NOT CATCH, stated plainly. It sweeps the whole manifest rather
// than the ~10 curated files `lookup()` sees, so it covers photographs placed
// through paths that never touch this module: src/index.njk reads
// photos.photos directly, and menu.json carries its own image and alt fields.
// But it can only see what somebody marked. A stock file dropped into
// public/images/photo and referenced from menu.json with hand-written alt is
// invisible to this guard and to the draft-alt guard both. Registration is
// still a human act. This makes an honest registration binding; it does not
// make a dishonest one impossible.
// ===========================================================================
const ALLOW_PLACEHOLDERS = process.env.TAJIMA_ALLOW_PLACEHOLDERS === "1";

// Accumulate every offender before throwing, the same shape
// scripts/test-photo-manifest.js uses. Reporting one at a time turns a single
// fix into as many build runs as there are placeholders.
const placeholderFailures = [];

for (const [file, record] of Object.entries(photos.photos)) {
  const marked = record.placeholder === true;
  const hasSource = typeof record.placeholderSource === "string" && record.placeholderSource.trim() !== "";
  const hasNote = typeof record.placeholderNote === "string" && record.placeholderNote.trim() !== "";

  // A half-registration is its own failure, and it fails even under the flag.
  // An entry carrying a source but not the flag reads as handled and is not.
  if (!marked && (hasSource || hasNote)) {
    placeholderFailures.push(
      `${file}: carries placeholderSource or placeholderNote but is not marked ` +
        `"placeholder": true. Either mark it or remove the fields. A half-registered ` +
        `placeholder looks handled and is not.`,
    );
    continue;
  }

  if (!marked) continue;

  if (!hasSource || !hasNote) {
    placeholderFailures.push(
      `${file}: is marked as a placeholder but is missing ` +
        `${!hasSource ? "placeholderSource" : ""}${!hasSource && !hasNote ? " and " : ""}${!hasNote ? "placeholderNote" : ""}. ` +
        `A placeholder has to say where it came from and what replaces it, or ` +
        `nobody can retire it later.`,
    );
    continue;
  }

  if (!ALLOW_PLACEHOLDERS) {
    placeholderFailures.push(
      `${file}: PLACEHOLDER PHOTOGRAPHY IS IN THE BUILD.\n` +
        `      source:  ${record.placeholderSource}\n` +
        `      replace: ${record.placeholderNote}`,
    );
  }
}

if (placeholderFailures.length) {
  throw new Error(
    `\nroomPhotos: ${placeholderFailures.length} placeholder problem(s). ` +
      `The build is stopped on purpose.\n\n` +
      placeholderFailures.map((f) => `  x ${f}`).join("\n") +
      `\n\n  Every photograph on this site is Tajima's own. To ship a stand-in ` +
      `anyway, remove it before deploy, or run a PREVIEW with:\n` +
      `      TAJIMA_ALLOW_PLACEHOLDERS=1 npm run build\n` +
      `  That flag is for showing a client a layout. It is not set on ` +
      `Cloudflare, so a placeholder still fails the deploy.\n`,
  );
}

function lookup(entry) {
  const record = photos.photos[entry.file];
  if (!record) {
    throw new Error(
      `roomPhotos: "${entry.file}" is not in photos.json. Either the file was ` +
        `renamed, or it was never committed and the manifest never saw it. Run ` +
        `node scripts/build-photo-manifest.js and check the filename.`,
    );
  }
  if (!record.alt || record.alt.trim().startsWith(DRAFT) || !record.alt.replace(DRAFT, "").trim()) {
    throw new Error(
      `roomPhotos: "${entry.file}" still has the generator's draft alt text. ` +
        `Write real alt text into photos.json before placing it on a page. ` +
        `Alt text describes the image, it does not sell it (voice-tone.md), and ` +
        `no em dashes.`,
    );
  }
  return {
    src: record.src,
    alt: record.alt,
    width: record.width,
    height: record.height,
    caption: entry.caption,
    tag: entry.tag || null,
    wide: entry.wide || false,
  };
}

export default {
  ...Object.fromEntries(
    Object.entries(CURATED).map(([id, set]) => [
      id,
      {
        hero: set.hero ? lookup(set.hero) : null,
        gallery: set.gallery ? set.gallery.map(lookup) : null,
        dishes: set.dishes ? set.dishes.map(lookup) : null,
        drinks: set.drinks ? set.drinks.map(lookup) : null,
      },
    ]),
  ),
  // Reserved key. No location has the id `_placeholder`, so this cannot
  // collide with a real entry or be picked up by roomPhotos[loc.id].
  _placeholder: lookup(PLACEHOLDER),
};
