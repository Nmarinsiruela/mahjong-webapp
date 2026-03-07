import { useState, useEffect } from 'react';
import './index.css';
import Board from './components/Board';
import GameInfo from './components/GameInfo';
import { useGameState } from './game/useGameState';

function useIsPortrait() {
  const [portrait, setPortrait] = useState(() => window.innerHeight > window.innerWidth);
  useEffect(() => {
    const update = () => setPortrait(window.innerHeight > window.innerWidth);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return portrait;
}

export default function App() {
  const { state, select, newGame } = useGameState();
  const { board, removed, status, message } = state;
  const isPortrait = useIsPortrait();

  return (
    <div className="app">
      <header className="app-header">
        <h1><span>🀄</span>Mahjong Solitario</h1>
        <GameInfo
          removed={removed}
          status={status}
          message={message}
          onNewGame={newGame}
        />
      </header>

      {isPortrait ? (
        <div className="rotate-prompt">
          <div className="rotate-icon">⟳</div>
          <p>Gira el dispositivo para jugar</p>
        </div>
      ) : (
        <div className="board-scroll">
          <Board board={board} onSelect={select} />
        </div>
      )}
    </div>
  );
}
