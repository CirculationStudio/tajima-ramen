// Classes a template emits that no stylesheet defines, and the reverse.
//
// SITE_ARCHITECTURE.md Open Decision #32 asks for exactly this, and says why:
// "A template class with no matching CSS rule is now a recurring failure
// shape. Make grepping for it a standing habit." It has shipped three times.
// It is silent, because an unstyled div is still a div, so the page renders
// and just looks wrong in a way nobody can point at.
//
// Starts as a WARNING, not a failure, per that decision. Tailwind utilities
// are generated rather than authored, so they are excluded: this is about the
// hand-written BEM layer.
//
// Usage: node scripts/sweep-classes.js [--strict]

import fs from "node:fs";
import path from "node:path";

const strict = process.argv.includes("--strict");

function walk(dir, ext, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, ext, out);
    else if (entry.name.endsWith(ext)) out.push(full);
  }
  return out;
}

// Class tokens the CSS defines.
const defined = new Set();
for (const file of walk("src/css", ".css")) {
  const css = fs.readFileSync(file, "utf8");
  for (const m of css.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) defined.add(m[1]);
}

// Class tokens the templates emit. Nunjucks expressions inside a class
// attribute are skipped: `mc-band--{{ tone }}` is not a literal token and
// resolving it would mean running the build.
const used = new Map();
const DYNAMIC = /\{\{|\{%/;
for (const file of walk("src", ".njk")) {
  const njk = fs.readFileSync(file, "utf8");
  for (const m of njk.matchAll(/class\s*=\s*"([^"]*)"/g)) {
    // Strip Nunjucks expressions FIRST. Splitting on whitespace before this
    // turns `{% if x %}` into the bare tokens `if` and `x`, which then look
    // like classes with no CSS rule. That is a false positive, and a checker
    // that cries wolf is one nobody runs.
    const value = m[1].replace(/\{\{[\s\S]*?\}\}/g, " ").replace(/\{%[\s\S]*?%\}/g, " ");
    for (const token of value.split(/\s+/)) {
      if (!token || DYNAMIC.test(token)) continue;
      if (!/^[_a-zA-Z][\w-]*$/.test(token)) continue;
      // `mc-band--{{ tone }}` leaves the stem `mc-band--` once the expression
      // is stripped. A stem is not a class, it is half of one.
      if (token.endsWith("-")) continue;
      if (!used.has(token)) used.set(token, new Set());
      used.get(token).add(path.relative("src", file));
    }
  }
}

// Utility prefixes that are generated or deliberately unstyled markers.
const IGNORE = /^(u-|js-|is-|has-|sr-|tw-|grid-|flex-|text-|bg-|p[xytblr]?-|m[xytblr]?-|w-|h-|gap-)/;

const orphans = [...used.entries()]
  .filter(([token]) => !defined.has(token) && !IGNORE.test(token))
  .sort((a, b) => a[0].localeCompare(b[0]));

console.log(
  `\nClass coverage: ${used.size} literal classes in templates, ` +
    `${defined.size} defined in CSS.\n`,
);

if (!orphans.length) {
  console.log("  Every template class has a matching CSS rule.\n");
  process.exit(0);
}

console.log(`  ${orphans.length} template classes have no CSS rule:\n`);
for (const [token, files] of orphans) {
  console.log(`    ${token.padEnd(34)} ${[...files].join(", ")}`);
}
console.log(
  "\n  Warning, not a failure (Open Decision #32). A class here is either " +
    "dead\n  markup or a rule that was never written.\n",
);
process.exit(strict ? 1 : 0);
