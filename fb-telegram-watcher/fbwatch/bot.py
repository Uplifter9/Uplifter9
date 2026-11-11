"""Telegram bot: the only user interface. Answers ONLY the chat ID from .env."""
import asyncio
import datetime as dt
import logging
import random
import re
import shutil
import time
from zoneinfo import ZoneInfo

from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes, filters

from . import config, db
from .browser import BROWSER_LOCK, has_session_cookie, open_profile
from .login_session import run_login
from .scraper import NeedsLogin, ScrapeError, normalize_group_url, scrape_group
from .summarizer import summarize

logging.basicConfig(format="%(asctime)s %(levelname)s %(name)s: %(message)s", level=logging.INFO)
logging.getLogger("httpx").setLevel(logging.WARNING)
log = logging.getLogger("fbwatch")

TZ = ZoneInfo(config.TZ)
ME = filters.Chat(chat_id=config.TELEGRAM_CHAT_ID)
DAILY_JOB = "daily-summary"

HELP = (
    "🤖 פקודות:\n"
    "/summary [ימים] – סיכום פוסטים חדשים (ברירת מחדל: יום 1). למשל: /summary 3\n"
    "/summary [ימים] all – סיכום מחדש כולל פוסטים שכבר סוכמו\n"
    "/group [קישור] – הגדרת או החלפת הקבוצה\n"
    "/login – התחברות לפייסבוק\n"
    "/login new – התחברות לחשבון אחר (מוחק את ההתחברות הקיימת)\n"
    "/status – מצב המערכת\n"
    "/schedule 18-21 – חלון השעות לסיכום היומי (/schedule off לביטול)"
)


# ---------------------------------------------------------------- helpers

async def send(app: Application, text: str):
    """Send to my chat, split under Telegram's 4096-char limit."""
    lines = []
    for line in text.split("\n"):
        lines.extend([line[i:i + 3900] for i in range(0, len(line), 3900)] or [""])
    chunks, cur = [], ""
    for line in lines:
        if len(cur) + len(line) + 1 > 3900:
            chunks.append(cur)
            cur = ""
        cur += line + "\n"
    if cur.strip():
        chunks.append(cur)
    for c in chunks:
        await app.bot.send_message(config.TELEGRAM_CHAT_ID, c, disable_web_page_preview=True)


def fmt_time(ts):
    return dt.datetime.fromtimestamp(float(ts), TZ).strftime("%d/%m/%Y %H:%M") if ts else "—"


async def flag_needs_login(app, detail=""):
    db.set_setting("needs_login", "1")
    log.warning("needs login: %s", detail)
    await send(app,
               "⚠️ פייסבוק ביקשה התחברות או אימות (או שהחיבור נותק).\n"
               "עצרתי את האיסוף – לא אנסה שוב לבד.\n"
               "כדי לחדש: שלח /login והתחבר דרך הקישור שאשלח.")


# ---------------------------------------------------------------- core job

async def do_summary(app: Application, days: float, include_old=False, auto=False):
    group = db.get_setting("group_url")
    if not group:
        await send(app, "עדיין לא הוגדרה קבוצה. שלח: /group ואחריו הקישור לקבוצה.")
        return
    if db.get_setting("needs_login") == "1":
        await send(app, "⚠️ המערכת ממתינה להתחברות מחדש לפייסבוק. שלח /login.")
        return

    if BROWSER_LOCK.locked():
        await send(app, "⏳ פעולה קודמת עדיין רצה, אתחיל מיד כשתסתיים.")
    since = time.time() - days * 86400
    async with BROWSER_LOCK:
        if not auto:
            await send(app, f"🔎 אוסף פוסטים מ-{days:g} הימים האחרונים... (זה לוקח כמה דקות)")
        try:
            async with open_profile() as ctx:
                posts = await scrape_group(ctx, group, since)
        except NeedsLogin as e:
            await flag_needs_login(app, str(e))
            return
        except ScrapeError as e:
            db.set_setting("last_error", f"{fmt_time(time.time())}: {e}")
            await send(app, f"❌ {e}")
            return

    new = db.upsert_posts(group, posts)
    db.set_setting("last_scrape", time.time())
    db.set_setting("last_scrape_count", len(posts))
    db.set_setting("last_error", "")

    if not posts:
        await send(app,
                   "⚠️ לא נמצאו פוסטים בכלל בעמוד הקבוצה.\n"
                   "אם זה חוזר על עצמו – ייתכן שפייסבוק שינתה את מבנה העמוד וצריך לעדכן את הקוד.")
        return

    todo = db.posts_for_summary(group, since, include_summarized=include_old)
    if not todo:
        await send(app, f"אין פוסטים חדשים לסיכום (נאספו {len(posts)} פוסטים, כולם כבר סוכמו בעבר).\n"
                        "לסיכום מחדש: /summary 1 all")
        return

    try:
        text = await summarize(todo, group, days)
    except Exception as e:  # noqa: BLE001
        log.exception("summary failed")
        await send(app, f"❌ הסיכום נכשל: {e}")
        return

    title = "🗞 סיכום יומי" if auto else f"🗞 סיכום {days:g} ימים"
    await send(app, f"{title} – {len(todo)} פוסטים ({new} חדשים שנאספו עכשיו)\n\n{text}")
    db.mark_summarized([p["post_id"] for p in todo])


