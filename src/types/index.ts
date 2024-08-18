export interface FruitType {
    id: number;
    name: string;
    color: string;
    radius: number;
    mass: number;
    image: string;
    scale: number;
    verticalShift: number;
    horizontalShift: number;
  }

  export interface FruitInstance {
    id: string;
    type: FruitType;
    x: number;
    y: number;
    rotation: number;
    initialAngularVelocity: number;
  }