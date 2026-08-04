// Locations that do not have a full page written yet.
//
// The stub template paginates over this rather than over locations.items with
// a `pagination.before` filter, because `before` has to be a real function and
// YAML front matter cannot express one. Written as a string it is ignored
// silently, and the stub template then also generates /tajima-convoy/, which
// collides with the real page.
//
// Removing an id from this list is how a location graduates: write its full
// page at src/[slug].njk, drop it here, done.
import locations from "./locations.json" with { type: "json" };

const HAS_FULL_PAGE = ["convoy"];

export default locations.items.filter((loc) => !HAS_FULL_PAGE.includes(loc.id));
