# יוצר נספחים A4 בעברית (Streamlit)
אפליקציה ליצירת חוברות נספחים בעברית מדפי PDF/תמונות, עם כותרות "נספח X׳", שליטה בגופנים, ויצוא ל‑PDF/DOCX/ZIP.

## התקנה והרצה מקומית
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
streamlit run app.py
```

## שימוש
1. העלה קבצי PDF/תמונות.
2. בחר גופן: חפש גופן מערכת, העלה TTF/OTF, או השתמש ב‑David Libre (נטען אוטומטית או מקומי ב‑assets/).
3. קבע גודל גופן, שוליים ומרווחים.
4. בחר מצב PDF (עמוד ראשון/כל העמודים).
5. ערוך כותרות לכל נספח או הותר ברירת מחדל.
6. לחץ "עבד וייצא" והורד PDF מאוחד / DOCX / ZIP או נספחים בודדים.

## פריסה חינמית
### אפשרות 1: Streamlit Community Cloud
1. צור ריפו GitHub חדש, העלה `app.py`, `requirements.txt`, ו‑`README.md` (ואם תרצה `assets/DavidLibre-Regular.ttf`).
2. עבור אל https://share.streamlit.io → **New app** → בחר את הריפו והבראנץ׳ → `app.py` כ‑Main file.
3. לאחר ה‑Deploy תקבל כתובת קבועה לשיתוף.

### אפשרות 2: Hugging Face Spaces
1. פתח חשבון ב‑Hugging Face.
2. צור Space חדש מסוג **Streamlit**.
3. העלה את שלושת הקבצים (ואת `assets/` אם יש) או חבר לריפו Git.
4. ה‑Space יבנה אוטומטית ותקבל URL ציבורי.

## גופן ברירת מחדל
- האפליקציה תנסה לטעון **David Libre** מהרשת. כדי להימנע מתלות אינטרנט:
  - הורד ידנית את `DavidLibre-Regular.ttf` ושמור ב‑`assets/`.
  - זהו. הקוד יזהה ויטען מקומי.

## מבנה מומלץ של הריפו
```
.
├─ app.py
├─ requirements.txt
├─ README.md
└─ assets/
   └─ DavidLibre-Regular.ttf  (לא חובה, אבל מומלץ)
```

## רישוי
- קוד זה חופשי לשימוש. גופנים כפופים לרישיונם (David Libre תחת OFL).
