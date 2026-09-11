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
  // =========================================================================
  // PREVIEW BRANCH ONLY: preview/location-photos. DO NOT MERGE TO MAIN.
  //
  // Every entry below points at Connor's 2026-09-09 supplied set, downloaded
  // 2026-09-11, machine-processed, and NOT cleared for publication. Each file
  // carries `aiUpscaled` and a per-file verification verdict in photos.json.
  // This branch exists so the client can review them in place. Production is
  // unchanged and is the comparison.
  //
  // THE SUPPLIED SET DISPLACES THE REAL FRAMES HERE, deliberately. College
  // Heights normally shows seven genuine photographs and Crown Point three.
  // Mixing genuine and machine-processed images in one unlabelled gallery is
  // the thing nobody could then review, so on this branch each location shows
  // the proposal on its own. The real frames are untouched in the repo and
  // live on production.
  //
  // Day exterior is the hero. Night exterior is the last gallery frame,
  // captioned as such, which is the arrangement that uses both halves of the
  // pair without the theme-toggle complication: see the payload note in the
  // report. Interiors sit between them.
  // =========================================================================
  "college-heights": {
    hero: {
      file: "tajima-college-heights-exterior-day.webp",
      caption: "6061 El Cajon Boulevard",
    },
    gallery: [
      { file: "tajima-college-heights-seating-area.webp", caption: "The room, looking to the counter", tag: "Before service", wide: true },
      { file: "tajima-college-heights-bar-area.webp", caption: "The counter and the tap wall", tag: "Twenty-plus taps" },
      { file: "tajima-college-heights-manga-wall-wood-slat-detail-supplied.webp", caption: "The corridor papered in manga", tag: "Maple slats" },
      { file: "tajima-college-heights-exterior-night.webp", caption: "The same storefront after dark", tag: "Night" },
    ],
  },

  convoy: {
    hero: {
      file: "tajima-convoy-exterior-day.webp",
      caption: "The Convoy Street frontage",
    },
    // Only one interior was supplied for Convoy. The second file in the set,
    // tajima-convoy-interior-dining-area, was the hero already in the repo
    // re-encoded, so it is not duplicated here.
    gallery: [
      { file: "tajima-convoy-interior-bar-area.webp", caption: "The bar", tag: "Supplied set", wide: true },
      { file: "tajima-convoy-exterior-night.webp", caption: "The same frontage after dark", tag: "Night" },
    ],
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

  mercury: {
    hero: {
      file: "tajima-mercury-exterior-day.webp",
      caption: "The Mercury Street frontage",
    },
    gallery: [
      { file: "tajima-mercury-interior-seating-area.webp", caption: "The room from the dining side", tag: "Ninety seats", wide: true },
      { file: "tajima-mercury-interior-bar-area.webp", caption: "The full bar", tag: "Bar" },
      { file: "tajima-mercury-exterior-night.webp", caption: "The same frontage after dark", tag: "Night" },
    ],
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
    hero: {
      file: "tajima-east-village-exterior-day.webp",
      caption: "The E Street corner",
    },
    gallery: [
      { file: "tajima-east-village-interior-seating-area.webp", caption: "The dining room", tag: "Sixty-four seats", wide: true },
      { file: "tajima-east-village-interior-bar-area.webp", caption: "The bar", tag: "Six taps" },
      { file: "tajima-east-village-exterior-night.webp", caption: "The same corner after dark", tag: "Night" },
    ],
    dishes: [
      {
        file: "shishito-peppers-large-ev-only.webp",
        caption: "Blistered shishito peppers, glossed with sauce",
        wide: true,
      },
    ],
  },

  "crown-point": {
    hero: {
      file: "tajima-crown-point-exterior-day.webp",
      caption: "The Ingraham Street frontage",
    },
    gallery: [
      { file: "tajima-crown-point-seating-area.webp", caption: "The dining room under its barrel ceiling", tag: "Before service", wide: true },
      { file: "tajima-crown-point-bar-area.webp", caption: "The counter, with the red surfboard above it", tag: "Cedar wall" },
      { file: "tajima-crown-point-exterior-night.webp", caption: "The same frontage after dark", tag: "Night" },
    ],
  },

  // PLAZA BONITA: one exterior, no interiors. It gets a hero and NO gallery
  // section at all, which is the same graceful-degradation rule every other
  // gated section on this site follows. An empty gallery frame reads as a
  // broken page; a missing section reads as a page that does not have one.
  "plaza-bonita": {
    hero: {
      file: "tajima-plaza-bonita-exterior-day.webp",
      caption: "Inside Westfield Plaza Bonita",
    },
  },

  // MAUI: nothing was supplied and nothing is invented. No hero, no gallery,
  // and its page is unchanged on this branch.
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
