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

  const STATE_KEY = "mahjong-game";
  const STATS_KEY = "mahjong-stats";
  const STATE_VERSION = 2;
  const REMOVE_MS = 320;

  let tiles = [];
  let selected = null;
  let seed = null;
  let history = [];
  let timerInterval = null;
  let timerRunning = false;
  let seconds = 0;
  let gameWon = false;
  let gamesStarted = 0;
  let gamesCompleted = 0;
  let initialized = false;
  let animating = false;

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

  function saveGame() {
    if (!tiles.length) return;
    const state = {
      v: STATE_VERSION,
      tiles,
      seed,
      seconds,
      gameWon,
      selected,
      history,
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

    try {
      const state = JSON.parse(raw);
      if (state.v !== STATE_VERSION || !Array.isArray(state.tiles) || !state.tiles.length) {
        return false;
      }

      tiles = state.tiles;
      seed = state.seed;
      seconds = state.seconds || 0;
      gameWon = !!state.gameWon;
      selected = state.selected ?? null;
      history = Array.isArray(state.history) ? state.history : [];

      if (state.difficultyPref && difficultyEl) difficultyEl.value = state.difficultyPref;

      if (gameWon) setStatus("Cleared!", "ok");
      else setStatus("");

      renderBoard();
      updateTileCount();
      btnUndo.disabled = history.length === 0 || gameWon;

      if (gameWon) {
        timerEl.textContent = formatTime(seconds);
        timerRunning = false;
      } else if (seconds > 0) {
        startTimer(seconds);
      } else {
        resetTimer();
      }
      return true;
    } catch {
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
    let html = `<span class="mj-pattern mj-bamboo-sticks mj-bamboo-${rank}" aria-hidden="true">`;
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

  function renderBoard() {
    boardEl.innerHTML = "";
    const bounds = Mahjong.bounds(tiles);
    const spanX = bounds.maxX - bounds.minX;
    const spanY = bounds.maxY - bounds.minY;
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

  function onTileClick(id) {
    if (gameWon || animating) return;

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
    const pair = findHintPair();
    if (!pair) {
      setStatus("No matching pairs available", "err");
      return;
    }
    selected = pair[0];
    renderBoard();
    boardEl.querySelectorAll(".mj-tile").forEach((el) => {
      const id = +el.dataset.id;
      if (id === pair[0] || id === pair[1]) el.classList.add("hint");
    });
    setStatus("Hint: match the glowing tiles");
    saveGame();
  }

  function newGame() {
    gameWon = false;
    selected = null;
    history = [];
    animating = false;
    setStatus("");

    const diff = difficultyEl?.value || "medium";
    const seedBase = Date.now() ^ (Math.random() * 0xffffffff);
    const offset = diff === "easy" ? 0 : diff === "hard" ? 999983 : 424242;
    seed = (seedBase + offset) >>> 0;

    boardWrap.classList.add("is-clearing");
    setTimeout(() => {
      const result = Mahjong.generate(seed);
      tiles = result.tiles;
      seed = result.seed;
      recordGameStarted();
      renderBoard();
      if (!result.solvable) setStatus("Puzzle may be unsolvable — try New game", "err");
      boardWrap.classList.remove("is-clearing");
      resetTimer();
      btnUndo.disabled = true;
      saveGame();
    }, 220);
  }

  function restartGame() {
    if (!tiles.length) return;
    gameWon = false;
    selected = null;
    history = [];
    animating = false;
    setStatus("");

    boardWrap.classList.add("is-clearing");
    setTimeout(() => {
      const result = Mahjong.generate(seed ?? Date.now());
      tiles = result.tiles;
      renderBoard();
      boardWrap.classList.remove("is-clearing");
      resetTimer();
      btnUndo.disabled = true;
      saveGame();
    }, 220);
  }

  function init() {
    if (initialized) return;
    initialized = true;
    loadStats();

    btnUndo.addEventListener("click", undo);
    btnHint.addEventListener("click", showHint);

    document.getElementById("btn-mahjong-new")?.addEventListener("click", newGame);
    document.getElementById("btn-mahjong-restart")?.addEventListener("click", restartGame);

    if (!tryLoadGame()) {
      newGame();
    }

    window.addEventListener("resize", () => {
      if (tiles.length) renderBoard();
    });
  }

  window.MahjongApp = {
    init,
    saveGame,
    newGame,
    restartGame,
    isActive() {
      return window.Games?.active === "mahjong";
    },
  };
})();
