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
