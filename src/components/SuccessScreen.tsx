import { useTranslation } from 'react-i18next';
import { CheckCircle2, Loader2 } from 'lucide-react';

// Full-screen confirmation shown right after returning from WayForPay. It auto-
// dismisses (see PaymentProvider) and the unlocked game is revealed underneath.
export const SuccessScreen = () => {
  const { t } = useTranslation();

  return (
    <section
      className='fixed inset-0 z-30 grid place-items-center bg-black/70 px-4 backdrop-blur-xl'
      aria-modal='true'
      role='dialog'
    >
      <div className='animate-text-in flex flex-col items-center gap-6 text-center'>
        <div className='grid h-28 w-28 place-items-center rounded-[34px] bg-linear-to-br from-fuchsia-500 to-violet-500 shadow-[0_20px_70px_rgba(139,92,246,0.35)] sm:h-32 sm:w-32'>
          <CheckCircle2 className='h-16 w-16 sm:h-20 sm:w-20' strokeWidth={2.4} aria-hidden='true' />
        </div>

        <p className='text-[clamp(1.4rem,6vw,1.9rem)] leading-[1.12] font-black tracking-[-0.04em] text-white'>
          {t('ui.payment.successTitle')}
        </p>

        <div className='flex items-center gap-2 text-white/70'>
          <Loader2 className='h-5 w-5 animate-spin' aria-hidden='true' />
          <span className='text-sm'>{t('ui.payment.redirecting')}</span>
        </div>
      </div>
    </section>
  );
};
