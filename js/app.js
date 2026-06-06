(() => {
  const boardEl = document.getElementById("board");
  const numpadEl = document.getElementById("numpad");
  const statusEl = document.getElementById("status");
  const timerEl = document.getElementById("timer");
  const difficultyEl = document.getElementById("difficulty");
  const themeToggle = document.getElementById("theme-toggle");
  const appEl = document.querySelector(".app");
  const lessonsDialog = document.getElementById("lessons-dialog");
  const lessonsContent = document.getElementById("lessons-content");

  const btnUndo = document.getElementById("btn-undo");
  const btnRedo = document.getElementById("btn-redo");
  const btnPencil = document.getElementById("btn-pencil");
  const btnZen = document.getElementById("btn-zen");
  const seedPanel = document.getElementById("seed-panel");
  const seedList = document.getElementById("seed-list");
  const currentSeedEl = document.getElementById("current-seed");

  const SEED_KEY = "sudoku-seeds";
  const MAX_SEEDS = 10;

  let puzzle = [];
  let solution = [];
  let given = [];
  let notes = [];
  let selected = null;
  let activeNumber = null;
  let pencilMode = false;
  let zenMode = false;
  let timerInterval = null;
  let seconds = 0;
  let gameWon = false;
  let history = [];
  let future = [];
  let currentSeed = null;
  let currentDifficulty = null;
  let seedHistory = [];

  function emptyNotes() {
    return Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => new Set())
    );
  }

  function cloneNotes(src) {
    return src.map((row) => row.map((set) => new Set(set)));
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
  }

  function redo() {
    if (!future.length || gameWon) return;
    history.push(snapshot());
    applySnapshot(future.pop());
    clearErrors();
    setStatus("");
    renderBoard();
    updateUndoRedo();
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("sudoku-theme", theme);
  }

  function setZen(enabled) {
    zenMode = enabled;
    appEl.classList.toggle("zen", zenMode);
    btnZen.classList.toggle("active", zenMode);
    localStorage.setItem("sudoku-zen", zenMode ? "1" : "0");
  }

  function initPreferences() {
    const savedTheme = localStorage.getItem("sudoku-theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
    setZen(localStorage.getItem("sudoku-zen") === "1");
  }

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  function startTimer() {
    stopTimer();
    seconds = 0;
    timerEl.textContent = formatTime(0);
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

  function setStatus(msg, type = "") {
    statusEl.textContent = msg;
    statusEl.className = "status" + (type ? ` ${type}` : "");
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
    if (activeNumber) return activeNumber;
    if (selected) return puzzle[selected.row][selected.col] || null;
    return null;
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
      return;
    }
    if (selected && !gameWon && !given[selected.row][selected.col]) {
      placeNumber(num);
      return;
    }
    activeNumber = activeNumber === num ? null : num;
    renderBoard();
  }

  function toggleNoteAt(row, col, num) {
    if (given[row][col] || puzzle[row][col] !== 0 || gameWon) return;
    pushHistory();
    if (notes[row][col].has(num)) notes[row][col].delete(num);
    else notes[row][col].add(num);
    clearErrors();
    renderBoard();
  }

  function selectCell(row, col) {
    if (gameWon) return;
    selected = { row, col };

    if (pencilMode && activeNumber && !given[row][col] && puzzle[row][col] === 0) {
      toggleNoteAt(row, col, activeNumber);
      return;
    }

    const val = puzzle[row][col];
    if (val && !pencilMode) activeNumber = val;
    clearErrors();
    renderBoard();
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
      else renderBoard();
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
  }

  function togglePencil() {
    pencilMode = !pencilMode;
    btnPencil.classList.toggle("active", pencilMode);
    if (selected) renderBoard();
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
    renderSeeds();
  }

  function renderSeeds() {
    currentSeedEl.textContent = currentSeed
      ? `${currentSeed} · ${currentDifficulty}`
      : "—";

    seedList.innerHTML = "";
    seedHistory.forEach((entry) => {
      const li = document.createElement("li");
      li.textContent = `${entry.seed} · ${entry.difficulty}`;
      if (entry.seed === currentSeed) li.classList.add("current");
      li.title = new Date(entry.at).toLocaleString();
      seedList.appendChild(li);
    });
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
      const result = Sudoku.generate(difficulty);
      puzzle = result.puzzle.map((row) => [...row]);
      solution = result.solution;
      given = result.given;
      notes = emptyNotes();
      recordSeed(result.seed, result.difficulty);
      boardEl.style.opacity = "";
      setStatus("");
      renderBoard();
      startTimer();
      updateUndoRedo();
    }, 10);
  }

  function openLessons() {
    if (!lessonsContent.childElementCount) {
      Lessons.forEach((lesson) => {
        const article = document.createElement("article");
        article.className = "lesson";
        article.innerHTML = `<h3>${lesson.title}</h3><p>${lesson.body}</p>`;
        lessonsContent.appendChild(article);
      });
    }
    lessonsDialog.showModal();
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

  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "light" : "dark");
  });

  btnZen.addEventListener("click", () => setZen(!zenMode));
  document.getElementById("btn-new").addEventListener("click", newGame);
  document.getElementById("btn-check").addEventListener("click", checkSolution);
  document.getElementById("btn-erase").addEventListener("click", eraseCell);
  document.getElementById("btn-pencil").addEventListener("click", togglePencil);
  document.getElementById("btn-lessons").addEventListener("click", openLessons);
  document.getElementById("lessons-close").addEventListener("click", () => lessonsDialog.close());
  lessonsDialog.addEventListener("click", (e) => {
    if (e.target === lessonsDialog) lessonsDialog.close();
  });
  btnUndo.addEventListener("click", undo);
  btnRedo.addEventListener("click", redo);
  document.addEventListener("keydown", handleKeydown);

  initPreferences();
  loadSeedHistory();
  renderSeeds();
  buildNumpad();
  newGame();
})();
