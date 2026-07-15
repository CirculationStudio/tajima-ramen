# Schema (Structured Data)

**Project:** Tajima Ramen
**Last updated:** 2026-07-15
**Phase:** Phase 6 - Technical SEO and Structured Data

## Purpose

This document specifies which structured data (JSON-LD schema) each page template receives. This is critical for AI answer engines and search visibility.

## Schema Validation

All schema blocks must be validated at https://validator.schema.org/ before deployment. Rich result eligibility checked at https://search.google.com/test/rich-results.

---

## The architecture (read this before writing any block)

Tajima is a **multi-location chain**, not a restaurant. That single fact governs every decision below.

The default single-`Restaurant`-on-the-home-page pattern is wrong here and actively harmful: it tells search engines and answer engines that the brand *is* one address, which in Tajima's case would collapse the entire chain into Convoy. Instead:

- **The brand is an `Organization`** with a stable `@id`. It has no street address, no hours, and no menu. It has a name, a logo, a founding date, a founder, and social profiles.
- **Each location is its own `Restaurant`** with its own stable `@id`, its own address, its own geo, its own hours, its own phone, and its own `sameAs` pointing at that location's GBP and Yelp.
- **Every location links back to the brand** via `parentOrganization`. The brand links out via `subOrganization` or, on the locations index, an `ItemList`.
- **Every entity gets a stable `@id` URI** and is referenced by `@id` afterward, never redefined. Define once, reference forever.

Entities are emitted inside a single `@graph` per page. One `<script type="application/ld+json">` per page. Not six.

### The @id namespace (locked, do not improvise)

```
https://tajimaramen.com/#organization
https://tajimaramen.com/#website
https://tajimaramen.com/locations/convoy/#restaurant
https://tajimaramen.com/locations/mercury/#restaurant
https://tajimaramen.com/locations/east-village/#restaurant
https://tajimaramen.com/locations/college-heights/#restaurant
https://tajimaramen.com/locations/crown-point/#restaurant
https://tajimaramen.com/locations/plaza-bonita/#restaurant
https://tajimaramen.com/noodle-room/#place
https://tajimaramen.com/menu/#menu
https://tajimaramen.com/#founder
```

URL slugs must match `SITE_ARCHITECTURE.md` exactly. If a slug changes there, it changes here in the same commit.

### Scope decision (needs a call)

The six San Diego locations are in scope and covered below. **Tijuana and Maui:** confirm whether they live on tajimaramen.com or on their own properties. If they are on this site they get the same `Restaurant` treatment with `addressCountry: MX` / `addressRegion: HI` and `currenciesAccepted` adjusted. If they are not, they do not appear in the graph at all. Do not half-include them.

**North Park is closed.** It does not appear in the graph in any form. No `Restaurant` entity, no historical mention. If a legacy URL exists it 301s per `_redirects` and emits no schema.

---

## Critical rules

### 1. Do not emit `aggregateRating` on your own business

The Client DNA has `aggregateRating` fields pending. **They must stay empty on the site.** Google's structured data policy treats self-serving reviews (a business marking up ratings about itself on its own site) as ineligible for rich results, and emitting them risks a manual action. Tajima's ratings live on Google and Yelp, which is where they belong and where they already display.

`aggregateRating` is legitimate only if the ratings are collected from third parties and displayed on the page in a way Tajima does not control. That is not what this site does. Leave it out.

If someone asks for stars in the search result, the honest answer is that GBP already delivers them for local queries and the schema does not add to it.

### 2. Schema must match the visible page, exactly

If the menu page does not show a dish, the menu schema does not contain it. If the FAQ page does not show a question, the FAQ schema does not contain it. This is not a style preference, it is a rich-results eligibility requirement, and mismatch is business-critical.

### 3. Schema is a citation source

The Convoy audit surfaced a citation health score of 25/100 with a suite number discrepancy across directories. **NAP in this schema must match GBP character for character**, including suite formatting. Schema, the site footer, GBP, Yelp, and Apple Business Connect all say the same thing or the schema makes the citation problem worse rather than better.

Resolve the Convoy suite number before Convoy's block ships.

### 4. No reservation actions

Tajima is walk-in only at all locations. Mercury takes group reservations by phone only. Do **not** emit `acceptsReservations: true` or a `ReserveAction` anywhere. `acceptsReservations: false` is the accurate value.

Online ordering exists, so `OrderAction` and `hasMenu` are the correct actions to expose.

---

## Schema by Page Template

### Home Page

