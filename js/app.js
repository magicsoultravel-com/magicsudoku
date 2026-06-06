(() => {
  const boardEl = document.getElementById("board");
  const boardWrap = document.querySelector(".board-wrap");
  const numpadEl = document.getElementById("numpad");
  const statusEl = document.getElementById("status");
  const timerEl = document.getElementById("timer");
  const difficultyEl = document.getElementById("difficulty");
  const themeSelect = document.getElementById("theme-select");
  const appEl = document.querySelector(".app");
  const quoteSplash = document.getElementById("quote-splash");
  const quoteTextEl = document.getElementById("quote-text");
  const quoteAuthorEl = document.getElementById("quote-author");
  const quoteProceed = document.getElementById("quote-proceed");
  const QUOTE_BUTTON_DELAY_MS = 2200;
  const QUOTE_FADE_MS = 280;
  const lessonsDialog = document.getElementById("lessons-dialog");
  const lessonsBasics = document.getElementById("lessons-basics");
  const lessonsAdvanced = document.getElementById("lessons-advanced");
  const seedsDialog = document.getElementById("seeds-dialog");
  const appearanceDialog = document.getElementById("appearance-dialog");
  const menuScrim = document.getElementById("menu-scrim");
  const confirmDialog = document.getElementById("confirm-dialog");
  const confirmMessage = document.getElementById("confirm-message");
  const confirmOk = document.getElementById("confirm-ok");
  const confirmCancel = document.getElementById("confirm-cancel");
  const settingsColors = document.getElementById("settings-colors");
  const btnSettings = document.getElementById("btn-settings");
  const btnMenu = document.getElementById("btn-menu");
  const btnZenExit = document.getElementById("btn-zen-exit");
  const navMenu = document.getElementById("nav-menu");
  const seedList = document.getElementById("seed-list");
  const currentSeedEl = document.getElementById("current-seed");

  const btnUndo = document.getElementById("btn-undo");
  const btnRedo = document.getElementById("btn-redo");
  const btnPencil = document.getElementById("btn-pencil");
  const btnZen = document.getElementById("btn-zen");
  const btnCat = document.getElementById("btn-companion-cat");
  const boardCat = document.getElementById("board-cat");

  const STATE_KEY = "sudoku-game";
  const SEED_KEY = "sudoku-seeds";
  const STATS_KEY = "sudoku-stats";
  const statsStartedEl = document.getElementById("stats-started");
  const statsCompletedEl = document.getElementById("stats-completed");
  const MAX_SEEDS = 10;
  const HISTORY_LIMIT = 10;
  const THEMES = ["dark", "light", "slate", "ocean", "dusk"];
  const DEFAULT_THEME = "dark";

  let puzzle = [];
  let solution = [];
  let given = [];
  let notes = [];
  let selected = null;
  let activeNumber = null;
  let pencilMode = false;
  let zenMode = false;
  let catCompanion = false;
  let timerInterval = null;
  let timerRunning = false;
  let animateBoardReveal = false;
  let saveInterval = null;
  let seconds = 0;
  let gameWon = false;
  let history = [];
  let future = [];
  let currentSeed = null;
  let currentDifficulty = null;
  let seedHistory = [];
  let settingsOpen = false;
  let menuOpen = false;
  let confirmCallback = null;
  let quoteSplashActive = false;
  let gamesStarted = 0;
  let gamesCompleted = 0;

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function waitForProceed() {
    return new Promise((resolve) => {
      const onProceed = () => {
        quoteProceed.removeEventListener("click", onProceed);
        resolve();
      };
      quoteProceed.addEventListener("click", onProceed);
    });
  }

  async function showQuoteSplash() {
    if (quoteSplashActive) return;
    quoteSplashActive = true;

    const quote = Quotes.nextQuote();
    quoteTextEl.textContent = quote.text;
    quoteAuthorEl.textContent = quote.attribution;

    quoteProceed.hidden = true;
    quoteProceed.classList.remove("is-visible");
    quoteSplash.hidden = false;
    quoteSplash.classList.remove("is-hiding");

    await wait(20);
    quoteSplash.classList.add("is-visible");

    await wait(QUOTE_BUTTON_DELAY_MS);
    quoteProceed.hidden = false;
    await wait(20);
    quoteProceed.classList.add("is-visible");

    await waitForProceed();

    quoteSplash.classList.add("is-hiding");
    quoteSplash.classList.remove("is-visible");
    quoteProceed.classList.remove("is-visible");
    appEl.classList.add("is-ready");

    await wait(QUOTE_FADE_MS);

    quoteSplash.hidden = true;
    quoteProceed.hidden = true;
    quoteSplash.classList.remove("is-hiding");
    quoteSplashActive = false;
  }

  function emptyNotes() {
    return Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => new Set())
    );
  }

  function cloneNotes(src) {
    return src.map((row) => row.map((set) => new Set(set)));
  }

  function serializeNotes() {
    return notes.map((row) => row.map((set) => [...set]));
  }

  function deserializeNotes(data) {
    return data.map((row) => row.map((arr) => new Set(arr)));
  }

  function snapshot() {
    return {
      puzzle: puzzle.map((row) => [...row]),
      notes: cloneNotes(notes),
    };
  }

  function serializeSnapshot(snap) {
    return {
      puzzle: snap.puzzle,
      notes: snap.notes.map((row) => row.map((set) => [...set])),
    };
  }

  function deserializeSnapshot(data) {
    return {
      puzzle: data.puzzle.map((row) => [...row]),
      notes: data.notes.map((row) => row.map((arr) => new Set(arr))),
    };
  }

  function serializeStack(stack) {
    return stack.map(serializeSnapshot);
  }

  function deserializeStack(data) {
    if (!Array.isArray(data)) return [];
    return data.slice(-HISTORY_LIMIT).map(deserializeSnapshot);
  }

  function trimStack(stack) {
    while (stack.length > HISTORY_LIMIT) stack.shift();
  }

  function applySnapshot(snap) {
    puzzle = snap.puzzle.map((row) => [...row]);
    notes = cloneNotes(snap.notes);
  }

  function pushHistory() {
    history.push(snapshot());
    trimStack(history);
    future = [];
    updateUndoRedo();
  }

  function updateUndoRedo() {
    btnUndo.disabled = history.length === 0 || gameWon;
    btnRedo.disabled = future.length === 0 || gameWon;
  }

  function undo() {
    if (!history.length || gameWon) return;
    future.push(snapshot());
    trimStack(future);
    applySnapshot(history.pop());
    clearErrors();
    setStatus("");
    renderBoard();
    updateUndoRedo();
    saveGame();
  }

  function redo() {
    if (!future.length || gameWon) return;
    history.push(snapshot());
    trimStack(history);
    applySnapshot(future.pop());
    clearErrors();
    setStatus("");
    renderBoard();
    updateUndoRedo();
    saveGame();
  }

  function setTheme(theme) {
    if (!THEMES.includes(theme)) theme = DEFAULT_THEME;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("sudoku-theme", theme);
    if (themeSelect) themeSelect.value = theme;
    Settings.onThemeChange();
  }

  function resetAppearance() {
    Settings.reset();
    setTheme(DEFAULT_THEME);
    if (settingsColors.childElementCount) {
      Settings.syncPanel(settingsColors);
    }
    saveGame();
  }

  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    navMenu.hidden = true;
    menuScrim.hidden = true;
    menuScrim.setAttribute("aria-hidden", "true");
    btnMenu.classList.remove("active");
    btnMenu.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    if (menuOpen) {
      closeMenu();
      return;
    }
    closeSettings();
    menuOpen = true;
    navMenu.hidden = false;
    menuScrim.hidden = false;
    menuScrim.setAttribute("aria-hidden", "false");
    btnMenu.classList.add("active");
    btnMenu.setAttribute("aria-expanded", "true");
  }

  function closeSettings() {
    if (!settingsOpen) return;
    settingsOpen = false;
    btnSettings.classList.remove("active");
    Settings.closeAllMenus();
    if (appearanceDialog.open) appearanceDialog.close();
  }

  function showConfirm(message, onConfirm) {
    confirmMessage.textContent = message;
    confirmCallback = onConfirm;
    confirmDialog.showModal();
  }

  function closeConfirm() {
    confirmCallback = null;
    confirmDialog.close();
  }

  function setZen(enabled) {
    zenMode = enabled;
    appEl.classList.toggle("zen", zenMode);
    btnZen.classList.toggle("active", zenMode);
    btnZenExit.classList.toggle("active", zenMode);
    btnZen.title = zenMode ? "Exit zen mode" : "Zen mode — focus on the puzzle";
    localStorage.setItem("sudoku-zen", zenMode ? "1" : "0");
    if (zenMode) {
      closeSettings();
      closeMenu();
    }
  }

  function setCatCompanion(enabled) {
    catCompanion = enabled;
    boardCat.hidden = !enabled;
    btnCat.classList.toggle("active", enabled);
    btnCat.title = enabled ? "Hide companion cat" : "Companion cat";
    localStorage.setItem("sudoku-cat", enabled ? "1" : "0");
  }

  function initPreferences() {
    const savedTheme = localStorage.getItem("sudoku-theme");
    setTheme(THEMES.includes(savedTheme) ? savedTheme : DEFAULT_THEME);
    setZen(localStorage.getItem("sudoku-zen") === "1");
    setCatCompanion(localStorage.getItem("sudoku-cat") === "1");
    Settings.load();
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
    startTimer(0);
  }

  function startAutoSave() {
    if (saveInterval) clearInterval(saveInterval);
    saveInterval = setInterval(saveGame, 15000);
  }

  function setStatus(msg, type = "") {
    statusEl.textContent = msg;
    statusEl.className = "status" + (type ? ` ${type}` : "");
  }

  function saveGame() {
    if (!puzzle.length || !solution.length) return;
    const state = {
      v: 1,
      puzzle,
      solution,
      given,
      notes: serializeNotes(),
      seed: currentSeed,
      difficulty: currentDifficulty,
      seconds,
      gameWon,
      pencilMode,
      activeNumber,
      selected,
      difficultyPref: difficultyEl.value,
      history: serializeStack(history),
      future: serializeStack(future),
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
      if (state.v !== 1 || !Array.isArray(state.puzzle) || state.puzzle.length !== 9) {
        return false;
      }

      puzzle = state.puzzle.map((row) => [...row]);
      solution = state.solution.map((row) => [...row]);
      given = state.given.map((row) => [...row]);
      notes = deserializeNotes(state.notes);
      currentSeed = state.seed;
      currentDifficulty = state.difficulty;
      seconds = state.seconds || 0;
      gameWon = !!state.gameWon;
      pencilMode = !!state.pencilMode;
      activeNumber = state.activeNumber ?? null;
      selected = state.selected ?? null;
      history = deserializeStack(state.history);
      future = deserializeStack(state.future);

      if (state.difficultyPref) difficultyEl.value = state.difficultyPref;

      btnPencil.classList.toggle("active", pencilMode);
      if (gameWon) setStatus("Solved!", "ok");
      else setStatus("");

      renderBoard();
      if (gameWon) {
        timerEl.textContent = formatTime(seconds);
        timerRunning = false;
      } else if (seconds > 0) {
        startTimer(seconds);
      } else {
        resetTimer();
      }
      updateUndoRedo();
      return true;
    } catch {
      return false;
    }
  }

  function cellTitle(row, col) {
    const parts = [];
    if (given[row][col]) {
      parts.push(`Given ${puzzle[row][col]}`);
    } else if (puzzle[row][col]) {
      parts.push(`Your entry: ${puzzle[row][col]}`);
    } else if (notes[row][col].size) {
      parts.push(`Notes: ${[...notes[row][col]].sort().join(", ")}`);
    } else {
      parts.push("Empty cell");
    }
    if (!given[row][col] && !gameWon) {
      if (pencilMode && activeNumber) {
        parts.push(`Pencil ${activeNumber} — click to mark`);
      } else if (pencilMode) {
        parts.push("Pencil mode — pick a number first");
      } else {
        parts.push("Tap a number to fill");
      }
    }
    return parts.join(" · ");
  }

  function buildNumpad() {
    numpadEl.innerHTML = "";
    for (let n = 1; n <= 9; n++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn";
      btn.textContent = n;
      btn.dataset.num = n;
      btn.title = `Select ${n}`;
      btn.addEventListener("click", () => onNumpadClick(n));
      numpadEl.appendChild(btn);
    }
  }

  function getHighlightNumber() {
    return activeNumber;
  }

  function blockedCellsForNumber(num) {
    const blocked = new Set();
    if (!num) return blocked;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle[r][c] === 0 && !Sudoku.isValid(puzzle, r, c, num)) {
          blocked.add(`${r},${c}`);
        }
      }
    }
    return blocked;
  }

  function countRemaining(num) {
    let count = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle[r][c] === num) count++;
      }
    }
    return 9 - count;
  }

  function updateNumpad() {
    const hl = getHighlightNumber();
    numpadEl.querySelectorAll(".btn").forEach((btn) => {
      const num = +btn.dataset.num;
      btn.classList.toggle("active", hl === num);
      btn.classList.toggle("exhausted", countRemaining(num) === 0);
    });
  }

  function renderNotes(cellEl, row, col) {
    const grid = document.createElement("div");
    grid.className = "notes";
    for (let n = 1; n <= 9; n++) {
      const span = document.createElement("span");
      span.className = "note";
      if (notes[row][col].has(n)) {
        span.textContent = n;
      }
      grid.appendChild(span);
    }
    cellEl.appendChild(grid);
  }

  function renderBoard() {
    boardEl.innerHTML = "";
    const hlNum = getHighlightNumber();
    const blocked = blockedCellsForNumber(hlNum);

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "cell";
        btn.setAttribute("role", "gridcell");
        btn.title = cellTitle(r, c);

        if (c === 2 || c === 5) btn.classList.add("box-right");
        if (r === 2 || r === 5) btn.classList.add("box-bottom");

        const val = puzzle[r][c];
        if (val !== 0) {
          btn.textContent = val;
        } else if (notes[r][c].size) {
          renderNotes(btn, r, c);
        }

        if (given[r][c]) btn.classList.add("given");

        if (selected && selected.row === r && selected.col === c) {
          btn.classList.add("selected");
        }

        if (hlNum && blocked.has(`${r},${c}`)) {
          btn.classList.add("blocked");
        }

        if (animateBoardReveal) {
          btn.classList.add("cell-reveal");
          btn.style.animationDelay = `${(r * 9 + c) * 6}ms`;
        }

        btn.addEventListener("click", () => selectCell(r, c));
        btn.addEventListener("mouseenter", () => {
          if (!gameWon) btn.title = cellTitle(r, c);
        });

        boardEl.appendChild(btn);
      }
    }
    if (animateBoardReveal) animateBoardReveal = false;
    updateNumpad();
  }

  function onNumpadClick(num) {
    if (pencilMode) {
      activeNumber = activeNumber === num ? null : num;
      renderBoard();
      saveGame();
      return;
    }

    if (activeNumber === num) {
      activeNumber = null;
      renderBoard();
      saveGame();
      return;
    }

    if (
      selected &&
      !gameWon &&
      !given[selected.row][selected.col] &&
      puzzle[selected.row][selected.col] === 0
    ) {
      placeNumber(num);
      return;
    }

    activeNumber = num;
    renderBoard();
    saveGame();
  }

  function toggleNoteAt(row, col, num) {
    if (given[row][col] || puzzle[row][col] !== 0 || gameWon) return;
    pushHistory();
    if (notes[row][col].has(num)) notes[row][col].delete(num);
    else notes[row][col].add(num);
    ensureTimerRunning();
    clearErrors();
    renderBoard();
    saveGame();
  }

  function selectCell(row, col) {
    if (gameWon) return;

    if (pencilMode && activeNumber && !given[row][col] && puzzle[row][col] === 0) {
      selected = { row, col };
      toggleNoteAt(row, col, activeNumber);
      return;
    }

    if (selected && selected.row === row && selected.col === col) {
      selected = null;
      activeNumber = null;
      clearErrors();
      renderBoard();
      saveGame();
      return;
    }

    selected = { row, col };
    if (!pencilMode) {
      const val = puzzle[row][col];
      activeNumber = val || null;
    }
    clearErrors();
    renderBoard();
    saveGame();
  }

  function clearErrors() {
    boardEl.querySelectorAll(".cell.error").forEach((el) => {
      el.classList.remove("error");
    });
  }

  function clearNotesAt(row, col) {
    notes[row][col].clear();
  }

  function removeNoteFromPeers(row, col, num) {
    for (let i = 0; i < 9; i++) {
      notes[row][i].delete(num);
      notes[i][col].delete(num);
    }
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) {
        notes[r][c].delete(num);
      }
    }
  }

  function placeNumber(num) {
    if (!selected || given[selected.row][selected.col] || gameWon) return;
    const { row, col } = selected;

    if (pencilMode) {
      activeNumber = num;
      if (puzzle[row][col] === 0) toggleNoteAt(row, col, num);
      else {
        renderBoard();
        saveGame();
      }
      return;
    }

    pushHistory();
    puzzle[row][col] = num;
    clearNotesAt(row, col);
    removeNoteFromPeers(row, col, num);
    activeNumber = num;
    ensureTimerRunning();
    clearErrors();
    renderBoard();
    checkWin();
    saveGame();
  }

  function eraseCell() {
    if (!selected || given[selected.row][selected.col] || gameWon) return;
    const { row, col } = selected;
    if (puzzle[row][col] === 0 && notes[row][col].size === 0) return;

    pushHistory();
    puzzle[row][col] = 0;
    notes[row][col].clear();
    ensureTimerRunning();
    clearErrors();
    renderBoard();
    setStatus("");
    saveGame();
  }

  function togglePencil() {
    pencilMode = !pencilMode;
    btnPencil.classList.toggle("active", pencilMode);
    if (selected) renderBoard();
    saveGame();
  }

  function notesDiffer(a, b) {
    if (a.size !== b.size) return true;
    for (const n of a) {
      if (!b.has(n)) return true;
    }
    return false;
  }

  function fillAllPencil() {
    if (gameWon) return;

    const nextNotes = emptyNotes();
    let changed = false;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (given[r][c] || puzzle[r][c] !== 0) continue;
        for (let n = 1; n <= 9; n++) {
          if (Sudoku.isValid(puzzle, r, c, n)) nextNotes[r][c].add(n);
        }
        if (notesDiffer(notes[r][c], nextNotes[r][c])) changed = true;
      }
    }

    if (!changed) return;

    pushHistory();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!given[r][c] && puzzle[r][c] === 0) {
          notes[r][c] = new Set(nextNotes[r][c]);
        }
      }
    }

    ensureTimerRunning();
    clearErrors();
    renderBoard();
    saveGame();
  }

  function clearAllPencil() {
    if (gameWon) return;

    let changed = false;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (notes[r][c].size) changed = true;
      }
    }
    if (!changed) return;

    pushHistory();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        notes[r][c].clear();
      }
    }

    ensureTimerRunning();
    clearErrors();
    renderBoard();
    saveGame();
  }

  function restartGame() {
    if (!puzzle.length) return;

    closeMenu();
    gameWon = false;
    selected = null;
    activeNumber = null;
    history = [];
    future = [];

    clearErrors();
    setStatus("");
    boardWrap.classList.add("is-clearing");
    setTimeout(() => {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (!given[r][c]) puzzle[r][c] = 0;
        }
      }
      notes = emptyNotes();
      renderBoard();
      boardWrap.classList.remove("is-clearing");
      resetTimer();
      updateUndoRedo();
      saveGame();
    }, 220);
  }

  function showErrors(errorSet) {
    errorSet.forEach((key) => {
      const [r, c] = key.split(",").map(Number);
      const idx = r * 9 + c;
      const cell = boardEl.children[idx];
      if (cell) cell.classList.add("error");
    });
  }

  function checkSolution() {
    if (gameWon) return;

    const errors = Sudoku.findErrors(puzzle, solution);
    if (errors.size > 0) {
      showErrors(errors);
      setStatus(`${errors.size} mistake${errors.size > 1 ? "s" : ""}`, "err");
      return;
    }

    if (!Sudoku.isComplete(puzzle)) {
      setStatus("No mistakes so far", "ok");
      return;
    }

    winGame();
  }

  function checkWin() {
    if (!Sudoku.isComplete(puzzle)) return;
    const errors = Sudoku.findErrors(puzzle, solution);
    if (errors.size === 0) winGame();
  }

  function winGame() {
    gameWon = true;
    stopTimer();
    timerRunning = false;
    recordGameCompleted();
    setStatus("Solved!", "ok");
    updateUndoRedo();
    saveGame();
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
      seedHistory = JSON.parse(localStorage.getItem(SEED_KEY) || "[]");
    } catch {
      seedHistory = [];
    }
  }

  function saveSeedHistory() {
    localStorage.setItem(SEED_KEY, JSON.stringify(seedHistory));
  }

  function recordSeed(seed, difficulty) {
    currentSeed = seed;
    currentDifficulty = difficulty;
    seedHistory = seedHistory.filter((e) => e.seed !== seed);
    seedHistory.unshift({ seed, difficulty, at: Date.now() });
    if (seedHistory.length > MAX_SEEDS) seedHistory.length = MAX_SEEDS;
    saveSeedHistory();
  }

  function renderSeeds() {
    currentSeedEl.textContent = currentSeed
      ? `${currentSeed} · ${currentDifficulty}`
      : "—";

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
      if (entry.seed === currentSeed) li.classList.add("current");
      li.title = new Date(entry.at).toLocaleString();
      seedList.appendChild(li);
    });
  }

  function openSeeds() {
    closeMenu();
    renderSeeds();
    seedsDialog.showModal();
  }

  function applyGameResult(result) {
    puzzle = result.puzzle.map((row) => [...row]);
    solution = result.solution;
    given = result.given;
    notes = emptyNotes();
    recordSeed(result.seed, result.difficulty);
  }

  async function newGame({ skipQuote = false } = {}) {
    closeMenu();
    gameWon = false;
    selected = null;
    activeNumber = null;
    history = [];
    future = [];
    setStatus("");

    if (!skipQuote) {
      await showQuoteSplash();
    }

    const difficulty = difficultyEl.value;
    boardWrap.classList.add("is-clearing");

    await wait(260);

    applyGameResult(Sudoku.generate(difficulty));
    recordGameStarted();
    animateBoardReveal = true;
    renderBoard();
    boardWrap.classList.remove("is-clearing");
    resetTimer();
    setStatus("");
    updateUndoRedo();
    saveGame();
  }

  function fillLessons(container, lessons) {
    container.innerHTML = "";
    lessons.forEach((lesson) => {
      const article = document.createElement("article");
      article.className = "lesson";
      article.innerHTML = `<h3>${lesson.title}</h3><p>${lesson.body}</p>`;
      container.appendChild(article);
    });
  }

  function switchLessonTab(tab) {
    const isBasics = tab === "basics";
    document.getElementById("tab-basics").classList.toggle("active", isBasics);
    document.getElementById("tab-advanced").classList.toggle("active", !isBasics);
    document.getElementById("tab-basics").setAttribute("aria-selected", isBasics);
    document.getElementById("tab-advanced").setAttribute("aria-selected", !isBasics);
    lessonsBasics.hidden = !isBasics;
    lessonsAdvanced.hidden = isBasics;
  }

  function openLessons() {
    closeMenu();
    if (!lessonsBasics.childElementCount) {
      fillLessons(lessonsBasics, LessonsBasics);
      fillLessons(lessonsAdvanced, LessonsAdvanced);
    }
    switchLessonTab("basics");
    lessonsDialog.showModal();
  }

  function toggleSettings() {
    if (settingsOpen) {
      closeSettings();
      return;
    }
    closeMenu();
    settingsOpen = true;
    btnSettings.classList.add("active");
    if (!settingsColors.childElementCount) {
      Settings.buildPanel(settingsColors);
    } else {
      Settings.syncPanel(settingsColors);
    }
    appearanceDialog.showModal();
  }

  function handleKeydown(e) {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
        e.preventDefault();
        redo();
        return;
      }
    }

    if (e.key === "p" && !e.ctrlKey && !e.metaKey) {
      togglePencil();
      return;
    }

    if (gameWon) return;

    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= 9) {
      onNumpadClick(num);
      return;
    }

    if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
      eraseCell();
      return;
    }

    if (!selected) return;

    const { row, col } = selected;
    let nr = row;
    let nc = col;

    switch (e.key) {
      case "ArrowUp":
        nr = Math.max(0, row - 1);
        break;
      case "ArrowDown":
        nr = Math.min(8, row + 1);
        break;
      case "ArrowLeft":
        nc = Math.max(0, col - 1);
        break;
      case "ArrowRight":
        nc = Math.min(8, col + 1);
        break;
      default:
        return;
    }

    e.preventDefault();
    selectCell(nr, nc);
  }

  themeSelect.addEventListener("change", () => {
    setTheme(themeSelect.value);
    saveGame();
  });
  btnMenu.addEventListener("click", toggleMenu);
  btnZen.addEventListener("click", () => {
    setZen(true);
    saveGame();
  });
  btnZenExit.addEventListener("click", () => {
    setZen(false);
    saveGame();
  });
  document.getElementById("btn-new").addEventListener("click", newGame);
  document.getElementById("btn-restart").addEventListener("click", restartGame);
  document.getElementById("btn-check").addEventListener("click", checkSolution);
  document.getElementById("btn-erase").addEventListener("click", eraseCell);
  document.getElementById("btn-pencil").addEventListener("click", togglePencil);
  document.getElementById("btn-pencil-fill").addEventListener("click", () => {
    showConfirm("Fill every empty cell with valid pencil marks?", () => fillAllPencil());
  });
  document.getElementById("btn-pencil-clear").addEventListener("click", () => {
    showConfirm("Clear all pencil marks from the board?", () => clearAllPencil());
  });
  confirmOk.addEventListener("click", () => {
    const action = confirmCallback;
    closeConfirm();
    if (action) action();
  });
  confirmCancel.addEventListener("click", closeConfirm);
  confirmDialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    closeConfirm();
  });
  menuScrim.addEventListener("click", closeMenu);
  btnCat.addEventListener("click", () => setCatCompanion(!catCompanion));
  document.getElementById("btn-lessons").addEventListener("click", openLessons);
  document.getElementById("btn-seeds").addEventListener("click", openSeeds);
  btnSettings.addEventListener("click", toggleSettings);
  document.getElementById("settings-close").addEventListener("click", closeSettings);
  appearanceDialog.addEventListener("click", (e) => {
    if (e.target === appearanceDialog) closeSettings();
  });
  appearanceDialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    closeSettings();
  });
  document.getElementById("lessons-close").addEventListener("click", () => lessonsDialog.close());
  document.getElementById("seeds-close").addEventListener("click", () => seedsDialog.close());
  lessonsDialog.addEventListener("click", (e) => {
    if (e.target === lessonsDialog) lessonsDialog.close();
  });
  seedsDialog.addEventListener("click", (e) => {
    if (e.target === seedsDialog) seedsDialog.close();
  });
  document.addEventListener("click", (e) => {
    if (
      menuOpen &&
      !e.target.closest("#nav-menu") &&
      !e.target.closest("#btn-menu") &&
      !e.target.closest("#btn-zen")
    ) {
      closeMenu();
    }
  });
  document.addEventListener("sudoku:reset-appearance", resetAppearance);
  document.querySelectorAll(".dialog-tabs .tab").forEach((tab) => {
    tab.addEventListener("click", () => switchLessonTab(tab.dataset.tab));
  });
  btnUndo.addEventListener("click", undo);
  btnRedo.addEventListener("click", redo);
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") saveGame();
  });
  window.addEventListener("beforeunload", saveGame);

  async function boot() {
    initPreferences();
    loadStats();
    loadSeedHistory();
    buildNumpad();
    startAutoSave();

    await showQuoteSplash();

    if (!tryLoadGame()) {
      await newGame({ skipQuote: true });
    }
  }

  boot();
})();
