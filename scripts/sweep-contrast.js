// The contrast sweep: measured off real renders, both themes, transitions off.
//
// WHY OFF THE RENDER AND NOT OFF THE TOKENS. The tokens are correct and the
// page can still fail, because what a reader sees is the colour that actually
// landed after the cascade, any alpha composited against whatever is behind
// it, and the theme in force at the time. DESIGN_SYSTEM.md already records two
// traps that only show up this way: accent red is a DIFFERENT hex per theme
// because true #E03C31 on white is 4.32 and fails, and gold is two values
// because #FFC658 on cream is about 1.4. Reading the stylesheet would have
// said both were fine.
//
// Transitions and animations are disabled first, so a value is never sampled
// mid-fade. A colour caught halfway through a transition is not a colour
// anybody sees, and it makes the run non-deterministic.
//
// Usage: node scripts/sweep-contrast.js [--all] [--page /menu/]

import fs from "node:fs";
import { chromium } from "playwright";
import { serve } from "./lib/serve.js";
import { builtPages, SITE } from "./lib/pages.js";

const argv = process.argv.slice(2);
const includeInternal = argv.includes("--all");
const only = argv.includes("--page") ? argv[argv.indexOf("--page") + 1] : null;
const saveBaseline = argv.includes("--save-baseline");

// THE BASELINE, AND WHY THERE IS ONE.
//
// This sweep found 44 failing text runs the first time it was ever run, none
// of them introduced by the work it was built to verify. Gating on zero would
// mean the gate is red from the first commit, and a gate that is always red
// stops being read. Gating on "no NEW failures" keeps it useful today and
// keeps the 44 on the record instead of in a comment.
//
// Same shape as test-photo-manifest.js, which compares against the committed
// manifest rather than asserting a clean slate.
//
// To clear an entry: fix the colour, then re-record with --save-baseline.
const BASELINE_PATH = new URL("./baselines/contrast.json", import.meta.url);

const FREEZE = `*,*::before,*::after{
  transition:none!important;animation:none!important;
  animation-duration:0s!important;transition-duration:0s!important;
}`;

