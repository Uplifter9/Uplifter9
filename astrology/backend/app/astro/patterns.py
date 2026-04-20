"""Detection of chart patterns: stelliums, grand trines, t-squares, yods, …"""

from __future__ import annotations

from itertools import combinations
from typing import Any


def _aspects_between(aspects, a: str, b: str):
    for asp in aspects:
        if {asp.body_a, asp.body_b} == {a, b}:
            yield asp


def _has_aspect(aspects, a: str, b: str, name: str) -> bool:
    return any(asp.aspect == name for asp in _aspects_between(aspects, a, b))


def detect_patterns(chart) -> list[dict[str, Any]]:
    patterns: list[dict[str, Any]] = []

    body_keys = [k for k in chart.bodies.keys() if k != "south_node"]

    # --- Stelliums: 3+ planets in the same sign or house
    by_sign: dict[str, list[str]] = {}
    by_house: dict[int, list[str]] = {}
    for k, b in chart.bodies.items():
        if k in ("south_node", "lilith", "true_node"):
            continue
        by_sign.setdefault(b.sign, []).append(k)
        by_house.setdefault(b.house, []).append(k)

    for sign, members in by_sign.items():
        if len(members) >= 3:
            patterns.append({"type": "stellium", "scope": "sign", "sign": sign, "bodies": members})
    for house, members in by_house.items():
        if len(members) >= 3:
            patterns.append({"type": "stellium", "scope": "house", "house": house, "bodies": members})

    # --- Grand trine: three planets mutually in trine
    for a, b, c in combinations(body_keys, 3):
        if (
            _has_aspect(chart.aspects, a, b, "trine")
            and _has_aspect(chart.aspects, b, c, "trine")
            and _has_aspect(chart.aspects, a, c, "trine")
        ):
            # Element of the grand trine
            elem = chart.bodies[a].element
            patterns.append({"type": "grand_trine", "bodies": [a, b, c], "element": elem})

    # --- T-square: two planets in opposition + both square to a third
    for a, b in combinations(body_keys, 2):
        if _has_aspect(chart.aspects, a, b, "opposition"):
            for c in body_keys:
                if c in (a, b):
                    continue
                if _has_aspect(chart.aspects, a, c, "square") and _has_aspect(chart.aspects, b, c, "square"):
                    patterns.append({"type": "t_square", "bodies": [a, b, c], "apex": c})

    # --- Grand cross: 4 planets forming 2 oppositions + 4 squares
    for quad in combinations(body_keys, 4):
        opps = []
        sqs = []
        for x, y in combinations(quad, 2):
            if _has_aspect(chart.aspects, x, y, "opposition"):
                opps.append((x, y))
            elif _has_aspect(chart.aspects, x, y, "square"):
                sqs.append((x, y))
        if len(opps) == 2 and len(sqs) == 4:
            patterns.append({"type": "grand_cross", "bodies": list(quad)})

    # --- Yod: two planets in sextile, both quincunx to a third (apex)
    for a, b in combinations(body_keys, 2):
        if _has_aspect(chart.aspects, a, b, "sextile"):
            for c in body_keys:
                if c in (a, b):
                    continue
                if _has_aspect(chart.aspects, a, c, "quincunx") and _has_aspect(chart.aspects, b, c, "quincunx"):
                    patterns.append({"type": "yod", "bodies": [a, b, c], "apex": c})

    # --- Kite: grand trine + one planet in opposition to one of the trine points
    #    and in sextile to the other two.
    for pattern in [p for p in patterns if p["type"] == "grand_trine"]:
        trio = pattern["bodies"]
        for p in body_keys:
            if p in trio:
                continue
            opps = [q for q in trio if _has_aspect(chart.aspects, p, q, "opposition")]
            sex = [q for q in trio if _has_aspect(chart.aspects, p, q, "sextile")]
            if len(opps) == 1 and len(sex) == 2:
                patterns.append({"type": "kite", "bodies": trio + [p], "opposition_point": p})

    # --- Mystic rectangle: 2 oppositions connected by 2 trines + 2 sextiles
    for quad in combinations(body_keys, 4):
        opps = []
        trines = []
        sexes = []
        for x, y in combinations(quad, 2):
            if _has_aspect(chart.aspects, x, y, "opposition"):
                opps.append((x, y))
            elif _has_aspect(chart.aspects, x, y, "trine"):
                trines.append((x, y))
            elif _has_aspect(chart.aspects, x, y, "sextile"):
                sexes.append((x, y))
        if len(opps) == 2 and len(trines) == 2 and len(sexes) == 2:
            patterns.append({"type": "mystic_rectangle", "bodies": list(quad)})

    # Deduplicate (same pattern with same body set)
    seen = set()
    unique = []
    for p in patterns:
        key = (p["type"], tuple(sorted(p.get("bodies", []))), p.get("scope"), p.get("sign"), p.get("house"), p.get("apex"))
        if key in seen:
            continue
        seen.add(key)
        unique.append(p)
    return unique
