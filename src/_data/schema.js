// JSON-LD graphs, built from the same data that renders the visible page.
//
// SCHEMA.md rule 2 is a rich-results eligibility requirement, not a style
// preference: the schema must match the visible page exactly. Generating both
// from site.json / locations.json / menu.json is how that stays true.
//
// Notes on deliberate omissions, all sourced:
//   - No `aggregateRating` anywhere. SCHEMA.md rule 1: self-serving review
//     markup is ineligible for rich results and risks a manual action.
//   - No `acceptsReservations: true`, no ReserveAction. SCHEMA.md rule 4.
//   - No `legalName`. SITE_ARCHITECTURE.md Open Decision #10 has the US
//     operating entity unresolved (the footer and the DNA disagree).
//   - The ORGANIZATION's `sameAs` carries Instagram only. CLIENT_FACTS.md
//     marks Facebook "(verify)" and Open Decision #7 has three conflicting
//     candidates. The per-room Restaurant nodes are a separate list and now
//     carry each room's own GBP profile link.
//   - The Organization node carries no `openingHoursSpecification`,
//     `telephone`, `geo` or `address`, and that is by design and not a block:
//     Tajima is six addresses and none of them is the brand's address.
//     SITE_ARCHITECTURE.md is explicit that there is no single brand NAP.
//
//     CORRECTED 2026-09-09. This list used to say those four fields were
//     CONFIRM-blocked in CLIENT_FACTS.md, which conflated two different
//     things and went stale twice over. The per-location values are no longer
//     blocked at all: hours landed 2026-09-09 from Connor, and geo and the
//     GBP profile links landed the same day from his Google Business Profile
//     export. All three are emitted on the Restaurant nodes below.
//
// The @id namespace follows SITE_ARCHITECTURE.md, not SCHEMA.md's example
// block: SCHEMA.md was written before the traffic data and uses
// /locations/convoy/#restaurant. The real URL is /tajima-convoy/, which earns
// 9,704 clicks at position 2.83 and does not change. SITE_ARCHITECTURE.md
// carries an explicit "SCHEMA.md correction required" note to this effect.

import site from "./site.json" with { type: "json" };
import locations from "./locations.json" with { type: "json" };
import menu from "./menu.json" with { type: "json" };
import roomMenus from "./roomMenus.js";
import coreMenu from "./coreMenu.js";
import menuConcepts from "./menuConcepts.json" with { type: "json" };
import { HAS_FULL_PAGE } from "../_lib/fullPageLocations.js";
import locationFaq from "./locationFaq.js";

const ORG_ID = `${site.url}/#organization`;
const WEBSITE_ID = `${site.url}/#website`;
const FOUNDER_ID = `${site.url}/#founder`;

const organization = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: site.name,
  url: site.url,
  logo: {
    "@type": "ImageObject",
    url: site.logo.src,
  },
  description:
    "San Diego's craft Japanese ramen house. House-made noodles, house-simmered broth, six San Diego locations since 2001.",
  foundingDate: site.founded,
  founder: { "@id": FOUNDER_ID },
  areaServed: {
    "@type": "AdministrativeArea",
    name: "San Diego County, California",
  },
  sameAs: [site.social.instagram],
  subOrganization: locations.items.map((loc) => ({ "@id": loc.schemaId })),
};

const founder = {
  "@type": "Person",
  "@id": FOUNDER_ID,
  name: "Isamu Morikizono",
  alternateName: "Sam Morikizono",
  jobTitle: "Founder and Owner",
  worksFor: { "@id": ORG_ID },
  birthPlace: {
    "@type": "Place",
    name: "Amagasaki, Hyogo, Japan",
  },
};

const website = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: site.url,
  name: site.name,
  publisher: { "@id": ORG_ID },
  inLanguage: "en-US",
  // No SearchAction: SCHEMA.md says do not signpost a search endpoint that
  // does not exist, and on-site search is not in the v1 scope.
};

// Mirrors the visible location router, in the same order, all seven rows.
const locationList = {
  "@type": "ItemList",
  "@id": `${site.url}/#locations`,
  name: `${site.name} locations`,
  numberOfItems: locations.items.length,
  itemListElement: locations.items.map((loc, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: `${site.name} ${loc.name}`,
    url: `${site.url}${loc.url}`,
    item: { "@id": loc.schemaId },
  })),
};

