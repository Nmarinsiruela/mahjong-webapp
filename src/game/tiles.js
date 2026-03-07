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

function makeTiles() {
  const tiles = [];
  let id = 0;

  const addGroup = (suit, values, copies = 4) => {
    for (const value of values) {
      for (let c = 0; c < copies; c++) {
        tiles.push({ id: id++, suit, value });
      }
    }
  };

  addGroup(SUITS.CHARACTERS, [1,2,3,4,5,6,7,8,9]);
  addGroup(SUITS.BAMBOO,     [1,2,3,4,5,6,7,8,9]);
  addGroup(SUITS.CIRCLES,    [1,2,3,4,5,6,7,8,9]);
  addGroup(SUITS.WINDS,      ['east','south','west','north']);
  addGroup(SUITS.DRAGONS,    ['red','green','white']);
  // Flowers & Seasons: 4 tiles each, any two flowers match, any two seasons match
  addGroup(SUITS.FLOWERS,    ['plum','orchid','chrysanthemum','bamboo'], 1);
  addGroup(SUITS.SEASONS,    ['spring','summer','autumn','winter'], 1);

  return tiles; // 144 tiles
}

export const ALL_TILES = makeTiles();

export function tilesMatch(a, b) {
  if (a.suit !== b.suit) return false;
  // Flowers and Seasons: any two of the same suit match
  if (a.suit === SUITS.FLOWERS || a.suit === SUITS.SEASONS) return true;
  return a.value === b.value;
}
