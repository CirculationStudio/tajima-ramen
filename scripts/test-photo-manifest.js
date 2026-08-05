// Proves that regenerating the photo manifest is non-destructive.
//
// WHY THIS EXISTS. scripts/build-photo-manifest.js used to write
// `alt: "[DRAFT, NEEDS REVIEW] "` for every photograph on every run. Running it
// therefore destroyed every hand-written alt string in src/_data/photos.json,
// which is the one field the manifest's own _note says the script cannot
// produce. Nothing caught it: the script exits 0, the JSON stays valid, and
// the only symptom is 21 reviewed descriptions quietly replaced by a
// placeholder. The roomPhotos.js build guard would eventually throw for any
// PLACED photo, but everything classified-and-not-yet-placed would just lose
// its text with no signal at all.
//
// This is the same failure shape as SITE_ARCHITECTURE.md Open Decisions #18,
// #19 and #32: a green run that destroys something quietly. The fix is a test
// that fails loudly.
//
// WHAT IT CHECKS
//   1. Every entry that has real alt today still has BYTE-IDENTICAL alt after
//      a regenerate. This is the regression that motivated the file.
//   2. Regenerating twice in a row is idempotent across the whole manifest,
//      so a second run cannot drift from the first.
//   3. Hand-authored fields survive, including a locked proposedUse. The
//      commissary set depends on this: it classifies as `process` with a null
//      location, which makes the script propose /noodle-room/, and that page
//      names Crown Point in its own hero.
//
// Runs the generator with --dry, so it never writes to photos.json.
//
//   npm run test:photos

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const MANIFEST = path.join(ROOT, "src/_data/photos.json");
const GENERATOR = path.join(ROOT, "scripts/build-photo-manifest.js");

const HAND_FIELDS = [
  "locationStatus",
  "duplicateGroup",
  "duplicateNote",
  "proposedUseNote",
  "proposedUseLocked",
];

function generate() {
  const out = execFileSync("node", [GENERATOR, "--dry"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return JSON.parse(out);
}

function hasRealAlt(value) {
  return typeof value === "string" && value.trim() !== "" && !value.trim().startsWith("[DRAFT");
}

const failures = [];
function check(condition, message) {
  if (!condition) failures.push(message);
}

const committed = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const first = generate();
const second = generate();

// --- 1. reviewed alt survives a regenerate --------------------------------
const reviewed = Object.entries(committed.photos).filter(([, p]) => hasRealAlt(p.alt));
check(reviewed.length > 0, "No reviewed alt text found to test against. Did photos.json get wiped already?");

for (const [file, before] of reviewed) {
  const after = first.photos[file];
  check(after !== undefined, `${file}: reviewed alt existed, but the file vanished from a regenerate.`);
  if (!after) continue;
  check(
    after.alt === before.alt,
    `${file}: alt text CHANGED on regenerate.\n      before: ${JSON.stringify(before.alt)}\n      after:  ${JSON.stringify(after.alt)}`,
  );
}

// --- 2. two runs in a row are identical ------------------------------------
check(
  JSON.stringify(first.photos) === JSON.stringify(second.photos),
  "Two consecutive regenerates produced different manifests. The generator is not idempotent.",
);

// --- 3. hand-authored fields survive ---------------------------------------
for (const [file, before] of Object.entries(committed.photos)) {
  const after = first.photos[file];
  if (!after) continue;
  for (const key of HAND_FIELDS) {
    if (before[key] === undefined) continue;
    check(
      JSON.stringify(after[key]) === JSON.stringify(before[key]),
      `${file}: hand-authored field "${key}" was lost or changed on regenerate.`,
    );
  }
  if (before.proposedUseLocked === true) {
    check(
      JSON.stringify(after.proposedUse) === JSON.stringify(before.proposedUse),
      `${file}: proposedUse is locked but changed on regenerate.\n      before: ${JSON.stringify(before.proposedUse)}\n      after:  ${JSON.stringify(after.proposedUse)}`,
    );
  }
}

if (failures.length) {
  console.error(`\nphoto manifest: ${failures.length} FAILURE(S)\n`);
  for (const f of failures) console.error(`  x ${f}`);
  console.error("");
  process.exit(1);
}

console.log(
  `photo manifest OK: ${reviewed.length} reviewed alt strings preserved, ` +
    `${Object.keys(first.photos).length} entries, regenerate is idempotent.`,
);
