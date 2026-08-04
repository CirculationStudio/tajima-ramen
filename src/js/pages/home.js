// Home page behavior: the curtain stage that frames Sam's film.
//
// Ported from the reference implementation. Changes: the pause control is
// keyboard-reachable and Escape closes the stage, neither of which the concept
// handled, and the hero and card background videos are paused for visitors who
// ask for reduced motion.

(function setupCurtainStage() {
  const stage = document.querySelector("[data-curtain-stage]");
  if (!stage) return;

  const video = stage.querySelector(".curtain-stage__video");
  const playBtn = stage.querySelector("[data-curtain-play]");
  const pauseBtn = stage.querySelector("[data-curtain-pause]");
  const house = stage.closest(".curtain-stage__house");
  if (!video || !playBtn || !pauseBtn || !house) return;

  function openCurtains() {
    house.setAttribute("data-curtain-state", "playing");
    video.muted = false;
    video.currentTime = 0;
    video.play().catch(() => {
      // Autoplay with sound is blocked in this context. Keep it muted rather
      // than failing to play at all.
      video.muted = true;
      video.play();
    });
    pauseBtn.hidden = false;
    pauseBtn.focus();
  }

  function closeCurtains() {
    house.removeAttribute("data-curtain-state");
    video.pause();
    video.currentTime = 0;
    pauseBtn.hidden = true;
    playBtn.focus();
  }

  playBtn.addEventListener("click", openCurtains);

  pauseBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    closeCurtains();
  });

  stage.addEventListener("click", (event) => {
    if (event.target === stage || event.target === video) openCurtains();
  });

  stage.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !pauseBtn.hidden) closeCurtains();
  });

  video.addEventListener("ended", closeCurtains);
})();

// Decorative background videos are motion. Honor the reduced-motion setting:
// pause them and drop the autoplay so they never restart.
(function respectReducedMotion() {
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  for (const video of document.querySelectorAll("video[data-decorative]")) {
    video.autoplay = false;
    video.removeAttribute("autoplay");
    video.pause();
  }
})();
