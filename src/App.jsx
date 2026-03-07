import './index.css';
import Board from './components/Board';
import GameInfo from './components/GameInfo';
import { useGameState } from './game/useGameState';

export default function App() {
  const { state, select, newGame } = useGameState();
  const { board, removed, status, message } = state;

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

      <div className="board-scroll">
        <Board board={board} onSelect={select} />
      </div>
    </div>
  );
}
