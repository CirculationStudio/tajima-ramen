import photos from "./photos.json" with { type: "json" };
import menu from "./menu.json" with { type: "json" };

/**
 * Which photograph belongs to which dish.
 *
 * REBUILT 2026-09-15 FROM CONNOR'S DISH SHEET
 * (_reference/Tajima_Menu_260915_photos-updated.xlsx, column D).
 *
 * WHAT CHANGED, AND WHY THE OLD SHAPE WAS WRONG.
 *
 * This file used to return photographs keyed by LOCATION, because photos.json's
 * `_rule` said a photo reaches a location page only if its filename names that
 * location. That rule is right for rooms and was wrong for food. Every dish
 * photograph in the manifest is named for Convoy or Kihei, so the rule made
 * Mercury, East Village, College Heights, Crown Point and Plaza Bonita look as
 * though nobody had ever photographed their food. They had: the sheet puts real
 * coverage at 62 to 100 percent. See the amended `_rule` and `_ruleHistory`.
 *
 * So the map is now keyed by DISH. A bowl of Tajima Red is the same bowl in
 * every room.
 *
 * NOTHING IS PLACED FROM A FILENAME TOKEN, AND NOTHING EVER WILL BE.
 * photos.json says its `dish` token is a candidate to inspect and never a
 * mapping to apply. An earlier draft of this file ignored that and was wrong
 * twice inside one build: the `chicken` token put a photograph of chicken fried
 * rice against Chicken Ramen, and the `miso` token put a small bowl of miso
 * SOUP against Miso Ramen. Both would have shipped on public pages.
 *
 * EVERY ENTRY BELOW WAS OPENED AND LOOKED AT on 2026-09-15. That is not a
 * formality. Checking the 27 new candidates rejected one outright and held
 * three more; see REJECTED and HELD.
 *
 * NOTHING IS HOTLINKED. The sheet's URLs point at Bunny, but 38 of its 39
 * photographs are already committed under public/images/photo/ and the 39th is
 * there under a hyphenated name. The URLs were used to identify files, not to
 * fetch them.
 */

