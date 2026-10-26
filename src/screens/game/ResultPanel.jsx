import Stars from '../../components/Stars';
import { DIFFICULTIES } from '../../logic/difficulty';
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
  const assists = game.used.hints + game.used.undos + game.used.shuffles;
  const last = game.level === LEVEL_COUNT;

  return (
    <Dialog className="panel-win">
      <Stars count={starsFor(game.used)} size="lg" />
      <h2 id="result-title">Nivel {game.level} superado</h2>
      <p>
        {last
          ? `Has completado los ${LEVEL_COUNT} niveles en ${DIFFICULTIES[game.difficulty].name}.`
          : assists === 0
            ? 'Sin usar ninguna ayuda.'
            : `Usaste ${assists} ${assists === 1 ? 'ayuda' : 'ayudas'}. Sin ayudas consigues las tres estrellas.`}
      </p>
      <div className="panel-actions">
        {!last && (
          <button type="button" className="btn btn-primary" onClick={onNextLevel} autoFocus>
            Siguiente nivel
          </button>
        )}
        <button type="button" className="btn btn-plain" onClick={onExit}>Ver niveles</button>
      </div>
    </Dialog>
  );
}

function Stuck({ game, actions, onRestart }) {
  const left = assistsLeft(game);
  const can = canUse(game);
  const remaining = n => (Number.isFinite(n) ? ` (${n === 1 ? 'queda 1' : `quedan ${n}`})` : '');

  let advice = 'Reinicia el nivel para intentarlo de nuevo.';
  if (game.shuffleFailed) advice = 'Las fichas que quedan están apiladas de forma que ninguna mezcla las libera. Reinicia el nivel.';
  else if (can.shuffle) advice = 'Baraja las fichas que quedan o reinicia el nivel.';
  else if (can.undo) advice = 'Deshaz la última pareja o reinicia el nivel.';

  // The first available way out is the primary button
  const style = primary => (primary ? 'btn btn-primary' : 'btn btn-plain');

  return (
    <Dialog>
      <h2 id="result-title">No quedan parejas libres</h2>
      <p>{advice}</p>
      <div className="panel-actions">
        {can.shuffle && (
          <button type="button" className={style(true)} onClick={actions.shuffle}>
            Barajar{remaining(left.shuffles)}
          </button>
        )}
        {can.undo && (
          <button type="button" className={style(!can.shuffle)} onClick={actions.undo}>
            Deshacer{remaining(left.undos)}
          </button>
        )}
        <button type="button" className={style(!can.shuffle && !can.undo)} onClick={onRestart}>
          Reiniciar el nivel
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
