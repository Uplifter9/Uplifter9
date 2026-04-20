"""Compact archetypal seed data used to compose interpretations.

Instead of hardcoding thousands of locked paragraphs per language, we define
short archetypal descriptors per building block (planet, sign, house, aspect)
in every language. The interpretation engine composes these into sentences.
"""

from __future__ import annotations


# -----------------------------------------------------------
# Planet archetypes: "what this planet represents"
# -----------------------------------------------------------
PLANET_ARCHETYPE: dict[str, dict[str, str]] = {
    "sun":     {"he": "המהות, הזהות, הרצון החיוני", "en": "core identity and vital will", "ar": "الجوهر والإرادة الحيوية"},
    "moon":    {"he": "הרגש, הצרכים, הזיכרון הרגשי", "en": "emotions, needs, emotional memory", "ar": "المشاعر والاحتياجات والذاكرة العاطفية"},
    "mercury": {"he": "החשיבה, התקשורת והלמידה", "en": "thinking, communication and learning", "ar": "التفكير والتواصل والتعلم"},
    "venus":   {"he": "האהבה, הערכים והיופי", "en": "love, values and beauty", "ar": "الحب والقيم والجمال"},
    "mars":    {"he": "הפעולה, התשוקה והגבולות", "en": "action, desire and assertion", "ar": "الفعل والرغبة والحدود"},
    "jupiter": {"he": "הצמיחה, האמונה וההתרחבות", "en": "growth, faith and expansion", "ar": "النمو والإيمان والتوسع"},
    "saturn":  {"he": "המשמעת, האחריות והמבנה", "en": "discipline, structure, responsibility", "ar": "الانضباط والمسؤولية والبنية"},
    "uranus":  {"he": "החופש, החדשנות והפריצה", "en": "freedom, innovation, awakening", "ar": "الحرية والابتكار واليقظة"},
    "neptune": {"he": "הדמיון, הרוחניות והאמפתיה", "en": "imagination, spirituality, empathy", "ar": "الخيال والروحانية والتعاطف"},
    "pluto":   {"he": "הטרנספורמציה, העוצמה והעומק", "en": "transformation, power, depth", "ar": "التحول والقوة والعمق"},
    "chiron":  {"he": "הפצע המרפא והחוכמה שנולדת ממנו", "en": "the wounded healer's wisdom", "ar": "الجرح الشافي والحكمة المنبثقة منه"},
    "true_node": {"he": "ייעוד הצמיחה בגלגול הזה", "en": "soul growth direction", "ar": "اتجاه النمو الروحي"},
    "south_node": {"he": "מה שכבר נלמד ומה שיש לשחרר", "en": "past patterns to release", "ar": "أنماط الماضي للتخلي عنها"},
    "lilith":  {"he": "הקול הפראי, האסור והאותנטי", "en": "wild, untamed authenticity", "ar": "الصوت البرّي الأصيل"},
}


