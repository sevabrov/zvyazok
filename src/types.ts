export type GameType =
  | 'warmth'
  | 'relationship'
  | 'touch'
  | 'parenthood'
  | 'spark';

export type ActiveCard = {
  text: string;
} | null;
