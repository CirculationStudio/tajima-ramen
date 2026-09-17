// Noodle Room sub-experience behavior.
//
// Ported from the reference implementation, with the reduced-motion and
// keyboard paths tightened: the doorway is removed from the tab order once
// open, and the film stage returns focus to the control that opened it.

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The doorway. Opens on click, Enter, Space, Escape, scroll or swipe, and
// self-dismisses after four seconds so it can never trap someone behind it.
//
// SCROLL AND SWIPE, added 2026-09-16. The doorway is `position: fixed;
// inset: 0`, opaque, over the whole viewport, and used to open on click,
// key or the four-second timeout only. A visitor who scrolled instead of
// tapping — the natural gesture on a touchscreen, and what a swipe or a
// fling does first — got none of those: the fixed overlay does not move
// when the page under it scrolls, so scrolling past it just leaves it
// sitting there, opaque, for however much of the four seconds is left.
// Reproduced directly against the rendered DOM. A `scroll` listener on
// `window` covers both: a swipe is a touchmove that becomes a scroll the
// moment the viewport's offset actually changes, so nothing touch-specific
// is needed beyond listening for the scroll itself.
(function setupDoorway() {
  const doorway = document.getElementById("doorway");
  if (!doorway) return;

  let opened = false;

  function openDoor() {
    if (opened) return;
    opened = true;
    doorway.setAttribute("data-state", "open");
    // Out of the tab order and out of the a11y tree once it has been passed.
    doorway.setAttribute("aria-hidden", "true");
    doorway.removeAttribute("tabindex");
  }

  if (prefersReducedMotion) {
    openDoor();
    return;
  }

  doorway.addEventListener("click", openDoor);
  doorway.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " " || event.key === "Escape") {
      event.preventDefault();
      openDoor();
    }
  });
  window.addEventListener("scroll", openDoor, { passive: true });

  window.setTimeout(openDoor, 4000);
  doorway.focus();
})();

// Play control on the hero's background film.
//
// WAS A MUTE TOGGLE. The film autoplayed and the pill offered sound. It does
// not autoplay any more, because it is 46.8 MB and this page was transferring
// 97.8 MB before anybody asked it for anything, so the pill starts it instead.
// The video carries preload="none", which means nothing is fetched until this
// runs. The poster is what a visitor sees until then, and for most visits that
// is the whole of it.
(function setupHeroFilm() {
  const video = document.querySelector("[data-hero-film]");
  const button = document.querySelector("[data-video-play]");
  const label = document.querySelector("[data-video-play-label]");
  if (!video || !button) return;

  const playIcon = button.querySelector('[data-video-icon="play"]');
  const pauseIcon = button.querySelector('[data-video-icon="pause"]');

  function paint(playing) {
    if (label) label.textContent = playing ? "Pause" : "Play";
    button.setAttribute(
      "aria-label",
      playing ? "Pause the background film" : "Play the background film",
    );
    if (playIcon) playIcon.hidden = playing;
    if (pauseIcon) pauseIcon.hidden = !playing;
  }

  button.addEventListener("click", () => {
    if (video.paused) {
      video.play().catch(() => {
        // Nothing to recover: it stays on its poster, which is a fine state.
      });
    } else {
      video.pause();
    }
  });

  // Driven off the element's own events rather than off the click, so the
  // control cannot claim it is playing while the fetch is still in flight.
  video.addEventListener("play", () => paint(true));
  video.addEventListener("pause", () => paint(false));
})();

// The film stage.
(function setupWatchStage() {
  const stage = document.querySelector("[data-watch-stage]");
  if (!stage) return;

  const film = stage.querySelector(".watch__video");
  const posterLoop = stage.querySelector(".watch__poster-loop");
  const playBtn = stage.querySelector("[data-watch-play]");
  const closeBtn = stage.querySelector("[data-watch-close]");
  if (!film || !playBtn || !closeBtn) return;

  function play() {
    stage.setAttribute("data-watch-state", "playing");
    film.muted = false;
    film.currentTime = 0;
    film.play().catch(() => {
      // Autoplay with sound is blocked here. Play muted rather than not at all.
      film.muted = true;
      film.play();
    });
    if (posterLoop) posterLoop.pause();
    closeBtn.hidden = false;
    closeBtn.focus();
  }

  function close() {
    stage.removeAttribute("data-watch-state");
    film.pause();
    film.currentTime = 0;
    // The loop is NOT restarted. It carries preload="none" and never played,
    // so calling play() here would start a download on close, which is the
    // opposite of the point. The stage under it is ink, which is the design.
    closeBtn.hidden = true;
    playBtn.focus();
  }

  playBtn.addEventListener("click", play);
  closeBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    close();
  });
  stage.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !closeBtn.hidden) close();
  });
  film.addEventListener("ended", close);
})();

// Decorative background videos are motion. Pause them when motion is unwanted.
//
// Nothing carries `autoplay` in the markup any more, so this no longer has a
// download to prevent. It still runs, because a video can be started from a
// control and a reduced-motion visitor should not get looping footage if they
// do start one.
(function respectReducedMotion() {
  if (!prefersReducedMotion) return;
  for (const video of document.querySelectorAll("video[data-decorative]")) {
    video.autoplay = false;
    video.removeAttribute("autoplay");
    video.removeAttribute("loop");
    video.pause();
  }
})();
