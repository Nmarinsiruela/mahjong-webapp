import { useEffect, useMemo, useState } from 'react';
import { I18nContext, MESSAGES, detectLanguage } from './index';
import { load, save } from '../utils/storage';

const LANGUAGE_KEY = 'mahjong:language';

export default function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = load(LANGUAGE_KEY);
    return MESSAGES[saved] ? saved : detectLanguage();
  });

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = MESSAGES[language].title;
  }, [language]);

  const value = useMemo(() => ({
    language,
    t: MESSAGES[language],
    // Only an explicit choice is saved; until then the browser's language is followed
    setLanguage: id => {
      setLanguageState(id);
      save(LANGUAGE_KEY, id);
    },
  }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
