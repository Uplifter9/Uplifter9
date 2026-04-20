"""Compose rich, structured interpretations from a NatalChart."""

from __future__ import annotations

from typing import Any

from ..i18n import Translator, get_translator
from .data import (
    ASPECT_TEMPLATE,
    HOUSE_THEME,
    LIFE_AREAS,
    LIFE_AREA_LABEL,
    PLANET_ARCHETYPE,
    SIGN_FLAVOUR,
)


def _planet_name(t: Translator, key: str) -> str:
    return t.t(f"planets.{key}")


def _sign_name(t: Translator, sign: str) -> str:
    return t.t(f"signs.{sign}")


def _archetype(lang: str, key: str) -> str:
    return PLANET_ARCHETYPE.get(key, {}).get(lang, PLANET_ARCHETYPE.get(key, {}).get("en", key))


def _sign_flavour(lang: str, sign: str) -> str:
    return SIGN_FLAVOUR.get(sign, {}).get(lang, SIGN_FLAVOUR.get(sign, {}).get("en", sign))


def _house_theme(lang: str, house: int) -> str:
    return HOUSE_THEME.get(house, {}).get(lang, HOUSE_THEME.get(house, {}).get("en", str(house)))


def _aspect_template(lang: str, aspect: str) -> str:
    return ASPECT_TEMPLATE.get(aspect, {}).get(lang, ASPECT_TEMPLATE.get(aspect, {}).get("en", aspect))


# ---------------------------------------------------------------------------
# Core summary
# ---------------------------------------------------------------------------


def interpret_chart(chart, lang: str = "he") -> dict[str, Any]:
    t = get_translator(lang)

    big_three = _big_three(chart, t, lang)
    placements = _placements(chart, t, lang)
    aspects = _aspects(chart, t, lang)
    dominances = _dominances(chart, t, lang)
    patterns = _patterns(chart, t, lang)
    life_areas = _life_areas(chart, t, lang)
    overview = _overview(chart, t, lang, big_three, dominances, patterns)

    return {
        "overview": overview,
        "big_three": big_three,
        "placements": placements,
        "aspects": aspects,
        "dominances": dominances,
        "patterns": patterns,
        "life_areas": life_areas,
    }


# ---------------------------------------------------------------------------
# Big three (Sun / Moon / Ascendant)
# ---------------------------------------------------------------------------


def _big_three(chart, t: Translator, lang: str) -> dict[str, Any]:
    bodies = chart.bodies
    sun = bodies.get("sun")
    moon = bodies.get("moon")
    asc_lon = chart.angles["asc"]
    from ..astro.constants import sign_from_longitude
    asc_sign = sign_from_longitude(asc_lon)

    def _line(body_key: str, sign: str, flavour_prefix_key: str) -> str:
        archetype = _archetype(lang, body_key)
        flavour = _sign_flavour(lang, sign)
        name = _planet_name(t, body_key)
        sname = _sign_name(t, sign)
        if lang == "he":
            return f"{name} ב{sname}: {archetype} שבא לידי ביטוי ב{flavour}."
        if lang == "ar":
            return f"{name} في {sname}: {archetype} يتجلى من خلال طابع {flavour}."
        return f"{name} in {sname}: {archetype}, expressed as {flavour}."

    return {
        "sun":  {"sign": sun.sign if sun else None,  "text": _line("sun", sun.sign, "sun") if sun else ""},
        "moon": {"sign": moon.sign if moon else None, "text": _line("moon", moon.sign, "moon") if moon else ""},
        "asc":  {"sign": asc_sign, "text": _ascendant_line(asc_sign, t, lang)},
    }


def _ascendant_line(sign: str, t: Translator, lang: str) -> str:
    flavour = _sign_flavour(lang, sign)
    sname = _sign_name(t, sign)
    if lang == "he":
        return f"האופק ב{sname}: העולם פוגש אותך באנרגיית {flavour}."
    if lang == "ar":
        return f"الطالع في {sname}: يقابلك العالم بطابع {flavour}."
    return f"Ascendant in {sname}: the world meets you through {flavour} energy."


# ---------------------------------------------------------------------------
# All placements (planet in sign + house)
# ---------------------------------------------------------------------------


