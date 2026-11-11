#!/usr/bin/env bash
# fbwatch installer for Ubuntu 22.04 / 24.04. Run as root:  sudo bash install.sh
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE=/opt/fbwatch
ENV_FILE=$BASE/.env
export DEBIAN_FRONTEND=noninteractive

say()  { echo -e "\n\033[1;34m==> $*\033[0m"; }
ok()   { echo -e "\033[1;32m✔ $*\033[0m"; }
warn() { echo -e "\033[1;33m! $*\033[0m"; }
die()  { echo -e "\033[1;31m✘ $*\033[0m"; exit 1; }

[ "$(id -u)" -eq 0 ] || die "יש להריץ עם sudo:  sudo bash install.sh"
grep -qi ubuntu /etc/os-release || warn "המערכת אינה Ubuntu – ממשיך בכל זאת."

# ------------------------------------------------------------------ 1. system packages
say "1/7 מתקין חבילות מערכת (כמה דקות)..."
apt-get update -y
apt-get install -y python3 python3-venv python3-pip git curl ca-certificates sqlite3 \
  xvfb x11vnc novnc websockify fonts-noto-core fonts-noto-color-emoji ufw
ok "חבילות הותקנו"

say "2/7 מתקין cloudflared (קישור זמני ומאובטח לתצוגה מרחוק)..."
if ! command -v cloudflared >/dev/null; then
  ARCH="$(dpkg --print-architecture)"
  curl -fsSL -o /tmp/cloudflared.deb \
    "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${ARCH}.deb"
  dpkg -i /tmp/cloudflared.deb && rm -f /tmp/cloudflared.deb
fi
ok "cloudflared מוכן"

timedatectl set-timezone Asia/Jerusalem 2>/dev/null || true

# swap helps Chromium on small servers
if ! swapon --show | grep -q .; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile >/dev/null && swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  ok "נוסף swap של 2GB"
fi

# firewall: only SSH in. The remote view uses an outgoing tunnel, so no port is opened.
ufw allow OpenSSH >/dev/null && ufw --force enable >/dev/null && ok "חומת אש הופעלה (SSH בלבד)"

# ------------------------------------------------------------------ 2. user + python
say "3/7 יוצר משתמש מערכת ותיקיות..."
id fbwatch >/dev/null 2>&1 || useradd --system --create-home --home-dir $BASE/home --shell /usr/sbin/nologin fbwatch
mkdir -p $BASE/data $BASE/browsers
chown -R fbwatch:fbwatch $BASE/data $BASE/home

say "4/7 מתקין Python ו-Playwright + Chromium (כמה דקות)..."
[ -x $BASE/venv/bin/python ] || python3 -m venv $BASE/venv
$BASE/venv/bin/pip install -q --upgrade pip
$BASE/venv/bin/pip install -q -r "$APP_DIR/requirements.txt"
PLAYWRIGHT_BROWSERS_PATH=$BASE/browsers $BASE/venv/bin/playwright install --with-deps chromium
chmod -R a+rX $BASE/browsers
ok "Python ו-Chromium הותקנו"

# ------------------------------------------------------------------ 3. secrets -> .env
ask() { # ask VAR "prompt" validator_fn
  local __var=$1 __prompt=$2 __check=$3 __val
  while true; do
    echo
    read -r -p "$__prompt: " __val </dev/tty
    __val="$(echo -n "$__val" | tr -d '[:space:]')"
    if $__check "$__val"; then printf -v "$__var" '%s' "$__val"; return; fi
  done
}

