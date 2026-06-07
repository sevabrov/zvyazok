/** User state returned by the backend /api/me endpoint. */
export interface UserState {
  email: string;
  name?: string;
  isPaid: boolean;
  gameStatus: string;
  // Revealed card indices per game type, e.g. { warmth: [0, 3], touch: [1] }.
  usedCards: Record<string, number[]>;
  currentBlock: string | null;
  lastCardId: string | null;
}
