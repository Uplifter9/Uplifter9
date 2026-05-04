import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

function RadioWaveIcon() {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#1e3a5f" />
      <circle cx="20" cy="20" r="7" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="20" cy="20" r="2.5" fill="white" />
      <path d="M10 20 Q20 8 30 20" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6" />
      <path d="M10 20 Q20 32 30 20" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6" />
    </svg>
  );
}

export default function StationCard({ station, isActive, isFavorite, onPlay, onToggleFavorite }) {
  const { t } = useLanguage();
  const [imgError, setImgError] = useState(false);

  const tags = station.tags
    ? station.tags.split(',').filter(Boolean).slice(0, 2)
    : [];

  return (
    <div
      className={`station-card ${isActive ? 'station-card--active' : ''}`}
      onClick={onPlay}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onPlay()}
      aria-pressed={isActive}
      aria-label={`${t('play')} ${station.name}`}
    >
      <div className="station-card__favicon">
        {station.favicon && !imgError ? (
          <img
            src={station.favicon}
            alt=""
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <RadioWaveIcon />
        )}
        {isActive && (
          <div className="station-card__now-playing-dot" aria-hidden="true" />
        )}
      </div>

      <div className="station-card__body">
        <div className="station-card__name">{station.name}</div>
        <div className="station-card__meta">
          {station.country && <span className="station-card__badge">{station.country}</span>}
          {station.language && <span className="station-card__badge station-card__badge--lang">{station.language}</span>}
        </div>
        {tags.length > 0 && (
          <div className="station-card__tags">
            {tags.map(tag => (
              <span key={tag} className="station-card__tag">{tag.trim()}</span>
            ))}
          </div>
        )}
      </div>

      <div className="station-card__aside">
        {station.bitrate > 0 && (
          <span className="station-card__bitrate">{station.bitrate}k</span>
        )}
        <button
          className={`station-card__fav-btn ${isFavorite ? 'station-card__fav-btn--active' : ''}`}
          onClick={e => { e.stopPropagation(); onToggleFavorite(); }}
          aria-label={isFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
          title={isFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>
    </div>
  );
}
