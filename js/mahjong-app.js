(() => {
  const boardEl = document.getElementById("mahjong-board");
  const boardWrap = document.getElementById("mahjong-wrap");
  const statusEl = document.getElementById("mahjong-status");
  const timerEl = document.getElementById("mahjong-timer");
  const countEl = document.getElementById("mahjong-tile-count");
  const statsStartedEl = document.getElementById("mahjong-stats-started");
  const statsCompletedEl = document.getElementById("mahjong-stats-completed");
  const btnUndo = document.getElementById("btn-mahjong-undo");
  const btnHint = document.getElementById("btn-mahjong-hint");
  const difficultyEl = document.getElementById("mahjong-difficulty");
  const dealOverlay = document.getElementById("mahjong-deal-overlay");
  const dealBar = document.getElementById("mahjong-deal-bar");
  const dealLabel = document.getElementById("mahjong-deal-label");
  const dealProgress = document.getElementById("mahjong-deal-progress");
  const guideDialog = document.getElementById("mahjong-guide-dialog");
  const guideBasics = document.getElementById("mahjong-guide-basics");
  const guideSymbols = document.getElementById("mahjong-guide-symbols");
  const btnTileSet = document.getElementById("btn-mahjong-tiles");
  const appEl = document.querySelector(".app");
  const seedsDialog = document.getElementById("seeds-dialog");
  const currentSeedEl = document.getElementById("current-seed");
  const seedList = document.getElementById("seed-list");

  const STATE_KEY = "mahjong-game";
  const STATS_KEY = "mahjong-stats";
  const SEEDS_KEY = "mahjong-seeds";
  const TILE_SET_KEY = "mahjong-tile-set";
  const STATE_VERSION = 3;
  const MAX_SEEDS = 10;
  const ACCEPT_VERSIONS = [2, 3];
  const MAX_SAVE_BYTES = 250_000;
  const REMOVE_MS = 320;

  let tiles = [];
  let selected = null;
  let seed = null;
  let currentDifficulty = "medium";
  let seedHistory = [];
  let history = [];
  let timerInterval = null;
  let timerRunning = false;
  let seconds = 0;
  let gameWon = false;
  let gamesStarted = 0;
  let gamesCompleted = 0;
  let initialized = false;
  let animating = false;
  let dealToken = 0;
  let hintPair = null;
  let hintStep = 0;
  let tileSet = "ivory";

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  function resetTimer() {
    stopTimer();
    seconds = 0;
    timerRunning = false;
    timerEl.textContent = formatTime(0);
  }

  function startTimer(fromSeconds = 0) {
    stopTimer();
    seconds = fromSeconds;
    timerEl.textContent = formatTime(seconds);
    if (gameWon) return;
    timerRunning = true;
    timerInterval = setInterval(() => {
      seconds++;
      timerEl.textContent = formatTime(seconds);
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function ensureTimerRunning() {
    if (gameWon || timerRunning) return;
    startTimer(seconds);
  }

  function setStatus(msg, type = "") {
    statusEl.textContent = msg;
    statusEl.className = "status" + (type ? ` ${type}` : "");
  }

  function updateTileCount() {
    if (!countEl) return;
    const left = Mahjong.remaining(tiles);
    countEl.textContent = `${left} tiles`;
    countEl.setAttribute("aria-label", `${left} tiles remaining`);
  }

  function loadStats() {
    try {
      const stats = JSON.parse(localStorage.getItem(STATS_KEY) || "{}");
      gamesStarted = Number.isFinite(stats.started) ? stats.started : 0;
      gamesCompleted = Number.isFinite(stats.completed) ? stats.completed : 0;
    } catch {
      gamesStarted = 0;
      gamesCompleted = 0;
    }
    renderStats();
  }

  function saveStats() {
    try {
      localStorage.setItem(
        STATS_KEY,
        JSON.stringify({ started: gamesStarted, completed: gamesCompleted })
      );
    } catch {
      /* storage unavailable */
    }
  }

  function renderStats() {
    statsStartedEl.textContent = String(gamesStarted);
    statsCompletedEl.textContent = String(gamesCompleted);
  }

  function recordGameStarted() {
    gamesStarted += 1;
    renderStats();
    saveStats();
  }

  function recordGameCompleted() {
    gamesCompleted += 1;
    renderStats();
    saveStats();
  }

  function loadSeedHistory() {
    try {
      seedHistory = JSON.parse(localStorage.getItem(SEEDS_KEY) || "[]");
    } catch {
      seedHistory = [];
    }
  }

  function saveSeedHistory() {
    try {
      localStorage.setItem(SEEDS_KEY, JSON.stringify(seedHistory));
    } catch {
      /* storage unavailable */
    }
  }

  function recordSeed(nextSeed, difficulty) {
    seed = nextSeed;
    currentDifficulty = difficulty;
    seedHistory = seedHistory.filter((e) => e.seed !== nextSeed);
    seedHistory.unshift({ seed: nextSeed, difficulty, at: Date.now() });
    if (seedHistory.length > MAX_SEEDS) seedHistory.length = MAX_SEEDS;
    saveSeedHistory();
  }

  function renderSeeds() {
    if (!currentSeedEl || !seedList) return;
    currentSeedEl.textContent = seed != null ? `${seed} · ${currentDifficulty}` : "—";

    seedList.innerHTML = "";
    if (!seedHistory.length) {
      const li = document.createElement("li");
      li.textContent = "No seeds yet";
      seedList.appendChild(li);
      return;
    }

    seedHistory.forEach((entry) => {
      const li = document.createElement("li");
      li.textContent = `${entry.seed} · ${entry.difficulty}`;
      if (entry.seed === seed) li.classList.add("current");
      li.title = new Date(entry.at).toLocaleString();
      seedList.appendChild(li);
    });
  }

  function openSeeds() {
    window.SudokuApp?.closeMenu?.();
    renderSeeds();
    seedsDialog?.showModal();
  }

  function applyTileSet(set) {
    tileSet = set === "black" ? "black" : "ivory";
    if (appEl) {
      appEl.dataset.mjTiles = tileSet;
    }
    if (btnTileSet) {
      const isBlack = tileSet === "black";
      btnTileSet.classList.toggle("active", isBlack);
      btnTileSet.title = isBlack ? "Tile set: Black — tap for Ivory" : "Tile set: Ivory — tap for Black";
      btnTileSet.setAttribute(
        "aria-label",
        isBlack ? "Tile set Black, switch to Ivory" : "Tile set Ivory, switch to Black"
      );
    }
    try {
      localStorage.setItem(TILE_SET_KEY, tileSet);
    } catch {
      /* storage unavailable */
    }
  }

  function toggleTileSet() {
    window.SudokuApp?.closeMenu?.();
    applyTileSet(tileSet === "black" ? "ivory" : "black");
  }

  function loadTileSet() {
    try {
      const saved = localStorage.getItem(TILE_SET_KEY);
      applyTileSet(saved === "black" ? "black" : "ivory");
    } catch {
      applyTileSet("ivory");
    }
  }

  function clearSavedGame() {
    try {
      localStorage.removeItem(STATE_KEY);
    } catch {
      /* storage unavailable */
    }
  }

  function isValidTile(tile, expectedId) {
    return (
      tile &&
      tile.id === expectedId &&
      Number.isFinite(tile.x) &&
      Number.isFinite(tile.y) &&
      Number.isFinite(tile.z) &&
      typeof tile.kind === "string" &&
      Number.isFinite(tile.rank) &&
      typeof tile.removed === "boolean"
    );
  }

  function validateLoadedState(state) {
    if (!state || !ACCEPT_VERSIONS.includes(state.v)) return false;
    if (!Array.isArray(state.tiles) || state.tiles.length !== Mahjong.TILE_COUNT) return false;

    for (let i = 0; i < state.tiles.length; i++) {
      if (!isValidTile(state.tiles[i], i)) return false;
    }

    if (
      state.selected !== null &&
      state.selected !== undefined &&
      (!Number.isInteger(state.selected) ||
        state.selected < 0 ||
        state.selected >= Mahjong.TILE_COUNT ||
        state.tiles[state.selected]?.removed)
    ) {
      return false;
    }

    return true;
  }

  function compactTiles(list) {
    return list.map((t) => ({
      id: t.id,
      kind: t.kind,
      rank: t.rank,
      label: t.label,
      key: t.key,
      x: t.x,
      y: t.y,
      z: t.z,
      removed: t.removed,
    }));
  }

  function saveGame() {
    if (!tiles.length || tiles.length !== Mahjong.TILE_COUNT) return;
    const state = {
      v: STATE_VERSION,
      tiles: compactTiles(tiles),
      seed,
      seconds,
      gameWon,
      selected: gameWon ? null : selected,
      difficultyPref: difficultyEl?.value,
    };
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }

  function tryLoadGame() {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return false;

    if (raw.length > MAX_SAVE_BYTES) {
      console.warn("Mahjong save too large — clearing");
      clearSavedGame();
      return false;
    }

    try {
      const state = JSON.parse(raw);
      if (!validateLoadedState(state)) {
        clearSavedGame();
        return false;
      }

      tiles = compactTiles(state.tiles);
      seed = Number.isFinite(state.seed) ? state.seed : null;
      currentDifficulty = state.difficultyPref || difficultyEl?.value || "medium";
      seconds = Number.isFinite(state.seconds) ? state.seconds : 0;
      gameWon = !!state.gameWon;
      selected = gameWon ? null : (state.selected ?? null);
      history = [];

      if (state.difficultyPref && difficultyEl) difficultyEl.value = state.difficultyPref;

      if (gameWon) setStatus("Cleared!", "ok");
      else setStatus("");

      renderBoard();
      updateTileCount();
      btnUndo.disabled = true;

      if (gameWon) {
        timerEl.textContent = formatTime(seconds);
        timerRunning = false;
      } else if (seconds > 0) {
        startTimer(seconds);
      } else {
        resetTimer();
      }
      return true;
    } catch (err) {
      console.warn("Mahjong save corrupt — clearing", err);
      clearSavedGame();
      return false;
    }
  }

  function dotsPattern(rank) {
    const patterns = {
      1: [5],
      2: [1, 9],
      3: [1, 5, 9],
      4: [1, 3, 7, 9],
      5: [1, 3, 5, 7, 9],
      6: [1, 3, 4, 6, 7, 9],
      7: [1, 3, 4, 5, 6, 7, 9],
      8: [1, 2, 3, 4, 6, 7, 8, 9],
      9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    };
    const on = patterns[rank] || [];
    let html = '<span class="mj-pattern mj-dots-grid" aria-hidden="true">';
    for (let i = 1; i <= 9; i++) {
      html += `<i class="mj-dot${on.includes(i) ? " on" : ""}"></i>`;
    }
    html += "</span>";
    return html;
  }

  function bambooPattern(rank) {
    if (rank === 1) {
      return '<span class="mj-pattern mj-bamboo-one" aria-hidden="true"><i class="mj-bird"></i></span>';
    }
    const gridCls = rank >= 6 ? " mj-bamboo-grid" : "";
    let html = `<span class="mj-pattern mj-bamboo-sticks mj-bamboo-${rank}${gridCls}" aria-hidden="true">`;
    for (let i = 0; i < rank; i++) {
      html += '<i class="mj-stick"></i>';
    }
    html += "</span>";
    return html;
  }

  function createTileFace(tile) {
    const face = document.createElement("span");
    face.className = "mj-face";

    switch (tile.kind) {
      case "dots":
        face.innerHTML = dotsPattern(tile.rank);
        break;
      case "bamboo":
        face.innerHTML = bambooPattern(tile.rank);
        break;
      case "chars":
        face.innerHTML = `<span class="mj-chars-text" aria-hidden="true">${tile.label}</span>`;
        break;
      case "wind":
        face.innerHTML = `<span class="mj-wind-text" aria-hidden="true">${tile.label}</span>`;
        break;
      case "dragon":
        if (tile.rank === 3) {
          face.innerHTML =
            '<span class="mj-dragon-text mj-dragon-3" aria-hidden="true"><span class="mj-white-frame">白</span></span>';
        } else {
          face.innerHTML = `<span class="mj-dragon-text mj-dragon-${tile.rank}" aria-hidden="true">${tile.label}</span>`;
        }
        break;
      case "flower":
        face.innerHTML = `<span class="mj-bonus-text mj-flower-${tile.rank}" aria-hidden="true">${tile.label}</span>`;
        break;
      case "season":
        face.innerHTML = `<span class="mj-bonus-text mj-season-${tile.rank}" aria-hidden="true">${tile.label}</span>`;
        break;
      default:
        face.textContent = tile.label;
    }

    const sr = document.createElement("span");
    sr.className = "sr-only";
    sr.textContent = `${tile.kind} ${tile.label}`;
    face.appendChild(sr);
    return face;
  }

  function renderBoard(animateIn = false) {
    if (!boardEl || !tiles.length) return;
    boardEl.innerHTML = "";
    const bounds = Mahjong.bounds(tiles);
    const spanX = Math.max(bounds.maxX - bounds.minX, Mahjong.TILE_W);
    const spanY = Math.max(bounds.maxY - bounds.minY, Mahjong.TILE_H);
    const SCALE = 0.86;
    const margin = ((1 - SCALE) * 100) / 2;
    const tileW = (Mahjong.TILE_W / spanX) * 100 * SCALE;
    const tileH = (Mahjong.TILE_H / spanY) * 100 * SCALE;

    boardEl.style.setProperty("--mj-tile-w", `${tileW}%`);
    boardEl.style.setProperty("--mj-tile-h", `${tileH}%`);
    boardEl.style.setProperty("--mj-max-z", String(bounds.maxZ));
    boardEl.style.setProperty("--mj-aspect", String(spanX / spanY));

    const layerShift = Math.max(4, Math.min(8, boardEl.clientWidth / 70));
    boardEl.style.setProperty("--mj-layer-x", `${-layerShift}px`);
    boardEl.style.setProperty("--mj-layer-y", `${-Math.round(layerShift * 0.88)}px`);

    const sorted = [...tiles]
      .filter((t) => !t.removed)
      .sort((a, b) => a.z - b.z || a.y - b.y || a.x - b.x);

    let enterIndex = 0;
    for (const tile of sorted) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mj-tile";
      btn.dataset.id = tile.id;
      btn.style.left = `${margin + ((tile.x - bounds.minX) / spanX) * (100 - 2 * margin)}%`;
      btn.style.top = `${margin + ((tile.y - bounds.minY) / spanY) * (100 - 2 * margin)}%`;
      btn.style.zIndex = String(10 + tile.z);
      btn.style.setProperty("--mj-z", String(tile.z));

      const free = Mahjong.isFree(tile, tiles);
      if (!free) btn.classList.add("blocked");
      if (selected === tile.id) btn.classList.add("selected");
      btn.classList.add(`mj-${tile.kind}`);

      btn.appendChild(createTileFace(tile));

      if (animateIn) {
        btn.classList.add("mj-enter");
        btn.style.animationDelay = `${enterIndex * 10}ms`;
        enterIndex++;
      }

      btn.title = free ? `Match ${tile.label}` : "Blocked tile";
      btn.disabled = (!free && selected !== tile.id) || animating;
      btn.addEventListener("click", () => onTileClick(tile.id));
      boardEl.appendChild(btn);
    }

    updateTileCount();
  }

  function pushHistory() {
    history.push({
      tiles: tiles.map((t) => ({ ...t })),
      selected,
    });
    if (history.length > 30) history.shift();
    btnUndo.disabled = gameWon;
  }

  function undo() {
    if (!history.length || gameWon || animating) return;
    clearHint();
    const snap = history.pop();
    tiles = snap.tiles.map((t) => ({ ...t }));
    selected = snap.selected;
    gameWon = Mahjong.isWon(tiles);
    setStatus("");
    ensureTimerRunning();
    renderBoard();
    btnUndo.disabled = history.length === 0;
    saveGame();
  }

  function afterPairRemoved() {
    selected = null;
    animating = false;
    renderBoard();
    btnUndo.disabled = false;

    if (Mahjong.isWon(tiles)) {
      gameWon = true;
      stopTimer();
      recordGameCompleted();
      setStatus("Cleared!", "ok");
      btnUndo.disabled = true;
    } else if (!Mahjong.freeTiles(tiles).length) {
      setStatus("No moves left — start a new game", "err");
    } else {
      setStatus("");
    }
    saveGame();
  }

  function removePair(aId, bId) {
    pushHistory();
    animating = true;

    const elA = boardEl.querySelector(`[data-id="${aId}"]`);
    const elB = boardEl.querySelector(`[data-id="${bId}"]`);
    elA?.classList.add("mj-removing");
    elB?.classList.add("mj-removing");

    ensureTimerRunning();

    setTimeout(() => {
      tiles = tiles.map((t) =>
        t.id === aId || t.id === bId ? { ...t, removed: true } : t
      );
      afterPairRemoved();
    }, REMOVE_MS);
  }

  function clearHint() {
    hintPair = null;
    hintStep = 0;
  }

  function isHintPairValid(pair) {
    if (!pair) return false;
    const [aId, bId] = pair;
    const a = tiles.find((t) => t.id === aId);
    const b = tiles.find((t) => t.id === bId);
    return (
      a &&
      b &&
      !a.removed &&
      !b.removed &&
      Mahjong.isFree(a, tiles) &&
      Mahjong.isFree(b, tiles) &&
      Mahjong.canMatch(a, b)
    );
  }

  function applyHintGlow(ids) {
    if (!boardEl) return;
    boardEl.querySelectorAll(".mj-tile").forEach((el) => {
      const id = +el.dataset.id;
      if (ids.includes(id)) el.classList.add("hint");
    });
  }

  function onTileClick(id) {
    if (gameWon || animating) return;
    clearHint();

    const tile = tiles.find((t) => t.id === id);
    if (!tile || tile.removed) return;

    if (selected === null) {
      if (!Mahjong.isFree(tile, tiles)) return;
      selected = id;
      renderBoard();
      saveGame();
      return;
    }

    if (selected === id) {
      selected = null;
      renderBoard();
      saveGame();
      return;
    }

    const first = tiles.find((t) => t.id === selected);
    if (
      first &&
      Mahjong.isFree(first, tiles) &&
      Mahjong.isFree(tile, tiles) &&
      Mahjong.canMatch(first, tile)
    ) {
      removePair(first.id, tile.id);
      return;
    }

    if (!Mahjong.isFree(tile, tiles)) return;
    selected = id;
    renderBoard();
    saveGame();
  }

  function findHintPair() {
    const free = Mahjong.freeTiles(tiles);
    for (let i = 0; i < free.length; i++) {
      for (let j = i + 1; j < free.length; j++) {
        if (Mahjong.canMatch(free[i], free[j])) {
          return [free[i].id, free[j].id];
        }
      }
    }
    return null;
  }

  function showHint() {
    if (gameWon || animating) return;

    if (hintStep === 1 && isHintPairValid(hintPair)) {
      hintStep = 2;
      selected = hintPair[1];
      renderBoard();
      applyHintGlow(hintPair);
      setStatus("Hint: match the glowing tiles");
      saveGame();
      return;
    }

    clearHint();
    const pair = findHintPair();
    if (!pair) {
      setStatus("No matching pairs available", "err");
      return;
    }

    hintPair = pair;
    hintStep = 1;
    selected = pair[0];
    renderBoard();
    applyHintGlow([pair[0]]);
    setStatus("Hint: tap again for the matching tile");
    saveGame();
  }

  function setDealProgress(p, label) {
    const pct = Math.round(p * 100);
    if (dealBar) dealBar.style.width = `${pct}%`;
    dealProgress?.setAttribute("aria-valuenow", String(pct));
    if (label && dealLabel) dealLabel.textContent = label;
  }

  function hideDealOverlay() {
    if (!dealOverlay) return;
    dealOverlay.hidden = true;
    dealOverlay.setAttribute("aria-hidden", "true");
    setDealProgress(0, "Dealing tiles…");
  }

  function showDealOverlay() {
    if (!dealOverlay) return;
    setDealProgress(0, "Dealing tiles…");
    dealOverlay.hidden = false;
    dealOverlay.setAttribute("aria-hidden", "false");
  }

  async function dealBoard({ dealSeed, recordStart = false } = {}) {
    const token = ++dealToken;

    gameWon = false;
    selected = null;
    history = [];
    animating = false;
    clearHint();
    setStatus("");

    boardWrap.classList.add("is-clearing");
    await wait(240);
    if (token !== dealToken) return;

    showDealOverlay();
    boardWrap.classList.add("is-dealing");

    let result;
    try {
      result = await Mahjong.generateAsync(dealSeed, (p, label) => {
        if (token === dealToken) setDealProgress(p, label);
      });
    } catch (err) {
      console.error(err);
      if (token !== dealToken) return;
      setStatus("Could not deal board — try New game again", "err");
      boardWrap.classList.remove("is-clearing", "is-dealing");
      hideDealOverlay();
      return;
    }

    if (token !== dealToken) return;

    tiles = result.tiles;
    if (recordStart) {
      recordGameStarted();
      recordSeed(result.seed, difficultyEl?.value || "medium");
    } else {
      seed = result.seed;
    }

    setDealProgress(1, "Ready");
    await wait(160);
    if (token !== dealToken) return;

    boardWrap.classList.remove("is-dealing");
    renderBoard(true);

    if (!result.solvable) {
      setStatus("Board dealt — use Hint if you get stuck", "err");
    }

    await wait(120);
    if (token !== dealToken) return;

    hideDealOverlay();
    boardWrap.classList.remove("is-clearing");
    resetTimer();
    btnUndo.disabled = true;
    saveGame();
  }

  function newGame() {
    const diff = difficultyEl?.value || "medium";
    const seedBase = Date.now() ^ (Math.random() * 0xffffffff);
    const offset = diff === "easy" ? 0 : diff === "hard" ? 999983 : 424242;
    const dealSeed = (seedBase + offset) >>> 0;
    dealBoard({ dealSeed, recordStart: true });
  }

  function restartGame() {
    if (!tiles.length && seed == null) return;
    dealBoard({ dealSeed: seed ?? Date.now(), recordStart: false });
  }

  function fillGuidePanel(container, lessons, withSamples = false) {
    container.innerHTML = "";
    lessons.forEach((lesson) => {
      const article = document.createElement("article");
      article.className = "lesson";

      const heading = document.createElement("h3");
      heading.textContent = lesson.title;
      article.appendChild(heading);

      if (lesson.pronunciation) {
        const sectionPron = document.createElement("p");
        sectionPron.className = "mj-guide-pron";
        sectionPron.textContent = lesson.pronunciation;
        article.appendChild(sectionPron);
      }

      const body = document.createElement("p");
      body.textContent = lesson.body;
      article.appendChild(body);

      if (withSamples && lesson.samples?.length) {
        const row = document.createElement("div");
        row.className = "mj-guide-samples";
        row.setAttribute("aria-hidden", "true");
        for (const sample of lesson.samples) {
          const sampleWrap = document.createElement("div");
          sampleWrap.className = "mj-guide-sample";

          const tileEl = document.createElement("span");
          tileEl.className = `mj-guide-tile mj-${sample.kind}`;
          tileEl.appendChild(createTileFace(sample));
          sampleWrap.appendChild(tileEl);

          if (sample.pronunciation) {
            const pron = document.createElement("span");
            pron.className = "mj-guide-pron";
            pron.textContent = sample.pronunciation;
            sampleWrap.appendChild(pron);
          }

          row.appendChild(sampleWrap);
        }
        article.appendChild(row);
      }

      container.appendChild(article);
    });
  }

  function switchGuideTab(tab) {
    const isBasics = tab === "basics";
    document.getElementById("tab-mj-basics")?.classList.toggle("active", isBasics);
    document.getElementById("tab-mj-symbols")?.classList.toggle("active", !isBasics);
    document.getElementById("tab-mj-basics")?.setAttribute("aria-selected", String(isBasics));
    document.getElementById("tab-mj-symbols")?.setAttribute("aria-selected", String(!isBasics));
    if (guideBasics) guideBasics.hidden = !isBasics;
    if (guideSymbols) guideSymbols.hidden = isBasics;
  }

  function openGuide() {
    window.SudokuApp?.closeMenu?.();
    if (guideBasics) {
      fillGuidePanel(guideBasics, MahjongGuideBasics);
      fillGuidePanel(guideSymbols, MahjongGuideSymbols, true);
    }
    switchGuideTab("basics");
    guideDialog?.showModal();
  }

  function init() {
    if (initialized) return;
    initialized = true;
    loadStats();
    loadSeedHistory();
    loadTileSet();

    btnUndo.addEventListener("click", undo);
    btnHint.addEventListener("click", showHint);

    document.getElementById("btn-mahjong-new")?.addEventListener("click", newGame);
    document.getElementById("btn-mahjong-restart")?.addEventListener("click", restartGame);
    document.getElementById("btn-mahjong-guide")?.addEventListener("click", openGuide);
    document.getElementById("btn-mahjong-seeds")?.addEventListener("click", openSeeds);
    btnTileSet?.addEventListener("click", toggleTileSet);
    document.getElementById("mahjong-guide-close")?.addEventListener("click", () => guideDialog?.close());
    guideDialog?.addEventListener("click", (e) => {
      if (e.target === guideDialog) guideDialog.close();
    });
    document.getElementById("tab-mj-basics")?.addEventListener("click", () => switchGuideTab("basics"));
    document.getElementById("tab-mj-symbols")?.addEventListener("click", () => switchGuideTab("symbols"));

    try {
      if (!tryLoadGame()) {
        newGame();
      }
    } catch (err) {
      console.error("Mahjong init failed — starting fresh", err);
      clearSavedGame();
      newGame();
    }

    let resizeTimer = null;
    window.addEventListener("resize", () => {
      if (!tiles.length) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => renderBoard(), 120);
    });
  }

  window.MahjongApp = {
    init,
    saveGame,
    newGame,
    restartGame,
    openSeeds,
    isActive() {
      return window.Games?.active === "mahjong";
    },
  };
})();