# ---------------------------------------------------------------- daily scheduling

def parse_window(s: str):
    m = re.fullmatch(r"\s*(\d{1,2})(?::(\d{2}))?\s*-\s*(\d{1,2})(?::(\d{2}))?\s*", s)
    if not m:
        return None
    a = int(m.group(1)) * 60 + int(m.group(2) or 0)
    b = int(m.group(3)) * 60 + int(m.group(4) or 0)
    if not (0 <= a < b <= 24 * 60):
        return None
    return a, b


def schedule_next(app: Application):
    for j in app.job_queue.get_jobs_by_name(DAILY_JOB):
        j.schedule_removal()
    win = db.get_setting("window")
    if not win:
        db.set_setting("next_run", "")
        return None
    a, b = parse_window(win)
    now = dt.datetime.now(TZ)
    for add_days in (0, 1):
        day = (now + dt.timedelta(days=add_days)).replace(hour=0, minute=0, second=0, microsecond=0)
        start = max(day + dt.timedelta(minutes=a), now + dt.timedelta(minutes=2))
        end = day + dt.timedelta(minutes=b)
        if start < end and not (add_days == 0 and db.get_setting("last_auto_day") == now.date().isoformat()):
            when = start + dt.timedelta(seconds=random.uniform(0, (end - start).total_seconds()))
            app.job_queue.run_once(daily_job, when=when, name=DAILY_JOB)
            db.set_setting("next_run", when.timestamp())
            log.info("next daily summary at %s", when)
            return when
    return None


async def daily_job(context: ContextTypes.DEFAULT_TYPE):
    app = context.application
    db.set_setting("last_auto_day", dt.datetime.now(TZ).date().isoformat())
    try:
        await do_summary(app, days=2, auto=True)
    finally:
        schedule_next(app)


# ---------------------------------------------------------------- command handlers

async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("שלום! אני מוכן.\n\n" + HELP)


async def cmd_summary(update: Update, context: ContextTypes.DEFAULT_TYPE):
    args = context.args
    days = 1.0
    include_old = any(a.lower() in ("all", "הכל") for a in args)
    nums = [a for a in args if re.fullmatch(r"\d+(\.\d+)?", a)]
    if nums:
        days = float(nums[0])
    if not 0 < days <= 30:
        await update.message.reply_text("מספר הימים צריך להיות בין 1 ל-30.")
        return
    context.application.create_task(do_summary(context.application, days, include_old))


