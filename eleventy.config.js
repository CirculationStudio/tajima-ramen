// Eleventy v3 configuration for Tajima Ramen.
// Stack: Eleventy v3 (ESM) + Vite (via @11ty/eleventy-plugin-vite) + Tailwind v4.
// See ARCHITECTURE.md for the technical map and DEPLOYMENT.md for Cloudflare config.
//
// Vite handles CSS/JS bundling (Tailwind runs inside Vite via @tailwindcss/vite,
// configured in vite.config.js). Eleventy generates the HTML; Vite processes the
// asset references in that HTML during the build.

import EleventyVitePlugin from "@11ty/eleventy-plugin-vite";

export default function (eleventyConfig) {
  // Bundle assets through Vite. The temp folder holds Eleventy's HTML output
  // before Vite processes it into the final _site directory.
  eleventyConfig.addPlugin(EleventyVitePlugin, {
    tempFolderName: ".11ty-vite",
  });

  // Static, served-verbatim files (Cloudflare _headers/_redirects,
  // site.webmanifest, fonts, favicons) live in the project-root public/ dir and
  // are emitted by Vite's publicDir (see vite.config.js), not passed through
  // here (passthrough would only stage them for Vite's emptyOutDir to wipe).

  // CSS and JS entries are passthrough-copied into the build tree so Vite can
  // pick them up as entry points via the <link>/<script> references in the HTML
  // (root-relative: /css/styles.css, /js/main.js). Vite bundles them into
  // hashed assets and rewrites those references; the raw copies do not survive
  // into final _site (Vite's emptyOutDir clears them, keeping only the hashed
  // output).
  //
  // styles.css is Tailwind's compiled output, produced by the "css" npm script
  // BEFORE eleventy runs (npm run build). app.css is the Tailwind SOURCE and is
  // not shipped; only the compiled styles.css is referenced and bundled.
  eleventyConfig.addPassthroughCopy({ "src/css/styles.css": "css/styles.css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });

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
