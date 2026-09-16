import locations from "./locations.json" with { type: "json" };
import roomMenus from "./roomMenus.js";

/**
 * WHICH MENU TREATMENT EACH ROOM RENDERS, AND WHY IT IS NOT ONE ANSWER.
 *
 * The menu module has two shipped variants. A2 puts a 92px photograph of the
 * dish beside every row. B2 is three columns of type and no photography.
 *
 * A2 is better when the photographs exist and worse when they do not, and
 * whether they exist is a per-room fact that runs from 47 to 100 percent:
 *
 *   Maui 8/8, Crown Point 20/21, East Village 23/26, College Heights 19/24,
 *   Convoy 26/34, Plaza Bonita 8/13, Mercury 22/47.
 *
 * At Crown Point, 20 of 21 cards carry the dish. At Mercury, 25 of 47 cards
 * are the ghosted placeholder tile, the sushi band is one photograph against
 * seven placeholders, and the monthly specials are eight for eight. A grid
 * that is mostly the same ghosted mark reads as broken images rather than as a
 * designed empty state. So a single sitewide choice is wrong at one end of the
 * range or the other, and the choice is made per room, here.
 *
 * THE THRESHOLD IS SELF-CORRECTING AND THAT IS THE POINT.
 *
 * There is no list of rooms in this file. Coverage is counted at build time by
 * asking dishPhotos.photoFor() the same question the template asks, once per
 * dish the room actually lists, so the number here and the number of tiles on
 * the page cannot disagree. The day Mercury's sushi is photographed, mapped in
 * dishPhotos.js and given real alt, its coverage crosses 70 and its pages
 * render A2 on the next build. Nobody has to remember. Equally, if a file were
 * removed or an alt string were reverted to draft, a room would fall back to
 * B2 rather than filling with placeholders.
 *
 * WHY 70. Below it a reader sees more placeholders than food, which is the
 * failure A2 held back for in the first place. It is a judgement, not a
 * measurement, and it is one number in one place.
 *
 * Read by components/location-menu.njk. The internal A/B route at
 * /internal/menu-a2-vs-b2/ overrides it on purpose, to show both.
 */
const THRESHOLD = 0.7;

/**
 * COUNTED FROM roomMenus, NOT menu.json, 2026-09-16.
 *
 * It used to count menu.json rows filtered by `locations`, which was the same
 * question the template asked. The template asks a different question now: a
 * location page renders that room's Toast catalog. Left pointing at menu.json
 * this file would have gone on reporting coverage against a list no page
 * shows, and picked the treatment for one menu by measuring another.
 *
 * PHASE 2 DELETES THIS FILE. The brief is that every room renders the same
 * treatment and a dish with no photograph degrades into the designed empty
 * tile. It is corrected rather than left stale in the meantime, because a
 * wrong number that nobody has deleted yet is still a wrong number.
 */
function coverageFor(locId) {
  const room = roomMenus.byRoom[locId];
  if (!room) return { served: 0, photographed: 0, coverage: 0, missing: [] };
  const rows = room.sections.flatMap((section) => section.items);
  const photographed = rows.filter((row) => row.photo);
  return {
    served: rows.length,
    photographed: photographed.length,
    coverage: rows.length ? photographed.length / rows.length : 0,
    missing: rows.filter((row) => !row.photo).map((row) => ({ name: row.name, dishId: row.dishId })),
  };
}

const byRoom = {};
const rows = [];

for (const loc of locations.items) {
  const stat = coverageFor(loc.id);
  // A room with no menu at all renders no module, so its variant is moot. It
  // is recorded as b2 rather than left undefined so nothing downstream has to
  // handle a missing key.
  const variant = stat.served && stat.coverage >= THRESHOLD ? "a2" : "b2";
  byRoom[loc.id] = { ...stat, variant, name: loc.name };
  rows.push({ id: loc.id, name: loc.name, ...stat, variant });
}

/**
 * SAY IT OUT LOUD, EVERY BUILD.
 *
 * Two rooms looking different from the other five is the kind of thing that
 * gets "fixed" by the next person to touch this repo, because an inconsistency
 * with no explanation attached looks like a bug. This prints the table and the
 * reason into the build output beside the rest of it, so the explanation is
 * where the work happens rather than in a commit message nobody will read.
 *
 * Same idea as the tone-clash guard in eleventy.config.js, one step softer:
 * that one throws because it catches a fault, this one reports because it
 * describes a decision.
 */
function report() {
  const pct = (n) => `${Math.round(n * 100)}%`.padStart(5);
  const lines = [
    "",
    `Menu module variant by room (threshold ${pct(THRESHOLD).trim()} dish-photo coverage)`,
    "  A2 shows a photograph per dish. B2 is type only, and is what a room",
    "  gets when too many tiles would be placeholders. Computed from live",
    "  coverage in src/_data/menuVariants.js, so a room moves on its own when",
    "  its photography lands. Do not hardcode this.",
    "",
  ];
  for (const row of [...rows].sort((a, b) => b.coverage - a.coverage)) {
    lines.push(
      `  ${row.name.padEnd(16)} ${String(row.photographed).padStart(3)}/${String(row.served).padEnd(3)}` +
        ` ${pct(row.coverage)}   ${row.variant.toUpperCase()}`,
    );
  }
  const held = rows.filter((row) => row.variant === "b2" && row.served);
  if (held.length) {
    lines.push("");
    for (const row of held) {
      lines.push(
        `  ${row.name} renders B2: ${row.missing.length} of its ${row.served} dishes are unphotographed.`,
      );
    }
  }
  lines.push("");
  console.log(lines.join("\n"));
}
report();

export default { threshold: THRESHOLD, byRoom, rows };
