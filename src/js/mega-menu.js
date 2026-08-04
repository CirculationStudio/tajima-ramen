// Locations mega menu: disclosure behavior.  UNDER REVIEW, preview only.
//
// Progressive enhancement. With JS off the panel stays `hidden` and the
// trigger does nothing, which is why the trigger is not the only route to the
// locations: /locations/ is linked from the panel foot, from the footer on
// every page, and from body copy. Losing the menu never loses the content.
//
// Behavior:
//   click / Enter / Space   toggle
//   ArrowDown on trigger    open and land on the first card
//   hover                   opens, but only on a fine pointer at desktop
//                           width, so touch and phones are click-only
//   Escape                  close, focus back to the trigger
//   Tab / Shift+Tab         cycles inside the panel (focus trap, see note)
//   click outside           close
//
// ON THE FOCUS TRAP: this was asked for explicitly and is implemented. Worth
// knowing that the WAI-ARIA Authoring Practices pattern for a *disclosure
// navigation* menu is the opposite, Tab moves out and closes, with traps
// reserved for modal dialogs; a nav that will not let a keyboard user Tab past
// it can feel stuck. Escape always works here, so it is not a dead end. To
// switch to the APG behavior, delete trapTab() and its keydown branch: the
// close-on-focus-out handler already does the rest.

const DESKTOP = window.matchMedia("(min-width: 48.0625rem)");
const FINE_POINTER = window.matchMedia("(pointer: fine)");

function focusableIn(root) {
  return [...root.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(
    (el) => el.offsetParent !== null || el.getClientRects().length > 0,
  );
}

function setupMega(root) {
  const trigger = root.querySelector("[data-mega-trigger]");
  const panel = root.querySelector("[data-mega-panel]");
  if (!trigger || !panel) return;

  let openTimer = null;
  let closeTimer = null;

  const isOpen = () => trigger.getAttribute("aria-expanded") === "true";

  function open({ focusFirst = false } = {}) {
    window.clearTimeout(closeTimer);
    if (isOpen()) {
      if (focusFirst) focusableIn(panel)[0]?.focus();
      return;
    }
    panel.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    if (focusFirst) focusableIn(panel)[0]?.focus();
  }

  function close({ returnFocus = false } = {}) {
    window.clearTimeout(openTimer);
    if (!isOpen()) return;
    panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    if (returnFocus) trigger.focus();
  }

  // --- pointer ------------------------------------------------------------
  trigger.addEventListener("click", () => (isOpen() ? close() : open()));

  // Hover only where hovering is meaningful. On a coarse pointer the first tap
  // would open and the second would immediately close, which reads as broken.
  root.addEventListener("mouseenter", () => {
    if (!DESKTOP.matches || !FINE_POINTER.matches) return;
    window.clearTimeout(closeTimer);
    openTimer = window.setTimeout(open, 90);
  });

  root.addEventListener("mouseleave", () => {
    if (!DESKTOP.matches || !FINE_POINTER.matches) return;
    window.clearTimeout(openTimer);
    // Grace period: the pointer has to cross a gap between the trigger and the
    // panel, and closing on that gap makes the menu feel like it is running
    // away. Not applied if focus is inside, since that means keyboard use.
    closeTimer = window.setTimeout(() => {
      if (!root.contains(document.activeElement)) close();
    }, 220);
  });

  // --- keyboard -----------------------------------------------------------
  trigger.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      open({ focusFirst: true });
    }
  });

  function trapTab(event) {
    const items = focusableIn(panel);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (event.shiftKey) {
      // Backwards off the first item lands on the trigger, which is where a
      // keyboard user expects to go, then wraps to the end from there.
      if (active === first) {
        event.preventDefault();
        trigger.focus();
      } else if (active === trigger) {
        event.preventDefault();
        last.focus();
      }
      return;
    }
    if (active === last) {
      event.preventDefault();
      trigger.focus();
    } else if (active === trigger) {
      event.preventDefault();
      first.focus();
    }
  }

  root.addEventListener("keydown", (event) => {
    if (!isOpen()) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close({ returnFocus: true });
      return;
    }
    if (event.key === "Tab") trapTab(event);
  });

  // --- outside ------------------------------------------------------------
  document.addEventListener("click", (event) => {
    if (isOpen() && !root.contains(event.target)) close();
  });

  // Belt and braces: if focus ends up outside by any route the trap did not
  // cover (browser chrome, find-in-page, an assistive tech shortcut), close
  // rather than leave an open panel nobody is in.
  document.addEventListener("focusin", (event) => {
    if (isOpen() && !root.contains(event.target)) close();
  });

  // Crossing the mobile/desktop boundary while open leaves the panel in a
  // layout it was not opened for. Close and let it be reopened.
  DESKTOP.addEventListener("change", () => close());
}

for (const root of document.querySelectorAll("[data-mega]")) setupMega(root);
