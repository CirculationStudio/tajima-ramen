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
