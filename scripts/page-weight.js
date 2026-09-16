// Page weight on initial load, and the largest image fetched.
//
// FOR PHASE 4. The mobile lightbox has to add a fuller view without adding
// load cost, and the approved reference gets this wrong in a specific way: it
// points the 92px thumbnail and the full screen view at the SAME full size
// JPEG, so a menu page pays for twenty-six full resolution photographs to
// show twenty-six 92px squares. "Largest image fetched on initial load" is
// the number that catches that, so it is reported separately from the total.
//
// The server sends no compression and no-store, so these are real transferred
// bytes and two runs are comparable.
//
// Usage:
//   node scripts/page-weight.js                      report
//   node scripts/page-weight.js --save before.json   record a baseline
//   node scripts/page-weight.js --against before.json  compare to it

import fs from "node:fs";
import { chromium } from "playwright";
import { serve } from "./lib/serve.js";
import { builtPages, SITE } from "./lib/pages.js";

const argv = process.argv.slice(2);
const includeInternal = argv.includes("--all");
const save = argv.includes("--save") ? argv[argv.indexOf("--save") + 1] : null;
const against = argv.includes("--against") ? argv[argv.indexOf("--against") + 1] : null;

const kb = (n) => (n / 1024).toFixed(1) + " KB";

const { origin, close } = await serve(SITE);
const browser = await chromium.launch();
const pages = builtPages({ includeInternal });
const report = {};

for (const url of pages) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const seen = [];

  page.on("response", async (res) => {
    try {
      const headers = res.headers();
      const len = Number(headers["content-length"] || 0);
      seen.push({
        url: res.url().replace(origin, ""),
        type: headers["content-type"] || "",
        bytes: len,
      });
    } catch {
      // A response that vanished before we could read it is not worth failing
      // the run over.
    }
  });

  await page.goto(origin + url, { waitUntil: "networkidle" });
  await context.close();

  const total = seen.reduce((n, r) => n + r.bytes, 0);
  const images = seen.filter((r) => r.type.startsWith("image/"));
  // Video is broken out because it dominates: one page here is 98 MB and the
  // photography is not why. Mixing them hides both numbers.
  const videos = seen.filter((r) => r.type.startsWith("video/"));
  const largest = [...images].sort((a, b) => b.bytes - a.bytes)[0] || null;

  report[url] = {
    total,
    requests: seen.length,
    imageBytes: images.reduce((n, r) => n + r.bytes, 0),
    imageCount: images.length,
    videoBytes: videos.reduce((n, r) => n + r.bytes, 0),
    largestImage: largest ? { url: largest.url, bytes: largest.bytes } : null,
    // Every image over the CLAUDE.md budget, not just the biggest one.
    overBudget: images
      .filter((r) => r.bytes > 300 * 1024)
      .map((r) => ({ url: r.url, bytes: r.bytes })),
  };
}

await browser.close();
await close();

const prior = against && fs.existsSync(against)
  ? JSON.parse(fs.readFileSync(against, "utf8"))
  : null;

console.log("\nPage weight on initial load, 390px viewport.\n");
console.log(
  "  " + "page".padEnd(32) + "total".padStart(10) + "imgs".padStart(7) +
    "image bytes".padStart(13) + "  largest image",
);
console.log("  " + "-".repeat(94));

const sorted = Object.entries(report).sort((a, b) => b[1].total - a[1].total);
for (const [url, r] of sorted) {
  let delta = "";
  if (prior && prior[url]) {
    const d = r.total - prior[url].total;
    const pct = prior[url].total ? Math.round((d / prior[url].total) * 100) : 0;
    delta = d === 0 ? "  (no change)" : `  (${d > 0 ? "+" : ""}${kb(d)}, ${pct > 0 ? "+" : ""}${pct}%)`;
  }
  console.log(
    "  " + url.padEnd(32) + kb(r.total).padStart(10) +
      String(r.imageCount).padStart(7) + kb(r.imageBytes).padStart(13) +
      "  " + (r.largestImage ? `${kb(r.largestImage.bytes)} ${r.largestImage.url.split("/").pop()}` : "none") +
      delta,
  );
}

const worst = sorted
  .map(([u, r]) => r.largestImage && { u, ...r.largestImage })
  .filter(Boolean)
  .sort((a, b) => b.bytes - a.bytes)[0];
if (worst) {
  console.log(`\n  Largest single image anywhere on initial load: ${kb(worst.bytes)}`);
  console.log(`    ${worst.url}  (on ${worst.u})`);
}

// CLAUDE.md Performance Standards: target under 300 KB per image.
const over = new Map();
for (const [page, r] of Object.entries(report)) {
  for (const img of r.overBudget) {
    if (!over.has(img.url)) over.set(img.url, { ...img, pages: [] });
    over.get(img.url).pages.push(page);
  }
}
if (over.size) {
  console.log(`\n  ${over.size} distinct images exceed the 300 KB budget in CLAUDE.md:`);
  for (const o of [...over.values()].sort((a, b) => b.bytes - a.bytes)) {
    console.log(`    ${kb(o.bytes).padStart(10)}  ${o.url}`);
    console.log(`                on ${o.pages.join(", ")}`);
  }
}

const withVideo = Object.entries(report).filter(([, r]) => r.videoBytes > 0);
if (withVideo.length) {
  console.log(`\n  Video, which is most of the weight where it appears:`);
  for (const [page, r] of withVideo.sort((a, b) => b[1].videoBytes - a[1].videoBytes)) {
    console.log(`    ${kb(r.videoBytes).padStart(12)}  ${page}`);
  }
}

if (save) {
  fs.writeFileSync(save, JSON.stringify(report, null, 2));
  console.log(`\n  Saved to ${save}\n`);
} else {
  console.log("");
}
