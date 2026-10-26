import { it, expect } from 'vitest';
import { sessionReducer } from '../src/logic/session';
import { createProgress } from '../src/logic/progress';
import { row, face } from './helpers';

const A = face('bamboo', 1);

it('records a win, with its stars, in the same update as the winning move', () => {
  let state = { game: null, progress: createProgress() };
  state = sessionReducer(state, { type: 'start', difficulty: 'hard', level: 4, positions: row(2), faces: [A, A] });
  expect(state.progress.difficulty).toBe('hard');

  state = sessionReducer(state, { type: 'select', index: 0 });
  state = sessionReducer(state, { type: 'select', index: 1 });
  expect(state.game.status).toBe('won');
  expect(state.progress.hard.stars[4]).toBe(3);
  expect(state.progress.hard.unlocked).toBe(5);

  // Actions after the win don't record it again
  expect(sessionReducer(state, { type: 'select', index: 0 })).toBe(state);
});
