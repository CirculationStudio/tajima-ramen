// Eleventy v3 configuration for Tajima Ramen.
// Stack: Eleventy v3 (ESM) + Vite (via @11ty/eleventy-plugin-vite) + Tailwind v4.
// See ARCHITECTURE.md for the technical map and DEPLOYMENT.md for Cloudflare config.
//
// Tailwind v4 runs INSIDE Vite via @tailwindcss/vite (no separate CLI step).
// The Eleventy Vite plugin runs Vite with a throwaway temp folder as its root,
// so any /src/... asset reference in the HTML has to be resolved back to the
// real source tree. The resolve.alias below maps "/src" to this project's real
// src/ dir, letting Vite (and the Tailwind plugin) read the true source:
//   - templates load /src/js/main.js (a module entry)
//   - main.js does `import "/src/css/app.css"` (Tailwind's source stylesheet)
// Vite bundles both into hashed, cacheable assets and rewrites the references.
// This mirrors the working sibling project (circulation-studio), same approach.

import path from "node:path";
import { fileURLToPath } from "node:url";
import EleventyVitePlugin from "@11ty/eleventy-plugin-vite";
import tailwindcss from "@tailwindcss/vite";
import photos from "./src/_data/photos.json" with { type: "json" };
import menuData from "./src/_data/menu.json" with { type: "json" };
import menuConcepts from "./src/_data/menuConcepts.json" with { type: "json" };
import locationsData from "./src/_data/locations.json" with { type: "json" };

/**
 * THE SPINE TONES HAVE TO SURVIVE CONTACT WITH EVERY ROOM'S ACTUAL MENU.
 *
 * The reference gives the menu module four tones and there are eight sections,
 * so four sections reuse one. Reuse is fine. Two TOUCHING bands wearing the
 * same tone is not, because then the spine stops separating anything and a
 * reader sees one long block where there are two sections.
 *
 * Which bands touch depends on data, not on the tone table: a room renders only
 * the sections it has dishes in, so Mercury's seven bands and Plaza Bonita's
 * three produce different adjacencies from the same assignment. That is exactly
 * the kind of thing that is correct when written and quietly wrong six weeks
 * later when a room drops a section.
 *
 * So it is checked here, at module load, against every room's real sequence,
 * and it throws. Same mechanism as the photo manifest's draft-alt guard: a
 * build that would ship the fault does not complete.
 */
function assertNoAdjacentToneClash() {
  const order = menuConcepts.sectionOrder || [];
  const tones = menuConcepts.barTones || {};
  const problems = [];

  for (const loc of locationsData.items) {
    const bands = order.filter((section) =>
      menuData.items.some(
        (item) =>
          item.section === section &&
          (item.locations || []).includes(loc.id),
      ),
    );
    for (let i = 0; i < bands.length - 1; i += 1) {
      const a = bands[i];
      const b = bands[i + 1];
      if (tones[a] && tones[a] === tones[b]) {
        problems.push(`${loc.id}: "${a}" and "${b}" both render ${tones[a]}`);
      }
    }
    const missing = bands.filter((section) => !tones[section]);
    if (missing.length) {
      problems.push(`${loc.id}: no tone assigned for ${missing.join(", ")}`);
    }
  }

  if (problems.length) {
    throw new Error(
      "menuConcepts.barTones: touching bands share a tone, so the spine stops " +
        "separating them. Reassign in src/_data/menuConcepts.json.\n  " +
        problems.join("\n  "),
    );
  }
}
assertNoAdjacentToneClash();

// Static, served-verbatim files (Cloudflare _headers/_redirects,
// site.webmanifest, fonts, favicons) live in the project-root public/ dir.
// Vite copies publicDir into the output root AFTER the build, so they survive
// the plugin's emptyOutDir. Absolute because Vite's root is the temp folder.
const publicDir = fileURLToPath(new URL("./public", import.meta.url));

