(() => {
  const CAT_SIZE = 22;
  const OUTSET = 18;
  const WALK_SPEED = 16;
  const CHASE_SPEED = 36;
  const WALK_MIN_MS = 7000;
  const WALK_MAX_MS = 14000;

  let boardWrap = null;
  let boardCat = null;
  let mouseEl = null;
  let speechEl = null;

  let running = false;
  let reducedMotion = false;
  let rafId = null;
  let resizeObs = null;
  let lastTime = 0;

  let progress = 0;
  let state = "walk";
  let walkTimer = 0;
  let idleTimer = 0;
  let mouseTarget = 0;
  let boardW = 0;
  let boardH = 0;
  let perimeter = 0;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
  }

  function measure() {
    if (!boardWrap) return;
    boardW = boardWrap.clientWidth;
    boardH = boardWrap.clientHeight;
    perimeter = 2 * (boardW + boardH);
  }

  function positionOnPerimeter(dist) {
    const top = boardW;
    const right = boardH;
    const bottom = boardW;
    const d = ((dist % perimeter) + perimeter) % perimeter;
    let x;
    let y;
    let heading;

    if (d < top) {
      x = d;
      y = -OUTSET;
      heading = 0;
    } else if (d < top + right) {
      const seg = d - top;
      x = boardW + OUTSET;
      y = seg;
      heading = 90;
    } else if (d < top + right + bottom) {
      const seg = d - top - right;
      x = boardW - seg;
      y = boardH + OUTSET;
      heading = 180;
    } else {
      const seg = d - top - right - bottom;
      x = -OUTSET;
      y = boardH - seg;
      heading = -90;
    }

    return { x, y, heading };
  }

  function applyPosition(dist) {
    const { x, y, heading } = positionOnPerimeter(dist);
    boardCat.style.left = `${x}px`;
    boardCat.style.top = `${y}px`;
    boardCat.style.transform = `translate(-50%, -50%) rotate(${heading}deg)`;
  }

  function setPose(pose) {
    boardCat.dataset.pose = pose;
    boardCat.classList.toggle("is-walking", pose === "walk" || pose === "chase");
    boardCat.classList.toggle("is-sitting", pose === "sit");
    boardCat.classList.toggle("is-lying", pose === "lie");
    boardCat.classList.toggle("is-looking", pose === "look");
    boardCat.classList.toggle("is-meowing", pose === "meow");
    boardCat.classList.toggle("is-chasing", pose === "chase");
  }

  function hideMouse() {
    if (mouseEl) mouseEl.hidden = true;
  }

  function showMouseAt(dist) {
    if (!mouseEl) return;
    const { x, y, heading } = positionOnPerimeter(dist);
    mouseEl.hidden = false;
    mouseEl.style.left = `${x}px`;
    mouseEl.style.top = `${y}px`;
    mouseEl.style.transform = `translate(-50%, -50%) rotate(${heading}deg)`;
  }

  function hideSpeech() {
    if (speechEl) speechEl.hidden = true;
  }

  function showSpeech() {
    if (!speechEl) return;
    const lines = ["Meow!", "Mrrp?", "Prrrr…", "Mew!"];
    speechEl.querySelector("span").textContent = lines[randInt(0, lines.length - 1)];
    speechEl.hidden = false;
  }

  function pickIdleBehavior() {
    const r = Math.random();
    if (r < 0.08) return "chase";
    if (r < 0.16) return "meow";
    if (r < 0.34) return "look";
    if (r < 0.52) return "lie";
    return "sit";
  }

  function startWalking() {
    state = "walk";
    setPose("walk");
    hideMouse();
    hideSpeech();
    walkTimer = rand(WALK_MIN_MS, WALK_MAX_MS);
  }

  function enterIdle(behavior) {
    state = behavior;
    setPose(behavior);

    if (behavior === "meow") {
      showSpeech();
      idleTimer = rand(1800, 2800);
    } else if (behavior === "chase") {
      mouseTarget = (progress + rand(30, 70)) % perimeter;
      showMouseAt(mouseTarget);
      idleTimer = rand(3500, 5500);
    } else if (behavior === "sit") {
      idleTimer = rand(3000, 5500);
    } else if (behavior === "lie") {
      idleTimer = rand(4500, 8000);
    } else {
      idleTimer = rand(2200, 4200);
    }
  }

  function tick(now) {
    if (!running) return;

    const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 0;
    lastTime = now;

    if (reducedMotion) {
      applyPosition(progress);
      rafId = requestAnimationFrame(tick);
      return;
    }

    if (state === "walk") {
      progress = (progress + WALK_SPEED * dt) % perimeter;
      walkTimer -= dt * 1000;
      if (walkTimer <= 0) {
        enterIdle(pickIdleBehavior());
      }
    } else if (state === "chase") {
      const ahead = (mouseTarget - progress + perimeter) % perimeter;
      if (ahead < 4) {
        hideMouse();
        setPose("sit");
        state = "sit";
        idleTimer = rand(1200, 2200);
      } else {
        progress = (progress + CHASE_SPEED * dt) % perimeter;
        idleTimer -= dt * 1000;
        if (idleTimer <= 0) {
          hideMouse();
          startWalking();
        }
      }
    } else {
      idleTimer -= dt * 1000;
      if (idleTimer <= 0) {
        if (state === "meow") hideSpeech();
        startWalking();
      }
    }

    applyPosition(progress);
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (running || !boardCat) return;
    running = true;
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    measure();
    progress = rand(0, perimeter);
    lastTime = 0;
    startWalking();
    applyPosition(progress);
    rafId = requestAnimationFrame(tick);

    if (!resizeObs && boardWrap) {
      resizeObs = new ResizeObserver(() => {
        const ratio = perimeter > 0 ? progress / perimeter : 0;
        measure();
        progress = ratio * perimeter;
        applyPosition(progress);
      });
      resizeObs.observe(boardWrap);
    }
  }

  function stop() {
    running = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    hideMouse();
    hideSpeech();
    setPose("walk");
  }

  function init(wrap, catEl, mouseNode) {
    boardWrap = wrap;
    boardCat = catEl;
    mouseEl = mouseNode;
    speechEl = catEl.querySelector(".cat-speech");
  }

  window.CatCompanion = { init, start, stop };
})();
