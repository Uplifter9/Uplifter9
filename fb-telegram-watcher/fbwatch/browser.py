"""One shared Chromium profile (persistent context) so the Facebook login survives restarts.

Chromium runs "headed" on the virtual screen (Xvfb, DISPLAY=:99). The same screen is
what you see through noVNC during /login, and it looks like a normal browser to Facebook.
Only one task may use the profile at a time, hence BROWSER_LOCK.
"""
import asyncio
import os
from contextlib import asynccontextmanager

from playwright.async_api import async_playwright

from . import config

BROWSER_LOCK = asyncio.Lock()

SCREEN_W, SCREEN_H = 900, 1100


@asynccontextmanager
async def open_profile():
    config.PROFILE_DIR.mkdir(parents=True, exist_ok=True)
    env = dict(os.environ, DISPLAY=config.DISPLAY)
    async with async_playwright() as pw:
        ctx = await pw.chromium.launch_persistent_context(
            user_data_dir=str(config.PROFILE_DIR),
            headless=False,
            no_viewport=True,
            locale="he-IL",
            timezone_id=config.TZ,
            env=env,
            args=[
                f"--window-size={SCREEN_W},{SCREEN_H}",
                "--window-position=0,0",
                "--disable-blink-features=AutomationControlled",
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-notifications",
            ],
        )
        try:
            yield ctx
        finally:
            await ctx.close()


async def has_session_cookie(ctx) -> bool:
    cookies = await ctx.cookies("https://www.facebook.com")
    return any(c["name"] == "c_user" for c in cookies)
