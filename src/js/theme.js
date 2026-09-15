// Theme toggle, the writer half.
//
// The reader half is _includes/components/theme-init.njk, a blocking inline
// script in the head that sets data-mode from storage before first paint. This
// file only runs after parse, which is fine: it upgrades the control, it does
// not decide the theme.
//
// THE TOGGLE IS NOW ALSO AN OPT-OUT, 2026-09-14. theme-init.njk runs a clock
// in America/Los_Angeles for visitors who have never chosen, and reads storage
// for those who have. The single setItem below is therefore doing two jobs: it
// remembers the choice, and it permanently stops the clock applying to this
// visitor. Nothing here clears the key, and nothing should add an expiry: a
// preference that lapses at 18:00 is the bug this design exists to avoid.
//
// prefers-color-scheme is still deliberately not consulted anywhere.
// See DESIGN_SYSTEM.md, "Theme trigger", which carries the revision history.
//
// The control is the footer toggle, next to the colophon. This file does not
// care which element it is bound to: it binds to [data-theme-toggle], so
// moving it again is a markup change only.
//
// NOTHING HERE WRITES THE LABEL OR aria-pressed, 2026-09-14, and both of those
// are deliberate.
//
// The button now names what pressing it does ("Switch to night mode") rather
// than which mode you are in, because the old "Night mode" label could be read
// either way. Both labels and both icons ship in the markup and CSS shows one,
// keyed off data-mode, exactly as the icons already worked. That matters for
// timing: theme-init.njk settles data-mode before first paint and this file
// runs later, so a label written from here would be wrong for the frames in
// between.
//
// aria-pressed went with it. A toggle button keeps one label and reports state
// through aria-pressed; an action button changes its label and reports no
// pressed state. Those are alternatives, and mixing them announces
// "Switch to night mode, pressed", which is nonsense in both directions. The
// single visible label is the accessible name and it is always correct,
// because the other one is display:none and out of the tree.

const KEY = "tajima:mode"; // must match components/theme-init.njk
const MODES = ["day", "night"];

const root = document.documentElement;
const toggles = document.querySelectorAll("[data-theme-toggle]");

if (toggles.length) {
  // Reveal the control now that we know JS is running, and only now. Without
  // JS it would be a button that does nothing.
  for (const el of toggles) {
    el.hidden = false;
    el.addEventListener("click", toggle);
  }
}

function current() {
  return MODES.includes(root.dataset.mode) ? root.dataset.mode : "day";
}

function toggle() {
  root.dataset.mode = current() === "night" ? "day" : "night";
  // Storage can throw in Safari private mode and under some storage
  // partitioning settings. The theme still switches for this page view; it
  // just will not be remembered, which is the right degradation.
  // This write is also the clock opt-out. See the note at the top.
  try {
    localStorage.setItem(KEY, root.dataset.mode);
  } catch (e) {}
}
