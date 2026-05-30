import { Baby, Flame, Hand, HeartHandshake, Sparkles } from 'lucide-react';
import { GameType } from './types';

export const GAME_TYPE_ICONS: Record<GameType, typeof Flame> = {
  warmth: Flame,
  relationship: HeartHandshake,
  touch: Hand,
  parenthood: Baby,
  spark: Sparkles,
};

export const GAME_TYPES: GameType[] = [
  'warmth',
  'relationship',
  'touch',
  'parenthood',
  'spark',
];
