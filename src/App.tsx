import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActiveCard, GameType } from './types';
import { getRandomItem, loadSeenCards, saveSeenCards } from './utils';
import {
  BackgroundBlobs,
  CardModal,
  GameTypeSelect,
  Hero,
  LanguageSwitcher,
  SuccessScreen,
} from './components';
import { usePayment } from './payment/PaymentContext';

export const App = () => {
  const { t } = useTranslation();
  const { paid, showSuccess } = usePayment();
  const [isGameTypeOpen, setIsGameTypeOpen] = useState(false);
  const [gameType, setGameType] = useState<GameType | null>(null);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<ActiveCard>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [seenCount, setSeenCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  // Revealed card indices for the active game type (indices are language-agnostic).
  const seenCardsRef = useRef<number[]>([]);

  const getCards = useCallback(
    (type: GameType) =>
      t(`truthCards.${type}`, { returnObjects: true }) as string[],
    [t],
  );

  const openGameType = useCallback(() => {
    setIsGameTypeOpen(true);
  }, []);

  const closeGameType = useCallback(() => {
    setIsGameTypeOpen(false);
  }, []);

  const selectGameType = useCallback(
    (type: GameType) => {
      const cards = getCards(type);
      // Restore previously revealed cards so progress survives reloads and is
      // shared across languages (indices are parallel between locales).
      const seen = loadSeenCards(type).filter((i) => i < cards.length);

      setGameType(type);
      setIsGameTypeOpen(false);
      setActiveCard(null);
      seenCardsRef.current = seen;
      setSeenCount(seen.length);
      setTotalCount(cards.length);
      setIsFinished(cards.length > 0 && seen.length >= cards.length);
      setIsCardOpen(true);
    },
    [getCards],
  );

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
    if (!gameType || !paid) return;

    const cards = getCards(gameType);

    const remaining = cards
      .map((_, index) => index)
      .filter((index) => !seenCardsRef.current.includes(index));

    if (remaining.length === 0) {
      setIsFinished(true);
      return;
    }

    const nextIndex = getRandomItem(remaining);
    seenCardsRef.current.push(nextIndex);
    saveSeenCards(gameType, seenCardsRef.current);
    setSeenCount(seenCardsRef.current.length);

    setActiveCard({
      text: cards[nextIndex],
    });
  }, [getCards, gameType, paid]);

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
          seenCount={seenCount}
          totalCount={totalCount}
          onClose={closeCard}
          onBack={backToGameType}
          onReveal={revealCard}
          onNext={nextCard}
        />
      )}

      {showSuccess && <SuccessScreen />}
    </main>
  );
};
