"""Natal chart builder."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any

import pytz
from timezonefinder import TimezoneFinder

from .aspects import Aspect, compute_aspects
from .constants import (
    HOUSE_SYSTEMS,
    PLANET_ORDER,
    SIGN_ELEMENT,
    SIGN_MODERN_RULER,
    SIGN_QUALITY,
    degree_in_sign,
    sign_from_longitude,
)
from .ephemeris import BodyPosition, compute_houses, compute_positions
from .houses import house_of_longitude


_tzf = TimezoneFinder()


@dataclass
class BirthInput:
    name: str
    year: int
    month: int
    day: int
    hour: int
    minute: int
    latitude: float
    longitude: float
    place: str = ""
    country: str = ""
    tz_name: str | None = None  # e.g. "Asia/Jerusalem". If None, inferred.
    house_system: str = "placidus"


@dataclass
class PlacedBody:
    key: str
    longitude: float
    latitude: float
    speed: float
    retrograde: bool
    sign: str
    sign_degree: float
    element: str
    quality: str
    house: int
    dignity: str  # "domicile" | "exaltation" | "detriment" | "fall" | "peregrine"


@dataclass
class NatalChart:
    input: BirthInput
    datetime_utc: str
    datetime_local: str
    tz_name: str
    julian_day: float
    bodies: dict[str, PlacedBody]
    cusps: list[float]
    angles: dict[str, float]
    aspects: list[Aspect]
    dominances: dict[str, Any] = field(default_factory=dict)
    patterns: list[dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "input": asdict(self.input),
            "datetime_utc": self.datetime_utc,
            "datetime_local": self.datetime_local,
            "tz_name": self.tz_name,
            "julian_day": self.julian_day,
            "bodies": {k: asdict(v) for k, v in self.bodies.items()},
            "cusps": self.cusps,
            "angles": self.angles,
            "aspects": [asdict(a) for a in self.aspects],
            "dominances": self.dominances,
            "patterns": self.patterns,
        }


# ---------------------------------------------------------------------------
# Timezone / UTC
# ---------------------------------------------------------------------------


def resolve_timezone(birth: BirthInput) -> str:
    if birth.tz_name:
        return birth.tz_name
    tz = _tzf.timezone_at(lat=birth.latitude, lng=birth.longitude)
    if not tz:
        tz = "UTC"
    return tz


def local_to_utc(birth: BirthInput, tz_name: str) -> tuple[datetime, datetime]:
    tz = pytz.timezone(tz_name)
    local_naive = datetime(
        birth.year, birth.month, birth.day, birth.hour, birth.minute
    )
    local = tz.localize(local_naive, is_dst=None)
    utc = local.astimezone(pytz.UTC)
    return local, utc


# ---------------------------------------------------------------------------
# Dignity
# ---------------------------------------------------------------------------

_EXALTATION = {
    "sun": "aries", "moon": "taurus", "mercury": "virgo", "venus": "pisces",
    "mars": "capricorn", "jupiter": "cancer", "saturn": "libra",
}
_FALL = {
    "sun": "libra", "moon": "scorpio", "mercury": "pisces", "venus": "virgo",
    "mars": "cancer", "jupiter": "capricorn", "saturn": "aries",
}
_DETRIMENT = {
    "sun": "aquarius", "moon": "capricorn", "mercury": "sagittarius",
    "venus": "aries", "mars": "libra", "jupiter": "gemini", "saturn": "cancer",
    "uranus": "leo", "neptune": "virgo", "pluto": "taurus",
}


def _dignity(planet: str, sign: str) -> str:
    ruler_sign = {v: k for k, v in SIGN_MODERN_RULER.items() if k is not None}
    # domicile = rules this sign
    if SIGN_MODERN_RULER.get(sign) == planet:
        return "domicile"
    if _EXALTATION.get(planet) == sign:
        return "exaltation"
    if _DETRIMENT.get(planet) == sign:
        return "detriment"
    if _FALL.get(planet) == sign:
        return "fall"
    return "peregrine"


# ---------------------------------------------------------------------------
# Build chart
# ---------------------------------------------------------------------------


def _placed_body(pos: BodyPosition, cusps: list[float]) -> PlacedBody:
    sign = sign_from_longitude(pos.longitude)
    return PlacedBody(
        key=pos.key,
        longitude=pos.longitude,
        latitude=pos.latitude,
        speed=pos.speed_longitude,
        retrograde=pos.retrograde,
        sign=sign,
        sign_degree=degree_in_sign(pos.longitude),
        element=SIGN_ELEMENT[sign],
        quality=SIGN_QUALITY[sign],
        house=house_of_longitude(pos.longitude, cusps),
        dignity=_dignity(pos.key, sign),
    )


def build_natal_chart(birth: BirthInput) -> NatalChart:
    tz_name = resolve_timezone(birth)
    local_dt, utc_dt = local_to_utc(birth, tz_name)

    positions = compute_positions(utc_dt)
    cusps, angles = compute_houses(
        utc_dt, birth.latitude, birth.longitude,
        HOUSE_SYSTEMS.get(birth.house_system, b"P"),
    )

    bodies: dict[str, PlacedBody] = {}
    for key in PLANET_ORDER + ["south_node"]:
        if key in positions:
            bodies[key] = _placed_body(positions[key], cusps)

    # Include angles as pseudo-bodies for aspect calculation context
    aspect_input: dict[str, Any] = {k: v for k, v in bodies.items()}

    class _Angle:
        def __init__(self, lon): self.longitude = lon; self.speed_longitude = 0.0

    aspect_input["asc"] = _Angle(angles["asc"])
    aspect_input["mc"] = _Angle(angles["mc"])

    aspects = compute_aspects(aspect_input, include_points=True)

    from .ephemeris import julian_day
    chart = NatalChart(
        input=birth,
        datetime_utc=utc_dt.replace(tzinfo=timezone.utc).isoformat(),
        datetime_local=local_dt.isoformat(),
        tz_name=tz_name,
        julian_day=julian_day(utc_dt),
        bodies=bodies,
        cusps=cusps,
        angles=angles,
        aspects=aspects,
    )

    # Enrich with derived analyses
    from .dominance import compute_dominance
    from .patterns import detect_patterns
    chart.dominances = compute_dominance(chart)
    chart.patterns = detect_patterns(chart)
    return chart
