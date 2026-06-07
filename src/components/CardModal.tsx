import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle2, HelpCircle, X } from 'lucide-react';
import { ActiveCard, GameType } from '../types';
import { GAME_TYPE_ICONS } from '../gameTypes';
import { useAuth } from '../auth/AuthContext';
import { Paywall } from './Paywall';

type CardModalProps = {
  activeCard: ActiveCard;
  gameType: GameType;
  isFinished: boolean;
  seenCount: number;
  totalCount: number;
  onClose: () => void;
  onBack: () => void;
  onReveal: () => void;
  onNext: () => void;
};

export const CardModal = ({
  activeCard,
  gameType,
  isFinished,
  seenCount,
  totalCount,
  onClose,
  onBack,
  onReveal,
  onNext,
}: CardModalProps) => {
  const { t } = useTranslation();
  const { paid } = useAuth();
  const GameTypeIcon = GAME_TYPE_ICONS[gameType];

  return (
    <section
      className='fixed inset-0 z-20 grid place-items-center bg-black/55 px-4 py-6 backdrop-blur-xl sm:px-6 sm:py-8'
      aria-modal='true'
      role='dialog'
    >
      <article className='animate-card-in relative flex h-[min(540px,82dvh)] w-full max-w-[380px] flex-col justify-between overflow-hidden rounded-[28px] border border-white/20 bg-white/10 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur sm:rounded-[34px] sm:p-7'>
        <div className='flex items-start justify-between'>
          <button
            type='button'
            onClick={onBack}
            className='relative top-[-10px] left-[-10px] rounded-full bg-black border border-[#d946ef]/45 shadow-[0_0_22px_rgba(217,70,239,0.16)] p-3 text-white/80 backdrop-blur transition hover:bg-black/90'
            aria-label={t('ui.changeGameType')}
          >
            <ArrowLeft
              className='h-5 w-5 text-[#ff6df2] drop-shadow-[0_0_14px_rgba(255,109,242,0.9)]'
              aria-hidden='true'
            />
          </button>

          {paid && totalCount > 0 && (
            <span className='relative z-10 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black tabular-nums tracking-[0.18em] text-white/70'>
              {seenCount}/{totalCount}
            </span>
          )}

          <button
            type='button'
            onClick={onClose}
            className='relative top-[-10px] right-[-10px] rounded-full bg-black/50 border border-[#d946ef]/45 shadow-[0_0_22px_rgba(217,70,239,0.16)] p-3 text-white/80 backdrop-blur transition hover:bg-black/60'
            aria-label={t('ui.closeCard')}
          >
            <X
              className='h-5 w-5 text-[#ff6df2] drop-shadow-[0_0_14px_rgba(255,109,242,0.9)]'
              aria-hidden='true'
            />
          </button>
        </div>
        <div className='pointer-events-none absolute inset-0 bg-linear-to-br from-white/20 via-white/5 to-transparent' />
        <div className='pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-fuchsia-400/40 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-violet-500/45 blur-3xl' />
        <div className='pointer-events-none absolute inset-[1px] rounded-[27px] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:34px_34px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)] sm:rounded-[33px]' />

        <div className='relative z-10 grid flex-1 place-items-center text-center'>
          {!paid ? (
            <Paywall />
          ) : isFinished ? (
            <div className='animate-text-in flex flex-col items-center gap-5'>
              <div className='grid h-32 w-32 place-items-center rounded-[34px] bg-linear-to-br from-fuchsia-500 to-violet-500 shadow-[0_20px_70px_rgba(139,92,246,0.35)] sm:h-40 sm:w-40 sm:rounded-[42px]'>
                <CheckCircle2
                  className='h-20 w-20 sm:h-24 sm:w-24'
                  strokeWidth={2.4}
                  aria-hidden='true'
                />
              </div>
              <p className='text-[clamp(1.4rem,6vw,1.85rem)] leading-[1.12] font-black tracking-[-0.045em]'>
                {t('ui.allCardsDone')}
              </p>
            </div>
          ) : !activeCard ? (
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
                <GameTypeIcon
                  className='h-5 w-5 text-[#ff6df2] drop-shadow-[0_0_14px_rgba(255,109,242,0.9)]'
                  aria-hidden='true'
                />
                {t(`ui.gameTypes.${gameType}`)}
              </div>

              <p className='text-[clamp(1.65rem,7vw,2.25rem)] leading-[1.08] font-black'>
                {activeCard.text}
              </p>
            </div>
          )}
        </div>

        <div className='relative z-10'>
          {!paid ? null : isFinished ? (
            <button
              type='button'
              onClick={onBack}
              className='flex h-14 w-full items-center justify-center gap-3 bg-black/40 rounded-3xl border border-[#d946ef]/45 px-7 py-5 shadow-[0_0_22px_rgba(217,70,239,0.16)] px-5 text-base font-black backdrop-blur transition hover:-translate-y-0.5 hover:bg-black/50 active:translate-y-0'
            >
              {t('ui.chooseAnotherType')}
            </button>
          ) : !activeCard ? (
            <button
              type='button'
              onClick={onReveal}
              className='flex h-14 w-full items-center justify-center gap-3 bg-black/40 rounded-3xl border border-[#d946ef]/45 px-7 py-5 shadow-[0_0_22px_rgba(217,70,239,0.16)] px-5 text-base font-black backdrop-blur transition hover:-translate-y-0.5 hover:bg-black/50 active:translate-y-0'
            >
              <GameTypeIcon
                className='h-5 w-5 text-[#ff6df2] drop-shadow-[0_0_14px_rgba(255,109,242,0.9)]'
                aria-hidden='true'
              />
              {t('ui.truth')}
            </button>
          ) : (
            <button
              type='button'
              onClick={onNext}
              className='flex h-14 w-full items-center justify-center gap-3 bg-black/40 rounded-3xl border border-[#d946ef]/45 px-7 py-5 shadow-[0_0_22px_rgba(217,70,239,0.16)] px-5 text-base font-black backdrop-blur transition hover:-translate-y-0.5 hover:bg-black/50 active:translate-y-0'
            >
              {t('ui.nextCard')}
            </button>
          )}
        </div>
      </article>
    </section>
  );
};
