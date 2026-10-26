import DifficultyPicker from '../components/DifficultyPicker';
import LanguagePicker from '../components/LanguagePicker';
import { useI18n } from '../i18n';
import { LEVEL_COUNT } from '../logic/levels';
import { nextLevel, completedCount } from '../logic/progress';
import { tilesLeft } from '../logic/game';
import './MenuScreen.css';

export default function MenuScreen({ game, progress, onContinue, onPlay, onLevels, onDifficultyChange }) {
  const { t } = useI18n();
  const { difficulty } = progress;
  const level = nextLevel(progress, difficulty);
  const done = completedCount(progress, difficulty);
  const resumable = game && game.status !== 'won';

  return (
    <div className="screen menu">
      <div className="menu-language">
        <LanguagePicker />
      </div>

      <h1 className="menu-title">{t.titleLines[0]}<br />{t.titleLines[1]}</h1>

      {resumable && (
        <button type="button" className="resume ivory" onClick={onContinue}>
          <span className="resume-label">{t.menu.resume(game.level)}</span>
          <span className="resume-meta">
            {t.menu.resumeDetail(t.difficulty[game.difficulty].name, tilesLeft(game))}
          </span>
        </button>
      )}

      <section className="menu-section" aria-labelledby="difficulty-heading">
        <h2 id="difficulty-heading" className="section-title">{t.difficulty.choose}</h2>
        <DifficultyPicker value={difficulty} onChange={onDifficultyChange} />
        <p className="difficulty-summary" aria-live="polite">{t.difficulty[difficulty].summary}</p>
      </section>

      <div className="menu-actions">
        <button type="button" className="btn btn-primary" onClick={() => onPlay(difficulty, level)}>
          {t.menu.play(level)}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onLevels}>
          {t.menu.chooseLevel}
          <span className="btn-note">{t.menu.completed(done, LEVEL_COUNT)}</span>
        </button>
      </div>
    </div>
  );
}
