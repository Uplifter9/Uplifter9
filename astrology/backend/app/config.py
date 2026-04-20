"""Application configuration."""

from __future__ import annotations

import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent

# Default orbs (in degrees). Can be overridden per request.
DEFAULT_ORBS: dict[str, float] = {
    "conjunction": 8.0,
    "opposition": 8.0,
    "square": 7.0,
    "trine": 7.0,
    "sextile": 5.0,
    "quincunx": 3.0,
    "semisextile": 2.0,
    "semisquare": 2.0,
    "sesquiquadrate": 2.0,
}

# Luminary orbs are slightly wider
LUMINARY_BONUS = 2.0

# Supported languages
SUPPORTED_LANGS = ("he", "en", "ar")
DEFAULT_LANG = "he"

# Ephemeris path — Swiss Ephemeris will fall back to the built-in Moshier
# analytic ephemeris when no SE data is available, which is precise enough
# for interpretive astrology in a ±600 year window.
SWISSEPH_PATH = os.getenv("SWISSEPH_PATH", "")
