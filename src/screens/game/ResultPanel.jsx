import Stars from '../../components/Stars';
import { useI18n } from '../../i18n';
import { LEVEL_COUNT } from '../../logic/levels';
import { assistsLeft, canUse, starsFor } from '../../logic/game';
import './ResultPanel.css';

function Dialog({ className = '', children }) {
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="result-title">
      <div className={`panel ivory ${className}`}>{children}</div>
    </div>
  );
}

function Won({ game, onNextLevel, onExit }) {
  const { t } = useI18n();
  const assists = game.used.hints + game.used.undos + game.used.shuffles;
  const last = game.level === LEVEL_COUNT;

  return (
    <Dialog className="panel-win">
      <Stars count={starsFor(game.used)} size="lg" />
      <h2 id="result-title">{t.result.won(game.level)}</h2>
      <p>
        {last
          ? t.result.allDone(LEVEL_COUNT, t.difficulty[game.difficulty].name)
          : assists === 0 ? t.result.noAssists : t.result.usedAssists(assists)}
      </p>
      <div className="panel-actions">
        {!last && (
          <button type="button" className="btn btn-primary" onClick={onNextLevel} autoFocus>
            {t.result.nextLevel}
          </button>
        )}
        <button type="button" className="btn btn-plain" onClick={onExit}>{t.result.viewLevels}</button>
      </div>
    </Dialog>
  );
}

function Stuck({ game, actions, onRestart }) {
  const { t } = useI18n();
  const left = assistsLeft(game);
  const can = canUse(game);
  const remaining = n => (Number.isFinite(n) ? ` (${t.game.left(n)})` : '');

  let advice = t.result.adviceRestart;
  if (game.shuffleFailed) advice = t.result.adviceShuffleFailed;
  else if (can.shuffle) advice = t.result.adviceShuffle;
  else if (can.undo) advice = t.result.adviceUndo;

  // The first available way out is the primary button
  const style = primary => (primary ? 'btn btn-primary' : 'btn btn-plain');

  return (
    <Dialog>
      <h2 id="result-title">{t.result.stuck}</h2>
      <p>{advice}</p>
      <div className="panel-actions">
        {can.shuffle && (
          <button type="button" className={style(true)} onClick={actions.shuffle}>
            {t.game.shuffle}{remaining(left.shuffles)}
          </button>
        )}
        {can.undo && (
          <button type="button" className={style(!can.shuffle)} onClick={actions.undo}>
            {t.game.undo}{remaining(left.undos)}
          </button>
        )}
        <button type="button" className={style(!can.shuffle && !can.undo)} onClick={onRestart}>
          {t.result.restartLevel}
        </button>
      </div>
    </Dialog>
  );
}

/** The panel shown over the board once a level is won or stuck. */
export default function ResultPanel({ game, ...props }) {
  if (game.status === 'won') return <Won game={game} {...props} />;
  if (game.status === 'stuck') return <Stuck game={game} {...props} />;
  return null;
}
