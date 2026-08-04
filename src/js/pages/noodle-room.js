// Noodle Room sub-experience behavior.
//
// Ported from the reference implementation, with the reduced-motion and
// keyboard paths tightened: the doorway is removed from the tab order once
// open, and the film stage returns focus to the control that opened it.

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The doorway. Opens on click, Enter, Space, or Escape, and self-dismisses
// after four seconds so it can never trap someone behind it.
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

  window.setTimeout(openDoor, 4000);
  doorway.focus();
})();

// Mute toggle on the hero's background film.
(function setupMuteToggle() {
  const video = document.querySelector(".hero__video-media");
  const button = document.querySelector("[data-video-mute]");
  const label = document.querySelector("[data-video-mute-label]");
  if (!video || !button) return;

  button.addEventListener("click", () => {
    video.muted = !video.muted;
    if (label) label.textContent = video.muted ? "Muted" : "Sound";
    button.setAttribute("aria-label", video.muted ? "Unmute the video" : "Mute the video");
  });
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
    if (posterLoop && !prefersReducedMotion) posterLoop.play().catch(() => {});
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
(function respectReducedMotion() {
  if (!prefersReducedMotion) return;
  for (const video of document.querySelectorAll("video[data-decorative]")) {
    video.autoplay = false;
    video.removeAttribute("autoplay");
    video.pause();
  }
})();
