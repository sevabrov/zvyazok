import { useTranslation } from 'react-i18next';
import { WandSparkles } from 'lucide-react';

type HeroProps = {
  onPickCard: () => void;
};

export const Hero = ({ onPickCard }: HeroProps) => {
  const { t } = useTranslation();

  return (
    <section className='relative z-10 w-full max-w-md text-center'>
      <h1 className='text-[clamp(2.3rem,10vw,4rem)] leading-[0.9] font-black tracking-[-0.07em] uppercase text-transparent bg-clip-text bg-linear-to-r from-fuchsia-500 to-violet-500'>
        {t('ui.titleLine1')}
      </h1>

      <p className='mx-auto mt-4 max-w-xs text-sm leading-6 text-white/70 sm:mt-5'>
        {t('ui.subtitle')}
      </p>

      <button
        type='button'
        onClick={onPickCard}
        className='group relative mt-7 h-44 w-44 rounded-full bg-linear-to-br from-fuchsia-500 to-violet-500 p-6 text-xl leading-none font-black shadow-[0_30px_90px_rgba(217,70,239,0.3)] transition hover:-translate-y-1 hover:scale-[1.03] active:translate-y-0 active:scale-95 sm:mt-9 sm:h-52 sm:w-52 sm:p-7 sm:text-2xl'
      >
        <span className='absolute -inset-3 rounded-full border border-white/15 opacity-50 transition group-hover:scale-105 group-hover:opacity-25' />
        <span className='absolute inset-0 rounded-full bg-radial-[circle_at_35%_25%] from-white/35 via-transparent to-transparent' />
        <span className='relative flex h-full flex-col items-center justify-center gap-2 sm:gap-3'>
          <WandSparkles className='h-8 w-8 sm:h-9 sm:w-9' aria-hidden='true' />
          {t('ui.pickCardLine1')}
          <br />
          {t('ui.pickCardLine2')}
        </span>
      </button>

      <p className='mt-4 text-xs text-white/45 sm:mt-5'>{t('ui.hint')}</p>
    </section>
  );
};
