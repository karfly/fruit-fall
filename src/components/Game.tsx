import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Fruit } from './Fruit';
import { usePhysics } from '../hooks/usePhysics';
import { FogAnimation } from './FogAnimation';

export const Game: React.FC = () => {
  const { fruits, score, isGameOver, resetGame, nextFruit } = useGameStore();
  const { dropFruit, fogAnimation } = usePhysics();
  const [dragPositionX, setDragPositionX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameAreaRef.current && !isGameOver && isDragging) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      setDragPositionX(e.clientX - rect.left);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (gameAreaRef.current && !isGameOver && isDragging) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      setDragPositionX(touch.clientX - rect.left);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameAreaRef.current && !isGameOver) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      setDragPositionX(e.clientX - rect.left);
      setIsDragging(true);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (gameAreaRef.current && !isGameOver) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      setDragPositionX(touch.clientX - rect.left);
      setIsDragging(true);
    }
  };

  const handleMouseUp = () => {
    if (isDragging && !isGameOver && dragPositionX !== null) {
      dropFruit(dragPositionX);
      setIsDragging(false);
      setDragPositionX(null);
    }
  };

  const handleTouchEnd = () => {
    if (isDragging && !isGameOver && dragPositionX !== null) {
      dropFruit(dragPositionX);
      setIsDragging(false);
      setDragPositionX(null);
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
      id="game-area"
      className="w-full h-full absolute top-0 left-0 overflow-hidden bg-[url('/images/background.webp')] bg-no-repeat flex flex-col"
      style={{
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
      }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="p-4 text-white font-bold">
        Score: <span>{score}</span>
      </div>
      <div className="flex-grow relative">
        {fruits.map((fruit) => (
          <Fruit key={fruit.id} fruit={fruit} />
        ))}
        {isDragging && dragPositionX !== null && (
          <div
            className="absolute opacity-50 bg-cover"
            style={{
              left: dragPositionX - nextFruit.radius,
              top: 200 - nextFruit.radius,
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