function audit() {
  function parse(css) {
    const m = css.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(",").map((n) => parseFloat(n.trim()));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function over(fg, bg) {
    const a = fg.a;
    return {
      r: fg.r * a + bg.r * (1 - a),
      g: fg.g * a + bg.g * (1 - a),
      b: fg.b * a + bg.b * (1 - a),
      a: 1,
    };
  }
  function lum(c) {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function ratio(a, b) {
    const l1 = lum(a);
    const l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }

  // Does an SVG sit under this text, painting the surface it reads against?
  //
  // A CSS walk cannot see this. The happy hour starburst is the live case: a
  // red <polygon> with the words stacked over it in the same grid cell, so
  // the colour behind the type is SVG paint and the nearest CSS background is
  // the section field two levels up. Reported as cream on gold at 1.54, which
  // was never true: it is cream on Fire Red at 4.27, and the CSS says so.
  // Unmeasurable here, same as text over a photograph.
  function svgUnder(el, rect) {
    // CONTAINMENT, not intersection. An arrow or a dietary mark sitting beside
    // a word shares its line box and intersects it, and it is not behind
    // anything. Artwork a reader actually reads against encloses the text, so
    // the test is that the SVG's box contains the text's box and is bigger
    // than it. Three hops, because a backdrop further away than that is
    // separated by the elements between.
    const pad = 2;
    let node = el;
    for (let hops = 0; node && hops < 3; hops++, node = node.parentElement) {
      for (const svg of node.querySelectorAll(":scope > svg")) {
        if (svg.contains(el)) continue;
        const r = svg.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) continue;
        const contains =
          r.left <= rect.left + pad && r.right >= rect.right - pad &&
          r.top <= rect.top + pad && r.bottom >= rect.bottom - pad;
        if (contains && r.width * r.height > rect.width * rect.height) return true;
      }
    }
    return false;
  }

  // The colour actually behind this text: walk up until something opaque,
  // compositing any translucent layers on the way. If an ancestor paints an
  // image or gradient, we stop and say so rather than guess.
  function backdrop(el) {
    const layers = [];
    let node = el;
    while (node && node !== document.documentElement.parentNode) {
      const s = getComputedStyle(node);
      if (s.backgroundImage && s.backgroundImage !== "none") {
        return { image: true, css: s.backgroundImage.slice(0, 40) };
      }
      const c = parse(s.backgroundColor);
      if (c && c.a > 0) {
        layers.push(c);
        if (c.a === 1) {
          let acc = layers.pop();
          while (layers.length) acc = over(layers.pop(), acc);
          return { color: acc };
        }
      }
      node = node.parentElement;
    }
    return { color: { r: 255, g: 255, b: 255, a: 1 } };
  }

  const results = [];
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.textContent.trim();
    if (!text) continue;
    const el = n.parentElement;
    if (!el) continue;
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden" || parseFloat(s.opacity) === 0) continue;
    // Visually hidden text is real to a screen reader and invisible to an eye.
    // Contrast is an eye question, so it is out of scope here.
    const r = el.getBoundingClientRect();
    // The bound is <= 1, not < 1: the u-visually-hidden idiom clips to
    // exactly 1px, so `< 1` let all 38 of them through to be measured.
    if (r.width <= 1 || r.height <= 1) continue;

    const size = parseFloat(s.fontSize);
    const weight = parseInt(s.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;

    const fg = parse(s.color);
    if (!fg) continue;

    if (svgUnder(el, r)) {
      results.push({
        overImage: true, text: text.slice(0, 50), color: s.color,
        backdrop: "SVG artwork", size, weight,
        cls: (el.getAttribute("class") || "").slice(0, 50),
      });
      continue;
    }

    const back = backdrop(el);

    const key = `${s.color}|${back.image ? "img" : JSON.stringify(back.color)}|${size}|${weight}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (back.image) {
      results.push({
        overImage: true, text: text.slice(0, 50), color: s.color,
        backdrop: back.css, size, weight,
        cls: (el.getAttribute("class") || "").slice(0, 50),
      });
      continue;
    }

    const got = ratio(over(fg, back.color), back.color);
    if (got + 0.005 < need) {
      results.push({
        text: text.slice(0, 50), color: s.color,
        backdrop: `rgb(${Math.round(back.color.r)}, ${Math.round(back.color.g)}, ${Math.round(back.color.b)})`,
        size, weight, large, need, got: Math.round(got * 100) / 100,
        cls: (el.getAttribute("class") || "").slice(0, 50),
      });
    }
  }
  return results;
}

const { origin, close } = await serve(SITE);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.addStyleTag; // noop, kept for clarity

const pages = only ? [only] : builtPages({ includeInternal });
const failures = [];
const overImage = [];

for (const url of pages) {
  for (const mode of ["day", "night"]) {
    await page.goto(origin + url, { waitUntil: "load" });
    await page.addStyleTag({ content: FREEZE });
    await page.evaluate((m) => {
      document.documentElement.setAttribute("data-mode", m);
    }, mode);
    // One frame so the attribute change is painted before anything is sampled.
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const found = await page.evaluate(audit);
    for (const f of found) {
      if (f.overImage) overImage.push({ url, mode, ...f });
      else failures.push({ url, mode, ...f });
    }
  }
}

await browser.close();
await close();

console.log(`\nContrast sweep: ${pages.length} pages, both themes, transitions disabled.\n`);

if (process.argv.includes("--show-unmeasured")) {
  const by = {};
  for (const o of overImage) {
    const k = `${o.backdrop} | .${o.cls || "(none)"}`;
    by[k] = (by[k] || 0) + 1;
  }
  console.log("  Unmeasured runs by backdrop and class:");
  for (const [k, n] of Object.entries(by).sort((a, b) => b[1] - a[1])) {
    console.log(`    x${String(n).padStart(2)}  ${k}`);
  }
  console.log("");
}

if (overImage.length) {
  console.log(`  ${overImage.length} text runs sit on an image or gradient and were not`);
  console.log("  measured. DESIGN_SYSTEM.md requires a scrim plus text-shadow there;");
  console.log("  that is an eye check, not a computed one.\n");
}

// A failure is identified by where and what, not by the sentence it landed
// on, so rewording a line does not look like a new defect.
const keyOf = (f) => `${f.url}|${f.mode}|${f.cls}|${f.color}|${f.backdrop}|${f.need}`;

if (saveBaseline) {
  const record = {
    _note:
      "Contrast failures known at the time of recording. The sweep fails on " +
      "anything NOT in here. Fix a colour, then re-record. Do not add an " +
      "entry to silence a new failure.",
    _recorded: new Date().toISOString().slice(0, 10),
    _count: failures.length,
    keys: failures.map(keyOf).sort(),
  };
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(record, null, 2) + "\n");
  console.log(`  Recorded ${failures.length} known failures to scripts/baselines/contrast.json\n`);
  process.exit(0);
}

const baseline = fs.existsSync(BASELINE_PATH)
  ? new Set(JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8")).keys)
  : new Set();

const fresh = failures.filter((f) => !baseline.has(keyOf(f)));
const knownHit = failures.filter((f) => baseline.has(keyOf(f)));
const fixed = [...baseline].filter((k) => !failures.some((f) => keyOf(f) === k));

if (knownHit.length) {
  console.log(`  ${knownHit.length} known failures, unchanged. Recorded in scripts/baselines/contrast.json.`);
}
if (fixed.length) {
  console.log(`  ${fixed.length} baseline entries no longer fail. Re-record with --save-baseline.`);
}

if (!fresh.length) {
  console.log(
    failures.length
      ? "\n  No NEW contrast failures.\n"
      : "\n  Clean. Every measured text run meets WCAG AA in both themes.\n",
  );
  process.exit(0);
}

console.log(`\n  ${fresh.length} NEW contrast failures:\n`);
let last = null;
for (const f of fresh) {
  const head = `${f.url} [${f.mode}]`;
  if (head !== last) {
    console.log(`\n  ${head}`);
    last = head;
  }
  console.log(
    `    x ${f.got}:1 (needs ${f.need}) ${f.color} on ${f.backdrop}` +
      `  ${Math.round(f.size)}px/${f.weight}${f.large ? " large" : ""}`,
  );
  console.log(`      .${f.cls}  "${f.text}"`);
}
console.log("");
process.exit(1);
