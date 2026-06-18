import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { usePayment } from '../payment/PaymentContext';

const PRICE_LABEL = '19.99 €';

// Shown inside the card slot whenever the player has not paid yet. Card content
// is never rendered until payment is recorded.
export const Paywall = () => {
  const { t } = useTranslation();
  const { startPayment } = usePayment();

  return (
    <div className='animate-text-in flex w-full flex-col items-center gap-6 px-2 text-center'>
      <div className='grid h-24 w-24 place-items-center rounded-[28px] bg-linear-to-br from-fuchsia-500 to-violet-500 shadow-[0_20px_70px_rgba(139,92,246,0.35)] sm:h-28 sm:w-28'>
        <Lock
          className='h-12 w-12 sm:h-14 sm:w-14'
          strokeWidth={2.4}
          aria-hidden='true'
        />
      </div>

      <div className='flex flex-col gap-2'>
        <p className='text-[clamp(1.3rem,5.5vw,1.7rem)] leading-[1.12] font-black tracking-[-0.03em]'>
          {t('ui.payment.unlockTitle')}
        </p>
        <p className='text-sm text-white/70'>
          {t('ui.payment.unlockDescription')}
        </p>
      </div>

      <button
        type='button'
        onClick={startPayment}
        className='flex h-14 w-full items-center justify-center gap-3 rounded-3xl border border-[#d946ef]/45 bg-black/40 px-7 text-base font-black shadow-[0_0_22px_rgba(217,70,239,0.16)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-black/50 active:translate-y-0'
      >
        {PRICE_LABEL
          ? t('ui.payment.payButtonPriced', { price: PRICE_LABEL })
          : t('ui.payment.payButton')}
      </button>
    </div>
  );
};