export default function (eleventyConfig) {
  // Split a string into characters. The monolith wordmark animates per letter,
  // so the markup needs one span per character without hardcoding the name.
  eleventyConfig.addFilter("chars", (value) => String(value).split(""));

  // Filter a list of objects by an exact property value.
  //
  // Nunjucks' own `selectattr(key, "equalto", value)` does NOT do this: the
  // `equalto` test is not resolved, so it silently degrades to a truthiness
  // check on the attribute and returns every item whose key is set. That is a
  // quiet wrong-output bug (every menu section rendered every dish), not an
  // error, so it has to be avoided rather than worked around.
  eleventyConfig.addFilter("where", (items, key, value) =>
    (items || []).filter((item) => item && item[key] === value),
  );

  // Fail the build on an empty or missing collection.
  //
  // Nunjucks iterating an undefined key is a no-op: `{% for x in nav.typo %}`
  // renders nothing, the build succeeds, and the page ships with an empty
  // <nav>. That happened here, renaming nav.primaryProposed to nav.primary
  // without updating the header, and every one of the fifteen pages built
  // green with no navigation at all.
  //
  // Wrapping the loop source in this filter turns that into a build failure
  // with the key name in the message. Cheap, and it covers the whole class:
  // any renamed, moved, or misspelled data key now stops the build.
  eleventyConfig.addFilter("nonEmpty", (value, label) => {
    if (!Array.isArray(value) || value.length === 0) {
      throw new Error(
        `nonEmpty(): \`${label}\` is empty or missing. A template is iterating a data key that does not resolve, which would ship an empty element. Check the key name against its data file.`,
      );
    }
    return value;
  });

  // Google Maps universal link for a location, built from locations.json.
  //
  // Defined once here rather than inline in the four places a location card
  // appears (mega menu, /locations/, the Convoy page, the stub template), so
  // the query string cannot drift between them and there is one place to
  // change if the format ever does.
  //
  // The business name is included ahead of the street address on purpose: a
  // bare address resolves to a point on a map, while name-plus-address
  // resolves to the business listing, which is what someone tapping
  // "Directions" actually wants. Both fields come from locations.json.
  //
  // Universal link format works on iOS, Android, and desktop, handing off to
  // the native Maps app where one exists and falling back to the browser where
  // it does not. No app-specific scheme, no platform sniffing.
  /**
   * Day range for an hours rule, for display only. Schema gets the raw
   * dayOfWeek array; this is what a human reads in the NAP strip.
   *
   *   all seven          -> "Every day"
   *   one day            -> "Sun"
   *   a contiguous run   -> "Sun to Thu"
   *   anything else      -> "Mon, Wed and Fri"
   *
   * Contiguity is tested in Sunday-first order, which is how a US opening
   * hours table reads. Nothing here invents a day: it only formats the array
   * locations.json already holds.
   */
  /**
   * tel: href for a location's phone.
   *
   * Replaces a replace().replace().replace() chain that was duplicated
   * verbatim in three templates and is the kind of thing that rots in one
   * copy and not the others. The current site already ships the failure this
   * guards against: Plaza Bonita's tel: href renders as "tel:+1%20" while the
   * number displays fine.
   *
   * Strips every non-digit and prefixes +1. Returns null for a missing or
   * unusable number so the template can omit the link rather than render a
   * dead one. US numbers only, which is every location we have.
   */
  eleventyConfig.addFilter("telHref", (phone) => {
    if (!phone) return null;
    const digits = String(phone).replace(/\D/g, "");
    if (digits.length !== 10) return null;
    return `tel:+1${digits}`;
  });

  /**
   * "22:00" to "10pm", "11:30" to "11:30am".
   *
   * WHY THIS EXISTS. locations.json stores hours in ISO 24-hour because that
   * is what openingHoursSpecification requires, and schema keeps reading the
   * raw field. Nothing visible does. This is an American restaurant site and
   * "22:00" reads as a transit timetable, so every surface that prints a
   * closing time for a person prints it the way a person says it.
   *
   * The same rule is implemented a second time in src/js/hours.js, for the
   * live status line, which cannot import from here. The two must agree: if
   * you change the shape of the output, change both, or the status line and
   * the row above it will disagree by two characters and look broken.
   *
   * Whole hours drop the minutes ("10pm", not "10:00pm"). Noon is "12pm" and
   * midnight is "12am". Anything unparseable comes back untouched rather than
   * mangled, so a bad data value shows itself instead of silently becoming
   * "12am".
   */
  eleventyConfig.addFilter("clockTime", (value) => {
    const match = /^(\d{1,2}):([0-5]\d)$/.exec(String(value ?? "").trim());
    if (!match) return value;
    const h = Number(match[1]);
    const m = Number(match[2]);
    if (h > 24) return value;
    const suffix = h % 24 < 12 ? "am" : "pm";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return m === 0 ? `${h12}${suffix}` : `${h12}:${match[2]}${suffix}`;
  });

  eleventyConfig.addFilter("dayRange", (days) => {
    if (!Array.isArray(days) || !days.length) return "";
    const ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const short = (d) => d.slice(0, 3);
    const idx = days.map((d) => ORDER.indexOf(d)).sort((a, b) => a - b);
    if (idx.length === 7) return "Every day";
    if (idx.length === 1) return short(ORDER[idx[0]]);
    const contiguous = idx.every((n, i) => i === 0 || n === idx[i - 1] + 1);
    if (contiguous) return `${short(ORDER[idx[0]])} to ${short(ORDER[idx[idx.length - 1]])}`;
    const names = idx.map((n) => short(ORDER[n]));
    return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  });

  /**
   * The featured dishes one location serves from one menu section.
   *
   * components/location-menu.njk needs to know whether a section has any rows
   * BEFORE it prints that section's heading, and Nunjucks has no way to build
   * a filtered list inside a template without a mutation hack that reads
   * worse than a filter and behaves worse than one. So the filter does it.
   *
   * `locations` on a dish is derived from the seven live Toast catalogs, not
   * assumed (menu.json `_availabilityStatus`), which is why this returns seven
   * rows for Plaza Bonita and eleven for Convoy.
   */
  eleventyConfig.addFilter("dishesFor", (items, locId, section) => {
    if (!Array.isArray(items) || !locId || !section) return [];
    return items.filter(
      (d) =>
        // `listed`, NOT `featurable`. This feeds a room's own menu, so the
        // question is "does this room serve it", not "may it have a hero".
        // It read `d.feature` until 2026-09-15, which was the same question
        // while a location page showed a curated bento and became the wrong
        // one the moment that page became the full menu: it hid Carnitas and
        // the five do-not-feature dishes from rooms that serve them. See
        // menu.json `_listedVsFeaturable`.
        d.listed &&
        d.section === section &&
        Array.isArray(d.locations) &&
        d.locations.includes(locId)
    );
  });

  /**
   * Merge in every sprite icon the menu module will ask for.
   *
   * icon-sprite.njk emits only the symbols a page lists in `spriteIcons`, which
   * is the right default: a page ships the marks it uses and no more. The trap
   * is that the module's marks are chosen in menuConcepts.json and the list was
   * hardcoded in five templates, so adding the rice section on 2026-09-15 put
   * `<use href="#i-onigiri">` on five location pages and two review routes that
   * had no onigiri symbol. A `<use>` pointing at a missing symbol renders
   * nothing at all and throws no error, which is the worst way for this to
   * fail.
   *
   * So the module's needs are derived from the same data that chooses them.
   * Add a section to menuConcepts and its mark ships wherever the module does.
   */
  /**
   * The drink kinds a room's Toast catalog names, as a readable line.
   *
   * NO COUNTS. CLIENT_FACTS.md is explicit that tap counts are not
   * publishable numbers: College Heights is written "twenty-plus" and never
   * 21, and Convoy's number never goes on the site at all. The catalogs are a
   * 2026-08-04 snapshot of a rotating tap list, so a roster would be wrong
   * within weeks even if the counts were allowed. The page names the KIND of
   * programme a room runs and links to Toast for what is actually pouring.
   */
  /**
   * Which dietary marks the legend lists that NO row on this page carries.
   *
   * COMPUTED, because the hardcoded version was wrong. menuConcepts.json held
   * `missingFlags: ["spicy","vegetarian","raw or undercooked"]` and the
   * footnote printed it under the legend. Five sushi rows carry
   * dietary:["raw"] and that mark renders directly above the sentence saying
   * no dish shows it. A note about the data that the data contradicts is
   * worse than no note.
   */
  eleventyConfig.addFilter("unusedFlags", (bands, legend) => {
    const seen = new Set();
    for (const band of bands || []) {
      for (const row of band.items || []) {
        for (const flag of row.dietary || []) seen.add(flag);
      }
    }
    return (legend || []).filter((flag) => !seen.has(flag.flag)).map((flag) => flag.label);
  });

  eleventyConfig.addFilter("drinkLine", (kinds) => {
    if (!Array.isArray(kinds) || !kinds.length) return "";
    const label = { beer: "Craft beer", cider: "hard cider", kombucha: "hard kombucha",
      sake: "sake", shochu: "shochu" };
    const words = kinds.map((k) => label[k] || k);
    if (words.length === 1) return words[0];
    return words.slice(0, -1).join(", ") + " and " + words[words.length - 1];
  });

  eleventyConfig.addFilter("withMenuIcons", (icons, menuConcepts) => {
    const wanted = [
      ...Object.values((menuConcepts || {}).ornaments || {}),
      ...Object.values((menuConcepts || {}).cuts || {}),
      // Any BRAND icon the dietary legend names. Spicy draws #i-chili, so
      // without this the legend points at a symbol the page never emitted and
      // the mark silently renders as nothing.
      ...((menuConcepts || {}).legend || [])
        .map((flag) => flag.icon)
        .filter((icon) => icon && icon.startsWith("i-"))
        .map((icon) => icon.slice(2)),
    ];
    return [...new Set([...(icons || []), ...wanted])];
  });

  /**
   * What distinguishes one room's menu from the others, computed.
   *
   * /menu/ is a chooser now and its whole subject is menu difference, so the
   * cards must not carry hand-written blurbs about what a room serves: those go
   * stale the first time a menu changes, silently, on the one page whose job is
   * to be right about it. Everything the card prints comes from here.
   *
   * Returns, for one location id:
   *   served        every dish that room serves
   *   exclusive     the dishes ONLY that room serves. The single truest answer
   *                 to "what makes this room different", and Mercury's 24 is
   *                 the number that made the chooser necessary.
   *   rareSections  sections this room has that at most two San Diego rooms
   *                 have. Sushi, the monthly specials board and the kids menu
   *                 at Mercury; combo sets at Plaza Bonita. Sections almost
   *                 everyone carries (rice at five rooms, dessert at five) are
   *                 not distinguishing and are left out.
   *
   * A room can legitimately come back with nothing in either list. Crown Point
   * serves 21 dishes and every one of them is served somewhere else too, so its
   * card shows a count and no tags. That is the honest answer, not a gap.
   */
  eleventyConfig.addFilter("roomMenuFacts", (items, locId, sdRoomIds, sectionOrder, sectionLabels) => {
    const served = (items || []).filter(
      (d) => d.listed && Array.isArray(d.locations) && d.locations.includes(locId),
    );
    const exclusive = served.filter((d) => d.locations.length === 1);

    const roomsWithSection = (section) =>
      (sdRoomIds || []).filter((room) =>
        (items || []).some(
          (d) => d.section === section && d.listed && (d.locations || []).includes(room),
        ),
      ).length;

    const rareSections = (sectionOrder || [])
      .filter(
        (section) =>
          served.some((d) => d.section === section) && roomsWithSection(section) <= 2,
      )
      .map((section) => (sectionLabels || {})[section] || section);

    return { served, exclusive, rareSections };
  });

  /**
   * INTERNAL MENU CONCEPTS ONLY. The first dish in a section whose photograph
   * carries REVIEWED alt in photos.json, as {dish, photo}, or undefined.
   *
   * The bar is the manifest's alt, not menu.json's. menu.json supplies its own
   * alt for the dishes it images, which bypasses the roomPhotos draft-alt
   * guard, so four rows would otherwise qualify on a string the guard has
   * never seen. This filter holds the stricter line.
   *
   * Returning undefined is the collapse signal: a section with no qualifying
   * photograph renders no pane rather than an empty frame.
   */
  eleventyConfig.addFilter("firstWithReviewedPhoto", (rows) => {
    if (!Array.isArray(rows)) return undefined;
    for (const dish of rows) {
      if (!dish.image) continue;
      const base = dish.image.split("/").pop();
      const record = photos.photos[base];
      if (!record) continue;
      const alt = record.alt || "";
      if (!alt.trim() || alt.trim().startsWith("[DRAFT")) continue;
      return { dish, photo: record };
    }
    return undefined;
  });

  eleventyConfig.addFilter("mapsUrl", (loc) => {
    if (!loc || !loc.address || !loc.address.street) return null;
    const parts = [
      loc.businessName,
      loc.address.street,
      loc.address.locality,
      loc.address.region,
      loc.address.postalCode,
    ].filter(Boolean);
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(", "))}`;
  });

  // Dev server: pin the port and REFUSE to move.
  //
  // Eleventy's default is to increment when 8080 is taken (8080 -> 8081) with a
  // single line of output that is easy to miss. That default caused a real
  // failure on this project: a stale `eleventy --serve` from an earlier session
  // kept 8080 and kept watching src/, a new server answered on 8081, and both
  // wrote to the same _site/. The page flickered between styled and unstyled
  // and the port move went unnoticed for a while.
  //
  // portReassignmentRetryCount: 0 makes a busy port a loud failure instead of a
  // silent relocation. `npm start` runs scripts/free-port.js first, which
  // clears our own strays and refuses to touch anyone else's process.
  eleventyConfig.setServerOptions({
    port: 8080,
    portReassignmentRetryCount: 0,
  });

  eleventyConfig.addPlugin(EleventyVitePlugin, {
    // The temp folder holds Eleventy's HTML output before Vite processes it
    // into the final _site directory.
    tempFolderName: ".11ty-vite",
    viteOptions: {
      // Tailwind v4 compiles here, scanning the real template source (see the
      // @source directive in src/css/app.css).
      plugins: [tailwindcss()],
      resolve: {
        alias: {
          // Resolve /src/... references (from HTML and JS) out of Vite's temp
          // root back into the real source tree.
          "/src": path.resolve(".", "src"),
        },
      },
      publicDir,
      server: {
        watch: {
          // Do not let Vite watch the built HTML or publicDir.
          //
          // Eleventy writes all 15 pages on every rebuild and then copies
          // publicDir, and Vite was firing a separate full page reload for each
          // file it saw change: 23 reload commands to the browser from a single
          // template save, arriving inside ~100ms. That is the flicker.
          //
          // Eleventy's own reload client (/.11ty/reload-client.js, already in
          // every page) is the correct channel for HTML changes and sends one
          // reload per rebuild. Vite keeps the module graph for CSS and JS,
          // which is what it is actually needed for here.
          ignored: ["**/*.html", "**/public/**", `${publicDir}/**`],
        },
      },
      build: {
        // Do not inline assets as base64; keep them as cacheable files so the
        // long-lived Cache-Control headers in public/_headers apply.
        assetsInlineLimit: 0,
        rollupOptions: {
          output: {
            // Hashed, cacheable asset filenames under /assets/.
            assetFileNames: "assets/[name].[hash][extname]",
            chunkFileNames: "assets/[name].[hash].js",
            entryFileNames: "assets/[name].[hash].js",
          },
        },
      },
    },
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      // Relative to input: src/_includes and src/_data.
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html", "11ty.js"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
