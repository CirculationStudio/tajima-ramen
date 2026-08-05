// Build src/_data/photos.json from the files in public/images/photo/.
//
//   node scripts/build-photo-manifest.js            write the manifest
//   node scripts/build-photo-manifest.js --dry      print, write nothing
//   node scripts/build-photo-manifest.js --dir X    read from X instead
//
// THE ONE RULE THIS SCRIPT EXISTS TO ENFORCE:
// the filename is the source of truth for what a photo shows. The directory a
// file arrived in is never read, never parsed, and never consulted. This is not
// a style preference. The source CDN has a `gbp/College Heights/` folder
// containing files named `tajima-ramen-convoy-*`, which are Convoy dishes. Any
// tool that trusted the path would put Convoy bowls on the College Heights page
// and nobody would notice until a customer did.
//
// A photo is assigned a location ONLY if its filename contains a literal token
// from LOCATION_TOKENS below. No token means no location: the photo can still
// be used brand-level (a bowl is that bowl wherever it is shot) but it can
// never appear on a location page. Everything unresolved goes to UNMAPPED for a
// human, never to a default.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const dirFlag = args.indexOf("--dir");
const PHOTO_DIR = dirFlag !== -1 ? args[dirFlag + 1] : path.join(ROOT, "public/images/photo");
const OUT = path.join(ROOT, "src/_data/photos.json");

const menu = JSON.parse(fs.readFileSync(path.join(ROOT, "src/_data/menu.json"), "utf8"));

// ---------------------------------------------------------------------------
// Location tokens. LITERAL SUBSTRING MATCHES ONLY. No fuzzy matching, no
// stemming, no partial credit. Confirmed by Steve on build night.
// ---------------------------------------------------------------------------
const LOCATION_TOKENS = [
  ["convoy", "convoy"],
  ["mercury", "mercury"],
  ["east-village", "east-village"],
  // College Heights: `tajima-ch-` is the marker. `college-heights` spelled out
  // is accepted as a second LITERAL token. Steve: "don't infer from partial
  // matches" -- so a bare `ch` anywhere in a name matches nothing.
  ["tajima-ch-", "college-heights"],
  ["college-heights", "college-heights"],
  ["crown-point", "crown-point"],
  ["plaza-bonita", "plaza-bonita"],
  ["maui", "maui"],
  ["kihei", "maui"],
];

// ---------------------------------------------------------------------------
// Explicit deny. `pacific-beach` is NOT Crown Point and must never resolve to
// it, however close they are on a map. Crown Point's Toast slug already reads
// `tajima-pacific-beach`, which is a known NAP inconsistency flagged in
// SITE_ARCHITECTURE.md. Merging them here would bake that defect into the
// photography layer too. Always UNMAPPED, never resolved by assumption.
// ---------------------------------------------------------------------------
const DENY_TOKENS = [
  [
    "pacific-beach",
    "`pacific-beach` is not a location token. It must not be resolved to Crown Point by proximity. Crown Point's Toast slug carries the same defect and SITE_ARCHITECTURE.md already flags it. Needs a human ruling on which room this photograph is actually of.",
  ],
];

// ---------------------------------------------------------------------------
// SIGNAL TYPE: a human-written location note inside the filename.
//
// The GBP source set contains files named like
//   "Shishito Peppers Large - EV Only.jpeg"
//   "Miso Soup Large - Mercury Only.jpeg"
// Someone at Tajima appended "- <LOCATION> Only" by hand to correct a wrong
// assignment. Seven files, four unique subjects, one East Village and three
// Mercury. It is a deliberate, repeated convention, not a one-off.
//
// It is matched as a PATTERN, `large - <location> only`, and nowhere else.
// `ev` is expanded ONLY inside this pattern. A bare `ev` anywhere in a filename
// still resolves to nothing, which is why "tajima-ev-bar-01" went to UNMAPPED
// in the dry run and would still go there today. That distinction is the whole
// point: the note carries a human's intent, a loose abbreviation does not.
//
// Independently corroborated by the live Toast catalogs pulled 2026-08-04:
// Shishito Peppers is on East Village and Maui only; Miso Soup, Shrimp Tempura
// and Vegetable Tempura are Mercury-only. The handwritten notes and the
// operational system agree without either knowing about the other.
const LOCATION_NOTE = /\blarge[\s-]+([a-z]+(?:[\s-][a-z]+)?)[\s-]+only\b/;
const NOTE_EXPAND = {
  ev: "east-village",
  "east-village": "east-village",
  mercury: "mercury",
  convoy: "convoy",
  "crown-point": "crown-point",
  "college-heights": "college-heights",
  "plaza-bonita": "plaza-bonita",
  maui: "maui",
  kihei: "maui",
};

