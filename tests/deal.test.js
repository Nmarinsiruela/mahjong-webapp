import { it, expect } from 'vitest';
import { reshuffle } from '../src/logic/deal';
import { buildLevel } from '../src/logic/levels';
import { createRng } from '../src/utils/rng';
import { matchKey } from '../src/logic/tiles';
import { expectSolvable } from './helpers';

it('reshuffles the remaining tiles into a solvable position', () => {
  const { positions, faces, solution } = buildLevel('hard', 50);
  // Play the first third of the known solution, then shuffle
  const removed = positions.map(() => false);
  for (const [a, b] of solution.slice(0, Math.floor(solution.length / 3))) removed[a] = removed[b] = true;

  for (let seed = 0; seed < 20; seed++) {
    const shuffled = reshuffle(positions, faces, removed, createRng(seed));
    expect(shuffled).not.toBeNull();

    // Removed tiles keep their faces; remaining faces are only rearranged
    const keys = list => list.filter((_, i) => !removed[i]).map(matchKey).sort();
    expect(keys(shuffled.faces)).toEqual(keys(faces));
    removed.forEach((r, i) => r && expect(shuffled.faces[i]).toBe(faces[i]));

    expectSolvable(positions, shuffled.faces, shuffled.solution, removed);
  }
});
