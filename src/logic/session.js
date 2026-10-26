import { gameReducer, starsFor } from './game';
import { recordWin } from './progress';

// Everything the app persists: the level in progress (null before the first
// one) and progress across levels. A win is recorded in the same update as
// the winning move, so the two can never disagree.
export function sessionReducer(state, action) {
  if (action.type === 'set-difficulty') {
    if (state.progress.difficulty === action.difficulty) return state;
    return { ...state, progress: { ...state.progress, difficulty: action.difficulty } };
  }

  const game = gameReducer(state.game, action);
  if (game === state.game) return state;

  let { progress } = state;
  if (action.type === 'start') progress = { ...progress, difficulty: game.difficulty };
  if (game.status === 'won' && state.game?.status !== 'won') {
    progress = recordWin(progress, game.difficulty, game.level, starsFor(game.used));
  }
  return { game, progress };
}
