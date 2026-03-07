// A tile is FREE if:
//  1. Nothing covers it from above (no tile on layer+1 overlaps its position)
//  2. It has no neighbor on at least one side (left OR right)

function overlaps(a, b) {
  // Two tiles on adjacent layers overlap if their col/row differ by less than 2
  return Math.abs(a.col - b.col) < 2 && Math.abs(a.row - b.row) < 2;
}

export function isFree(tile, board) {
  if (tile.removed) return false;

  const active = board.filter(t => !t.removed && t.uid !== tile.uid);

  // Check if covered from above
  const coveredAbove = active.some(
    t => t.layer === tile.layer + 1 && overlaps(t, tile)
  );
  if (coveredAbove) return false;

  // Check left/right neighbors on same layer
  const sameLayer = active.filter(t => t.layer === tile.layer);
  const hasLeft  = sameLayer.some(t => t.col === tile.col - 2 && Math.abs(t.row - tile.row) < 2);
  const hasRight = sameLayer.some(t => t.col === tile.col + 2 && Math.abs(t.row - tile.row) < 2);

  // Free if at least one side is open
  return !hasLeft || !hasRight;
}

export function hasAnyMoves(board) {
  const free = board.filter(t => !t.removed && isFree(t, board));
  for (let i = 0; i < free.length; i++) {
    for (let j = i + 1; j < free.length; j++) {
      if (tilesMatchSuits(free[i], free[j])) return true;
    }
  }
  return false;
}

function tilesMatchSuits(a, b) {
  if (a.suit !== b.suit) return false;
  if (a.suit === 'flowers' || a.suit === 'seasons') return true;
  return a.value === b.value;
}