// BreadcrumbList on every page except `/`, per SITE_ARCHITECTURE.md.
function breadcrumb(trail) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: site.name, url: "/" }, ...trail].map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${site.url}${crumb.url}`,
    })),
  };
}

// The Noodle Room is a Place, not a Restaurant, and it is not open to the
// public. The brief is explicit about why there is no street address and no
// geo on it: "It is a working commissary, not a destination, and pinning it
// invites people to show up." Locality and ZIP only.
const noodleRoomPlace = {
  "@type": "Place",
  "@id": `${site.url}/noodle-room/#place`,
  name: "The Tajima Noodle Room",
  description:
    "Tajima's own noodle room and broth commissary in Crown Point, San Diego. Two noodle types in production, made on a machine imported from Japan.",
  publicAccess: false,
  address: {
    "@type": "PostalAddress",
    addressLocality: "San Diego",
    addressRegion: "CA",
    postalCode: "92109",
    addressCountry: "US",
  },
  isPartOf: { "@id": ORG_ID },
};

// Menu, with one MenuSection per section that actually renders. Built from the
// same menu.json the page reads, so the two cannot disagree (SCHEMA.md rule 2).
//
// No `offers`: CLIENT_FACTS.md says prices drift and are CONFIRM before schema
// offers ship. Prices appear as `price` on the MenuItem, matching the visible
// page, which is the honest floor.
// The sections, in the order the page renders them, READ FROM DATA rather than
// hardcoded here. Three ids were listed in this file until 2026-09-15, which
// was right while menu.json held three sections and silently wrong the moment
// Connor's dish sheet brought it to eight: the College Heights graph carried 18
// items against 24 on the page, and Mercury's would have carried 19 against 43.
// A graph that omits half a menu is a rule-2 break as surely as one that adds
// to it. One source now: menuConcepts.sectionOrder, the same list the template
// loops.
const MENU_SECTIONS = menuConcepts.sectionOrder.map((id) => ({
  id,
  name: menuConcepts.sectionLabels[id],
}));

// Builds a Menu entity over a subset of menu.items. `locationId` null means
// the brand menu on /menu/; a location id filters to what that room actually
// sells, using menu.json's `locations` column (derived 2026-08-04 from the
// seven live Toast catalogs, not assumed).
//
// `listedOnly` mirrors a location page's visible menu section, which renders
// `dish.listed and locationId in dish.locations`. IT MUST STAY PAIRED WITH
// THAT TEMPLATE CONDITION. /menu/ renders every dish, featured or not, so it
// passes false.
//
// This is not a cosmetic filter, and what it filters OUT changed on 2026-09-15.
// It used to drop Carnitas and Miso from a room's graph because the visible
// page did not show them. The page shows Carnitas now: `listed` and
// `featurable` are separate fields, Open Decision #4 is "listed plainly", and
// the room's page is the room's menu. So the graph carries it too, because the
// graph mirrors the page. What still drops out is a dish the room does not
// serve, which is what `locations` is for.
//
// The history is worth keeping: Carnitas shipped into this JSON-LD on the first
// build of the College Heights page, when the visible page did not list it, and
// was caught by a banned-word scan of the built HTML rather than by reading the
// template. The lesson was not "keep Carnitas out of schema", it was "keep
// schema and the page saying the same thing".
//
// MenuItem @ids always point at /menu/#item-<id>, on every menu, because the
// dish is one entity no matter how many rooms serve it. Only the Menu that
// contains it is per-location.
//
// THAT FRAGMENT STOPPED RESOLVING TO A VISIBLE ITEM ON 2026-09-15 for all but
// eight dishes, because /menu/ became a chooser. It is kept anyway and the
// reason is worth stating: an @id is an identifier, not a link. Its job is to
// let the seven rooms' Menus refer to one Carnitas Ramen rather than seven, and
// it does that whether or not the fragment scrolls anywhere. Changing it would
// break every existing reference to buy nothing.
//
// If that ever stops being acceptable, the move is to give each dish a real URL
// the way /menu/vegan-ramen/ has one, not to renumber the @ids.
// A ROOM'S MENU IS BUILT FROM THE SAME ROWS THE PAGE RENDERS, 2026-09-16.
//
// SCHEMA.md rule 2 is the business-critical one: "If the menu page does not
// show a dish, the menu schema does not contain it." Location pages render
// their room's Toast catalog through _data/roomMenus.js now, so reading
// menu.json here would have published a different menu from the one on the
// page, on all seven rooms at once, silently. Same module, same rows, same
// order, so the two cannot drift.
//
// The rows it does not recognise are still in the graph. An unmatched Toast
// row has a name and usually a description and no dish id, so it gets a
// MenuItem with no @id: it is a real dish the room really serves, and leaving
// it out to keep the identifiers tidy would break rule 2 in the other
// direction.
function buildRoomMenu({ id, name, locationId }) {
  const room = roomMenus.byRoom[locationId];
  if (!room) return null;
  return {
    "@type": "Menu",
    "@id": id,
    name,
    inLanguage: "en-US",
    hasMenuSection: room.sections.map((section) => ({
      "@type": "MenuSection",
      name: section.label,
      hasMenuItem: section.items.map((row) => {
        const entry = { "@type": "MenuItem" };
        // Only a joined row gets the shared identifier. An unmatched row is a
        // dish we can name and not one we can point at.
        if (row.dishId) entry["@id"] = `${site.url}/menu/#item-${row.dishId}`;
        entry.name = row.name;
        if (row.description) entry.description = row.description;
        if ((row.dietary || []).includes("vegan")) {
          entry.suitableForDiet = "https://schema.org/VeganDiet";
        }
        return entry;
      }),
    })).filter((section) => section.hasMenuItem.length > 0),
  };
}

