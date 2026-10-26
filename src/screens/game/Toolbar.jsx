import { useEffect, useState } from 'react';
import { UndoIcon, HintIcon, ShuffleIcon, RestartIcon } from '../../components/Icons';
import { useI18n } from '../../i18n';
import { DIFFICULTIES } from '../../logic/difficulty';
import { assistsLeft, canUse } from '../../logic/game';
import './Toolbar.css';

function ToolButton({ icon, label, count, disabled, onClick }) {
  const { t } = useI18n();
  return (
    <button type="button" className="tool" disabled={disabled} onClick={onClick}>
      {icon}
      <span>{label}</span>
      {Number.isFinite(count) && <span className="tool-count" aria-label={t.game.left(count)}>{count}</span>}
    </button>
  );
}

// Restarting throws away the level's progress, so it takes a second tap
function RestartButton({ needsConfirm, onRestart }) {
  const { t } = useI18n();
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

  return <ToolButton icon={<RestartIcon />} label={armed ? t.game.confirmRestart : t.game.restart} onClick={handleClick} />;
}

// Assists the difficulty doesn't allow at all are left out
export default function Toolbar({ game, actions, onRestart }) {
  const { t } = useI18n();
  const { assists } = DIFFICULTIES[game.difficulty];
  const left = assistsLeft(game);
  const can = canUse(game);

  return (
    <nav className="toolbar" aria-label={t.game.assists}>
      {assists.undos > 0 && (
        <ToolButton icon={<UndoIcon />} label={t.game.undo} count={left.undos} disabled={!can.undo} onClick={actions.undo} />
      )}
      {assists.hints > 0 && (
        <ToolButton icon={<HintIcon />} label={t.game.hint} count={left.hints} disabled={!can.hint} onClick={actions.hint} />
      )}
      <ToolButton icon={<ShuffleIcon />} label={t.game.shuffle} count={left.shuffles} disabled={!can.shuffle} onClick={actions.shuffle} />
      <RestartButton needsConfirm={game.history.length > 0 && game.status !== 'won'} onRestart={onRestart} />
    </nav>
  );
}
