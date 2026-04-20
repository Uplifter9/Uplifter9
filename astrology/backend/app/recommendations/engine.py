"""Compose actionable life recommendations from a chart + forecast."""

from __future__ import annotations

from typing import Any

from ..astro.chart import NatalChart
from ..i18n import get_translator


_AREA_ADVICE: dict[str, dict[str, str]] = {
    "self": {
        "he": "השקיעו בגבולות בריאים ובזהות אותנטית. התחילו את היום בפעולה שמחזקת אתכם פיזית.",
        "en": "Invest in healthy boundaries and authentic identity. Start the day with a body-first practice that strengthens you.",
        "ar": "استثمر في حدود صحية وهوية أصيلة. ابدأ يومك بممارسة جسدية تقوّيك.",
    },
    "money": {
        "he": "הגדירו תקציב חודשי כתוב, ובדקו אותו שבוע-שבוע. השקעה קטנה וקבועה עדיפה על מהלך חד-פעמי גדול.",
        "en": "Define a written monthly budget and revisit it weekly. Small, consistent investing beats one large bet.",
        "ar": "ضع ميزانية شهرية مكتوبة وراجعها أسبوعياً. الاستثمار المنتظم الصغير أفضل من رهان كبير واحد.",
    },
    "mind": {
        "he": "הקדישו 20 דקות ביום ללמידה ממוקדת. קריאה → סיכום → יישום קטן ביום שאחרי.",
        "en": "Give 20 focused minutes daily to deliberate learning. Read → summarise → apply a small piece tomorrow.",
        "ar": "خصص 20 دقيقة يومياً للتعلم المركز. اقرأ ثم لخص ثم طبّق جزءاً صغيراً في اليوم التالي.",
    },
    "home": {
        "he": "צרו שגרת ערב משקיטה בבית: תאורה רכה, ריחות מוכרים וניתוק ממסכים. המשפחה מתחברת מחדש סביב שולחן.",
        "en": "Build a calming evening ritual at home: soft lighting, familiar scents, screen-off time. Family re-connects at the table.",
        "ar": "ابنِ طقساً مسائياً هادئاً في البيت: إضاءة خافتة وروائح مألوفة وابتعاد عن الشاشات. العائلة تتقارب حول الطاولة.",
    },
    "creativity": {
        "he": "הקצו שעה שבועית ליצירה חופשית ללא מטרה תוצאתית. החלק המשחקי שלכם הוא כוח-חיים ממשי.",
        "en": "Carve out a weekly hour for play-based creation with no outcome attached. Your playful side is real life-force.",
        "ar": "خصص ساعة أسبوعية للإبداع الحر دون هدف. جانبك المرح قوة حياة حقيقية.",
    },
    "health": {
        "he": "שלושה עוגנים יומיים: 7.5 שעות שינה, 8 דקות תנועה בבוקר, וארוחה אחת מזינה מבושלת בבית.",
        "en": "Three daily anchors: 7.5h sleep, 8 minutes of morning movement, one nourishing home-cooked meal.",
        "ar": "ثلاثة مرتكزات يومية: 7.5 ساعة نوم، 8 دقائق حركة صباحية، ووجبة واحدة مغذية محضرة في البيت.",
    },
    "relationships": {
        "he": "שיחה שבועית של 30 דקות ללא מסכים עם השותף/ה או חבר/ה קרוב/ה. שאלה פתוחה אחת פותחת עולם שלם.",
        "en": "A weekly screen-free 30-minute conversation with your partner or close friend. One open question opens a whole world.",
        "ar": "محادثة أسبوعية مدتها 30 دقيقة بدون شاشات مع شريكك أو صديق مقرب. سؤال مفتوح واحد يفتح عالماً كاملاً.",
    },
    "transformation": {
        "he": "מה שאתם נמנעים ממנו יומיים ברציפות — הוא כנראה המפתח. ערכו רשימה וטפלו בפריט אחד השבוע.",
        "en": "What you keep avoiding for two days in a row is probably the key. List it, and handle one item this week.",
        "ar": "ما تتجنبه ليومين متتاليين هو على الأرجح المفتاح. سجّله، وتعامل مع بند واحد هذا الأسبوع.",
    },
    "career": {
        "he": "בחרו פרויקט דגל אחד לרבעון הקרוב וקבעו תאריך סיום. בלעדיו העבודה הופכת לשגרה בלבד.",
        "en": "Pick one flagship project for the coming quarter and set its end date. Without it, work becomes routine.",
        "ar": "اختر مشروعاً رئيسياً واحداً للربع القادم وحدد تاريخ إنجازه. بدونه يصبح العمل روتيناً.",
    },
    "community": {
        "he": "הגדירו קהילה או שלוש אנשים שאתם רוצים לתמוך בהם השנה, ותמכו פעם בשבוע.",
        "en": "Define a community or three people you want to support this year, and show up weekly.",
        "ar": "حدد مجتمعاً أو ثلاثة أشخاص تريد دعمهم هذا العام، وكن حاضراً أسبوعياً.",
    },
    "spirit": {
        "he": "תרגול יומי קצר של שקט: 5 דקות בבוקר ו-5 דקות לפני שינה. העמוק ביותר צומח מהקבוע ביותר.",
        "en": "A short daily silence practice: 5 minutes morning and 5 before sleep. The deepest grows from the most consistent.",
        "ar": "ممارسة صمت يومية قصيرة: 5 دقائق صباحاً و5 قبل النوم. العميق ينمو من الأكثر انتظاماً.",
    },
}