function buildMenu({ id, name, locationId = null, listedOnly = false }) {
  const items = menu.items.filter(
    (item) =>
      (!locationId || (item.locations || []).includes(locationId)) &&
      // `listed`, NOT `featurable`. SCHEMA.md rule 2: the graph mirrors the
      // visible page, and a location page renders everything the room serves.
      (!listedOnly || item.listed),
  );

  return {
    "@type": "Menu",
    "@id": id,
    name,
    inLanguage: "en-US",
    hasMenuSection: MENU_SECTIONS.map((section) => ({
      "@type": "MenuSection",
      name: section.name,
      hasMenuItem: items
        .filter((item) => item.section === section.id)
        .map((item) => {
          const entry = {
            "@type": "MenuItem",
            "@id": `${site.url}/menu/#item-${item.id}`,
            name: item.name,
          };
          if (item.description) entry.description = item.description;
          if (item.dietary && item.dietary.includes("vegan")) {
            entry.suitableForDiet = "https://schema.org/VeganDiet";
          }
          return entry;
        }),
    })).filter((section) => section.hasMenuItem.length > 0),
  };
}

// THE BRAND MENU IS THE EIGHT DISHES ON EVERY SAN DIEGO MENU, and no longer all
// 73. /menu/ became a room chooser on 2026-09-15 and now shows exactly those
// eight; SCHEMA.md rule 2 says the graph mirrors the visible page, so this
// mirrors those eight.
//
// The alternative was to drop the entity entirely. It is kept because the eight
// are a real, checkable claim about the house: these are the dishes you can
// order at any San Diego Tajima, which is worth being able to state and is the
// only menu fact that is true without naming a room. Each room's own 13 to 47
// live on that room's Menu entity.
//
// COMPUTED, NOT LISTED. The same filter the page uses. If the sheet changes,
// the page and the graph move together or neither does.
const SD_ROOM_IDS = locations.items
  .filter((loc) => loc.region === "san-diego")
  .map((loc) => loc.id);