**Types:** `Organization` + `WebSite` + `ItemList` (of locations)

The home page does not carry a `Restaurant`. It carries the brand.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://tajimaramen.com/#organization",
      "name": "Tajima Ramen",
      "legalName": "[TBD - confirm US legal entity, DNA lists Tajima Holdings, Inc. from JP filings]",
      "url": "https://tajimaramen.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://tajimaramen.com/img/tajima-logo.png",
        "width": 512,
        "height": 512
      },
      "description": "San Diego's craft Japanese ramen house. House-made noodles, house-simmered broth, six San Diego locations since 2001.",
      "foundingDate": "2001",
      "founder": { "@id": "https://tajimaramen.com/#founder" },
      "areaServed": {
        "@type": "AdministrativeArea",
        "name": "San Diego County, California"
      },
      "sameAs": [
        "https://www.instagram.com/tajimaramen/",
        "https://www.facebook.com/TajimaRamen/"
      ],
      "subOrganization": [
        { "@id": "https://tajimaramen.com/locations/convoy/#restaurant" },
        { "@id": "https://tajimaramen.com/locations/mercury/#restaurant" },
        { "@id": "https://tajimaramen.com/locations/east-village/#restaurant" },
        { "@id": "https://tajimaramen.com/locations/college-heights/#restaurant" },
        { "@id": "https://tajimaramen.com/locations/crown-point/#restaurant" },
        { "@id": "https://tajimaramen.com/locations/plaza-bonita/#restaurant" }
      ]
    },
    {
      "@type": "Person",
      "@id": "https://tajimaramen.com/#founder",
      "name": "Isamu Morikizono",
      "alternateName": "Sam Morikizono",
      "jobTitle": "Founder and Owner",
      "worksFor": { "@id": "https://tajimaramen.com/#organization" },
      "birthPlace": {
        "@type": "Place",
        "name": "Amagasaki, Hyogo, Japan"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://tajimaramen.com/#website",
      "url": "https://tajimaramen.com",
      "name": "Tajima Ramen",
      "publisher": { "@id": "https://tajimaramen.com/#organization" },
      "inLanguage": "en-US"
    }
  ]
}
```

**Note on `sameAs`:** the brand-level `sameAs` holds only brand-level profiles (Instagram, Facebook). Per-location GBP and Yelp URLs belong on the location entity, never here. LinkedIn, TikTok, and YouTube are pending confirmation; omit rather than guess.

**Note on `SearchAction`:** only add `potentialAction` / `SearchAction` to `WebSite` if on-site search actually ships (Content Engine module). Do not signpost a search endpoint that does not exist.

---

### Locations Index Page

**Types:** `CollectionPage` + `ItemList`

References each location by `@id`. Does not redefine them.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://tajimaramen.com/locations/#webpage",
      "url": "https://tajimaramen.com/locations/",
      "name": "Tajima Ramen Locations",
      "isPartOf": { "@id": "https://tajimaramen.com/#website" },
      "about": { "@id": "https://tajimaramen.com/#organization" }
    },
    {
      "@type": "ItemList",
      "@id": "https://tajimaramen.com/locations/#itemlist",
      "itemListOrder": "https://schema.org/ItemListUnordered",
      "numberOfItems": 6,
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "item": { "@id": "https://tajimaramen.com/locations/convoy/#restaurant" } },
        { "@type": "ListItem", "position": 2, "item": { "@id": "https://tajimaramen.com/locations/mercury/#restaurant" } },
        { "@type": "ListItem", "position": 3, "item": { "@id": "https://tajimaramen.com/locations/east-village/#restaurant" } },
        { "@type": "ListItem", "position": 4, "item": { "@id": "https://tajimaramen.com/locations/college-heights/#restaurant" } },
        { "@type": "ListItem", "position": 5, "item": { "@id": "https://tajimaramen.com/locations/crown-point/#restaurant" } },
        { "@type": "ListItem", "position": 6, "item": { "@id": "https://tajimaramen.com/locations/plaza-bonita/#restaurant" } }
      ]
    }
  ]
}
```

---

### Location Page Template (the important one)

**Types:** `Restaurant` + `WebPage`

