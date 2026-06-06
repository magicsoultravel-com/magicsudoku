(() => {
  const WALK_SPEED = 16;
  const CHASE_SPEED = 36;
  const WALK_MIN_MS = 7000;
  const WALK_MAX_MS = 14000;
  const FALL_SPEED = 80;
  const APPROACH_GAP = 26;
  const FLIP_DURATION = 0.65;
  const LAND_DURATION = 0.2;

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

  let interaction = "patrol";
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let freeX = 0;
  let freeY = 0;
  let fallAnim = null;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
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
      y = 0;
      heading = 0;
    } else if (d < top + right) {
      const seg = d - top;
      x = boardW;
      y = seg;
      heading = 90;
    } else if (d < top + right + bottom) {
      const seg = d - top - right;
      x = boardW - seg;
      y = boardH;
      heading = 180;
    } else {
      const seg = d - top - right - bottom;
      x = 0;
      y = boardH - seg;
      heading = -90;
    }

    return { x, y, heading, progress: d };
  }

  function distToPoint(ax, ay, bx, by) {
    const dx = ax - bx;
    const dy = ay - by;
    return Math.hypot(dx, dy);
  }

  function closestPerimeterPoint(x, y) {
    const top = boardW;
    const right = boardH;
    const bottom = boardW;

    const tx = clamp(x, 0, boardW);
    const ty = clamp(y, 0, boardH);
    const bx = clamp(x, 0, boardW);
    const ly = clamp(y, 0, boardH);

    const candidates = [
      { x: tx, y: 0, heading: 0, progress: tx, dist: distToPoint(x, y, tx, 0) },
      { x: boardW, y: ty, heading: 90, progress: top + ty, dist: distToPoint(x, y, boardW, ty) },
      {
        x: bx,
        y: boardH,
        heading: 180,
        progress: top + right + (boardW - bx),
        dist: distToPoint(x, y, bx, boardH),
      },
      {
        x: 0,
        y: ly,
        heading: -90,
        progress: top + right + bottom + (boardH - ly),
        dist: distToPoint(x, y, 0, ly),
      },
    ];

    candidates.sort((a, b) => a.dist - b.dist);
    return candidates[0];
  }

  function applyBorderPosition(x, y, heading) {
    boardCat.style.left = `${x}px`;
    boardCat.style.top = `${y}px`;
    boardCat.style.setProperty("--cat-heading", `${heading}deg`);
    boardCat.style.transform = `translate(-50%, -100%) rotate(${heading}deg)`;
  }

  function applyFreePosition(x, y, rotationDeg, feetDown) {
    boardCat.style.left = `${x}px`;
    boardCat.style.top = `${y}px`;
    const anchor = feetDown ? "translate(-50%, -100%)" : "translate(-50%, -50%)";
    boardCat.style.transform = `${anchor} rotate(${rotationDeg}deg)`;
  }

  function applyPosition(dist) {
    const { x, y, heading } = positionOnPerimeter(dist);
    applyBorderPosition(x, y, heading);
  }

  function setPose(pose) {
    boardCat.dataset.pose = pose;
    boardCat.classList.toggle("is-walking", pose === "walk" || pose === "chase");
    boardCat.classList.toggle("is-sitting", pose === "sit");
    boardCat.classList.toggle("is-lying", pose === "lie");
    boardCat.classList.toggle("is-looking", pose === "look");
    boardCat.classList.toggle("is-meowing", pose === "meow");
    boardCat.classList.toggle("is-chasing", pose === "chase");
    boardCat.classList.toggle("is-dragging", pose === "drag");
    boardCat.classList.toggle("is-falling", pose === "fall");
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
    mouseEl.style.transform = `translate(-50%, -100%) rotate(${heading}deg)`;
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

  function wrapPoint(clientX, clientY) {
    const rect = boardWrap.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function startFall(fromX, fromY) {
    const target = closestPerimeterPoint(fromX, fromY);
    const dx = target.x - fromX;
    const dy = target.y - fromY;
    const totalDist = Math.hypot(dx, dy);
    let stopX = target.x;
    let stopY = target.y;

    if (totalDist > APPROACH_GAP) {
      const ratio = (totalDist - APPROACH_GAP) / totalDist;
      stopX = fromX + dx * ratio;
      stopY = fromY + dy * ratio;
    }

    const dropDist = Math.hypot(stopX - fromX, stopY - fromY);
    const dropDuration = reducedMotion ? 0.01 : Math.max(0.9, Math.min(3.6, dropDist / FALL_SPEED));

    interaction = "fall";
    state = "fall";
    setPose("fall");
    hideSpeech();
    hideMouse();

    fallAnim = {
      phase: "drop",
      startX: fromX,
      startY: fromY,
      stopX,
      stopY,
      targetX: target.x,
      targetY: target.y,
      targetHeading: target.heading,
      targetProgress: target.progress,
      dropDuration,
      flipDuration: reducedMotion ? 0.01 : FLIP_DURATION,
      landDuration: reducedMotion ? 0.01 : LAND_DURATION,
      phaseElapsed: 0,
    };
  }

  function finishFall() {
    progress = fallAnim.targetProgress;
    fallAnim = null;
    interaction = "patrol";
    applyPosition(progress);
    enterIdle("sit");
  }

  function tickFall(dt) {
    if (!fallAnim) return;

    fallAnim.phaseElapsed += dt;

    if (fallAnim.phase === "drop") {
      const t = Math.min(fallAnim.phaseElapsed / fallAnim.dropDuration, 1);
      const x = fallAnim.startX + (fallAnim.stopX - fallAnim.startX) * t;
      const y = fallAnim.startY + (fallAnim.stopY - fallAnim.startY) * t;
      applyFreePosition(x, y, 180, false);
      if (t >= 1) {
        fallAnim.phase = "flip";
        fallAnim.phaseElapsed = 0;
      }
      return;
    }

    if (fallAnim.phase === "flip") {
      const t = Math.min(fallAnim.phaseElapsed / fallAnim.flipDuration, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      const rotation = 180 + ease * (360 + fallAnim.targetHeading);
      applyFreePosition(fallAnim.stopX, fallAnim.stopY, rotation, false);
      if (t >= 1) {
        fallAnim.phase = "land";
        fallAnim.phaseElapsed = 0;
      }
      return;
    }

    const t = Math.min(fallAnim.phaseElapsed / fallAnim.landDuration, 1);
    const x = fallAnim.stopX + (fallAnim.targetX - fallAnim.stopX) * t;
    const y = fallAnim.stopY + (fallAnim.targetY - fallAnim.stopY) * t;
    applyFreePosition(x, y, fallAnim.targetHeading, true);
    if (t >= 1) {
      finishFall();
    }
  }

  function onPointerDown(e) {
    if (!running || interaction !== "patrol") return;
    if (e.button !== 0) return;

    e.preventDefault();
    boardCat.setPointerCapture(e.pointerId);

    interaction = "drag";
    state = "drag";
    setPose("drag");
    hideSpeech();
    hideMouse();

    const wrapPt = wrapPoint(e.clientX, e.clientY);
    const catRect = boardCat.getBoundingClientRect();
    const wrapRect = boardWrap.getBoundingClientRect();
    const catCenterX = catRect.left + catRect.width / 2 - wrapRect.left;
    const catCenterY = catRect.top + catRect.height / 2 - wrapRect.top;

    dragOffsetX = wrapPt.x - catCenterX;
    dragOffsetY = wrapPt.y - catCenterY;

    freeX = wrapPt.x - dragOffsetX;
    freeY = wrapPt.y - dragOffsetY;
    applyFreePosition(freeX, freeY, 0, false);
  }

  function onPointerMove(e) {
    if (interaction !== "drag") return;

    const wrapPt = wrapPoint(e.clientX, e.clientY);
    freeX = wrapPt.x - dragOffsetX;
    freeY = wrapPt.y - dragOffsetY;
    applyFreePosition(freeX, freeY, 0, false);
  }

  function onPointerUp(e) {
    if (interaction !== "drag") return;

    try {
      boardCat.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }

    startFall(freeX, freeY);
  }

  function onPointerCancel(e) {
    if (interaction === "drag") {
      onPointerUp(e);
    }
  }

  function tickPatrol(dt) {
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
  }

  function tick(now) {
    if (!running) return;

    const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 0;
    lastTime = now;

    if (interaction === "fall") {
      tickFall(dt);
    } else if (interaction === "patrol") {
      if (reducedMotion) {
        applyPosition(progress);
      } else {
        tickPatrol(dt);
      }
    }

    rafId = requestAnimationFrame(tick);
  }

  function bindPointer() {
    boardCat.addEventListener("pointerdown", onPointerDown);
    boardCat.addEventListener("pointermove", onPointerMove);
    boardCat.addEventListener("pointerup", onPointerUp);
    boardCat.addEventListener("pointercancel", onPointerCancel);
  }

  function start() {
    if (running || !boardCat) return;
    running = true;
    interaction = "patrol";
    fallAnim = null;
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    boardCat.style.pointerEvents = "auto";
    measure();
    progress = rand(0, perimeter);
    lastTime = 0;
    startWalking();
    applyPosition(progress);
    rafId = requestAnimationFrame(tick);

    if (!resizeObs && boardWrap) {
      resizeObs = new ResizeObserver(() => {
        if (interaction !== "patrol") return;
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
    interaction = "patrol";
    fallAnim = null;
    boardCat.style.pointerEvents = "none";
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    hideMouse();
    hideSpeech();
    setPose("walk");
  }

  function setModel(modelId) {
    if (window.CatModels) {
      CatModels.show(boardCat, modelId);
    }
  }

  function init(wrap, catEl, mouseNode) {
    boardWrap = wrap;
    boardCat = catEl;
    mouseEl = mouseNode;
    speechEl = catEl.querySelector(".cat-speech");
    bindPointer();
  }

  window.CatCompanion = { init, start, stop, setModel };
})();
