import Board from './Board';
import Toolbar from './Toolbar';
import ResultPanel from './ResultPanel';
import { BackIcon } from '../../components/Icons';
import { useI18n } from '../../i18n';
import { DIFFICULTIES } from '../../logic/difficulty';
import { tilesLeft } from '../../logic/game';
import './GameScreen.css';

export default function GameScreen({ game, actions, onExit, onNextLevel, onRestart }) {
  const { t } = useI18n();
  const preset = DIFFICULTIES[game.difficulty];

  return (
    <div className="screen game">
      <header className="bar">
        <button type="button" className="icon-btn" onClick={onExit} aria-label={t.game.back}>
          <BackIcon />
        </button>
        <div className="game-heading">
          <h1 className="bar-title">{t.game.level(game.level)}</h1>
          <span className={`difficulty-tag ${game.difficulty}`}>
            <span className="difficulty-glyph" aria-hidden="true">{preset.glyph}</span>
            {t.difficulty[game.difficulty].name}
          </span>
        </div>
        <p className="tiles-left">
          <strong>{tilesLeft(game)}</strong> {t.game.tiles}
        </p>
      </header>

      <main className="board-area">
        <Board
          key={`${game.difficulty}:${game.level}`}
          positions={game.positions}
          faces={game.faces}
          removed={game.removed}
          selected={game.selected}
          hint={game.hint}
          dimBlocked={preset.dimBlocked}
          onSelect={actions.select}
        />
        <ResultPanel
          game={game}
          actions={actions}
          onNextLevel={onNextLevel}
          onExit={onExit}
          onRestart={onRestart}
        />
      </main>

      <Toolbar game={game} actions={actions} onRestart={onRestart} />
    </div>
  );
}
