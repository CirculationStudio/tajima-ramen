// Tajima Ramen, main JavaScript entry.
//
// JavaScript discipline (CLAUDE.md Performance Standards): keep scripts minimal,
// defer/async everything non-critical, no long main-thread tasks, no
// `transition: all`. Page-specific behavior lives in src/js/pages/ and is
// imported per template, not loaded globally.
//
// The stylesheet is loaded via a <link> in the layout head (src/css/app.css),
// not imported here, so CSS is not blocked behind JS on a performance-first
// build. This entry is intentionally empty until there is real global behavior.

export {};
