// Tajima Ramen, main JavaScript entry.
//
// JavaScript discipline (CLAUDE.md Performance Standards): keep scripts minimal,
// defer/async everything non-critical, no long main-thread tasks, no
// `transition: all`. Page-specific behavior lives in src/js/pages/ and is
// imported per template, not loaded globally.
//
// The stylesheet rides the Vite pipeline: importing it here lets Vite compile
// Tailwind (via @tailwindcss/vite), extract it to a hashed <link> at build
// time, and inject it over HMR in dev. Keeps CSS and JS on one pipeline.
import "/src/css/app.css";

// Locations mega menu. Global: the header is on every page.
import "/src/js/mega-menu.js";

// Scroll reveal, progressive enhancement.
//
// Content is visible by default in CSS. We only add the `js-reveal` hook (which
// arms the hidden-then-fade-in state) when IntersectionObserver exists and the
// visitor has not asked for reduced motion. No-JS, old-browser, and
// reduced-motion visitors get the content immediately with no hidden state to
// recover from.
(function setupReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!targets.length) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion || !("IntersectionObserver" in window)) return;

  document.documentElement.classList.add("js-reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );

  for (const target of targets) observer.observe(target);
})();
