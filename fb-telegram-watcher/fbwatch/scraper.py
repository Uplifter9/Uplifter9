"""Read-only Facebook group scraper.

SAFETY: this module never likes, comments, shares, messages or joins.
The ONLY click it performs is expanding a post's own "See more" / "ראה עוד" text,
matched by exact text inside the post body. Everything else is reading + scrolling.
"""
import asyncio
import hashlib
import random
import re
import time

from . import config
from .browser import has_session_cookie


class NeedsLogin(Exception):
    """Facebook asked for login / verification. Caller must stop and alert the user."""


class ScrapeError(Exception):
    pass


GROUP_RE = re.compile(r"facebook\.com/groups/([^/?#]+)")


def normalize_group_url(url: str) -> str:
    url = url.strip()
    m = GROUP_RE.search(url)
    if not m:
        raise ValueError("bad group url")
    return f"https://www.facebook.com/groups/{m.group(1)}/"


# ---------------------------------------------------------------- extraction (runs in page)

EXTRACT_JS = r"""
() => {
  const feed = document.querySelector('[role="feed"]');
  let items = feed ? Array.from(feed.children) : [];
  if (!items.length) {
    items = Array.from(document.querySelectorAll('[role="article"]'))
      .filter(a => !a.parentElement.closest('[role="article"]'));
  }
  const postLinkRe = /\/groups\/[^\/?#]+\/(posts|permalink)\/\d+|story_fbid=|multi_permalinks=/;
  const out = [];
  for (const it of items) {
    // ignore nested comment articles when picking text
    const commentArticles = Array.from(it.querySelectorAll('[role="article"] [role="article"], [aria-label*="תגובה"][role="article"], [aria-label*="Comment"][role="article"]'));
    const inComment = (el) => commentArticles.some(c => c.contains(el));

    const links = Array.from(it.querySelectorAll('a[href]')).filter(a => postLinkRe.test(a.href) && !inComment(a));
    const link = links.length ? links[0] : null;
    let timeText = '';
    for (const a of links) {
      const t = (a.getAttribute('aria-label') || a.innerText || '').trim();
      if (t && t.length < 60) { timeText = t; break; }
    }

    let author = '';
    const authorEl = it.querySelector('[data-ad-rendering-role="profile_name"] a, h2 a, h3 a, h4 a, strong a, h2, h3, h4');
    if (authorEl) author = authorEl.innerText.trim().split('\n')[0];

    let text = '';
    const msg = it.querySelector('[data-ad-preview="message"], [data-ad-comet-preview="message"], [data-ad-rendering-role="story_message"]');
    if (msg) text = msg.innerText.trim();
    if (!text) {
      let best = '';
      for (const d of it.querySelectorAll('div[dir="auto"]')) {
        if (inComment(d)) continue;
        const t = d.innerText.trim();
        if (t.length > best.length) best = t;
      }
      text = best;
    }

    let comments = null;
    const fullText = it.innerText || '';
    const m = fullText.match(/([\d.,]+\s*[KkMא]?)\s*(comments?|תגובות)/) ||
              fullText.match(/(תגובה אחת)/);
    if (m) comments = m[1];

    if (!link && !text) continue;
    out.push({ href: link ? link.href : '', timeText, author, text: text.slice(0, 6000), comments });
  }
  return out;
}
"""

EXPAND_JS = r"""
() => {
  const labels = new Set(['See more', 'ראה עוד', 'הצג עוד', 'עוד']);
  let n = 0;
  const bodies = document.querySelectorAll('[data-ad-preview="message"], [data-ad-comet-preview="message"], [data-ad-rendering-role="story_message"]');
  for (const b of bodies) {
    for (const el of b.querySelectorAll('[role="button"]')) {
      if (labels.has((el.innerText || '').trim()) && n < 10) { el.click(); n++; }
    }
  }
  return n;
}
"""

# ---------------------------------------------------------------- parsing helpers

