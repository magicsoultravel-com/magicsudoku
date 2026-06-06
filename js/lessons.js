const Lessons = [
  {
    title: "The goal",
    body: "Fill every row, column, and 3×3 box with digits 1–9. Each digit may appear only once per row, column, and box.",
  },
  {
    title: "How puzzles are made",
    body: "Magic Sudoku does not use a fixed puzzle list. Every game is procedurally generated from a seed (shown below the board). The same seed and difficulty always produces the same puzzle, so you can save or share seeds to replay or track games.",
  },
  {
    title: "Start with certainties",
    body: "Scan rows, columns, and boxes for cells where only one number can fit. A digit already present in the same row, column, or box eliminates candidates elsewhere.",
  },
  {
    title: "Use pencil marks",
    body: "Toggle pencil mode and tap numbers to note small candidates in a cell. When a candidate is ruled out everywhere else in a unit, you have found a hidden single.",
  },
  {
    title: "Naked singles",
    body: "If a cell has only one possible candidate left, place that digit. Remove it from pencil marks in the same row, column, and box.",
  },
  {
    title: "Hidden singles",
    body: "Sometimes a digit can only go in one cell within a row, column, or box — even if that cell has other candidates. Scan each unit for a number missing from all but one slot.",
  },
  {
    title: "Elimination by rows & columns",
    body: "When a number is locked inside one box along a row or column, that number cannot appear elsewhere in that row or column outside the box. This is called a pointing pair or line reduction.",
  },
  {
    title: "Pairs and triples",
    body: "If two cells in a unit share the same two candidates and no others, those digits are locked to those cells. Eliminate them from other cells in that unit.",
  },
  {
    title: "Work in passes",
    body: "After each placement, rescan the board. Easy puzzles often collapse quickly once the first chain of singles is found.",
  },
  {
    title: "When stuck",
    body: "Use Check to verify mistakes without revealing answers. Highlight a number on the numpad to see every instance on the board and scan its rows and columns.",
  },
];
