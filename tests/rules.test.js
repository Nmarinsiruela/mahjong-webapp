import { describe, it, expect } from 'vitest';
import { getGraph, freeTiles, createTracker, suggestMove } from '../src/logic/rules';
import { buildLevel } from '../src/logic/levels';
import { createRng } from '../src/utils/rng';
import { row, face } from './helpers';

const sorted = set => [...set].sort((a, b) => a - b);

describe('free tiles', () => {
  it('frees only the ends of a row', () => {
    const positions = row(4);
    expect(sorted(freeTiles(positions.map(() => false), getGraph(positions)))).toEqual([0, 3]);
  });

  it('blocks a tile covered from any higher layer, not just the next one', () => {
    const positions = [...row(3), { col: 2, row: 0, layer: 2 }];
    const graph = getGraph(positions);
    // Tile 0 has nothing on its right; tile 1 is open on its left but covered
    expect(freeTiles([false, true, false, false], graph).has(0)).toBe(true);
    expect(freeTiles([true, false, false, false], graph).has(1)).toBe(false);
  });

  it('lets a half-row offset "wing" block the ends of two rows', () => {
    const positions = [...row(2), ...row(2, { rowIndex: 1 }), { col: -2, row: 1, layer: 0 }];
    const graph = getGraph(positions);
    expect(graph.left[0]).toEqual([4]);
    expect(graph.left[2]).toEqual([4]);
    expect(sorted(freeTiles([false, false, false, false, false], graph))).toEqual([1, 3, 4]);
    expect(sorted(freeTiles([false, false, false, false, true], graph))).toEqual([0, 1, 2, 3]);
  });

  it('stays right when updated one removal at a time', () => {
    const { positions, solution } = buildLevel('hard', 80);
    const graph = getGraph(positions);
    const removed = positions.map(() => false);
    const tracker = createTracker(graph, removed);

    for (const [a, b] of solution) {
      tracker.remove(a);
      tracker.remove(b);
      removed[a] = removed[b] = true;
      expect(sorted(tracker.free)).toEqual(sorted(freeTiles(removed, graph)));
      expect(tracker.remaining).toBe(removed.filter(r => !r).length);
    }
  });
});

describe('suggestMove', () => {
  const positions = row(4);
  const graph = getGraph(positions);
  const none = [false, false, false, false];

  it('pairs any two flowers', () => {
    const faces = [face('flowers', 'plum'), face('bamboo', 1), face('bamboo', 1), face('flowers', 'orchid')];
    expect(suggestMove(positions, faces, none, graph)).toEqual([0, 3]);
  });

  it('returns null when the free tiles differ', () => {
    const faces = [face('dragons', 'red'), face('bamboo', 1), face('bamboo', 1), face('bamboo', 2)];
    expect(suggestMove(positions, faces, none, graph)).toBeNull();
  });

  it('prefers a safe match over a higher, risky one', () => {
    const stacked = [
      ...row(4),                    // 0-3: only 0 and 3 free
      { col: 0, row: 2, layer: 0 }, // 4
      { col: 0, row: 4, layer: 0 }, // 5: hidden under 6
      { col: 0, row: 4, layer: 1 }, // 6
      { col: 0, row: 6, layer: 0 }, // 7
    ];
    // Three of four circles-5 are free: pairing two may strand the hidden one.
    // Both remaining bamboo-2 are free, so that match is safe.
    const faces = [
      face('circles', 5), face('winds', 'east'), face('winds', 'east'), face('bamboo', 2),
      face('circles', 5), face('circles', 5), face('circles', 5), face('bamboo', 2),
    ];
    const removed = stacked.map(() => false);
    expect(suggestMove(stacked, faces, removed, getGraph(stacked))).toEqual([3, 7]);
  });
});

it('createRng is deterministic and never picks a zero weight', () => {
  const a = createRng(42);
  const b = createRng(42);
  expect([a.next(), a.next()]).toEqual([b.next(), b.next()]);
  expect([...createRng(1).shuffle([1, 2, 3, 4, 5])].sort()).toEqual([1, 2, 3, 4, 5]);
  const rng = createRng(3);
  for (let i = 0; i < 200; i++) expect([1, 3]).toContain(rng.weightedIndex([0, 1, 0, 2]));
});
