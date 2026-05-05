"""Aspect calculations."""

from __future__ import annotations

from dataclasses import dataclass

from ..config import DEFAULT_ORBS, LUMINARY_BONUS
from .constants import ASPECTS, PLANETS


@dataclass
class Aspect:
    body_a: str
    body_b: str
    aspect: str
    angle: float        # target angle of the aspect
    exact_delta: float  # signed offset from exact (deg)
    orb: float          # absolute orb
    applying: bool      # true if planets are moving toward exact
    nature: str
    strength: float     # 0..1, higher = tighter


def _shortest_delta(lon_a: float, lon_b: float) -> float:
    diff = (lon_a - lon_b) % 360.0
    if diff > 180.0:
        diff -= 360.0
    return diff


def _is_applying(
    lon_a: float, speed_a: float, lon_b: float, speed_b: float, target: float
) -> bool:
    """Check whether the aspect is applying (orb decreasing) or separating."""
    current = abs(_shortest_delta(lon_a, lon_b))
    later_a = lon_a + speed_a * 0.5  # 12h ahead
    later_b = lon_b + speed_b * 0.5
    future = abs(_shortest_delta(later_a, later_b))
    return abs(future - target) < abs(current - target)


def compute_aspects(
    positions: dict,
    orbs: dict[str, float] | None = None,
    include_points: bool = True,
) -> list[Aspect]:
    """Compute all aspects between bodies in `positions`.

    `positions` is a mapping body-key -> object with `.longitude` and
    `.speed_longitude` (e.g. BodyPosition). Angles dict (asc / mc) may also be
    passed in; they'll be given speed 0.
    """
    orbs = {**DEFAULT_ORBS, **(orbs or {})}
    keys = [k for k in positions.keys()]
    if not include_points:
        keys = [k for k in keys if k in PLANETS and not PLANETS[k].is_point]

    results: list[Aspect] = []
    for i in range(len(keys)):
        for j in range(i + 1, len(keys)):
            ka, kb = keys[i], keys[j]
            a, b = positions[ka], positions[kb]
            lon_a = getattr(a, "longitude", None)
            lon_b = getattr(b, "longitude", None)
            if lon_a is None or lon_b is None:
                continue
            speed_a = getattr(a, "speed_longitude", 0.0)
            speed_b = getattr(b, "speed_longitude", 0.0)

            sep = abs(_shortest_delta(lon_a, lon_b))
            for aspect_name, target in ASPECTS.items():
                base_orb = orbs.get(aspect_name, DEFAULT_ORBS[aspect_name])
                # Luminaries get a slightly wider orb
                if any(k in ("sun", "moon") for k in (ka, kb)):
                    base_orb += LUMINARY_BONUS
                delta = sep - target
                if abs(delta) <= base_orb:
                    strength = max(0.0, 1.0 - abs(delta) / base_orb)
                    applying = _is_applying(lon_a, speed_a, lon_b, speed_b, target)
                    from .constants import ASPECT_NATURE
                    results.append(
                        Aspect(
                            body_a=ka,
                            body_b=kb,
                            aspect=aspect_name,
                            angle=target,
                            exact_delta=delta,
                            orb=abs(delta),
                            applying=applying,
                            nature=ASPECT_NATURE[aspect_name],
                            strength=strength,
                        )
                    )
                    break  # only the tightest aspect between the pair

    # Sort by tightest orb first
    results.sort(key=lambda a: a.orb)
    return results
