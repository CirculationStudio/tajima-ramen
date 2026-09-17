// The structural sweep: one h1, heading order, alt on every image, and no
// draft or placeholder string reaching a rendered page.
//
// MEASURED OFF THE REAL RENDER, not off the template source. A heading that a
// template emits inside an {% if %} that never fires is not a heading on the
// page, and a class the CSS never styles can still produce a visible box. The
// only honest way to ask "what does this page contain" is to load it.
//
// Usage: node scripts/sweep-structure.js [--all] [--page /menu/]

import { chromium } from "playwright";
import { serve } from "./lib/serve.js";
import { builtPages, SITE } from "./lib/pages.js";

const argv = process.argv.slice(2);
const includeInternal = argv.includes("--all");
const only = argv.includes("--page") ? argv[argv.indexOf("--page") + 1] : null;

// Strings that mean "this was not finished" and must never reach a visitor.
// Kept narrow on purpose: a broad word list would fire on real menu copy.
const PLACEHOLDER = [
  /\[DRAFT/i,
  /\[TO BE CONFIRMED\]/i,
  /\[[^\]]*\bpending\b[^\]]*\]/i,
  /\bLorem ipsum\b/i,
  /\bTBD\b/,
  /\bcoming soon\b/i,
  /\bstill to come\b/i,
];

// REGISTERED HELD SLOTS: content that is deliberately incomplete and is
// supposed to ship anyway.
//
// Same idea as the placeholder registration in _data/roomPhotos.js, which
// refuses a stand-in photograph unless somebody wrote down where it came from
// and why. A held slot nobody registered is an oversight; a held slot with a
// reason attached is a decision. These are checked directly against every
// page's rendered text and reported on every run so they stay visible, and
// they do not fail the sweep.
//
// NOT PART OF THE PLACEHOLDER SCAN BELOW. These two used to ship as literal
// bracketed dev notation, "[Quote pending interview]", which the PLACEHOLDER
// pattern for a bracketed "pending" string caught, and this table only
// explained the catch. The mobile audit's punch list called the brackets
// themselves the defect: a visitor reads dev notation, not copy. Both pages
// now hold the same statement in their own voice, with no brackets to catch,
// so they are looked for on their own rather than as an exception to a rule
// they no longer trip.
//
// To retire one, delete the entry and the thing it describes together.
const REGISTERED = [
  {
    url: "/about/",
    match: /Quote pending an interview\./i,
    why:
      "Sam has not been interviewed. voice-tone.md: no quote is written for " +
      "him and the marker is a launch blocker on purpose. Clears with " +
      "CLIENT_FACTS.md open question #1. src/about.njk pending block.",
  },
  {
    url: "/noodle-room/",
    match: /Quote pending an interview\./i,
    why:
      "The second held quote, and the one easy to miss: this page attributes " +
      "it to Sam by name in its figcaption, so it is the same blocker as " +
      "/about/ and clears with the same interview. src/noodle-room.njk:478.",
  },
];

function registeredFor(url, text) {
  return REGISTERED.find((r) => r.url === url && r.match.test(text));
}

function audit() {
  // Runs inside the page.
  const problems = [];

  const h1s = [...document.querySelectorAll("h1")];
  if (h1s.length !== 1) {
    problems.push({
      kind: "h1-count",
      detail: `${h1s.length} h1 elements (expected exactly 1)`,
      text: h1s.map((h) => h.textContent.trim().slice(0, 60)).join(" | "),
    });
  }

  // Heading order. A jump from h2 to h4 breaks the outline for anyone
  // navigating by headings. Visually hidden headings count: they are real.
  const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")];
  let prev = 0;
  for (const h of headings) {
    const level = Number(h.tagName[1]);
    if (prev && level > prev + 1) {
      problems.push({
        kind: "heading-skip",
        detail: `h${prev} is followed by h${level}`,
        text: h.textContent.trim().slice(0, 80),
      });
    }
    prev = level;
  }

  // Alt on every image. An empty alt is correct for decoration, so the test is
  // that the attribute is PRESENT, plus a check that a decorative image is not
  // carrying meaning it should have described.
  for (const img of document.querySelectorAll("img")) {
    if (!img.hasAttribute("alt")) {
      problems.push({
        kind: "alt-missing",
        detail: "img has no alt attribute at all",
        text: img.getAttribute("src") || "(no src)",
      });
    }
    if (!img.getAttribute("width") || !img.getAttribute("height")) {
      problems.push({
        kind: "img-dimensions",
        detail: "img has no explicit width/height (layout shift)",
        text: img.getAttribute("src") || "(no src)",
      });
    }
  }

  return {
    problems,
    // Returned for the placeholder scan, which runs in node so the patterns
    // live in one place.
    text: document.body ? document.body.innerText : "",
    alts: [...document.querySelectorAll("img[alt]")].map((i) => ({
      alt: i.getAttribute("alt"),
      src: i.getAttribute("src"),
    })),
    counts: {
      headings: headings.length,
      images: document.querySelectorAll("img").length,
    },
  };
}

