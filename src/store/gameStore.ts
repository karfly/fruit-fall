import { create } from 'zustand';
import { FruitInstance, FruitType } from '../types';
import { fruitTypes } from '../utils/fruitUtils';

interface GameState {
  score: number;
  fruits: FruitInstance[];
  nextFruit: FruitType;
  isGameOver: boolean;
  addFruit: (fruit: FruitInstance) => void;
  removeFruit: (id: string) => void;
  updateFruit: (id: string, updates: Partial<FruitInstance>) => void;
  incrementScore: (points: number) => void;
  setGameOver: (isOver: boolean) => void;
  resetGame: () => void;
  setNextFruit: (fruit: FruitType) => void;
}

export const useGameStore = create<GameState>((set) => ({
  score: 0,
  fruits: [],
  nextFruit: fruitTypes[0],
  isGameOver: false,
  addFruit: (fruit) => set((state) => ({ fruits: [...state.fruits, fruit] })),
  removeFruit: (id) => set((state) => ({ fruits: state.fruits.filter((f) => f.id !== id) })),
  updateFruit: (id, updates) => set((state) => ({
    fruits: state.fruits.map((f) => (f.id === id ? { ...f, ...updates } : f)),
  })),
  incrementScore: (points) => set((state) => ({ score: state.score + points })),
  setGameOver: (isOver) => set({ isGameOver: isOver }),
  resetGame: () => set({ score: 0, fruits: [], nextFruit: fruitTypes[0], isGameOver: false }),
  setNextFruit: (fruit) => set({ nextFruit: fruit }),
}));