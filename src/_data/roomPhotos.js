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

const CURATED = {
  "college-heights": {
    hero: {
      file: "tajima-college-heights-exterior-night-signage.webp",
      caption: "6061 El Cajon Boulevard, after dark",
    },
    gallery: [
      {
        file: "tajima-college-heights-interior-dining-room-01.webp",
        caption: "The room",
        tag: "Open kitchen",
        wide: true,
      },
      {
        file: "tajima-college-heights-ramen-bar-counter-craft-beer-taps.webp",
        caption: "The counter",
        tag: "21 taps",
      },
      {
        file: "tajima-college-heights-interior-manga-wall-01.webp",
        caption: "The manga wall",
        tag: "Corridor",
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
  "crown-point": {
    gallery: [
      {
        file: "tajima-crown-point-exterior-night-neon-ramen-sign-detail.webp",
        caption: "The neon",
        tag: "Ingraham Street",
        wide: true,
      },
      {
        file: "tajima-crown-point-dining-room-arched-wood-ceiling-wide.webp",
        caption: "The room",
        tag: "Barrel ceiling",
      },
      {
        file: "tajima-crown-point-bar-seating-surfboard-dining-room-view.webp",
        caption: "The counter",
        tag: "Red board",
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

// The two frames on /about/.
//
// /about/ wants three photographs it does not have: Convoy in 2001, the
// commissary, and Sam. None of the three exists. Verified 2026-08-05 against
// all 205 files: there is no Convoy exterior or interior frame (all 60 Convoy
// files are food), and no commissary or noodle-production frame either. The
// /noodle-room/ page's eight kitchen images come off the temp CDN, not the
// committed manifest.
//
// So this is the honest second-best: the two rooms that HAVE been photographed,
// each captioned with its own name. The caption is doing real work. Without
// it, a reader on a page about the founding of Convoy in 2001 would reasonably
// take an unlabelled interior to be Convoy. With it, the photographs say what
// they are, which is also the brand-level point the section is making: there
// is more than one room.
//
// Neither frame goes near the Noodle Room narrative as evidence. The Crown
// Point frame is the dining room, not the commissary, and its caption says so.
// CLIENT_FACTS.md forbids publishing the Noodle Room's street address, and
// this does not.
const ABOUT = [
  {
    file: "tajima-college-heights-interior-dining-room-01.webp",
    caption: "College Heights",
    tag: "Opened 2020",
    wide: true,
  },
  {
    file: "tajima-crown-point-dining-room-arched-wood-ceiling-wide.webp",
    caption: "Crown Point",
    tag: "Opened 2025",
  },
];

const DRAFT = "[DRAFT";

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
        gallery: set.gallery.map(lookup),
      },
    ]),
  ),
  // Reserved keys. No location has the id `_placeholder` or `_about`, so
  // neither can collide with a real entry or be picked up by
  // roomPhotos[loc.id].
  _placeholder: lookup(PLACEHOLDER),
  _about: { gallery: ABOUT.map(lookup) },
};
