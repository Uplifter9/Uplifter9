# fbwatch – סיכומי קבוצת פייסבוק לטלגרם

בוט שעוקב אחרי קבוצה ציבורית בפייסבוק (קריאה בלבד), שומר את הפוסטים ב-SQLite ושולח סיכום בעברית לטלגרם באמצעות Claude.

## מבנה
| קובץ | תפקיד |
|---|---|
| `install.sh` | התקנה מלאה על שרת Ubuntu: חבילות, Chromium, שואל את המפתחות וכותב `.env`, מגדיר שירותי systemd |
| `update.sh` | מושך קוד מעודכן ומפעיל מחדש את הבוט |
| `fbwatch/bot.py` | בוט הטלגרם: `/summary` `/group` `/login` `/status` `/schedule` וסיכום יומי בשעה אקראית |
| `fbwatch/scraper.py` | נכנס לקבוצה, גולל בקצב אנושי ואוסף פוסטים. לא לוחץ לייק/תגובה/שיתוף/הצטרפות |
| `fbwatch/login_session.py` | התחברות ידנית דרך תצוגה מרחוק (noVNC) מוגנת בסיסמה, דרך קישור זמני שנסגר בסיום |
| `fbwatch/summarizer.py` | שולח את הפוסטים החדשים ל-Claude ומחזיר סיכום |
| `fbwatch/db.py` | מאגר SQLite – כל פוסט נשמר פעם אחת ומסומן כשסוכם |
| `fbwatch/browser.py` | פרופיל דפדפן שמור, כך שההתחברות נשמרת בין הרצות |

## התקנה (על השרת)
```bash
sudo apt-get update && sudo apt-get install -y git && sudo git clone -b ccr-9a7182b0-p1qc8b https://github.com/Uplifter9/Uplifter9.git /opt/fbwatch/repo && sudo bash /opt/fbwatch/repo/fb-telegram-watcher/install.sh
```

## עדכון
```bash
sudo bash /opt/fbwatch/repo/fb-telegram-watcher/update.sh
```

## אבטחה
- המפתחות נשמרים רק ב-`/opt/fbwatch/.env` על השרת (הרשאות 600), והקובץ מוחרג ב-`.gitignore`.
- שם המשתמש והסיסמה של פייסבוק לא נשמרים בשום מקום – ההתחברות ידנית.
- אין פורט פתוח לתצוגה מרחוק: הקישור הזמני עובר דרך מנהרה יוצאת (cloudflared) ונסגר מיד בסיום ההתחברות.
- הבוט עונה רק ל-chat ID שהוגדר.

## לוגים
```bash
sudo journalctl -u fbwatch -n 100 --no-pager
```
