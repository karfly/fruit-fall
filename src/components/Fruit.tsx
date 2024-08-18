import React from 'react';
import { FruitInstance } from '../types';

interface FruitProps {
  fruit: FruitInstance;
}

export const Fruit: React.FC<FruitProps> = ({ fruit }) => {
  const size = fruit.type.radius * 2;
  const scaledSize = size * fruit.type.scale;
  const offset = (scaledSize - size) / 2;
  const verticalShiftPixels = size * fruit.type.verticalShift;
  const horizontalShiftPixels = size * fruit.type.horizontalShift;

  return (
    <div
      style={{
        position: 'absolute',
        left: fruit.x - fruit.type.radius,
        top: fruit.y - fruit.type.radius,
        width: size,
        height: size,
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '2px solid red',
          boxSizing: 'border-box',
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: scaledSize,
          height: scaledSize,
          left: -offset + horizontalShiftPixels,
          top: -offset + verticalShiftPixels,
          backgroundImage: `url(${fruit.type.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 1,
        }}
      />
    </div>
  );
};