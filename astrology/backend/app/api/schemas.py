"""Pydantic request / response schemas."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, field_validator


class BirthData(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    year: int = Field(..., ge=1800, le=2200)
    month: int = Field(..., ge=1, le=12)
    day: int = Field(..., ge=1, le=31)
    hour: int = Field(..., ge=0, le=23)
    minute: int = Field(..., ge=0, le=59)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    place: str = ""
    country: str = ""
    tz_name: str | None = None
    house_system: Literal["placidus", "koch", "whole", "equal"] = "placidus"

    @field_validator("name", "place", "country")
    @classmethod
    def _strip(cls, v: str) -> str:
        return v.strip()


class ChartRequest(BaseModel):
    birth: BirthData
    lang: Literal["he", "en", "ar"] = "he"


class ForecastRequest(BaseModel):
    birth: BirthData
    lang: Literal["he", "en", "ar"] = "he"
    months: int = Field(12, ge=1, le=60)
    start_date: str | None = None  # ISO date, defaults to today


class GeocodeRequest(BaseModel):
    query: str = Field(..., min_length=2)
