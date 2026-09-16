// The contrast sweep: sampled off rendered pixels, both themes, transitions off.
//
// WHY PIXELS AND NOT THE DOM.
//
// DO NOT REWRITE THIS TO WALK ANCESTORS FOR background-color. That is the
// obvious implementation, it is what this started as, and it is wrong. It is
// a MODEL of what a reader sees rather than a measurement of it, and the page
// has at least four ways of painting a backdrop that such a model cannot see.
// All four were live in this repo, and each one produced a confident,
// specific, false number. A gate that cries wolf gets switched off.
//
//   1. SVG PAINT. The happy hour starburst is a red <polygon> with its words
//      stacked over it in the same grid cell. A walk for background-color
//      looks straight past the polygon and finds the gold section field two
//      levels up. Reported cream on gold at 1.54; actually cream on Fire Red
//      at 4.27, which clears AA for large text and which happy-hour.css
//      already documents, floor and all.
//
//   2. PSEUDO ELEMENT SCRIMS. The red fields carry an ::after gradient
//      between the field and the text. getComputedStyle on ELEMENTS never
//      sees it, so three runs reported cream on pure Fire Red at 4.27 while
//      rendering at 4.99, 5.39 and 5.47.
//
//   3. CLIPPED TEXT. The u-visually-hidden idiom is a 1px box with the text
//      overflowing and clipped. A Range reports the text's natural layout
//      width regardless of the clip, so all 38 visually hidden runs were
//      measured as if painted at full size. They are invisible to an eye, and
//      contrast is a question about eyes.
//
//   4. COORDINATES THAT MOVED. Even sampling pixels is not enough if the
//      pixels and the boxes come from different moments. fullPage screenshots
//      scroll the document to stitch themselves, firing every reveal observer
//      and lazy image on the way, and layout shifts under rectangles measured
//      at scroll zero. The home page's cream CTA was the proof: an element
//      whose computed background is cream, at an identical position in both
//      themes, sampled dark red in night and not in day. There is no reading
//      of that page on which the number was true.
//
// So: one screenshot per viewport, boxes read at the scroll position that
// produced it, backdrop taken as the dominant colour in a ring around the
// text with text-coloured pixels excluded. Coordinates and pixels come from a
// single render, which is the only arrangement where the answer means
// anything. SVG paint, scrims, gradients, blend modes and stacking are all
// just pixels, so none of them has to be modelled at all.
//
// A busy backdrop (no single colour holding a majority of the ring) is
// reported as unmeasurable rather than guessed at, which is the honest answer
// for text over a photograph. DESIGN_SYSTEM.md requires a scrim plus
// text-shadow there, and that is an eye check, not a computed one.
//
// Transitions and animations are disabled first, so nothing is sampled mid
// fade and two runs are comparable.
//
// Usage:
//   node scripts/sweep-contrast.js [--all] [--page /menu/] [--show-unmeasured]
//   node scripts/sweep-contrast.js --save-baseline

import fs from "node:fs";
import { chromium } from "playwright";
import { serve } from "./lib/serve.js";
import { builtPages, SITE } from "./lib/pages.js";

const argv = process.argv.slice(2);
const includeInternal = argv.includes("--all");
const only = argv.includes("--page") ? argv[argv.indexOf("--page") + 1] : null;
const saveBaseline = argv.includes("--save-baseline");
const showUnmeasured = argv.includes("--show-unmeasured");
// Every measured run with its ratio, pass or fail. For answering "what did
// changing this token do to the things that were already fine", which is a
// question about the passing runs and therefore invisible in a failure list.
const dumpTo = argv.includes("--dump") ? argv[argv.indexOf("--dump") + 1] : null;

// THE BASELINE. This sweep found failures that predate the work it was built
// to verify. Gating on zero would be red from the first commit and would stop
// being read, so it gates on no NEW failures and keeps the rest on the record.
// To clear an entry: fix the colour, then re-record with --save-baseline.
const BASELINE_PATH = new URL("./baselines/contrast.json", import.meta.url);

const FREEZE = `*,*::before,*::after{
  transition:none!important;animation:none!important;
  animation-duration:0s!important;transition-duration:0s!important;
}`;

