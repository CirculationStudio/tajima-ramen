// Every built page, as a URL path, discovered from _site rather than listed.
//
// Listed by hand it would go stale the first time a template is added, and the
// stub template paginates, so the page set is not knowable from src/ alone.

import fs from "node:fs";
import path from "node:path";

export const SITE = path.resolve("_site");

// Review artifacts. They are noindex and exist to be looked at by us, so they
// are swept only when asked for explicitly with --all.
const INTERNAL = /^\/(internal|nav-preview)/;

export function builtPages({ includeInternal = false } = {}) {
  const out = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.name.endsWith(".html")) continue;
      let url = "/" + path.relative(SITE, full).split(path.sep).join("/");
      url = url.replace(/\/index\.html$/, "/").replace(/^\/$/, "/");
      if (url === "/index.html") url = "/";
      out.push(url);
    }
  }

  if (!fs.existsSync(SITE)) {
    throw new Error(
      "_site does not exist. Run `npm run build` before a sweep: the sweeps " +
        "measure the built output, not the templates.",
    );
  }
  walk(SITE);
  return out
    .filter((url) => includeInternal || !INTERNAL.test(url))
    .sort();
}

export function isInternal(url) {
  return INTERNAL.test(url);
}
