import { DIFFICULTIES } from './difficulty';
import { getGraph, freeTiles, suggestMove } from './rules';
import { tilesMatch } from './tiles';
import { reshuffle } from './deal';
import { createRng } from '../utils/rng';

// State for one level being played. Positions never change during a level,
// faces only change when shuffling, and `removed` tracks matched tiles — all
// three are parallel arrays indexed by tile.
export function createGame({ difficulty, level, positions, faces }) {
  return {
    difficulty,
    level,
    positions,
    faces,
    removed: positions.map(() => false),
    selected: null,     // index of the selected tile
    hint: null,         // [i, j] currently highlighted
    history: [],        // matched pairs, most recent last, for undo
    used: { hints: 0, undos: 0, shuffles: 0 },
    status: 'playing',  // 'playing' | 'won' | 'stuck'
    shuffleFailed: false,
  };
}

/** Assists left this level; Infinity when the difficulty doesn't limit them. */
export function assistsLeft({ difficulty, used }) {
  const { hints, undos, shuffles } = DIFFICULTIES[difficulty].assists;
  return { hints: hints - used.hints, undos: undos - used.undos, shuffles: shuffles - used.shuffles };
}

/** Which assists can be used right now. */
export function canUse(state) {
  const left = assistsLeft(state);
  return {
    undo: state.status !== 'won' && left.undos > 0 && state.history.length > 0,
    hint: state.status === 'playing' && left.hints > 0 && state.hint === null,
    // A failed shuffle means no arrangement helps, so retrying is pointless
    shuffle: state.status !== 'won' && left.shuffles > 0 && !state.shuffleFailed,
  };
}

export function starsFor(used) {
  const assists = used.hints + used.undos + used.shuffles;
  return assists === 0 ? 3 : assists <= 2 ? 2 : 1;
}

export function tilesLeft(state) {
  return state.removed.filter(r => !r).length;
}

function withStatus(state) {
  if (state.removed.every(Boolean)) return { ...state, status: 'won' };
  // Stuck exactly when even the hint can't find a move
  const stuck = !suggestMove(state.positions, state.faces, state.removed, getGraph(state.positions));
  return { ...state, status: stuck ? 'stuck' : 'playing', shuffleFailed: false };
}

export function gameReducer(state, action) {
  if (action.type === 'start') return createGame(action);
  if (!state) return state;
  const can = canUse(state);

  switch (action.type) {
    case 'select': {
      const { index } = action;
      const free = freeTiles(state.removed, getGraph(state.positions));
      if (state.status !== 'playing' || !free.has(index)) return state;
      if (state.selected === index) return { ...state, selected: null };
      if (state.selected === null || !tilesMatch(state.faces[state.selected], state.faces[index])) {
        return { ...state, selected: index };
      }

      const removed = [...state.removed];
      removed[state.selected] = removed[index] = true;
      return withStatus({
        ...state,
        removed,
        selected: null,
        hint: null,
        history: [...state.history, [state.selected, index]],
      });
    }

    case 'undo': {
      if (!can.undo) return state;
      const [a, b] = state.history.at(-1);
      const removed = [...state.removed];
      removed[a] = removed[b] = false;
      return withStatus({
        ...state,
        removed,
        selected: null,
        hint: null,
        history: state.history.slice(0, -1),
        used: { ...state.used, undos: state.used.undos + 1 },
      });
    }

    case 'hint': {
      if (!can.hint) return state;
      const hint = suggestMove(state.positions, state.faces, state.removed, getGraph(state.positions));
      if (!hint) return state;
      return { ...state, hint, used: { ...state.used, hints: state.used.hints + 1 } };
    }

    case 'shuffle': {
      if (!can.shuffle) return state;
      // The seed comes from the action so the reducer stays pure
      const shuffled = reshuffle(state.positions, state.faces, state.removed, createRng(action.seed));
      if (!shuffled) return { ...state, shuffleFailed: true };
      return withStatus({
        ...state,
        faces: shuffled.faces,
        selected: null,
        hint: null,
        used: { ...state.used, shuffles: state.used.shuffles + 1 },
      });
    }

    default:
      return state;
  }
}
