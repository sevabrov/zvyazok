import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActiveCard, GameType } from './types';
import { getRandomItem } from './utils';
import {
  BackgroundBlobs,
  CardModal,
  GameTypeSelect,
  Hero,
  LanguageSwitcher,
} from './components';

export const App = () => {
  const { t } = useTranslation();
  const [isGameTypeOpen, setIsGameTypeOpen] = useState(false);
  const [gameType, setGameType] = useState<GameType | null>(null);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<ActiveCard>(null);
  const [isFinished, setIsFinished] = useState(false);
  const seenCardsRef = useRef<string[]>([]);

  const openGameType = useCallback(() => {
    setIsGameTypeOpen(true);
  }, []);

  const closeGameType = useCallback(() => {
    setIsGameTypeOpen(false);
  }, []);

  const selectGameType = useCallback((type: GameType) => {
    setGameType(type);
    setIsGameTypeOpen(false);
    setActiveCard(null);
    setIsFinished(false);
    seenCardsRef.current = [];
    setIsCardOpen(true);
  }, []);

  const closeCard = useCallback(() => {
    setIsCardOpen(false);
    setActiveCard(null);
    setIsFinished(false);
    seenCardsRef.current = [];
  }, []);

  const backToGameType = useCallback(() => {
    setIsCardOpen(false);
    setActiveCard(null);
    setIsFinished(false);
    seenCardsRef.current = [];
    setIsGameTypeOpen(true);
  }, []);

  const revealCard = useCallback(() => {
    if (!gameType) return;

    const cards = t(`truthCards.${gameType}`, {
      returnObjects: true,
    }) as string[];

    const remaining = cards.filter(
      (card) => !seenCardsRef.current.includes(card),
    );

    if (remaining.length === 0) {
      setIsFinished(true);
      return;
    }

    const nextCard = getRandomItem(remaining);
    seenCardsRef.current.push(nextCard);

    setActiveCard({
      text: nextCard,
    });
  }, [t, gameType]);

  const nextCard = useCallback(() => {
    setActiveCard(null);
  }, []);

  return (
    <main className='relative grid min-h-dvh place-items-center overflow-hidden bg-[#080610] px-4 py-8 text-white sm:px-6 [padding-bottom:max(2rem,env(safe-area-inset-bottom))] [padding-top:max(2rem,env(safe-area-inset-top))]'>
      <BackgroundBlobs />

      <LanguageSwitcher />

      <Hero onPickCard={openGameType} />

      {isGameTypeOpen && (
        <GameTypeSelect onClose={closeGameType} onSelect={selectGameType} />
      )}

      {isCardOpen && gameType && (
        <CardModal
          activeCard={activeCard}
          gameType={gameType}
          isFinished={isFinished}
          onClose={closeCard}
          onBack={backToGameType}
          onReveal={revealCard}
          onNext={nextCard}
        />
      )}
    </main>
  );
};
