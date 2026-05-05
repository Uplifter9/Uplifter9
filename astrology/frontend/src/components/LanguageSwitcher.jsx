import React from 'react'
import { useI18n } from '../i18n/index.jsx'

const LANGS = [
  { code: 'he', label: 'עברית' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
]

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n()
  return (
    <div className="lang-switcher" role="tablist">
      {LANGS.map((l) => (
        <button
          key={l.code}
          className={lang === l.code ? 'active' : ''}
          onClick={() => setLang(l.code)}
          type="button"
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
