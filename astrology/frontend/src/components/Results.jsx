import React, { useState } from 'react'
import { useI18n } from '../i18n/index.jsx'
import ChartWheel from './ChartWheel.jsx'

const TABS = ['overview', 'chart', 'aspects', 'analysis', 'predictions', 'recommendations']

export default function Results({ data, onReset }) {
  const { t, dict } = useI18n()
  const [tab, setTab] = useState('overview')
  if (!data) return null

  const { chart, interpretation, forecast, recommendations } = data

  return (
    <div className="section">
      <div className="tabs">
        {TABS.map(key => (
          <button key={key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            {t(`nav.${key}`)}
          </button>
        ))}
        <button className="tab" onClick={onReset} style={{ marginInlineStart: 'auto' }}>
          {t('app.generate_another')}
        </button>
      </div>

      {tab === 'overview' && <OverviewTab chart={chart} interp={interpretation} />}
      {tab === 'chart' && <ChartTab chart={chart} interp={interpretation} />}
      {tab === 'aspects' && <AspectsTab chart={chart} interp={interpretation} />}
      {tab === 'analysis' && <AnalysisTab chart={chart} interp={interpretation} />}
      {tab === 'predictions' && <PredictionsTab forecast={forecast} />}
      {tab === 'recommendations' && <RecommendationsTab recs={recommendations} />}
    </div>
  )
}

function OverviewTab({ chart, interp }) {
  const { t, dict } = useI18n()
  const bt = interp?.big_three || {}
  return (
    <div className="card">
      <h2>{t('sections.overview')}</h2>
      <p style={{ color: 'var(--text-dim)', whiteSpace: 'pre-line' }}>{interp?.overview}</p>
      <div className="big-three" style={{ marginTop: 20 }}>
        {['sun', 'moon', 'asc'].map(key => {
          const tile = bt[key] || {}
          const sign = tile.sign
          const glyph = dict?.planet_symbols?.[key] || ''
          const signGlyph = sign ? (dict?.sign_symbols?.[sign] || '') : ''
          return (
            <div className="tile" key={key}>
              <div className="glyph">{glyph}{signGlyph && ' ' + signGlyph}</div>
              <div className="label">{t(`planets.${key}`)}</div>
              <div className="value">{sign ? t(`signs.${sign}`) : '—'}</div>
              <div className="body">{tile.text}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ChartTab({ chart, interp }) {
  const { t, dict } = useI18n()
  return (
    <div className="grid-2">
      <div className="card">
        <h2>{t('sections.big_three')}</h2>
        <ChartWheel chart={chart} />
        <div style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center', marginTop: 10 }}>
          {chart.datetime_local} · {chart.tz_name}
        </div>
      </div>
      <div className="card">
        <h2>{t('sections.placements')}</h2>
        <div className="list">
          {(interp?.placements || []).map((p, i) => {
            const glyph = dict?.planet_symbols?.[p.body] || ''
            const signGlyph = dict?.sign_symbols?.[p.sign] || ''
            return (
              <div className="list-item" key={i}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ color: 'var(--gold)', fontSize: 22 }}>{glyph}</span>
                  <strong>{t(`planets.${p.body}`)}</strong>
                  <span className="pill">{t(`signs.${p.sign}`)} {signGlyph}</span>
                  <span className="pill">{t('labels.house')} {p.house}</span>
                  <span className="pill neutral">{p.degree.toFixed(2)}°</span>
                  {p.retrograde && <span className="pill hard">{t('labels.retrograde')}</span>}
                </div>
                <div style={{ color: 'var(--text-dim)', fontSize: 14 }}>{p.text}</div>
                {p.dignity_text && <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>{p.dignity_text}</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function AspectsTab({ chart, interp }) {
  const { t, dict } = useI18n()
  const aspects = interp?.aspects || []
  return (
    <div className="card">
      <h2>{t('sections.aspects')}</h2>
      <table className="table">
        <thead>
          <tr>
            <th>{t('labels.body')}</th>
            <th>{t('labels.aspect')}</th>
            <th>{t('labels.body')}</th>
            <th>{t('labels.orb')}</th>
            <th>{t('labels.strength')}</th>
            <th>{t('labels.aspect')}</th>
          </tr>
        </thead>
        <tbody>
          {aspects.map((a, i) => (
            <tr key={i}>
              <td><span style={{ color: 'var(--gold)' }}>{dict?.planet_symbols?.[a.body_a] || ''}</span> {t(`planets.${a.body_a}`) || a.body_a}</td>
              <td>
                <span className={`pill ${a.nature}`}>
                  {dict?.aspect_symbols?.[a.aspect]} {t(`aspects.${a.aspect}`)}
                </span>
              </td>
              <td><span style={{ color: 'var(--gold)' }}>{dict?.planet_symbols?.[a.body_b] || ''}</span> {t(`planets.${a.body_b}`) || a.body_b}</td>
              <td>{a.orb.toFixed(2)}°</td>
              <td>
                <div className="stat-bar" style={{ width: 80 }}>
                  <div className="stat-fill" style={{ width: `${(a.strength || 0) * 100}%` }} />
                </div>
              </td>
              <td style={{ color: 'var(--text-dim)', fontSize: 13 }}>{a.text}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AnalysisTab({ chart, interp }) {
  const { t } = useI18n()
  const dom = interp?.dominances || {}
  return (
    <div className="grid-2">
      <div className="card">
        <h2>{t('sections.dominance')}</h2>
        {(dom.summary || []).map((line, i) => (
          <p key={i} style={{ color: 'var(--text-dim)' }}>{line}</p>
        ))}
        <DominanceBars title={t('labels.sign')} data={dom.elements} tKey="elements" />
        <DominanceBars title={t('qualities.cardinal') + ' / ' + t('qualities.fixed') + ' / ' + t('qualities.mutable')} data={dom.qualities} tKey="qualities" />
        <DominanceBars title={t('polarity.masculine') + ' / ' + t('polarity.feminine')} data={dom.polarity} tKey="polarity" />
      </div>
      <div className="card">
        <h2>{t('sections.patterns')}</h2>
        {(interp?.patterns || []).length === 0 && <p style={{ color: 'var(--text-faint)' }}>—</p>}
        <div className="list">
          {(interp?.patterns || []).map((p, i) => (
            <div className="list-item" key={i}>
              <strong>{p.label}</strong>
              <div style={{ color: 'var(--text-dim)', fontSize: 14 }}>{p.text}</div>
            </div>
          ))}
        </div>
        <h2 style={{ marginTop: 24 }}>{t('sections.life_areas')}</h2>
        <div className="list">
          {(interp?.life_areas || []).map((a, i) => (
            <div className="list-item" key={i}>
              <strong>{a.label}</strong>
              <div style={{ color: 'var(--text-dim)', fontSize: 14 }}>{a.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DominanceBars({ title, data, tKey }) {
  const { t } = useI18n()
  if (!data) return null
  const entries = Object.entries(data)
  const max = entries[0]?.[1] || 1
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 6 }}>{title}</div>
      {entries.map(([k, v]) => (
        <div className="stat-row" key={k} style={{ marginBottom: 6 }}>
          <span className="stat-label" style={{ minWidth: 110 }}>{t(`${tKey}.${k}`) || k}</span>
          <div className="stat-bar"><div className="stat-fill" style={{ width: `${Math.min(100, (v / max) * 100)}%` }} /></div>
          <span className="stat-label">{v}</span>
        </div>
      ))}
    </div>
  )
}

function PredictionsTab({ forecast }) {
  const { t, dict } = useI18n()
  if (!forecast) return null
  return (
    <div>
      <div className="card">
        <h2>{t('sections.predictions')}</h2>
        <p style={{ color: 'var(--text-dim)' }}>{forecast.summary}</p>
        <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>
          {forecast.window?.from} → {forecast.window?.to}
        </p>
      </div>

      <div className="section">
        <div className="section-title"><span className="dot" />{t('labels.monthly')}</div>
        <div className="monthly-grid">
          {(forecast.monthly || []).map((m, i) => (
            <div className="month" key={i}>
              <div className="month-label">{m.label}</div>
              <div className="month-count">{m.major_count} / {m.hit_count}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 14 }}>{m.summary}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-title"><span className="dot" />{t('sections.returns')}</div>
        <div className="card">
          <div className="list">
            {Object.entries(forecast.returns || {}).map(([k, v]) => v && (
              <div className="list-item" key={k}>
                <strong>{t(`labels.${k}`) || k}</strong>: {new Date(v).toLocaleString()}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title"><span className="dot" />{t('sections.predictions')}</div>
        <div className="list">
          {(forecast.major_transits || []).slice(0, 30).map((h, i) => (
            <div className="list-item" key={i}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="pill neutral">{h.date}</span>
                <span style={{ color: 'var(--gold)' }}>{dict?.planet_symbols?.[h.transiting]} {t(`planets.${h.transiting}`)}</span>
                <span className={`pill ${h.nature}`}>{dict?.aspect_symbols?.[h.aspect]} {t(`aspects.${h.aspect}`)}</span>
                <span>{t(`planets.${h.natal}`) || h.natal}</span>
                <span className="pill">{h.orb?.toFixed(2)}°</span>
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: 14, marginTop: 6 }}>{h.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RecommendationsTab({ recs }) {
  const { t } = useI18n()
  if (!recs) return null
  return (
    <div>
      <div className="card">
        <h2>{t('sections.priorities')}</h2>
        <div className="list">
          {(recs.priorities || []).map((p, i) => (
            <div className="list-item" key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span className="pill">{i + 1}</span>
                <strong>{p.label}</strong>
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: 14 }}>{p.advice}</div>
            </div>
          ))}
        </div>
      </div>
      {recs.balance_tip && (
        <div className="card section">
          <h2>{t('sections.dominance')}</h2>
          <p style={{ color: 'var(--text-dim)' }}>{recs.balance_tip}</p>
        </div>
      )}
      {recs.rituals?.length > 0 && (
        <div className="card section">
          <h2>{t('sections.rituals')}</h2>
          <ul style={{ color: 'var(--text-dim)', paddingInlineStart: 20 }}>
            {recs.rituals.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}
      {recs.timing?.moon_timing && (
        <div className="card section">
          <h2>{t('sections.timing')}</h2>
          <p style={{ color: 'var(--text-dim)' }}>{recs.timing.moon_timing}</p>
        </div>
      )}
    </div>
  )
}
