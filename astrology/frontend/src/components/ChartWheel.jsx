import React from 'react'
import { useI18n } from '../i18n/index.jsx'

const SIGN_ORDER = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
]

const ASPECT_COLOR = {
  conjunction: '#e8c888',
  opposition: '#ff86b8',
  square: '#ff86b8',
  trine: '#7dd8d0',
  sextile: '#7dd8d0',
  quincunx: '#8a7dff',
  semisextile: '#8a7dff',
  semisquare: '#ff86b8',
  sesquiquadrate: '#ff86b8',
}

/**
 * Renders a traditional 360° astrological wheel as SVG.
 * Positions are derived so that the Ascendant sits on the LEFT (9-o'clock).
 */
export default function ChartWheel({ chart, size = 560 }) {
  const { t, dict } = useI18n()
  if (!chart) return null

  const cx = size / 2
  const cy = size / 2
  const r_outer = size / 2 - 4
  const r_signs = r_outer - 30
  const r_houses = r_signs - 30
  const r_planets = r_houses - 60
  const r_inner = r_houses - 110

  const ascLon = chart.angles.asc
  // rotate so ASC is at 180° (i.e. the left horizontal)
  const toAngle = (lon) => (180 - (lon - ascLon) + 360) % 360
  const polar = (angle, r) => {
    const rad = (angle * Math.PI) / 180
    return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)]
  }

  // 12 sign wedges (30° each starting at 0° Aries)
  const signArcs = SIGN_ORDER.map((sign, i) => {
    const startLon = i * 30
    const a1 = toAngle(startLon)
    const a2 = toAngle(startLon + 30)
    const [x1, y1] = polar(a1, r_outer)
    const [x2, y2] = polar(a2, r_outer)
    const [x1i, y1i] = polar(a1, r_signs)
    const [x2i, y2i] = polar(a2, r_signs)
    const large = 0
    const sweep = 0
    const path = `M ${x1} ${y1} A ${r_outer} ${r_outer} 0 ${large} ${sweep} ${x2} ${y2} L ${x2i} ${y2i} A ${r_signs} ${r_signs} 0 ${large} 1 ${x1i} ${y1i} Z`
    const mid = toAngle(startLon + 15)
    const [lx, ly] = polar(mid, (r_outer + r_signs) / 2)
    const glyph = dict?.sign_symbols?.[sign] || sign
    return (
      <g key={sign}>
        <path d={path} fill={i % 2 === 0 ? 'rgba(138,125,255,0.08)' : 'rgba(232,200,136,0.06)'} stroke="rgba(255,255,255,0.12)" />
        <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fontSize="18" fill="#e8c888">{glyph}</text>
      </g>
    )
  })

  // House cusps
  const houseCusps = chart.cusps.map((lon, i) => {
    const a = toAngle(lon)
    const [x1, y1] = polar(a, r_houses)
    const [x2, y2] = polar(a, r_inner)
    const strong = i === 0 || i === 3 || i === 6 || i === 9
    return (
      <g key={i}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={strong ? 'rgba(232,200,136,0.7)' : 'rgba(255,255,255,0.2)'} strokeWidth={strong ? 1.5 : 0.8} />
      </g>
    )
  })

  // House numbers
  const houseNumbers = chart.cusps.map((lon, i) => {
    const nextLon = chart.cusps[(i + 1) % 12]
    const mid = lon + (((nextLon - lon) % 360 + 360) % 360) / 2
    const a = toAngle(mid)
    const [x, y] = polar(a, r_inner - 12)
    return (
      <text key={`h${i}`} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#7b7995">{i + 1}</text>
    )
  })

  // Planets — spread overlapping symbols along a small radial offset
  const bodies = Object.values(chart.bodies).filter(b => b.key !== 'south_node')
  // Sort by longitude so we can offset overlapping
  const sortedBodies = [...bodies].sort((a, b) => a.longitude - b.longitude)
  const usedAngles = []
  const planetMarkers = sortedBodies.map((b, idx) => {
    const a = toAngle(b.longitude)
    // Nudge if too close to the previous (less than 6°)
    let offsetR = 0
    for (const prev of usedAngles) {
      if (Math.abs(((a - prev + 540) % 360) - 180) > 174) {
        offsetR += 16
      }
    }
    usedAngles.push(a)
    const [x, y] = polar(a, r_planets - offsetR)
    const glyph = dict?.planet_symbols?.[b.key] || b.key[0]
    return (
      <g key={b.key}>
        <circle cx={x} cy={y} r={13} fill="rgba(10,10,30,0.85)" stroke="rgba(232,200,136,0.6)" />
        <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="15" fill="#fff">{glyph}</text>
        {b.retrograde && (
          <text x={x + 10} y={y - 9} fontSize="8" fill="#ff86b8">R</text>
        )}
      </g>
    )
  })

  // Aspects within a small inner circle
  const aspectLines = (chart.aspects || [])
    .filter(a => ['conjunction', 'opposition', 'square', 'trine', 'sextile'].includes(a.aspect))
    .map((asp, i) => {
      const a1 = toAngle(chart.bodies[asp.body_a]?.longitude ?? chart.angles[asp.body_a] ?? 0)
      const a2 = toAngle(chart.bodies[asp.body_b]?.longitude ?? chart.angles[asp.body_b] ?? 0)
      const [x1, y1] = polar(a1, r_inner - 10)
      const [x2, y2] = polar(a2, r_inner - 10)
      const color = ASPECT_COLOR[asp.aspect] || '#fff'
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeOpacity={0.35 + (asp.strength || 0.5) * 0.4} strokeWidth={0.8} />
    })

  // ASC / MC labels
  const ascMcLabels = [
    { key: 'asc', lon: chart.angles.asc, label: 'ASC' },
    { key: 'mc', lon: chart.angles.mc, label: 'MC' },
    { key: 'dsc', lon: chart.angles.dsc, label: 'DSC' },
    { key: 'ic', lon: chart.angles.ic, label: 'IC' },
  ].map(({ key, lon, label }) => {
    const a = toAngle(lon)
    const [x, y] = polar(a, r_outer + 1)
    return <text key={key} x={x} y={y} fontSize="10" fill="#e8c888" textAnchor="middle">{label}</text>
  })

  return (
    <svg className="chart-wheel" viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="wheelBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(138,125,255,0.08)" />
          <stop offset="70%" stopColor="rgba(10,10,30,0)" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r_outer} fill="url(#wheelBg)" stroke="rgba(255,255,255,0.16)" />
      {signArcs}
      <circle cx={cx} cy={cy} r={r_signs} fill="none" stroke="rgba(255,255,255,0.10)" />
      <circle cx={cx} cy={cy} r={r_houses} fill="none" stroke="rgba(255,255,255,0.10)" />
      <circle cx={cx} cy={cy} r={r_inner} fill="none" stroke="rgba(255,255,255,0.10)" />
      {houseCusps}
      {houseNumbers}
      {aspectLines}
      {planetMarkers}
      {ascMcLabels}
    </svg>
  )
}
