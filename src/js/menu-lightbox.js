// The menu lightbox: tap a dish, see it properly.
//
// Ported from _reference/menu-concepts/tajima-ev-menu-A2.html for its
// structure and its look. Three things the reference does not do, which the
// brief asks for and which are the whole difficulty:
//
//   SWIPE.        The reference has no touch, pointer or gesture handling
//                 anywhere. Its mobile path navigates only by tapping the
//                 arrows. Pointer Events here, no library.
//   FOCUS TRAP.   The reference moves focus into the dialog and restores it on
//                 close, and Tab walks straight out into the page behind. This
//                 uses <dialog>.showModal(), which gives a real trap, Escape,
//                 and the top layer for nothing.
//   IMAGE COST.   The reference points its 92px tile and its fullscreen view
//                 at the SAME file. Here the tile is a 184px derivative and
//                 the full frame is fetched on open, never before.
//
// It also resolves the reference's dead code: its JS switches at 1061px while
// its CSS breaks at 760 and 1060, so its own mobile lightbox rules can never
// apply. One dialog here, styled as a bottom sheet on narrow viewports and a
// centred panel on wide ones, so there is one code path at every width.
//
// PROGRESSIVE ENHANCEMENT. The markup ships with no buttons and no dialog.
// Both are built here, so a visitor without JS sees a menu rather than an
// affordance that does nothing.

const REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)");