POST_ID_RES = [
    re.compile(r"/groups/([^/?#]+)/(?:posts|permalink)/(\d+)"),
    re.compile(r"[?&]story_fbid=(\d+)"),
    re.compile(r"[?&]multi_permalinks=(\d+)"),
]


def _post_link(href: str, group_url: str):
    if not href:
        return None, None
    m = POST_ID_RES[0].search(href)
    if m:
        return m.group(2), f"https://www.facebook.com/groups/{m.group(1)}/posts/{m.group(2)}/"
    for r in POST_ID_RES[1:]:
        m = r.search(href)
        if m:
            return m.group(1), f"{group_url}posts/{m.group(1)}/"
    return None, None


def parse_count(s):
    if not s:
        return None
    s = s.strip()
    if s == "תגובה אחת":
        return 1
    mult = 1
    if s[-1:] in ("K", "k", "א"):
        mult, s = 1000, s[:-1]
    elif s[-1:] == "M":
        mult, s = 1_000_000, s[:-1]
    try:
        return int(float(s.replace(",", "").strip()) * mult)
    except ValueError:
        return None


_UNITS = [
    (r"(\d+)\s*(?:דק(?:ות|'|ה)?|m(?:in)?s?\b|minutes?)", 60),
    (r"(\d+)\s*(?:שע(?:ות|ה|')?|h(?:rs?)?\b|hours?)", 3600),
    (r"(\d+)\s*(?:ימים|יום|d\b|days?)", 86400),
    (r"(\d+)\s*(?:שבוע(?:ות)?|w\b|weeks?)", 7 * 86400),
]


def parse_relative_time(t: str, now: float):
    """Best effort: '3 שעות', '5h', 'אתמול', 'Yesterday', 'שעתיים'. None if unknown."""
    if not t:
        return None
    t = t.strip()
    if re.search(r"עכשיו|Just now", t):
        return now
    if re.search(r"אתמול|Yesterday", t):
        return now - 86400
    if "שעתיים" in t:
        return now - 7200
    if "יומיים" in t:
        return now - 2 * 86400
    if re.fullmatch(r"(?:לפני\s*)?(?:דקה|שעה)(?:\s*אחת)?", t):
        return now - (60 if "דקה" in t else 3600)
    for pat, sec in _UNITS:
        m = re.search(pat, t, re.IGNORECASE)
        if m:
            return now - int(m.group(1)) * sec
    return _parse_absolute_date(t, now)


_MONTHS = {
    "ינואר": 1, "פברואר": 2, "מרץ": 3, "מרס": 3, "אפריל": 4, "מאי": 5, "יוני": 6, "יולי": 7,
    "אוגוסט": 8, "ספטמבר": 9, "אוקטובר": 10, "נובמבר": 11, "דצמבר": 12,
    "january": 1, "february": 2, "march": 3, "april": 4, "may": 5, "june": 6, "july": 7,
    "august": 8, "september": 9, "october": 10, "november": 11, "december": 12,
}


def _parse_absolute_date(t: str, now: float):
    """'12 בנובמבר', 'November 12', '12 בנובמבר 2025' -> noon of that day (local time)."""
    import datetime as dt
    from zoneinfo import ZoneInfo

    low = t.lower()
    month = next((n for name, n in _MONTHS.items() if name in low), None)
    if not month:
        return None
    nums = [int(x) for x in re.findall(r"\d+", low)]
    day = next((n for n in nums if 1 <= n <= 31), None)
    if not day:
        return None
    tz = ZoneInfo(config.TZ)
    today = dt.datetime.fromtimestamp(now, tz)
    year = next((n for n in nums if n > 1900), today.year)
    try:
        d = dt.datetime(year, month, day, 12, 0, tzinfo=tz)
    except ValueError:
        return None
    if d > today + dt.timedelta(days=1):  # no year given and date is "in the future"
        d = d.replace(year=year - 1)
    return d.timestamp()


# ---------------------------------------------------------------- human-like pacing

