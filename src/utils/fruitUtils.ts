import { FruitType } from '../types';

export const fruitTypes: FruitType[] = [
  {
    id: 1,
    name: 'Cherry',
    color: '#FF0000',
    radius: 15,
    mass: 1,
    image: 'src/assets/cherry.webp',
    scale: 1.0,
    verticalShift: 0.0,
    horizontalShift: 0.0
  },
  {
    id: 2,
    name: 'Apple',
    color: '#FF69B4',
    radius: 20,
    mass: 2,
    image: 'src/assets/apple.webp',
    scale: 1.2,
    verticalShift: -0.1,
    horizontalShift: 0.0
  },
  {
    id: 3,
    name: 'Orange',
    color: '#FFA500',
    radius: 25,
    mass: 3,
    image: 'src/assets/orange.webp',
    scale: 1.2,
    verticalShift: -0.1,
    horizontalShift: -0.05
  },
  {
    id: 4,
    name: 'Coconut',
    color: '#0000FF',
    radius: 30,
    mass: 4,
    image: 'src/assets/coconut.webp',
    scale: 1.1,
    verticalShift: -0.05,
    horizontalShift: 0.0
  },
  {
    id: 5,
    name: 'Watermelon',
    color: '#00FF00',
    radius: 35,
    mass: 5,
    image: 'src/assets/watermelon.webp',
    scale: 1.1,
    verticalShift: -0.05,
    horizontalShift: 0.0
  }
];

export const getNextFruitType = (currentType: FruitType): FruitType | null => {
  const index = fruitTypes.findIndex(type => type.id === currentType.id);
  return index < fruitTypes.length - 1 ? fruitTypes[index + 1] : null;
};