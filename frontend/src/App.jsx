import React, { useState, useCallback, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import Header from './components/Header';
import SearchAndFilters from './components/SearchAndFilters';
import StationList from './components/StationList';
import RadioPlayer from './components/RadioPlayer';
import { useRadioStations, useFilterOptions } from './hooks/useRadioStations';
import './App.css';

function RadioApp() {
  const { t, dir } = useLanguage();
  const [activeStation, setActiveStation] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('radio_favorites') || '[]'));
    } catch {
      return new Set();
    }
  });
  const [activeTab, setActiveTab] = useState('browse');

  const { stations, loading, error, filters, setFilters, refetch } = useRadioStations();
  const { languages, countries, tags } = useFilterOptions();

  useEffect(() => {
    localStorage.setItem('radio_favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  const handlePlay = useCallback((station) => {
    setActiveStation(station);
  }, []);

  const handleToggleFavorite = useCallback((stationId) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(stationId)) next.delete(stationId);
      else next.add(stationId);
      return next;
    });
  }, []);

  const favoriteStations = stations.filter(s => favorites.has(s.id));

  const displayedStations = activeTab === 'favorites' ? favoriteStations : stations;

  return (
    <div className="app" dir={dir}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favCount={favorites.size}
      />

      <div className="app__body">
        <main className="app__main">
          {activeTab === 'browse' && (
            <SearchAndFilters
              filters={filters}
              setFilters={setFilters}
              languages={languages}
              countries={countries}
              tags={tags}
            />
          )}

          {activeTab === 'favorites' && favorites.size === 0 ? (
            <div className="station-list__state">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor" opacity="0.3" aria-hidden="true">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
              <p>{t('no_favorites')}</p>
            </div>
          ) : (
            <StationList
              stations={displayedStations}
              loading={loading && activeTab === 'browse'}
              error={error && activeTab === 'browse' ? error : null}
              activeStation={activeStation}
              favorites={favorites}
              onPlay={handlePlay}
              onToggleFavorite={handleToggleFavorite}
              onRetry={refetch}
              hasFilter={Object.values(filters).some(v => v !== '')}
            />
          )}
        </main>

        <aside className="app__player">
          <RadioPlayer station={activeStation} />
        </aside>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <RadioApp />
    </LanguageProvider>
  );
}