// Collect every visible text run with its box, colour and type size.
function collectRuns() {
  function parse(css) {
    const m = css.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(",").map((n) => parseFloat(n.trim()));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }

  const runs = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.textContent.trim();
    if (!text) continue;
    const el = n.parentElement;
    if (!el) continue;
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") continue;
    if (parseFloat(s.opacity) === 0) continue;

    // The run's own box, not the element's: an inline element can wrap, and a
    // block element's box includes padding that is not where the words are.
    const range = document.createRange();
    range.selectNodeContents(n);
    const rect = range.getBoundingClientRect();
    range.detach();

    // Visually hidden text is real to a screen reader and invisible to an eye,
    // and contrast is an eye question.
    //
    // CHECKED ON THE ELEMENT, NOT THE RANGE. The u-visually-hidden idiom is a
    // 1px box with the text overflowing and clipped, and a Range reports the
    // text's natural layout width regardless, so measuring the range let every
    // one of them through as if it were painted at full size.
    if (rect.width <= 1 || rect.height <= 1) continue;
    if (rect.bottom < 0 || rect.right < 0) continue;

    let clipped = false;
    for (let a = el, hops = 0; a && hops < 3; a = a.parentElement, hops++) {
      if (a.offsetWidth <= 1 || a.offsetHeight <= 1) { clipped = true; break; }
      const cs = getComputedStyle(a);
      if (cs.clipPath && cs.clipPath.replace(/\s/g, "") === "inset(50%)") { clipped = true; break; }
    }
    if (clipped) continue;

    const fg = parse(s.color);
    if (!fg) continue;

    const size = parseFloat(s.fontSize);
    const weight = parseInt(s.fontWeight, 10) || 400;

    // A STABLE ID PER TEXT NODE. Identity was the document position, which is
    // wrong for anything sticky: the header's wordmark moves with the scroll,
    // so one element was counted once per viewport step and reported five
    // times. Tagged on first sight and reused.
    if (!el.dataset.sweepId) {
      window.__sweepSeq = (window.__sweepSeq || 0) + 1;
      el.dataset.sweepId = String(window.__sweepSeq);
    }

    runs.push({
      uid: el.dataset.sweepId + ":" + text.slice(0, 24),
      // Viewport coords for the pixel sample, document coords for identity.
      vx: rect.left,
      vy: rect.top,
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      w: rect.width,
      h: rect.height,
      fg,
      colorCss: s.color,
      size,
      weight,
      cls: (el.getAttribute("class") || "").slice(0, 50),
      text: text.slice(0, 50),
    });
  }
  return runs;
}

// Sample each run's backdrop from the screenshot, in the page, via canvas.
async function sampleBackdrops(dataUrl, runs) {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);

  const out = [];
  for (const run of runs) {
    const x = Math.max(0, Math.round(run.vx));
    const y = Math.max(0, Math.round(run.vy));
    const w = Math.min(Math.round(run.w), canvas.width - x);
    const h = Math.min(Math.round(run.h), canvas.height - y);
    if (w <= 0 || h <= 0) { out.push({ ...run, offscreen: true }); continue; }

    // SAMPLED FROM A RING AROUND THE TEXT, NOT FROM INSIDE IT.
    //
    // Inside the box, a large brush glyph is most of the pixels, and once the
    // text colour is excluded what is left is the antialiased edge, which is
    // fifty different mid tones and reads as a "busy" backdrop. The wordmark
    // and the kanji on a flat dark field were all being thrown out that way.
    // Just outside the box is the field the text sits on, whatever painted it.
    const pad = 3;
    const rx = Math.max(0, x - pad);
    const ry = Math.max(0, y - pad);
    const rw = Math.min(w + pad * 2, canvas.width - rx);
    const rh = Math.min(h + pad * 2, canvas.height - ry);
    const ring = ctx.getImageData(rx, ry, rw, rh).data;

    // Histogram, quantised to 4 levels per channel so antialiasing does not
    // shatter one background into fifty near identical bins.
    const bins = new Map();
    let total = 0;
    for (let py = 0; py < rh; py++) {
      for (let px = 0; px < rw; px++) {
        // Ring only: skip anything inside the text's own box.
        const insideX = rx + px >= x && rx + px < x + w;
        const insideY = ry + py >= y && ry + py < y + h;
        if (insideX && insideY) continue;
        const i = (py * rw + px) * 4;
        const r = ring[i] & 0xfc, g = ring[i + 1] & 0xfc, b = ring[i + 2] & 0xfc;
        // A neighbouring word in the same colour is not the backdrop. Nav
        // links and inline links sit close enough that their glyphs land in
        // the ring, and without this they read as a busy field.
        const dist =
          Math.abs(r - run.fg.r) + Math.abs(g - run.fg.g) + Math.abs(b - run.fg.b);
        if (dist < 60) continue;
        const key = (r << 16) | (g << 8) | b;
        bins.set(key, (bins.get(key) || 0) + 1);
        total += 1;
      }
    }

    if (!total) { out.push({ ...run, unmeasurable: "no ring to sample" }); continue; }

    let best = 0, bestKey = 0;
    for (const [key, count] of bins) {
      if (count > best) { best = count; bestKey = key; }
    }

    // No colour holds the box: a photograph, a gradient, busy artwork. Say so
    // rather than pick the most popular pixel and call it the background.
    const share = best / total;
    if (share < 0.6) {
      out.push({ ...run, unmeasurable: `busy backdrop, top colour only ${Math.round(share * 100)}%` });
      continue;
    }

    out.push({
      ...run,
      bg: { r: (bestKey >> 16) & 0xff, g: (bestKey >> 8) & 0xff, b: bestKey & 0xff },
      share,
    });
  }
  return out;
}

