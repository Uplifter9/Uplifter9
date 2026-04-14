import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Globe from 'react-globe.gl';
import {
  getCountryInfo,
  getTimeDiffFromIsrael,
  formatTimeDiff,
  ISRAEL_TIMEZONE,
} from './countryTimezones';
import './App.css';

const BASE = import.meta.env.BASE_URL;
const GEOJSON_URL = `${BASE}textures/countries.geojson`;
const EARTH_TEXTURE = `${BASE}textures/earth-blue-marble.jpg`;
const EARTH_BUMP = `${BASE}textures/earth-topology.png`;
const EARTH_SPECULAR = `${BASE}textures/earth-water.png`;
const BACKGROUND_IMG = `${BASE}textures/night-sky.png`;

const SIDEBAR_W = 260;

// Fallback ISO_A2 for countries where GeoJSON has ISO_A2="-99"
const ADM0_TO_ISO2 = {
  FRA: 'FR', NOR: 'NO', NLD: 'NL', ESP: 'ES', PRT: 'PT',
  FIN: 'FI', SWE: 'SE', DNK: 'DK', BEL: 'BE', DEU: 'DE',
  AUT: 'AT', CHE: 'CH', ITA: 'IT', GRC: 'GR', POL: 'PL',
  CZE: 'CZ', SVK: 'SK', HUN: 'HU', ROU: 'RO', BGR: 'BG',
  HRV: 'HR', SVN: 'SI', SRB: 'RS', BIH: 'BA', MNE: 'ME',
  MKD: 'MK', ALB: 'AL', LTU: 'LT', LVA: 'LV', EST: 'EE',
  BLR: 'BY', UKR: 'UA', MDA: 'MD', RUS: 'RU', GEO: 'GE',
  ARM: 'AM', AZE: 'AZ', KAZ: 'KZ', XKX: 'XK',
};

// Fix: treat ISO_A3="-99" as missing, fall back to ADM0_A3
function getIso3(feat) {
  const iso3 = feat?.properties?.ISO_A3;
  if (iso3 && iso3 !== '-99') return iso3;
  return feat?.properties?.ADM0_A3 || '';
}

function getFlag(feat) {
  let iso2 = feat?.properties?.ISO_A2;
  if (!iso2 || iso2 === '-99') {
    const adm0 = feat?.properties?.ADM0_A3 || '';
    iso2 = ADM0_TO_ISO2[adm0] || null;
  }
  if (!iso2 || iso2 === '-99' || iso2.length !== 2) return '🌐';
  try {
    return String.fromCodePoint(
      ...iso2.toUpperCase().split('').map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
    );
  } catch { return '🌐'; }
}

function getLargestPolygonCenter(feature) {
  const { type, coordinates } = feature.geometry;
  const polygons = type === 'Polygon' ? [coordinates] : type === 'MultiPolygon' ? coordinates : [];
  let best = null, bestArea = 0;
  for (const poly of polygons) {
    const ring = poly[0];
    const lngs = ring.map(c => c[0]);
    const lats = ring.map(c => c[1]);
    const area = (Math.max(...lngs) - Math.min(...lngs)) * (Math.max(...lats) - Math.min(...lats));
    if (area > bestArea) {
      bestArea = area;
      best = {
        lat: (Math.min(...lats) + Math.max(...lats)) / 2,
        lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      };
    }
  }
  return best;
}

