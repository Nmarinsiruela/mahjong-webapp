import { describe, it, expect } from 'vitest';
import { buildLevel, LEVEL_COUNT } from '../src/logic/levels';
import { DIFFICULTY_IDS } from '../src/logic/difficulty';
import { MAX_TILES, matchKey } from '../src/logic/tiles';
import { getGraph, freeTiles } from '../src/logic/rules';
import { expectSolvable } from './helpers';

const LEVELS = Array.from({ length: LEVEL_COUNT }, (_, i) => i + 1);

// Built once and shared: 300 boards
const boards = Object.fromEntries(
  DIFFICULTY_IDS.map(id => [id, LEVELS.map(level => buildLevel(id, level))])
);

function expectValidLayout(positions) {
  expect(positions.length % 2).toBe(0);
  expect(positions.length).toBeGreaterThanOrEqual(4);
  expect(positions.length).toBeLessThanOrEqual(MAX_TILES);
  expect(Math.min(...positions.map(p => p.col))).toBe(0);
  expect(Math.min(...positions.map(p => p.row))).toBe(0);

  for (const [i, a] of positions.entries()) {
    // No two tiles on the same layer overlap
    for (const b of positions.slice(i + 1)) {
      if (a.layer === b.layer) {
        expect(Math.abs(a.col - b.col) >= 2 || Math.abs(a.row - b.row) >= 2).toBe(true);
      }
    }
    // Every quarter of a raised tile rests on a tile one layer down
    if (a.layer > 0) {
      for (const [qc, qr] of [[a.col, a.row], [a.col + 1, a.row], [a.col, a.row + 1], [a.col + 1, a.row + 1]]) {
        const support = positions.some(b => b.layer === a.layer - 1
          && b.col <= qc && qc < b.col + 2 && b.row <= qr && qr < b.row + 2);
        expect(support).toBe(true);
      }
    }
  }
}

describe.each(DIFFICULTY_IDS)('%s levels', difficulty => {
  it.each(LEVELS)('level %i has a valid layout and a solvable deal', level => {
    const { positions, faces, solution } = boards[difficulty][level - 1];
    expectValidLayout(positions);

    // Every class appears an even number of times
    const counts = new Map();
    for (const face of faces) counts.set(matchKey(face), (counts.get(matchKey(face)) ?? 0) + 1);
    for (const count of counts.values()) expect(count % 2).toBe(0);

    expectSolvable(positions, faces, solution);
  });

  it('is deterministic', () => {
    for (const level of [1, 37, 100]) {
      expect(buildLevel(difficulty, level)).toEqual(boards[difficulty][level - 1]);
    }
  });

  it('gets bigger and tighter as levels go up', () => {
    const block = (from, fn) => {
      const slice = boards[difficulty].slice(from, from + 10);
      return slice.reduce((sum, b) => sum + fn(b), 0) / slice.length;
    };
    const size = b => b.positions.length;
    const freeShare = b => freeTiles(b.positions.map(() => false), getGraph(b.positions)).size / b.positions.length;

    expect(block(90, size)).toBeGreaterThan(block(0, size) * 1.5);
    expect(block(90, freeShare)).toBeLessThan(block(0, freeShare));
  });
});

it('harder difficulties leave fewer tiles free at the start', () => {
  const freeShare = id => boards[id].reduce((sum, b) =>
    sum + freeTiles(b.positions.map(() => false), getGraph(b.positions)).size / b.positions.length, 0);
  expect(freeShare('hard')).toBeLessThan(freeShare('normal'));
  expect(freeShare('normal')).toBeLessThan(freeShare('easy'));
});
