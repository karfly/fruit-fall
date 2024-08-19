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
      // Commented out game over logic
    };

    checkGameOver();
  }, [fruits]);

  return (
    <div
      ref={gameAreaRef}
      className="w-[400px] h-[600px] relative overflow-hidden border border-black bg-[url('/images/background.webp')] bg-cover"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setDragPosition(null)}
    >
      <div id="score-display" className="absolute top-2 left-2 text-white font-bold">
        Score: <span id="score-value">{score}</span>
      </div>
      {fruits.map((fruit) => (
        <Fruit key={fruit.id} fruit={fruit} />
      ))}
      {dragPosition !== null && (
        <div
          className="absolute top-0 opacity-50 bg-cover"
          style={{
            left: dragPosition - nextFruit.radius,
            width: nextFruit.radius * 2,
            height: nextFruit.radius * 2,
            backgroundImage: `url(${nextFruit.image})`,
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center bg-white bg-opacity-80 p-5 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Game Over</h2>
          <p className="mb-4">Final Score: {score}</p>
          <button
            onClick={resetGame}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
};