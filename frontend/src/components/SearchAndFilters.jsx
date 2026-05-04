import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function SearchAndFilters({ filters, setFilters, languages, countries, tags }) {
  const { t, dir } = useLanguage();

  const update = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  return (
    <div className="search-filters" dir={dir}>
      <div className="search-filters__search">
        <svg className="search-filters__icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input
          type="search"
          value={filters.name}
          onChange={e => update('name', e.target.value)}
          placeholder={t('search_placeholder')}
          className="search-filters__input"
          aria-label={t('search_placeholder')}
        />
      </div>

      <div className="search-filters__selects">
        <select
          value={filters.language}
          onChange={e => update('language', e.target.value)}
          className="search-filters__select"
          aria-label={t('filter_by_language')}
        >
          <option value="">{t('all_languages')}</option>
          {languages.map(l => (
            <option key={l.name} value={l.name}>
              {l.name} ({l.stationcount})
            </option>
          ))}
        </select>

        <select
          value={filters.country}
          onChange={e => update('country', e.target.value)}
          className="search-filters__select"
          aria-label={t('filter_by_country')}
        >
          <option value="">{t('all_countries')}</option>
          {countries.map(c => (
            <option key={c.name} value={c.name}>
              {c.name} ({c.stationcount})
            </option>
          ))}
        </select>

        <select
          value={filters.tag}
          onChange={e => update('tag', e.target.value)}
          className="search-filters__select"
          aria-label={t('filter_by_genre')}
        >
          <option value="">{t('all_genres')}</option>
          {tags.map(tag => (
            <option key={tag.name} value={tag.name}>
              {tag.name} ({tag.stationcount})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
