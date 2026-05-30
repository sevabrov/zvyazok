import { useTranslation } from 'react-i18next';
import { Baby, Flame, Hand, HeartHandshake, Sparkles, X } from 'lucide-react';
import { GameType } from '../types';

type GameTypeSelectProps = {
  onClose: () => void;
  onSelect: (type: GameType) => void;
};

const GAME_TYPES: { id: GameType; icon: typeof Flame }[] = [
  { id: 'warmth', icon: Flame },
  { id: 'relationship', icon: HeartHandshake },
  { id: 'touch', icon: Hand },
  { id: 'parenthood', icon: Baby },
  { id: 'spark', icon: Sparkles },
];

export const GameTypeSelect = ({ onClose, onSelect }: GameTypeSelectProps) => {
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

      <article className='animate-card-in relative flex w-full max-w-[380px] flex-col overflow-hidden rounded-[28px] border border-white/20 bg-white/10 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur sm:rounded-[34px] sm:p-7'>
        <div className='pointer-events-none absolute inset-0 bg-linear-to-br from-white/20 via-white/5 to-transparent' />
        <div className='pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-fuchsia-400/40 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-violet-500/45 blur-3xl' />

        <div className='relative z-10'>
          <h2 className='mb-5 text-center text-[clamp(1.5rem,6vw,2rem)] font-black tracking-[-0.055em]'>
            {t('ui.chooseGameType')}
          </h2>

          <div className='grid gap-3'>
            {GAME_TYPES.map(({ id, icon: Icon }) => (
              <button
                key={id}
                type='button'
                onClick={() => onSelect(id)}
                className='flex h-14 items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 text-base font-black backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15 active:translate-y-0'
              >
                <Icon className='h-5 w-5 text-fuchsia-200' aria-hidden='true' />
                {t(`ui.gameTypes.${id}`)}
              </button>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
};
