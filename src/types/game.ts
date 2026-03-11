export interface Item {
  type: number; // 1-6 for different item types
  isMatched: boolean;
  isNew?: boolean;
}

export interface GameState {
  score: number;
  timeLeft: number;
  isGameOver: boolean;
  isPaused: boolean;
  specialItemMatchNum: number;
}
