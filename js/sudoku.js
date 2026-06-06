const Sudoku = (() => {
  const SIZE = 9;
  const BOX = 3;

  const CLUES = { easy: 40, medium: 32, hard: 26 };

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function emptyGrid() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  }

  function cloneGrid(grid) {
    return grid.map((row) => [...row]);
  }

  function isValid(grid, row, col, num) {
    for (let i = 0; i < SIZE; i++) {
      if (grid[row][i] === num || grid[i][col] === num) return false;
    }
    const br = Math.floor(row / BOX) * BOX;
    const bc = Math.floor(col / BOX) * BOX;
    for (let r = br; r < br + BOX; r++) {
      for (let c = bc; c < bc + BOX; c++) {
        if (grid[r][c] === num) return false;
      }
    }
    return true;
  }

  function fillBox(grid, row, col) {
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let i = 0;
    for (let r = row; r < row + BOX; r++) {
      for (let c = col; c < col + BOX; c++) {
        grid[r][c] = nums[i++];
      }
    }
  }

  function fillDiagonal(grid) {
    for (let i = 0; i < SIZE; i += BOX) {
      fillBox(grid, i, i);
    }
  }

  function solve(grid) {
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        if (grid[row][col] !== 0) continue;
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (solve(grid)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
    return true;
  }

  function countSolutions(grid, limit = 2) {
    let count = 0;

    function backtrack() {
      if (count >= limit) return;
      for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
          if (grid[row][col] !== 0) continue;
          for (let num = 1; num <= 9; num++) {
            if (isValid(grid, row, col, num)) {
              grid[row][col] = num;
              backtrack();
              grid[row][col] = 0;
              if (count >= limit) return;
            }
          }
          return;
        }
      }
      count++;
    }

    backtrack();
    return count;
  }

  function createPuzzle(solution, clueCount) {
    const puzzle = cloneGrid(solution);
    const cells = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        cells.push([r, c]);
      }
    }
    shuffle(cells);

    let removed = 0;
    const target = SIZE * SIZE - clueCount;

    for (const [row, col] of cells) {
      if (removed >= target) break;
      const backup = puzzle[row][col];
      puzzle[row][col] = 0;
      const test = cloneGrid(puzzle);
      if (countSolutions(test, 2) === 1) {
        removed++;
      } else {
        puzzle[row][col] = backup;
      }
    }

    return puzzle;
  }

  function generate(difficulty = "medium") {
    const grid = emptyGrid();
    fillDiagonal(grid);
    solve(grid);
    const solution = cloneGrid(grid);
    const clueCount = CLUES[difficulty] ?? CLUES.medium;
    const puzzle = createPuzzle(solution, clueCount);

    const given = puzzle.map((row) => row.map((v) => v !== 0));

    return { puzzle, solution, given };
  }

  function isComplete(grid) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] === 0) return false;
      }
    }
    return true;
  }

  function hasConflicts(grid) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const val = grid[r][c];
        if (val === 0) continue;
        grid[r][c] = 0;
        if (!isValid(grid, r, c, val)) {
          grid[r][c] = val;
          return true;
        }
        grid[r][c] = val;
      }
    }
    return false;
  }

  function findErrors(grid, solution) {
    const errors = new Set();
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const val = grid[r][c];
        if (val === 0) continue;
        if (val !== solution[r][c]) {
          errors.add(`${r},${c}`);
        }
      }
    }
    return errors;
  }

  return {
    SIZE,
    generate,
    isComplete,
    hasConflicts,
    findErrors,
    isValid,
  };
})();
