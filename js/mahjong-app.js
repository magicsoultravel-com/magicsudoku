(() => {
  const boardEl = document.getElementById("mahjong-board");
  const boardWrap = document.getElementById("mahjong-wrap");
  const statusEl = document.getElementById("mahjong-status");
  const timerEl = document.getElementById("mahjong-timer");
  const statsStartedEl = document.getElementById("mahjong-stats-started");
  const statsCompletedEl = document.getElementById("mahjong-stats-completed");
  const btnUndo = document.getElementById("btn-mahjong-undo");
  const btnHint = document.getElementById("btn-mahjong-hint");
  const difficultyEl = document.getElementById("mahjong-difficulty");

  const STATE_KEY = "mahjong-game";
  const STATS_KEY = "mahjong-stats";

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
    startTimer(0);
  }

  function setStatus(msg, type = "") {
    statusEl.textContent = msg;
    statusEl.className = "status" + (type ? ` ${type}` : "");
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
      v: 1,
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
      if (state.v !== 1 || !Array.isArray(state.tiles) || !state.tiles.length) {
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

  function renderBoard() {
    boardEl.innerHTML = "";
    const bounds = Mahjong.bounds(tiles);
    const spanX = bounds.maxX - bounds.minX;
    const spanY = bounds.maxY - bounds.minY;
    const tileW = 100 / spanX;
    const tileH = 100 / spanY;

    boardEl.style.setProperty("--mj-tile-w", `${tileW}%`);
    boardEl.style.setProperty("--mj-tile-h", `${tileH}%`);

    const sorted = [...tiles]
      .filter((t) => !t.removed)
      .sort((a, b) => a.z - b.z || a.y - b.y || a.x - b.x);

    for (const tile of sorted) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mj-tile";
      btn.dataset.id = tile.id;
      btn.style.left = `${((tile.x - bounds.minX) / spanX) * 100}%`;
      btn.style.top = `${((tile.y - bounds.minY) / spanY) * 100}%`;
      btn.style.zIndex = String(10 + tile.z);

      const free = Mahjong.isFree(tile, tiles);
      if (!free) btn.classList.add("blocked");
      if (selected === tile.id) btn.classList.add("selected");
      btn.classList.add(`mj-${tile.kind}`);

      const face = document.createElement("span");
      face.className = "mj-face";
      face.textContent = tile.label;
      btn.appendChild(face);

      btn.title = free ? `Match ${tile.label}` : "Blocked tile";
      btn.disabled = !free && selected !== tile.id;
      btn.addEventListener("click", () => onTileClick(tile.id));
      boardEl.appendChild(btn);
    }
  }

  function pushHistory() {
    history.push({
      tiles: tiles.map((t) => ({ ...t })),
      selected,
    });
    if (history.length > 20) history.shift();
    btnUndo.disabled = gameWon;
  }

  function undo() {
    if (!history.length || gameWon) return;
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

  function removePair(aId, bId) {
    pushHistory();
    tiles = tiles.map((t) =>
      t.id === aId || t.id === bId ? { ...t, removed: true } : t
    );
    selected = null;
    ensureTimerRunning();
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

  function onTileClick(id) {
    if (gameWon) return;

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
    if (gameWon) return;
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
    setStatus("Hint: match the highlighted tiles");
    saveGame();
  }

  function newGame() {
    gameWon = false;
    selected = null;
    history = [];
    setStatus("");

    const diff = difficultyEl?.value || "medium";
    const seedBase = Date.now() ^ (Math.random() * 0xffffffff);
    const offset = diff === "easy" ? 0 : diff === "hard" ? 999983 : 424242;
    seed = (seedBase + offset) >>> 0;

    boardWrap.classList.add("is-clearing");
    setTimeout(() => {
      const result = Mahjong.generate(seed);
      tiles = result.tiles;
      recordGameStarted();
      renderBoard();
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
