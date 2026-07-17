// Vite configuration for Tajima Ramen.
// Loaded by @11ty/eleventy-plugin-vite during both dev (--serve) and build.
//
// Tailwind v4 is NOT run through Vite here. @tailwindcss/vite binds its content
// scanner to Vite's root, and the Eleventy Vite plugin sets that root to a
// throwaway temp dir, so no utilities get generated. Instead Tailwind runs as
// its own CLI step (see the "css" npm script) and emits src/css/styles.css,
// which Vite then bundles and hashes like any other stylesheet.

import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

// The Eleventy Vite plugin runs Vite with its temp folder as root, so any path
// that must escape that temp folder has to be absolute.
const publicDir = fileURLToPath(new URL("./public", import.meta.url));

export default defineConfig({
  // Static, served-verbatim files. Vite copies publicDir into the output root
  // AFTER the build, so these survive the plugin's emptyOutDir. This is where
  // the Cloudflare control files (_headers, _redirects), site.webmanifest,
  // fonts, and favicons live. Reference them with absolute paths (/fonts/...).
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
});
