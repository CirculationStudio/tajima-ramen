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
//   - `sameAs` carries Instagram only. CLIENT_FACTS.md marks Facebook
//     "(verify)" and Open Decision #7 has three conflicting candidates.
//   - No `openingHoursSpecification`, no `telephone`, no `geo`, no per-location
//     `address`. Every one of those is CONFIRM-blocked in CLIENT_FACTS.md.
//     They get added when locations.json gets real values, not before.
//
// The @id namespace follows SITE_ARCHITECTURE.md, not SCHEMA.md's example
// block: SCHEMA.md was written before the traffic data and uses
// /locations/convoy/#restaurant. The real URL is /tajima-convoy/, which earns
// 9,704 clicks at position 2.83 and does not change. SITE_ARCHITECTURE.md
// carries an explicit "SCHEMA.md correction required" note to this effect.

import site from "./site.json" with { type: "json" };
import locations from "./locations.json" with { type: "json" };
import menu from "./menu.json" with { type: "json" };

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
const MENU_SECTIONS = [
  { id: "ramen", name: "Ramen" },
  { id: "izakaya", name: "Izakaya" },
  { id: "dessert", name: "Dessert" },
];

const menuEntity = {
  "@type": "Menu",
  "@id": `${site.url}/menu/#menu`,
  name: `${site.name} menu`,
  inLanguage: "en-US",
  hasMenuSection: MENU_SECTIONS.map((section) => ({
    "@type": "MenuSection",
    name: section.name,
    hasMenuItem: menu.items
      .filter((item) => item.section === section.id)
      .map((item) => {
        const entry = {
          "@type": "MenuItem",
          name: item.name,
        };
        if (item.description) entry.description = item.description;
        if (item.dietary && item.dietary.includes("vegan")) {
          entry.suitableForDiet = "https://schema.org/VeganDiet";
        }
        return entry;
      }),
  })),
};

// Location page Restaurant entities. Built from locations.json so the page and
// the schema carry the same NAP, which is the point of the citation cleanup.
//
// acceptsReservations is false on all seven. SCHEMA.md rule 4: Tajima is
// walk-in only and Mercury's phone-only group reservations have no honest
// schema expression, so false is the accurate value.
//
// No openingHoursSpecification and no geo: still CONFIRM-blocked.
function restaurant(id) {
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
    hasMenu: { "@id": `${site.url}/menu/#menu` },
    address: {
      "@type": "PostalAddress",
      streetAddress: loc.address.street,
      addressLocality: loc.address.locality,
      addressRegion: loc.address.region,
      postalCode: loc.address.postalCode,
      addressCountry: "US",
    },
  };
  if (loc.phone) entity.telephone = loc.phone;
  if (loc.sameAs && loc.sameAs.length) entity.sameAs = loc.sameAs;
  return entity;
}

export default {
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
      restaurant("convoy"),
    ],
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
