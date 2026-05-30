export type CardType = 'truth';

export type GameType =
  | 'warmth'
  | 'relationship'
  | 'touch'
  | 'parenthood'
  | 'spark';

export type ActiveCard = {
  type: CardType;
  text: string;
} | null;
