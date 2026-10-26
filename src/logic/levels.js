import { createRng, hashString } from '../utils/rng';
import { generateLayout } from './layout';
import { createDeal } from './deal';
import { DIFFICULTIES } from './difficulty';
import { MAX_TILES } from './tiles';

export const LEVEL_COUNT = 100;

// New shapes are introduced as the player progresses
const SHAPE_UNLOCKS = [
  [1, ['pyramid', 'diamond', 'oval']],
  [11, ['cross', 'twin']],
  [26, ['hourglass', 'bands']],
  [41, ['frame']],
];

function shapesFor(level) {
  return SHAPE_UNLOCKS.filter(([from]) => level >= from).flatMap(([, shapes]) => shapes);
}

// 0 at level 1 → 1 at level 100. Each block of ten levels ends a bit harder
// than the next one starts, so progress comes in waves rather than a ramp.
function levelProgress(level) {
  const overall = (level - 1) / (LEVEL_COUNT - 1);
  const wave = ((level - 1) % 10) / 9;
  return Math.min(1, 0.9 * overall + 0.1 * wave);
}

function levelSpec(difficultyId, level) {
  const preset = DIFFICULTIES[difficultyId];
  const p = levelProgress(level);
  const lerp = ([from, to]) => from + (to - from) * p;
  return {
    layout: {
      tiles: Math.min(MAX_TILES, 2 * Math.round(lerp(preset.tiles) / 2)),
      layers: Math.round(lerp(preset.layers)),
      aspect: lerp(preset.aspect),
      gain: lerp(preset.gain),
      shapes: shapesFor(level),
      wings: level >= preset.wingsFrom,
    },
    deal: {
      ...preset.deal,
      forgiveness: lerp(preset.deal.forgiveness),
      floor: lerp(preset.deal.floor),
    },
  };
}

/**
 * Builds the board for a level as { positions, faces, solution }.
 * Deterministic: the same difficulty and level always give the same layout
 * and deal, so restarting replays the same board.
 */
export function buildLevel(difficultyId, level) {
  const spec = levelSpec(difficultyId, level);

  // Layouts that can't be cleared, or only with deals harsher than the
  // difficulty allows, are regenerated from the next seed.
  let best = null;
  for (let attempt = 0; attempt < 12; attempt++) {
    const rng = createRng(hashString(`${difficultyId}:${level}:${attempt}`));
    const positions = generateLayout(rng, spec.layout);
    const deal = createDeal(positions, rng, spec.deal);
    if (!deal) continue;
    const fairness = deal.rating.careful;
    const board = { positions, faces: deal.faces, solution: deal.solution };
    if (fairness >= spec.deal.floor) return board;
    if (!best || fairness > best.fairness) best = { board, fairness };
  }
  if (best) return best.board;
  throw new Error(`Could not build level ${level} (${difficultyId})`);
}
