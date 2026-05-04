import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';

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
      let url;
      if (hasFilter) {
        const params = new URLSearchParams();
        if (activeFilters.name)     params.set('name', activeFilters.name);
        if (activeFilters.language) params.set('language', activeFilters.language);
        if (activeFilters.country)  params.set('country', activeFilters.country);
        if (activeFilters.tag)      params.set('tag', activeFilters.tag);
        url = `${API_URL}/api/stations/search?${params}`;
      } else {
        url = `${API_URL}/api/stations/top?limit=60`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => fetchStations(filters), 400);
    return () => clearTimeout(debounce);
  }, [filters, fetchStations]);

  return { stations, loading, error, filters, setFilters, refetch: () => fetchStations(filters) };
}

export function useFilterOptions() {
  const [languages, setLanguages] = useState([]);
  const [countries, setCountries] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/languages`).then(r => r.json()).catch(() => []),
      fetch(`${API_URL}/api/countries`).then(r => r.json()).catch(() => []),
      fetch(`${API_URL}/api/tags`).then(r => r.json()).catch(() => []),
    ]).then(([langs, countries, tags]) => {
      setLanguages(langs);
      setCountries(countries);
      setTags(tags);
    });
  }, []);

  return { languages, countries, tags };
}
