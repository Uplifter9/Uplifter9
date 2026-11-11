"""Loads secrets from .env. Nothing secret is ever hard-coded here."""
import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = Path(os.environ.get("FBWATCH_ENV", "/opt/fbwatch/.env"))
if ENV_FILE.exists():
    load_dotenv(ENV_FILE)
else:
    load_dotenv(BASE_DIR / ".env")


def _req(name: str) -> str:
    val = os.environ.get(name, "").strip()
    if not val:
        raise SystemExit(f"Missing {name} in .env")
    return val


TELEGRAM_BOT_TOKEN = _req("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = int(_req("TELEGRAM_CHAT_ID"))
ANTHROPIC_API_KEY = _req("ANTHROPIC_API_KEY")
VNC_PASSWORD = _req("VNC_PASSWORD")

TZ = os.environ.get("TZ", "Asia/Jerusalem")
MAX_POSTS_PER_RUN = int(os.environ.get("MAX_POSTS_PER_RUN", "60"))
DATA_DIR = Path(os.environ.get("DATA_DIR", "/opt/fbwatch/data"))
DISPLAY = os.environ.get("DISPLAY", ":99")

PROFILE_DIR = DATA_DIR / "browser-profile"
DB_PATH = DATA_DIR / "posts.sqlite3"
NOVNC_DIR = os.environ.get("NOVNC_DIR", "/usr/share/novnc")
NOVNC_PORT = int(os.environ.get("NOVNC_PORT", "6080"))
VNC_PORT = int(os.environ.get("VNC_PORT", "5900"))
LOGIN_TIMEOUT_MIN = int(os.environ.get("LOGIN_TIMEOUT_MIN", "15"))

CLAUDE_MODEL = os.environ.get("CLAUDE_MODEL", "claude-opus-5-5")

DATA_DIR.mkdir(parents=True, exist_ok=True)