def build_recommendations(chart: NatalChart, lang: str = "he") -> dict[str, Any]:
    t = get_translator(lang)

    # Rank life-area priorities by (a) planets in house, (b) aspects to those planets
    area_score: dict[str, float] = {}
    from ..interpretation.data import LIFE_AREAS, LIFE_AREA_LABEL
    for area_key, meta in LIFE_AREAS.items():
        score = 0.0
        for key, body in chart.bodies.items():
            if body.house in meta["houses"]:
                score += 2.0
                # Planets with tight aspects add more weight
                for asp in chart.aspects:
                    if asp.body_a == key or asp.body_b == key:
                        score += asp.strength * 0.5
        area_score[area_key] = score

    # Element imbalance: suggest complementary practice
    elements = chart.dominances.get("elements", {})
    balance_tip = _balance_tip(elements, lang)

    sorted_areas = sorted(area_score.items(), key=lambda kv: -kv[1])

    priorities = []
    for area_key, score in sorted_areas[:5]:
        label = LIFE_AREA_LABEL[area_key].get(lang, LIFE_AREA_LABEL[area_key]["en"])
        advice = _AREA_ADVICE[area_key].get(lang, _AREA_ADVICE[area_key]["en"])
        priorities.append({
            "area": area_key,
            "label": label,
            "score": round(score, 2),
            "advice": advice,
        })

    # Element / quality-based rituals
    rituals = _rituals(chart, lang)

    # Timing rhythms
    timing = _timing_notes(chart, lang)

    return {
        "priorities": priorities,
        "balance_tip": balance_tip,
        "rituals": rituals,
        "timing": timing,
    }


