export default function GameInfo({ removed, status, message, onNewGame }) {
  const remaining = 144 - removed;

  return (
    <div className="game-info">
      <div className="info-stats">
        <span className="stat">
          <span className="stat-label">Fichas</span>
          <span className="stat-value">{remaining}</span>
        </span>
        <span className="stat">
          <span className="stat-label">Eliminadas</span>
          <span className="stat-value">{removed}</span>
        </span>
      </div>

      {message && (
        <p className={`game-message ${status}`}>{message}</p>
      )}

      <button className="btn-new-game" onClick={onNewGame}>
        Nueva partida
      </button>
    </div>
  );
}