This is the template that does the local SEO work. It runs six times with per-location data. Convoy shown as the worked example; the rest follow the same shape with their own values.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Restaurant",
      "@id": "https://tajimaramen.com/locations/convoy/#restaurant",
      "name": "Tajima Ramen Convoy",
      "branchCode": "convoy",
      "parentOrganization": { "@id": "https://tajimaramen.com/#organization" },
      "url": "https://tajimaramen.com/locations/convoy/",
      "description": "The original Tajima, open on Convoy Street since 2001. House-made noodles, broth simmered daily at the Crown Point commissary.",
      "image": [
        "https://cdn.circulationstudio.com/tajima/convoy-exterior-1x1.jpg",
        "https://cdn.circulationstudio.com/tajima/convoy-interior-4x3.jpg",
        "https://cdn.circulationstudio.com/tajima/convoy-bowl-16x9.jpg"
      ],
      "logo": "https://tajimaramen.com/img/tajima-logo.png",
      "servesCuisine": ["Japanese", "Ramen"],
      "priceRange": "$$",
      "currenciesAccepted": "USD",
      "paymentAccepted": "Cash, Visa, Mastercard, American Express, Discover, Apple Pay, Google Pay",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "4681 Convoy St Suite A",
        "addressLocality": "San Diego",
        "addressRegion": "CA",
        "postalCode": "92111",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "[TBD - pull from GBP]",
        "longitude": "[TBD - pull from GBP]"
      },
      "hasMap": "[TBD - GBP Google Maps URL]",
      "telephone": "[TBD - pull from GBP]",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Sunday"],
          "opens": "11:00",
          "closes": "22:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Friday", "Saturday"],
          "opens": "11:00",
          "closes": "23:00"
        }
      ],
      "acceptsReservations": false,
      "hasMenu": { "@id": "https://tajimaramen.com/menu/#menu" },
      "isAccessibleForFree": false,
      "publicAccess": true,
      "smokingAllowed": false,
      "amenityFeature": [
        { "@type": "LocationFeatureSpecification", "name": "Wheelchair accessible entrance", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Takeout", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Dine-in", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Parking lot", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Serves alcohol", "value": true }
      ],
      "knowsLanguage": ["en", "ja", "es"],
      "sameAs": [
        "[TBD - Convoy GBP URL]",
        "https://www.yelp.com/biz/tajima-ramen-convoy-san-diego"
      ],
      "potentialAction": {
        "@type": "OrderAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "[TBD - Convoy online ordering URL]",
          "inLanguage": "en-US",
          "actionPlatform": [
            "https://schema.org/DesktopWebPlatform",
            "https://schema.org/IOSPlatform",
            "https://schema.org/AndroidPlatform"
          ]
        },
        "deliveryMethod": ["https://schema.org/OnSitePickup"]
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://tajimaramen.com/locations/convoy/#webpage",
      "url": "https://tajimaramen.com/locations/convoy/",
      "name": "Tajima Ramen Convoy | Ramen on Convoy Street Since 2001",
      "isPartOf": { "@id": "https://tajimaramen.com/#website" },
      "about": { "@id": "https://tajimaramen.com/locations/convoy/#restaurant" },
      "primaryImageOfPage": "https://cdn.circulationstudio.com/tajima/convoy-exterior-1x1.jpg"
    }
  ]
}
```

#### Per-location variance (do not copy Convoy blindly)

| Location | Must differ from the Convoy template |
|---|---|
| **Convoy** | Lot parking. Full menu plus expanded izakaya. `knowsLanguage` includes `ja`. **Resolve the suite number against GBP first.** |
| **Mercury** | Only location with sushi and a full bar. `servesCuisine` adds `Sushi`. Amenities add on-site parking, full bar, TVs. `acceptsReservations` stays `false` (group reservations are phone-only, which schema has no honest way to express, so do not claim it). |
| **East Village** | Street parking, no lot. Near Petco Park. Extended hours on Padres home game nights, which means the hours block cannot be static. Either model game nights or omit them and let GBP carry it. Do not publish hours the door does not honor. |
| **College Heights** | Ramen-bar format, pared-down menu. **Needs its own `Menu` entity, not the brand menu.** 20+ taps. `knowsLanguage` drops `ja`. |
| **Crown Point** | 3782 Ingraham St, San Diego, CA 92109. Houses the commissary and the Noodle Room. Links to `#place` for the Noodle Room via `containedInPlace` inverse. |
| **Plaza Bonita** | Quick-serve, mall format, **no alcohol**. Mall hours, not restaurant hours. **Needs its own limited `Menu` entity.** `knowsLanguage` is `es`, `en`. Amenity list drops alcohol and adds food court. |

