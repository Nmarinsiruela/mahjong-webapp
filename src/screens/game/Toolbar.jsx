import { useEffect, useState } from 'react';
import { UndoIcon, HintIcon, ShuffleIcon, RestartIcon } from '../../components/Icons';
import { DIFFICULTIES } from '../../logic/difficulty';
import { assistsLeft, canUse } from '../../logic/game';
import './Toolbar.css';

function ToolButton({ icon, label, count, disabled, onClick }) {
  return (
    <button type="button" className="tool" disabled={disabled} onClick={onClick}>
      {icon}
      <span>{label}</span>
      {Number.isFinite(count) && <span className="tool-count" aria-label={`quedan ${count}`}>{count}</span>}
    </button>
  );
}

// Restarting throws away the level's progress, so it takes a second tap
function RestartButton({ needsConfirm, onRestart }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 2500);
    return () => clearTimeout(timer);
  }, [armed]);

  const handleClick = () => {
    if (needsConfirm && !armed) {
      setArmed(true);
    } else {
      setArmed(false);
      onRestart();
    }
  };

  return <ToolButton icon={<RestartIcon />} label={armed ? 'Toca otra vez' : 'Reiniciar'} onClick={handleClick} />;
}

// Assists the difficulty doesn't allow at all are left out
export default function Toolbar({ game, actions, onRestart }) {
  const { assists } = DIFFICULTIES[game.difficulty];
  const left = assistsLeft(game);
  const can = canUse(game);

  return (
    <nav className="toolbar" aria-label="Ayudas">
      {assists.undos > 0 && (
        <ToolButton icon={<UndoIcon />} label="Deshacer" count={left.undos} disabled={!can.undo} onClick={actions.undo} />
      )}
      {assists.hints > 0 && (
        <ToolButton icon={<HintIcon />} label="Pista" count={left.hints} disabled={!can.hint} onClick={actions.hint} />
      )}
      <ToolButton icon={<ShuffleIcon />} label="Barajar" count={left.shuffles} disabled={!can.shuffle} onClick={actions.shuffle} />
      <RestartButton needsConfirm={game.history.length > 0 && game.status !== 'won'} onRestart={onRestart} />
    </nav>
  );
}
