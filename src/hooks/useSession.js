import { useReducer, useEffect, useMemo } from 'react';
import { sessionReducer } from '../logic/session';
import { normalizeProgress } from '../logic/progress';
import { buildLevel, LEVEL_COUNT } from '../logic/levels';
import { DIFFICULTIES } from '../logic/difficulty';
import { randomSeed } from '../utils/rng';
import { load, save } from '../utils/storage';

const GAME_KEY = 'mahjong:game:v2';
const PROGRESS_KEY = 'mahjong:progress:v1';

function isValidGame(g) {
  if (!g || !DIFFICULTIES[g.difficulty]) return false;
  if (!Number.isInteger(g.level) || g.level < 1 || g.level > LEVEL_COUNT) return false;
  const n = g.positions?.length;
  return n > 0 && g.faces?.length === n && g.removed?.length === n
    && Array.isArray(g.history) && typeof g.used === 'object' && g.used !== null;
}

function loadSession() {
  const game = load(GAME_KEY);
  return {
    game: isValidGame(game) ? game : null,
    progress: normalizeProgress(load(PROGRESS_KEY)),
  };
}

/** The level in progress, progress across levels, and the actions on both. */
export function useSession() {
  const [{ game, progress }, dispatch] = useReducer(sessionReducer, null, loadSession);

  // Persist after every change so a reload resumes mid-level
  useEffect(() => {
    if (game) save(GAME_KEY, game);
  }, [game]);
  useEffect(() => save(PROGRESS_KEY, progress), [progress]);

  const actions = useMemo(() => ({
    start: (difficulty, level) => dispatch({ type: 'start', difficulty, level, ...buildLevel(difficulty, level) }),
    setDifficulty: difficulty => dispatch({ type: 'set-difficulty', difficulty }),
    select: index => dispatch({ type: 'select', index }),
    undo: () => dispatch({ type: 'undo' }),
    hint: () => dispatch({ type: 'hint' }),
    shuffle: () => dispatch({ type: 'shuffle', seed: randomSeed() }),
  }), []);

  return { game, progress, actions };
}
