import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActiveCard, GameType } from './types';
import { GAME_TYPES } from './gameTypes';
import { getRandomItem, loadSeenCards, saveSeenCards } from './utils';
import {
  BackgroundBlobs,
  CardModal,
  Footer,
  GameTypeSelect,
  Hero,
  LanguageSwitcher,
  SuccessScreen,
} from './components';
import { useAuth } from './auth/AuthContext';
import { AccessGate } from './auth/AccessGate';
import { usePayment } from './payment/PaymentContext';
import { saveProgress } from './game/gameApi';

// Push progress to the server in batches rather than after every card, to keep
// the game responsive and avoid hammering the API.
const SYNC_EVERY = 4;

export const App = () => {
  const { t } = useTranslation();
  const { status, paid, user, idToken } = useAuth();
  const { showSuccess } = usePayment();
  const [isGameTypeOpen, setIsGameTypeOpen] = useState(false);
  const [gameType, setGameType] = useState<GameType | null>(null);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<ActiveCard>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [seenCount, setSeenCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  // Revealed card indices for the active game type (indices are language-agnostic).
  const seenCardsRef = useRef<number[]>([]);
  // Cards revealed since the last server sync; flushed every SYNC_EVERY.
  const sinceSyncRef = useRef(0);

  const gameAvailable = status === 'authed' && paid;

  const getCards = useCallback(
    (type: GameType) =>
      t(`truthCards.${type}`, { returnObjects: true }) as string[],
    [t],
  );

  // On login, hydrate the local progress store from the server so the game's
  // existing index-based mechanic (loadSeenCards) picks it up unchanged. The
  // server is the source of truth across devices, so it overwrites local.
  useEffect(() => {
    if (status !== 'authed' || !user) return;
    Object.entries(user.usedCards).forEach(([type, seen]) => {
      if (Array.isArray(seen)) saveSeenCards(type, seen);
    });
  }, [status, user]);

  // Collect the full per-type progress map, matching the localStorage shape.
  const collectUsedCards = useCallback(
    () =>
      GAME_TYPES.reduce<Record<string, number[]>>((acc, type) => {
        acc[type] = loadSeenCards(type);
        return acc;
      }, {}),
    [],
  );

  // Fire-and-forget server sync. Failures are logged but never break the game.
  const syncProgress = useCallback(
    (block: GameType, lastIndex: number | null, finished: boolean) => {
      if (!idToken) return;
      saveProgress({
        idToken,
        usedCards: collectUsedCards(),
        currentBlock: block,
        lastCardId: lastIndex === null ? undefined : String(lastIndex),
        gameStatus: finished ? 'finished' : 'in_progress',
      }).catch((e) => console.error('progress sync failed', e));
    },
    [collectUsedCards, idToken],
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
      sinceSyncRef.current = 0;
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
    // Flush any unsynced progress for the block we're leaving.
    if (gameType && sinceSyncRef.current > 0) {
      syncProgress(gameType, seenCardsRef.current.at(-1) ?? null, false);
      sinceSyncRef.current = 0;
    }
    setIsCardOpen(false);
    setActiveCard(null);
    setIsFinished(false);
    seenCardsRef.current = [];
    setIsGameTypeOpen(true);
  }, [gameType, syncProgress]);

  const revealCard = useCallback(() => {
    if (!gameType || !paid) return;

    const cards = getCards(gameType);

    const remaining = cards
      .map((_, index) => index)
      .filter((index) => !seenCardsRef.current.includes(index));

    if (remaining.length === 0) {
      setIsFinished(true);
      // Game completed for this block — sync immediately.
      syncProgress(gameType, seenCardsRef.current.at(-1) ?? null, true);
      sinceSyncRef.current = 0;
      return;
    }

    const nextIndex = getRandomItem(remaining);
    seenCardsRef.current.push(nextIndex);
    saveSeenCards(gameType, seenCardsRef.current);
    setSeenCount(seenCardsRef.current.length);

    // Batch the server sync to avoid a request per card.
    sinceSyncRef.current += 1;
    if (sinceSyncRef.current >= SYNC_EVERY) {
      syncProgress(gameType, nextIndex, false);
      sinceSyncRef.current = 0;
    }

    setActiveCard({
      text: cards[nextIndex],
    });
  }, [getCards, gameType, paid, syncProgress]);

  const nextCard = useCallback(() => {
    setActiveCard(null);
  }, []);

  return (
    <main className='relative grid min-h-dvh place-items-center overflow-hidden bg-[#080610] px-4 py-8 text-white sm:px-6 [padding-bottom:max(2rem,env(safe-area-inset-bottom))] [padding-top:max(2rem,env(safe-area-inset-top))]'>
      <BackgroundBlobs />

      <LanguageSwitcher />

      {gameAvailable ? (
        <>
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
        </>
      ) : (
        <AccessGate />
      )}

      {showSuccess && <SuccessScreen />}

      <Footer />
    </main>
  );
};