def _placements(chart, t: Translator, lang: str) -> list[dict[str, Any]]:
    out = []
    for key, body in chart.bodies.items():
        if key == "south_node":
            continue
        archetype = _archetype(lang, key)
        flavour = _sign_flavour(lang, body.sign)
        theme = _house_theme(lang, body.house)
        planet_name = _planet_name(t, key)
        sign_name = _sign_name(t, body.sign)
        if lang == "he":
            text = (
                f"{planet_name} ב{sign_name} בבית ה-{body.house}: "
                f"{archetype} שלבוש ב{flavour}, ומתבטא בתחום של {theme}."
            )
            if body.retrograde:
                text += " הוא נסוג במפה, כלומר הביטוי מופנם תחילה לפני שהוא פורץ החוצה."
            dignity_text = t.t(f"dignities.{body.dignity}")
        elif lang == "ar":
            text = (
                f"{planet_name} في {sign_name} في البيت {body.house}: "
                f"{archetype} بطابع {flavour}، يتجلى في مجال {theme}."
            )
            if body.retrograde:
                text += " وهو في حالة تراجع — يتم التعبير عنه داخلياً قبل الظهور."
            dignity_text = t.t(f"dignities.{body.dignity}")
        else:
            text = (
                f"{planet_name} in {sign_name} in the {body.house}th house: "
                f"{archetype}, styled as {flavour}, playing out through {theme}."
            )
            if body.retrograde:
                text += " Retrograde — its expression turns inward before emerging."
            dignity_text = t.t(f"dignities.{body.dignity}")

        out.append({
            "body": key,
            "sign": body.sign,
            "house": body.house,
            "degree": round(body.sign_degree, 2),
            "retrograde": body.retrograde,
            "dignity": body.dignity,
            "dignity_text": dignity_text,
            "text": text,
        })
    return out


# ---------------------------------------------------------------------------
# Aspects (with templated narrative)
# ---------------------------------------------------------------------------


def _aspects(chart, t: Translator, lang: str) -> list[dict[str, Any]]:
    out = []
    for asp in chart.aspects:
        template = _aspect_template(lang, asp.aspect)
        a_name = _planet_name(t, asp.body_a)
        b_name = _planet_name(t, asp.body_b)
        text = template.format(a=a_name, b=b_name)
        out.append({
            "body_a": asp.body_a,
            "body_b": asp.body_b,
            "aspect": asp.aspect,
            "aspect_label": t.t(f"aspects.{asp.aspect}"),
            "orb": round(asp.orb, 2),
            "applying": asp.applying,
            "nature": asp.nature,
            "strength": round(asp.strength, 2),
            "text": text,
        })
    return out


# ---------------------------------------------------------------------------
# Dominances summary text
# ---------------------------------------------------------------------------


def _dominances(chart, t: Translator, lang: str) -> dict[str, Any]:
    dom = chart.dominances
    elements = list(dom["elements"].items())
    qualities = list(dom["qualities"].items())
    polarity = list(dom["polarity"].items())
    summary_lines = []

    if elements:
        top_elem, top_val = elements[0]
        name = t.t(f"elements.{top_elem}")
        if lang == "he":
            summary_lines.append(f"היסוד הדומיננטי: {name}. זה מצייר גישת חיים מאוד {_element_vibe(lang, top_elem)}.")
        elif lang == "ar":
            summary_lines.append(f"العنصر المهيمن: {name}. يرسم نهج حياة {_element_vibe(lang, top_elem)}.")
        else:
            summary_lines.append(f"Dominant element: {name}. This paints a very {_element_vibe(lang, top_elem)} approach to life.")

    if qualities:
        top_q, _ = qualities[0]
        qname = t.t(f"qualities.{top_q}")
        if lang == "he":
            summary_lines.append(f"האיכות הדומיננטית: {qname} — דפוס התנהלות {_quality_vibe(lang, top_q)}.")
        elif lang == "ar":
            summary_lines.append(f"الصفة المهيمنة: {qname} — نمط سلوك {_quality_vibe(lang, top_q)}.")
        else:
            summary_lines.append(f"Dominant quality: {qname} — a {_quality_vibe(lang, top_q)} behavioural pattern.")

    if polarity:
        top_pol, _ = polarity[0]
        pol_name = t.t(f"polarity.{top_pol}")
        if lang == "he":
            summary_lines.append(f"הקוטב החזק יותר: {pol_name}.")
        elif lang == "ar":
            summary_lines.append(f"القطب الأقوى: {pol_name}.")
        else:
            summary_lines.append(f"Stronger polarity: {pol_name}.")

    return {**dom, "summary": summary_lines}