**Three menus, not one.** Convoy, Mercury, East Village, and Crown Point can share the brand `Menu`. College Heights and Plaza Bonita run different menus and must have their own `@id` menu entities. Pointing all six at one menu would publish dishes Plaza Bonita does not sell, which breaks rule 2.

---

### Menu Page

**Type:** `Menu` with `hasMenuSection`

Prices below are confirmed from the current menu file. They will drift. Menu prices in schema are a maintenance liability, so either wire them to a single source the client can update or drop `offers` entirely and keep the menu descriptive. Recommend wiring, not dropping.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Menu",
      "@id": "https://tajimaramen.com/menu/#menu",
      "name": "Tajima Ramen Menu",
      "inLanguage": "en-US",
      "hasMenuSection": [
        {
          "@type": "MenuSection",
          "name": "Ramen",
          "description": "Broth simmered daily at the Crown Point commissary. Noodles made in the Noodle Room.",
          "hasMenuItem": [
            {
              "@type": "MenuItem",
              "name": "Traditional Tonkotsu Ramen",
              "description": "Original pork bone broth, egg noodles, thin-sliced pork chashu, wood ear mushrooms, green onions, sesame seeds, red bomb.",
              "offers": { "@type": "Offer", "price": "15.50", "priceCurrency": "USD" }
            },
            {
              "@type": "MenuItem",
              "name": "Tajima Red",
              "description": "Original pork bone broth, egg noodles, pork chashu, half ramen egg, corn, baby bok choy, green onions, sesame seeds.",
              "offers": { "@type": "Offer", "price": "17.50", "priceCurrency": "USD" }
            },
            {
              "@type": "MenuItem",
              "name": "Tajima Black",
              "description": "Original pork bone broth, egg noodles, pork chashu, half ramen egg, corn, baby bok choy, green onions, sesame seeds.",
              "offers": { "@type": "Offer", "price": "17.50", "priceCurrency": "USD" }
            },
            {
              "@type": "MenuItem",
              "name": "Tajima White",
              "description": "Original pork bone broth, egg noodles, pork chashu, half ramen egg, corn, baby bok choy, green onions, sesame seeds.",
              "offers": { "@type": "Offer", "price": "17.50", "priceCurrency": "USD" }
            },
            {
              "@type": "MenuItem",
              "name": "Spicy Sesame Ramen",
              "description": "Spicy pork bone broth with sesame paste, egg noodles, seasoned ground pork, half ramen egg, corn, wood ear mushrooms, baby bok choy, fried garlic, diced onions, sesame seeds, dried chili pepper.",
              "offers": { "@type": "Offer", "price": "17.50", "priceCurrency": "USD" }
            },
            {
              "@type": "MenuItem",
              "name": "Chicken Ramen",
              "description": "Original chicken bone broth, egg noodles, chicken chashu, half ramen egg, braised takenoko, green onions, baby bok choy, sesame seeds.",
              "offers": { "@type": "Offer", "price": "17.00", "priceCurrency": "USD" }
            },
            {
              "@type": "MenuItem",
              "name": "Miso Ramen",
              "description": "Original pork bone broth with miso, egg noodles, pork chashu, half ramen egg, corn, baby bok choy, fried garlic, green onion, butter, sesame seeds.",
              "offers": { "@type": "Offer", "price": "18.50", "priceCurrency": "USD" }
            },
            {
              "@type": "MenuItem",
              "name": "Vegan Ramen",
              "description": "Creamy soy-based broth, house-made spinach noodles, marinated tofu, braised takenoko, wood ear mushrooms, baby bok choy, corn, green onions, sesame seeds.",
              "suitableForDiet": "https://schema.org/VeganDiet",
              "offers": { "@type": "Offer", "price": "17.00", "priceCurrency": "USD" }
            }
          ]
        },
        {
          "@type": "MenuSection",
          "name": "Izakaya",
          "hasMenuItem": [
            {
              "@type": "MenuItem",
              "name": "Pork Gyoza",
              "description": "Pan-fried pork dumplings with gyoza sauce.",
              "offers": { "@type": "Offer", "price": "7.50", "priceCurrency": "USD" }
            },
            {
              "@type": "MenuItem",
              "name": "Karaage",
              "description": "Seasoned deep-fried chicken with mayo.",
              "offers": { "@type": "Offer", "price": "8.50", "priceCurrency": "USD" }
            },
            {
              "@type": "MenuItem",
              "name": "Garlic Edamame",
              "description": "Steamed soy beans sauteed with garlic.",
              "offers": { "@type": "Offer", "price": "5.50", "priceCurrency": "USD" }
            }
          ]
        },
        {
          "@type": "MenuSection",
          "name": "Dessert",
          "hasMenuItem": [
            {
              "@type": "MenuItem",
              "name": "Matcha Panna Cotta",
              "description": "Creamy matcha pudding topped with mixed berries.",
              "offers": { "@type": "Offer", "price": "6.00", "priceCurrency": "USD" }
            }
          ]
        }
      ]
    }
  ]
}
```

#### Carnitas Ramen: decision needed

Carnitas Ramen ($17.50) is on the printed menu at all six SD locations and is the most-reviewed ramen in the 2025 sample. Brand positioning says it does not appear in marketing. `DESIGN_SYSTEM.md` currently says it does not appear on the site.

Schema must mirror the visible page. So this is one decision with two consequences, and it has to be made once:

- **If the menu page lists it**, the schema lists it. No photo, no callout, no hero placement, just a line in the section. This keeps the schema honest and keeps the dish where regulars can find it.
- **If the menu page omits it**, the schema omits it, and Tajima ships a website menu that does not match the menu on the table.

Recommendation: list it plainly on the menu page and in schema, keep it out of everything else. The positioning is "phase out quietly," and a website menu that contradicts the printed menu is not quiet, it is a customer service problem. **Steve to confirm with Sam.**

Same logic applies to Tajima Fries, Curry Fries, Cream Cheese Wontons, Crispy Rice Spicy Tuna, and Jalapeño Bomb.

---

### Noodle Room Page

**Types:** `AboutPage` + `Place`

The Noodle Room is not a `Restaurant`. It is not open to the public and serves no one. Marking it up as a restaurant would put a fake storefront into local results. It is a `Place` the organization owns, and the page about it is an `AboutPage`.

This is the page carrying the differentiator, so it is also the highest-value AEO surface on the site.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": "https://tajimaramen.com/noodle-room/#webpage",
      "url": "https://tajimaramen.com/noodle-room/",
      "name": "The Noodle Room",
      "isPartOf": { "@id": "https://tajimaramen.com/#website" },
      "about": { "@id": "https://tajimaramen.com/noodle-room/#place" },
      "mainEntity": { "@id": "https://tajimaramen.com/noodle-room/#place" }
    },
    {
      "@type": "Place",
      "@id": "https://tajimaramen.com/noodle-room/#place",
      "name": "The Tajima Noodle Room",
      "description": "Tajima's noodle production facility in Crown Point, San Diego. House-made ramen and spinach noodles produced on machinery imported from Japan, supplying every San Diego location.",
      "publicAccess": false,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "San Diego",
        "addressRegion": "CA",
        "postalCode": "92109",
        "addressCountry": "US"
      },
      "owner": { "@id": "https://tajimaramen.com/#organization" }
    }
  ]
}
```

