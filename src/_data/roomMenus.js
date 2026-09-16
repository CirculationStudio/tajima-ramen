import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import menu from "./menu.json" with { type: "json" };
import menuConcepts from "./menuConcepts.json" with { type: "json" };
import aliases from "./menuAliases.json" with { type: "json" };
import locations from "./locations.json" with { type: "json" };
import dishPhotos from "./dishPhotos.js";

/**
 * EACH ROOM'S FULL MENU, FROM ITS OWN TOAST CATALOG.
 *
 * WHY THIS EXISTS. The site spent months trying to be one reconciled menu
 * across four sources that disagree: menu.json, Connor's spreadsheet, the July
 * printed menus and the Toast catalogs. That is unwinnable, and it generated
 * contradictions rather than resolving them. /menu/ had already retreated to a
 * room chooser because only 8 of 73 dishes are served at all six San Diego
 * rooms. The division of labour now:
 *
 *   /menu/          the signature and core dishes, and where a dish is missing
 *                   from a room it says so.
 *   a location page THAT ROOM'S FULL MENU, which is this file.
 *   Toast           the live authority. Every room links to its own page.
 *
 * SNAPSHOT, NOT A FEED. The catalogs are dated 2026-08-04 and nothing here
 * fetches. Pages say Toast is current and link to it rather than claiming this
 * list is complete today.
 *
 * NO PRICES, ANYWHERE. They exist in the catalogs and they are not read.
 * menuConcepts.json `_prices` has the history.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));

/* ---------------------------------------------------------------------------
   WHAT IS NOT A DISH.
   Explicit and hand-checked, never a name pattern. Every exclusion is counted
   and printed, so a row that quietly stops rendering is visible on the build.
   --------------------------------------------------------------------------- */
const EXCLUDE_SECTION = {
  "Happy Hours - HH Drinks": "happy hour pricing, and happyHour.json owns that surface",
  "Happy Hours - HH Foods": "happy hour pricing of dishes already listed above",
  "Specials and Retail": "packaged goods (tea, rice), not dishes. Carries retail:true",
};
const EXCLUDE_ITEM = {
  "Extra Noodles": "a ramen add-on, priced per portion",
  "Extra Broth": "a ramen add-on, priced per portion",
  "Extra Appetizers Toppings": "modifier row, price null",
  "Matcha refreshers, sodas and teas": "a price band across a category, not a dish",
};
const DRINK_SECTION = /^Drinks\b|^Beverages$/i;

/* ---------------------------------------------------------------------------
   TOAST SECTION NAMES TO THE HOUSE SECTIONS.
   Toast names vary per room and none of them is a house key. Explicit table:
   an unmapped section is reported and its rows still render, under izakaya,
   rather than disappearing.
   --------------------------------------------------------------------------- */
const SECTION = {
  Appetizers: "izakaya",
  "Side Menu": "izakaya",
  Sides: "izakaya",
  Onigiri: "izakaya",
  Ramens: "ramen",
  Ramen: "ramen",
  "Rice Dishes": "rice",
  "Side Rices": "rice",
  Sushi: "sushi",
  "Sushi Hand Rolls": "sushi",
  Desserts: "dessert",
  Dessert: "dessert",
  "Dessert - Mochi Ice Cream": "dessert",
  Combo: "combo",
};

/* ---------------------------------------------------------------------------
   THE HOUSE TRANSFORM, AND WHY ONLY TWO PARTS OF IT RUN HERE.
   menu.json documents a transform of "sentence case, a closing period, the
   fraction written out, the trailing and dropped". Checked against real pairs,
   only the first two are mechanical. The others are editorial:
   
     "the trailing and dropped" reads as ", and X" -> ", X", and menu.json also
     does " and " -> ", " in list position. Applied blind that turns
     "served with sweet and sour sauce" into "served with sweet, sour sauce".
   
   And menu.json's text is not a transform of Toast's text at all: it is a
   transcription of the client's printed menus, a different source. Carnitas
   drops "tonkotsu" and "egg noodles"; Chicken Katsu Bun gains an article;
   Chicken Ramen is a different room's recipe.
   
   CLAUDE.md: menu descriptions are never generated or modified. So this runs
   whitespace and a closing period, and nothing that changes a word. Every row
   whose Toast text differs from menu.json's is reported for an editorial pass
   somebody makes on purpose.
   --------------------------------------------------------------------------- */
