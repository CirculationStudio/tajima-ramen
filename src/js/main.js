// Tajima Ramen, main JavaScript entry.
//
// JavaScript discipline (CLAUDE.md Performance Standards): keep scripts minimal,
// defer/async everything non-critical, no long main-thread tasks, no
// `transition: all`. Page-specific behavior lives in src/js/pages/ and is
// imported per template, not loaded globally.
//
// The stylesheet rides the Vite pipeline: importing it here lets Vite compile
// Tailwind (via @tailwindcss/vite), extract it to a hashed <link> at build
// time, and inject it over HMR in dev. Keeps CSS and JS on one pipeline.
import "/src/css/app.css";
