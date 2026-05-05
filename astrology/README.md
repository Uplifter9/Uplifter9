# Cosmos — Premium Astrology Prediction App

A production-ready, multilingual astrology web application providing precise
natal chart calculation, in-depth analysis, future predictions and life
recommendations based on exact date, time and place of birth.

## Architecture

```
astrology/
├── backend/          FastAPI service (Python 3.10+)
│   └── app/
│       ├── astro/            Swiss-Ephemeris wrapped astrology engine
│       ├── interpretation/   Textual interpretation layer
│       ├── predictions/      Transits / progressions / returns forecast
│       ├── recommendations/  Life-area recommendations
│       ├── i18n/             Hebrew / English / Arabic translations
│       ├── services/         Geocoding / timezone helpers
│       └── api/              REST endpoints & pydantic schemas
└── frontend/         React (Vite) single-page app with RTL/LTR i18n
```

### Astronomical accuracy

Calculations use [`pyswisseph`](https://github.com/astrorigin/pyswisseph)
(Swiss Ephemeris) which provides JPL-grade positions. The app supports:

- Full natal chart (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus,
  Neptune, Pluto, Chiron, True Node, South Node, Lilith)
- Placidus houses + ASC / MC / IC / DSC
- All traditional & modern aspects: conjunction, opposition, square, trine,
  sextile, quincunx, semisextile, semisquare, sesquiquadrate — with fully
  configurable orbs
- Retrograde detection
- Element / quality / house / hemisphere dominances
- Pattern detection (stelliums, grand trines, T-squares, grand crosses, yods,
  kites, mystic rectangles)
- Transits, secondary progressions and planetary returns (Solar / Lunar /
  Jupiter / Saturn)
- Lunar nodes & eclipses window

### Interpretation layer

Every planet-in-sign, planet-in-house, aspect and transit combination is
mapped to a structured, multilingual interpretation. The interpretation
engine composes text based on the chart and transit data and returns
structured content the frontend renders.

### Multilingual & RTL

Default language is Hebrew (`he`). English (`en`) and Arabic (`ar`) are fully
supported. The frontend switches layout direction and text alignment based on
language.

## Running locally

```bash
# Backend
cd astrology/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd astrology/frontend
npm install
npm run dev
```

Then open http://localhost:5173.
