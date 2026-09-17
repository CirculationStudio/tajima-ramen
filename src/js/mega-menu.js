// Locations mega menu: disclosure behavior.
//
// Progressive enhancement. With JS off the panel stays `hidden` and the
// trigger does nothing, which is why the trigger is not the only route to the
// locations: /locations/ is linked from the panel foot, from the footer on
// every page, and from body copy. Losing the menu never loses the content.
//
// Behavior:
//   click / Enter / Space   toggle
//   ArrowDown on trigger    open and land on the first card
//   Escape                  close, focus back to the trigger
//   Tab / Shift+Tab         cycles inside the panel (focus trap, see note)
//   click outside           close
//
// CLICK TO TOGGLE ONLY, decided 2026-08-05. This previously also opened on
// hover after 90ms and closed on a 220ms mouseleave grace period, on a fine
// pointer at desktop width only. Hover-open and click-toggle were fighting:
// hover opened the panel, and then clicking the trigger, which is a real
// button and looks like one, closed it again. Hover-then-click read as the
// menu refusing the click.
//
// Why click won rather than hover-intent with a longer delay:
//   - The trigger already ships aria-expanded and aria-controls, which is the
//     ARIA disclosure pattern. Opening on hover contradicts the semantics the
//     markup already declares.
//   - It is the one behavior that is identical on touch, trackpad, mouse and
//     keyboard, so the DESKTOP and FINE_POINTER media queries that existed
//     only to paper over that difference are gone.
//   - The panel is a seven-card grid with fifteen-plus focusable targets, and
//     "Order Online" sits immediately next to the trigger in the nav. The
//     cursor crosses this trigger on the way to the site's highest-value CTA.
//     A delay narrows that window; it does not close it.
//
// Do not reintroduce a hover handler here without revisiting all three.
//
// ON THE FOCUS TRAP: this was asked for explicitly and is implemented. Worth
// knowing that the WAI-ARIA Authoring Practices pattern for a *disclosure
// navigation* menu is the opposite, Tab moves out and closes, with traps
// reserved for modal dialogs; a nav that will not let a keyboard user Tab past
// it can feel stuck. Escape always works here, so it is not a dead end. To
// switch to the APG behavior, delete trapTab() and its keydown branch: the
// close-on-focus-out handler already does the rest.
//
// TWO TRIGGERS, ONE PANEL, added 2026-09-16 for the header's compact row.
// components/site-header.njk now ships a second [data-mega-trigger] (the
// compact row's pin-icon button), wired to the same aria-controls id as the
// full row's "Locations" button. Only one of the two rows is ever visible at
// a time (src/js/header-scroll.js owns that switch, by toggling `hidden` on
// each row), so every place this file used to say "the trigger" now says
// "every trigger" for state changes, and "the trigger that is currently
// reachable" for focus. A `root` can also have exactly one trigger, same as
// before /nav-preview/ and any future single-trigger instance; nothing below
// assumes there are two.

// Still needed: crossing this boundary while the panel is open leaves it in a
// layout it was not opened for. See the change handler at the end.
const DESKTOP = window.matchMedia("(min-width: 48.0625rem)");

function focusableIn(root) {
  return [...root.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(
    (el) => el.offsetParent !== null || el.getClientRects().length > 0,
  );
}

// Whichever trigger is not sitting inside a `hidden` row right now. Falls
// back to the first trigger so a build with no compact row (still every page
// except through the shared header) behaves exactly as it did with one.
function activeTrigger(triggers) {
  return triggers.find((t) => !t.closest("[hidden]")) || triggers[0];
}

function setupMega(root) {
  const triggers = [...root.querySelectorAll("[data-mega-trigger]")];
  const panel = root.querySelector("[data-mega-panel]");
  if (!triggers.length || !panel) return;

  // Open state lives on the panel, not on any one trigger: with two triggers
  // there is no single element left to ask "aria-expanded === true" and be
  // sure the answer means the panel.
  const isOpen = () => panel.hidden === false;

  function setExpanded(value) {
    for (const t of triggers) t.setAttribute("aria-expanded", String(value));
  }

  function open({ focusFirst = false } = {}) {
    if (isOpen()) {
      if (focusFirst) focusableIn(panel)[0]?.focus();
      return;
    }
    panel.hidden = false;
    setExpanded(true);
    if (focusFirst) focusableIn(panel)[0]?.focus();
  }

  function close({ returnFocus = false } = {}) {
    if (!isOpen()) return;
    panel.hidden = true;
    setExpanded(false);
    if (returnFocus) activeTrigger(triggers)?.focus();
  }

  // --- pointer ------------------------------------------------------------
  // The only way to open with a pointer. Enter and Space fire click on a
  // <button> natively, so the keyboard gets this for free and there is no
  // separate key handler for them.
  for (const trigger of triggers) {
    trigger.addEventListener("click", () => (isOpen() ? close() : open()));

    // --- keyboard -----------------------------------------------------------
    trigger.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        open({ focusFirst: true });
      }
    });
  }

  function trapTab(event) {
    const trigger = activeTrigger(triggers);
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
