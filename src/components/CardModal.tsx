import { useTranslation } from 'react-i18next';
import { Heart, HelpCircle, X, Zap } from 'lucide-react';
import { ActiveCard, CardType } from '../types';

type CardModalProps = {
  activeCard: ActiveCard;
  onClose: () => void;
  onReveal: (type: CardType) => void;
  onNext: () => void;
};

export const CardModal = ({
  activeCard,
  onClose,
  onReveal,
  onNext,
}: CardModalProps) => {
  const { t } = useTranslation();

  return (
    <section
      className='fixed inset-0 z-20 grid place-items-center bg-black/55 px-4 py-6 backdrop-blur-xl sm:px-6 sm:py-8'
      aria-modal='true'
      role='dialog'
    >
      <button
        type='button'
        onClick={onClose}
        className='absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-30 rounded-full border border-white/10 bg-white/10 p-3 text-white/80 backdrop-blur transition hover:bg-white/15 sm:right-5 sm:top-5'
        aria-label={t('ui.closeCard')}
      >
        <X className='h-5 w-5' aria-hidden='true' />
      </button>

      <article className='animate-card-in relative flex h-[min(540px,82dvh)] w-full max-w-[380px] flex-col justify-between overflow-hidden rounded-[28px] border border-white/20 bg-white/10 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur sm:rounded-[34px] sm:p-7'>
        <div className='pointer-events-none absolute inset-0 bg-linear-to-br from-white/20 via-white/5 to-transparent' />
        <div className='pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-fuchsia-400/40 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-violet-500/45 blur-3xl' />
        <div className='pointer-events-none absolute inset-[1px] rounded-[27px] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:34px_34px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)] sm:rounded-[33px]' />

        <div className='relative z-10 grid flex-1 place-items-center text-center'>
          {!activeCard ? (
            <div className='animate-question-float grid h-32 w-32 place-items-center rounded-[34px] bg-linear-to-br from-fuchsia-500 to-violet-500 shadow-[0_20px_70px_rgba(139,92,246,0.35)] sm:h-40 sm:w-40 sm:rounded-[42px]'>
              <HelpCircle
                className='h-20 w-20 sm:h-24 sm:w-24'
                strokeWidth={2.4}
                aria-hidden='true'
              />
            </div>
          ) : (
            <div className='animate-text-in'>
              <div className='mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white/70'>
                {activeCard.type === 'truth' ? (
                  <Heart
                    className='h-4 w-4 text-fuchsia-200'
                    aria-hidden='true'
                  />
                ) : (
                  <Zap className='h-4 w-4 text-violet-200' aria-hidden='true' />
                )}
                {t(`ui.${activeCard.type}`)}
              </div>

              <p className='text-[clamp(1.65rem,7vw,2.25rem)] leading-[1.08] font-black tracking-[-0.055em]'>
                {activeCard.text}
              </p>
            </div>
          )}
        </div>

        <div className='relative z-10'>
          {!activeCard ? (
            <>
              <div className='grid grid-cols-2 gap-3'>
                <button
                  type='button'
                  onClick={() => onReveal('truth')}
                  className='flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 text-base font-black backdrop-blur transition hover:bg-white/15'
                >
                  <Heart
                    className='h-5 w-5 text-fuchsia-200'
                    aria-hidden='true'
                  />
                  {t('ui.truth')}
                </button>

                <button
                  type='button'
                  onClick={() => onReveal('dare')}
                  className='flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 text-base font-black backdrop-blur transition hover:bg-white/15'
                >
                  <Zap className='h-5 w-5 text-violet-200' aria-hidden='true' />
                  {t('ui.dare')}
                </button>
              </div>
            </>
          ) : (
            <button
              type='button'
              onClick={onNext}
              className='flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-br from-fuchsia-500 to-violet-500 text-base font-black shadow-[0_18px_42px_rgba(217,70,239,0.22)] transition hover:-translate-y-0.5 active:translate-y-0'
            >
              {t('ui.nextCard')}
            </button>
          )}
        </div>
      </article>
    </section>
  );
};
