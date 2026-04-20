"""FastAPI entry point."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import __version__
from .api.routes import router


def create_app() -> FastAPI:
    app = FastAPI(
        title="Cosmos — Astrology Prediction API",
        description="Premium multilingual astrology backend.",
        version=__version__,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(router)

    @app.get("/")
    def root():
        return {"status": "ok", "name": "Cosmos API", "version": __version__}

    return app


app = create_app()
