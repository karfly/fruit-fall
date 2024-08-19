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
      className="w-full max-w-md h-[calc(100vh-4rem)] mx-auto relative overflow-hidden border border-black bg-[url('/images/background.webp')] bg-cover flex flex-col"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setDragPosition(null)}
    >
      <div className="p-4 text-white font-bold">
        Score: <span>{score}</span>
      </div>
      <div className="flex-grow relative">
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
      </div>
      {isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-2">Game Over</h2>
            <p className="mb-4">Final Score: {score}</p>
            <button
              onClick={resetGame}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Restart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};