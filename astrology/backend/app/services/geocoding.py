"""Offline-friendly geocoding with optional online Nominatim fallback."""

from __future__ import annotations

from dataclasses import dataclass

from timezonefinder import TimezoneFinder

_tzf = TimezoneFinder()


@dataclass
class PlaceResult:
    name: str
    country: str
    latitude: float
    longitude: float
    timezone: str


def resolve_timezone_for(latitude: float, longitude: float) -> str:
    tz = _tzf.timezone_at(lat=latitude, lng=longitude)
    return tz or "UTC"


def try_online_geocode(query: str) -> PlaceResult | None:
    """Best-effort online geocode via Nominatim (optional).

    Requires network access. Returns None on failure — callers should always
    offer the user a chance to enter coordinates manually.
    """
    try:
        from geopy.geocoders import Nominatim
        geolocator = Nominatim(user_agent="cosmos-astrology-app/1.0", timeout=5)
        loc = geolocator.geocode(query, language="en")
        if not loc:
            return None
        tz = resolve_timezone_for(loc.latitude, loc.longitude)
        # Nominatim returns "City, District, Region, Country"
        parts = (loc.address or "").split(",")
        country = parts[-1].strip() if parts else ""
        return PlaceResult(
            name=query,
            country=country,
            latitude=float(loc.latitude),
            longitude=float(loc.longitude),
            timezone=tz,
        )
    except Exception:
        return None