function build() {
  const bands = document.querySelectorAll("[data-mc-band]");
  if (!bands.length) return;

  const dialog = document.createElement("dialog");
  dialog.className = "mc-lb";
  dialog.innerHTML = `
    <div class="mc-lb__panel">
      <div class="mc-lb__bar">
        <span class="mc-lb__section"></span>
        <button class="mc-lb__close" type="button" aria-label="Close">&times;</button>
      </div>
      <div class="mc-lb__stage">
        <div class="mc-lb__media"></div>
        <button class="mc-lb__arrow mc-lb__arrow--prev" type="button" aria-label="Previous dish">&#8249;</button>
        <button class="mc-lb__arrow mc-lb__arrow--next" type="button" aria-label="Next dish">&#8250;</button>
      </div>
      <div class="mc-lb__body">
        <h2 class="mc-lb__name"></h2>
        <p class="mc-lb__marks"></p>
        <p class="mc-lb__desc"></p>
      </div>
    </div>`;
  document.body.appendChild(dialog);

  const el = {
    panel: dialog.querySelector(".mc-lb__panel"),
    body: dialog.querySelector(".mc-lb__body"),
    section: dialog.querySelector(".mc-lb__section"),
    media: dialog.querySelector(".mc-lb__media"),
    name: dialog.querySelector(".mc-lb__name"),
    marks: dialog.querySelector(".mc-lb__marks"),
    desc: dialog.querySelector(".mc-lb__desc"),
    prev: dialog.querySelector(".mc-lb__arrow--prev"),
    next: dialog.querySelector(".mc-lb__arrow--next"),
    close: dialog.querySelector(".mc-lb__close"),
  };
  dialog.setAttribute("aria-labelledby", "mc-lb-name");
  el.name.id = "mc-lb-name";

  let items = [];
  let at = 0;
  let opener = null;

  // EVERY ROW ON THE PAGE, ACROSS EVERY BAND, in document order. Navigation
  // used to stop at the band a reader tapped in, which sounded like a feature
  // (stay oriented within Ramen) and read as a dead end in practice: reaching
  // the last dish in Izakaya just stopped, with no way to keep going into
  // Ramen short of closing the dialog and tapping back in. One continuous
  // sequence for the whole page instead; `bandLabel` travels with each item
  // so the section indicator in the bar still updates as you cross a
  // boundary, which is the part of "stay oriented" worth keeping.
  function read(bands) {
    const rows = [];
    for (const band of bands) {
      const bandLabel = band.dataset.mcBand || "";
      for (const plate of band.querySelectorAll(".mc-plate")) {
        const img = plate.querySelector(".mc-shot img");
        const marks = [...plate.querySelectorAll(".mc-mark .u-visually-hidden")].map((m) => m.textContent.trim());
        rows.push({
          name: plate.querySelector(".mc-plate__name").childNodes[0].textContent.trim(),
          desc: (plate.querySelector(".mc-plate__desc") || {}).textContent || "",
          marks,
          full: img ? img.dataset.full : null,
          alt: img ? img.alt : "",
          width: img ? img.dataset.fullW : null,
          height: img ? img.dataset.fullH : null,
          plate,
          bandLabel,
        });
      }
    }
    return rows;
  }

  function preload(index) {
    const item = items[index];
    if (!item || !item.full) return;
    const img = new Image();
    img.src = item.full;
  }

  function paint(index) {
    at = index;
    const item = items[at];

    if (item.full) {
      const img = document.createElement("img");
      img.src = item.full;
      img.alt = item.alt;
      if (item.width) img.width = item.width;
      if (item.height) img.height = item.height;
      img.decoding = "async";
      // Belt and braces with the CSS: a draggable image starts a native drag
      // and the swipe never survives it.
      img.draggable = false;
      el.media.replaceChildren(img);
    } else {
      // The same designed empty state the grid uses, at the larger size.
      const empty = document.createElement("div");
      empty.className = "mc-lb__none";
      empty.setAttribute("aria-hidden", "true");
      empty.innerHTML = '<svg><use href="#i-ramen-bowl"></use></svg>';
      el.media.replaceChildren(empty);
    }

    // Travels with the item now, not fixed at open time: crossing a band
    // boundary mid-navigation must relabel the bar, or the indicator lies
    // about which section the reader is actually looking at.
    el.section.textContent = item.bandLabel;

    el.name.textContent = item.name;
    el.desc.textContent = item.desc;
    el.desc.hidden = !item.desc;
    el.marks.textContent = item.marks.join(" · ");
    el.marks.hidden = !item.marks.length;

    // Clamped, not wrapping. The reference wraps on desktop and clamps on
    // mobile, which is two behaviours for one control.
    el.prev.disabled = at === 0;
    el.next.disabled = at === items.length - 1;
    // Two different elements scroll depending on viewport: the whole panel
    // on desktop (rare, only past the fixed-top offset's safety-net cap),
    // just the body on the mobile sheet (see menu-concepts.css). Resetting
    // whichever one is not the active scroller is a harmless no-op.
    el.panel.scrollTop = 0;
    el.body.scrollTop = 0;

    preload(at + 1);
    preload(at - 1);
  }

  function step(by) {
    const next = at + by;
    if (next < 0 || next > items.length - 1) return;
    paint(next);
  }

  function open(index, trigger) {
    opener = trigger;
    paint(index);
    dialog.showModal();
  }

  el.prev.addEventListener("click", () => step(-1));
  el.next.addEventListener("click", () => step(1));
  el.close.addEventListener("click", () => dialog.close());

  // Clicking the backdrop. The panel stops the event, so anything reaching the
  // dialog itself is outside it.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
  });

  // Escape and the trap are native. This only returns focus and drops the
  // image, so a closed dialog is not holding a full size frame in the DOM.
  dialog.addEventListener("close", () => {
    el.media.replaceChildren();
    if (opener && document.contains(opener)) opener.focus();
    opener = null;
  });

  // SWIPE. Pointer Events, so one path covers touch and pen and a mouse drag.
  // Horizontal intent only: a vertical drag is the reader scrolling the panel
  // and must not be stolen.
  // SWIPE. Pointer Events, so one path covers touch, pen and a mouse drag.
  //
  // DECIDED ON pointermove, NOT pointerup. The first version waited for
  // pointerup and never fired: the browser claims the gesture partway through
  // and sends pointercancel instead, so the release never arrives at the
  // element. Acting on travel as it happens also matches how a swipe feels,
  // which is that it commits when you have moved far enough rather than when
  // you let go.
  //
  // Horizontal intent only: a mostly-vertical drag is the reader scrolling the
  // panel and must not be stolen from them.
  const stage = dialog.querySelector(".mc-lb__stage");
  const THRESHOLD = 45;
  let startX = 0;
  let startY = 0;
  let tracking = false;
  let fired = false;

  stage.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary) return;
    startX = event.clientX;
    startY = event.clientY;
    tracking = true;
    fired = false;
  });

  stage.addEventListener("pointermove", (event) => {
    if (!tracking || fired) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dx) < THRESHOLD) return;
    if (Math.abs(dx) < Math.abs(dy)) { tracking = false; return; }
    fired = true;
    tracking = false;
    step(dx < 0 ? 1 : -1);
  });

  const release = () => { tracking = false; };
  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);
  stage.addEventListener("pointerleave", release);

  // ONE READ, ONCE, FOR THE WHOLE PAGE. items[] is now the full cross-band
  // sequence, built before any hit target is wired, so each button can close
  // over its own position in that single array rather than a per-band index
  // that would need translating later.
  items = read(bands);

  // The hit targets, one per plate, built here so no-JS ships no dead control.
  for (const band of bands) {
    const plates = [...band.querySelectorAll(".mc-plate")];
    plates.forEach((plate) => {
      const index = items.findIndex((item) => item.plate === plate);
      const hit = document.createElement("button");
      hit.type = "button";
      hit.className = "mc-plate__hit";
      const name = plate.querySelector(".mc-plate__name").childNodes[0].textContent.trim();
      hit.setAttribute("aria-label", `${name}, see it larger`);
      hit.addEventListener("click", () => open(index, hit));
      plate.appendChild(hit);
    });
    if (plates.length) band.classList.add("mc-band--interactive");
  }

  if (REDUCE.matches) dialog.classList.add("mc-lb--still");
  REDUCE.addEventListener("change", (event) => {
    dialog.classList.toggle("mc-lb--still", event.matches);
  });
}

build();
