"""Generate human-readable predictions from transits, progressions & returns."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from ..astro.chart import NatalChart
from ..astro.returns import upcoming_returns
from ..astro.transits import compute_transits, hits_to_dict
from ..i18n import get_translator


# Planets whose transit hits we surface as "major"
_MAJOR_TRANSITING = {"jupiter", "saturn", "uranus", "neptune", "pluto", "chiron", "true_node"}


def build_forecast(
    chart: NatalChart,
    start: datetime,
    months: int = 12,
    lang: str = "he",
) -> dict[str, Any]:
    t = get_translator(lang)
    end = start + timedelta(days=30 * months)
    hits = compute_transits(chart, start, end, step_days=1.0)

    # Split into major vs quick
    major = [h for h in hits if h.transiting in _MAJOR_TRANSITING]
    quick = [h for h in hits if h.transiting not in _MAJOR_TRANSITING]

    major_narratives = [_narrative_for_hit(h, t, lang) for h in major]
    quick_narratives = [_narrative_for_hit(h, t, lang) for h in quick[:40]]

    # Monthly highlights
    monthly = _monthly_digest(hits, start, months, t, lang)

    # Returns
    returns_dict = upcoming_returns(chart, start)

    summary = _summary_text(chart, major, start, end, t, lang)

    return {
        "window": {"from": start.date().isoformat(), "to": end.date().isoformat(), "months": months},
        "summary": summary,
        "major_transits": major_narratives,
        "quick_transits": quick_narratives,
        "monthly": monthly,
        "returns": returns_dict,
        "raw_hits": hits_to_dict(hits),
    }


def _aspect_word(lang: str, aspect: str, nature_hint: str) -> str:
    nuance = {
        "hard": {"he": "אתגר שמוליך לצמיחה", "en": "growth-driving challenge", "ar": "تحدٍ يدفع النمو"},
        "soft": {"he": "הזדמנות זורמת", "en": "flowing opportunity", "ar": "فرصة سلسة"},
        "neutral": {"he": "מיזוג אנרגיות", "en": "merging of energies", "ar": "دمج للطاقات"},
    }
    return nuance.get(nature_hint, {}).get(lang, nature_hint)


def _narrative_for_hit(hit, t, lang: str) -> dict[str, Any]:
    from ..astro.constants import ASPECT_NATURE
    tp_name = t.t(f"planets.{hit.transiting}")
    natal_name = t.t(f"planets.{hit.natal}") if t.exists(f"planets.{hit.natal}") else hit.natal
    aspect_name = t.t(f"aspects.{hit.aspect}")
    nature = ASPECT_NATURE.get(hit.aspect, "neutral")
    vibe = _aspect_word(lang, hit.aspect, nature)
    if lang == "he":
        text = (
            f"ב-{hit.date}: {tp_name} יוצר {aspect_name} עם ה{natal_name} הלידתי. "
            f"תקופה של {vibe}."
        )
    elif lang == "ar":
        text = (
            f"في {hit.date}: {tp_name} يشكّل {aspect_name} مع {natal_name} في خريطة الميلاد. "
            f"فترة {vibe}."
        )
    else:
        text = (
            f"On {hit.date}: transiting {tp_name} forms a {aspect_name} to your natal {natal_name}. "
            f"A {vibe} period."
        )
    return {
        "date": hit.date,
        "transiting": hit.transiting,
        "natal": hit.natal,
        "aspect": hit.aspect,
        "nature": nature,
        "orb": hit.orb,
        "text": text,
    }


def _monthly_digest(hits, start: datetime, months: int, t, lang: str) -> list[dict[str, Any]]:
    buckets: dict[str, list] = {}
    for h in hits:
        ym = h.date[:7]
        buckets.setdefault(ym, []).append(h)
    out = []
    for i in range(months):
        month_dt = start + timedelta(days=30 * i)
        ym = month_dt.strftime("%Y-%m")
        month_hits = buckets.get(ym, [])
        major_hits = [h for h in month_hits if h.transiting in _MAJOR_TRANSITING]
        label = month_dt.strftime("%B %Y") if lang == "en" else ym
        if lang == "he":
            if major_hits:
                parts = []
                for h in major_hits[:3]:
                    parts.append(f"{t.t(f'planets.{h.transiting}')} {t.t(f'aspects.{h.aspect}')} {t.t(f'planets.{h.natal}') if t.exists(f'planets.{h.natal}') else h.natal}")
                summary = " · ".join(parts)
            else:
                summary = "חודש רגוע יחסית, זמן מצוין לתכנון ולבניית הרגלים."
        elif lang == "ar":
            if major_hits:
                parts = [f"{t.t(f'planets.{h.transiting}')} {t.t(f'aspects.{h.aspect}')} {t.t(f'planets.{h.natal}') if t.exists(f'planets.{h.natal}') else h.natal}" for h in major_hits[:3]]
                summary = " · ".join(parts)
            else:
                summary = "شهر هادئ نسبياً — مناسب للتخطيط وبناء العادات."
        else:
            if major_hits:
                parts = [f"{t.t(f'planets.{h.transiting}')} {t.t(f'aspects.{h.aspect}')} {t.t(f'planets.{h.natal}') if t.exists(f'planets.{h.natal}') else h.natal}" for h in major_hits[:3]]
                summary = " · ".join(parts)
            else:
                summary = "Relatively quiet month — ideal for planning and habit-building."
        out.append({
            "month": ym,
            "label": label,
            "hit_count": len(month_hits),
            "major_count": len(major_hits),
            "summary": summary,
        })
    return out


def _summary_text(chart, major_hits, start, end, t, lang) -> str:
    if lang == "he":
        if not major_hits:
            return "התקופה הקרובה נראית יציבה יחסית ומזמינה אותך לפעול מתוך יציבות."
        return f"לפניך תקופה עתירת תנועה עם {len(major_hits)} טרנזיטים משמעותיים. הקשב לתאריכי השיא ותכנן מראש."
    if lang == "ar":
        if not major_hits:
            return "الفترة المقبلة تبدو مستقرة نسبياً وتدعوك للعمل من مكان من الاستقرار."
        return f"أمامك فترة غنية بالحركة مع {len(major_hits)} عبور فلكي مهم. اهتم بتواريخ الذروة وخطط مسبقاً."
    if not major_hits:
        return "The coming period looks relatively steady — a good time to act from a place of stability."
    return f"A dynamic window ahead with {len(major_hits)} significant transits. Mind the peaks and plan around them."