function house(text) {
  if (!text) return "";
  let out = String(text).replace(/\s+/g, " ").trim();
  if (!out) return "";
  out = out.charAt(0).toUpperCase() + out.slice(1);
  if (!/[.!?]$/.test(out)) out += ".";
  return out;
}

const VERIFIED = new Map();
for (const entry of aliases.verified) {
  for (const room of entry.rooms) VERIFIED.set(entry.toastName + "|" + room, entry.id);
}
const DISH = new Map(menu.items.map((item) => [item.id, item]));

function readCatalogs() {
  const dir = path.join(HERE, "toastMenus");
  const out = {};
  for (const file of fs.readdirSync(dir).sort()) {
    if (!file.endsWith(".json")) continue;
    out[file.replace(/\.json$/, "")] = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  }
  return out;
}
const catalogs = readCatalogs();

// Convoy's catalog, keyed by dish name, for the description fallback. Five of
// the seven files say in their own `_ramenDescriptions` that the wording was
// NOT copied because it matches Convoy's, and to read Convoy's file for it.
const convoyText = new Map();
for (const section of catalogs.convoy.sections) {
  for (const item of section.items) {
    if (item.description) convoyText.set(item.name, item.description);
  }
}

const report = { excluded: [], unmappedSections: [], descriptionSources: {}, byRoom: {} };

function buildRoom(roomId) {
  const catalog = catalogs[roomId];
  if (!catalog) return null;

  const bands = new Map();
  const drinkSections = [];
  let kept = 0;
  let rowsSeen = 0;
  const sources = { toast: 0, convoy: 0, menuJson: 0, none: 0 };

  for (const section of catalog.sections) {
    if (DRINK_SECTION.test(section.name)) {
      drinkSections.push({ name: section.name, count: section.items.length });
      continue;
    }
    if (EXCLUDE_SECTION[section.name]) {
      for (const item of section.items) {
        report.excluded.push({ room: roomId, section: section.name, name: item.name,
          why: EXCLUDE_SECTION[section.name] });
      }
      continue;
    }

    let key = SECTION[section.name];
    if (!key) {
      key = "izakaya";
      report.unmappedSections.push({ room: roomId, section: section.name, renderedAs: key });
    }

    for (const item of section.items) {
      rowsSeen += 1;
      if (EXCLUDE_ITEM[item.name]) {
        report.excluded.push({ room: roomId, section: section.name, name: item.name,
          why: EXCLUDE_ITEM[item.name] });
        continue;
      }

      // The join. An unmatched row is not an error: it renders from Toast
      // alone, with no dietary mark and no photograph, which is the safe
      // default. See menuAliases.json.
      const dishId = VERIFIED.get(item.name + "|" + roomId) || null;
      const dish = dishId ? DISH.get(dishId) : null;

      // This room's Toast, then Convoy's for the same dish, then menu.json.
      let description = "";
      let descriptionSource = "none";
      if (item.description && item.description.trim()) {
        description = item.description;
        descriptionSource = "toast";
      } else if (convoyText.has(item.name)) {
        description = convoyText.get(item.name);
        descriptionSource = "convoy-toast";
      } else if (dish && dish.description) {
        description = dish.description;
        descriptionSource = "menu-json";
      }
      sources[descriptionSource === "convoy-toast" ? "convoy"
        : descriptionSource === "menu-json" ? "menuJson"
        : descriptionSource === "toast" ? "toast" : "none"] += 1;

      if (!bands.has(key)) bands.set(key, []);
      bands.get(key).push({
        name: item.name,
        description: house(description),
        descriptionSource,
        dishId,
        dietary: dish ? dish.dietary || [] : [],
        photo: dishId ? dishPhotos.photoFor(dishId, roomId) : null,
        toastSection: section.name,
      });
      kept += 1;
    }
  }

  const sections = menuConcepts.sectionOrder
    .filter((key) => bands.has(key))
    .map((key) => ({ key, label: menuConcepts.sectionLabels[key], items: bands.get(key) }));

  report.descriptionSources[roomId] = sources;
  report.byRoom[roomId] = { before: rowsSeen, after: kept,
    photographed: sections.flatMap((s) => s.items).filter((i) => i.photo).length };

  return { id: roomId, sections, drinks: drinks(roomId, drinkSections),
    total: kept, source: catalog._source, pulledAt: catalog._pulledAt };
}

