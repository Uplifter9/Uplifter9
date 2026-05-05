"""Simple JSON-backed translator with graceful fallback."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from ..config import DEFAULT_LANG, SUPPORTED_LANGS


TRANSLATIONS_DIR = Path(__file__).resolve().parent / "translations"


class Translator:
    """Lookup strings by dotted keys with {var} substitution."""

    def __init__(self, lang: str) -> None:
        if lang not in SUPPORTED_LANGS:
            lang = DEFAULT_LANG
        self.lang = lang
        self._primary = _load(lang)
        self._fallback = _load(DEFAULT_LANG) if lang != DEFAULT_LANG else self._primary
        self._english = _load("en")

    def t(self, key: str, **kwargs) -> str:
        value = _lookup(self._primary, key)
        if value is None:
            value = _lookup(self._fallback, key)
        if value is None:
            value = _lookup(self._english, key)
        if value is None:
            return key
        try:
            return value.format(**kwargs) if kwargs else value
        except (KeyError, IndexError):
            return value

    def exists(self, key: str) -> bool:
        return (
            _lookup(self._primary, key) is not None
            or _lookup(self._fallback, key) is not None
        )

    @property
    def direction(self) -> str:
        return "rtl" if self.lang in ("he", "ar") else "ltr"


@lru_cache(maxsize=16)
def _load(lang: str) -> dict[str, Any]:
    path = TRANSLATIONS_DIR / f"{lang}.json"
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _lookup(d: dict[str, Any], key: str):
    parts = key.split(".")
    cur: Any = d
    for p in parts:
        if isinstance(cur, dict) and p in cur:
            cur = cur[p]
        else:
            return None
    if isinstance(cur, (str, int, float)):
        return str(cur)
    return None


def get_translator(lang: str | None) -> Translator:
    return Translator(lang or DEFAULT_LANG)
