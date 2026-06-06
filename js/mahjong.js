const Mahjong = (() => {
  const TILE_W = 2;
  const TILE_H = 2;

  const LAYOUT = (() => {
    const positions = [];
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 8; x++) {
        positions.push({ z: 0, x: x * 2, y: y * 2 });
      }
    }
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 6; x++) {
        positions.push({ z: 1, x: x * 2 + 2, y: y * 2 + 2 });
      }
    }
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 4; x++) {
        positions.push({ z: 2, x: x * 2 + 4, y: y * 2 + 4 });
      }
    }
    positions.push({ z: 3, x: 8, y: 6 });
    positions.push({ z: 3, x: 10, y: 6 });
    positions.push({ z: 4, x: 8, y: 6 });
    positions.push({ z: 4, x: 10, y: 6 });
    return positions;
  })();

  const TILE_DEFS = [
    ...Array.from({ length: 9 }, (_, i) => ({ kind: "dots", rank: i + 1, label: `${i + 1}●` })),
    ...Array.from({ length: 9 }, (_, i) => ({ kind: "bamboo", rank: i + 1, label: `${i + 1}竹` })),
    ...Array.from({ length: 9 }, (_, i) => ({ kind: "chars", rank: i + 1, label: `${i + 1}萬` })),
    { kind: "wind", rank: 1, label: "東" },
    { kind: "wind", rank: 2, label: "南" },
    { kind: "wind", rank: 3, label: "西" },
    { kind: "wind", rank: 4, label: "北" },
    { kind: "dragon", rank: 1, label: "中" },
    { kind: "dragon", rank: 2, label: "發" },
    { kind: "dragon", rank: 3, label: "白" },
  ];

  function tileKey(def) {
    return `${def.kind}:${def.rank}`;
  }

  function mulberry32(seed) {
    let t = seed >>> 0;
    return () => {
      t += 0x6d2b79f5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(arr, rand) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function overlaps(a, b) {
    return a.x < b.x + TILE_W && a.x + TILE_W > b.x && a.y < b.y + TILE_H && a.y + TILE_H > b.y;
  }

  function isFree(tile, tiles) {
    if (tile.removed) return false;

    for (const other of tiles) {
      if (other.removed || other.z <= tile.z) continue;
      if (overlaps(other, tile)) return false;
    }

    let leftBlocked = false;
    let rightBlocked = false;

    for (const other of tiles) {
      if (other.removed || other.z !== tile.z || other.id === tile.id) continue;
      if (other.y < tile.y + TILE_H && other.y + TILE_H > tile.y) {
        if (other.x + TILE_W === tile.x) leftBlocked = true;
        if (other.x === tile.x + TILE_W) rightBlocked = true;
      }
    }

    return !leftBlocked || !rightBlocked;
  }

  function canMatch(a, b) {
    if (!a || !b || a.id === b.id) return false;
    if (a.removed || b.removed) return false;
    return tileKey(a) === tileKey(b);
  }

  function buildDeck(count) {
    const deck = [];
    const copies = Math.ceil(count / TILE_DEFS.length / 2) * 2;
    for (const def of TILE_DEFS) {
      for (let i = 0; i < copies; i++) {
        deck.push({ ...def, key: tileKey(def) });
      }
    }
    return deck.slice(0, count);
  }

  function generate(seed = Date.now()) {
    const count = LAYOUT.length;
    if (count % 2 !== 0) {
      throw new Error("Layout must have an even number of positions");
    }

    const rand = mulberry32(seed);
    const deck = shuffle(buildDeck(count), rand);
    const tiles = LAYOUT.map((pos, i) => ({
      id: i,
      kind: deck[i].kind,
      rank: deck[i].rank,
      label: deck[i].label,
      key: deck[i].key,
      z: pos.z,
      x: pos.x,
      y: pos.y,
      removed: false,
    }));

    return { tiles, seed, layout: LAYOUT };
  }

  function remaining(tiles) {
    return tiles.filter((t) => !t.removed).length;
  }

  function isWon(tiles) {
    return remaining(tiles) === 0;
  }

  function freeTiles(tiles) {
    return tiles.filter((t) => isFree(t, tiles));
  }

  function bounds(tiles) {
    const active = tiles.filter((t) => !t.removed);
    if (!active.length) {
      return { minX: 0, minY: 0, maxX: TILE_W, maxY: TILE_H, maxZ: 0 };
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = 0;
    for (const t of active) {
      minX = Math.min(minX, t.x);
      minY = Math.min(minY, t.y);
      maxX = Math.max(maxX, t.x + TILE_W);
      maxY = Math.max(maxY, t.y + TILE_H);
      maxZ = Math.max(maxZ, t.z);
    }
    return { minX, minY, maxX, maxY, maxZ };
  }

  return {
    TILE_W,
    TILE_H,
    LAYOUT,
    generate,
    isFree,
    canMatch,
    remaining,
    isWon,
    freeTiles,
    bounds,
  };
})();
