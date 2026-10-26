import { createContext, useContext } from 'react';
import es from './es';
import en from './en';

export const MESSAGES = { es, en };

// Shown in the language picker, each in its own language
export const LANGUAGES = [
  { id: 'es', code: 'ES', name: 'Español' },
  { id: 'en', code: 'EN', name: 'English' },
];

/** The first supported language the browser asks for, else English. */
export function detectLanguage() {
  const preferred = typeof navigator === 'undefined' ? [] : navigator.languages ?? [navigator.language];
  for (const tag of preferred) {
    const id = tag?.slice(0, 2).toLowerCase();
    if (MESSAGES[id]) return id;
  }
  return 'en';
}

export const I18nContext = createContext(null);

/** { language, setLanguage, t } where t holds the current language's messages. */
export function useI18n() {
  return useContext(I18nContext);
}
