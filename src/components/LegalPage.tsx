import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { BackgroundBlobs } from './BackgroundBlobs';
import { LanguageSwitcher } from './LanguageSwitcher';
import { legalDocs, type LegalDocKey } from '../legal/content';
import type { Language } from '../i18n';

type LegalPageProps = {
  docKey: LegalDocKey;
};

export const LegalPage = ({ docKey }: LegalPageProps) => {
  const { t, i18n } = useTranslation();
  const lang: Language = i18n.resolvedLanguage === 'ru' ? 'ru' : 'uk';
  const doc = legalDocs[docKey][lang];
  const title = doc.find((block) => block.type === 'h1')?.text ?? '';

  useEffect(() => {
    if (title) document.title = `${title} — Zvyazok`;
  }, [title]);

  return (
    <main className='relative min-h-dvh overflow-x-hidden bg-[#080610] text-white'>
      {/* Fixed backdrop so the blobs stay put while the document scrolls. */}
      <div className='pointer-events-none fixed inset-0 overflow-hidden'>
        <BackgroundBlobs />
      </div>

      <LanguageSwitcher />

      <div className='relative z-10 mx-auto w-full max-w-2xl px-4 sm:px-6 [padding-bottom:max(3rem,env(safe-area-inset-bottom))] [padding-top:max(3.5rem,env(safe-area-inset-top))]'>
        <a
          href='/'
          className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-white/80 backdrop-blur transition hover:-translate-y-0.5 hover:text-white'
        >
          <ArrowLeft className='h-4 w-4' aria-hidden='true' />
          {t('ui.legal.backToGame')}
        </a>

        <article className='animate-text-in mt-7 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur sm:p-9'>
          {doc.map((block, index) => {
            if (block.type === 'h1') {
              return (
                <h1
                  key={index}
                  className='bg-linear-to-r from-fuchsia-500 to-violet-500 bg-clip-text text-[clamp(1.7rem,6vw,2.5rem)] font-black uppercase leading-[1.05] tracking-[-0.04em] text-transparent'
                >
                  {block.text}
                </h1>
              );
            }

            if (block.type === 'h2') {
              return (
                <h2
                  key={index}
                  className='mt-8 text-lg font-black tracking-[-0.02em] text-white sm:text-xl'
                >
                  {block.text}
                </h2>
              );
            }

            return (
              <p
                key={index}
                className='mt-3 text-sm leading-7 text-white/70'
              >
                {block.text}
              </p>
            );
          })}
        </article>
      </div>
    </main>
  );
};
