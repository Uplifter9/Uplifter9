"""Secondary progressions — one day after birth = one year of life."""

from __future__ import annotations

from datetime import datetime, timedelta

from .chart import BirthInput, PlacedBody, _placed_body
from .constants import PLANET_ORDER
from .ephemeris import compute_houses, compute_positions
from .houses import house_of_longitude
from .constants import HOUSE_SYSTEMS


def progressed_positions(
    birth_utc: datetime,
    target_date: datetime,
    birth_latitude: float,
    birth_longitude: float,
    house_system: str = "placidus",
) -> tuple[dict[str, PlacedBody], list[float], dict[str, float]]:
    """Compute secondary progressed chart for `target_date`.

    One day of ephemeris movement after birth corresponds to one year of life.
    """
    age_years = (target_date - birth_utc).days / 365.25
    prog_dt = birth_utc + timedelta(days=age_years)
    positions = compute_positions(prog_dt)
    cusps, angles = compute_houses(
        prog_dt, birth_latitude, birth_longitude,
        HOUSE_SYSTEMS.get(house_system, b"P"),
    )
    bodies: dict[str, PlacedBody] = {}
    for key in PLANET_ORDER:
        if key in positions:
            bodies[key] = _placed_body(positions[key], cusps)
    return bodies, cusps, angles
