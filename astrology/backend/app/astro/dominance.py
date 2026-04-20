"""Weighted dominance analysis: elements, qualities, houses, signs, rulers."""

from __future__ import annotations

from typing import Any

from .constants import (
    PLANETS,
    SIGN_MODERN_RULER,
    SIGNS,
)


# Weights — luminaries and personal planets matter more than outer / points
_WEIGHTS: dict[str, float] = {
    "sun": 5, "moon": 5, "mercury": 3, "venus": 3, "mars": 3,
    "jupiter": 2.5, "saturn": 2.5, "uranus": 1.5, "neptune": 1.5, "pluto": 1.5,
    "chiron": 1.0, "true_node": 1.5, "lilith": 0.75, "south_node": 0.75,
    "asc": 4, "mc": 3,
}


def _add(d: dict[str, float], k: str, w: float) -> None:
    d[k] = d.get(k, 0.0) + w


def compute_dominance(chart) -> dict[str, Any]:
    elements: dict[str, float] = {}
    qualities: dict[str, float] = {}
    signs: dict[str, float] = {s: 0.0 for s in SIGNS}
    houses: dict[int, float] = {i: 0.0 for i in range(1, 13)}
    rulers: dict[str, float] = {}
    polarity: dict[str, float] = {"masculine": 0.0, "feminine": 0.0}
    hemispheres: dict[str, float] = {"east": 0.0, "west": 0.0, "north": 0.0, "south": 0.0}

    for key, body in chart.bodies.items():
        w = _WEIGHTS.get(key, 1.0)
        _add(elements, body.element, w)
        _add(qualities, body.quality, w)
        _add(signs, body.sign, w)
        houses[body.house] += w
        ruler = SIGN_MODERN_RULER.get(body.sign)
        if ruler:
            _add(rulers, ruler, w)
        # Polarity
        pol = "masculine" if body.element in ("fire", "air") else "feminine"
        _add(polarity, pol, w)
        # Hemispheres (1..6 = below horizon/north, 7..12 = above/south; 10..3 = east, 4..9 = west roughly)
        if body.house in (1, 2, 3, 4, 5, 6):
            hemispheres["north"] += w  # below horizon
        else:
            hemispheres["south"] += w  # above horizon
        if body.house in (10, 11, 12, 1, 2, 3):
            hemispheres["east"] += w
        else:
            hemispheres["west"] += w

    # Add angles to element / quality tallies via ASC
    asc_lon = chart.angles["asc"]
    mc_lon = chart.angles["mc"]
    from .constants import sign_from_longitude, SIGN_ELEMENT, SIGN_QUALITY
    for lon, key in ((asc_lon, "asc"), (mc_lon, "mc")):
        s = sign_from_longitude(lon)
        w = _WEIGHTS[key]
        _add(elements, SIGN_ELEMENT[s], w)
        _add(qualities, SIGN_QUALITY[s], w)
        _add(signs, s, w)

    return {
        "elements": _sort(elements),
        "qualities": _sort(qualities),
        "signs": _sort(signs),
        "houses": {str(k): v for k, v in sorted(houses.items(), key=lambda kv: -kv[1])},
        "rulers": _sort(rulers),
        "polarity": _sort(polarity),
        "hemispheres": _sort(hemispheres),
    }


def _sort(d: dict[str, float]) -> dict[str, float]:
    # keep only non-zero, sorted desc
    items = sorted(((k, round(v, 2)) for k, v in d.items() if v > 0), key=lambda kv: -kv[1])
    return {k: v for k, v in items}
