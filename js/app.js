(() => {
  const boardEl = document.getElementById("board");
  const numpadEl = document.getElementById("numpad");
  const statusEl = document.getElementById("status");
  const timerEl = document.getElementById("timer");
  const difficultyEl = document.getElementById("difficulty");
  const themeToggle = document.getElementById("theme-toggle");

  let puzzle = [];
  let solution = [];
  let given = [];
  let selected = null;
  let timerInterval = null;
  let seconds = 0;
  let gameWon = false;

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("sudoku-theme", theme);
  }

  function initTheme() {
    const saved = localStorage.getItem("sudoku-theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
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

  function buildNumpad() {
    numpadEl.innerHTML = "";
    for (let n = 1; n <= 9; n++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn";
      btn.textContent = n;
      btn.dataset.num = n;
      btn.addEventListener("click", () => placeNumber(n));
      numpadEl.appendChild(btn);
    }
  }

  function cellKey(row, col) {
    return `${row},${col}`;
  }

  function getValue(row, col) {
    return puzzle[row][col];
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
    numpadEl.querySelectorAll(".btn").forEach((btn) => {
      const num = +btn.dataset.num;
      btn.classList.toggle("exhausted", countRemaining(num) === 0);
    });
  }

  function renderBoard() {
    boardEl.innerHTML = "";
    const highlightValue =
      selected !== null ? getValue(selected.row, selected.col) : 0;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "cell";
        btn.setAttribute("role", "gridcell");
        btn.dataset.row = r;
        btn.dataset.col = c;

        if (c === 2 || c === 5) btn.classList.add("box-right");
        if (r === 2 || r === 5) btn.classList.add("box-bottom");

        const val = puzzle[r][c];
        if (val !== 0) btn.textContent = val;

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

        if (highlightValue && val === highlightValue) {
          btn.classList.add("same-value");
        }

        btn.addEventListener("click", () => selectCell(r, c));

        boardEl.appendChild(btn);
      }
    }
    updateNumpad();
  }

  function selectCell(row, col) {
    if (gameWon) return;
    selected = { row, col };
    renderBoard();
    clearErrors();
  }

  function clearErrors() {
    boardEl.querySelectorAll(".cell.error").forEach((el) => {
      el.classList.remove("error");
    });
  }

  function placeNumber(num) {
    if (!selected || given[selected.row][selected.col] || gameWon) return;
    puzzle[selected.row][selected.col] = num;
    clearErrors();
    renderBoard();
    checkWin();
  }

  function eraseCell() {
    if (!selected || given[selected.row][selected.col] || gameWon) return;
    puzzle[selected.row][selected.col] = 0;
    clearErrors();
    renderBoard();
    setStatus("");
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
  }

  function newGame() {
    gameWon = false;
    selected = null;
    setStatus("");

    const difficulty = difficultyEl.value;
    setStatus("Generating…");
    boardEl.style.opacity = "0.5";

    setTimeout(() => {
      const result = Sudoku.generate(difficulty);
      puzzle = result.puzzle.map((row) => [...row]);
      solution = result.solution;
      given = result.given;
      boardEl.style.opacity = "";
      setStatus("");
      renderBoard();
      startTimer();
    }, 10);
  }

  function handleKeydown(e) {
    if (gameWon) return;

    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= 9) {
      placeNumber(num);
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

  document.getElementById("btn-new").addEventListener("click", newGame);
  document.getElementById("btn-check").addEventListener("click", checkSolution);
  document.getElementById("btn-erase").addEventListener("click", eraseCell);
  document.addEventListener("keydown", handleKeydown);

  initTheme();
  buildNumpad();
  newGame();
})();
