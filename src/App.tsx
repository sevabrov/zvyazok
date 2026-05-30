import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CardType, ActiveCard } from './types';
import { getRandomItem } from './utils';
import {
  BackgroundBlobs,
  CardModal,
  Hero,
  LanguageSwitcher,
} from './components';

export const App = () => {
  const { t } = useTranslation();
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<ActiveCard>(null);

  const openCard = useCallback(() => {
    setActiveCard(null);
    setIsCardOpen(true);
  }, []);

  const closeCard = useCallback(() => {
    setIsCardOpen(false);
    setActiveCard(null);
  }, []);

  const revealCard = useCallback(
    (type: CardType) => {
      const cards = t(type === 'truth' ? 'truthCards' : 'dareCards', {
        returnObjects: true,
      }) as string[];

      setActiveCard({
        type,
        text: getRandomItem(cards),
      });
    },
    [t],
  );

  const nextCard = useCallback(() => {
    setActiveCard(null);
  }, []);

  return (
    <main className='relative grid min-h-dvh place-items-center overflow-hidden bg-[#080610] px-4 py-8 text-white sm:px-6 [padding-bottom:max(2rem,env(safe-area-inset-bottom))] [padding-top:max(2rem,env(safe-area-inset-top))]'>
      <BackgroundBlobs />

      <LanguageSwitcher />

      <Hero onPickCard={openCard} />

      {isCardOpen && (
        <CardModal
          activeCard={activeCard}
          onClose={closeCard}
          onReveal={revealCard}
          onNext={nextCard}
        />
      )}
    </main>
  );
};
