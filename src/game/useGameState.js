import { useReducer, useCallback } from 'react';
import { ALL_TILES, tilesMatch } from './tiles';
import { buildLayout } from './layout';
import { isFree, hasAnyMoves } from './rules';

function newGame() {
  const board = buildLayout(ALL_TILES);
  return {
    board,
    selected: null,   // uid of selected tile
    removed: 0,
    status: 'playing', // 'playing' | 'won' | 'stuck'
    message: '',
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'NEW_GAME':
      return newGame();

    case 'SELECT': {
      const { uid } = action;
      const board = state.board;
      const tile = board.find(t => t.uid === uid);

      if (!tile || tile.removed || !isFree(tile, board)) return state;

      // Deselect if clicking the same tile
      if (state.selected === uid) {
        return {
          ...state,
          selected: null,
          board: board.map(t => ({ ...t, selected: false })),
        };
      }

      // No previous selection — select this tile
      if (state.selected === null) {
        return {
          ...state,
          selected: uid,
          board: board.map(t => ({ ...t, selected: t.uid === uid })),
        };
      }

      // Second tile selected — try to match
      const prev = board.find(t => t.uid === state.selected);
      if (tilesMatch(prev, tile)) {
        const newBoard = board.map(t =>
          t.uid === prev.uid || t.uid === uid
            ? { ...t, removed: true, selected: false }
            : { ...t, selected: false }
        );
        const removed = state.removed + 2;
        if (removed === 144) {
          return { ...state, board: newBoard, removed, selected: null, status: 'won', message: 'Has ganado!' };
        }
        const stuck = !hasAnyMoves(newBoard);
        return {
          ...state,
          board: newBoard,
          removed,
          selected: null,
          status: stuck ? 'stuck' : 'playing',
          message: stuck ? 'Sin movimientos posibles.' : '',
        };
      }

      // No match — switch selection to new tile
      return {
        ...state,
        selected: uid,
        board: board.map(t => ({ ...t, selected: t.uid === uid })),
      };
    }

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, null, newGame);

  const select = useCallback((uid) => dispatch({ type: 'SELECT', uid }), []);
  const newGame_ = useCallback(() => dispatch({ type: 'NEW_GAME' }), []);

  return { state, select, newGame: newGame_ };
}
