// --sticky-top: how far down the header has to start.
//
// THE PROBLEM THIS SOLVES. .hdr is `position: sticky; top: <this>`. Anything
// else pinned to the top of the scrollport occupies the same strip, and the
// higher z-index simply covers the other one. The preview build's announcement
// banner is sticky at top:0 with a z-index above the header, so on scroll it
// pinned over the header and the header rendered clipped. Any future
// announcement bar does the same thing, so the offset is a property of the page
// rather than a number typed into hdr.css.
//
// THE CONTRACT. A bar that pins above the header carries `data-sticky-bar`.
// This sums their heights and writes the total to --sticky-top on :root.
//
// MEASURED, NOT ASSUMED. A one-line bar on a desktop is two or three lines on a
// phone, and a hardcoded height would be wrong at exactly the width where the
// header has least room to spare. A ResizeObserver keeps the number honest
// through wrapping, font loading and orientation changes.
//
// NOT THE ONLY SOURCE OF THE VALUE. With JavaScript off this file does not run
// and --sticky-top is whatever CSS declared, which is why a bar must also
// declare a static fallback for its usual height beside its own styles. This
// corrects that value; it does not replace it. If nothing on the page carries
// the attribute, the offset is 0px and the header behaves as it always did.

const ROOT = document.documentElement;

function measure() {
  const bars = document.querySelectorAll("[data-sticky-bar]");
  let total = 0;
  for (const bar of bars) {
    // A bar hidden at this breakpoint, or by print styles, contributes nothing.
    const style = getComputedStyle(bar);
    if (style.display === "none" || style.visibility === "hidden") continue;
    // Only something actually pinned up there displaces the header. A bar in
    // normal flow scrolls away and the header can start at the top as usual.
    if (style.position !== "sticky" && style.position !== "fixed") continue;
    total += bar.getBoundingClientRect().height;
  }
  // Round up. A fractional offset leaves a sub-pixel seam of page showing
  // between the bar and the header, which reads as a rendering fault.
  ROOT.style.setProperty("--sticky-top", `${Math.ceil(total)}px`);
}

const bars = document.querySelectorAll("[data-sticky-bar]");
if (bars.length) {
  measure();
  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(measure);
    for (const bar of bars) observer.observe(bar);
  }
  // A breakpoint change can hide a bar without changing its own box, which a
  // ResizeObserver on that bar will not report.
  window.addEventListener("resize", measure, { passive: true });
}
