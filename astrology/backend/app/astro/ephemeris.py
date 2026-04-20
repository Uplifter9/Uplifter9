"""Thin wrapper around Swiss Ephemeris."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

import swisseph as swe

from ..config import SWISSEPH_PATH
from .constants import PLANETS, PlanetDef


if SWISSEPH_PATH:
    swe.set_ephe_path(SWISSEPH_PATH)

# Use Moshier ephemeris by default so no extra data files are required.
# Users can set SWISSEPH_PATH to enable full Swiss Ephemeris accuracy.
_FLAGS_DEFAULT = swe.FLG_SWIEPH | swe.FLG_SPEED
_FLAGS_MOSHIER = swe.FLG_MOSEPH | swe.FLG_SPEED


@dataclass
class BodyPosition:
    """Single planet / point position at a moment in time."""

    key: str
    longitude: float         # ecliptic longitude 0..360
    latitude: float          # ecliptic latitude
    distance: float          # AU
    speed_longitude: float   # deg/day
    retrograde: bool


def julian_day(dt_utc: datetime) -> float:
    """Convert a timezone-aware UTC datetime to Julian Day (UT)."""
    return swe.julday(
        dt_utc.year,
        dt_utc.month,
        dt_utc.day,
        dt_utc.hour + dt_utc.minute / 60.0 + dt_utc.second / 3600.0,
        swe.GREG_CAL,
    )


def _calc_body(jd: float, planet: PlanetDef) -> BodyPosition | None:
    """Compute body position. Returns None if ephemeris unavailable (e.g. Chiron
    without SE data files). Callers should tolerate missing optional bodies."""
    last_err: Exception | None = None
    for flags in (_FLAGS_DEFAULT, _FLAGS_MOSHIER):
        try:
            xx, _ret = swe.calc_ut(jd, planet.swe_id, flags)
            break
        except Exception as exc:  # swe.Error or generic
            last_err = exc
            continue
    else:
        # Chiron / Lilith are "extra" bodies — tolerate their absence.
        if planet.is_point:
            return None
        raise RuntimeError(f"Unable to compute position for {planet.key}: {last_err}")

    lon, lat, dist, lon_speed, _lat_speed, _dist_speed = xx
    return BodyPosition(
        key=planet.key,
        longitude=lon % 360.0,
        latitude=lat,
        distance=dist,
        speed_longitude=lon_speed,
        retrograde=lon_speed < 0 and not planet.is_luminary,
    )


def compute_positions(dt_utc: datetime, keys: list[str] | None = None) -> dict[str, BodyPosition]:
    """Compute positions for the requested planets at `dt_utc` (UTC)."""
    jd = julian_day(dt_utc)
    keys = keys or list(PLANETS.keys())
    positions: dict[str, BodyPosition] = {}
    for key in keys:
        pos = _calc_body(jd, PLANETS[key])
        if pos is not None:
            positions[key] = pos

    # Derive south node from true_node
    if "true_node" in positions:
        tn = positions["true_node"]
        positions["south_node"] = BodyPosition(
            key="south_node",
            longitude=(tn.longitude + 180.0) % 360.0,
            latitude=-tn.latitude,
            distance=tn.distance,
            speed_longitude=tn.speed_longitude,
            retrograde=tn.retrograde,
        )
    return positions


def compute_houses(
    dt_utc: datetime,
    latitude: float,
    longitude: float,
    system: bytes = b"P",
) -> tuple[list[float], dict[str, float]]:
    """Return the 12 house cusps and the chart angles (ASC, MC, ARMC, Vertex)."""
    jd = julian_day(dt_utc)
    cusps, ascmc = swe.houses(jd, latitude, longitude, system)
    angles = {
        "asc": ascmc[0] % 360.0,
        "mc":  ascmc[1] % 360.0,
        "armc": ascmc[2] % 360.0,
        "vertex": ascmc[3] % 360.0,
        "dsc": (ascmc[0] + 180.0) % 360.0,
        "ic":  (ascmc[1] + 180.0) % 360.0,
    }
    return [c % 360.0 for c in cusps[:12]], angles
