import { DIFFICULTIES, DIFFICULTY_IDS } from './difficulty';
import { LEVEL_COUNT } from './levels';

// Per-difficulty progress: the highest level unlocked and the best star
// rating for each completed level ({ [level]: 1..3 }).

export function createProgress() {
  return {
    difficulty: 'normal',
    ...Object.fromEntries(DIFFICULTY_IDS.map(id => [id, { unlocked: 1, stars: {} }])),
  };
}

/** Merges a saved value over the defaults, discarding anything malformed. */
export function normalizeProgress(saved) {
  const progress = createProgress();
  if (!saved || typeof saved !== 'object') return progress;
  if (DIFFICULTIES[saved.difficulty]) progress.difficulty = saved.difficulty;

  for (const id of DIFFICULTY_IDS) {
    const entry = saved[id];
    if (!entry) continue;
    if (Number.isInteger(entry.unlocked)) {
      progress[id].unlocked = Math.min(LEVEL_COUNT, Math.max(1, entry.unlocked));
    }
    for (const [level, stars] of Object.entries(entry.stars ?? {})) {
      if (Number.isInteger(stars) && stars >= 1 && stars <= 3) progress[id].stars[level] = stars;
    }
  }
  return progress;
}

/** Records a win: keeps the best star rating and unlocks the next level. */
export function recordWin(progress, difficulty, level, stars) {
  const entry = progress[difficulty];
  const best = Math.max(entry.stars[level] ?? 0, stars);
  const unlocked = Math.max(entry.unlocked, Math.min(level + 1, LEVEL_COUNT));
  if (best === entry.stars[level] && unlocked === entry.unlocked) return progress;
  return { ...progress, [difficulty]: { unlocked, stars: { ...entry.stars, [level]: best } } };
}

/** The level the "play" button should start: the first unlocked one not yet won. */
export function nextLevel(progress, difficulty) {
  const { unlocked, stars } = progress[difficulty];
  for (let level = 1; level <= unlocked; level++) {
    if (!stars[level]) return level;
  }
  return unlocked;
}

export function completedCount(progress, difficulty) {
  return Object.keys(progress[difficulty].stars).length;
}