// THE BRAND MENU IS WHAT /menu/ VISIBLY SHOWS, which is the core set.
//
// It was the eight dishes served at all six San Diego rooms, which was right
// while the page showed those eight. The page shows the core set now, twenty
// dishes at five or six of the six, and SCHEMA.md rule 2 is the one that
// matters: the graph mirrors the visible page. Same module the page renders
// from, so the two move together or neither does.
//
// A dish at five of six carries its availability note on the page. There is no
// schema property for "everywhere except one branch", and inventing one would
// be worse than leaving it to the Restaurant entities, each of which carries
// its own room's Menu with the honest list.
const menuEntity = {
  ...buildMenu({ id: `${site.url}/menu/#menu`, name: `${site.name} menu` }),
  hasMenuSection: undefined,
};
{
  const bySection = new Map();
  for (const dish of coreMenu.core) {
    if (!bySection.has(dish.sectionLabel)) bySection.set(dish.sectionLabel, []);
    bySection.get(dish.sectionLabel).push(dish);
  }
  menuEntity.hasMenuSection = [...bySection.entries()].map(([label, dishes]) => ({
    "@type": "MenuSection",
    name: label,
    hasMenuItem: dishes.map((dish) => {
      const entry = { "@type": "MenuItem" };
      if (dish.dishId) entry["@id"] = `${site.url}/menu/#item-${dish.dishId}`;
      entry.name = dish.name;
      if (dish.description) entry.description = dish.description;
      if ((dish.dietary || []).includes("vegan")) {
        entry.suitableForDiet = "https://schema.org/VeganDiet";
      }
      return entry;
    }),
  })).filter((section) => section.hasMenuItem.length > 0);
}