# -----------------------------------------------------------
# Sign flavours: how the sign colors a planet
# -----------------------------------------------------------
SIGN_FLAVOUR: dict[str, dict[str, str]] = {
    "aries":       {"he": "ישירות, יוזמה ואומץ",                       "en": "direct, pioneering, courageous",              "ar": "مباشر ومبادر وشجاع"},
    "taurus":      {"he": "יציבות, חושניות והתמדה",                    "en": "grounded, sensual, persistent",               "ar": "ثابت وحسي ومثابر"},
    "gemini":      {"he": "סקרנות, גיוון ותקשורת",                     "en": "curious, versatile, communicative",           "ar": "فضولي ومتعدد ومتواصل"},
    "cancer":      {"he": "רגש, שייכות והגנתיות",                      "en": "feeling, nurturing, protective",              "ar": "عاطفي ومحتضن وحامٍ"},
    "leo":         {"he": "יצירתיות, ביטוי עצמי ונוכחות",               "en": "creative, expressive, radiant",               "ar": "إبداعي ومعبّر ومشع"},
    "virgo":       {"he": "דיוק, שירות וניתוח",                        "en": "precise, analytical, of service",             "ar": "دقيق وتحليلي وخدوم"},
    "libra":       {"he": "הרמוניה, צדק וקשר",                         "en": "harmonious, fair, relational",                "ar": "متناغم وعادل وعلائقي"},
    "scorpio":     {"he": "עוצמה, אינטימיות וטרנספורמציה",              "en": "intense, intimate, transformative",           "ar": "قوي وحميم ومُحوِّل"},
    "sagittarius": {"he": "חופש, חיפוש משמעות והרפתקה",                "en": "free-spirited, philosophical, adventurous",   "ar": "حر وفلسفي ومغامر"},
    "capricorn":   {"he": "שאפתנות, אחריות ובגרות",                    "en": "ambitious, responsible, mature",              "ar": "طموح ومسؤول وناضج"},
    "aquarius":    {"he": "מקוריות, חזון וחברה",                       "en": "original, visionary, communal",               "ar": "أصيل ورؤيوي واجتماعي"},
    "pisces":      {"he": "אמפתיה, דמיון ורוחניות",                    "en": "empathic, imaginative, spiritual",            "ar": "متعاطف وخيالي وروحاني"},
}


# -----------------------------------------------------------
# House themes: what each house governs
# -----------------------------------------------------------
HOUSE_THEME: dict[int, dict[str, str]] = {
    1:  {"he": "הזהות והאישיות שמוקרנות החוצה", "en": "identity projected outward", "ar": "الهوية التي تُعرض للخارج"},
    2:  {"he": "כסף, ערכים והבעלות",            "en": "money, values and ownership", "ar": "المال والقيم والملكية"},
    3:  {"he": "תקשורת, לימודים ואחים",         "en": "communication, learning, siblings", "ar": "التواصل والتعلم والإخوة"},
    4:  {"he": "בית, שורשים ומשפחה",            "en": "home, roots and family", "ar": "المنزل والجذور والعائلة"},
    5:  {"he": "יצירה, רומנטיקה וילדים",        "en": "creativity, romance and children", "ar": "الإبداع والرومانسية والأطفال"},
    6:  {"he": "עבודה, שגרה ובריאות",           "en": "work, routine and health", "ar": "العمل والروتين والصحة"},
    7:  {"he": "זוגיות ושותפויות",              "en": "partnership and one-to-one bonds", "ar": "الشراكات والعلاقات"},
    8:  {"he": "אינטימיות, טרנספורמציה וכספים משותפים", "en": "intimacy, transformation, shared resources", "ar": "الحميمية والتحول والموارد المشتركة"},
    9:  {"he": "חיפוש משמעות, מסעות והשכלה",    "en": "meaning, travel and higher learning", "ar": "المعنى والسفر والتعلم العالي"},
    10: {"he": "קריירה, סטטוס ותפקיד ציבורי",   "en": "career, status, public role", "ar": "المهنة والمكانة والدور العام"},
    11: {"he": "חברויות, קהילה וחזון",          "en": "friends, community and vision", "ar": "الأصدقاء والمجتمع والرؤية"},
    12: {"he": "תת-מודע, רוחניות ופרישות",      "en": "subconscious, spirituality, solitude", "ar": "اللاوعي والروحانية والعزلة"},
}


