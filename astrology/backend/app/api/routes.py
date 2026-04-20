"""Public REST endpoints."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from ..astro.chart import BirthInput, build_natal_chart
from ..config import SUPPORTED_LANGS
from ..i18n import get_translator
from ..interpretation.engine import interpret_chart
from ..predictions.engine import build_forecast
from ..recommendations.engine import build_recommendations
from ..services.geocoding import resolve_timezone_for, try_online_geocode
from .schemas import ChartRequest, ForecastRequest, GeocodeRequest


router = APIRouter(prefix="/api")


# ---------------------------------------------------------------------------
# Meta
# ---------------------------------------------------------------------------


@router.get("/i18n/{lang}")
def get_translations(lang: str):
    if lang not in SUPPORTED_LANGS:
        raise HTTPException(status_code=404, detail="Language not supported")
    t = get_translator(lang)
    return {"lang": lang, "direction": t.direction, "data": t._primary}


@router.get("/meta")
def meta():
    return {
        "languages": list(SUPPORTED_LANGS),
        "default_lang": "he",
        "house_systems": ["placidus", "koch", "whole", "equal"],
    }


# ---------------------------------------------------------------------------
# Geocoding helper
# ---------------------------------------------------------------------------


@router.post("/geocode")
def geocode(req: GeocodeRequest):
    res = try_online_geocode(req.query)
    if not res:
        raise HTTPException(status_code=404, detail="place_not_found")
    return {
        "name": res.name,
        "country": res.country,
        "latitude": res.latitude,
        "longitude": res.longitude,
        "timezone": res.timezone,
    }


# ---------------------------------------------------------------------------
# Chart + interpretation
# ---------------------------------------------------------------------------


def _birth_input(bd) -> BirthInput:
    return BirthInput(
        name=bd.name, year=bd.year, month=bd.month, day=bd.day,
        hour=bd.hour, minute=bd.minute,
        latitude=bd.latitude, longitude=bd.longitude,
        place=bd.place, country=bd.country,
        tz_name=bd.tz_name, house_system=bd.house_system,
    )


@router.post("/chart")
def post_chart(req: ChartRequest):
    try:
        chart = build_natal_chart(_birth_input(req.birth))
    except Exception as e:  # noqa: BLE001 — surface to client
        raise HTTPException(status_code=400, detail=f"chart_error:{e}") from e
    interpretation = interpret_chart(chart, req.lang)
    return {
        "chart": chart.to_dict(),
        "interpretation": interpretation,
    }


@router.post("/forecast")
def post_forecast(req: ForecastRequest):
    try:
        chart = build_natal_chart(_birth_input(req.birth))
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"chart_error:{e}") from e
    start = datetime.now(tz=timezone.utc).replace(tzinfo=None)
    if req.start_date:
        try:
            start = datetime.fromisoformat(req.start_date)
        except ValueError:
            pass
    forecast = build_forecast(chart, start, months=req.months, lang=req.lang)
    return forecast


@router.post("/recommendations")
def post_recommendations(req: ChartRequest):
    try:
        chart = build_natal_chart(_birth_input(req.birth))
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"chart_error:{e}") from e
    return build_recommendations(chart, req.lang)


@router.post("/full")
def post_full(req: ForecastRequest):
    """Single endpoint returning chart + interpretation + forecast + recommendations."""
    try:
        chart = build_natal_chart(_birth_input(req.birth))
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"chart_error:{e}") from e
    interpretation = interpret_chart(chart, req.lang)
    start = datetime.now(tz=timezone.utc).replace(tzinfo=None)
    if req.start_date:
        try:
            start = datetime.fromisoformat(req.start_date)
        except ValueError:
            pass
    forecast = build_forecast(chart, start, months=req.months, lang=req.lang)
    recommendations = build_recommendations(chart, req.lang)
    return {
        "chart": chart.to_dict(),
        "interpretation": interpretation,
        "forecast": forecast,
        "recommendations": recommendations,
    }


@router.post("/timezone")
def post_timezone(latitude: float, longitude: float):
    return {"timezone": resolve_timezone_for(latitude, longitude)}