check_token() {
  [[ "$1" =~ ^[0-9]+:[A-Za-z0-9_-]{30,}$ ]] || { warn "הטוקן לא נראה תקין. הוא נראה כך: 123456789:AAH...  נסה שוב."; return 1; }
  local r; r="$(curl -s "https://api.telegram.org/bot$1/getMe")"
  if [[ "$r" == *'"ok":true'* ]]; then ok "הטוקן תקין. הבוט: @$(echo "$r" | sed -n 's/.*"username":"\([^"]*\)".*/\1/p')"; return 0; fi
  warn "טלגרם דחה את הטוקן. העתק שוב מ-@BotFather."; return 1
}
check_chat() {
  [[ "$1" =~ ^-?[0-9]+$ ]] || { warn "ה-chat ID הוא מספר בלבד (למשל 123456789). נסה שוב."; return 1; }
  local r; r="$(curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
     --data-urlencode "chat_id=$1" --data-urlencode "text=✅ בדיקת חיבור מהשרת – אם קיבלת את זה, ה-chat ID נכון.")"
  if [[ "$r" == *'"ok":true'* ]]; then ok "נשלחה אליך הודעת בדיקה בטלגרם"; return 0; fi
  warn "לא הצלחתי לשלוח לך הודעה. ודא שפתחת את הבוט שלך בטלגרם ולחצת Start, ושהמספר נכון. נסה שוב."; return 1
}
check_api() {
  [[ "$1" == sk-ant-* ]] || { warn "מפתח API של Anthropic מתחיל ב-sk-ant-  נסה שוב."; return 1; }
  local code; code="$(curl -s -o /dev/null -w '%{http_code}' https://api.anthropic.com/v1/models \
     -H "x-api-key: $1" -H 'anthropic-version: 2023-06-01')"
  [ "$code" = 200 ] && { ok "מפתח ה-API תקין"; return 0; }
  warn "המפתח נדחה (קוד $code). העתק שוב מ-console.anthropic.com."; return 1
}
check_vnc() {
  [[ ${#1} -ge 6 && ${#1} -le 8 ]] || { warn "הסיסמה צריכה להיות 6 עד 8 תווים (אותיות ומספרים באנגלית)."; return 1; }
  [[ "$1" =~ ^[A-Za-z0-9]+$ ]] || { warn "רק אותיות באנגלית ומספרים, בלי רווחים וסימנים."; return 1; }
  return 0
}

if [ -f "$ENV_FILE" ]; then
  say "5/7 נמצא קובץ מפתחות קיים ($ENV_FILE)."
  read -r -p "להזין מפתחות מחדש? (y = כן / Enter = להשאיר) " RE </dev/tty || true
else
  RE=y
fi
if [[ "${RE:-}" =~ ^[yYכ] ]]; then
  say "5/7 הזנת מפתחות – הדבק כל ערך ולחץ Enter"
  ask TELEGRAM_BOT_TOKEN "1) טוקן הבוט מ-BotFather" check_token
  ask TELEGRAM_CHAT_ID   "2) ה-chat ID שלך (מספר מ-userinfobot)" check_chat
  ask ANTHROPIC_API_KEY  "3) מפתח ה-API של Anthropic (sk-ant-...)" check_api
  ask VNC_PASSWORD       "4) בחר סיסמת תצוגה: 6-8 אותיות/מספרים באנגלית (תצטרך אותה ב-/login)" check_vnc
  umask 077
  cat > "$ENV_FILE" <<EOF
TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID=$TELEGRAM_CHAT_ID
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY
VNC_PASSWORD=$VNC_PASSWORD
TZ=Asia/Jerusalem
MAX_POSTS_PER_RUN=60
DATA_DIR=$BASE/data
EOF
  umask 022
  ok "קובץ המפתחות נכתב"
fi
chown fbwatch:fbwatch "$ENV_FILE" && chmod 600 "$ENV_FILE"

# ------------------------------------------------------------------ 4. services
say "6/7 מגדיר שירותי מערכת (עולים לבד אחרי קריסה או הפעלה מחדש)..."
install -m 644 "$APP_DIR/systemd/fbwatch-xvfb.service" /etc/systemd/system/fbwatch-xvfb.service
sed "s#__APP_DIR__#$APP_DIR#g" "$APP_DIR/systemd/fbwatch.service" > /etc/systemd/system/fbwatch.service
systemctl daemon-reload
systemctl enable --now fbwatch-xvfb.service
systemctl enable fbwatch.service
systemctl restart fbwatch.service

say "7/7 בודק שהבוט רץ..."
sleep 8
if systemctl is-active --quiet fbwatch.service; then
  ok "הבוט רץ!"
  echo
  echo "======================================================"
  echo "  ההתקנה הסתיימה בהצלחה."
  echo "  עכשיו פתח את הבוט בטלגרם ושלח: /status"
  echo "======================================================"
else
  journalctl -u fbwatch.service -n 30 --no-pager || true
  die "הבוט לא עלה. העתק את השורות האדומות למעלה ושלח לי."
fi