# -----------------------------------------------------------
# Aspect nuances
# -----------------------------------------------------------
ASPECT_TEMPLATE: dict[str, dict[str, str]] = {
    "conjunction":    {"he": "מאחדים עוצמה – {a} ו-{b} פועלים יחד כקול אחד", "en": "{a} and {b} fuse into a single, intensified voice", "ar": "{a} و{b} يندمجان في صوت واحد مكثف"},
    "opposition":     {"he": "מתח משלים בין {a} ל-{b} – קריאה לאיזון",        "en": "polar tension between {a} and {b} calling for balance", "ar": "توتر قطبي بين {a} و{b} يستدعي التوازن"},
    "square":         {"he": "חיכוך בונה בין {a} ל-{b} – מנוע לצמיחה",         "en": "dynamic friction between {a} and {b} drives growth", "ar": "احتكاك بنّاء بين {a} و{b} يدفع النمو"},
    "trine":          {"he": "זרימה מולדת בין {a} ל-{b} – כישרון טבעי",         "en": "natural flow between {a} and {b}, an innate gift", "ar": "تدفق طبيعي بين {a} و{b} — موهبة فطرية"},
    "sextile":        {"he": "הזדמנות חיובית להצמיד בין {a} ל-{b}",             "en": "supportive opportunity linking {a} and {b}", "ar": "فرصة داعمة تربط {a} و{b}"},
    "quincunx":       {"he": "חוסר התאמה דק בין {a} ל-{b} – מזמין התאמה",       "en": "subtle misalignment between {a} and {b} inviting adjustment", "ar": "عدم توافق دقيق بين {a} و{b} يتطلب التكيف"},
    "semisextile":    {"he": "ניואנס עדין בין {a} ל-{b}",                     "en": "a subtle link between {a} and {b}", "ar": "صلة دقيقة بين {a} و{b}"},
    "semisquare":     {"he": "גירוי זוטר בין {a} ל-{b} שמחייב ערנות",          "en": "minor irritation between {a} and {b} demanding awareness", "ar": "إزعاج بسيط بين {a} و{b} يتطلب الانتباه"},
    "sesquiquadrate": {"he": "חיכוך מתמשך בין {a} ל-{b}",                     "en": "simmering friction between {a} and {b}", "ar": "احتكاك متواصل بين {a} و{b}"},
}


# -----------------------------------------------------------
# Life areas → houses mapping for life-area analysis
# -----------------------------------------------------------
LIFE_AREAS: dict[str, dict[str, object]] = {
    "self":         {"houses": [1],  "key": "self"},
    "money":        {"houses": [2, 8], "key": "money"},
    "mind":         {"houses": [3, 9], "key": "mind"},
    "home":         {"houses": [4],  "key": "home"},
    "creativity":   {"houses": [5],  "key": "creativity"},
    "health":       {"houses": [6],  "key": "health"},
    "relationships":{"houses": [7],  "key": "relationships"},
    "transformation":{"houses": [8], "key": "transformation"},
    "career":       {"houses": [10], "key": "career"},
    "community":    {"houses": [11], "key": "community"},
    "spirit":       {"houses": [12], "key": "spirit"},
}


LIFE_AREA_LABEL: dict[str, dict[str, str]] = {
    "self":         {"he": "אני והזהות", "en": "Self & Identity", "ar": "الذات والهوية"},
    "money":        {"he": "כסף ומשאבים", "en": "Money & Resources", "ar": "المال والموارد"},
    "mind":         {"he": "למידה וחשיבה", "en": "Mind & Learning", "ar": "العقل والتعلم"},
    "home":         {"he": "בית ומשפחה", "en": "Home & Family", "ar": "البيت والعائلة"},
    "creativity":   {"he": "יצירה ורומנטיקה", "en": "Creativity & Romance", "ar": "الإبداع والرومانسية"},
    "health":       {"he": "בריאות ושגרה", "en": "Health & Routine", "ar": "الصحة والروتين"},
    "relationships":{"he": "זוגיות ושותפויות", "en": "Partnerships", "ar": "الشراكات"},
    "transformation":{"he": "טרנספורמציה ואינטימיות", "en": "Transformation & Intimacy", "ar": "التحول والحميمية"},
    "career":       {"he": "קריירה וייעוד ציבורי", "en": "Career & Public Role", "ar": "المهنة والدور العام"},
    "community":    {"he": "קהילה וחזון", "en": "Community & Vision", "ar": "المجتمع والرؤية"},
    "spirit":       {"he": "רוח, מיסטיקה ותת-מודע", "en": "Spirit & Subconscious", "ar": "الروح واللاوعي"},
}
