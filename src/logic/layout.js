import { hashString } from '../utils/rng';

// Procedural layouts. A layout is an array of positions { col, row, layer } in
// half-tile units (see rules.js), sorted bottom layer first.
//
// Shapes are built as a mirror-symmetric heightmap over a grid of whole-tile
// cells: each cell holds a stack of 0..layers tiles. A shape function decides
// where stacks go and how tall they are; the grid size is then searched so the
// tile count lands close to the target, and the excess is trimmed off in
// symmetric groups so the layout stays balanced.

// f(u, v) → number. u and v are the distances from the centre, normalised to
// [0, 1). Cells with f > 0 hold tiles; higher f means taller stacks.
const SHAPES = {
  pyramid:   (u, v) => 1 - Math.max(u, v),
  diamond:   (u, v) => 1 - 0.8 * (u + v),
  oval:      (u, v) => 1 - 0.95 * Math.hypot(u, v),
  cross:     (u, v) => Math.min(1 - 2.2 * Math.min(u, v), 1.1 - 0.9 * Math.max(u, v)),
  frame:     (u, v) => 1 - 2.6 * Math.abs(Math.max(u, v) - 0.62),
  hourglass: (u, v) => 1 - u / (0.35 + 0.75 * v),
  twin:      (u, v) => 1 - 1.5 * Math.hypot(u - 0.5, v * 0.8),
  bands:     (u, v) => (Math.cos(v * Math.PI * 2.5) > -0.35 ? 1 - 0.7 * u : -1),
};

const MIN_SIZE = 3;
// Ten tiles across (wings included) keeps tiles about 46px wide on a 390px phone
const MAX_COLS = 10;
const MAX_ROWS = 14;

/**
 * @param {object} rng   from createRng()
 * @param {object} spec
 * @param {number} spec.tiles   target tile count (even)
 * @param {number} spec.layers  maximum stack height
 * @param {number} spec.aspect  target columns ÷ rows (higher = longer rows)
 * @param {number} spec.gain    > 1 flattens stack tops into plateaus
 * @param {string[]} spec.shapes  shape names to choose from
 * @param {boolean} spec.wings  add half-offset end tiles that each block two rows
 */
export function generateLayout(rng, spec) {
  const shape = SHAPES[rng.pick(spec.shapes)];
  const symmetry = rng.chance(0.7) ? 'xy' : 'x';
  const salt = rng.int(0, 2 ** 31);
  const noiseAmp = rng.range(0.05, 0.2);

  const field = { shape, symmetry, salt, noiseAmp, layers: spec.layers, gain: spec.gain };
  const { cols, rows } = fitGrid(field, spec.tiles, spec.aspect, spec.wings ? MAX_COLS - 2 : MAX_COLS);
  const heights = heightMap(field, cols, rows);

  // Wings sit between the two middle rows, so they need an even row count,
  // and are only added if the row ends they block survived trimming
  const wingRoom = spec.wings && rows % 2 === 0;
  trim(heights, symmetry, spec.tiles - (wingRoom ? 2 : 0), rng);
  const wings = wingRoom && heights[rows / 2 - 1][0] > 0 && heights[rows / 2][0] > 0;
  return toPositions(heights, wings);
}

function fundamentalCell(x, y, cols, rows, symmetry) {
  const fx = Math.min(x, cols - 1 - x);
  const fy = symmetry === 'xy' ? Math.min(y, rows - 1 - y) : y;
  return [fx, fy];
}

// Noise is a hash of the cell's mirrored coordinates, so mirrored cells always
// agree and trying different grid sizes doesn't consume random numbers.
function noise(salt, fx, fy) {
  return hashString(`${salt}:${fx}:${fy}`) / 2 ** 32 - 0.5;
}

function heightMap({ shape, symmetry, salt, noiseAmp, layers, gain }, cols, rows) {
  const heights = [];
  for (let y = 0; y < rows; y++) {
    const row = [];
    for (let x = 0; x < cols; x++) {
      const u = Math.abs(x - (cols - 1) / 2) / (cols / 2);
      const v = Math.abs(y - (rows - 1) / 2) / (rows / 2);
      const [fx, fy] = fundamentalCell(x, y, cols, rows, symmetry);
      const f = shape(u, v) + noise(salt, fx, fy) * noiseAmp;
      row.push(f > 0 ? Math.min(layers, Math.max(1, Math.ceil(f * layers * gain))) : 0);
    }
    heights.push(row);
  }
  return heights;
}

const countTiles = heights => heights.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0);

// Picks the grid size whose tile count is closest to the target (preferring a
// little over, since excess can be trimmed) without straying far from the aspect.
function fitGrid(field, target, aspect, maxCols) {
  let best = null;
  for (let cols = MIN_SIZE; cols <= maxCols; cols++) {
    for (let rows = MIN_SIZE; rows <= MAX_ROWS; rows++) {
      const aspectError = Math.abs(Math.log(cols / rows / aspect));
      if (aspectError > 0.35) continue;
      const count = countTiles(heightMap(field, cols, rows));
      const score = (count >= target ? count - target : (target - count) * 3) + aspectError * 8;
      if (!best || score < best.score) best = { cols, rows, score };
    }
  }
  return best;
}

// Removes stack tops in mirror-symmetric groups until the count is at most
// `target` and even. Taller stacks are trimmed first to keep peaks in check.
function trim(heights, symmetry, target, rng) {
  const rows = heights.length;
  const cols = heights[0].length;

  const orbits = new Map();
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const key = fundamentalCell(x, y, cols, rows, symmetry).join(',');
      if (!orbits.has(key)) orbits.set(key, []);
      orbits.get(key).push([x, y]);
    }
  }
  const groups = [...orbits.values()];
  // When only groups of 4 remain but 2 tiles must go, a left/right mirrored
  // pair is removed instead (costs a little vertical symmetry).
  const halves = groups.filter(g => g.length === 4).map(g => g.filter(([, y]) => y < rows / 2));

  let count = countTiles(heights);
  const height = cells => Math.min(...cells.map(([x, y]) => heights[y][x]));
  const removeFrom = cells => {
    for (const [x, y] of cells) heights[y][x]--;
    count -= cells.length;
  };

  // An odd count means a centre stack exists; take its top first.
  if (count % 2 === 1) removeFrom(groups.find(g => g.length === 1 && height(g) > 0));

  while (count > target) {
    const excess = count - target;
    const fitting = list => list.filter(g => g.length % 2 === 0 && g.length <= excess && height(g) > 0);
    let fits = fitting(groups);
    if (!fits.length) fits = fitting(halves);
    if (!fits.length) break;
    removeFrom(fits[rng.weightedIndex(fits.map(g => height(g) ** 2))]);
  }
}

function toPositions(heights, wings) {
  const rows = heights.length;
  const cols = heights[0].length;
  const positions = [];

  heights.forEach((row, y) => row.forEach((h, x) => {
    for (let layer = 0; layer < h; layer++) positions.push({ col: x * 2, row: y * 2, layer });
  }));

  if (wings) {
    // Sits between the two middle rows, blocking both of their end tiles.
    positions.push({ col: -2, row: rows - 1, layer: 0 });
    positions.push({ col: cols * 2, row: rows - 1, layer: 0 });
  }

  const minCol = Math.min(...positions.map(p => p.col));
  const minRow = Math.min(...positions.map(p => p.row));
  return positions
    .map(p => ({ col: p.col - minCol, row: p.row - minRow, layer: p.layer }))
    .sort((a, b) => a.layer - b.layer || a.row - b.row || a.col - b.col);
}