async def human_pause(lo=1.5, hi=5.0):
    await asyncio.sleep(random.uniform(lo, hi))


async def human_scroll(page):
    steps = random.randint(2, 5)
    for _ in range(steps):
        await page.mouse.wheel(0, random.randint(250, 750))
        await asyncio.sleep(random.uniform(0.25, 0.9))
    if random.random() < 0.15:  # occasionally "read" for a while
        await asyncio.sleep(random.uniform(8, 20))
    elif random.random() < 0.1:  # occasionally scroll back up a bit
        await page.mouse.wheel(0, -random.randint(150, 400))
    await human_pause(2.0, 6.0)


# ---------------------------------------------------------------- main entry

async def _assert_logged_in(ctx, page):
    url = page.url
    if any(k in url for k in ("/login", "/checkpoint", "two_step_verification", "/recover")):
        raise NeedsLogin(url)
    if await page.locator('input[name="email"], input[name="pass"]').count() > 0:
        raise NeedsLogin(url)
    if not await has_session_cookie(ctx):
        raise NeedsLogin("no session cookie")


async def scrape_group(ctx, group_url: str, since_ts: float, max_posts: int | None = None):
    """Returns list of dicts: post_id, url, author, text, posted_at, comments."""
    max_posts = max_posts or config.MAX_POSTS_PER_RUN
    page = ctx.pages[0] if ctx.pages else await ctx.new_page()
    page.set_default_timeout(45_000)

    await page.goto(group_url + "?sorting_setting=CHRONOLOGICAL", wait_until="domcontentloaded")
    await human_pause(4, 8)
    await _assert_logged_in(ctx, page)

    body = (await page.locator("body").inner_text())[:3000]
    if re.search(r"This content isn't available|התוכן הזה אינו זמין|הדף הזה לא זמין", body):
        raise ScrapeError("הקבוצה לא זמינה (קישור שגוי או קבוצה סגורה).")

    try:
        await page.wait_for_selector('[role="feed"], [role="article"]', timeout=30_000)
    except Exception:
        await _assert_logged_in(ctx, page)
        raise ScrapeError("לא נמצא פיד פוסטים בעמוד. ייתכן שפייסבוק שינתה מבנה.")

    found: dict[str, dict] = {}
    stale_rounds = 0
    old_rounds = 0
    max_scrolls = max(15, max_posts // 2 + 10)

    for _ in range(max_scrolls):
        try:
            if await page.evaluate(EXPAND_JS):
                await human_pause(0.8, 2.0)
        except Exception:
            pass

        now = time.time()
        raw = await page.evaluate(EXTRACT_JS)
        new_dates = []
        before = len(found)
        for r in raw:
            pid, url = _post_link(r["href"], group_url)
            if not pid:
                if not r["text"]:
                    continue
                pid = "h" + hashlib.sha1((r["author"] + r["text"][:300]).encode()).hexdigest()[:16]
            posted = parse_relative_time(r["timeText"], now)
            if pid in found:
                if len(r["text"]) > len(found[pid]["text"] or ""):
                    found[pid]["text"] = r["text"]
                continue
            found[pid] = {
                "post_id": pid, "url": url, "author": r["author"] or None,
                "text": r["text"], "posted_at": posted, "comments": parse_count(r["comments"]),
            }
            if posted is not None:
                new_dates.append(posted)

        if len(found) >= max_posts:
            break
        if new_dates and all(d < since_ts for d in new_dates):
            old_rounds += 1
            if old_rounds >= 2:
                break
        else:
            old_rounds = 0
        stale_rounds = stale_rounds + 1 if len(found) == before else 0
        if stale_rounds >= 4:
            break

        await human_scroll(page)
        if "/checkpoint" in page.url or "/login" in page.url:
            raise NeedsLogin(page.url)

    posts = [p for p in found.values() if p["posted_at"] is None or p["posted_at"] >= since_ts]
    return posts[:max_posts]
