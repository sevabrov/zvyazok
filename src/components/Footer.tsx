import { useTranslation } from 'react-i18next';

// Small legal links centered at the bottom of the main page. Each opens the
// corresponding standalone page in a new tab.
export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className='absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap text-xs text-white/40'>
      <a
        href='/privacy-policy'
        target='_blank'
        rel='noopener noreferrer'
        className='transition hover:text-white/80'
      >
        {t('ui.footer.privacy')}
      </a>
      <span aria-hidden='true' className='text-white/20'>
        •
      </span>
      <a
        href='/oferta'
        target='_blank'
        rel='noopener noreferrer'
        className='transition hover:text-white/80'
      >
        {t('ui.footer.oferta')}
      </a>
    </footer>
  );
};
