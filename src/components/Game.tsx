import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Fruit } from './Fruit';
import { usePhysics } from '../hooks/usePhysics';
import { FogAnimation } from './FogAnimation';

export const Game: React.FC = () => {
  const { fruits, score, isGameOver, resetGame, nextFruit } = useGameStore();
  const { dropFruit, fogAnimation } = usePhysics();
  const [dragPosition, setDragPosition] = useState<number | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameAreaRef.current && !isGameOver) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      setDragPosition(e.clientX - rect.left);
    }
  };

  const handleMouseUp = () => {
    if (dragPosition !== null && !isGameOver) {
      dropFruit(dragPosition);
      setDragPosition(null);
    }
  };

  useEffect(() => {
    const checkGameOver = () => {
    //   const topFruit = fruits.find(fruit => fruit.y - fruit.type.radius <= 0);
    //   if (topFruit) {
    //     useGameStore.getState().setGameOver(true);
    //   }
    };

    checkGameOver();
  }, [fruits]);

  return (
    <div
      ref={gameAreaRef}
      style={{
        width: '400px',
        height: '600px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid black',
        backgroundImage: `url('/images/background.webp')`,
        backgroundSize: 'cover',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setDragPosition(null)}
    >
      <div id="score-display">Score: <span id="score-value">{score}</span></div>
      {fruits.map((fruit) => (
        <Fruit key={fruit.id} fruit={fruit} />
      ))}
      {dragPosition !== null && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: dragPosition - nextFruit.radius,
            width: nextFruit.radius * 2,
            height: nextFruit.radius * 2,
            backgroundImage: `url(${nextFruit.image})`,
            backgroundSize: 'cover',
            opacity: 0.5,
          }}
        />
      )}
      {fogAnimation && (
        <FogAnimation
          x={fogAnimation.x}
          y={fogAnimation.y}
          size={fogAnimation.size}
        />
      )}
      {isGameOver && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '20px', borderRadius: '10px' }}>
          <h2>Game Over</h2>
          <p>Final Score: {score}</p>
          <button onClick={resetGame}>Restart</button>
        </div>
      )}
    </div>
  );
};