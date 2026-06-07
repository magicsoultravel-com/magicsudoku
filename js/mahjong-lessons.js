const MahjongGuideBasics = [
  {
    title: "The goal",
    body: "Remove all 144 tiles by matching pairs. When the board is empty, you win. If no free matching pairs remain, start a new game.",
  },
  {
    title: "Free tiles",
    body: "A tile is free when nothing lies on top of it and at least one long side is open (left or right). Blocked tiles are dimmed and cannot be selected.",
  },
  {
    title: "Matching pairs",
    body: "Tap a free tile, then tap another free tile with the same suit and rank — for example two “5 bamboo” tiles. Only identical tiles match, except flowers and seasons (see Tiles & symbols).",
  },
  {
    title: "Layers",
    body: "Tiles are stacked in layers. Higher tiles block those underneath. Work from the top down and try to uncover buried tiles early.",
  },
  {
    title: "Hints & undo",
    body: "Hint highlights a valid free pair. Undo steps back one move (within the current session). Use Hint if you get stuck on a tough layout.",
  },
  {
    title: "New game & restart",
    body: "New game deals a fresh layout. Restart reshuffles the same seed so you can retry the same deal. Difficulty in the menu tweaks which seed family is used.",
  },
];

const MahjongGuideSymbols = [
  {
    title: "Dots · 筒子",
    body: "Circles numbered 1–9. Four copies of each. Match tiles with the same number of dots.",
    samples: [
      { kind: "dots", rank: 1, label: "1", key: "dots:1" },
      { kind: "dots", rank: 5, label: "5", key: "dots:5" },
      { kind: "dots", rank: 9, label: "9", key: "dots:9" },
    ],
  },
  {
    title: "Bamboo · 索子",
    body: "Green sticks numbered 1–9. The 1 bamboo is a bird. Four of each rank — match identical counts.",
    samples: [
      { kind: "bamboo", rank: 1, label: "1", key: "bamboo:1" },
      { kind: "bamboo", rank: 3, label: "3", key: "bamboo:3" },
      { kind: "bamboo", rank: 9, label: "9", key: "bamboo:9" },
    ],
  },
  {
    title: "Characters · 萬子",
    body: "Chinese numerals with 萬 (ten thousand). Ranks 1–9, four of each. Match the same character.",
    samples: [
      { kind: "chars", rank: 1, label: "一萬", key: "chars:1" },
      { kind: "chars", rank: 5, label: "五萬", key: "chars:5" },
      { kind: "chars", rank: 9, label: "九萬", key: "chars:9" },
    ],
  },
  {
    title: "Winds · 風牌",
    body: "East 東, South 南, West 西, North 北. Four of each wind. Only the same wind matches.",
    samples: [
      { kind: "wind", rank: 1, label: "東", key: "wind:1" },
      { kind: "wind", rank: 2, label: "南", key: "wind:2" },
      { kind: "wind", rank: 3, label: "西", key: "wind:3" },
      { kind: "wind", rank: 4, label: "北", key: "wind:4" },
    ],
  },
  {
    title: "Dragons · 三元牌",
    body: "Red 中 (middle), Green 發 (fortune), White 白 (blank frame). Four of each — match the same dragon.",
    samples: [
      { kind: "dragon", rank: 1, label: "中", key: "dragon:1" },
      { kind: "dragon", rank: 2, label: "發", key: "dragon:2" },
      { kind: "dragon", rank: 3, label: "白", key: "dragon:3" },
    ],
  },
  {
    title: "Flowers & seasons",
    body: "Bonus tiles — one of each flower (梅蘭菊竹) and season (春夏秋冬). Any flower matches any other flower; any season matches any other season.",
    samples: [
      { kind: "flower", rank: 1, label: "梅", key: "flower" },
      { kind: "flower", rank: 3, label: "菊", key: "flower" },
      { kind: "season", rank: 2, label: "夏", key: "season" },
      { kind: "season", rank: 4, label: "冬", key: "season" },
    ],
  },
];
