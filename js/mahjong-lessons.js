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
    body: "Hint reveals a valid free pair one tile at a time. Undo steps back one move (within the current session). Use Hint if you get stuck on a tough layout.",
  },
  {
    title: "New game & restart",
    body: "New game deals a fresh layout. Restart reshuffles the same seed so you can retry the same deal. Difficulty in the menu tweaks which seed family is used.",
  },
];

const MahjongGuideSymbols = [
  {
    title: "Dots · 筒子",
    pronunciation: "tǒngzi",
    body: "Circles numbered 1–9. Four copies of each. Match tiles with the same number of dots.",
    samples: [
      { kind: "dots", rank: 1, label: "1", key: "dots:1" },
      { kind: "dots", rank: 5, label: "5", key: "dots:5" },
      { kind: "dots", rank: 9, label: "9", key: "dots:9" },
    ],
  },
  {
    title: "Bamboo · 索子",
    pronunciation: "suǒzi",
    body: "Green sticks numbered 1–9. The 1 bamboo is a bird (一条 yī tiáo). Four of each rank — match identical counts.",
    samples: [
      { kind: "bamboo", rank: 1, label: "1", key: "bamboo:1", pronunciation: "yī tiáo" },
      { kind: "bamboo", rank: 3, label: "3", key: "bamboo:3" },
      { kind: "bamboo", rank: 9, label: "9", key: "bamboo:9" },
    ],
  },
  {
    title: "Characters · 萬子",
    pronunciation: "wànzi",
    body: "Chinese numerals with 萬 wàn (ten thousand). Ranks 1–9, four of each. Match the same character.",
    samples: [
      { kind: "chars", rank: 1, label: "一萬", key: "chars:1", pronunciation: "yī wàn" },
      { kind: "chars", rank: 5, label: "五萬", key: "chars:5", pronunciation: "wǔ wàn" },
      { kind: "chars", rank: 9, label: "九萬", key: "chars:9", pronunciation: "jiǔ wàn" },
    ],
  },
  {
    title: "Winds · 風牌",
    pronunciation: "fēngpái",
    body: "East 東 dōng, South 南 nán, West 西 xī, North 北 běi. Four of each wind. Only the same wind matches.",
    samples: [
      { kind: "wind", rank: 1, label: "東", key: "wind:1", pronunciation: "dōng" },
      { kind: "wind", rank: 2, label: "南", key: "wind:2", pronunciation: "nán" },
      { kind: "wind", rank: 3, label: "西", key: "wind:3", pronunciation: "xī" },
      { kind: "wind", rank: 4, label: "北", key: "wind:4", pronunciation: "běi" },
    ],
  },
  {
    title: "Dragons · 三元牌",
    pronunciation: "sān yuán pái",
    body: "Red 中 zhōng (middle), Green 發 fā (fortune), White 白 bái (blank frame). Four of each — match the same dragon.",
    samples: [
      { kind: "dragon", rank: 1, label: "中", key: "dragon:1", pronunciation: "zhōng" },
      { kind: "dragon", rank: 2, label: "發", key: "dragon:2", pronunciation: "fā" },
      { kind: "dragon", rank: 3, label: "白", key: "dragon:3", pronunciation: "bái" },
    ],
  },
  {
    title: "Flowers & seasons",
    pronunciation: "huā pái · jì pái",
    body: "Bonus tiles — flowers 梅 méi, 蘭 lán, 菊 jú, 竹 zhú and seasons 春 chūn, 夏 xià, 秋 qiū, 冬 dōng. Any flower matches any flower; any season matches any season.",
    samples: [
      { kind: "flower", rank: 1, label: "梅", key: "flower", pronunciation: "méi" },
      { kind: "flower", rank: 3, label: "菊", key: "flower", pronunciation: "jú" },
      { kind: "season", rank: 2, label: "夏", key: "season", pronunciation: "xià" },
      { kind: "season", rank: 4, label: "冬", key: "season", pronunciation: "dōng" },
    ],
  },
];
