// Classic Mahjong Solitaire layout — exactly 144 positions
// Coordinates in half-tile units [col, row, layer]
// A tile is 2 units wide × 2 units tall; adjacent tiles share a boundary.
// Layout is 16 cols × 6 rows (2:1 ratio) for better fit on landscape screens.

// Layer 0 base:   8 cols × 12 rows = 96
// Layer 1 center: 4 cols ×  8 rows = 32
// Layer 2 inner:  2 cols ×  6 rows = 12
// Layer 3 core:   2 cols ×  2 rows =  4
// Total: 96 + 32 + 12 + 4 = 144
// Ratio ~1:1.75 (taller than wide, fits portrait mobile)

function range(start, stop, step = 2) {
  const r = [];
  for (let i = start; i <= stop; i += step) r.push(i);
  return r;
}

function layer(z, cols, rows) {
  const positions = [];
  for (const r of rows) for (const c of cols) positions.push([c, r, z]);
  return positions;
}

const POSITIONS = [
  // Layer 0 — 96 tiles (8 × 12), taller than wide
  ...layer(0, range(0, 14), range(0, 22)),

  // Layer 1 — 32 tiles (4 × 8), centered
  ...layer(1, range(4, 10), range(4, 18)),

  // Layer 2 — 12 tiles (2 × 6), centered
  ...layer(2, range(6,  8), range(6, 16)),

  // Layer 3 — 4 tiles (2 × 2), centered
  ...layer(3, range(6,  8), range(10, 12)),
];

// Sanity check (dev only)
// console.assert(POSITIONS.length === 144, 'Layout must have 144 positions, got', POSITIONS.length);

export function buildLayout(tilePrototypes) {
  // Shuffle tile prototypes
  const shuffled = [...tilePrototypes].sort(() => Math.random() - 0.5);

  return POSITIONS.map(([col, row, layer], i) => ({
    ...shuffled[i],
    uid: i,
    col,
    row,
    layer,
    removed: false,
    selected: false,
  }));
}

export const BOARD_COLS = 24;
export const BOARD_ROWS = 16;
