import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, LANGUAGES } from '../contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="lang-switcher" ref={ref}>
      <button
        className="lang-switcher__trigger"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('language_selector')}
      >
        <span className="lang-switcher__flag">{current.flag}</span>
        <span className="lang-switcher__label">{current.label}</span>
        <svg viewBox="0 0 10 6" width="10" height="6" fill="currentColor" aria-hidden="true">
          <path d="M0 0l5 6 5-6z" />
        </svg>
      </button>

      {open && (
        <ul className="lang-switcher__dropdown" role="listbox" aria-label={t('language_selector')}>
          {LANGUAGES.map(l => (
            <li
              key={l.code}
              role="option"
              aria-selected={l.code === lang}
              className={`lang-switcher__option ${l.code === lang ? 'lang-switcher__option--active' : ''}`}
              onClick={() => { setLang(l.code); setOpen(false); }}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
