import { useTranslation } from 'react-i18next';
import { languages } from '../i18n';

/**
 * Language pills. By default it floats in the top-right corner (used on the
 * legal pages); pass `floating={false}` to render just the inline pill so a
 * parent can position it (e.g. grouped with the user menu in the top bar).
 */
export const LanguageSwitcher = ({ floating = true }: { floating?: boolean }) => {
  const { i18n } = useTranslation();

  const pills = (
    <div className='flex gap-1 rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur'>
      {languages.map((lng) => (
        <button
          key={lng}
          type='button'
          onClick={() => i18n.changeLanguage(lng)}
          aria-pressed={i18n.resolvedLanguage === lng}
          className={`rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wide transition ${
            i18n.resolvedLanguage === lng
              ? 'text-[#ff6df2] drop-shadow-[0_0_14px_rgba(255,109,242,0.9)] border border-[#d946ef]/45 shadow-[0_0_22px_rgba(217,70,239,0.16)]'
              : 'text-white/70 hover:text-white'
          }`}
        >
          {lng}
        </button>
      ))}
    </div>
  );

  if (!floating) return pills;

  return (
    <div className='absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-1'>
      {pills}
    </div>
  );
};
