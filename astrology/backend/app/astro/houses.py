"""House helpers — assign planets to houses using actual cusp longitudes."""

from __future__ import annotations


def house_of_longitude(lon: float, cusps: list[float]) -> int:
    """Return 1..12 — the house number in which the longitude falls.

    The zodiac is a circle so each house spans from cusps[i] (inclusive) to
    cusps[i+1] (exclusive), mod 360. Works for any house system that returns
    twelve ascending cusps (Placidus, Koch, Equal, Whole, Regiomontanus…).
    """
    lon = lon % 360.0
    for i in range(12):
        start = cusps[i] % 360.0
        end = cusps[(i + 1) % 12] % 360.0
        if start < end:
            if start <= lon < end:
                return i + 1
        else:
            # Wraps past 0°
            if lon >= start or lon < end:
                return i + 1
    return 12
