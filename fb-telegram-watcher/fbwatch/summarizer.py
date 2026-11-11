"""Hebrew summary of new posts via the Claude API."""
import datetime as dt
from zoneinfo import ZoneInfo

import anthropic

from . import config

client = anthropic.AsyncAnthropic(api_key=config.ANTHROPIC_API_KEY)

SYSTEM = """אתה עוזר שמסכם פוסטים מקבוצת פייסבוק ציבורית עבור עורך דין עסוק.
כתוב בעברית בלבד, בטקסט פשוט שמתאים להודעת טלגרם (בלי Markdown, בלי כוכביות ובלי #). השתמש באימוג'י ככותרות.
מבנה התשובה:
📌 נושאים עיקריים – 3 עד 7 נקודות קצרות.
⭐ פוסטים בולטים – עד 7 פוסטים. לכל אחד: שורה של תמצית, שם המפרסם, ובשורה נפרדת הקישור המלא כפי שקיבלת אותו.
🔥 דיונים חמים – הפוסטים עם הכי הרבה תגובות או שהעוררו מחלוקת, עם קישור.
היה תמציתי ועובדתי. אל תמציא מידע ואל תמציא קישורים. אם אין קישור לפוסט – אל תכתוב קישור."""


def _fmt_ts(ts):
    if not ts:
        return "לא ידוע"
    return dt.datetime.fromtimestamp(ts, ZoneInfo(config.TZ)).strftime("%d/%m %H:%M")


def build_prompt(posts, group_url, days):
    lines = [f"קבוצה: {group_url}", f"טווח: {days} ימים אחרונים", f"מספר פוסטים: {len(posts)}", ""]
    for i, p in enumerate(posts, 1):
        lines.append(f"--- פוסט {i} ---")
        lines.append(f"מפרסם: {p.get('author') or 'לא ידוע'}")
        lines.append(f"תאריך: {_fmt_ts(p.get('posted_at') or p.get('first_seen'))}")
        lines.append(f"תגובות: {p['comments'] if p.get('comments') is not None else 'לא ידוע'}")
        lines.append(f"קישור: {p.get('url') or 'אין'}")
        lines.append((p.get("text") or "").strip()[:3000])
        lines.append("")
    return "\n".join(lines)


async def summarize(posts, group_url, days) -> str:
    resp = await client.beta.messages.create(
        model=config.CLAUDE_MODEL,
        max_tokens=16000,
        system=SYSTEM,
        output_config={"effort": "medium"},
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
        messages=[{"role": "user", "content": build_prompt(posts, group_url, days)}],
    )
    if resp.stop_reason == "refusal":
        raise RuntimeError("Claude סירב לסכם את התוכן הזה.")
    text = "\n".join(b.text for b in resp.content if b.type == "text").strip()
    if not text:
        raise RuntimeError("התקבלה תשובה ריקה מ-Claude.")
    return text