// ---------------------------------------------------------------------------
// Narrow allowance, two files only.
//
// Steve, build night: `offsite-kitchen` is sanctioned as a Crown Point
// reference for these two specific files and NOT as a general rule for any
// future filename containing those words. The reasoning is that CLIENT_FACTS.md
// confirms exactly one commissary and places it in Crown Point, so this infers
// from an already-confirmed fact rather than inventing one. That reasoning
// covers these two files. It does not cover a file nobody has looked at.
//
// Any OTHER filename containing `offsite-kitchen` goes to UNMAPPED.
// ---------------------------------------------------------------------------
const OFFSITE_KITCHEN_ALLOWLIST = new Set([
  "tajima-ramen-offsite-kitchen-01-portrait",
  "tajima-ramen-offsite-kitchen-02-landscape",
]);

// CLIENT_FACTS.md, The menu: "Do not feature: Carnitas Ramen, Tajima Fries,
// Curry Fries, Cream Cheese Wontons, Crispy Rice Spicy Tuna, Jalapeno Bomb.
// These are real dishes real customers order. They are not hidden, they are
// not the brand voice."
//
// A photograph of one is not a reason to overturn that. These are listed, not
// silently discarded, because deleting them would hide a real asset from the
// person who has to decide.
const DO_NOT_FEATURE = [
  ["carnitas", "Carnitas Ramen"],
  ["tajima-fries", "Tajima Fries"],
  ["curry-fries", "Curry Fries"],
  ["cream-cheese-wonton", "Cream Cheese Wontons"],
  ["crispy-rice-spicy-tuna", "Crispy Rice Spicy Tuna"],
  ["jalapeno-bomb", "Jalapeno Bomb"],
];

// Words that mark a photo as showing noodle or broth production.
const PROCESS_WORDS = [
  "noodle", "noodles", "dough", "sheeter", "sheeting", "cut", "cutter",
  "machine", "broth", "commissary", "kitchen", "production", "flour", "mix",
];

// Subject classification. Type only, never location.
const ROOM_WORDS = ["dining", "room", "interior", "exterior", "storefront", "bar", "patio", "counter", "seating"];

// ---------------------------------------------------------------------------
// Intrinsic dimensions, so every <img> ships explicit width/height and nothing
// shifts on load. Handles WebP (VP8 / VP8L / VP8X), JPEG, and PNG.
// ---------------------------------------------------------------------------
function dimensions(buf) {
  if (buf.length > 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const fourcc = buf.toString("ascii", 12, 16);
    if (fourcc === "VP8 ") {
      return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    }
    if (fourcc === "VP8L") {
      const b = buf.readUInt32LE(21);
      return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
    }
    if (fourcc === "VP8X") {
      const w = buf[24] | (buf[25] << 8) | (buf[26] << 16);
      const h = buf[27] | (buf[28] << 8) | (buf[29] << 16);
      return { width: w + 1, height: h + 1 };
    }
    return null;
  }
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
      }
      i += 2 + len;
    }
  }
  return null;
}

function orientation(d) {
  if (!d) return null;
  const r = d.width / d.height;
  if (r > 1.15) return "landscape";
  if (r < 0.87) return "portrait";
  return "square";
}

