// Derivatives for the sizes the pages actually display.
//
// WHY. A location page renders up to 56 dish photographs at 92px square, and
// it was serving the 1280px original for every one of them. Reading Convoy's
// menu on a phone cost 7.40 MB across 38 images, measured, for tiles the size
// of a postage stamp. The mobile lightbox makes that worse rather than better
// unless the thumbnail and the full view stop being the same file, which is
// the one thing the approved reference gets wrong too: it points its 92px
// tile and its fullscreen view at the same JPEG.
//
// Two sizes, both at 2x the largest display box:
//
//   t184   .mc-shot is 5.75rem (92px), 4.625rem (74px) on mobile
//   t640   .mchoose-sig__shot on /menu/, about 285px in a four column grid
//
// The lightbox keeps the original, which is the one place a full size file is
// the right answer.
//
// COMMITTED, NOT GENERATED AT BUILD TIME. Cloudflare has no ImageMagick and
// the repo already works this way: every photograph here is a pre-converted
// webp in git. Run this after adding a dish photograph.
//
// Usage: node scripts/build-thumbs.js [--force]

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const force = process.argv.includes("--force");
const ROOT = path.resolve("public/images/photo");
const SIZES = [
  { dir: "t184", width: 184, quality: 82 },
  { dir: "t640", width: 640, quality: 80 },
];

// Only the photographs actually placed against a dish. Generating for all 216
// manifest entries would commit derivatives of room and process frames that
// nothing renders at these sizes.
const { default: dishPhotos } = await import("../src/_data/dishPhotos.js");
const wanted = new Set();
for (const entry of Object.values(dishPhotos.byDish)) {
  if (entry.file) wanted.add(entry.file);
  if (entry.rooms) for (const room of Object.values(entry.rooms)) wanted.add(room.file);
}

let made = 0;
let kept = 0;
const missingSource = [];

for (const size of SIZES) {
  const out = path.join(ROOT, size.dir);
  fs.mkdirSync(out, { recursive: true });
  for (const file of wanted) {
    const src = path.join(ROOT, file);
    if (!fs.existsSync(src)) { missingSource.push(file); continue; }
    const dest = path.join(out, file);
    if (fs.existsSync(dest) && !force) { kept += 1; continue; }
    execFileSync("magick", [
      src, "-resize", `${size.width}x${size.width}^`,
      "-quality", String(size.quality), "-define", "webp:method=6", dest,
    ]);
    made += 1;
  }
}

const bytes = (dir) =>
  fs.readdirSync(path.join(ROOT, dir))
    .reduce((n, f) => n + fs.statSync(path.join(ROOT, dir, f)).size, 0);

console.log(`\nDish photo derivatives: ${wanted.size} placed photographs`);
for (const size of SIZES) {
  const dir = path.join(ROOT, size.dir);
  const files = fs.readdirSync(dir);
  console.log(
    `  ${size.dir}  ${String(files.length).padStart(3)} files, ` +
      `${(bytes(size.dir) / 1024).toFixed(0)} KB total, ` +
      `${(bytes(size.dir) / files.length / 1024).toFixed(1)} KB average`,
  );
}
const originals = [...wanted].reduce((n, f) => {
  const p = path.join(ROOT, f);
  return n + (fs.existsSync(p) ? fs.statSync(p).size : 0);
}, 0);
console.log(`  originals ${(originals / 1024 / 1024).toFixed(2)} MB total, ` +
  `${(originals / wanted.size / 1024).toFixed(0)} KB average`);
console.log(`\n  ${made} written, ${kept} already present.`);
if (missingSource.length) console.log(`  MISSING SOURCE: ${missingSource.join(", ")}`);
console.log("");
