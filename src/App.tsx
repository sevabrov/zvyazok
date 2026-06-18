import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { ActiveCard, GameType } from './types';
import { getRandomItem } from './utils';
import {
  BackgroundBlobs,
  CardModal,
  Footer,
  GameTypeSelect,
  Hero,
  LanguageSwitcher,
  Paywall,
  SuccessScreen,
  UserMenu,
} from './components';
import { useAuth } from './auth/AuthContext';
import { GoogleLoginButton } from './auth/GoogleLoginButton';
import { usePayment } from './payment/PaymentContext';
import { saveProgress } from './game/gameApi';

// Push progress to the server in batches rather than after every card, to keep
// the game responsive and avoid hammering the API.
const SYNC_EVERY = 4;

export const App = () => {
  const { t } = useTranslation();
  const { status, paid, user, logout } = useAuth();
  const { showSuccess } = usePayment();
  const [isGameTypeOpen, setIsGameTypeOpen] = useState(false);
  const [gameType, setGameType] = useState<GameType | null>(null);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<ActiveCard>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [seenCount, setSeenCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  // Bumped to re-render the game-type list after its (ref-backed) progress
  // changes, e.g. when a completed category is reset.
  const [, setProgressVersion] = useState(0);
  // Revealed card indices for the active game type (indices are language-agnostic).
  const seenCardsRef = useRef<number[]>([]);
  // In-memory progress map (per game type) — the source of truth, seeded from
  // the server on login and mutated as cards are revealed, then synced back.
  const usedCardsRef = useRef<Record<string, number[]>>({});
  // Cards revealed since the last server sync; flushed every SYNC_EVERY.
  const sinceSyncRef = useRef(0);

  const getCards = useCallback(
    (type: GameType) =>
      t(`truthCards.${type}`, { returnObjects: true }) as string[],
    [t],
  );

  // On login, seed the in-memory progress map from the server, which is the
  // source of truth across devices.
  useEffect(() => {
    if (status !== 'authed' || !user) return;
    usedCardsRef.current = { ...user.usedCards };
  }, [status, user]);

  // Fire-and-forget server sync. Failures are logged but never break the game.
  const syncProgress = useCallback(
    (block: GameType, lastIndex: number | null, finished: boolean) => {
      if (status !== 'authed') return;
      saveProgress({
        usedCards: usedCardsRef.current,
        currentBlock: block,
        lastCardId: lastIndex === null ? undefined : String(lastIndex),
        gameStatus: finished ? 'finished' : 'in_progress',
      }).catch((e) => console.error('progress sync failed', e));
    },
    [status],
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
      const seen = (usedCardsRef.current[type] ?? []).filter(
        (i) => i < cards.length,
      );

      setGameType(type);
      setIsGameTypeOpen(false);
      setActiveCard(null);
      // Share the array reference so reveals mutate the progress map in place.
      seenCardsRef.current = seen;
      usedCardsRef.current[type] = seen;
      sinceSyncRef.current = 0;
      setSeenCount(seen.length);
      setTotalCount(cards.length);
      setIsFinished(cards.length > 0 && seen.length >= cards.length);
      setIsCardOpen(true);
    },
    [getCards],
  );

  // Wipe a completed category's progress, both in memory and on the server,
  // then re-render the list so it no longer shows as done.
  const resetCategory = useCallback(
    (type: GameType) => {
      usedCardsRef.current[type] = [];
      if (gameType === type) {
        seenCardsRef.current = [];
        setSeenCount(0);
        setIsFinished(false);
      }
      setProgressVersion((v) => v + 1);
      syncProgress(type, null, false);
    },
    [gameType, syncProgress],
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
    // Mutates the shared array, so the in-memory progress map updates too.
    seenCardsRef.current.push(nextIndex);
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

      <div className='absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-20 flex items-center gap-2'>
        {status === 'authed' && <UserMenu />}
        <LanguageSwitcher floating={false} />
      </div>

      {/* Gated flow, mirroring CardModal's nested-paywall logic:
          1) not signed in → Google auth, 2) signed in but unpaid → Paywall,
          3) signed in and paid → the game. */}
      {status === 'loading' ? (
        <div className='animate-text-in flex flex-col items-center gap-4 text-center'>
          <Loader2
            className='h-10 w-10 animate-spin text-[#ff6df2]'
            aria-hidden='true'
          />
          <p className='text-sm text-white/70'>{t('ui.auth.loading')}</p>
        </div>
      ) : status !== 'authed' ? (
        <div className='animate-text-in flex flex-col items-center gap-6 text-center'>
          <h1 className='text-[clamp(2.3rem,10vw,4rem)] leading-[0.9] font-black tracking-[-0.07em] uppercase text-transparent bg-clip-text bg-linear-to-r from-fuchsia-500 to-violet-500'>
            {t('ui.titleLine1')}
          </h1>

          <p className='max-w-xs text-sm leading-6 text-white/70'>
            {status === 'error'
              ? t('ui.auth.error')
              : t('ui.auth.signInPrompt')}
          </p>
          <GoogleLoginButton />
        </div>
      ) : !paid ? (
        <div className='animate-text-in flex w-full max-w-sm flex-col items-center gap-6 px-2 text-center'>
          <Paywall />
          <button
            type='button'
            onClick={logout}
            className='text-xs font-bold text-white/45 underline-offset-4 transition hover:text-white/70 hover:underline'
          >
            {t('ui.auth.signOut')}
          </button>
        </div>
      ) : (
        <>
          <Hero onPickCard={openGameType} />

          {isGameTypeOpen && (
            <GameTypeSelect
              usedCards={usedCardsRef.current}
              onClose={closeGameType}
              onSelect={selectGameType}
              onReset={resetCategory}
            />
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
      )}

      {showSuccess && <SuccessScreen />}

      <Footer />
    </main>
  );
};
