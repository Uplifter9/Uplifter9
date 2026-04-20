import React, { useState } from 'react'
import { useI18n } from '../i18n/index.jsx'
import { geocode } from '../api/client.js'

const INITIAL = {
  name: '',
  date: '',
  time: '12:00',
  place: '',
  country: '',
  latitude: '',
  longitude: '',
  tz_name: '',
  house_system: 'placidus',
  months: 12,
}

export default function BirthForm({ onSubmit, loading }) {
  const { t } = useI18n()
  const [form, setForm] = useState(INITIAL)
  const [err, setErr] = useState('')
  const [geoMsg, setGeoMsg] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleGeocode = async () => {
    if (!form.place) return
    setGeoMsg('…')
    try {
      const q = [form.place, form.country].filter(Boolean).join(', ')
      const res = await geocode(q)
      setForm((f) => ({
        ...f,
        latitude: res.latitude?.toFixed(6) || '',
        longitude: res.longitude?.toFixed(6) || '',
        tz_name: res.timezone || '',
        country: f.country || res.country || '',
      }))
      setGeoMsg(t('form.geocode_ok'))
    } catch {
      setGeoMsg(t('form.geocode_fail'))
    }
  }

  const submit = (e) => {
    e.preventDefault()
    setErr('')
    if (!form.name || !form.date || !form.time || !form.latitude || !form.longitude) {
      setErr(t('errors.required_fields'))
      return
    }
    const [y, m, d] = form.date.split('-').map(Number)
    const [hh, mm] = form.time.split(':').map(Number)
    const payload = {
      birth: {
        name: form.name,
        year: y, month: m, day: d, hour: hh, minute: mm,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        place: form.place,
        country: form.country,
        tz_name: form.tz_name || null,
        house_system: form.house_system,
      },
      lang: undefined, // filled by parent
      months: Number(form.months),
    }
    onSubmit(payload)
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>{t('form.heading')}</h2>
      <p className="card-hint">{t('form.description')}</p>
      <div className="form-grid">
        <div className="field">
          <label>{t('form.first_name')}</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div className="field">
          <label>{t('form.date_of_birth')}</label>
          <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required />
        </div>
        <div className="field">
          <label>{t('form.time_of_birth')}</label>
          <input type="time" value={form.time} onChange={(e) => set('time', e.target.value)} required />
          <span className="hint">{t('form.time_hint')}</span>
        </div>
        <div className="field">
          <label>{t('form.place')}</label>
          <input value={form.place} onChange={(e) => set('place', e.target.value)} onBlur={handleGeocode} placeholder="Jerusalem" />
          <span className="hint" style={{ minHeight: 14 }}>{geoMsg}</span>
        </div>
        <div className="field">
          <label>{t('form.country')}</label>
          <input value={form.country} onChange={(e) => set('country', e.target.value)} />
        </div>
        <div className="field">
          <label>{t('form.latitude')}</label>
          <input type="number" step="0.000001" value={form.latitude} onChange={(e) => set('latitude', e.target.value)} required />
        </div>
        <div className="field">
          <label>{t('form.longitude')}</label>
          <input type="number" step="0.000001" value={form.longitude} onChange={(e) => set('longitude', e.target.value)} required />
        </div>
        <div className="field">
          <label>{t('form.timezone')}</label>
          <input value={form.tz_name} onChange={(e) => set('tz_name', e.target.value)} placeholder={t('form.timezone_auto')} />
        </div>
        <div className="field">
          <label>{t('form.house_system')}</label>
          <select value={form.house_system} onChange={(e) => set('house_system', e.target.value)}>
            <option value="placidus">{t('house_systems.placidus')}</option>
            <option value="koch">{t('house_systems.koch')}</option>
            <option value="whole">{t('house_systems.whole')}</option>
            <option value="equal">{t('house_systems.equal')}</option>
          </select>
        </div>
        <div className="field">
          <label>{t('form.forecast_months')}</label>
          <input type="number" min="1" max="60" value={form.months} onChange={(e) => set('months', e.target.value)} />
        </div>
      </div>
      <div className="actions-row">
        <button type="button" className="btn btn-ghost" onClick={handleGeocode} disabled={!form.place}>
          {t('form.geocode')}
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? t('app.loading') : t('form.generate')}
          {loading && <span className="loader" />}
        </button>
      </div>
      {err && <div className="error">{err}</div>}
    </form>
  )
}