def _balance_tip(elements: dict[str, float], lang: str) -> str:
    if not elements:
        return ""
    items = sorted(elements.items(), key=lambda kv: -kv[1])
    total = sum(v for _, v in items)
    if total == 0:
        return ""
    lowest, lowest_val = items[-1]
    if lowest_val / total < 0.12:
        tips = {
            "fire":  {"he": "מעט יסוד אש – הוסיפו פעילות גופנית אינטנסיבית, שמש ותנועה ספונטנית.",
                       "en": "Low fire — add high-intensity exercise, sunshine and spontaneous movement.",
                       "ar": "عنصر النار ضعيف — أضف تمارين مكثفة وشمساً وحركة عفوية."},
            "earth": {"he": "מעט יסוד אדמה – הוסיפו מגע עם טבע, גינון, בישול בבית וטיפול בגוף.",
                       "en": "Low earth — add nature contact, gardening, home cooking and body care.",
                       "ar": "عنصر التراب ضعيف — أضف التواصل مع الطبيعة والحدائق والطبخ المنزلي."},
            "air":   {"he": "מעט יסוד אוויר – הוסיפו לימוד מובנה, כתיבה חופשית ושיחה מעמיקה.",
                       "en": "Low air — add structured study, free writing, and deeper conversation.",
                       "ar": "عنصر الهواء ضعيف — أضف دراسة منظمة وكتابة حرة ومحادثات عميقة."},
            "water": {"he": "מעט יסוד מים – תרגלו מיינדפולנס, מקלחות ארוכות, יומן רגשות וקשרים אינטימיים.",
                       "en": "Low water — practise mindfulness, long showers, emotional journaling, intimacy.",
                       "ar": "عنصر الماء ضعيف — مارس اليقظة الذهنية والحمامات الطويلة ومذكرات المشاعر."},
        }
        return tips.get(lowest, {}).get(lang, "")
    return ""


def _rituals(chart, lang: str) -> list[str]:
    items = []
    dom = chart.dominances.get("qualities", {})
    top_quality = next(iter(dom), None)
    if top_quality == "cardinal":
        items.append({
            "he": "פתיחת שבוע: ראשון בבוקר בחרו שלוש פעולות יוזמה חדשות.",
            "en": "Week opener: every Sunday morning pick three new initiative actions.",
            "ar": "افتتاح الأسبوع: كل صباح أحد اختر ثلاث أعمال مبادرة جديدة.",
        }.get(lang, ""))
    elif top_quality == "fixed":
        items.append({
            "he": "רבעון עומק: בחרו נושא אחד והחזיקו בו 90 יום ברציפות.",
            "en": "Depth quarter: pick one theme and stick to it for 90 consecutive days.",
            "ar": "ربع العمق: اختر موضوعاً واحداً والتزم به 90 يوماً متتالياً.",
        }.get(lang, ""))
    elif top_quality == "mutable":
        items.append({
            "he": "גמישות מודעת: בדקו מדי שבוע במה כדאי להחליף כיוון ולמה.",
            "en": "Conscious flexibility: review weekly what direction to shift and why.",
            "ar": "مرونة واعية: راجع أسبوعياً الاتجاه الذي يجدر تغييره ولماذا.",
        }.get(lang, ""))
    return [i for i in items if i]


def _timing_notes(chart, lang: str) -> dict[str, str]:
    # Suggest timing based on Moon sign element
    moon = chart.bodies.get("moon")
    if not moon:
        return {}
    elem = moon.element
    tips = {
        "fire":  {"he": "התנעה של פרויקטים טובה יותר בבוקר מוקדם או בירח צומח.",
                  "en": "Start projects early in the morning or during a waxing Moon.",
                  "ar": "ابدأ المشاريع في الصباح الباكر أو أثناء القمر المتزايد."},
        "earth": {"he": "יישום ותפעול מתאימים יותר לתחילת השבוע ובשעות אחר הצהריים.",
                  "en": "Execution fits early-week afternoons best.",
                  "ar": "التنفيذ يناسب بداية الأسبوع في فترات بعد الظهر."},
        "air":   {"he": "שיחות ומשאים-ומתנים זורמים יותר בימי שלישי וחמישי.",
                  "en": "Conversations and negotiations flow better on Tuesdays and Thursdays.",
                  "ar": "المحادثات والمفاوضات تسير بسلاسة أيام الثلاثاء والخميس."},
        "water": {"he": "עבודה רגשית ואינטואיטיבית קלה יותר בערב ובירח דועך.",
                  "en": "Emotional / intuitive work is easier in the evening and under a waning Moon.",
                  "ar": "العمل العاطفي والحدسي أسهل في المساء وفي قمر متناقص."},
    }
    return {"moon_timing": tips.get(elem, {}).get(lang, "")}