**Do not put a street address or geo on this Place.** It is a working commissary, not a destination, and pinning it invites people to show up. Locality and ZIP are enough to anchor it geographically.

---

### About Page

**Types:** `AboutPage` + reference to `Organization` and `Person`

The founder entity is defined once on the home page and referenced here by `@id`. When the Sam interview lands, this page carries the quotes, and any quote used gets attributed in visible copy, not just in schema.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": "https://tajimaramen.com/about/#webpage",
      "url": "https://tajimaramen.com/about/",
      "name": "About Tajima Ramen",
      "isPartOf": { "@id": "https://tajimaramen.com/#website" },
      "about": { "@id": "https://tajimaramen.com/#organization" },
      "mainEntity": { "@id": "https://tajimaramen.com/#founder" }
    }
  ]
}
```

---

### Contact Page

**Type:** `ContactPage`

Six locations means there is no single phone number. The contact page references the `ItemList` of locations rather than inventing a head-office `ContactPoint`. Add `contactPoint` to the `Organization` only if Tajima has a real, monitored brand-level phone or email. Do not fabricate one.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      "@id": "https://tajimaramen.com/contact/#webpage",
      "url": "https://tajimaramen.com/contact/",
      "name": "Contact Tajima Ramen",
      "isPartOf": { "@id": "https://tajimaramen.com/#website" },
      "about": { "@id": "https://tajimaramen.com/#organization" }
    }
  ]
}
```

---

### Blog Posts (if Content Engine module enabled)

