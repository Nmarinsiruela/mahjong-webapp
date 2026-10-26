import { useEffect, useRef } from 'react';
import DifficultyPicker from '../components/DifficultyPicker';
import Stars from '../components/Stars';
import { BackIcon } from '../components/Icons';
import { useI18n } from '../i18n';
import { LEVEL_COUNT } from '../logic/levels';
import { nextLevel, completedCount } from '../logic/progress';
import './LevelSelect.css';

const BLOCK = 10;
const BLOCKS = Array.from({ length: LEVEL_COUNT / BLOCK }, (_, b) =>
  Array.from({ length: BLOCK }, (_, i) => b * BLOCK + i + 1)
);

// A wall of tiles: face-down while locked, face-up once reachable
export default function LevelSelect({ progress, onPlay, onBack, onDifficultyChange }) {
  const { t } = useI18n();
  const { difficulty } = progress;
  const { unlocked, stars } = progress[difficulty];
  const current = nextLevel(progress, difficulty);
  const currentRef = useRef(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'center' });
  }, [difficulty]);

  return (
    <div className="screen levels">
      <header className="bar">
        <button type="button" className="icon-btn" onClick={onBack} aria-label={t.levels.back}>
          <BackIcon />
        </button>
        <h1 className="bar-title">{t.levels.title}</h1>
        <span className="bar-meta">{t.levels.count(completedCount(progress, difficulty), LEVEL_COUNT)}</span>
      </header>

      <div className="levels-picker">
        <DifficultyPicker compact name="levels-difficulty" value={difficulty} onChange={onDifficultyChange} />
      </div>

      <div className="levels-scroll">
        {BLOCKS.map(block => (
          <section key={block[0]} className="level-block" aria-label={t.levels.block(block[0], block.at(-1))}>
            <h2 className="block-label" aria-hidden="true">{block[0]}–{block.at(-1)}</h2>
            <ol className="level-grid">
              {block.map(level => {
                const locked = level > unlocked;
                const rating = stars[level] ?? 0;
                return (
                  <li key={level}>
                    <button
                      type="button"
                      ref={level === current ? currentRef : undefined}
                      className={['level-tile', locked ? 'locked' : 'ivory', level === current && 'current']
                        .filter(Boolean).join(' ')}
                      disabled={locked}
                      onClick={() => onPlay(difficulty, level)}
                      aria-label={locked ? t.levels.locked(level) : t.levels.open(level, rating)}
                    >
                      {!locked && (
                        <>
                          <span className="level-number" aria-hidden="true">{level}</span>
                          {rating > 0 && <Stars count={rating} />}
                        </>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