function luminance(c) {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}
function contrast(a, b) {
  const l1 = luminance(a), l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

const { origin, close } = await serve(SITE);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const pages = only ? [only] : builtPages({ includeInternal });
const failures = [];
const unmeasured = [];
const measured = [];

for (const url of pages) {
  for (const mode of ["day", "night"]) {
    await page.goto(origin + url, { waitUntil: "networkidle" });
    await page.addStyleTag({ content: FREEZE });
    await page.evaluate((m) => document.documentElement.setAttribute("data-mode", m), mode);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

    // SETTLE THE PAGE BEFORE MEASURING ANYTHING.
    //
    // page.screenshot({fullPage:true}) scrolls the document to capture it,
    // which fires every IntersectionObserver reveal and loads every lazy
    // image, and layout moves underneath rectangles that were measured at
    // scroll zero. The cream CTA on the home page was the tell: its box was
    // read at one position and sampled at another, so a cream button reported
    // a dark red backdrop. Scroll it all once, come back, then measure.
    await page.evaluate(async () => {
      const step = window.innerHeight;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => requestAnimationFrame(r));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 120));
    });
    await page.waitForLoadState("networkidle");

    // MEASURED ONE VIEWPORT AT A TIME, NOT FROM A FULL PAGE SCREENSHOT.
    //
    // fullPage screenshots scroll the document to stitch themselves together,
    // and anything that moves during that scroll leaves the rectangles out of
    // step with the pixels. The cream CTA on the home page was the proof: an
    // element whose computed background is cream, at an identical position in
    // both themes, sampled a dark red backdrop in night and not in day. There
    // is no reading of that page on which the number was true.
    //
    // So each screenshot is one viewport, and the boxes are read at the same
    // scroll position that produced it. Coordinates and pixels come from one
    // render, which is the only arrangement where the answer means anything.
    const docHeight = await page.evaluate(() => document.body.scrollHeight);
    const vh = 900;
    const seen = new Set();

    for (let top = 0; top < docHeight; top += vh) {
      await page.evaluate((y) => window.scrollTo(0, y), top);
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

      const runs = await page.evaluate(collectRuns);
      const visible = runs.filter((r) => r.vy >= 0 && r.vy + r.h <= vh);
      if (!visible.length) continue;

      const shot = await page.screenshot({ type: "png" });
      const dataUrl = "data:image/png;base64," + shot.toString("base64");

      const sampled = await page.evaluate(
        ([fn, url, rs]) => new Function("return " + fn)()(url, rs),
        [sampleBackdrops.toString(), dataUrl, visible],
      );

      for (const s of sampled) {
        const id = s.uid;
        if (seen.has(id)) continue;
        seen.add(id);

        if (s.offscreen) continue;
        if (s.unmeasurable) { unmeasured.push({ url, mode, ...s }); continue; }

        const large = s.size >= 24 || (s.size >= 18.66 && s.weight >= 700);
        const need = large ? 3 : 4.5;
        const fg = {
          r: s.fg.r * s.fg.a + s.bg.r * (1 - s.fg.a),
          g: s.fg.g * s.fg.a + s.bg.g * (1 - s.fg.a),
          b: s.fg.b * s.fg.a + s.bg.b * (1 - s.fg.a),
        };
        const got = contrast(fg, s.bg);
        if (dumpTo) {
          measured.push({
            url, mode, cls: s.cls, text: s.text, color: s.colorCss,
            backdrop: `rgb(${s.bg.r}, ${s.bg.g}, ${s.bg.b})`,
            size: s.size, weight: s.weight, need,
            got: Math.round(got * 100) / 100,
          });
        }
        if (got + 0.005 < need) {
          failures.push({
            url, mode, cls: s.cls, text: s.text,
            color: s.colorCss,
            backdrop: `rgb(${s.bg.r}, ${s.bg.g}, ${s.bg.b})`,
            size: s.size, weight: s.weight, large, need,
            got: Math.round(got * 100) / 100,
          });
        }
      }
    }
  }
}

