import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

interface FogAnimationProps {
  x: number;
  y: number;
  size: number;
}

export const FogAnimation: React.FC<FogAnimationProps> = ({ x, y, size }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        overflow: 'hidden',
        zIndex: 1000,
      }}
    >
      <div
        className="fog"
        style={{
          transform: `scale(${size / 333})`,
          transformOrigin: 'top left',
        }}
      />
    </div>
  );
};