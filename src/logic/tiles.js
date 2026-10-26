// ─── Tile types ───────────────────────────────────────────────────────────────
// Each suit/honor has 4 copies except seasons/flowers (1 copy each, pair-matched)
export const SUITS = {
  CHARACTERS: 'characters', // 万
  BAMBOO: 'bamboo',         // 竹
  CIRCLES: 'circles',       // 饼
  WINDS: 'winds',           // 风
  DRAGONS: 'dragons',       // 龙
  FLOWERS: 'flowers',       // 花 (4 tiles, matched as a group)
  SEASONS: 'seasons',       // 季 (4 tiles, matched as a group)
};

// Suits where any two tiles match, regardless of their face
const GROUP_SUITS = new Set([SUITS.FLOWERS, SUITS.SEASONS]);

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// A match class is a set of 4 tiles that can be paired with each other.
// 34 regular faces × 4 copies + flowers + seasons = 36 classes, 144 tiles.
export const MATCH_CLASSES = [
  ...[SUITS.CHARACTERS, SUITS.BAMBOO, SUITS.CIRCLES].flatMap(suit =>
    NUMBERS.map(value => ({ suit, values: [value, value, value, value] }))
  ),
  ...['east', 'south', 'west', 'north'].map(value => ({ suit: SUITS.WINDS, values: [value, value, value, value] })),
  ...['red', 'green', 'white'].map(value => ({ suit: SUITS.DRAGONS, values: [value, value, value, value] })),
  { suit: SUITS.FLOWERS, values: ['plum', 'orchid', 'chrysanthemum', 'bamboo'] },
  { suit: SUITS.SEASONS, values: ['spring', 'summer', 'autumn', 'winter'] },
];

export const MAX_TILES = MATCH_CLASSES.length * 4; // 144

export function matchKey(tile) {
  return GROUP_SUITS.has(tile.suit) ? tile.suit : `${tile.suit}:${tile.value}`;
}

export function tilesMatch(a, b) {
  return matchKey(a) === matchKey(b);
}
