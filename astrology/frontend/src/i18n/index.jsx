import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import he from './he.js'
import en from './en.js'
import ar from './ar.js'

const DICTS = { he, en, ar }
const DIRS = { he: 'rtl', en: 'ltr', ar: 'rtl' }
const STORAGE_KEY = 'cosmos.lang'

const I18nContext = createContext({ lang: 'he', dir: 'rtl', t: (k) => k, setLang: () => {} })

function lookup(dict, key) {
  return key.split('.').reduce((acc, p) => (acc && typeof acc === 'object' ? acc[p] : undefined), dict)
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && DICTS[stored]) return stored
    }
    return 'he'
  })

  const dir = DIRS[lang] || 'ltr'

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
    document.body.dataset.lang = lang
    document.body.dir = dir
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, lang)
  }, [lang, dir])

  const value = useMemo(() => {
    const t = (key, vars) => {
      const primary = lookup(DICTS[lang], key)
      const fallback = primary ?? lookup(DICTS.en, key)
      const out = fallback ?? key
      if (typeof out !== 'string' || !vars) return out
      return out.replace(/\{(\w+)\}/g, (_, v) => (vars[v] ?? ''))
    }
    return { lang, dir, t, setLang: setLangState, dict: DICTS[lang] }
  }, [lang, dir])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
