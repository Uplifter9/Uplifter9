"""Planetary return calculations: Solar / Lunar / Jupiter / Saturn returns."""

from __future__ import annotations

from datetime import datetime, timedelta

from .aspects import _shortest_delta
from .constants import PLANETS
from .ephemeris import compute_positions


def _find_return(natal_longitude: float, planet_key: str, search_start: datetime, max_days: int, step_days: float) -> datetime | None:
    """Return the first moment when `planet_key` longitude equals `natal_longitude` (mod 360)."""
    current = search_start
    end = search_start + timedelta(days=max_days)
    prev_delta: float | None = None
    prev_dt: datetime | None = None
    while current <= end:
        pos = compute_positions(current, keys=[planet_key])[planet_key]
        delta = _shortest_delta(pos.longitude, natal_longitude)
        if prev_delta is not None and prev_delta * delta < 0 and abs(delta - prev_delta) < 180:
            # Sign-change in delta = crossing. Refine by bisection.
            left, right = prev_dt, current
            for _ in range(30):
                mid = left + (right - left) / 2
                mid_pos = compute_positions(mid, keys=[planet_key])[planet_key]
                mid_delta = _shortest_delta(mid_pos.longitude, natal_longitude)
                if mid_delta * prev_delta < 0:
                    right = mid
                else:
                    left = mid
                    prev_delta = mid_delta
            return left + (right - left) / 2
        prev_delta = delta
        prev_dt = current
        current += timedelta(days=step_days)
    return None


def solar_return(natal_sun_longitude: float, after: datetime) -> datetime | None:
    """Find next solar return after `after`."""
    return _find_return(natal_sun_longitude, "sun", after, max_days=380, step_days=1.0)


def lunar_return(natal_moon_longitude: float, after: datetime) -> datetime | None:
    return _find_return(natal_moon_longitude, "moon", after, max_days=28, step_days=0.25)


def jupiter_return(natal_jupiter_longitude: float, after: datetime) -> datetime | None:
    """Jupiter returns roughly every 12 years."""
    return _find_return(natal_jupiter_longitude, "jupiter", after, max_days=365 * 13, step_days=7.0)


def saturn_return(natal_saturn_longitude: float, after: datetime) -> datetime | None:
    """Saturn returns roughly every 29.5 years."""
    return _find_return(natal_saturn_longitude, "saturn", after, max_days=365 * 30, step_days=14.0)


def upcoming_returns(chart, after: datetime) -> dict:
    """Compute nearest-next major returns starting from `after`."""
    out = {}
    if "sun" in chart.bodies:
        sr = solar_return(chart.bodies["sun"].longitude, after)
        out["solar_return"] = sr.isoformat() if sr else None
    if "moon" in chart.bodies:
        lr = lunar_return(chart.bodies["moon"].longitude, after)
        out["lunar_return"] = lr.isoformat() if lr else None
    if "jupiter" in chart.bodies:
        jr = jupiter_return(chart.bodies["jupiter"].longitude, after)
        out["jupiter_return"] = jr.isoformat() if jr else None
    if "saturn" in chart.bodies:
        sar = saturn_return(chart.bodies["saturn"].longitude, after)
        out["saturn_return"] = sar.isoformat() if sar else None
    return out
