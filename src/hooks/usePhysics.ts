import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { useGameStore } from '../store/gameStore';
import { FruitInstance } from '../types';
import { getNextFruitType, fruitTypes } from '../utils/fruitUtils';

interface FogAnimationState {
  x: number;
  y: number;
  size: number;
}

export const usePhysics = () => {
  const engineRef = useRef<Matter.Engine | null>(null);
  const worldRef = useRef<Matter.World | null>(null);
  const { fruits, addFruit, removeFruit, incrementScore, setNextFruit } = useGameStore();
  const [fogAnimation, setFogAnimation] = useState<FogAnimationState | null>(null);

  useEffect(() => {
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 0.5 } });
    const world = engine.world;
    engineRef.current = engine;
    worldRef.current = world;

    // Assuming your game area (container) size
    const gameArea = document.querySelector('#game-area');
    const containerWidth = gameArea?.clientWidth || 0;
    const containerHeight = gameArea?.clientHeight || 0;
    console.log("containerHeight", containerHeight);

    // Original background image dimensions
    const originalImageWidth = 1900;
    const originalImageHeight = 2532;
    console.log("originalImageHeight", originalImageHeight);

    const scaleY = containerHeight / originalImageHeight;
    const scaleX = containerWidth / originalImageWidth;
    const offsetX = (originalImageWidth - containerWidth/scaleY) / 2;

    // ground
    const groundHeight = 20;
    const groundWidth = 1170 * scaleY;
    const groundX = containerWidth / 2
    const groundY = 2092 * scaleY - 45;

    const ground = Matter.Bodies.rectangle(
      groundX,
      groundY,
      groundWidth,
      groundHeight,
      {
        isStatic: true,
        label: "_ground"
      }
    );

    // left wall
    const leftWallWidth = 20;
    const leftWallHeight = 1270 * scaleY;
    const leftWallX = (365 - offsetX) * scaleX - leftWallWidth/2;
    const leftWallY = 1457 * scaleY;
    const leftWall = Matter.Bodies.rectangle(
      leftWallX,
      leftWallY,
      leftWallWidth,
      leftWallHeight,
      {
        isStatic: true,
        label: "_leftWall"
      }
    );

    // right wall
    const rightWallWidth = 20;
    const rightWallHeight = 1270 * scaleY;
    const rightWallX = (1535 - offsetX) * scaleY + rightWallWidth/2;
    const rightWallY = 1457 * scaleY;
    console.log("offsetX", offsetX);
    console.log("scaleX", scaleX);
    console.log("rightWallX", rightWallX);
    console.log("rightWallY", rightWallY);
    console.log("rightWallWidth", rightWallWidth);
    console.log("rightWallHeight", rightWallHeight);
    const rightWall = Matter.Bodies.rectangle(
      rightWallX,
      rightWallY,
      rightWallWidth,
      rightWallHeight,
      { isStatic: true,
        label: "_rightWall"
      }
    );

    // const groundLine = document.createElement('div');
    // groundLine.style.position = 'absolute';
    // groundLine.style.left = `${rightWallX}px`;
    // groundLine.style.top = `${rightWallY}px`;
    // groundLine.style.width = `${rightWallWidth}px`;
    // groundLine.style.height = `${rightWallHeight}px`;
    // groundLine.style.backgroundColor = 'red';
    // groundLine.style.zIndex = '1000'; // Ensure it's on top
    // gameArea!.appendChild(groundLine);

    Matter.World.add(world, [ground, leftWall, rightWall]);

    Matter.Events.on(engine, 'collisionStart', (event: Matter.IEventCollision<Matter.Engine>) => {
      event.pairs.forEach((pair: Matter.Pair) => {
        const { bodyA, bodyB } = pair;

        const fruits = useGameStore.getState().fruits;
        const fruitA = fruits.find((f) => f.id === bodyA.label);
        const fruitB = fruits.find((f) => f.id === bodyB.label);

        if (fruitA && fruitB && fruitA.type.id === fruitB.type.id) {
          const nextType = getNextFruitType(fruitA.type);
          if (nextType) {
            Matter.World.remove(world, bodyA);
            Matter.World.remove(world, bodyB);
            removeFruit(fruitA.id);
            removeFruit(fruitB.id);

            const newX = (bodyA.position.x + bodyB.position.x) / 2;
            const newY = (bodyA.position.y + bodyB.position.y) / 2;
            const newRotation = bodyA.angle;
            const newInitialAngularVelocity = (bodyA.angularVelocity + bodyB.angularVelocity) / 2;

            // Display fog animation with the size of the new fruit
            setFogAnimation({ x: newX, y: newY, size: nextType.radius * 4 });
            setTimeout(() => setFogAnimation(null), 300);

            const newFruit: FruitInstance = {
              id: `${Date.now()}`,
              type: nextType,
              x: newX,
              y: newY,
              rotation: newRotation,
              initialAngularVelocity: newInitialAngularVelocity,
            };
            addFruit(newFruit);
            incrementScore(nextType.id * 10);
          }
        }
      });
    });

    Matter.Events.on(engine, 'afterUpdate', () => {
      const bodies = Matter.Composite.allBodies(world);
      bodies.forEach((body: Matter.Body) => {
        if (body.label && !body.label.startsWith('_')) {
          if (body.angle === 0 && body.angularVelocity === 0) {
            Matter.Body.setAngle(body, Math.random() * Math.PI * 2);
            Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.1);
          }
        }
      });
    });

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    return () => {
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
      Matter.Runner.stop(runner);
    };
  }, []);

  useEffect(() => {
    if (engineRef.current && worldRef.current) {
      fruits.forEach((fruit) => {
        const existingBody = Matter.Composite.allBodies(worldRef.current!).find(function(body: Matter.Body) {
            return body.label === fruit.id;
        });

        if (!existingBody) {
          const body = Matter.Bodies.circle(fruit.x, fruit.y, fruit.type.radius, {
            label: fruit.id,
            mass: fruit.type.mass,
            restitution: 0.3,
            friction: 0.1,
            frictionAir: 0.001,
          });

          Matter.Body.setAngle(body, fruit.rotation);
          Matter.Body.setAngularVelocity(body, fruit.initialAngularVelocity);

          Matter.World.add(worldRef.current!, body);
        }
      });
    }
  }, [fruits]);

  useEffect(() => {
    if (engineRef.current && worldRef.current) {
      let animationFrameId: number;

      const updateFruits = () => {
        const bodies = Matter.Composite.allBodies(worldRef.current!);
        bodies.forEach((body: Matter.Body) => {
          if (body.label && !body.label.startsWith('_')) {
            useGameStore.getState().updateFruit(body.label, {
              x: body.position.x,
              y: body.position.y,
              rotation: body.angle,
            });
          }
        });
        animationFrameId = requestAnimationFrame(updateFruits);
      };

      updateFruits();

      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, []);

  const dropFruit = (x: number) => {
    const { nextFruit } = useGameStore.getState();
    const initialRotation = 0;
    const initialAngularVelocity = (Math.random() - 0.5) * 0.1;


    // Get the left wallet body
    const leftWall = Matter.Composite.allBodies(worldRef.current!).find(
      (body: Matter.Body) => body.label === '_leftWall'
    );
    const leftWallY = leftWall?.bounds.min.y!;
    const y = leftWallY - 2 * nextFruit.radius;

    const newFruit: FruitInstance = {
      id: `${Date.now()}`,
      type: nextFruit,
      x,
      y,
      rotation: initialRotation,
      initialAngularVelocity,
    };
    addFruit(newFruit);
    setNextFruit(fruitTypes[0]);

    if (worldRef.current) {
      const body = Matter.Composite.allBodies(worldRef.current).find((b: Matter.Body) => b.label === newFruit.id);
      if (body) {
        Matter.Body.setAngle(body, initialRotation);
        Matter.Body.setAngularVelocity(body, initialAngularVelocity);
      }
    }
  };

  return { dropFruit, fogAnimation };
};