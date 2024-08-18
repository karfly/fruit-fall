import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { useGameStore } from '../store/gameStore';
import { FruitInstance } from '../types';
import { getNextFruitType, fruitTypes } from '../utils/fruitUtils';
import { FogAnimation } from '../components/FogAnimation';

interface FogAnimationState {
  x: number;
  y: number;
  size: number;
}

export const usePhysics = () => {
  const engineRef = useRef<Matter.Engine | null>(null);
  const worldRef = useRef<Matter.World | null>(null);
  const { fruits, addFruit, removeFruit, incrementScore, setGameOver, setNextFruit } = useGameStore();
  const [fogAnimation, setFogAnimation] = useState<FogAnimationState | null>(null);

  useEffect(() => {
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 0.5 } });
    const world = engine.world;
    engineRef.current = engine;
    worldRef.current = world;

    // const ground = Matter.Bodies.rectangle(200, 400, 400, 20, { isStatic: true });
    const ground = Matter.Bodies.rectangle(200, 400, 400, 20, { isStatic: true });
    const leftWall = Matter.Bodies.rectangle(0, 300, 20, 600, { isStatic: true });
    const rightWall = Matter.Bodies.rectangle(400, 300, 20, 600, { isStatic: true });

    Matter.World.add(world, [ground, leftWall, rightWall]);

    Matter.Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
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
      bodies.forEach((body) => {
        if (body.label && body.label !== 'Rectangle Body') {
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
        const existingBody = Matter.Composite.allBodies(worldRef.current!).find(function(body) {
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
        bodies.forEach((body) => {
          if (body.label && body.label !== 'Rectangle Body') {
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
    const newFruit: FruitInstance = {
      id: `${Date.now()}`,
      type: nextFruit,
      x,
      y: nextFruit.radius,
      rotation: initialRotation,
      initialAngularVelocity,
    };
    addFruit(newFruit);
    setNextFruit(fruitTypes[0]);

    if (worldRef.current) {
      const body = Matter.Composite.allBodies(worldRef.current).find(b => b.label === newFruit.id);
      if (body) {
        Matter.Body.setAngle(body, initialRotation);
        Matter.Body.setAngularVelocity(body, initialAngularVelocity);
      }
    }
  };

  return { dropFruit, fogAnimation };
};