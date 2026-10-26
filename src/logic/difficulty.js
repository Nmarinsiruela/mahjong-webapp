// Difficulty presets. Ranges are [level 1, level 100] and interpolated per
// level in levels.js. What makes a board harder:
//  - more layers and flatter tops (gain) → more tiles hidden and covered
//  - wider aspect → longer rows, so fewer free row ends
//  - wings → end tiles that block two rows at once
//  - deal forgiveness → how easily a careless match leads to a dead end; the
//    floor is the lowest simulated win rate a deal may have (see rateDeal)
//  - fewer assists, and blocked tiles not greyed out
export const DIFFICULTIES = {
  easy: {
    name: 'Fácil',
    glyph: '易',
    summary: 'Tableros bajos y abiertos. Pistas, deshacer y barajar sin límite.',
    tiles: [24, 116],
    layers: [2, 3],
    aspect: [0.75, 0.9],
    gain: [1, 1.1],
    wingsFrom: Infinity,
    deal: { grouping: 'near', candidates: 4, runs: 8, forgiveness: [1, 1], floor: [0.95, 0.85] },
    assists: { hints: Infinity, undos: Infinity, shuffles: Infinity },
    dimBlocked: true,
  },
  normal: {
    name: 'Normal',
    glyph: '中',
    summary: 'Pilas más altas y alguna trampa. 3 pistas, 3 deshacer y 2 barajadas por nivel.',
    tiles: [36, 140],
    layers: [2, 5],
    aspect: [0.9, 1.15],
    gain: [1.1, 1.4],
    wingsFrom: 40,
    deal: { grouping: 'spread', candidates: 5, runs: 8, forgiveness: [0.9, 0.4], floor: [0.85, 0.6] },
    assists: { hints: 3, undos: 3, shuffles: 2 },
    dimBlocked: true,
  },
  hard: {
    name: 'Difícil',
    glyph: '難',
    summary: 'Torres altas, filas largas y parejas engañosas. Sin pistas ni deshacer, y las fichas bloqueadas no se marcan.',
    tiles: [60, 144],
    layers: [3, 6],
    aspect: [1.25, 1.5],
    gain: [1.5, 1.8],
    wingsFrom: 1,
    deal: { grouping: 'spread', candidates: 6, runs: 8, forgiveness: [0.4, 0], floor: [0.75, 0.4] },
    assists: { hints: 0, undos: 0, shuffles: 1 },
    dimBlocked: false,
  },
};

export const DIFFICULTY_IDS = Object.keys(DIFFICULTIES);
