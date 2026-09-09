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
// TODO, DESIGN_SYSTEM.md Open Item 2: the control is currently the logo, a
// prototype affordance carried over from _reference/tajima-home-v2.html.
// Before launch it moves to the footer and the logo goes back to linking home.
// This file does not care which element it is bound to: it binds to
// [data-theme-toggle], so that move is a markup change only.

const KEY = "tajima:mode"; // must match components/theme-init.njk
const MODES = ["day", "night"];

const root = document.documentElement;
const toggles = document.querySelectorAll("[data-theme-toggle]");

if (toggles.length) {
  // Upgrade the control now that we know JS is running.
  //
  // The button ships from the server with only the brand name as its label and
  // no aria-pressed, because the server cannot know the stored preference: a
  // server-rendered pressed state would be announced wrongly on every second
  // load. Name it after the state it controls, not the action, so "Night mode,
  // toggle button, pressed" reads correctly in both directions.
  for (const el of toggles) {
    el.setAttribute("aria-label", "Night mode");
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
