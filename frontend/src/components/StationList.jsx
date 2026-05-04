import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import StationCard from './StationCard';

export default function StationList({
  stations,
  loading,
  error,
  activeStation,
  favorites,
  onPlay,
  onToggleFavorite,
  onRetry,
  hasFilter,
}) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="station-list__state">
        <div className="spinner spinner--lg" />
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="station-list__state station-list__state--error">
        <p>{t('error_loading')}</p>
        <button className="btn btn--primary" onClick={onRetry}>{t('retry')}</button>
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="station-list__state">
        <p>{t('no_stations_found')}</p>
      </div>
    );
  }

  return (
    <div className="station-list">
      <div className="station-list__count">
        {stations.length} {t('stations_found')}
      </div>
      <div className="station-list__grid">
        {stations.map(station => (
          <StationCard
            key={station.id}
            station={station}
            isActive={activeStation?.id === station.id}
            isFavorite={favorites.has(station.id)}
            onPlay={() => onPlay(station)}
            onToggleFavorite={() => onToggleFavorite(station.id)}
          />
        ))}
      </div>
    </div>
  );
}