def _element_vibe(lang: str, elem: str) -> str:
    table = {
        "fire":  {"he": "נלהבת, יוזמת וחיה", "en": "passionate, proactive, alive", "ar": "متحمس ومبادر ونابض"},
        "earth": {"he": "מעשית, מוחשית ויציבה", "en": "grounded, tangible, steady", "ar": "عملي وملموس وثابت"},
        "air":   {"he": "מחשבתית, חברתית וגמישה", "en": "intellectual, social, flexible", "ar": "فكري واجتماعي ومرن"},
        "water": {"he": "רגשית, אינטואיטיבית ועמוקה", "en": "emotional, intuitive, deep", "ar": "عاطفي وحدسي وعميق"},
    }
    return table.get(elem, {}).get(lang, elem)


def _quality_vibe(lang: str, q: str) -> str:
    table = {
        "cardinal": {"he": "יוזם ומתניע תהליכים", "en": "initiating and launching", "ar": "مبادر ومحرك"},
        "fixed":    {"he": "מתמיד ומעמיק", "en": "persistent and deepening", "ar": "مثابر وعميق"},
        "mutable":  {"he": "גמיש ומתאים את עצמו", "en": "flexible and adaptive", "ar": "مرن ومتكيف"},
    }
    return table.get(q, {}).get(lang, q)


# ---------------------------------------------------------------------------
# Patterns
# ---------------------------------------------------------------------------


def _patterns(chart, t: Translator, lang: str) -> list[dict[str, Any]]:
    out = []
    for p in chart.patterns:
        label = t.t(f"patterns.{p['type']}")
        bodies = ", ".join(_planet_name(t, b) for b in p.get("bodies", []))
        if lang == "he":
            text = f"{label} הכולל את {bodies}."
        elif lang == "ar":
            text = f"{label} يشمل {bodies}."
        else:
            text = f"{label} involving {bodies}."
        if p.get("apex"):
            text += f" ({_planet_name(t, p['apex'])})"
        out.append({"label": label, "text": text, **p})
    return out


# ---------------------------------------------------------------------------
# Life areas analysis
# ---------------------------------------------------------------------------


def _life_areas(chart, t: Translator, lang: str) -> list[dict[str, Any]]:
    out = []
    body_by_house: dict[int, list] = {}
    for key, body in chart.bodies.items():
        if key == "south_node":
            continue
        body_by_house.setdefault(body.house, []).append(body)

    for area_key, meta in LIFE_AREAS.items():
        houses = meta["houses"]
        tenants: list[str] = []
        for h in houses:
            tenants.extend(b.key for b in body_by_house.get(h, []))
        label = LIFE_AREA_LABEL[area_key].get(lang, LIFE_AREA_LABEL[area_key]["en"])
        text = _life_area_text(lang, label, tenants, t)
        out.append({"key": area_key, "label": label, "tenants": tenants, "text": text})
    return out


def _life_area_text(lang: str, label: str, tenants: list[str], t: Translator) -> str:
    if not tenants:
        if lang == "he":
            return f"ב{label} אין כוכבי לכת במפה — התחום מתנהל דרך השליטים שלו וקשרים עקיפים."
        if lang == "ar":
            return f"في {label} لا يوجد كواكب مباشرة — المجال يُدار عبر حكامه وتواصل غير مباشر."
        return f"In {label} there are no direct planets — this area is governed through rulers and indirect links."

    names = [t.t(f"planets.{k}") for k in tenants]
    joined = ", ".join(names)
    if lang == "he":
        return f"{label} נושא את {joined}. תן לתחום הזה מקום מרכזי בחייך."
    if lang == "ar":
        return f"{label} يحتوي على {joined}. أعطِ هذا المجال أهمية مركزية في حياتك."
    return f"{label} holds {joined}. Let this area take a central place in your life."


# ---------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------


def _overview(chart, t: Translator, lang: str, big_three: dict, dominances: dict, patterns: list) -> str:
    lines = []
    lines.append(big_three["sun"]["text"])
    lines.append(big_three["moon"]["text"])
    lines.append(big_three["asc"]["text"])
    if dominances.get("summary"):
        lines.extend(dominances["summary"])
    if patterns:
        count = len(patterns)
        if lang == "he":
            lines.append(f"זוהו {count} תבניות אסטרולוגיות משמעותיות במפה.")
        elif lang == "ar":
            lines.append(f"تم اكتشاف {count} أنماط فلكية مهمة في الخريطة.")
        else:
            lines.append(f"{count} significant astrological patterns detected.")
    return "\n".join(lines)
