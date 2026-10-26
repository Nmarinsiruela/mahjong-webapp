import { matchKey } from './tiles';

// Positions use half-tile units: a tile spans 2 cols × 2 rows, so tiles
// offset by 1 overlap by half a tile.
//
// A tile is FREE if:
//  1. Nothing covers it from above (no tile on ANY higher layer overlaps it)
//  2. It has no neighbor on at least one side (left OR right) on its layer

function overlaps(a, b) {
  return Math.abs(a.col - b.col) < 2 && Math.abs(a.row - b.row) < 2;
}

// Precomputes, for every position, which positions can block it. Positions
// never move during a game, so this is done once per layout.
// `below` is the reverse of `above`; left/right are each other's reverse.
function buildGraph(positions) {
  const n = positions.length;
  const lists = () => Array.from({ length: n }, () => []);
  const above = lists(), below = lists(), left = lists(), right = lists();

  for (let i = 0; i < n; i++) {
    const a = positions[i];
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const b = positions[j];
      if (b.layer > a.layer) {
        if (overlaps(a, b)) {
          above[i].push(j);
          below[j].push(i);
        }
      } else if (b.layer === a.layer && Math.abs(b.row - a.row) < 2) {
        if (b.col === a.col - 2) left[i].push(j);
        else if (b.col === a.col + 2) right[i].push(j);
      }
    }
  }
  return { above, below, left, right };
}

const graphCache = new WeakMap();

export function getGraph(positions) {
  let graph = graphCache.get(positions);
  if (!graph) {
    graph = buildGraph(positions);
    graphCache.set(positions, graph);
  }
  return graph;
}

/**
 * Tracks which tiles are free as tiles are removed. Each tile keeps a count
 * of its remaining blockers, so a removal only revisits the tiles it touched;
 * simulations remove tiles thousands of times per level build. Removing tiles
 * never blocks anything, so `free` otherwise only grows.
 */
export function createTracker(graph, removed) {
  const present = removed.map(r => !r);
  const countPresent = list => list.reduce((c, j) => c + (present[j] ? 1 : 0), 0);
  const covers = graph.above.map(countPresent);
  const lefts = graph.left.map(countPresent);
  const rights = graph.right.map(countPresent);

  const free = new Set();
  const update = i => {
    if (present[i] && covers[i] === 0 && (lefts[i] === 0 || rights[i] === 0)) free.add(i);
  };
  present.forEach((_, i) => update(i));

  let remaining = present.filter(Boolean).length;
  return {
    free,
    get remaining() { return remaining; },
    remove(i) {
      present[i] = false;
      free.delete(i);
      remaining--;
      for (const j of graph.below[i]) { covers[j]--; update(j); }
      for (const j of graph.right[i]) { lefts[j]--; update(j); }
      for (const j of graph.left[i]) { rights[j]--; update(j); }
    },
  };
}

/** The tiles that can be picked right now, as a Set of indices. */
export function freeTiles(removed, graph) {
  return createTracker(graph, removed).free;
}

/** Groups tile indices by match class: Map(key → indices). */
export function groupByClass(indices, keys) {
  const groups = new Map();
  for (const i of indices) {
    const group = groups.get(keys[i]);
    if (group) group.push(i);
    else groups.set(keys[i], [i]);
  }
  return groups;
}

/** How many tiles of each match class are still on the board. */
export function countByClass(keys, removed) {
  const counts = new Map();
  keys.forEach((key, i) => {
    if (!removed[i]) counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return counts;
}

/**
 * The move a careful player would make, or null if there is none. A "safe"
 * match comes first: when every remaining tile of a class is free, pairing
 * them can't strand a copy. Otherwise the highest tiles go, since clearing
 * stacks uncovers the most. `jitter` breaks ties (e.g. randomly).
 */
export function carefulMove(freeGroups, remaining, positions, jitter = () => 0) {
  let best = null;
  let bestScore = -Infinity;
  for (const [key, group] of freeGroups) {
    if (group.length < 2) continue;
    const [a, b] = [...group].sort((i, j) => positions[j].layer - positions[i].layer);
    const safe = group.length === remaining.get(key);
    const score = (safe ? 100 : 0) + positions[a].layer + positions[b].layer + jitter();
    if (score > bestScore) {
      best = [a, b];
      bestScore = score;
    }
  }
  return best;
}

/** What the hint button suggests (see carefulMove), or null when stuck. */
export function suggestMove(positions, faces, removed, graph) {
  const keys = faces.map(matchKey);
  return carefulMove(groupByClass(freeTiles(removed, graph), keys), countByClass(keys, removed), positions);
}
