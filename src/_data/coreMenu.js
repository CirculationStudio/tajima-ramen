import roomMenus from "./roomMenus.js";
import locations from "./locations.json" with { type: "json" };

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
  console.log(lines.join("\n"));
}
report();

export default {
  threshold: THRESHOLD,
  sanDiego: SAN_DIEGO,
  core,
  universal,
  nextBand,
  mauiOnly,
  mauiSameName,
  cards,
  // Joined here rather than in the template: Nunjucks has no `map` filter and
  // the alternative is a loop that builds a sentence, which is how sentences
  // and data drift apart.
  mauiOnlyNames: mauiOnly.map((d) => d.name).join(", "),
};