/* ---------------------------------------------------------------------------
   DRINKS ARE NAMED, NOT LISTED.
   Counted here and NOT published as a number. CLIENT_FACTS.md is explicit that
   tap counts are not publishable: College Heights is written "twenty-plus" and
   never 21, and Convoy's number never goes on the site at all. A rotating
   roster of branded cans would also be wrong within weeks, and the catalogs
   are a 2026-08-04 snapshot. So the page says what KIND of program a room runs
   and links to Toast for what is actually pouring.
   --------------------------------------------------------------------------- */
function drinks(roomId, sections) {
  const loc = locations.items.find((l) => l.id === roomId);
  const text = sections.map((s) => s.name).join(" ").toLowerCase();
  const kinds = [];
  if (/beer/.test(text)) kinds.push("beer");
  if (/cider/.test(text)) kinds.push("cider");
  if (/kombucha/.test(text)) kinds.push("kombucha");
  if (/sake/.test(text)) kinds.push("sake");
  if (/sochu|shochu/.test(text)) kinds.push("shochu");
  const onTap = /on tap/.test(text);
  const alcoholic = kinds.length > 0;

  return {
    hasSection: sections.length > 0,
    kinds,
    onTap,
    alcoholic,
    // Counted for the build report only. Never rendered.
    countInternal: sections.reduce((n, s) => n + s.count, 0),
    orderUrl: loc ? loc.orderUrl : null,
    // Plaza Bonita pours no alcohol, which is a fact about the room from
    // CLIENT_FACTS.md rather than an absence in a catalog, so the page answers
    // the question instead of staying silent.
    noAlcohol: roomId === "plaza-bonita",
    // Mercury has a full bar in CLIENT_FACTS.md and no drinks section in its
    // catalog at all. Flagged, not resolved, and not rendered as "none".
    catalogGap: roomId === "mercury" && sections.length === 0,
  };
}

const byRoom = {};
for (const loc of locations.items) {
  const room = buildRoom(loc.id);
  if (room) byRoom[loc.id] = room;
}

function print() {
  const lines = ["", "Room menus, built from the Toast catalogs (pulled 2026-08-04)", ""];
  lines.push("  room              rows  kept  shot  sections  description from");
  lines.push("  " + "-".repeat(76));
  for (const [id, room] of Object.entries(byRoom)) {
    const r = report.byRoom[id];
    const s = report.descriptionSources[id];
    lines.push(
      "  " + id.padEnd(17) +
        String(r.before).padStart(4) + String(r.after).padStart(6) +
        String(r.photographed).padStart(6) + String(room.sections.length).padStart(10) +
        "  toast " + String(s.toast).padStart(2) +
        ", convoy " + String(s.convoy).padStart(2) +
        ", menu.json " + String(s.menuJson).padStart(2) +
        (s.none ? ", none " + s.none : ""),
    );
  }
  lines.push("");
  lines.push("  Dish photography, counted from the rows each page actually renders:");
  for (const [id, room] of Object.entries(byRoom)) {
    const rows = room.sections.flatMap((s) => s.items);
    const shot = rows.filter((r) => r.photo).length;
    const pct = rows.length ? Math.round((shot / rows.length) * 100) : 0;
    lines.push(`    ${id.padEnd(17)}${String(shot).padStart(3)}/${String(rows.length).padEnd(3)} ${String(pct).padStart(4)}%`);
  }
  lines.push("");
  lines.push("  EVERY ROOM RENDERS THE SAME TREATMENT. Coverage is reported, not acted on:");
  lines.push("  a dish with no photograph gets the designed empty tile, which is what the");
  lines.push("  reference specifies for its own photo-less dishes.");
  lines.push("");
  lines.push(`  ${report.excluded.length} rows excluded as non-dish. ` +
    `${aliases.unmatched.length} Toast names render without a mark or a photograph, by design.`);
  if (report.unmappedSections.length) {
    lines.push("  UNMAPPED Toast sections, rendered under izakaya:");
    for (const u of report.unmappedSections) lines.push(`    ${u.room}: ${u.section}`);
  }
  lines.push("");
  console.log(lines.join("\n"));
}
print();

export default { byRoom, report, pulledAt: "2026-08-04" };
