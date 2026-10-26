import { expect } from 'vitest';
import { getGraph, freeTiles } from '../src/logic/rules';
import { tilesMatch } from '../src/logic/tiles';

/** Plays `solution` from `removed`, asserting every pair is free and matches. */
export function expectSolvable(positions, faces, solution, removed = positions.map(() => false)) {
  const graph = getGraph(positions);
  const state = [...removed];
  for (const [a, b] of solution) {
    const free = freeTiles(state, graph);
    expect(free.has(a) && free.has(b)).toBe(true);
    expect(tilesMatch(faces[a], faces[b])).toBe(true);
    state[a] = state[b] = true;
  }
  expect(state.every(Boolean)).toBe(true);
}

/** A flat row of tiles on layer 0, e.g. row(4) → cols 0, 2, 4, 6. */
export function row(length, { rowIndex = 0, layer = 0 } = {}) {
  return Array.from({ length }, (_, i) => ({ col: i * 2, row: rowIndex * 2, layer }));
}

export const face = (suit, value) => ({ suit, value });
