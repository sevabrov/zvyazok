import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { GameType } from '../types';
import { GAME_TYPE_ICONS, GAME_TYPES } from '../gameTypes';

type GameTypeSelectProps = {
  onClose: () => void;
  onSelect: (type: GameType) => void;
};

export const GameTypeSelect = ({ onClose, onSelect }: GameTypeSelectProps) => {
  const { t } = useTranslation();

  return (
    <section
      className='fixed inset-0 z-20 grid place-items-center bg-black/55 px-4 py-6 backdrop-blur-xl sm:px-6 sm:py-8'
      aria-modal='true'
      role='dialog'
    >
      <article className='animate-card-in relative flex w-full max-w-[380px] flex-col overflow-hidden rounded-[28px] border border-white/20 bg-white/10 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur sm:rounded-[34px] sm:p-7'>
        <div className='pointer-events-none absolute inset-0 bg-linear-to-br from-white/20 via-white/5 to-transparent' />
        <div className='pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-fuchsia-400/40 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-violet-500/45 blur-3xl' />

        <div className='relative z-10'>
          <h2 className='mb-5 text-center text-[clamp(1.5rem,6vw,2rem)] font-black'>
            {t('ui.chooseGameType')}
          </h2>

          <div className='grid gap-3'>
            {GAME_TYPES.map((id) => {
              const Icon = GAME_TYPE_ICONS[id];

              return (
                <button
                  key={id}
                  type='button'
                  onClick={() => onSelect(id)}
                  className='flex h-14 items-center gap-3 bg-black/40 rounded-3xl border border-[#d946ef]/45 px-7 py-5 shadow-[0_0_22px_rgba(217,70,239,0.16)] px-5 text-base font-black backdrop-blur transition hover:-translate-y-0.5 hover:bg-black/50 active:translate-y-0'
                >
                  <Icon
                    className='h-5 w-5 text-[#ff6df2] drop-shadow-[0_0_14px_rgba(255,109,242,0.9)]'
                    aria-hidden='true'
                  />
                  {t(`ui.gameTypes.${id}`)}
                </button>
              );
            })}
            <button
              type='button'
              onClick={onClose}
              className='flex h-14 items-center gap-3 bg-black/40 rounded-3xl border border-[#d946ef]/45 px-7 py-5 shadow-[0_0_22px_rgba(217,70,239,0.16)] px-5 text-base font-black backdrop-blur transition hover:-translate-y-0.5 hover:bg-black/50 active:translate-y-0'
              aria-label={t('ui.closeCard')}
            >
              <X
                className='h-5 w-5 text-[#ff6df2] drop-shadow-[0_0_14px_rgba(255,109,242,0.9)]'
                aria-hidden='true'
              />
              {t('ui.backToMain')}
            </button>
          </div>
        </div>
      </article>
    </section>
  );
};
