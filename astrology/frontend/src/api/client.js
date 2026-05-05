const API_BASE = import.meta.env.VITE_API_BASE || '/api'

async function req(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json()
}

export function fetchFull(payload) {
  return req('/full', { method: 'POST', body: JSON.stringify(payload) })
}

export function fetchChart(payload) {
  return req('/chart', { method: 'POST', body: JSON.stringify(payload) })
}

export function fetchForecast(payload) {
  return req('/forecast', { method: 'POST', body: JSON.stringify(payload) })
}

export function geocode(query) {
  return req('/geocode', { method: 'POST', body: JSON.stringify({ query }) })
}
