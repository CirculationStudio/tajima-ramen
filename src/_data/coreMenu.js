import roomMenus from "./roomMenus.js";
import locations from "./locations.json" with { type: "json" };
import menu from "./menu.json" with { type: "json" };
import menuConcepts from "./menuConcepts.json" with { type: "json" };
import dishPhotos from "./dishPhotos.js";

/**
 * THE CORE SET FOR /menu/, AND WHAT IT IS COUNTED ACROSS.
 *
 * /menu/ carries the signature and core dishes. A location page carries that
 * room's full menu. This computes the first from the same rows that build the
 * second, so the two pages cannot disagree about what a room serves.
 *
 * COUNTED ACROSS THE SIX SAN DIEGO ROOMS, AND THE PAGE SAYS SO.
 *
 * Maui is a real Tajima and its menu is genuinely its own: 24 of its 39 rows
 * are not on any San Diego menu. Counting it would distort "served at most
 * rooms" in both directions, so it is set apart rather than ranked alongside,
 * and it keeps its own band on the page with the list of what only it serves.
 *
 * An availability note therefore says "Not served at Plaza Bonita" and means
 * the San Diego six. It must never imply anything about Maui either way, so
 * the page states the scope where the set is introduced rather than leaving a
 * reader to infer it from silence.
 *
 * THE THRESHOLD IS FIVE OF SIX, and the data has an obvious seam there:
 *
 *   6 of 6   10 dishes
 *   5 of 6   10 dishes, and every one of them is missing ONLY Plaza Bonita
 *   4 of 6    6 dishes, missing two rooms each, in five different pairings
 *
 * At five of six the exclusion is one room and it is the same room every time,
 * which is a coherent thing to say once: these twenty are the house, and the
 * quick-serve food court runs a focused version of it. At four of six the set
 * fragments into pairings a reader cannot hold, and it starts admitting plain
 * sides. `nextBand` carries that group so the choice stays visible.
 */
const THRESHOLD = 5;

/**
 * EXCLUDED FROM THE SIGNATURE SET ON CURATION GROUNDS, NOT AVAILABILITY.
 *
 * The 5-of-6 threshold answers "is this dish everywhere", which surfaces
 * plain staples right alongside the dishes that actually make the case for
 * Tajima: Steam Rice is served at all six San Diego rooms and that is a true,
 * uninteresting fact. A reader meeting the brand for the first time through
 * /menu/'s highlight reel should not meet steamed rice before Tonkotsu.
 *
 * SCOPED TO `core` AND `nextBand` ONLY. A room's own full menu (roomMenus,
 * unaffected) and its chooser-card dish count (`cards`, unaffected) still
 * carry the dish; it is a real, ordinary side and nothing here disputes that.
 * This list is a home-page-of-the-menu curation call, not a data correction,
 * which is the same distinction menu.json draws with `featurable`.
 */
const EXCLUDE_FROM_CORE = new Set(["Steam Rice"]);

const SAN_DIEGO = locations.items
  .filter((loc) => loc.region === "san-diego")
  .map((loc) => loc.id);

const NAME = new Map(locations.items.map((loc) => [loc.id, loc.name]));

// A dish is the joined dish where menuAliases could join it, and its Toast
// name where it could not. Two rows in different rooms are the same dish only
// when they resolve to the same id; an unmatched row is only ever itself,
// which is the safe direction.
const identity = (row) => row.dishId || `name:${row.name}`;

function collect(roomId) {
  const found = new Map();
  const room = roomMenus.byRoom[roomId];
  if (!room) return found;
  for (const section of room.sections) {
    for (const row of section.items) found.set(identity(row), { row, section });
  }
  return found;
}

const perRoom = {};
for (const id of [...SAN_DIEGO, "maui"]) perRoom[id] = collect(id);

