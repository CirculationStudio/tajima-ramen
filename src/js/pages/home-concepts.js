// /internal/home-concepts/ : the concept switcher.
//
// Review page only. Three whole home page directions live in one document and
// this swaps which one is rendered, keeping the choice in the URL so a single
// direction can be sent as a link (?concept=b).
//
// WHY NOT A TABLIST. The ARIA tab pattern moves focus with the arrow keys and
// expects a panel small enough to be "the thing the tab reveals." These panels
// are entire pages with their own headers, navs and footers, and a tablist
// would put a roving tabindex in front of all of it. Three plain buttons with
// aria-pressed say the same thing, work from the keyboard with no extra
// mechanics, and leave every link inside the visible concept in the normal tab
// order. Nothing here traps focus.
//
// The hidden concepts use the `hidden` attribute rather than a class, so their
// links leave the tab order entirely instead of being merely invisible. Same
// reasoning as the mega menu panel.

// Concept C reuses the shipped .hero component, background video included,
// and that video is the one piece of motion on this page. home.js carries the
// reduced-motion handler that drops autoplay from every video[data-decorative]
// and pauses it, so it is imported rather than reimplemented: a second copy of
// that rule is a second place for it to rot.
//
// Its other half, the curtain stage, queries [data-curtain-stage], finds
// nothing on this page (no concept keeps the film) and returns immediately.
//
// It runs once at load and reaches C's video while C is still hidden, which is
// what we want: the video must never start, not merely stop when C is shown.
import "/src/js/pages/home.js";

const CONCEPTS = ["a", "b", "c"];
const PARAM = "concept";

(function setupConceptSwitcher() {
  const buttons = [...document.querySelectorAll("[data-hc-btn]")];
  const panels = [...document.querySelectorAll("[data-hc-concept]")];
  if (!buttons.length || !panels.length) return;

  function show(key, { updateUrl = true } = {}) {
    for (const panel of panels) {
      const isActive = panel.dataset.hcConcept === key;
      panel.hidden = !isActive;

      // The inner <main> carries `hidden` too. HTML allows more than one
      // <main> in a document only while every extra one is itself hidden, and
      // hiding the ancestor does not satisfy that: the attribute has to be on
      // the element. Three concepts means three mains, so this is what keeps
      // the document valid and leaves exactly one main landmark exposed.
      const main = panel.querySelector("main");
      if (main) main.hidden = !isActive;
    }

    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(button.dataset.hcBtn === key));
    }

    if (!updateUrl) return;

    // replaceState, not pushState. The back button should leave the review
    // page, not walk back through however many concepts were compared.
    const url = new URL(window.location.href);
    url.searchParams.set(PARAM, key);
    window.history.replaceState(null, "", url);
  }

  for (const button of buttons) {
    button.addEventListener("click", () => {
      show(button.dataset.hcBtn);
      // Top of the new concept, but focus stays on the button that was just
      // pressed so the keyboard user can move straight to the next one.
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  }

  const requested = new URL(window.location.href).searchParams.get(PARAM);
  const initial = CONCEPTS.includes(requested) ? requested : CONCEPTS[0];
  show(initial, { updateUrl: false });
})();
