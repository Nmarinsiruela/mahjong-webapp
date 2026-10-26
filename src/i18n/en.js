// English. Same shape as es.js.
export default {
  title: 'Mahjong Solitaire',
  titleLines: ['Mahjong', 'Solitaire'],
  language: 'Language',
  stars: n => `${n} of 3 stars`,

  difficulty: {
    label: 'Difficulty',
    choose: 'Choose a difficulty',
    easy: { name: 'Easy', summary: 'Low, open boards. Unlimited hints, undos and shuffles.' },
    normal: { name: 'Normal', summary: 'Taller stacks and the odd trap. 3 hints, 3 undos and 2 shuffles per level.' },
    hard: { name: 'Hard', summary: 'High towers, long rows and misleading pairs. No hints or undos, and blocked tiles aren’t marked.' },
  },

  menu: {
    resume: level => `Continue level ${level}`,
    resumeDetail: (difficulty, tiles) => `${difficulty}, ${tiles} tiles left`,
    play: level => `Play level ${level}`,
    chooseLevel: 'Choose level',
    completed: (done, total) => `${done} of ${total} completed`,
  },

  levels: {
    title: 'Levels',
    back: 'Back to menu',
    count: (done, total) => `${done} of ${total}`,
    block: (from, to) => `Levels ${from} to ${to}`,
    locked: level => `Level ${level}, locked`,
    open: (level, stars) => (stars ? `Level ${level}, completed with ${stars} of 3 stars` : `Level ${level}`),
  },

  game: {
    level: level => `Level ${level}`,
    back: 'Back to levels',
    tiles: 'tiles',
    blocked: name => `${name}, blocked`,
    assists: 'Assists',
    undo: 'Undo',
    hint: 'Hint',
    shuffle: 'Shuffle',
    restart: 'Restart',
    confirmRestart: 'Tap again',
    left: n => `${n} left`,
  },

  result: {
    won: level => `Level ${level} complete`,
    allDone: (total, difficulty) => `You’ve completed all ${total} levels on ${difficulty}.`,
    noAssists: 'No assists used.',
    usedAssists: n => `You used ${n} ${n === 1 ? 'assist' : 'assists'}. Finish without any for three stars.`,
    nextLevel: 'Next level',
    viewLevels: 'View levels',
    stuck: 'No free pairs left',
    adviceShuffleFailed: 'The remaining tiles are stacked so that no shuffle can free them. Restart the level.',
    adviceShuffle: 'Shuffle the remaining tiles or restart the level.',
    adviceUndo: 'Undo the last pair or restart the level.',
    adviceRestart: 'Restart the level to try again.',
    restartLevel: 'Restart level',
  },

  // Tile names, read out by screen readers
  tiles: {
    characters: v => `${v} of Characters`,
    bamboo: v => `${v} of Bamboo`,
    circles: v => `${v} of Circles`,
    winds: { east: 'East Wind', south: 'South Wind', west: 'West Wind', north: 'North Wind' },
    dragons: { red: 'Red Dragon', green: 'Green Dragon', white: 'White Dragon' },
    flowers: { plum: 'Flower: plum', orchid: 'Flower: orchid', chrysanthemum: 'Flower: chrysanthemum', bamboo: 'Flower: bamboo' },
    seasons: { spring: 'Season: spring', summer: 'Season: summer', autumn: 'Season: autumn', winter: 'Season: winter' },
  },
};
