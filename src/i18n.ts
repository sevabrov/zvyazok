import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import uk from './locales/uk.json';
import ru from './locales/ru.json';

export const STORAGE_KEY = 'lang';
export const languages = ['uk', 'ru'] as const;
export type Language = (typeof languages)[number];

function getInitialLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'ru' || stored === 'uk' ? stored : 'uk';
}

i18n.use(initReactI18next).init({
  resources: {
    uk: { translation: uk },
    ru: { translation: ru },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'uk',
  interpolation: { escapeValue: false },
});

/** Create the tag if it's missing, then set its content. */
function setMetaTag(
  selector: string,
  attr: 'name' | 'property',
  key: string,
  content: string,
) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Sync <title> and SEO meta tags with the active language. */
function applyDocumentMeta(lng: Language) {
  const title = i18n.t('meta.title');
  const description = i18n.t('meta.description');
  const keywords = i18n.t('meta.keywords');

  document.documentElement.lang = lng;
  document.title = title;

  setMetaTag('meta[name="description"]', 'name', 'description', description);
  setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);

  setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
  setMetaTag(
    'meta[property="og:description"]',
    'property',
    'og:description',
    description,
  );
  setMetaTag('meta[property="og:locale"]', 'property', 'og:locale', lng);

  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  setMetaTag(
    'meta[name="twitter:description"]',
    'name',
    'twitter:description',
    description,
  );
}

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
  applyDocumentMeta(lng as Language);
});

applyDocumentMeta(i18n.language as Language);

export default i18n;
