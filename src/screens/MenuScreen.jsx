import DifficultyPicker from '../components/DifficultyPicker';
import { DIFFICULTIES } from '../logic/difficulty';
import { LEVEL_COUNT } from '../logic/levels';
import { nextLevel, completedCount } from '../logic/progress';
import { tilesLeft } from '../logic/game';
import './MenuScreen.css';

export default function MenuScreen({ game, progress, onContinue, onPlay, onLevels, onDifficultyChange }) {
  const { difficulty } = progress;
  const level = nextLevel(progress, difficulty);
  const done = completedCount(progress, difficulty);
  const resumable = game && game.status !== 'won';

  return (
    <div className="screen menu">
      <h1 className="menu-title">Mahjong<br />Solitario</h1>

      {resumable && (
        <button type="button" className="resume ivory" onClick={onContinue}>
          <span className="resume-label">Continuar el nivel {game.level}</span>
          <span className="resume-meta">
            {DIFFICULTIES[game.difficulty].name}, quedan {tilesLeft(game)} fichas
          </span>
        </button>
      )}

      <section className="menu-section" aria-labelledby="difficulty-heading">
        <h2 id="difficulty-heading" className="section-title">Elige la dificultad</h2>
        <DifficultyPicker value={difficulty} onChange={onDifficultyChange} />
        <p className="difficulty-summary" aria-live="polite">{DIFFICULTIES[difficulty].summary}</p>
      </section>

      <div className="menu-actions">
        <button type="button" className="btn btn-primary" onClick={() => onPlay(difficulty, level)}>
          Jugar el nivel {level}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onLevels}>
          Elegir nivel
          <span className="btn-note">{done} de {LEVEL_COUNT} superados</span>
        </button>
      </div>
    </div>
  );
}