const { origin, close } = await serve(SITE);
const browser = await chromium.launch();
const page = await browser.newPage();

const pages = only ? [only] : builtPages({ includeInternal });
const failures = [];
const registered = [];
let checked = 0;
let images = 0;

for (const url of pages) {
  const res = await page.goto(origin + url, { waitUntil: "load" });
  if (!res || res.status() !== 200) {
    failures.push({ url, kind: "load", detail: `status ${res && res.status()}`, text: "" });
    continue;
  }
  const result = await page.evaluate(audit);
  checked += 1;
  images += result.counts.images;

  for (const p of result.problems) failures.push({ url, ...p });

  // Held slots first, checked directly against the page rather than as a
  // side effect of a PLACEHOLDER match. Nothing here carries dev-notation
  // brackets any more, so nothing here would otherwise trip PLACEHOLDER at
  // all, and an unmatched entry (the statement was reworded, or the launch
  // blocker cleared and the block should be gone) is worth knowing about the
  // same way a matched one is.
  for (const r of REGISTERED) {
    if (r.url !== url) continue;
    const hit = result.text.match(r.match);
    if (hit) {
      registered.push({ url, text: hit[0], why: r.why });
    } else {
      failures.push({
        url,
        kind: "held-slot-missing",
        detail: "a registered held slot did not match the rendered page",
        text: r.match.toString(),
      });
    }
  }

  for (const rx of PLACEHOLDER) {
    const hit = result.text.match(rx);
    if (hit) {
      const known = registeredFor(url, hit[0]);
      if (known) {
        registered.push({ url, text: hit[0], why: known.why });
      } else {
        const at = result.text.indexOf(hit[0]);
        failures.push({
          url,
          kind: "placeholder-text",
          detail: `visible text matches ${rx}`,
          text: result.text.slice(Math.max(0, at - 40), at + 80).replace(/\s+/g, " "),
        });
      }
    }
    for (const a of result.alts) {
      if (rx.test(a.alt)) {
        failures.push({
          url,
          kind: "placeholder-alt",
          detail: `alt matches ${rx}`,
          text: `${a.src}: ${a.alt.slice(0, 80)}`,
        });
      }
    }
  }
}

await browser.close();
await close();

if (registered.length) {
  console.log("  Registered held slots (deliberate, not failures):");
  for (const r of registered) {
    console.log(`    - ${r.url}  ${r.text}`);
    console.log(`      ${r.why}`);
  }
  console.log("");
}

const byKind = {};
for (const f of failures) byKind[f.kind] = (byKind[f.kind] || 0) + 1;

console.log(`\nStructural sweep: ${checked} pages, ${images} images.\n`);

if (!failures.length) {
  console.log("  Clean. One h1 per page, no heading skips, alt and dimensions on every image,");
  console.log("  no draft or placeholder string on a rendered page.\n");
  process.exit(0);
}

let lastUrl = null;
for (const f of failures) {
  if (f.url !== lastUrl) {
    console.log(`\n  ${f.url}`);
    lastUrl = f.url;
  }
  console.log(`    x ${f.kind}: ${f.detail}`);
  if (f.text) console.log(`      ${f.text}`);
}
console.log(`\n  ${failures.length} problems:`, byKind, "\n");
process.exit(1);
