(() => {
  const GAMES = ["sudoku", "mahjong"];
  const TITLES = {
    sudoku: "Magic Sudoku",
    mahjong: "Magic Mahjong",
  };

  const titleEl = document.getElementById("game-title");
  const btnPrev = document.getElementById("game-prev");
  const btnNext = document.getElementById("game-next");
  const appEl = document.querySelector(".app");
  const sudokuPanel = document.getElementById("sudoku-panel");
  const mahjongPanel = document.getElementById("mahjong-panel");
  const STORAGE_KEY = "magic-active-game";

  let active = localStorage.getItem(STORAGE_KEY) || "sudoku";
  if (!GAMES.includes(active)) active = "sudoku";

  function gameIndex(id) {
    return GAMES.indexOf(id);
  }

  function applyVisibility() {
    appEl.dataset.game = active;
    window.Games.active = active;
    document.title = TITLES[active];
    titleEl.textContent = TITLES[active];

    sudokuPanel.hidden = active !== "sudoku";
    mahjongPanel.hidden = active !== "mahjong";

    btnPrev.disabled = GAMES.length <= 1;
    btnNext.disabled = GAMES.length <= 1;
  }

  function switchTo(gameId) {
    if (!GAMES.includes(gameId) || gameId === active) return;

    if (active === "sudoku" && typeof window.SudokuApp?.saveGame === "function") {
      window.SudokuApp.saveGame();
    }
    if (active === "mahjong" && typeof window.MahjongApp?.saveGame === "function") {
      window.MahjongApp.saveGame();
    }

    active = gameId;
    localStorage.setItem(STORAGE_KEY, active);
    applyVisibility();

    if (active === "mahjong") {
      window.MahjongApp?.init?.();
    }
  }

  function cycle(delta) {
    const idx = gameIndex(active);
    const next = GAMES[(idx + delta + GAMES.length) % GAMES.length];
    switchTo(next);
  }

  btnPrev?.addEventListener("click", () => cycle(-1));
  btnNext?.addEventListener("click", () => cycle(1));

  window.Games = {
    active,
    switchTo,
    isSudoku: () => active === "sudoku",
    isMahjong: () => active === "mahjong",
  };

  applyVisibility();
  if (active === "mahjong") {
    window.MahjongApp?.init?.();
  }
})();
