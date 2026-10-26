import { useState } from 'react';
import MenuScreen from './screens/MenuScreen';
import LevelSelect from './screens/LevelSelect';
import GameScreen from './screens/game/GameScreen';
import { useSession } from './hooks/useSession';

export default function App() {
  const { game, progress, actions } = useSession();
  const [screen, setScreen] = useState('menu'); // 'menu' | 'levels' | 'game'

  // Picking the level already in progress resumes it rather than starting over
  const play = (difficulty, level) => {
    const inProgress = game?.status !== 'won' && game?.difficulty === difficulty && game?.level === level;
    if (!inProgress) actions.start(difficulty, level);
    setScreen('game');
  };

  if (screen === 'game' && game) {
    return (
      <GameScreen
        game={game}
        actions={actions}
        onExit={() => setScreen('levels')}
        onNextLevel={() => play(game.difficulty, game.level + 1)}
        onRestart={() => actions.start(game.difficulty, game.level)}
      />
    );
  }

  if (screen === 'levels') {
    return (
      <LevelSelect
        progress={progress}
        onPlay={play}
        onBack={() => setScreen('menu')}
        onDifficultyChange={actions.setDifficulty}
      />
    );
  }

  return (
    <MenuScreen
      game={game}
      progress={progress}
      onContinue={() => setScreen('game')}
      onPlay={play}
      onLevels={() => setScreen('levels')}
      onDifficultyChange={actions.setDifficulty}
    />
  );
}
