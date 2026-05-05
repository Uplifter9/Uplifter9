"""Transit calculations: scan planetary contacts to the natal chart across a window."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from typing import Iterable

from .aspects import _shortest_delta
from .constants import ASPECTS, PLANET_ORDER, PLANETS
from .ephemeris import compute_positions


# Planets whose transits are astrologically meaningful for medium-term forecasts.
# Fast-movers (Sun/Moon/Mercury/Venus/Mars) are included but their hits are
# short-lived, so they're flagged as "quick".
_TRANSITING_PLANETS: list[str] = [
    "sun", "mercury", "venus", "mars",
    "jupiter", "saturn", "uranus", "neptune", "pluto",
    "chiron", "true_node",
]

# Meaningful aspects for transits (orbs are tighter for transits than natal)
_TRANSIT_ASPECTS: dict[str, float] = {
    "conjunction": 1.5,
    "opposition":  1.5,
    "square":      1.5,
    "trine":       1.5,
    "sextile":     1.0,
    "quincunx":    1.0,
}


@dataclass
class TransitHit:
    date: str                 # ISO date
    transiting: str
    natal: str                # planet / asc / mc / ic / dsc
    aspect: str
    orb: float
    applying: bool
    is_quick: bool            # for fast planets (≤ Mars)


def _scan_positions(start: datetime, end: datetime, step_days: float) -> Iterable[tuple[datetime, dict]]:
    current = start
    while current <= end:
        yield current, compute_positions(current, keys=_TRANSITING_PLANETS)
        current += timedelta(days=step_days)


def compute_transits(
    natal_chart,
    start: datetime,
    end: datetime,
    step_days: float = 1.0,
) -> list[TransitHit]:
    """Return transit aspect peaks within the window.

    For each transiting planet & natal point we sample daily, track when the
    orb to each aspect is smallest, and record the peak as a hit.
    """
    natal_points: dict[str, float] = {}
    for k, b in natal_chart.bodies.items():
        if k in ("south_node", "lilith"):
            continue
        natal_points[k] = b.longitude
    natal_points["asc"] = natal_chart.angles["asc"]
    natal_points["mc"] = natal_chart.angles["mc"]
    natal_points["ic"] = natal_chart.angles["ic"]
    natal_points["dsc"] = natal_chart.angles["dsc"]

    # Track running minimum per (transiting, natal, aspect)
    min_orb: dict[tuple[str, str, str], tuple[float, datetime]] = {}
    last_orb: dict[tuple[str, str, str], float] = {}
    hits: list[TransitHit] = []

    for dt, positions in _scan_positions(start, end, step_days):
        for tp_key, tp_pos in positions.items():
            for np_key, np_lon in natal_points.items():
                # Skip self reference for non-angle natal
                if tp_key == np_key:
                    continue
                sep = abs(_shortest_delta(tp_pos.longitude, np_lon))
                for aspect, target in ASPECTS.items():
                    if aspect not in _TRANSIT_ASPECTS:
                        continue
                    orb_limit = _TRANSIT_ASPECTS[aspect]
                    orb = abs(sep - target)
                    key = (tp_key, np_key, aspect)
                    prev = last_orb.get(key)
                    if orb <= orb_limit:
                        # Track minimum (exact peak)
                        if key not in min_orb or orb < min_orb[key][0]:
                            min_orb[key] = (orb, dt)
                    # Detect that we just passed the peak — emit hit
                    if prev is not None and prev < orb and key in min_orb and min_orb[key][0] < orb_limit:
                        peak_orb, peak_dt = min_orb.pop(key)
                        hits.append(TransitHit(
                            date=peak_dt.date().isoformat(),
                            transiting=tp_key,
                            natal=np_key,
                            aspect=aspect,
                            orb=round(peak_orb, 3),
                            applying=False,
                            is_quick=tp_key in ("sun", "mercury", "venus", "mars"),
                        ))
                    last_orb[key] = orb

    # Flush remaining peaks at end of window
    for (tp_key, np_key, aspect), (orb, dt) in min_orb.items():
        hits.append(TransitHit(
            date=dt.date().isoformat(),
            transiting=tp_key,
            natal=np_key,
            aspect=aspect,
            orb=round(orb, 3),
            applying=True,
            is_quick=tp_key in ("sun", "mercury", "venus", "mars"),
        ))

    hits.sort(key=lambda h: h.date)
    return hits


def hits_to_dict(hits: list[TransitHit]) -> list[dict]:
    return [asdict(h) for h in hits]