const DRAFT = /^\[DRAFT/;

/**
 * dish id -> filename. Hand-authored, eye-verified, one line per placement.
 *
 * WHERE THE SHEET POINTS AT A DIFFERENT FRAME OF A DISH WE ALREADY SHIP, WE
 * KEEP OURS. The sheet names karaage-02, tonkotsu-03, tajima-red-01,
 * carnitas-ramen-05 and curry-ramen-01; menu.json already carries -01, -04,
 * -02, -03 and -03 of those same five dishes, each already eye-checked and each
 * already carrying written alt. Swapping to the sheet's frame would buy nothing
 * and cost five alt strings. Those five come in through MENU_JSON below.
 */
const VERIFIED = {
  // --- checked 2026-09-15, new placements -------------------------------
  "tebasaki-wings": "tajima-ramen-convoy-tebasaki-wings-01.webp",
  "crunchy-cucumber-salad": "tajima-ramen-convoy-crunchy-cucumber-salad-01.webp",
  "chicken-katsu-bun": "tajima-ramen-convoy-chicken-katsu-bun-04.webp",
  "takoyaki": "tajima-ramen-convoy-takoyaki-01.webp",
  "kimchi": "tajima-ramen-convoy-kimchi.webp",
  "shishito-peppers": "shishito-peppers-large-ev-only.webp",
  "salmon-poke": "tajima-ramen-convoy-salmon-poke-bowl-02.webp",
  "pork-chashu-fried-rice": "tajima-ramen-convoy-pork-fried-rice-01.webp",
  "chicken-chashu-fried-rice": "tajima-ramen-convoy-chicken-fried-rice-01.webp",
  "vegetarian-fried-rice": "tajima-ramen-convoy-vegetarian-fried-rice-02.webp",
  "chicken-teriyaki": "tajima-ramen-convoy-chicken-teriyaki-01.webp",
  "pork-chashu-bowl": "tajima-ramen-convoy-pork-chashu-bowl-07.webp",
  "katsu-curry": "tajima-ramen-convoy-katsu-curry-01.webp",
  "cinnamon-churros": "tajima-ramen-convoy-cinnamon-churros-01.webp",
  "edamame": "tajima-ramen-convoy-edamame-02.webp",
  "vegetable-gyoza": "tajima-ramen-vegetable-gyoza-kihei.webp",

  // --- the five off the do-not-feature list, checked 2026-09-16 ---------
  // Every one opened and looked at before placing, and the alt written from
  // the frame. "Do not feature" governs heroes, cards and callouts; the menu
  // body is `listed`, which these always were. Same treatment Carnitas has
  // had since 2026-09-10.
  "cream-cheese-wontons": "tajima-ramen-convoy-cream-cheese-wontons-01.webp",
  "tajima-fries": "tajima-ramen-convoy-tajima-fries-02.webp",
  "curry-fries": "tajima-ramen-convoy-curry-fries-04.webp",
  "crispy-rice-spicy-tuna": "tajima-ramen-convoy-crispy-rice-spicy-tuna-02.webp",
  "jalapeno-bomb": "tajima-ramen-convoy-jalapeno-bomb-01.webp",

  // --- Mercury's own, checked 2026-09-16 --------------------------------
  // Both filenames say mercury-only and Mercury is the only room that serves
  // either dish, so nothing travels here.
  "shrimp-tempura": "shrimp-tempura-large-mercury-only.webp",
  "miso-soup": "miso-soup-large-mercury-only.webp",

  // --- Maui's own, checked 2026-09-14 -----------------------------------
  "pork-gyoza-maui": "tajima-ramen-pork-gyoza-kihei.webp",
  "garlic-edamame-maui": "tajima-ramen-garlic-edamame-kihei.webp",
  "spicy-sesame-maui": "tajima-ramen-spicy-sesame-ramen-kihei.webp",
  "carnitas-maui": "tajima-ramen-carnitas-ramen-hero-shot-kihei.webp",
  // Checked 2026-09-16. SCOPED TO MAUI ON PURPOSE. Shrimp Fried Rice is on
  // both Maui's and Mercury's catalogs and NEITHER carries a description, so
  // the narrowed travel rule in photos.json cannot be satisfied: there is
  // nothing to compare, which is not the same as agreement. The frame was
  // shot at Kihei, so it stays at Kihei and Mercury's row renders unshot.
  // Not the `-plated-` frame, which is REJECTED below.
  "shrimp-fried-rice-maui": "tajima-ramen-shrimp-fried-rice-kihei.webp",
};

/**
 * PULLED 2026-09-16, and it had shipped.
 *
 *   California Roll -> tajima-ramen-california-roll-close-up-kihei.webp
 *     A KIHEI photograph on a dish menu.json lists at MERCURY ONLY. It was
 *     placed under the amended `_rule`, on the reasoning that "a California
 *     Roll is a standard construction and travels between kitchens". The two
 *     Toast catalogs say it does not:
 *
 *       Maui     Crab mix, avocado, cucumber, topped with tobiko, sesame seeds.
 *       Mercury  Kanikama, avocado, and cucumber.
 *
 *     Description similarity 0.18. Different fillings, different topping, and
 *     kanikama is not crab. The photograph shows Maui's roll and the page it
 *     appeared on serves Mercury's.
 *
 * THE HOLD ON THE HOUSE-NAMED ROLLS IS RESOLVED, AND THE ANSWER IS NO.
 *
 * This file used to ask "are Mercury's and Maui's the same roll?" and hold two
 * photographs pending an answer. The Toast catalogs answer it:
 *
 *   Tajima Roll  Maui     HM chashu, avocado cream cheese, spicy mayo, eel
 *                         sauce, garlic crunchy sauce, green onion.
 *                Mercury  Avocado, kanikama, gobo, asparagus and kaiware,
 *                         topped with tuna tataki, butter ponzu cilantro.
 *                         Similarity 0.15.
 *
 *   Spicy Roll   Toast has one, at MAUI. Mercury does not carry a row of that
 *                name at all: it lists Spicy Salmon, Spicy Tuna and Spicy
 *                Yellowtail separately. menu.json's `spicy-roll` is a Mercury
 *                row collapsing those three, so the name crosses rooms in the
 *                wrong direction.
 *
 * Both stay unplaced, now as a decision rather than a question. See
 * src/_data/menuAliases.json.
 *
 * REJECTED on sight. The sheet asserts these and the photograph does not.
 *
 *   Shrimp Fried Rice -> tajima-ramen-shrimp-fried-rice-plated-kihei.webp
 *     The plate in focus is fried rice with pork, corn, peas, carrots and
 *     green beans. There is no shrimp in it. The shrimp is in a NOODLE dish on
 *     a second plate behind it, out of focus. Either the file is misnamed or
 *     the shot was composed around the wrong plate. Not placed.
 *     STILL REJECTED, and it was the frame and not the dish: checked
 *     2026-09-16, `tajima-ramen-shrimp-fried-rice-kihei.webp` has the shrimp
 *     on the plate in focus and is placed for Maui above. The
 *     `pork-chashu-shrimp` frame has its shrimp on the background plate too
 *     and is also left alone.
 *
 *   Vegetable Tempura -> all four frames
 *     vegetable-tempura-large-mercury-only, and the three
 *     tajima-appetizer-vegetable-tempura frames. EVERY ONE CONTAINS SHRIMP,
 *     tails up and unmistakable. PHOTO_AUDIT.md flagged one of them; checked
 *     2026-09-16, it is the whole set, so this is a mislabelled shoot rather
 *     than one bad file. Mercury's Vegetable Tempura renders unphotographed
 *     and a vegetarian reading a shrimp is the reason.
 *
 * HELD, pending a client answer. Real photographs of the right kind of dish,
 * but the mapping asserts something nobody has confirmed.
 *
 *   Spicy Roll*  -> tajima-ramen-spicy-tuna-roll-kihei.webp
 *   Tajima Roll* -> tajima-ramen-tajima-roll-kihei.webp
 *     Both are Kihei photographs the sheet assigns to MERCURY menu rows.
 *     Resolved above on the catalogs rather than left open: they are not the
 *     same rolls. Still unplaced.
 *
 * THAT "NO LOCAL FILE" NOTE WAS WRONG, corrected 2026-09-16. It said the five
 * do-not-feature dishes had no local file and that fetching them would be work
 * in service of something we may not publish. All five were on disk the whole
 * time. What they did not have was a MANIFEST ENTRY: build-photo-manifest.js
 * was enforcing "do not feature" as "does not exist" and dropping the files
 * before they reached photos.json, so nothing could see them, including the
 * note that concluded they were absent.
 *
 * Thirteen files across the five dishes, eleven of them newly visible. They
 * are placed above, each opened and looked at, each with alt written from the
 * frame.
 */

const DISH_IDS = new Set(menu.items.map((item) => item.id));

// menu.json's own eye-checked set, folded in. `_imageGapNote` records that each
// was "checked by eye before placing rather than trusted from its dish token",
// so this reuses that check rather than repeating it, and reads the filenames
// out of menu.json at build time so the two cannot drift.
const MENU_JSON = {};
for (const item of menu.items) {
  if (!item.image) continue;
  MENU_JSON[item.id] = item.image.split("/").pop();
}

const TABLE = { ...MENU_JSON, ...VERIFIED };

for (const [dishId, file] of Object.entries(TABLE)) {
  if (!photos.photos[file]) {
    throw new Error(
      `dishPhotos: dish "${dishId}" maps to ${file}, which is not in the ` +
        `manifest. A file was renamed or removed without updating menu.json ` +
        `or src/_data/dishPhotos.js.`,
    );
  }
}

function build() {
  // dish id -> photograph. The `-maui` suffixed keys are per-room overrides and
  // are resolved by byDishAt() below, not here.
  const byDish = {};
  const needsAlt = [];
  const unknownDish = [];

  for (const [dishId, file] of Object.entries(TABLE)) {
    const entry = photos.photos[file];

    // The alt has to be real. A photograph with no alt is worse than no
    // photograph, and the placeholder tile is a designed state, not a failure.
    if (!entry.alt || DRAFT.test(entry.alt.trim())) {
      needsAlt.push({ dish: dishId, file });
      continue;
    }

    const record = {
      src: entry.src,
      alt: entry.alt,
      width: entry.width,
      height: entry.height,
      file,
    };

    const roomOverride = dishId.match(/^(.*)-(maui)$/);
    if (roomOverride) {
      const [, base, room] = roomOverride;
      byDish[base] = byDish[base] || {};
      byDish[base].rooms = byDish[base].rooms || {};
      byDish[base].rooms[room] = record;
      continue;
    }

    if (!DISH_IDS.has(dishId)) {
      // A row the sheet carries that menu.json does not yet. Not an error
      // while menu.json is still the 14-row brand list; it becomes one when
      // the file grows to the sheet's 74. Reported, not thrown.
      unknownDish.push({ dish: dishId, file });
    }
    byDish[dishId] = { ...(byDish[dishId] || {}), ...record };
  }

  return { byDish, needsAlt, unknownDish };
}

const built = build();

/**
 * The photograph for a dish as seen from one room.
 *
 * Prefers a frame shot in that room when one exists (Maui has four of its own),
 * and otherwise returns the house frame, because the dish is the same dish.
 */
export function photoFor(dishId, locationId) {
  const entry = built.byDish[dishId];
  if (!entry) return null;
  if (entry.rooms && entry.rooms[locationId]) return entry.rooms[locationId];
  return entry.src ? entry : null;
}

export default { ...built, photoFor };