// Location page Restaurant entities. Built from locations.json so the page and
// the schema carry the same NAP, which is the point of the citation cleanup.
//
// acceptsReservations is false on all seven. SCHEMA.md rule 4: Tajima is
// walk-in only and Mercury's phone-only group reservations have no honest
// schema expression, so false is the accurate value.
//
// openingHoursSpecification is emitted for the six locations that have hours,
// confirmed 2026-09-09 by Connor. Maui was not supplied and stays null, so it
// emits none at all rather than a guess: a wrong opening hour in schema is the
// failure CLIENT_FACTS.md warns about, someone driving to a closed door.
// Emitted from locations.json only, never from a default or a sibling's
// pattern, so the page and the graph cannot drift.
//
// geo is emitted for the six San Diego rooms, unblocked 2026-09-09 by
// Connor's Google Business Profile export. Maui was not in the export and
// stays null, so it emits no GeoCoordinates node rather than a placeholder.
// Coordinates are passed through from locations.json exactly as supplied, not
// rounded: schema.org takes decimal degrees and precision is the whole point
// of the field for a map pack.
//
// sameAs now carries each room's GBP profile link ahead of any Yelp entry.
// Those links are maps.app.goo.gl share URLs rather than canonical place
// URLs; see _geoNote in locations.json for why they were not resolved here.
//
// `menuId` points the room at its own Menu entity where one exists. A stub
// still points at the brand menu, which is the honest floor while its page
// has no menu section to mirror. A full page that renders its own filtered
// menu must carry its own Menu @id, or the schema would claim the room serves
// dishes its visible page does not list (SCHEMA.md rule 2).
// FAQPage for a location, built from the same composed list the visible block
// renders. SCHEMA.md: every name and text is copied from the rendered page,
// never written separately, which is only guaranteed if there is one source.
// A room with no questions emits no node rather than an empty one.
function locationFaqNode(loc) {
  const items = locationFaq[loc.id];
  if (!items || !items.length) return null;
  return {
    "@type": "FAQPage",
    "@id": `${site.url}${loc.url}#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

// EVERY ROOM POINTS AT ITS OWN MENU AS OF 2026-09-15, so the default argument
// is gone and callers must say which. It used to default to the brand menu at
// /menu/#menu, which was defensible while that page listed every dish and
// stopped being so on two counts at once: the rooms do not share a menu (8 of
// 73 dishes are served at all six, and Mercury carries 47 against Crown Point's
// 21), and /menu/ no longer lists dishes at all. A Restaurant pointing hasMenu
// at a page that shows a room chooser is a claim with nothing behind it.
//
// College Heights had its own from the start, for exactly this reason, recorded
// in its brief as "pointing it at /menu/#menu would advertise dishes it does
// not sell". That was true of all seven; it was only written down for one.
function restaurant(id, menuId) {
  if (!menuId) {
    throw new Error(
      `schema: restaurant("${id}") was called with no menuId. Every room points ` +
        `at its own Menu entity; there is no brand-wide menu to fall back on.`,
    );
  }
  const loc = locations.items.find((item) => item.id === id);
  const entity = {
    "@type": "Restaurant",
    "@id": loc.schemaId,
    name: loc.businessName,
    url: `${site.url}${loc.url}`,
    parentOrganization: { "@id": ORG_ID },
    servesCuisine: ["Japanese", "Ramen"],
    priceRange: "$$",
    acceptsReservations: false,
    hasMenu: { "@id": menuId },
    address: {
      "@type": "PostalAddress",
      streetAddress: loc.address.street,
      addressLocality: loc.address.locality,
      addressRegion: loc.address.region,
      postalCode: loc.address.postalCode,
      addressCountry: "US",
    },
  };
  // areaServed per room, not the Organization's county-wide value. A location
  // page's catchment is its own city, and for the San Diego rooms the
  // neighborhood is what the query actually says ("ramen kearny mesa").
  entity.areaServed = [
    { "@type": "City", name: loc.address.locality },
    ...(loc.neighborhood && loc.neighborhood !== loc.address.locality
      ? [{ "@type": "Place", name: loc.neighborhood }]
      : []),
  ];
  if (loc.phone) entity.telephone = loc.phone;
  if (loc.sameAs && loc.sameAs.length) entity.sameAs = loc.sameAs;
  if (loc.geo && typeof loc.geo.latitude === "number" && typeof loc.geo.longitude === "number") {
    entity.geo = {
      "@type": "GeoCoordinates",
      latitude: loc.geo.latitude,
      longitude: loc.geo.longitude,
    };
  }
  if (loc.hours && loc.hours.length) {
    entity.openingHoursSpecification = loc.hours.map((rule) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: rule.days,
      opens: rule.opens,
      closes: rule.closes,
    }));
  }
  return entity;
}

// Per-location graphs, keyed by location id. Used by the stub template, which
// paginates and so cannot select a graph by a static pageKey. The Restaurant
// entity is the same shape the full location pages use, so replacing a stub
// with a real page does not change its structured data.
//
// The exclusion list is imported from locationStubs.js, not written again
// here. A location that graduates to a full page must drop out of BOTH, and
// two hand-maintained lists would eventually disagree, leaving a room with
// two competing JSON-LD graphs at the same @id.
const locationPages = Object.fromEntries(
  locations.items
    .filter((loc) => !HAS_FULL_PAGE.includes(loc.id))
    .map((loc) => [
      loc.id,
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": `${site.url}${loc.url}#webpage`,
            url: `${site.url}${loc.url}`,
            name: loc.businessName,
            isPartOf: { "@id": WEBSITE_ID },
            about: { "@id": loc.schemaId },
            breadcrumb: breadcrumb([
              { name: "Locations", url: "/locations/" },
              { name: loc.name, url: loc.url },
            ]),
          },
          restaurant(loc.id, `${site.url}${loc.url}#menu`),
          buildRoomMenu({
            id: `${site.url}${loc.url}#menu`,
            name: `${loc.businessName} menu`,
            locationId: loc.id,
          }),
          locationFaqNode(loc),
        ].filter(Boolean),
      },
    ]),
);

// Simple WebPage graphs. Per the briefs: /happy-hour/ gets no Menu entity
// (happy hour is a subset of the location menus already covered), and
// /order-online/ gets no OrderAction here (that belongs on each Restaurant).
function webPage(slug, name, crumbName) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${site.url}${slug}#webpage`,
        url: `${site.url}${slug}`,
        name,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORG_ID },
        breadcrumb: breadcrumb([{ name: crumbName, url: slug }]),
      },
    ],
  };
}

  // Brief: "WebPage + MenuItem referenced by @id from /menu/#menu. Do not
  // redefine the item." So this page points at the MenuItem the menu page
  // already defines rather than declaring a second copy of the same dish.