await browser.close();
await close();

console.log(
  `\nContrast sweep: ${pages.length} pages, both themes, transitions disabled,\n` +
    "  backdrops sampled from rendered pixels.\n",
);

if (showUnmeasured) {
  const by = {};
  for (const u of unmeasured) {
    const k = `${u.unmeasurable} | .${u.cls || "(none)"}`;
    by[k] = (by[k] || 0) + 1;
  }
  console.log("  Unmeasured runs:");
  for (const [k, n] of Object.entries(by).sort((a, b) => b[1] - a[1])) {
    console.log(`    x${String(n).padStart(3)}  ${k}`);
  }
  console.log("");
}

if (unmeasured.length) {
  console.log(
    `  ${unmeasured.length} text runs sit on a backdrop no single colour holds\n` +
      "  (photography, gradients, artwork) and were not measured. DESIGN_SYSTEM.md\n" +
      "  requires a scrim plus text-shadow there, which is an eye check.\n",
  );
}

if (dumpTo) {
  fs.writeFileSync(dumpTo, JSON.stringify(measured, null, 2) + "\n");
  console.log(`  Dumped ${measured.length} measured runs to ${dumpTo}\n`);
}

const keyOf = (f) => `${f.url}|${f.mode}|${f.cls}|${f.color}|${f.backdrop}|${f.need}`;

if (saveBaseline) {
  fs.writeFileSync(
    BASELINE_PATH,
    JSON.stringify(
      {
        _note:
          "Contrast failures known at the time of recording, sampled from " +
          "rendered pixels. The sweep fails on anything NOT in here. Fix a " +
          "colour, then re-record. Do not add an entry to silence a new failure.",
        _recorded: new Date().toISOString().slice(0, 10),
        _count: failures.length,
        keys: failures.map(keyOf).sort(),
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`  Recorded ${failures.length} known failures to scripts/baselines/contrast.json\n`);
  process.exit(0);
}

const baseline = fs.existsSync(BASELINE_PATH)
  ? new Set(JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8")).keys)
  : new Set();

const fresh = failures.filter((f) => !baseline.has(keyOf(f)));
const known = failures.filter((f) => baseline.has(keyOf(f)));
const cleared = [...baseline].filter((k) => !failures.some((f) => keyOf(f) === k));

if (known.length) console.log(`  ${known.length} known failures, unchanged.`);
if (cleared.length) {
  console.log(`  ${cleared.length} baseline entries no longer fail. Re-record with --save-baseline.`);
}

if (!fresh.length) {
  console.log(failures.length ? "\n  No NEW contrast failures.\n" : "\n  Clean in both themes.\n");
  process.exit(0);
}

console.log(`\n  ${fresh.length} NEW contrast failures:\n`);
let last = null;
for (const f of fresh) {
  const head = `${f.url} [${f.mode}]`;
  if (head !== last) { console.log(`\n  ${head}`); last = head; }
  console.log(
    `    x ${f.got}:1 (needs ${f.need}) ${f.color} on ${f.backdrop}` +
      `  ${Math.round(f.size)}px/${f.weight}${f.large ? " large" : ""}`,
  );
  console.log(`      .${f.cls}  "${f.text}"`);
}
console.log("");
process.exit(1);