const tally = new Map();
for (const id of SAN_DIEGO) {
  for (const [key, { row, section }] of perRoom[id]) {
    if (!tally.has(key)) tally.set(key, { key, row, section, rooms: [] });
    tally.get(key).rooms.push(id);
    // Prefer a row that carries a photograph and a description, so the card
    // shows the fullest version of a dish the rooms word slightly differently.
    const held = tally.get(key);
    if (!held.row.photo && row.photo) held.row = row;
  }
}

function entry(item) {
  const missing = SAN_DIEGO.filter((id) => !item.rooms.includes(id));
  return {
    key: item.key,
    name: item.row.name,
    description: item.row.description,
    dietary: item.row.dietary,
    featurable: item.row.featurable,
    menuJsonDescription: item.row.menuJsonDescription,
    photo: item.row.photo,
    dishId: item.row.dishId,
    section: item.section.key,
    sectionLabel: item.section.label,
    rooms: item.rooms,
    count: item.rooms.length,
    missingFrom: missing,
    // Rendered verbatim, so the sentence and the data cannot disagree.
    missingNote: missing.length
      ? `Not served at ${missing.map((id) => NAME.get(id)).join(" or ")}.`
      : null,
    onMaui: perRoom.maui.has(item.key),
  };
}

const all = [...tally.values()].map(entry);
const core = all
  .filter((item) => item.count >= THRESHOLD && !EXCLUDE_FROM_CORE.has(item.name))
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
const nextBand = all
  .filter((item) => item.count === THRESHOLD - 1 && !EXCLUDE_FROM_CORE.has(item.name))
  .sort((a, b) => a.name.localeCompare(b.name));

/**
 * UNIVERSAL: served at every one of the six San Diego rooms, no exception,
 * no missingNote. The bento grid on /menu/ is scoped to exactly this list
 * and nothing wider (2026-09-18), on purpose: the bento system's 2026-09-15
 * removal happened because it tried to show one shared layout across rooms
 * whose menus barely overlap, a failure mode that starts the moment a card
 * carries a "not served at Plaza Bonita" exception. `core` (5-of-6 and up)
 * still has exactly that exception baked into `missingNote`; `universal`
 * cannot, by construction, since count === sanDiego.length is what admits a
 * row here. Sorted by name rather than carrying `core`'s count-first sort,
 * since every row here ties at the same count and count is not the story.
 */
const universal = core
  .filter((item) => item.count === SAN_DIEGO.length)
  .sort((a, b) => a.name.localeCompare(b.name));

/**
 * UNIVERSAL, MINUS THE DO-NOT-FEATURE ROWS. The bento grid's real source:
 * `universal` answers "is this dish on every San Diego menu", a fact, and
 * Carnitas Ramen genuinely is. Whether it may appear in a card with a photo
 * is a different, presentational question, menu.json's `featurable` flag
 * (Open Decision #4: listed plainly everywhere, never a photo, card, hero
 * or callout), joined through roomMenus.js the same way `dietary` already
 * is. Filtered here rather than by name, and rather than in `universal`
 * itself: `universal` still has to answer the availability question
 * correctly for every other consumer (room pages, the chooser's dish
 * counts), which do not care whether a dish is clear to feature.
 */
const universalFeaturable = universal.filter((item) => item.featurable !== false);

