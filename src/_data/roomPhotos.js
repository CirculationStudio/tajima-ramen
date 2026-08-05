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

export default Object.fromEntries(
  Object.entries(CURATED).map(([id, set]) => [
    id,
    {
      hero: set.hero ? lookup(set.hero) : null,
      gallery: set.gallery.map(lookup),
    },
  ]),
);
