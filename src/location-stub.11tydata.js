// Per-room `noindex` for location-stub.njk, computed rather than a single
// blanket true in the front matter, so a room can graduate without needing
// its own template.
//
// 2026-09-17: Crown Point, Mercury and East Village drop it. Each meets the
// same standard the two hand-written pages do once the uncleared photography
// comes out (see the note in roomPhotos.js): a real differentiator section,
// a full menu from its own Toast catalog, confirmed hours, and a full FAQ.
// Plaza Bonita stays noindexed, blocked on photography nobody has shot yet.
// Maui stays noindexed, blocked on hours nobody has supplied and a
// differentiator section deliberately deferred to a client decision (see the
// `_maui` note in roomDifferences.json).
//
// A JS function here, not a Nunjucks template string in the front matter:
// eleventyComputed values written as "{{ ... }}" render to a STRING, and a
// string "false" is truthy. Real noindex logic (whatever comes back when
// layouts/base.njk's blanket preview-branch override is lifted) deserves a
// real boolean, not one that already has a bug baked into it.
//
// NOTE: this has no visible effect on preview/location-photos today.
// layouts/base.njk currently overrides every page's robots meta to
// "noindex, nofollow" unconditionally while this branch carries unverified
// location photography, regardless of what a page's own noindex says. This
// sets the per-page value correctly for when that blanket override is
// lifted, which is a separate decision tied to this branch merging or being
// dropped, not something this file changes.
const READY = new Set(["crown-point", "mercury", "east-village"]);

export default {
  eleventyComputed: {
    noindex: (data) => !READY.has(data.loc.id),
  },
};
