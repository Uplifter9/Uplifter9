import { useState, useEffect, useCallback } from 'react';

const RADIO_HOSTS = [
  'https://de1.api.radio-browser.info',
  'https://at1.api.radio-browser.info',
  'https://nl1.api.radio-browser.info',
];

const HEADERS = { 'User-Agent': 'GlobalRadioApp/1.0' };

async function radioFetch(path, params = {}) {
  const qs = new URLSearchParams(params).toString();
  for (const host of RADIO_HOSTS) {
    try {
      const res = await fetch(`${host}/json/${path}${qs ? '?' + qs : ''}`, { headers: HEADERS });
      if (res.ok) return res.json();
    } catch {
      // try next host
    }
  }
  throw new Error('All Radio Browser hosts unreachable');
}

function formatStation(s) {
  return {
    id: s.stationuuid || '',
    name: s.name || '',
    url: s.url_resolved || s.url || '',
    favicon: s.favicon || '',
    country: s.country || '',
    countrycode: s.countrycode || '',
    language: s.language || '',
    tags: s.tags || '',
    bitrate: s.bitrate || 0,
    votes: s.votes || 0,
    codec: s.codec || '',
    homepage: s.homepage || '',
  };
}

export function useRadioStations() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ name: '', language: '', country: '', tag: '' });

  const fetchStations = useCallback(async (activeFilters) => {
    setLoading(true);
    setError(null);
    try {
      const hasFilter = Object.values(activeFilters).some(v => v.trim() !== '');
      let data;
      if (hasFilter) {
        const params = { hidebroken: 'true', limit: 60, order: 'votes', reverse: 'true' };
        if (activeFilters.name)     params.name = activeFilters.name;
        if (activeFilters.language) params.language = activeFilters.language;
        if (activeFilters.country)  params.country = activeFilters.country;
        if (activeFilters.tag)      params.tag = activeFilters.tag;
        data = await radioFetch('stations/search', params);
      } else {
        data = await radioFetch('stations/topvote', { limit: 60, hidebroken: 'true' });
      }
      setStations(data.map(formatStation));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchStations(filters), 400);
    return () => clearTimeout(t);
  }, [filters, fetchStations]);

  return { stations, loading, error, filters, setFilters, refetch: () => fetchStations(filters) };
}

export function useFilterOptions() {
  const [languages, setLanguages] = useState([]);
  const [countries, setCountries] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    Promise.all([
      radioFetch('languages', { order: 'stationcount', reverse: 'true', hidebroken: 'true' }).catch(() => []),
      radioFetch('countries', { order: 'name', hidebroken: 'true' }).catch(() => []),
      radioFetch('tags',      { order: 'stationcount', reverse: 'true', hidebroken: 'true' }).catch(() => []),
    ]).then(([langs, ctrs, tgs]) => {
      setLanguages(langs.filter(l => l.name && l.stationcount > 5).slice(0, 60));
      setCountries(ctrs.filter(c => c.name && c.stationcount > 5));
      setTags(tgs.filter(t => t.name && t.name.length <= 30 && t.stationcount > 10).slice(0, 60));
    });
  }, []);

  return { languages, countries, tags };
}
