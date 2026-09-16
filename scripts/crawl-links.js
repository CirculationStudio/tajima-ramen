// The link crawl: every internal link and anchor, plus a text-against-
// destination check.
//
// TWO DIFFERENT FAILURES, AND THE SECOND IS THE ONE THAT BITES.
//
// A dead link is loud once somebody clicks it. A link whose TEXT no longer
// describes where it goes is silent forever: nothing 404s, nothing logs, and
// the reader just ends up somewhere they were not promised. This repo has
// already shipped exactly that. /menu/ became a room chooser, so every "see
// the menu" link on a room page started asking a reader standing in Convoy to
// pick a room, and it took commit ca0bb7f to repoint six of them.
//
// So dead targets fail the run, and text-against-destination is reported for a
// human, because "does this sentence still describe that page" is not a
// question a script gets to answer alone.
//
// Usage: node scripts/crawl-links.js [--all] [--inventory]

import { chromium } from "playwright";
import { serve } from "./lib/serve.js";
import { builtPages, SITE } from "./lib/pages.js";
import locations from "../src/_data/locations.json" with { type: "json" };

const argv = process.argv.slice(2);
const includeInternal = argv.includes("--all");
const inventory = argv.includes("--inventory");

const NUMBER_WORDS = /\b(one|two|three|four|five|six|seven|eight|\d+)\b/i;

const { origin, close } = await serve(SITE);
const browser = await chromium.launch();
const page = await browser.newPage();

const pages = builtPages({ includeInternal });
const known = new Set(pages);
const anchorsByPage = new Map();
const links = [];

// Pass one: collect every link and every id, from the rendered DOM.
for (const url of pages) {
  await page.goto(origin + url, { waitUntil: "load" });
  const found = await page.evaluate(() => ({
    ids: [...document.querySelectorAll("[id]")].map((el) => el.id),
    links: [...document.querySelectorAll("a[href]")].map((a) => ({
      href: a.getAttribute("href"),
      text: (a.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
      aria: a.getAttribute("aria-label") || "",
    })),
  }));
  anchorsByPage.set(url, new Set(found.ids));
  for (const l of found.links) links.push({ from: url, ...l });
}

await browser.close();
await close();

const dead = [];
const suspect = [];
const internalLinks = [];

const locById = new Map(locations.items.map((l) => [l.id, l]));
const locByUrl = new Map(locations.items.map((l) => [l.url, l]));
const sdCount = locations.items.filter((l) => l.id !== "maui").length;

for (const link of links) {
  const href = link.href;
  if (/^(https?:|mailto:|tel:)/i.test(href)) continue;

  // Split path and fragment. A bare "#menu" is same-page.
  const [rawPath, frag] = href.split("#");
  const target = rawPath === "" ? link.from : rawPath;
  const normalised = target.endsWith("/") || target.includes(".") ? target : target + "/";

  internalLinks.push({ ...link, target: normalised, frag });

  if (rawPath !== "" && !known.has(normalised)) {
    dead.push({ ...link, why: `no built page at ${normalised}` });
    continue;
  }
  if (frag) {
    const ids = anchorsByPage.get(normalised);
    if (ids && !ids.has(frag)) {
      dead.push({ ...link, why: `page ${normalised} has no #${frag}` });
      continue;
    }
  }

  // Text against destination.
  const text = (link.text || link.aria).toLowerCase();
  if (!text) continue;

  // A link whose text names a room, pointing at a different room's page.
  const destLoc = locByUrl.get(normalised);
  for (const loc of locations.items) {
    const name = loc.name.toLowerCase();
    if (!text.includes(name)) continue;
    if (destLoc && destLoc.id !== loc.id) {
      suspect.push({
        ...link,
        target: normalised,
        why: `text names ${loc.name} but the link goes to ${destLoc.name}`,
      });
    }
  }

  // A counting claim in the text. These go stale silently when a room is
  // added, closed or brought into scope, which has already happened once
  // (North Park) and is open again for Tijuana and Maui.
  if (NUMBER_WORDS.test(text) && /room|location|menu|bowl|dish/i.test(text)) {
    suspect.push({
      ...link,
      target: normalised,
      why: `counts something in the text (San Diego rooms today: ${sdCount}, all rooms: ${locations.items.length})`,
      soft: true,
    });
  }
}

console.log(
  `\nLink crawl: ${pages.length} pages, ${links.length} links, ` +
    `${internalLinks.length} internal.\n`,
);

if (inventory) {
  console.log("  Internal link inventory:\n");
  for (const l of internalLinks.sort((a, b) => a.from.localeCompare(b.from))) {
    console.log(`    ${l.from}  ->  ${l.target}${l.frag ? "#" + l.frag : ""}`);
    console.log(`        "${l.text || l.aria}"`);
  }
  console.log("");
}

if (suspect.length) {
  console.log("  Text against destination, for a human to read:\n");
  const hard = suspect.filter((s) => !s.soft);
  const soft = suspect.filter((s) => s.soft);
  for (const s of hard) {
    console.log(`    ! ${s.from} -> ${s.target}`);
    console.log(`        "${s.text}"  ${s.why}`);
  }
  if (soft.length) {
    console.log(`\n    ${soft.length} links make a counting claim:`);
    for (const s of soft) {
      console.log(`      ${s.from} -> ${s.target}   "${s.text}"`);
    }
  }
  console.log("");
}

if (!dead.length) {
  console.log("  No dead internal links and no dead anchors.\n");
  process.exit(0);
}

console.log("  Dead targets:\n");
for (const d of dead) {
  console.log(`    x ${d.from} -> ${d.href}`);
  console.log(`        "${d.text}"  ${d.why}`);
}
console.log(`\n  ${dead.length} dead.\n`);
process.exit(1);
