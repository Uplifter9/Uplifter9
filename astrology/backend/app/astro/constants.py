"""Astrological constants: planets, signs, aspects, rulerships."""

from __future__ import annotations

from dataclasses import dataclass

import swisseph as swe


# ---------------------------------------------------------------------------
# Zodiac signs
# ---------------------------------------------------------------------------

SIGNS: list[str] = [
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
]

SIGN_ELEMENT: dict[str, str] = {
    "aries": "fire", "leo": "fire", "sagittarius": "fire",
    "taurus": "earth", "virgo": "earth", "capricorn": "earth",
    "gemini": "air", "libra": "air", "aquarius": "air",
    "cancer": "water", "scorpio": "water", "pisces": "water",
}

SIGN_QUALITY: dict[str, str] = {
    "aries": "cardinal", "cancer": "cardinal", "libra": "cardinal", "capricorn": "cardinal",
    "taurus": "fixed", "leo": "fixed", "scorpio": "fixed", "aquarius": "fixed",
    "gemini": "mutable", "virgo": "mutable", "sagittarius": "mutable", "pisces": "mutable",
}

SIGN_POLARITY: dict[str, str] = {
    s: ("masculine" if SIGN_ELEMENT[s] in ("fire", "air") else "feminine") for s in SIGNS
}

# Traditional rulers (for dignity / dominance calculations)
SIGN_TRADITIONAL_RULER: dict[str, str] = {
    "aries": "mars", "taurus": "venus", "gemini": "mercury",
    "cancer": "moon", "leo": "sun", "virgo": "mercury",
    "libra": "venus", "scorpio": "mars", "sagittarius": "jupiter",
    "capricorn": "saturn", "aquarius": "saturn", "pisces": "jupiter",
}

# Modern rulers
SIGN_MODERN_RULER: dict[str, str] = {
    **SIGN_TRADITIONAL_RULER,
    "scorpio": "pluto",
    "aquarius": "uranus",
    "pisces": "neptune",
}


def sign_from_longitude(lon: float) -> str:
    return SIGNS[int(lon % 360) // 30]


def degree_in_sign(lon: float) -> float:
    return lon % 30


# ---------------------------------------------------------------------------
# Planets / points
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class PlanetDef:
    key: str
    swe_id: int
    is_luminary: bool = False
    is_outer: bool = False
    is_point: bool = False  # nodes / lilith / chiron etc.


PLANETS: dict[str, PlanetDef] = {
    "sun":     PlanetDef("sun",     swe.SUN,     is_luminary=True),
    "moon":    PlanetDef("moon",    swe.MOON,    is_luminary=True),
    "mercury": PlanetDef("mercury", swe.MERCURY),
    "venus":   PlanetDef("venus",   swe.VENUS),
    "mars":    PlanetDef("mars",    swe.MARS),
    "jupiter": PlanetDef("jupiter", swe.JUPITER),
    "saturn":  PlanetDef("saturn",  swe.SATURN),
    "uranus":  PlanetDef("uranus",  swe.URANUS, is_outer=True),
    "neptune": PlanetDef("neptune", swe.NEPTUNE, is_outer=True),
    "pluto":   PlanetDef("pluto",   swe.PLUTO,  is_outer=True),
    "chiron":  PlanetDef("chiron",  swe.CHIRON, is_point=True),
    "true_node": PlanetDef("true_node", swe.TRUE_NODE, is_point=True),
    "lilith":  PlanetDef("lilith",  swe.MEAN_APOG, is_point=True),
}

# Iteration order (aesthetically astrologically standard)
PLANET_ORDER: list[str] = [
    "sun", "moon", "mercury", "venus", "mars",
    "jupiter", "saturn", "uranus", "neptune", "pluto",
    "chiron", "true_node", "lilith",
]


# ---------------------------------------------------------------------------
# Aspects
# ---------------------------------------------------------------------------

ASPECTS: dict[str, float] = {
    "conjunction":     0.0,
    "opposition":    180.0,
    "square":         90.0,
    "trine":         120.0,
    "sextile":        60.0,
    "quincunx":      150.0,
    "semisextile":    30.0,
    "semisquare":     45.0,
    "sesquiquadrate": 135.0,
}

ASPECT_NATURE: dict[str, str] = {
    "conjunction":    "neutral",
    "opposition":     "hard",
    "square":         "hard",
    "trine":          "soft",
    "sextile":        "soft",
    "quincunx":       "hard",
    "semisextile":    "neutral",
    "semisquare":     "hard",
    "sesquiquadrate": "hard",
}


# ---------------------------------------------------------------------------
# House systems
# ---------------------------------------------------------------------------

HOUSE_SYSTEMS: dict[str, bytes] = {
    "placidus": b"P",
    "koch":     b"K",
    "whole":    b"W",
    "equal":    b"E",
}
