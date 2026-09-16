// The overflow sweep: twelve widths, measured through same-origin iframes.
//
// WHY IFRAMES AND NOT A RESIZED VIEWPORT. Resizing a headless viewport tears
// down and relays out the page between measurements, so what you measure is a
// series of separate renders and a sticky or transformed element can settle
// differently in each. An iframe is a real layout at a real width inside one
// stable parent render, twelve of them measured the same way, and because the
// harness and the page share an origin the parent can read the child document
// directly. It is also how the thing actually fails in the wild: a narrow
// column inside a page, not a whole browser squeezed.
//
// Usage: node scripts/sweep-overflow.js [--all] [--page /menu/]

import { chromium } from "playwright";
import { serve } from "./lib/serve.js";
import { builtPages, SITE } from "./lib/pages.js";

const argv = process.argv.slice(2);
const includeInternal = argv.includes("--all");
const only = argv.includes("--page") ? argv[argv.indexOf("--page") + 1] : null;

// Real device widths plus the tablet and desktop steps where our own grids
// change. 320 is the narrowest phone still in the wild and the one the brush
// type and the menu spine are most likely to break at.
const WIDTHS = [320, 360, 375, 390, 414, 430, 480, 600, 768, 834, 1024, 1280];

const HARNESS = `<!doctype html><meta charset="utf-8"><title>overflow harness</title>
<style>html,body{margin:0;padding:0;background:#222}iframe{border:0;display:block}</style>`;

// Runs in the harness. Loads one page at one width and reports what sticks out.
async function measure(url, width) {
  const frame = document.createElement("iframe");
  frame.style.width = width + "px";
  frame.style.height = "900px";
  frame.src = url;
  document.body.appendChild(frame);

  await new Promise((resolve) => {
    frame.addEventListener("load", resolve, { once: true });
  });

  const doc = frame.contentDocument;
  const win = frame.contentWindow;

  // Grow the frame to the full document height so lazy images below the fold
  // actually load and take their real space. A sweep that only ever sees the
  // first 900px would miss most of a menu page.
  const full = Math.min(doc.documentElement.scrollHeight, 20000);
  frame.style.height = full + "px";
  // Two frames, so layout and any lazy loading settle.
  await new Promise((r) => win.requestAnimationFrame(() => win.requestAnimationFrame(r)));

  const docWidth = doc.documentElement.clientWidth;
  const scrollWidth = doc.documentElement.scrollWidth;
  const overflows = scrollWidth > docWidth + 1;

  const culprits = [];
  if (overflows) {
    for (const el of doc.querySelectorAll("*")) {
      const style = win.getComputedStyle(el);
      if (style.position === "fixed" || style.display === "none") continue;
      if (style.visibility === "hidden") continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      const over = Math.round(r.right - docWidth);
      if (over <= 1) continue;
      // Only report the outermost offender in a chain. If the parent also
      // sticks out by the same amount, the child is a symptom, not the cause.
      const parent = el.parentElement;
      if (parent) {
        const pr = parent.getBoundingClientRect();
        if (Math.round(pr.right - docWidth) >= over) continue;
      }
      culprits.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute("class") || "").slice(0, 60),
        over,
        text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 50),
      });
    }
  }

  frame.remove();
  return { width, docWidth, scrollWidth, overflows, culprits: culprits.slice(0, 6) };
}

const { origin, close } = await serve(SITE, {
  virtual: { "/__overflow-harness": HARNESS },
});
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
await page.goto(origin + "/__overflow-harness");
// Installed once. The harness is never navigated again, so it survives the
// whole sweep and every page is measured inside the same parent render.
await page.addScriptTag({ content: `window.__measure = ${measure.toString()}` });

const pages = only ? [only] : builtPages({ includeInternal });
const failures = [];

for (const url of pages) {
  for (const width of WIDTHS) {
    const result = await page.evaluate(
      ([u, w]) => window.__measure(u, w),
      [url, width],
    );
    if (result.overflows) failures.push({ url, ...result });
  }
}

await browser.close();
await close();

console.log(
  `\nOverflow sweep: ${pages.length} pages x ${WIDTHS.length} widths ` +
    `(${WIDTHS.join(", ")}), through same-origin iframes.\n`,
);

if (!failures.length) {
  console.log("  Clean. No horizontal overflow at any width.\n");
  process.exit(0);
}

let lastUrl = null;
for (const f of failures) {
  if (f.url !== lastUrl) {
    console.log(`\n  ${f.url}`);
    lastUrl = f.url;
  }
  console.log(`    x ${f.width}px: scrollWidth ${f.scrollWidth} against ${f.docWidth}`);
  for (const c of f.culprits) {
    console.log(`        +${c.over}px  ${c.tag}.${c.cls}  ${c.text}`);
  }
}
console.log(`\n  ${failures.length} page/width combinations overflow.\n`);
process.exit(1);
