// The per-location FAQ, composed once.
//
// WHY THIS IS A DATA FILE AND NOT TEMPLATE LOGIC. SCHEMA.md requires every
// FAQPage `name` and `text` to be copied from the rendered page rather than
// written separately, and the fastest way to break that is to build the
// visible list in a template and the graph in schema.js. Both read this.
//
// Brand answers come from faq.json and are identical everywhere. Location
// answers are generated from locations.json ONLY where that room has the
// value: parking is null for Maui and languages is null for four of seven, so
// those rooms simply get fewer questions rather than an invented answer.
//
// Nothing here states an opening hour, a happy hour window, a price, or
// anything on faq.json's _blocked list.

import faq from "./faq.json" with { type: "json" };
import locations from "./locations.json" with { type: "json" };

function forLocation(loc) {
  const items = faq.brand.map((entry) => ({ q: entry.q, a: entry.a }));

  if (loc.parking) {
    items.push({
      q: `Where do I park at ${loc.name}?`,
      a: `${loc.parking}.`,
    });
  }

  if (loc.languages && loc.languages.length) {
    const list =
      loc.languages.length > 1
        ? `${loc.languages.slice(0, -1).join(", ")} and ${loc.languages[loc.languages.length - 1]}`
        : loc.languages[0];
    items.push({
      q: `What languages are spoken at ${loc.name}?`,
      a: `${list}.`,
    });
  }

  return items;
}

export default Object.fromEntries(
  locations.items.map((loc) => [loc.id, forLocation(loc)]),
);
