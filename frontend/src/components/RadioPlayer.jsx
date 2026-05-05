import React, { useRef, useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const RADIO_HOST = 'https://de1.api.radio-browser.info';

function FallbackIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="#1e3a5f" />
      <circle cx="24" cy="24" r="10" stroke="white" strokeWidth="2" fill="none" />
      <circle cx="24" cy="24" r="3" fill="white" />
      <line x1="24" y1="6" x2="24" y2="14" stroke="white" strokeWidth="2" />
      <line x1="24" y1="34" x2="24" y2="42" stroke="white" strokeWidth="2" />
      <line x1="6" y1="24" x2="14" y2="24" stroke="white" strokeWidth="2" />
      <line x1="34" y1="24" x2="42" y2="24" stroke="white" strokeWidth="2" />
    </svg>
  );
}

export default function RadioPlayer({ station, onClose }) {
  const { t, dir } = useLanguage();
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [status, setStatus] = useState('idle'); // idle | loading | playing | error
  const [faviconError, setFaviconError] = useState(false);

  useEffect(() => {
    if (!station) return;
    setFaviconError(false);
    setStatus('loading');
    setPlaying(false);

    fetch(`${RADIO_HOST}/json/url/${station.id}`, { headers: { 'User-Agent': 'GlobalRadioApp/1.0' } }).catch(() => {});

    const audio = audioRef.current;
    audio.src = station.url;
    audio.volume = volume;
    audio.load();
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => { setPlaying(true); setStatus('playing'); })
        .catch(() => { setStatus('error'); });
    }

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [station]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (playing) {
      audio.pause();
      setPlaying(false);
      setStatus('idle');
    } else {
      setStatus('loading');
      audio.play()
        .then(() => { setPlaying(true); setStatus('playing'); })
        .catch(() => setStatus('error'));
    }
  };

  if (!station) {
    return (
      <div className="player player--empty">
        <div className="player__idle-msg">{t('select_station')}</div>
      </div>
    );
  }

  const tags = station.tags
    ? station.tags.split(',').filter(Boolean).slice(0, 3).join(' · ')
    : '';

  return (
    <div className="player" dir={dir}>
      <audio
        ref={audioRef}
        onError={() => setStatus('error')}
        onWaiting={() => setStatus('loading')}
        onPlaying={() => { setStatus('playing'); setPlaying(true); }}
      />

      <div className="player__info">
        <div className="player__favicon">
          {station.favicon && !faviconError ? (
            <img
              src={station.favicon}
              alt=""
              onError={() => setFaviconError(true)}
            />
          ) : (
            <FallbackIcon size={56} />
          )}
          {status === 'playing' && (
            <div className="player__equalizer" aria-hidden="true">
              <span /><span /><span /><span />
            </div>
          )}
        </div>

        <div className="player__meta">
          <div className="player__label">{t('now_playing')}</div>
          <div className="player__name">{station.name}</div>
          <div className="player__details">
            {station.country && <span>{station.country}</span>}
            {station.language && <span>{station.language}</span>}
            {station.bitrate > 0 && <span>{station.bitrate} {t('kbps')}</span>}
          </div>
          {tags && <div className="player__tags">{tags}</div>}
        </div>
      </div>

      <div className="player__controls">
        <button
          className={`player__play-btn ${status === 'loading' ? 'loading' : ''}`}
          onClick={togglePlay}
          aria-label={playing ? t('pause') : t('play')}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <span className="spinner" />
          ) : status === 'error' ? (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          ) : playing ? (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        {status === 'error' && (
          <span className="player__error-msg">{t('stream_error')}</span>
        )}

        <div className="player__volume">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={volume}
            onChange={e => setVolume(parseFloat(e.target.value))}
            aria-label={t('volume')}
            className="player__volume-slider"
          />
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