export default {
  veganRamen: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${site.url}/menu/vegan-ramen/#webpage`,
        url: `${site.url}/menu/vegan-ramen/`,
        name: "Vegan Ramen in San Diego",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORG_ID },
        mainEntity: { "@id": `${site.url}/menu/#item-vegan` },
        breadcrumb: breadcrumb([
          { name: "Menu", url: "/menu/" },
          { name: "Vegan Ramen", url: "/menu/vegan-ramen/" },
        ]),
      },
    ],
  },

  about: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${site.url}/about/#webpage`,
        url: `${site.url}/about/`,
        name: `About ${site.name}`,
        isPartOf: { "@id": WEBSITE_ID },
        // References the Person by @id. Does not redefine it: the home page
        // graph owns #founder.
        mainEntity: { "@id": FOUNDER_ID },
        about: { "@id": ORG_ID },
        breadcrumb: breadcrumb([{ name: "About", url: "/about/" }]),
      },
    ],
  },

  happyHour: webPage("/happy-hour/", "Tajima Happy Hour", "Happy Hour"),
  orderOnline: webPage("/order-online/", "Order Tajima Ramen Online", "Order Online"),
  locationPages,
  convoy: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${site.url}/tajima-convoy/#webpage`,
        url: `${site.url}/tajima-convoy/`,
        name: "Tajima Ramen Convoy",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": `${site.url}/tajima-convoy/#restaurant` },
        breadcrumb: breadcrumb([
          { name: "Locations", url: "/locations/" },
          { name: "Convoy", url: "/tajima-convoy/" },
        ]),
      },
      restaurant("convoy", `${site.url}/tajima-convoy/#menu`),
      buildRoomMenu({
        id: `${site.url}/tajima-convoy/#menu`,
        name: "Tajima Ramen Convoy menu",
        locationId: "convoy",
      }),
      locationFaqNode(locations.items.find((l) => l.id === "convoy")),
    ].filter(Boolean),
  },

  // /tajima-college-heights/. The brief requires its own Menu entity rather
  // than a pointer at /menu/#menu, "because pointing it at /menu/#menu would
  // advertise dishes it does not sell."
  //
  // Worth knowing that today the filtered set is identical to the brand menu:
  // all thirteen modelled dishes are on the live College Heights catalog. The
  // difference is real but sits in dishes menu.json does not model yet, such
  // as Convoy's Curry Ramen. The mechanism is what matters, not today's
  // output: when menu.json grows to model those, this entity drops them here
  // automatically and the page and its schema stay in agreement.
  collegeHeights: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${site.url}/tajima-college-heights/#webpage`,
        url: `${site.url}/tajima-college-heights/`,
        name: "Tajima Ramen College Heights",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": `${site.url}/tajima-college-heights/#restaurant` },
        breadcrumb: breadcrumb([
          { name: "Locations", url: "/locations/" },
          { name: "College Heights", url: "/tajima-college-heights/" },
        ]),
      },
      restaurant("college-heights", `${site.url}/tajima-college-heights/#menu`),
      locationFaqNode(locations.items.find((l) => l.id === "college-heights")),
      buildRoomMenu({
        id: `${site.url}/tajima-college-heights/#menu`,
        name: "Tajima Ramen College Heights menu",
        locationId: "college-heights",
      }),
    ].filter(Boolean),
  },
  locations: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${site.url}/locations/#webpage`,
        url: `${site.url}/locations/`,
        name: `${site.name} locations`,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORG_ID },
        breadcrumb: breadcrumb([{ name: "Locations", url: "/locations/" }]),
      },
      // References each Restaurant by @id. Does not redefine them: the
      // location pages own those entities.
      locationList,
    ],
  },

  menu: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${site.url}/menu/#webpage`,
        url: `${site.url}/menu/`,
        name: `${site.name} menu`,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORG_ID },
        breadcrumb: breadcrumb([{ name: "Menu", url: "/menu/" }]),
      },
      menuEntity,
    ],
  },

  home: {
    "@context": "https://schema.org",
    "@graph": [organization, founder, website, locationList],
  },

  noodleRoom: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${site.url}/noodle-room/#webpage`,
        url: `${site.url}/noodle-room/`,
        name: "The Noodle Room",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": `${site.url}/noodle-room/#place` },
        breadcrumb: breadcrumb([{ name: "The Noodle Room", url: "/noodle-room/" }]),
      },
      noodleRoomPlace,
    ],
  },
};
