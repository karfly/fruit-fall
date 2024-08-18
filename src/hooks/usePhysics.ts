import { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { useGameStore } from '../store/gameStore';
import { FruitInstance } from '../types';
import { getNextFruitType, fruitTypes } from '../utils/fruitUtils';

export const usePhysics = () => {
  const engineRef = useRef<Matter.Engine | null>(null);
  const worldRef = useRef<Matter.World | null>(null);
  const { fruits, addFruit, removeFruit, incrementScore, setGameOver, setNextFruit } = useGameStore();

  useEffect(() => {
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 0.5 } });
    const world = engine.world;
    engineRef.current = engine;
    worldRef.current = world;

    const ground = Matter.Bodies.rectangle(200, 400, 400, 20, { isStatic: true });
    const leftWall = Matter.Bodies.rectangle(0, 300, 20, 600, { isStatic: true });
    const rightWall = Matter.Bodies.rectangle(400, 300, 20, 600, { isStatic: true });

    Matter.World.add(world, [ground, leftWall, rightWall]);

    Matter.Events.on(engine, 'collisionStart', (event) => {
      console.log('Collision event triggered');
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        console.log(`Collision between bodies: ${bodyA.label} and ${bodyB.label}`);

        const fruits = useGameStore.getState().fruits;
        const fruitA = fruits.find((f) => f.id === bodyA.label);
        const fruitB = fruits.find((f) => f.id === bodyB.label);

        console.log('fruitA:', fruitA);
        console.log('fruitB:', fruitB);

        if (fruitA && fruitB) {
          console.log(`Fruit types: ${fruitA.type.id} and ${fruitB.type.id}`);
          if (fruitA.type.id === fruitB.type.id) {
            console.log('Matching fruits found!');
            const nextType = getNextFruitType(fruitA.type);
            if (nextType) {
              console.log(`Creating new fruit of type: ${nextType.id}`);
              Matter.World.remove(world, bodyA);
              Matter.World.remove(world, bodyB);
              removeFruit(fruitA.id);
              removeFruit(fruitB.id);
              const newFruit: FruitInstance = {
                id: `${Date.now()}`,
                type: nextType,
                x: (bodyA.position.x + bodyB.position.x) / 2,
                y: (bodyA.position.y + bodyB.position.y) / 2,
              };
              addFruit(newFruit);
              incrementScore(nextType.id * 10);
            }
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
          });
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
    const newFruit: FruitInstance = {
      id: `${Date.now()}`,
      type: nextFruit,
      x,
      y: nextFruit.radius,
    };
    addFruit(newFruit);
    setNextFruit(fruitTypes[0]);
  };

  return { dropFruit };
};