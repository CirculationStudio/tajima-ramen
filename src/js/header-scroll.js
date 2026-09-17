// Header scroll-compact behavior.
//
// The full header (.hdr__in--full) is 213px and never changes size on its
// own, which is a mobile audit finding: past the fold, its sticky red Order
// Online CTA shares the viewport with whatever in-page red CTA the reader has
// scrolled to, which DESIGN_SYSTEM.md's one-red-per-viewport rule forbids.
// Past COMPACT_AT this switches to .hdr__in--compact (mark, Locations,
// Order Online, 57px) instead. Scrolling back up past EXPAND_AT restores the
// full row.
//
// TWO THRESHOLDS, NOT ONE. A single symmetric threshold means any pixel of
// upward movement right at that line flips the header, and iOS delivers
// exactly that on every fling: the rubber-band settle at the end of a
// momentum scroll moves the page up a few pixels even when the reader meant
// to keep going down. EXPAND_AT sits far below COMPACT_AT on purpose, so nothing
// short of a real scroll back toward the top can cross both.
//
// `hidden`, an instant swap, not an animated height. hdr.css explains why:
// animating max-height on a `position: sticky` element risks a per-frame
// scrollport repaint that can register as a layout shift even though nothing
// underneath actually moves, and it is not a risk this file needs to take to
// get a transition — the CSS decorates whichever row this script reveals
// with a short fade, which needs no height to change at all.
//
// SUPPRESSING OUR OWN ECHO. Changing the header's height while the page is
// scrolled past it changes the document's total height too, and Chrome's
// default scroll anchoring compensates by nudging window.scrollY to keep
// whatever is on screen from visibly jumping — measured directly: under 0.3px
// of movement on the content below the header, both ways, at 360/390/414.
// That compensation is correct and wanted. What it also does is fire its own
// scroll event, and reading window.scrollY from THAT event can land back on
// the wrong side of the threshold this file just crossed, which flips the
// header straight back and produces a fast, visible flicker on every expand.
// Reproduced directly: scrolling to the very top after compacting bounced the
// header compact -> full -> compact -> full within three animation frames.
// SUPPRESS_MS gives that compensation a window to finish before the next
// scroll event is allowed to move the state again; it is not related to, and
// does not substitute for, the COMPACT_AT/EXPAND_AT gap above, which is
// there for iOS momentum rather than for this. Measured directly: the
// compensating scroll event lands within about 23ms of the mutation that
// caused it. 100ms leaves a wide margin over that without being long enough
// for a reader's own next scroll, at the point they'd actually reverse
// direction, to land inside the suppressed window instead.
//
// Reduced motion is CSS's decision, not this file's: hdr.css only runs that
// fade inside `prefers-reduced-motion: no-preference`, so a reduced-motion
// visitor gets the exact same state changes, at the exact same thresholds,
// with nothing here needing to know which case it is.

const header = document.querySelector("[data-hdr-scroll]");

if (header) {
  const full = header.querySelector('[data-hdr-row="full"]');
  const compact = header.querySelector('[data-hdr-row="compact"]');

  const COMPACT_AT = 140;
  const EXPAND_AT = 24;
  const SUPPRESS_MS = 100;

  let isCompact = false;
  let ticking = false;
  let suppressUntil = 0;

  // Starting state, set directly rather than through apply(): apply() only
  // acts on a change, and the markup already ships the compact row hidden,
  // so this just makes the full row's hidden state agree with it before the
  // first scroll event has a chance to.
  if (full) full.hidden = false;
  if (compact) compact.hidden = true;

  function apply(compactNow) {
    if (compactNow === isCompact) return;
    isCompact = compactNow;
    header.classList.toggle("is-compact", isCompact);
    if (full) full.hidden = isCompact;
    if (compact) compact.hidden = !isCompact;
    suppressUntil = performance.now() + SUPPRESS_MS;
  }

  function onScroll() {
    ticking = false;
    if (performance.now() < suppressUntil) return;
    const y = window.scrollY;
    if (!isCompact && y > COMPACT_AT) apply(true);
    else if (isCompact && y <= EXPAND_AT) apply(false);
  }

  function requestTick() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onScroll);
  }

  window.addEventListener("scroll", requestTick, { passive: true });
  onScroll();
}