async def cmd_group(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not context.args:
        cur = db.get_setting("group_url")
        await update.message.reply_text(
            f"הקבוצה הנוכחית: {cur or 'לא הוגדרה'}\nלהגדרה: /group https://www.facebook.com/groups/...")
        return
    try:
        url = normalize_group_url(context.args[0])
    except ValueError:
        await update.message.reply_text("זה לא נראה כמו קישור לקבוצה. צריך להתחיל ב-https://www.facebook.com/groups/")
        return
    db.set_setting("group_url", url)
    await update.message.reply_text(f"✅ הקבוצה הוגדרה:\n{url}\n\nלבדיקה: /summary 1")


async def cmd_login(update: Update, context: ContextTypes.DEFAULT_TYPE):
    fresh = any(a.lower() in ("new", "חדש") for a in context.args)
    app = context.application

    async def job():
        if BROWSER_LOCK.locked():
            await send(app, "⏳ ממתין לסיום פעולה קודמת ואז אפתח את ההתחברות...")
        async with BROWSER_LOCK:
            await send(app, "פותח דפדפן ותצוגה מרחוק... (כחצי דקה)")
            try:
                ok = await run_login(lambda t: send(app, t), fresh=fresh)
            except Exception as e:  # noqa: BLE001
                log.exception("login failed")
                await send(app, f"❌ פתיחת ההתחברות נכשלה: {e}")
                return
        if ok:
            db.set_setting("needs_login", "0")
            await send(app, "אפשר להמשיך. לבדיקה: /status")

    app.create_task(job())


async def cmd_status(update: Update, context: ContextTypes.DEFAULT_TYPE):
    group = db.get_setting("group_url")
    if BROWSER_LOCK.locked():
        fb = "⏳ הדפדפן עסוק כרגע (איסוף או התחברות)"
    else:
        try:
            async with BROWSER_LOCK:
                async with open_profile() as ctx:
                    logged = await has_session_cookie(ctx)
            fb = "✅ מחובר" if logged else "❌ לא מחובר – שלח /login"
        except Exception as e:  # noqa: BLE001
            fb = f"❌ שגיאה בפתיחת הדפדפן: {e}"
    if db.get_setting("needs_login") == "1":
        fb = "⚠️ פייסבוק ביקשה אימות – שלח /login"
    total, pending = db.counts(group) if group else (0, 0)
    free_gb = shutil.disk_usage(config.DATA_DIR).free / 1e9
    nxt = db.get_setting("next_run")
    err = db.get_setting("last_error")
    lines = [
        "📊 מצב המערכת",
        f"פייסבוק: {fb}",
        f"קבוצה: {group or 'לא הוגדרה (/group)'}",
        f"איסוף אחרון: {fmt_time(db.get_setting('last_scrape'))} "
        f"({db.get_setting('last_scrape_count', '0')} פוסטים)",
        f"פוסטים במאגר: {total} (ממתינים לסיכום: {pending})",
        f"חלון סיכום יומי: {db.get_setting('window') or 'לא הוגדר (/schedule)'}",
        f"הסיכום היומי הבא: {fmt_time(nxt) if nxt else '—'}",
        f"מקום פנוי בדיסק: {free_gb:.1f}GB",
    ]
    if err:
        lines.append(f"שגיאה אחרונה: {err}")
    await update.message.reply_text("\n".join(lines))


async def cmd_schedule(update: Update, context: ContextTypes.DEFAULT_TYPE):
    arg = " ".join(context.args).strip()
    if not arg:
        await update.message.reply_text(
            f"חלון נוכחי: {db.get_setting('window') or 'לא הוגדר'}\n"
            "דוגמה: /schedule 18-21 (סיכום פעם ביום בשעה אקראית בין 18:00 ל-21:00)\n"
            "ביטול: /schedule off")
        return
    if arg.lower() in ("off", "כבוי", "בטל"):
        db.set_setting("window", "")
        schedule_next(context.application)
        await update.message.reply_text("הסיכום היומי בוטל.")
        return
    if not parse_window(arg):
        await update.message.reply_text("לא הבנתי. כתוב למשל: /schedule 18-21 או /schedule 07:30-09:00")
        return
    db.set_setting("window", arg.replace(" ", ""))
    when = schedule_next(context.application)
    await update.message.reply_text(
        f"✅ נקבע חלון {arg}.\nהסיכום הבא: {when.strftime('%d/%m %H:%M') if when else '—'}")


async def on_error(update, context: ContextTypes.DEFAULT_TYPE):
    log.exception("handler error", exc_info=context.error)
    try:
        await send(context.application, f"❌ שגיאה לא צפויה: {context.error}")
    except Exception:
        pass


async def post_init(app: Application):
    db.init()
    schedule_next(app)
    await app.bot.set_my_commands([
        ("summary", "סיכום פוסטים (ימים)"),
        ("group", "הגדרת קבוצה"),
        ("login", "התחברות לפייסבוק"),
        ("status", "מצב המערכת"),
        ("schedule", "חלון סיכום יומי"),
    ])


def main():
    app = (Application.builder().token(config.TELEGRAM_BOT_TOKEN)
           .concurrent_updates(True).post_init(post_init).build())
    for name, fn in [("start", cmd_start), ("help", cmd_start), ("summary", cmd_summary),
                     ("group", cmd_group), ("login", cmd_login), ("status", cmd_status),
                     ("schedule", cmd_schedule)]:
        app.add_handler(CommandHandler(name, fn, filters=ME))
    app.add_error_handler(on_error)
    app.run_polling(allowed_updates=Update.ALL_TYPES, drop_pending_updates=True)


if __name__ == "__main__":
    main()