// Match a filename against menu.json, on TOKEN BOUNDARIES.
//
// Substring matching was wrong and the Kihei set proved it: the id `chicken`
// is a substring of "Chicken-Chashu-Bowl", "Chicken-Katsu-Bun" and
// "Chicken-Katsu-Curry-Rice", none of which are the Chicken Ramen on
// menu.json, and `karaage` and `chicken` both appear in
// "Karaage-Fried-Chicken" so whichever sorted first would have won silently.
//
// Now a dish matches only if its key appears as a contiguous run of whole
// hyphen-delimited tokens, and if MORE THAN ONE dish matches the file goes to
// UNMAPPED rather than picking a winner.
function matchDish(stem) {
  const tokens = stem.split("-").filter(Boolean);
  const contains = (keyTokens) => {
    for (let i = 0; i + keyTokens.length <= tokens.length; i += 1) {
      if (keyTokens.every((t, j) => tokens[i + j] === t)) return true;
    }
    return false;
  };

  const hits = new Set();
  for (const item of menu.items) {
    const keys = [item.id, item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")];
    for (const key of keys) {
      if (key && contains(key.split("-").filter(Boolean))) hits.add(item.id);
    }
  }
  // Known typo in the source set. Not "fixed" on the way in, just understood.
  if (contains(["traditonal", "tonkotsu"]) || contains(["traditional", "tonkotsu"])) hits.add("tonkotsu");

  if (hits.size === 0) return null;
  if (hits.size > 1) return { ambiguous: [...hits] };
  return [...hits][0];
}

function classify(stem, dish) {
  if (dish) return "dish";
  if (PROCESS_WORDS.some((w) => stem.includes(w))) return "process";
  if (ROOM_WORDS.some((w) => stem.includes(w))) return "room";
  return null;
}

function proposedUse(location, dish, type) {
  const uses = [];

  // MAUI IS SCOPED TO ITS OWN PAGE. A Kihei bowl is not proposed for /menu/ or
  // the home teaser even when the filename names a dish that exists on
  // menu.json. menu.json is the brand and San Diego menu; CLIENT_FACTS.md says
  // Maui runs "dishes of its own", and per-location availability is still
  // unknown (Open Decision #12). Illustrating the brand menu with a photograph
  // from a 2,500-mile-away kitchen asserts the products are the same dish, and
  // nobody has established that.
  const brandLevelAllowed = location !== "maui";

  if (dish && typeof dish === "string" && brandLevelAllowed) {
    const item = menu.items.find((i) => i.id === dish);
    // feature: false means plain line, no photo, no card, no callout. Carnitas
    // is the live case (Open Decision #4, resolved 2026-08-04): it ships as a
    // line on /menu/ and must never acquire a photo slot. Proposing one here
    // would hand someone the exact thing the decision was designed to prevent.
    if (item && item.feature) {
      uses.push("/menu/", "/");
      if (dish === "vegan") uses.push("/menu/vegan-ramen/");
    }
  }

  if (location) {
    const slug =
      location === "college-heights" ? "/tajima-college-heights/"
      : location === "maui" ? "/tajima-ramen-maui-hawaii/"
      : `/tajima-${location}/`;
    uses.push(slug);
  }

  // /noodle-room/ is the narrowest gate on the site. A process photo reaches it
  // only if the filename says crown-point or names no location at all. Maui is
  // excluded here AND by MAUI_PROCESS_FLAGGED below: whether its process
  // matches Crown Point is unconfirmed (Open Decision #1).
  if (type === "process" && (location === null || location === "crown-point")) {
    uses.push("/noodle-room/");
  }
  return [...new Set(uses)];
}

// ---------------------------------------------------------------------------

const files = fs.existsSync(PHOTO_DIR)
  ? fs.readdirSync(PHOTO_DIR).filter((f) => /\.(webp|jpe?g|png)$/i.test(f)).sort()
  : [];

const manifest = {};
const unmapped = [];
const mauiFlagged = [];
const doNotFeature = [];

for (const file of files) {
  const stem = file.replace(/\.[^.]+$/, "").toLowerCase();
  const buf = fs.readFileSync(path.join(PHOTO_DIR, file));
  const dim = dimensions(buf);

  const denied = DENY_TOKENS.find(([token]) => stem.includes(token));
  let location = null;
  let locationSource = null;

  if (!denied) {
    // The handwritten note wins over a plain token: it exists precisely because
    // someone knew the plain token was wrong.
    const note = stem.match(LOCATION_NOTE);
    const noted = note ? NOTE_EXPAND[note[1].replace(/\s+/g, "-")] : undefined;
    if (noted) {
      location = noted;
      locationSource = `handwritten note "${note[0]}" in the filename`;
    }
    const hit = noted ? null : LOCATION_TOKENS.find(([token]) => stem.includes(token));
    if (hit) {
      location = hit[1];
      locationSource = hit[0];
    } else if (stem.includes("offsite-kitchen")) {
      if (OFFSITE_KITCHEN_ALLOWLIST.has(stem)) {
        location = "crown-point";
        locationSource = "offsite-kitchen (allowlisted, this file only)";
      }
    }
  }

  const dishMatch = matchDish(stem);
  const ambiguous = dishMatch && typeof dishMatch === "object" ? dishMatch.ambiguous : null;
  const dish = ambiguous ? null : dishMatch;
  const type = classify(stem, dish);
  const banned = DO_NOT_FEATURE.find(([token]) => stem.includes(token));
  const isProcess = type === "process";

  // A dish id on a MAUI photo is a guess, not a fact, so it is recorded as one.
  // menu.json describes the brand and San Diego menu. CLIENT_FACTS.md says Maui
  // runs "dishes of its own", and the Kihei set proves the gap: "Chicken Chashu
  // Bowl", "Chicken Katsu Bun" and "Chicken Katsu Curry Rice" all contain the
  // token `chicken` and none of them is menu.json's Chicken Ramen. Leaving
  // `dish` populated would let a later step treat a Kihei plate as the San
  // Diego menu item of the same name.
  const isMaui = location === "maui";
  const entry = {
    file,
    src: `/images/photo/${file}`,
    location,
    locationSource,
    dish: isMaui ? null : dish,
    dishGuessFromFilename: isMaui && dish ? dish : undefined,
    dishGuessNote: isMaui && dish
      ? "Filename token only. NOT confirmed to be the menu.json dish of that name; Maui runs its own menu. Do not use to populate menu availability."
      : undefined,
    type,
    width: dim ? dim.width : null,
    height: dim ? dim.height : null,
    orientation: orientation(dim),
    proposedUse: proposedUse(location, dish, type),
    // Set when the filename does not say what the photograph shows. The file
    // is still placeable (its location is known) but nobody can write honest
    // alt text for it without opening it.
    needsEyes: type === null || undefined,
    alt: "[DRAFT, NEEDS REVIEW] ",
  };

  if (denied) {
    unmapped.push({ file, reason: denied[1] });
    continue;
  }
  if (ambiguous) {
    unmapped.push({
      file,
      reason: `Filename matches more than one dish on menu.json (${ambiguous.join(", ")}). Not guessed. A human has to say which, or confirm it is a Maui dish that is not on menu.json at all.`,
    });
    continue;
  }
  if (banned) {
    doNotFeature.push({
      file,
      dish: banned[1],
      location,
      reason: `"${banned[1]}" is on the CLIENT_FACTS.md do-not-feature list. NOT USED anywhere. Listed rather than deleted so the asset is visible to whoever decides, but a photograph is not a reason to overturn a positioning decision.`,
    });
    continue;
  }
  if (stem.includes("offsite-kitchen") && !location) {
    unmapped.push({
      file,
      reason: "Contains `offsite-kitchen` but is not one of the two allowlisted files. The Crown Point allowance was granted narrowly for those two only and does not extend to new files.",
    });
    continue;
  }
  if ((location === "maui") && isProcess) {
    mauiFlagged.push({
      file,
      reason: "Maui photograph that appears to show noodle or broth production. NOT USED anywhere. Whether Maui's process matches Crown Point is unconfirmed (SITE_ARCHITECTURE.md Open Decision #1), so this cannot stand as evidence of anything about the Noodle Room.",
    });
    continue;
  }
  if (!location && !dish) {
    unmapped.push({
      file,
      reason: "No recognised location token and no dish match. Could be an unknown abbreviation; expansions are never invented. Needs a human ruling on what this shows.",
    });
    continue;
  }

  manifest[file] = entry;
}

const output = {
  _note: "Generated by scripts/build-photo-manifest.js. Do not hand-edit the mapping; fix the filename or the script's token list and regenerate. Alt text IS hand-edited and is the one field the script cannot produce.",
  _rule: "The filename is the source of truth for what a photo shows. The directory a file arrived in is never read. A photo reaches a location page only if its filename names that location.",
  _generated: files.length,
  _mapped: Object.keys(manifest).length,
  _unmapped: unmapped.length,
  _mauiFlagged: mauiFlagged.length,
  _doNotFeature: doNotFeature.length,
  photos: manifest,
  UNMAPPED: unmapped,
  MAUI_PROCESS_FLAGGED: mauiFlagged,
  DO_NOT_FEATURE_FLAGGED: doNotFeature,
};

if (DRY) {
  console.log(JSON.stringify(output, null, 2));
} else {
  fs.writeFileSync(OUT, JSON.stringify(output, null, 2) + "\n");
  console.log(`${files.length} files: ${Object.keys(manifest).length} mapped, ${unmapped.length} unmapped, ${mauiFlagged.length} maui-process-flagged, ${doNotFeature.length} do-not-feature-flagged`);
  console.log(`wrote ${path.relative(ROOT, OUT)}`);
}
