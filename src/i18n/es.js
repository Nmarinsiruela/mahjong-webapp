// Spanish. Every language file has the same shape; messages that take values
// are functions so each language can handle plurals its own way.
export default {
  title: 'Mahjong Solitario',
  titleLines: ['Mahjong', 'Solitario'],
  language: 'Idioma',
  stars: n => `${n} de 3 estrellas`,

  difficulty: {
    label: 'Dificultad',
    choose: 'Elige la dificultad',
    easy: { name: 'Fácil', summary: 'Tableros bajos y abiertos. Pistas, deshacer y barajar sin límite.' },
    normal: { name: 'Normal', summary: 'Pilas más altas y alguna trampa. 3 pistas, 3 deshacer y 2 barajadas por nivel.' },
    hard: { name: 'Difícil', summary: 'Torres altas, filas largas y parejas engañosas. Sin pistas ni deshacer, y las fichas bloqueadas no se marcan.' },
  },

  menu: {
    resume: level => `Continuar el nivel ${level}`,
    resumeDetail: (difficulty, tiles) => `${difficulty}, quedan ${tiles} fichas`,
    play: level => `Jugar el nivel ${level}`,
    chooseLevel: 'Elegir nivel',
    completed: (done, total) => `${done} de ${total} superados`,
  },

  levels: {
    title: 'Niveles',
    back: 'Volver al menú',
    count: (done, total) => `${done} de ${total}`,
    block: (from, to) => `Niveles ${from} a ${to}`,
    locked: level => `Nivel ${level}, bloqueado`,
    open: (level, stars) => (stars ? `Nivel ${level}, superado con ${stars} de 3 estrellas` : `Nivel ${level}`),
  },

  game: {
    level: level => `Nivel ${level}`,
    back: 'Volver a los niveles',
    tiles: 'fichas',
    blocked: name => `${name}, bloqueada`,
    assists: 'Ayudas',
    undo: 'Deshacer',
    hint: 'Pista',
    shuffle: 'Barajar',
    restart: 'Reiniciar',
    confirmRestart: 'Toca otra vez',
    left: n => (n === 1 ? 'queda 1' : `quedan ${n}`),
  },

  result: {
    won: level => `Nivel ${level} superado`,
    allDone: (total, difficulty) => `Has completado los ${total} niveles en ${difficulty}.`,
    noAssists: 'Sin usar ninguna ayuda.',
    usedAssists: n => `Usaste ${n} ${n === 1 ? 'ayuda' : 'ayudas'}. Sin ayudas consigues las tres estrellas.`,
    nextLevel: 'Siguiente nivel',
    viewLevels: 'Ver niveles',
    stuck: 'No quedan parejas libres',
    adviceShuffleFailed: 'Las fichas que quedan están apiladas de forma que ninguna mezcla las libera. Reinicia el nivel.',
    adviceShuffle: 'Baraja las fichas que quedan o reinicia el nivel.',
    adviceUndo: 'Deshaz la última pareja o reinicia el nivel.',
    adviceRestart: 'Reinicia el nivel para intentarlo de nuevo.',
    restartLevel: 'Reiniciar el nivel',
  },

  // Tile names, read out by screen readers
  tiles: {
    characters: v => `Carácter ${v}`,
    bamboo: v => `Bambú ${v}`,
    circles: v => `Círculo ${v}`,
    winds: { east: 'Viento este', south: 'Viento sur', west: 'Viento oeste', north: 'Viento norte' },
    dragons: { red: 'Dragón rojo', green: 'Dragón verde', white: 'Dragón blanco' },
    flowers: { plum: 'Flor, ciruelo', orchid: 'Flor, orquídea', chrysanthemum: 'Flor, crisantemo', bamboo: 'Flor, bambú' },
    seasons: { spring: 'Estación, primavera', summer: 'Estación, verano', autumn: 'Estación, otoño', winter: 'Estación, invierno' },
  },
};
