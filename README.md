# Mahjong Solitario

Mahjong solitaire for the browser, built mobile-first with React and Vite.
There are 100 procedurally generated levels for each of three difficulties
(Easy, Normal, Hard), and every board is guaranteed to be solvable. The game
is available in Spanish and English.

## Scripts

```sh
npm run dev      # dev server
npm test         # game logic tests (Vitest), including all 300 levels
npm run lint
npm run build
```

## How it fits together

```
src/
  logic/       game rules, level generation and state, as plain functions (no React)
  utils/       generic helpers: seeded random numbers, safe localStorage
  hooks/       useSession (state + persistence), useElementSize
  i18n/        UI text in Spanish and English, and the language context
  components/  UI pieces shared by screens: DifficultyPicker, LanguagePicker, Stars, Icons
  screens/     MenuScreen, LevelSelect, and game/ (GameScreen, Board, tiles, toolbar, result panel)
  styles/      design tokens and shared controls; other CSS sits next to its component
tests/         Vitest tests for src/logic
```

The UI only renders state and dispatches actions; every game rule is in `src/logic/`:

| File | Role |
| --- | --- |
| `tiles.js` | Tile faces and match classes (flowers and seasons match within their group) |
| `rules.js` | Which tiles are free (tracked incrementally for simulations) and the hint heuristic |
| `layout.js` | Procedural layouts: symmetric heightmaps fitted to a target tile count |
| `deal.js` | Solvable deals and shuffles, rated by simulated play |
| `difficulty.js` | Difficulty presets: every tuning knob in one place |
| `levels.js` | Turns (difficulty, level) into a deterministic board |
| `game.js` | One level being played: select, undo, hint, shuffle, and when each is allowed |
| `progress.js` | Unlocked levels and star ratings |
| `session.js` | Combines game and progress, so a win is recorded with the winning move |

### Levels

`buildLevel(difficulty, level)` is seeded from its arguments, so a level is
always the same board. Each difficulty preset gives a range of values for
level 1 and level 100, and the levels in between are interpolated. Progress
comes in waves: each block of ten ends a little harder than the next block
starts.

### Solvable deals

A deal starts as a removal plan. Pairs of currently free positions are taken
off one at a time until the board is empty, and each pair then gets matching
faces. Playing the plan forwards is a solution.

Several candidate deals are generated and each is played many times by two
simulated players: a careless one (any match) and a careful one (safe matches
first, then the highest tiles). A deal is only accepted if the careful player
wins often enough for the difficulty. Among the accepted deals, harder
difficulties pick the ones a careless player loses most often.

### Tuning difficulty

Everything is in `src/logic/difficulty.js`. After changing it, run
`npm test`: the level tests check that every board is valid and solvable,
that boards grow and tighten across the 100 levels, and that harder
difficulties leave fewer tiles free.

### Languages

All UI text lives in `src/i18n/`, one file per language with the same shape
(`es.js`, `en.js`). Components read it with `const { t } = useI18n()`, e.g.
`t.menu.play(level)`; messages that include numbers are functions, so each
language handles its own plurals. The first visit follows the browser's
language (Spanish or English, otherwise English); the picker on the menu
saves an explicit choice.

To add a language, copy `en.js`, translate it, and register it in
`MESSAGES` and `LANGUAGES` in `src/i18n/index.js`. `npm test` checks that
every language has exactly the same messages as Spanish.
