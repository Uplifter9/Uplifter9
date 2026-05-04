import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header({ activeTab, setActiveTab, favCount }) {
  const { t, dir } = useLanguage();

  return (
    <header className="app-header" dir={dir}>
      <div className="app-header__brand">
        <svg viewBox="0 0 36 36" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="18" cy="18" r="18" fill="#2563eb" />
          <circle cx="18" cy="18" r="8" stroke="white" strokeWidth="2" fill="none" />
          <circle cx="18" cy="18" r="3" fill="white" />
          <line x1="18" y1="4" x2="18" y2="10" stroke="white" strokeWidth="2" />
          <line x1="18" y1="26" x2="18" y2="32" stroke="white" strokeWidth="2" />
          <line x1="4" y1="18" x2="10" y2="18" stroke="white" strokeWidth="2" />
          <line x1="26" y1="18" x2="32" y2="18" stroke="white" strokeWidth="2" />
        </svg>
        <div>
          <h1 className="app-header__title">{t('app_title')}</h1>
          <p className="app-header__subtitle">{t('app_subtitle')}</p>
        </div>
      </div>

      <nav className="app-header__nav">
        <button
          className={`app-header__tab ${activeTab === 'browse' ? 'app-header__tab--active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          {t('top_stations')}
        </button>
        <button
          className={`app-header__tab ${activeTab === 'favorites' ? 'app-header__tab--active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          {t('favorites')}
          {favCount > 0 && <span className="app-header__badge">{favCount}</span>}
        </button>
      </nav>

      <LanguageSwitcher />
    </header>
  );
}
