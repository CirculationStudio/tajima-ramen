// Theme toggle, the writer half.
//
// The reader half is _includes/components/theme-init.njk, a blocking inline
// script in the head that sets data-mode from storage before first paint. This
// file only runs after parse, which is fine: it upgrades the control, it does
// not decide the theme.
//
// v2 reverses the v1 "night is permanent" rule. Light and dark both ship, day
// is the default, and this is a MANUAL toggle: no clock, and deliberately no
// prefers-color-scheme. See DESIGN_SYSTEM.md, "What changed in v2".
//
// The control is the footer toggle, next to the colophon. This file does not
// care which element it is bound to: it binds to [data-theme-toggle], so
// moving it again is a markup change only.

const KEY = "tajima:mode"; // must match components/theme-init.njk
const MODES = ["day", "night"];

const root = document.documentElement;
const toggles = document.querySelectorAll("[data-theme-toggle]");

if (toggles.length) {
  // Reveal the control now that we know JS is running, and only now.
  //
  // It ships `hidden` with no aria-pressed: without JS it would be a button
  // that does nothing, and the server cannot know the stored preference, so a
  // server-rendered pressed state would be announced wrongly on every second
  // load. The visible label ("Night mode") is the accessible name and nothing
  // here overrides it, so it names the state it controls and reads correctly
  // in both directions.
  for (const el of toggles) {
    el.hidden = false;
    el.addEventListener("click", toggle);
  }
  sync();
}

function current() {
  return MODES.includes(root.dataset.mode) ? root.dataset.mode : "day";
}

function sync() {
  const pressed = current() === "night" ? "true" : "false";
  for (const el of toggles) el.setAttribute("aria-pressed", pressed);
}

function toggle() {
  root.dataset.mode = current() === "night" ? "day" : "night";
  // Storage can throw in Safari private mode and under some storage
  // partitioning settings. The theme still switches for this page view; it
  // just will not be remembered, which is the right degradation.
  try {
    localStorage.setItem(KEY, root.dataset.mode);
  } catch (e) {}
  sync();
}
