"""Manual Facebook login through a temporary, password-protected remote view (noVNC).

Flow: x11vnc (password from .env, localhost only) -> websockify/noVNC (localhost only)
-> cloudflared quick tunnel (temporary https URL, no open ports on the server).
Everything is shut down as soon as login succeeds, fails or times out.
No Facebook username/password is ever seen or stored by this code: you type them
directly into Facebook's own page.
"""
import asyncio
import os
import re
import shutil
import tempfile
import time

from . import config
from .browser import has_session_cookie, open_profile

TUNNEL_RE = re.compile(r"https://[a-z0-9-]+\.trycloudflare\.com")


async def _spawn(*cmd, capture=False):
    return await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.DEVNULL,
        stderr=asyncio.subprocess.PIPE if capture else asyncio.subprocess.DEVNULL,
    )


async def _kill(proc):
    if proc and proc.returncode is None:
        proc.terminate()
        try:
            await asyncio.wait_for(proc.wait(), 5)
        except asyncio.TimeoutError:
            proc.kill()


async def _start_tunnel():
    proc = await _spawn("cloudflared", "tunnel", "--no-autoupdate",
                        "--url", f"http://127.0.0.1:{config.NOVNC_PORT}", capture=True)
    deadline = time.time() + 60
    while time.time() < deadline:
        try:
            line = await asyncio.wait_for(proc.stderr.readline(), 5)
        except asyncio.TimeoutError:
            continue
        if not line:
            break
        m = TUNNEL_RE.search(line.decode(errors="ignore"))
        if m:
            # keep draining stderr so cloudflared never blocks on a full pipe
            asyncio.create_task(_drain(proc.stderr))
            return proc, m.group(0)
    await _kill(proc)
    raise RuntimeError("לא הצלחתי לפתוח קישור זמני (cloudflared).")


async def _drain(stream):
    try:
        while await stream.readline():
            pass
    except Exception:
        pass


async def run_login(notify, fresh: bool = False) -> bool:
    """notify(text) sends a Telegram message. Caller must hold BROWSER_LOCK."""
    if fresh and config.PROFILE_DIR.exists():
        shutil.rmtree(config.PROFILE_DIR)

    procs = []
    pw_file = None
    try:
        async with open_profile() as ctx:
            page = ctx.pages[0] if ctx.pages else await ctx.new_page()
            await page.goto("https://www.facebook.com/login", wait_until="domcontentloaded")

            # VNC password file (x11vnc deletes it right after reading: "rm:" prefix)
            fd, pw_file = tempfile.mkstemp(prefix="vncpw-", dir=str(config.DATA_DIR))
            with os.fdopen(fd, "w") as f:
                f.write(config.VNC_PASSWORD + "\n")
            procs.append(await _spawn(
                "x11vnc", "-display", config.DISPLAY, "-localhost", "-rfbport", str(config.VNC_PORT),
                "-passwdfile", f"rm:{pw_file}", "-forever", "-shared", "-noxdamage", "-quiet"))
            await asyncio.sleep(2)
            procs.append(await _spawn(
                "websockify", "--web", config.NOVNC_DIR,
                f"127.0.0.1:{config.NOVNC_PORT}", f"127.0.0.1:{config.VNC_PORT}"))
            await asyncio.sleep(2)
            tunnel, base = await _start_tunnel()
            procs.append(tunnel)

            link = f"{base}/vnc.html?autoconnect=1&resize=scale&reconnect=1"
            await notify(
                "🔐 התחברות לפייסבוק\n\n"
                f"1. פתח את הקישור:\n{link}\n\n"
                "2. הקלד את סיסמת התצוגה (זו שהגדרת בהתקנה).\n"
                "3. בדפדפן שנפתח – התחבר לפייסבוק כרגיל ואשר אימות אם מתבקש.\n"
                "   (להקלדה בטלפון: פתח את התפריט הצדדי של התצוגה ולחץ על סמל המקלדת.)\n\n"
                f"הקישור ייסגר אוטומטית בסיום ההתחברות או אחרי {config.LOGIN_TIMEOUT_MIN} דקות."
            )

            deadline = time.time() + config.LOGIN_TIMEOUT_MIN * 60
            while time.time() < deadline:
                await asyncio.sleep(3)
                url = page.url if not page.is_closed() else ""
                bad = any(k in url for k in ("/login", "/checkpoint", "two_step", "/recover"))
                if await has_session_cookie(ctx) and not bad:
                    await asyncio.sleep(4)  # let Facebook finish writing cookies
                    await notify("✅ ההתחברות הצליחה. התצוגה מרחוק נסגרה.")
                    return True
            await notify("⌛ עבר הזמן וההתחברות לא הושלמה. התצוגה נסגרה. אפשר לנסות שוב עם /login")
            return False
    finally:
        for p in reversed(procs):
            await _kill(p)
        if pw_file and os.path.exists(pw_file):
            os.remove(pw_file)
