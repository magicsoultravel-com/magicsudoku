(() => {
  const boardEl = document.getElementById("board");
  const numpadEl = document.getElementById("numpad");
  const statusEl = document.getElementById("status");
  const timerEl = document.getElementById("timer");
  const difficultyEl = document.getElementById("difficulty");
  const themeSelect = document.getElementById("theme-select");
  const appEl = document.querySelector(".app");
  const lessonsDialog = document.getElementById("lessons-dialog");
  const lessonsBasics = document.getElementById("lessons-basics");
  const lessonsAdvanced = document.getElementById("lessons-advanced");
  const seedsDialog = document.getElementById("seeds-dialog");
  const settingsPanel = document.getElementById("settings-panel");
  const settingsColors = document.getElementById("settings-colors");
  const btnSettings = document.getElementById("btn-settings");
  const seedList = document.getElementById("seed-list");
  const currentSeedEl = document.getElementById("current-seed");

  const btnUndo = document.getElementById("btn-undo");
  const btnRedo = document.getElementById("btn-redo");
  const btnPencil = document.getElementById("btn-pencil");
  const btnZen = document.getElementById("btn-zen");

  const STATE_KEY = "sudoku-game";
  const SEED_KEY = "sudoku-seeds";
  const MAX_SEEDS = 10;
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
  let timerInterval = null;
  let saveInterval = null;
  let seconds = 0;
  let gameWon = false;
  let history = [];
  let future = [];
  let currentSeed = null;
  let currentDifficulty = null;
  let seedHistory = [];
  let settingsOpen = false;

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

  function applySnapshot(snap) {
    puzzle = snap.puzzle.map((row) => [...row]);
    notes = cloneNotes(snap.notes);
  }

  function pushHistory() {
    history.push(snapshot());
    if (history.length > 120) history.shift();
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

  function closeSettings() {
    if (!settingsOpen) return;
    settingsOpen = false;
    settingsPanel.hidden = true;
    appEl.classList.remove("settings-open");
    btnSettings.classList.remove("active");
    Settings.closeAllMenus();
  }

  function setZen(enabled) {
    zenMode = enabled;
    appEl.classList.toggle("zen", zenMode);
    btnZen.classList.toggle("active", zenMode);
    btnZen.title = zenMode ? "Exit zen mode" : "Zen mode — focus on the puzzle";
    localStorage.setItem("sudoku-zen", zenMode ? "1" : "0");
    if (zenMode) closeSettings();
  }

  function initPreferences() {
    const savedTheme = localStorage.getItem("sudoku-theme");
    setTheme(THEMES.includes(savedTheme) ? savedTheme : DEFAULT_THEME);
    setZen(localStorage.getItem("sudoku-zen") === "1");
    Settings.load();
  }

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  function startTimer(fromSeconds = 0) {
    stopTimer();
    seconds = fromSeconds;
    timerEl.textContent = formatTime(seconds);
    if (gameWon) return;
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
      history = [];
      future = [];

      if (state.difficultyPref) difficultyEl.value = state.difficultyPref;

      btnPencil.classList.toggle("active", pencilMode);
      if (gameWon) setStatus("Solved!", "ok");
      else setStatus("");

      renderBoard();
      startTimer(seconds);
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
      btn.title = `Highlight all ${n}s`;
      btn.addEventListener("click", () => onNumpadClick(n));
      numpadEl.appendChild(btn);
    }
  }

  function getHighlightNumber() {
    return activeNumber;
  }

  function linesForValue(num) {
    const rows = new Set();
    const cols = new Set();
    if (!num) return { rows, cols };
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle[r][c] === num) {
          rows.add(r);
          cols.add(c);
        }
      }
    }
    return { rows, cols };
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
    const hl = getHighlightNumber();
    for (let n = 1; n <= 9; n++) {
      const span = document.createElement("span");
      span.className = "note";
      if (notes[row][col].has(n)) {
        span.textContent = n;
        if (hl === n) span.classList.add("active");
      }
      grid.appendChild(span);
    }
    cellEl.appendChild(grid);
  }

  function renderBoard() {
    boardEl.innerHTML = "";
    const hlNum = getHighlightNumber();
    const { rows: hlRows, cols: hlCols } = linesForValue(hlNum);

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
        } else if (selected) {
          const sameRow = selected.row === r;
          const sameCol = selected.col === c;
          const sameBox =
            Math.floor(selected.row / 3) === Math.floor(r / 3) &&
            Math.floor(selected.col / 3) === Math.floor(c / 3);
          if (sameRow || sameCol || sameBox) btn.classList.add("peer");
        }

        if (hlNum && val === hlNum) {
          btn.classList.add("value-match");
        }

        if (hlNum && val !== hlNum && (hlRows.has(r) || hlCols.has(c))) {
          btn.classList.add("value-line");
        }

        btn.addEventListener("click", () => selectCell(r, c));
        btn.addEventListener("mouseenter", () => {
          if (!gameWon) btn.title = cellTitle(r, c);
        });

        boardEl.appendChild(btn);
      }
    }
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
    setStatus("Solved!", "ok");
    updateUndoRedo();
    saveGame();
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

  function newGame() {
    gameWon = false;
    selected = null;
    activeNumber = null;
    history = [];
    future = [];
    setStatus("");

    const difficulty = difficultyEl.value;
    setStatus("Generating…");
    boardEl.style.opacity = "0.5";

    setTimeout(() => {
      applyGameResult(Sudoku.generate(difficulty));
      boardEl.style.opacity = "";
      setStatus("");
      renderBoard();
      startTimer(0);
      updateUndoRedo();
      saveGame();
    }, 10);
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
    settingsOpen = true;
    settingsPanel.hidden = false;
    appEl.classList.add("settings-open");
    btnSettings.classList.add("active");
    if (!settingsColors.childElementCount) {
      Settings.buildPanel(settingsColors);
    } else {
      Settings.syncPanel(settingsColors);
    }
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
  btnZen.addEventListener("click", () => {
    setZen(!zenMode);
    saveGame();
  });
  document.getElementById("btn-new").addEventListener("click", newGame);
  document.getElementById("btn-check").addEventListener("click", checkSolution);
  document.getElementById("btn-erase").addEventListener("click", eraseCell);
  document.getElementById("btn-pencil").addEventListener("click", togglePencil);
  document.getElementById("btn-lessons").addEventListener("click", openLessons);
  document.getElementById("btn-seeds").addEventListener("click", openSeeds);
  btnSettings.addEventListener("click", toggleSettings);
  document.getElementById("lessons-close").addEventListener("click", () => lessonsDialog.close());
  document.getElementById("seeds-close").addEventListener("click", () => seedsDialog.close());
  lessonsDialog.addEventListener("click", (e) => {
    if (e.target === lessonsDialog) lessonsDialog.close();
  });
  seedsDialog.addEventListener("click", (e) => {
    if (e.target === seedsDialog) seedsDialog.close();
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

  initPreferences();
  loadSeedHistory();
  buildNumpad();
  startAutoSave();

  if (!tryLoadGame()) {
    newGame();
  }
})();