**Type:** `BlogPosting`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "@id": "https://tajimaramen.com/journal/[slug]/#post",
      "headline": "[Post title, under 110 characters]",
      "description": "[Meta description]",
      "author": { "@id": "https://tajimaramen.com/#founder" },
      "publisher": { "@id": "https://tajimaramen.com/#organization" },
      "datePublished": "[ISO 8601]",
      "dateModified": "[ISO 8601]",
      "image": "[Absolute URL, 1200px wide minimum]",
      "isPartOf": { "@id": "https://tajimaramen.com/#website" },
      "inLanguage": "en-US"
    }
  ]
}
```

`author` defaults to the `Organization`, not Sam, unless Sam actually wrote or was interviewed for the post. Attributing agency-written copy to Sam as `Person` is a lie with a schema tag on it.

---

### FAQ Page (if applicable)

**Type:** `FAQPage`

**CRITICAL:** FAQPage schema must match the visible FAQ on the page exactly. This is business-critical for AI answer visibility.

Note that Google restricted FAQ rich results to authoritative government and health sites in 2023, so this earns no stars in blue links. It is still worth doing, because answer engines read it and this is where the Noodle Room questions get answered in machine-readable form.

Priority questions, drawn straight from the positioning:

- Does Tajima make its own noodles?
- Where are Tajima's noodles made?
- How many Tajima locations are there in San Diego?
- Does Tajima take reservations?
- Does Tajima have vegan ramen?
- What is the Noodle Room?
- Who owns Tajima Ramen?

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      "@id": "https://tajimaramen.com/faq/#faqpage",
      "isPartOf": { "@id": "https://tajimaramen.com/#website" },
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Does Tajima make its own noodles?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Tajima makes its own ramen and spinach noodles in the Noodle Room, its own facility in Crown Point, on machinery imported from Japan. The noodles supply every San Diego location."
          }
        }
      ]
    }
  ]
}
```

Every `name` and `text` value is copied from the rendered page, never written separately. If an editor changes the page and not the schema, the page is broken.

---

## Answer Engine Module

The Noodle Room is the reason this module matters. Zero mentions of "house-made" or "handmade" noodles appear across 2,775 captured reviews, which means the answer engines currently have nothing to work with on Tajima's single biggest differentiator. This module is how that changes.

- [ ] `llms.txt` at root. Curated, not a sitemap dump. Points at: the Noodle Room page, About, Locations index, Menu, FAQ.
- [ ] Answer-shaped content on the pages themselves. The schema above only works if the visible page states the fact plainly in a sentence a model can lift.
- [ ] Citation tracking. Baseline is zero. Measure whether Tajima is named when someone asks an assistant where to get handmade ramen noodles in San Diego.

### agents.md

Tajima takes no bookings and processes no transactions on-site. Ordering is handed off to third-party platforms. So `agents.md` is thin and honest:

- [ ] Create `.well-known/agents.md`
- [ ] State what the business is and where the six locations are
- [ ] State that ordering happens on third-party platforms and link them
- [ ] State that reservations are not accepted
- [ ] Rule: agents confirm with a human before placing an order, and use live pricing from the ordering platform, never the prices in this schema

## UCP Manifest

**Not applicable at launch.** Tajima runs no first-party transactional endpoint. A UCP manifest pointing at nothing gets the business dropped from agent results, which is worse than having none. Revisit only if first-party ordering ships.

---

## Implementation

Schema is generated from data, not hand-written per page. Location data lives in one Eleventy data file (`src/_data/locations.json`) and the `Restaurant` template renders from it. Six hand-maintained JSON blocks will drift within a quarter, and drift is what breaks rule 2.

The same data file feeds the location pages, the footer, the locations index, and the schema, so NAP is structurally incapable of disagreeing with itself.

---

## Blockers

Every one of these is a `[TBD]` above and none of the location blocks ship without them. All are pulled from Tajima's own GBP, not from research.

1. **Phone numbers**, all six
2. **GPS coordinates**, all six
3. **GBP URLs**, all six
4. **Yelp URLs**, five (Convoy confirmed)
5. **Exact street addresses** for Mercury, East Village, College Heights, and Plaza Bonita. Currently approximate in the DNA
6. **The Convoy suite number.** Known discrepancy across directories. Resolve before anything ships, because schema will propagate whichever answer we pick
7. **Confirmed hours per location.** The DNA hours are marked verify
8. **Online ordering URLs** per location
9. **US legal entity name**
10. **Tijuana and Maui scope call**
11. **Carnitas decision** (see Menu Page)

## Notes

Schema is how clients get found in AI answers. It must not regress. Every schema block must be validated and tested before deployment.