/**
 * BENTO LAYOUT: the hand-composed asymmetric grid, restored 2026-09-19 from
 * the real June concept file (cdn.circulationstudio.com/tajima-temp/
 * design-concepts/tajima-menu.html, still live, checked directly rather
 * than assumed gone). Which dish reads as a feature is an editorial call,
 * not a computable fact the way availability or featurable is, so it is
 * authored here, in exactly one place, rather than in CSS selectors keyed
 * to specific dish names. That was the original's actual failure shape:
 * .dish--ramen-tonkotsu et al hard-coded eight 2026-06 dish names directly
 * into placement rules, so when the roster moved on, the CSS simply had
 * nothing left to match. This list can go stale the same way, but going
 * stale here means one array to update, not a grid quietly losing cells.
 *
 * ORDER IS THE MECHANISM, NOT THE CLASS NAME. Every CSS placement rule
 * below reads :nth-child position, never a dish name, so `bentoLayout`'s
 * job is entirely to decide feature-or-quiet and put dishes in the order
 * the grid expects (features first, in the order they should be drawn,
 * then quiet cells). A dish that drops out of universalFeaturable just
 * drops out here too (.find() returns undefined, filtered); a new one
 * that was never curated falls to `quiet` by default, the same
 * fail-safe direction the original's unnamed-dish fallback cell used.
 *
 * THE SPLIT, checked against the real concept file rather than guessed:
 * Traditional Tonkotsu Ramen and Tajima Red were literally the original's
 * two biggest cells (class dish--feature, spans 7 and 5x2 of 12).
 * Spicy Sesame Ramen carried dish--feature too. Karaage and Pork Gyoza
 * were BOTH explicitly commented "photo feature" in the concept's izakaya
 * row, paired at equal size (dish--izakaya-photo, span 4 each) — Gyoza
 * was built quiet in the first pass on this grid (2026-09-19), flagged
 * as a discrepancy from the concept, and promoted here on request. Tajima
 * White and Chicken Ramen were never given dish--feature in the original
 * ramen row, the implicit quiet tier there, and stay quiet.
 *
 * DISPLAY NAME, SEPARATE FROM THE MATCH KEY. `name` below is what
 * universalFeaturable actually carries (Toast's own catalog name, "Tajima
 * Ramen"), used to find the dish; `displayName`, where present, is what
 * the tile prints instead. Scoped to this grid only, not a rename:
 * SITE_ARCHITECTURE.md Open Decision #22 (Tajima White vs. Tajima Ramen)
 * is still open everywhere else on the site, including this same dish on
 * every room's own full menu, which reads the Toast name correctly and
 * is untouched by this.
 */
// Order matters here as much as tier: CSS places every cell by
// :nth-child position (see menu.css), so this is also where each dish's
// specific span/row shape actually gets decided, informed by real photo
// orientation (checked in coreMenu.universalFeaturable before writing
// this): Tonkotsu, Red, Sesame and Karaage are all portrait and take the
// grid's four tall-or-wide feature slots; Gyoza is landscape at 0.67 and
// takes the wide span-7 strip rather than a tall one; White and Chicken
// are landscape-leaning quiet cells.
const BENTO_ORDER = [
  { name: "Traditional Tonkotsu Ramen", tier: "feature" },
  { name: "Tajima Red", tier: "feature" },
  { name: "Spicy Sesame Ramen", tier: "feature" },
  { name: "Karaage", tier: "feature" },
  { name: "Pork Gyoza", tier: "feature" },
  { name: "Tajima Ramen", tier: "quiet", displayName: "Tajima White" },
  { name: "Chicken Ramen", tier: "quiet" },
];
const bentoNamed = new Set(BENTO_ORDER.map((row) => row.name));
const bentoLayout = [
  ...BENTO_ORDER
    .map((row) => {
      const dish = universalFeaturable.find((d) => d.name === row.name);
      if (!dish) return null;
      return {
        ...dish,
        bentoTier: row.tier,
        ...(row.displayName ? { name: row.displayName } : {}),
      };
    })
    .filter(Boolean),
  // A dish universalFeaturable carries that BENTO_ORDER has no opinion on
  // yet (the roster grew, or gained a new featurable row since this list
  // was last touched) falls here, quiet by default rather than dropped:
  // the same fail-safe direction the original's own unnamed-dish fallback
  // cell used.
  ...universalFeaturable
    .filter((d) => !bentoNamed.has(d.name))
    .map((d) => ({ ...d, bentoTier: "quiet" })),
];

