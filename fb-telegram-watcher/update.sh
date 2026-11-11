#!/usr/bin/env bash
# Pull the latest code and restart the bot:  sudo bash /opt/fbwatch/repo/fb-telegram-watcher/update.sh
set -euo pipefail
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE=/opt/fbwatch
[ "$(id -u)" -eq 0 ] || { echo "יש להריץ עם sudo"; exit 1; }

echo "==> מוריד קוד מעודכן..."
git -C "$APP_DIR" pull --ff-only

echo "==> מעדכן ספריות..."
$BASE/venv/bin/pip install -q -r "$APP_DIR/requirements.txt"
PLAYWRIGHT_BROWSERS_PATH=$BASE/browsers $BASE/venv/bin/playwright install chromium
chmod -R a+rX $BASE/browsers

install -m 644 "$APP_DIR/systemd/fbwatch-xvfb.service" /etc/systemd/system/fbwatch-xvfb.service
sed "s#__APP_DIR__#$APP_DIR#g" "$APP_DIR/systemd/fbwatch.service" > /etc/systemd/system/fbwatch.service
systemctl daemon-reload
systemctl restart fbwatch-xvfb.service fbwatch.service
sleep 6
if systemctl is-active --quiet fbwatch.service; then
  echo "✔ העדכון הושלם והבוט רץ. שלח לבוט /status"
else
  journalctl -u fbwatch.service -n 30 --no-pager
  echo "✘ הבוט לא עלה אחרי העדכון. העתק את השורות למעלה ושלח לי."
  exit 1
fi
