import React, { createContext, useContext, useState, useEffect } from 'react';

import en from '../i18n/en.json';
import he from '../i18n/he.json';
import ar from '../i18n/ar.json';
import es from '../i18n/es.json';
import fr from '../i18n/fr.json';
import de from '../i18n/de.json';

const TRANSLATIONS = { en, he, ar, es, fr, de };

export const LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr', flag: '🇬🇧' },
  { code: 'he', label: 'עברית',   dir: 'rtl', flag: '🇮🇱' },
  { code: 'ar', label: 'العربية', dir: 'rtl', flag: '🇸🇦' },
  { code: 'es', label: 'Español', dir: 'ltr', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', dir: 'ltr', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', dir: 'ltr', flag: '🇩🇪' },
];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const stored = localStorage.getItem('radio_lang');
    if (stored && TRANSLATIONS[stored]) return stored;
    const browser = navigator.language.slice(0, 2);
    return TRANSLATIONS[browser] ? browser : 'en';
  });

  const langMeta = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    localStorage.setItem('radio_lang', lang);
    document.documentElement.dir = langMeta.dir;
    document.documentElement.lang = lang;
  }, [lang, langMeta.dir]);

  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir: langMeta.dir, langMeta }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
