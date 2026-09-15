import photos from "./photos.json" with { type: "json" };
import menu from "./menu.json" with { type: "json" };

/**
 * Which dish photograph, if any, a given location page may show for a given
 * dish.
 *
 * WHY THIS EXISTS, AND WHY IT IS NOT menu.json's `image` FIELD.
 *
 * menu.json carries one `image` per dish. That field is correct for /menu/ and
 * for the homepage, which speak for the whole house, and it is what those
 * pages read. It is NOT correct for a location page, because photos.json's
 * `_rule` says in as many words:
 *
 *   "The filename is the source of truth for what a photo shows. The directory
 *    a file arrived in is never read. A photo reaches a location page only if
 *    its filename names that location."
 *
 * Every dish photograph in menu.json is named tajima-ramen-convoy-*. Rendering
 * those on /tajima-east-village/ would put Convoy's kitchen on another room's
 * page, which is the exact thing that rule forbids. So the A2 module asks this
 * map instead, and a room with no photography of its own gets the placeholder
 * tile rather than a borrowed one.
 *
 * WHAT THIS MEANS IN PRACTICE, measured 2026-09-14: Convoy has 13 of its 14
 * dishes photographed, Maui has 4 of its 8, and Mercury, East Village, College
 * Heights, Crown Point and Plaza Bonita have none at all. That is not this
 * file being strict; it is the shoot that has happened so far. Five rooms
 * rendering all-placeholder is a real result and it is reported rather than
 * papered over by borrowing Convoy's.
 *
 * TWO GATES, BOTH REQUIRED:
 *   1. The manifest's `location` must equal the location id. That field is
 *      derived from the filename by scripts/build-photo-manifest.js, so it is
 *      the rule above, applied.
 *   2. The alt must be real. A photograph still carrying the
 *      [DRAFT, NEEDS REVIEW] placeholder is skipped, because shipping a
 *      photograph with no alt is worse than shipping no photograph.
 */

const DRAFT = /^\[DRAFT/;

/**
 * NOTHING IS PLACED FROM A TOKEN. Every entry below was opened and looked at.
 *
 * photos.json's own note says its `dish` token is a candidate to inspect and
 * never a mapping to apply, and the first draft of this file ignored that and
 * was wrong twice inside one build:
 *
 *   - the `chicken` token put tajima-ramen-convoy-chicken-fried-rice-01.webp
 *     against Chicken Ramen, because that token groups fried rice, a katsu bun
 *     and teriyaki alongside the actual bowl;
 *   - the `miso` token put miso-soup-large-mercury-only.webp against Miso
 *     Ramen, which is the exact trap the manifest note names: all three files
 *     tokened `miso` are Miso Soup, a small bowl of soup, not Naruto Miso
 *     Ramen.
 *
 * Both would have shipped a photograph of the wrong dish on a location page.
 * So token matching is gone and this table is the whole mapping.
 *
 * CONVOY'S TWELVE come from menu.json's own `image` field, which the
 * _imageGapNote records as "each checked by eye before placing rather than
 * trusted from its dish token". That check already happened; this reuses it
 * rather than repeating it, and the filenames are read out of menu.json at
 * build time so the two cannot drift.
 *
 * MAUI'S FOUR were opened on 2026-09-14, because Maui's fourteen dish
 * photographs carry no token at all:
 *   pork-gyoza-kihei            seven browned dumplings, dipping sauce. Yes.
 *   garlic-edamame-kihei        pods in a wooden bowl with fried garlic. Yes.
 *   spicy-sesame-ramen-kihei    orange sesame broth, ground pork, egg. Yes.
 *   carnitas-ramen-hero-shot    one bowl, centred, on pale wood. Yes.
 *
 * The other ten Maui files are real photographs of dishes menu.json does not
 * carry (chicken chashu bowl, chicken katsu bun, pork katsu curry, curry
 * rice), so they have nowhere to go until those rows exist. Not a fault.
 *
 * tajima-ramen-carnitas-ramen-kihei.webp is ALSO carnitas and is deliberately
 * unused: a wide table flat-lay with three other dishes in frame, which at
 * 92px square reads as a corner of a table rather than a bowl. Left in the
 * manifest with its alt still draft.
 */
const HAND_VERIFIED = {
  "tajima-ramen-pork-gyoza-kihei.webp": "pork-gyoza",
  "tajima-ramen-garlic-edamame-kihei.webp": "garlic-edamame",
  "tajima-ramen-spicy-sesame-ramen-kihei.webp": "spicy-sesame",
  "tajima-ramen-carnitas-ramen-hero-shot-kihei.webp": "carnitas",
};

const DISH_IDS = new Set(menu.items.map((item) => item.id));

// menu.json's eye-checked Convoy set, folded in as filename -> dish id.
for (const item of menu.items) {
  if (!item.image) continue;
  const file = item.image.split("/").pop();
  if (HAND_VERIFIED[file]) continue;
  HAND_VERIFIED[file] = item.id;
}

for (const [file, dishId] of Object.entries(HAND_VERIFIED)) {
  if (!photos.photos[file]) {
    throw new Error(
      `dishPhotos: ${file} is mapped to dish "${dishId}" but is not in the ` +
        `manifest. A file was renamed or removed without updating menu.json ` +
        `or src/_data/dishPhotos.js.`,
    );
  }
  if (!DISH_IDS.has(dishId)) {
    throw new Error(
      `dishPhotos: ${file} maps to dish "${dishId}", which is not a row in menu.json.`,
    );
  }
}

function build() {
  const byLocation = {};
  const skippedForDraftAlt = [];

  for (const [file, dishId] of Object.entries(HAND_VERIFIED)) {
    const entry = photos.photos[file];

    // GATE 1: the filename has to name this location. `location` is derived
    // from the filename by scripts/build-photo-manifest.js, so this IS
    // photos.json's _rule, applied. A photograph with no location token
    // belongs to no location page.
    if (!entry.location) continue;

    // GATE 2: the alt has to be real. A photograph with no alt is worse than
    // no photograph, and the placeholder tile is a designed state.
    if (!entry.alt || DRAFT.test(entry.alt.trim())) {
      skippedForDraftAlt.push({ file, dish: dishId, location: entry.location });
      continue;
    }

    byLocation[entry.location] = byLocation[entry.location] || {};
    byLocation[entry.location][dishId] = {
      src: entry.src,
      alt: entry.alt,
      width: entry.width,
      height: entry.height,
      file,
    };
  }

  return { byLocation, skippedForDraftAlt };
}

export default build();
