// Locations that do not have a full page written yet.
//
// The stub template paginates over this rather than over locations.items with
// a `pagination.before` filter, because `before` has to be a real function and
// YAML front matter cannot express one. Written as a string it is ignored
// silently, and the stub template then also generates /tajima-convoy/, which
// collides with the real page.
//
// The list of graduated locations lives in src/_lib/fullPageLocations.js, not
// here, because schema.js needs the same answer and two hand-maintained lists
// would drift. It is NOT re-exported from this file: a _data module's named
// exports change what Eleventy hands the paginator, which breaks the build.
// See the note in that file.
import locations from "./locations.json" with { type: "json" };
import { HAS_FULL_PAGE } from "../_lib/fullPageLocations.js";

export default locations.items.filter((loc) => !HAS_FULL_PAGE.includes(loc.id));