// What only Maui serves. Split, because "no San Diego room has this dish" and
// "a San Diego room has a dish of the same name and it is not this one" are
// different claims and the second is the one that misleads.
const sdKeys = new Set(tally.keys());
const sdNames = new Set([...tally.values()].map((t) => t.row.name.toLowerCase()));
const mauiOnly = [];
const mauiSameName = [];
for (const [key, { row, section }] of perRoom.maui) {
  if (sdKeys.has(key)) continue;
  const record = { name: row.name, section: section.label };
  if (sdNames.has(row.name.toLowerCase())) mauiSameName.push(record);
  else mauiOnly.push(record);
}

/**
 * WHAT EACH CHOOSER CARD ON /menu/ PRINTS, computed.
 *
 * It used to come from a `roomMenuFacts` filter over menu.json. That filter
 * answered a question no page asks any more: a location page renders its Toast
 * catalog, so a card advertising "34 dishes" against a page listing 39 is the
 * exact drift this whole pass exists to end. Same rows, same count.
 *
 *   served        how many dishes the room's own page lists
 *   exclusive     dishes only that room serves, across the San Diego six. The
 *                 truest answer to "what makes this room different".
 *   rareSections  sections at most two San Diego rooms carry. Sections nearly
 *                 everyone has are not distinguishing and are left out.
 *
 * A room can come back with nothing in either list, and that is an answer
 * rather than a gap.
 */
const cards = {};
// Maui included, because its card is on this page too and a card with a blank
// where its dish count goes is worse than no card. Its `exclusive` is counted
// against the San Diego set below rather than against itself.
for (const id of [...SAN_DIEGO, "maui"]) {
  const mine = perRoom[id];
  const exclusive = id === "maui"
    // For Maui that is "on no San Diego menu", which is the same question the
    // band above the card answers in words.
    ? [...mine.keys()].filter((key) => !tally.has(key))
    : [...mine.keys()].filter((key) => {
        const held = tally.get(key);
        return held && held.rooms.length === 1;
      });
  const sectionCount = (label) =>
    SAN_DIEGO.filter((room) =>
      [...perRoom[room].values()].some((v) => v.section.label === label),
    ).length;
  const labels = [...new Set([...mine.values()].map((v) => v.section.label))];
  cards[id] = {
    // ROWS THE PAGE RENDERS, not unique dish identities. East Village lists
    // Salmon and Spicy Tuna hand rolls as two rows and both resolve to one
    // menu.json id, so counting identities said 32 against a page showing 33.
    // The card's whole job is to agree with the page.
    served: roomMenus.byRoom[id].sections.reduce((n, sec) => n + sec.items.length, 0),
    exclusive: exclusive.length,
    rareSections: labels.filter((label) => sectionCount(label) <= 2),
  };
}

/**
 * THE REST OF THE CATALOG, the pool the "Also on our menu" photo grid picks
 * from. Deliberately NOT room-filtered like everything above:
 * `core`/`universal`/`bentoLayout` all answer "which rooms serve this",
 * counted from the Toast-sourced roomMenus rows, because the sections that
 * use them make availability claims ("on all six menus", a missingNote).
 * This section doesn't; it reads straight from menu.json itself, unfiltered
 * by which room actually has a given item on the floor today.
 *
 * EXCLUDES ONLY THE SEVEN BENTO DISHES, by id (bentoLayout carries
 * `dishId`, which is menu.json's own `id` for all seven today; matching by
 * id rather than name is what keeps this correct even though the bento
 * tile for `tajima-white` displays as "Tajima White" while menu.json's own
 * `name` field for that id is also "Tajima White" — no mismatch today, but
 * id is the actual join key everywhere else on this page and this stays
 * consistent with that rather than trusting display text to match).
 */
const bentoIds = new Set(bentoLayout.map((d) => d.dishId));
const catalogRestItems = menu.items.filter(
  (item) => item.listed !== false && !bentoIds.has(item.id),
);

