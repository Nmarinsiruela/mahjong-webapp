import { MATCH_CLASSES, matchKey } from './tiles';
import { getGraph, createTracker, groupByClass, countByClass, carefulMove } from './rules';

// Every deal is solvable by construction: first we plan an order in which the
// positions can be cleared two at a time (ignoring faces), then each planned
// pair gets a matching pair of faces. The plan is itself a solution.

/**
 * Plans the removal of every tile not yet removed, as [i, j] pairs in order.
 * Returns null if no plan was found (e.g. two tiles left stacked on each other).
 */
function planRemovalOrder(positions, removed, rng, attempts = 30) {
  const graph = getGraph(positions);
  // Tiles high up or covering many others go first; otherwise the plan tends
  // to end with a lone stack whose tiles are never free at the same time.
  const baseWeight = positions.map((p, i) => 1 + 2 * p.layer + graph.below[i].length);

  for (let attempt = 0; attempt < attempts; attempt++) {
    const greed = 1 + attempt / 5;
    const tracker = createTracker(graph, removed);
    const pairs = [];

    while (tracker.remaining > 0 && tracker.free.size >= 2) {
      const free = [...tracker.free];
      const weights = free.map(i => baseWeight[i] ** greed);
      const a = rng.weightedIndex(weights);
      weights[a] = 0;
      const b = rng.weightedIndex(weights);
      tracker.remove(free[a]);
      tracker.remove(free[b]);
      pairs.push([free[a], free[b]]);
    }
    if (tracker.remaining === 0) return pairs;
  }
  return null;
}

// Gives each planned pair a face pair. Which two pairs share a match class
// depends on `grouping`: 'near' gives it to consecutive pairs in the plan
// (all four copies tend to be free at once — forgiving), 'spread' scatters them
// so a player can pick the wrong two of four copies and get stuck later.
function assignFaces(pairs, count, rng, grouping) {
  const order = pairs.map((_, k) => k);
  const groupedOrder = grouping === 'near' ? order : rng.shuffle(order);
  const classes = rng.shuffle(MATCH_CLASSES).slice(0, Math.ceil(pairs.length / 2));

  const faces = new Array(count).fill(null);
  classes.forEach(({ suit, values }, c) => {
    const shuffled = rng.shuffle(values);
    for (let k = 0; k < 2; k++) {
      const pair = pairs[groupedOrder[c * 2 + k]];
      if (!pair) break;
      faces[pair[0]] = { suit, value: shuffled[k * 2] };
      faces[pair[1]] = { suit, value: shuffled[k * 2 + 1] };
    }
  });
  return faces;
}

// Plays a whole game with `chooseMove(freeGroups, remaining)`; true if won.
function playout(graph, keys, chooseMove) {
  const tracker = createTracker(graph, keys.map(() => false));
  const remaining = countByClass(keys, []);
  for (;;) {
    const move = chooseMove(groupByClass(tracker.free, keys), remaining);
    if (!move) return tracker.remaining === 0;
    tracker.remove(move[0]);
    tracker.remove(move[1]);
    remaining.set(keys[move[0]], remaining.get(keys[move[0]]) - 2);
  }
}

/**
 * Share of `runs` games won without hints, undo or shuffles by a careless
 * player (any available match) and by a careful one (carefulMove).
 */
function rateDeal(positions, faces, rng, runs) {
  const graph = getGraph(positions);
  const keys = faces.map(matchKey);
  const careless = groups => {
    const moves = [...groups.values()].flatMap(group =>
      group.flatMap((a, i) => group.slice(i + 1).map(b => [a, b]))
    );
    return moves.length ? rng.pick(moves) : null;
  };
  const careful = (groups, remaining) => carefulMove(groups, remaining, positions, rng.next);

  const winRate = chooseMove => {
    let wins = 0;
    for (let r = 0; r < runs; r++) if (playout(graph, keys, chooseMove)) wins++;
    return wins / runs;
  };
  return { careless: winRate(careless), careful: winRate(careful) };
}

/**
 * Deals faces onto a layout as { faces, rating, solution }, where solution
 * is the planned removal order. Several solvable candidates
 * are generated and rated by simulated play. A deal is fair if the careful
 * player wins at least `floor` of the time; among fair deals, `forgiveness`
 * picks one (0 = the one lost most often overall, 1 = the least often). If
 * none is fair, the fairest is returned and the caller decides; null means
 * the layout can't be cleared at all.
 */
export function createDeal(positions, rng, { grouping, candidates, runs, forgiveness, floor }) {
  const removed = positions.map(() => false);
  const options = [];
  for (let c = 0; c < candidates; c++) {
    const pairs = planRemovalOrder(positions, removed, rng);
    if (!pairs) continue;
    const faces = assignFaces(pairs, positions.length, rng, grouping);
    options.push({ faces, rating: rateDeal(positions, faces, rng, runs), solution: pairs });
  }
  if (!options.length) return null;

  const fair = options.filter(o => o.rating.careful >= floor);
  if (!fair.length) return options.reduce((a, b) => (b.rating.careful > a.rating.careful ? b : a));
  fair.sort((a, b) => (a.rating.careless + a.rating.careful) - (b.rating.careless + b.rating.careful));
  return fair[Math.round(forgiveness * (fair.length - 1))];
}

/**
 * Rearranges the faces of the tiles still on the board into a solvable
 * position. Returns { faces, solution }, or null if the remaining layout
 * can't be cleared whatever the faces (e.g. two tiles stacked on each other).
 */
export function reshuffle(positions, faces, removed, rng) {
  const pairs = planRemovalOrder(positions, removed, rng);
  if (!pairs) return null;

  // Each match class always has an even number of tiles left, so the faces
  // still on the board can be paired up within their class.
  const byKey = groupByClass(faces.map((_, i) => i).filter(i => !removed[i]), faces.map(matchKey));
  const facePairs = [];
  for (const indices of byKey.values()) {
    for (let k = 0; k + 1 < indices.length; k += 2) facePairs.push([faces[indices[k]], faces[indices[k + 1]]]);
  }

  const next = [...faces];
  rng.shuffle(facePairs).forEach(([fa, fb], k) => {
    const [a, b] = pairs[k];
    next[a] = fa;
    next[b] = fb;
  });
  return { faces: next, solution: pairs };
}
