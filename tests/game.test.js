import { describe, it, expect } from 'vitest';
import { gameReducer, createGame, assistsLeft, canUse, starsFor, tilesLeft } from '../src/logic/game';
import { row, face } from './helpers';

const A = face('bamboo', 1);
const B = face('circles', 2);

function play(state, ...actions) {
  return actions.reduce(gameReducer, state);
}
const select = index => ({ type: 'select', index });

function simpleGame(difficulty = 'normal') {
  // Row of four: A B B A — only the ends are free at first
  return createGame({ difficulty, level: 1, positions: row(4), faces: [A, B, B, A] });
}

// Tiles 0-3 form a row (A B A B); 4 and 5 are free singles (A A). Matching
// 4+5 strands the A between B's: the free ends are A and B, so no moves.
function trapGame(difficulty) {
  const positions = [...row(4), { col: 0, row: 2, layer: 0 }, { col: 0, row: 4, layer: 0 }];
  return createGame({ difficulty, level: 1, positions, faces: [A, B, A, B, A, A] });
}

describe('selecting', () => {
  it('ignores blocked tiles', () => {
    const game = simpleGame();
    expect(play(game, select(1))).toBe(game);
  });

  it('selects, deselects and switches selection on a mismatch', () => {
    const game = simpleGame();
    expect(play(game, select(0)).selected).toBe(0);
    expect(play(game, select(0), select(0)).selected).toBeNull();
  });

  it('removes matching pairs and wins when the board is clear', () => {
    let game = play(simpleGame(), select(0), select(3));
    expect(game.removed).toEqual([true, false, false, true]);
    expect(game.history).toEqual([[0, 3]]);
    expect(tilesLeft(game)).toBe(2);
    expect(game.status).toBe('playing');

    game = play(game, select(1), select(2));
    expect(game.status).toBe('won');
  });

  it('detects being stuck', () => {
    expect(play(trapGame('normal'), select(4), select(5)).status).toBe('stuck');
  });
});

describe('assists', () => {
  it('undo restores the last pair and counts against the limit', () => {
    const stuck = play(trapGame('normal'), select(4), select(5));
    const undone = play(stuck, { type: 'undo' });
    expect(undone.status).toBe('playing');
    expect(undone.removed.every(r => !r)).toBe(true);
    expect(assistsLeft(undone).undos).toBe(2);
  });

  it('hard mode has no undo or hints', () => {
    const stuck = play(trapGame('hard'), select(4), select(5));
    expect(play(stuck, { type: 'undo' })).toBe(stuck);
    expect(play(trapGame('hard'), { type: 'hint' }).hint).toBeNull();
  });

  it('easy mode assists are unlimited', () => {
    const game = trapGame('easy');
    expect(assistsLeft(game)).toEqual({ hints: Infinity, undos: Infinity, shuffles: Infinity });
  });

  it('a hint highlights a pair once until it is used', () => {
    const hinted = play(simpleGame(), { type: 'hint' });
    expect(hinted.hint).toEqual([0, 3]);
    expect(play(hinted, { type: 'hint' })).toBe(hinted);
    expect(play(hinted, select(0), select(3)).hint).toBeNull();
  });

  it('shuffling gets a stuck board moving again', () => {
    const stuck = play(trapGame('hard'), select(4), select(5));
    const shuffled = play(stuck, { type: 'shuffle', seed: 1 });
    expect(shuffled.status).toBe('playing');
    expect(assistsLeft(shuffled).shuffles).toBe(0);
    expect(play(shuffled, { type: 'shuffle', seed: 2 })).toBe(shuffled);
  });

  it('reports a shuffle that cannot help', () => {
    // Two A's left stacked on each other can never both be free
    const positions = [{ col: 0, row: 0, layer: 0 }, { col: 0, row: 0, layer: 1 }, { col: 4, row: 0, layer: 0 }, { col: 8, row: 0, layer: 0 }];
    const game = createGame({ difficulty: 'normal', level: 1, positions, faces: [A, A, B, B] });
    const stuck = play(game, select(2), select(3));
    expect(stuck.status).toBe('stuck');
    const failed = play(stuck, { type: 'shuffle', seed: 1 });
    expect(failed.shuffleFailed).toBe(true);
    // No arrangement can help, so shuffling isn't offered again
    expect(canUse(failed).shuffle).toBe(false);
    expect(play(failed, { type: 'shuffle', seed: 2 })).toBe(failed);
  });
});

it('awards fewer stars the more assists were used', () => {
  expect(starsFor({ hints: 0, undos: 0, shuffles: 0 })).toBe(3);
  expect(starsFor({ hints: 1, undos: 1, shuffles: 0 })).toBe(2);
  expect(starsFor({ hints: 2, undos: 0, shuffles: 1 })).toBe(1);
});
