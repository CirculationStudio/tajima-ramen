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
  "placeholder",
  "placeholderSource",
  "placeholderNote",
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
// Left order-SENSITIVE on purpose, unlike check 5. Two runs of the same script
// on the same input have no reason to emit keys in a different order, so a
// difference here really is the generator being unstable.

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

// --- 4. the placeholder registration is complete and survives -------------
//
// The build guard in src/_data/roomPhotos.js throws on any entry marked
// `placeholder: true` unless TAJIMA_ALLOW_PLACEHOLDERS=1 is set. That guard is
// only as good as the marking, so two things are checked here.
//
// First, that a regenerate cannot silently unmark one. The generator preserves
// the three placeholder fields because they are in HAND_FIELDS above, and this
// asserts it rather than trusting it: an unmarked placeholder is a stock image
// that ships, which is the exact failure the guard exists to prevent.
//
// Second, that a registration is complete. A placeholder with no source and no
// replacement note cannot be retired by anyone who did not add it.
const placeholders = Object.entries(committed.photos).filter(([, p]) => p.placeholder === true);
for (const [file, before] of placeholders) {
  const after = first.photos[file];
  check(after !== undefined, `${file}: marked as a placeholder, but the file vanished from a regenerate.`);
  if (!after) continue;
  check(
    after.placeholder === true,
    `${file}: was marked "placeholder": true and a regenerate DROPPED the mark. ` +
      `That turns a registered stand-in into a stock image nobody is watching.`,
  );
  check(
    typeof before.placeholderSource === "string" && before.placeholderSource.trim() !== "",
    `${file}: is marked as a placeholder with no placeholderSource. Record where the image came from.`,
  );
  check(
    typeof before.placeholderNote === "string" && before.placeholderNote.trim() !== "",
    `${file}: is marked as a placeholder with no placeholderNote. Record which real photograph replaces it.`,
  );
}
// The inverse: fields present without the mark. This reads as handled and is
// not, and roomPhotos.js fails the build on it even under the preview flag.
for (const [file, p] of Object.entries(committed.photos)) {
  if (p.placeholder === true) continue;
  check(
    p.placeholderSource === undefined && p.placeholderNote === undefined,
    `${file}: carries placeholder fields but is not marked "placeholder": true.`,
  );
}

// --- 5. the committed manifest is not stale --------------------------------
//
// Added 2026-09-09, because it was. The committed file said 159 mapped against
// a regenerate's 164, and was missing every locationStatus flag the script had
// learned to emit since it was last run. Nothing was wrong with the data; it
// was simply older than the generator, and no check compared the two.
//
// A stale manifest is not cosmetic. roomPhotos.js reads the COMMITTED file, so
// a photograph that exists on disk and in git but not in the manifest throws
// the "not in photos.json" error at build time, and a hand-authored field
// added to the script after the last run is silently absent from every entry.
// Now that npm run build runs this first, drift fails the build instead.
// KEY ORDER IS NOT DRIFT, and this check learned that the hard way on the run
// that installed it. photos.json is hand-edited for alt text, and adding a
// field by hand puts it wherever the editor put it, while the generator emits
// hand-authored fields in HAND_FIELDS order. A plain JSON.stringify compare
// called that a stale manifest and sent someone to regenerate a file whose
// content was already correct. Compare by sorted keys so the check fires on
// what changed and not on where it sits.
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((k) => [k, stable(value[k])]),
    );
  }
  return value;
}

check(
  JSON.stringify(stable(committed.photos)) === JSON.stringify(stable(first.photos)),
  "The committed src/_data/photos.json is STALE: it does not match a fresh regenerate.\n" +
    "      Run: node scripts/build-photo-manifest.js\n" +
    "      Then review the diff. A regenerate preserves alt text and every hand-authored\n" +
    "      field, so the diff should only ever be derived values.",
);

if (failures.length) {
  console.error(`\nphoto manifest: ${failures.length} FAILURE(S)\n`);
  for (const f of failures) console.error(`  x ${f}`);
  console.error("");
  process.exit(1);
}

console.log(
  `photo manifest OK: ${reviewed.length} reviewed alt strings preserved, ` +
    `${Object.keys(first.photos).length} entries, regenerate is idempotent, ` +
    `committed manifest is current, ${placeholders.length} placeholder(s) registered.`,
);