function formatTimeDisplay(timezone) {
  try {
    const now = new Date();
    return {
      time: new Intl.DateTimeFormat('he-IL', { timeZone: timezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now),
      date: new Intl.DateTimeFormat('he-IL', { timeZone: timezone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now),
    };
  } catch { return null; }
}

export default function App() {
  const globeRef = useRef(null);
  const [countries, setCountries] = useState({ features: [] });
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [israelTime, setIsraelTime] = useState(null);
  const [activeTime, setActiveTime] = useState(null);
  const [globeReady, setGlobeReady] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const tickRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    fetch(GEOJSON_URL).then(r => r.json()).then(data => setCountries(data)).catch(console.error);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const tick = () => {
      setIsraelTime(formatTimeDisplay(ISRAEL_TIMEZONE));
      const active = hoveredCountry || selectedCountry;
      if (active) {
        const info = getCountryInfo(getIso3(active));
        if (info) { setActiveTime(formatTimeDisplay(info.timezone)); return; }
      }
      setActiveTime(null);
    };
    tick();
    tickRef.current = setInterval(tick, 1000);
    return () => clearInterval(tickRef.current);
  }, [hoveredCountry, selectedCountry]);

  // Build sorted country list from GeoJSON features
  const countryList = useMemo(() => {
    return countries.features
      .map(feat => {
        const iso3 = getIso3(feat);
        const info = getCountryInfo(iso3);
        if (!info) return null;
        return { feat, iso3, info, flag: getFlag(feat) };
      })
      .filter(Boolean)
      .sort((a, b) => a.info.name.localeCompare(b.info.name, 'he'));
  }, [countries]);

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return countryList;
    const q = searchQuery.toLowerCase().trim();
    return countryList.filter(c =>
      c.info.name.includes(searchQuery.trim()) ||
      c.info.nameEn.toLowerCase().includes(q)
    );
  }, [countryList, searchQuery]);

  const handleGlobeReady = useCallback(() => {
    setGlobeReady(true);
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: 31.7683, lng: 35.2137, altitude: 2.5 }, 1200);
      const controls = globeRef.current.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.4;
        controls.addEventListener('start', () => { controls.autoRotate = false; });
      }
    }
  }, []);

  const getCountryColor = useCallback((feat) => {
    const iso = getIso3(feat);
    if (selectedCountry && getIso3(selectedCountry) === iso) return 'rgba(255,200,0,0.75)';
    if (hoveredCountry && getIso3(hoveredCountry) === iso) return 'rgba(80,180,255,0.55)';
    return 'rgba(255,255,255,0.03)';
  }, [hoveredCountry, selectedCountry]);

  const getCountryStroke = useCallback((feat) => {
    const iso = getIso3(feat);
    if (selectedCountry && getIso3(selectedCountry) === iso) return '#FFD700';
    if (hoveredCountry && getIso3(hoveredCountry) === iso) return '#50B4FF';
    return 'rgba(255,255,255,0.18)';
  }, [hoveredCountry, selectedCountry]);

  const getCountryAlt = useCallback((feat) => {
    const iso = getIso3(feat);
    if (selectedCountry && getIso3(selectedCountry) === iso) return 0.013;
    if (hoveredCountry && getIso3(hoveredCountry) === iso) return 0.008;
    return 0.001;
  }, [hoveredCountry, selectedCountry]);

  const handleCountryHover = useCallback((feat) => setHoveredCountry(feat || null), []);

  const handleCountryClick = useCallback((feat) => {
    if (!feat) return;
    setSelectedCountry(prev => (prev && getIso3(prev) === getIso3(feat)) ? null : feat);
  }, []);

  const handleSelectFromList = useCallback((item) => {
    setSelectedCountry(item.feat);
    setSidebarOpen(false);
    setSearchQuery('');
    const center = getLargestPolygonCenter(item.feat);
    if (center && globeRef.current) {
      globeRef.current.pointOfView({ lat: center.lat, lng: center.lng, altitude: 1.8 }, 900);
    }
  }, []);

  const activeCountry = hoveredCountry || selectedCountry;
  const activeIso = getIso3(activeCountry);
  const activeInfo = activeIso ? getCountryInfo(activeIso) : null;
  const timeDiff = activeInfo ? getTimeDiffFromIsrael(activeInfo.timezone) : null;
  const timeDiffStr = timeDiff !== null ? formatTimeDiff(timeDiff) : null;
  const isSelected = selectedCountry && activeInfo && getIso3(selectedCountry) === activeIso;
  const activeFlag = activeCountry ? getFlag(activeCountry) : '';

  const sidebarVisible = !isMobile || sidebarOpen;
  const globeW = isMobile ? window.innerWidth : window.innerWidth - SIDEBAR_W;
  const headerH = isMobile ? 58 : 60;
  const infoPanelH = 70;
  const globeSize = Math.min(globeW, window.innerHeight - headerH - infoPanelH);

  return (
    <div className="app-container">
      <div className="space-bg" />

      {/* Header */}
      <header className="top-bar">
        <h1 className="app-title">
          <span className="globe-icon">🌍</span>
          גלובוס שעות עולמי
        </h1>
        <div className="header-right">
          <div className="israel-clock">
            <span className="israel-flag">🇮🇱</span>
            <div className="israel-clock-text">
              <span className="israel-label">ישראל</span>
              <span className="israel-time">{israelTime?.time || '--:--:--'}</span>
              <span className="israel-date">{israelTime?.date || ''}</span>
            </div>
          </div>
          {isMobile && (
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)} aria-label="רשימת מדינות">
              {sidebarOpen ? '✕' : '☰'}
            </button>
          )}
        </div>
      </header>

      {/* Info panel */}
      <div className={`info-panel${activeInfo ? ' visible' : ''}`}>
        {activeInfo ? (
          <div className="info-content">
            <span className="active-flag">{activeFlag}</span>
            <div className="country-names">
              <span className="country-name-he">{activeInfo.name}</span>
              <span className="country-name-en">{activeInfo.nameEn}</span>
            </div>
            {activeTime && (
              <div className="time-block">
                <div className="country-time">{activeTime.time}</div>
                <div className={`time-diff ${timeDiff === 0 ? 'same' : timeDiff > 0 ? 'ahead' : 'behind'}`}>{timeDiffStr}</div>
              </div>
            )}
            {isSelected && <div className="pinned-badge">📌</div>}
          </div>
        ) : (
          <div className="hint-text">{globeReady ? 'גע במדינה לראות את השעה' : 'טוען גלובוס...'}</div>
        )}
      </div>

      {/* Main content: Globe + Sidebar */}
      <div className="main-content">
        {/* Globe */}
        <main className="globe-wrapper">
          <Globe
            ref={globeRef}
            width={globeSize}
            height={globeSize}
            globeImageUrl={EARTH_TEXTURE}
            bumpImageUrl={EARTH_BUMP}
            specularMapUrl={EARTH_SPECULAR}
            backgroundImageUrl={BACKGROUND_IMG}
            polygonsData={countries.features}
            polygonCapColor={getCountryColor}
            polygonSideColor={() => 'rgba(0,0,0,0)'}
            polygonStrokeColor={getCountryStroke}
            polygonAltitude={getCountryAlt}
            onPolygonHover={handleCountryHover}
            onPolygonClick={handleCountryClick}
            polygonLabel={() => ''}
            atmosphereColor="rgba(100,170,255,0.9)"
            atmosphereAltitude={0.2}
            onGlobeReady={handleGlobeReady}
            enablePointerInteraction={true}
          />
        </main>

        {/* Sidebar */}
        {isMobile && sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}
        <aside className={`sidebar${sidebarVisible ? ' open' : ''}`}>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              ref={searchRef}
              type="text"
              placeholder="חפש מדינה..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>
          <div className="country-list">
            {filteredList.length === 0 && (
              <div className="no-results">לא נמצאו תוצאות</div>
            )}
            {filteredList.map(item => (
              <button
                key={item.iso3}
                className={`country-item${selectedCountry && getIso3(selectedCountry) === item.iso3 ? ' selected' : ''}`}
                onClick={() => handleSelectFromList(item)}
              >
                <span className="item-flag">{item.flag}</span>
                <span className="item-name">{item.info.name}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>

      {/* Controls hint */}
      <div className="controls-hint">
        <span>גלגלת: זום</span>
        <span>גרור: סיבוב</span>
        <span>לחץ: סימון</span>
      </div>
    </div>
  );
}
