// ---------------------------------------------
// CAMERA
// ---------------------------------------------
export interface CameraConfig {
    vx: () => number;
    vy: () => number;
    xDepthNear: number;
    xDepthFar: number;
  }
  
  // ---------------------------------------------
  // GAME STATES
  // ---------------------------------------------
  export enum GameState {
    INIT = 'INIT',
    IDLE = 'IDLE',
    ROUND_START = 'ROUND_START',
    REVEAL = 'REVEAL',
    RESULT = 'RESULT',
  }
  
  // ---------------------------------------------
  // CARD INTERNAL STATES (optional but recommended)
  // ---------------------------------------------
  export enum CardVisualState {
    BACK = 'BACK',
    FRONT = 'FRONT',
  }
  
  export enum MultiplierState {
    HIDDEN = 'HIDDEN',
    VISIBLE = 'VISIBLE',
    FLYING = 'FLYING',
  }
  
  export interface MultiplierEntry {
    value: number;
    weight: number;
  }
  