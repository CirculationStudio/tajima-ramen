// Which locations have a real, hand-written page at src/[slug].njk.
//
// The single source of truth for that question. Two files need the answer and
// they must never disagree:
//
//   src/_data/locationStubs.js  excludes these from the paginated stub
//                               template, so a full page and a stub cannot
//                               both claim the same permalink.
//   src/_data/schema.js         excludes these from `locationPages`, so a
//                               graduated location does not get a stub JSON-LD
//                               graph alongside its real one. Two graphs at
//                               the same @id is worse than none.
//
// It lives in src/_lib/ rather than src/_data/ on purpose. A file in _data
// becomes a global data key, and Eleventy reads such a module's default
// export: adding a named export to locationStubs.js made Eleventy hand the
// whole module namespace to the paginator instead of the array, which
// produced a permalink of `false` and a fatal build error. Shared constants
// that are not themselves page data belong outside _data. `.js` is not in
// templateFormats, so nothing here is treated as a template.
//
// TO GRADUATE A LOCATION: write src/[slug].njk, add its id here, add its
// pageKey graph in schema.js. The stub and its stub graph disappear on their
// own.

export const HAS_FULL_PAGE = ["convoy", "college-heights"];