/**
 * CATALOG PHOTO PICKS, rebuilt 2026-09-19. The section used to print all 65
 * catalogRestItems as a grouped text list; that was the full catalog and
 * read as one, which is not this section's job (the room chooser below it
 * already is the browsing/filtering layer). This is a small curated sample
 * with real photography, same editorial-call shape as BENTO_ORDER above:
 * which dishes represent the rest of the menu is a judgment call, not a
 * computable fact, so it is named here, in one place, rather than inferred
 * from an arbitrary rule (first N alphabetically, most sections covered,
 * etc.) that would pick differently every time the catalog changes.
 *
 * TWO STANDING EXCLUSIONS, both automatic: the seven bento dishes
 * (catalogRestItems already leaves them out) and Carnitas Ramen, left off
 * this list by hand rather than filtered by flag. `featurable: false`
 * (Open Decision #4) already keeps it out of the bento; this list is a
 * second, independent place a name could put it back into a photographed
 * card, so it is simply never one of the picks here, the same standing
 * rule applied a second time rather than trusted to cascade from the flag.
 *
 * EVERY PICK IS CHECKED AGAINST dishPhotos BELOW, not assumed: a name here
 * with no real (non-draft) photograph on file is filtered out rather than
 * rendering a blank tile, so this list can safely outlive any one photo's
 * status.
 */
const CATALOG_PICKS = [
  "Takoyaki",
  "Chicken Katsu Bun",
  "Crispy Rice Spicy Tuna",
  "Garlic Edamame",
  "Tebasaki Wings",
  "Tajima Black",
  "Curry Ramen",
  "Salmon Poke",
  "Katsu Curry",
  "Vegetarian Fried Rice",
  "Chicken Teriyaki",
  "Matcha Panna Cotta",
];
const catalogPhotoPicks = CATALOG_PICKS
  .map((name) => catalogRestItems.find((item) => item.name === name))
  .filter(Boolean)
  .map((item) => ({
    name: item.name,
    dishId: item.id,
    photo: dishPhotos.byDish[item.id] || null,
  }))
  .filter((item) => item.photo && item.photo.src);

function report() {
  const lines = ["", `/menu/ core set: served at ${THRESHOLD} or more of the ${SAN_DIEGO.length} San Diego rooms`, ""];
  lines.push(`  ${core.length} dishes qualify. Counted from roomMenus, the same rows the location pages render.`);
  for (let n = SAN_DIEGO.length; n >= THRESHOLD; n--) {
    const at = core.filter((c) => c.count === n);
    if (at.length) lines.push(`    ${n} of ${SAN_DIEGO.length}: ${at.length} dishes`);
  }
  lines.push(`    just outside, at ${THRESHOLD - 1} of ${SAN_DIEGO.length}: ${nextBand.length} dishes (${nextBand.map((d) => d.name).join(", ")})`);
  lines.push("");
  lines.push(`  Maui: ${mauiOnly.length} dishes no San Diego room serves, plus ${mauiSameName.length} that share a San Diego name and are a different preparation.`);
  lines.push("");
  lines.push(`  Catalog photo picks: ${catalogPhotoPicks.length} of ${CATALOG_PICKS.length} curated names resolved to a real photo.`);
  const missingPicks = CATALOG_PICKS.filter((name) => !catalogPhotoPicks.some((p) => p.name === name));
  if (missingPicks.length) lines.push(`    dropped, no usable photo: ${missingPicks.join(", ")}`);
  lines.push("");
  console.log(lines.join("\n"));
}
report();

export default {
  threshold: THRESHOLD,
  sanDiego: SAN_DIEGO,
  core,
  universal,
  universalFeaturable,
  bentoLayout,
  catalogPhotoPicks,
  nextBand,
  mauiOnly,
  mauiSameName,
  cards,
  // Joined here rather than in the template: Nunjucks has no `map` filter and
  // the alternative is a loop that builds a sentence, which is how sentences
  // and data drift apart.
  mauiOnlyNames: mauiOnly.map((d) => d.name).join(", "),
};
