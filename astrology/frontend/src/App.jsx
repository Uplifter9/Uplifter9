import React, { useState } from 'react'
import { useI18n } from './i18n/index.jsx'
import LanguageSwitcher from './components/LanguageSwitcher.jsx'
import BirthForm from './components/BirthForm.jsx'
import Results from './components/Results.jsx'
import { fetchFull } from './api/client.js'

export default function App() {
  const { t, lang } = useI18n()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (payload) => {
    setError('')
    setLoading(true)
    try {
      const res = await fetchFull({ ...payload, lang })
      setData(res)
      setTimeout(() => window.scrollTo({ top: 400, behavior: 'smooth' }), 60)
    } catch (e) {
      setError(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="starfield">
      <div className="container">
        <header className="app-header">
          <div className="brand">
            <div className="brand-mark" />
            <span className="brand-title">COSMOS</span>
          </div>
          <LanguageSwitcher />
        </header>

        {!data && (
          <section className="hero">
            <h1>{t('app.title')}</h1>
            <p>{t('app.subtitle')}</p>
            <div className="tagline">{t('app.tagline')}</div>
          </section>
        )}

        {!data && <BirthForm onSubmit={handleSubmit} loading={loading} />}
        {error && <div className="error">{error}</div>}
        {data && <Results data={data} onReset={() => setData(null)} />}

        <footer className="footer">{t('app.footer')}</footer>
      </div>
    </div>
  )
}
