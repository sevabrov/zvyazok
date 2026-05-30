export type CardType = 'truth' | 'dare';

export type ActiveCard = {
  type: CardType;
  text: string;
} | null;
