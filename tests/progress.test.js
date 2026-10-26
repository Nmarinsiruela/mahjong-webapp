import { describe, it, expect } from 'vitest';
import { createProgress, normalizeProgress, recordWin, nextLevel, completedCount } from '../src/logic/progress';
import { LEVEL_COUNT } from '../src/logic/levels';

describe('progress', () => {
  it('starts with level 1 unlocked on every difficulty', () => {
    const progress = createProgress();
    expect(progress.easy.unlocked).toBe(1);
    expect(nextLevel(progress, 'hard')).toBe(1);
  });

  it('unlocks the next level and keeps the best stars', () => {
    let progress = recordWin(createProgress(), 'hard', 1, 2);
    expect(progress.hard).toEqual({ unlocked: 2, stars: { 1: 2 } });
    expect(progress.easy.unlocked).toBe(1);

    progress = recordWin(progress, 'hard', 1, 1);
    expect(progress.hard.stars[1]).toBe(2);
    progress = recordWin(progress, 'hard', 1, 3);
    expect(progress.hard.stars[1]).toBe(3);
  });

  it('returns the same object when nothing changes', () => {
    const progress = recordWin(createProgress(), 'easy', 1, 3);
    expect(recordWin(progress, 'easy', 1, 3)).toBe(progress);
  });

  it('never unlocks past the last level', () => {
    const progress = recordWin(createProgress(), 'easy', LEVEL_COUNT, 3);
    expect(progress.easy.unlocked).toBe(LEVEL_COUNT);
  });

  it('points "play" at the first unlocked level not yet won', () => {
    let progress = recordWin(createProgress(), 'normal', 1, 3);
    progress = recordWin(progress, 'normal', 2, 3);
    expect(nextLevel(progress, 'normal')).toBe(3);
    expect(completedCount(progress, 'normal')).toBe(2);
  });

  it('discards malformed saved data', () => {
    const progress = normalizeProgress({
      difficulty: 'impossible',
      easy: { unlocked: 999, stars: { 1: 3, 2: 7, 3: 'x' } },
      hard: 'nope',
    });
    expect(progress.difficulty).toBe('normal');
    expect(progress.easy).toEqual({ unlocked: LEVEL_COUNT, stars: { 1: 3 } });
    expect(progress.hard).toEqual({ unlocked: 1, stars: {} });
    expect(normalizeProgress(null)).toEqual(createProgress());
  });
});
