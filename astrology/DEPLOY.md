# Deploying Cosmos

Three supported paths, ordered by effort:

1. **Render (free, ~5 min)** — easiest, good for MVP and demos.
2. **Railway / Fly.io** — similar free-ish tiers, CLI-driven.
3. **Docker on any VPS** — full control (DigitalOcean, Hetzner, AWS…).

---

## 1. Render (one-click Blueprint)

Render already understands `astrology/render.yaml`. Steps:

1. Push this repo to GitHub (branch `claude/astrology-prediction-app-te4SM`
   is already pushed).
2. Go to https://render.com → **New → Blueprint** → connect the repo.
3. Render creates two services:
   - `cosmos-backend` (Docker web service, FastAPI on port 8000)
   - `cosmos-frontend` (static site from `astrology/frontend/dist`)
4. First deploy finishes in 3–6 minutes. The static site fetches the backend
   at `VITE_API_BASE` — the blueprint defaults this to
   `https://cosmos-backend.onrender.com/api`. If Render names your backend
   differently, update the env var on the frontend service and redeploy.

> Free-tier backends sleep after 15 minutes of idle and take ~30s to wake up.
> Upgrade the backend to the **Starter** plan ($7/mo) for always-on.

---

## 2. Railway

```bash
railway login
railway init
# Backend
cd astrology/backend
railway up
# Frontend
cd ../frontend
railway variables set VITE_API_BASE=https://<backend>.up.railway.app/api
railway up
```

Railway auto-detects the Dockerfile in each folder.

---

## 3. Docker on a VPS

Works on any Linux box with Docker + Compose installed.

```bash
git clone <repo> cosmos && cd cosmos/astrology
docker compose build
docker compose up -d
# open http://<server-ip>:8080
```

Nginx in the frontend container proxies `/api/*` to the backend service, so
only port 8080 is exposed externally. Put it behind Caddy / Nginx / Traefik
for HTTPS.

### Sample Caddy reverse proxy

```
cosmos.example.com {
  reverse_proxy localhost:8080
}
```

Caddy auto-issues Let's Encrypt certificates.

---

## Environment variables

### Backend
- `PORT` — HTTP port (default 8000; Render sets this automatically).
- `SWISSEPH_PATH` — optional. Path to Swiss Ephemeris data files for
  sub-arcsecond accuracy. Without it the app uses the built-in Moshier
  analytic ephemeris (still astrology-grade, ~±1 arcmin, no data files).

### Frontend
- `VITE_API_BASE` — backend base URL + `/api` prefix. Default is `/api`
  (expects an nginx proxy, as in the Docker compose setup).

---

## Production hardening checklist

- Lock CORS in `astrology/backend/app/main.py`: replace
  `allow_origins=["*"]` with your frontend origin.
- Put a rate limiter in front of `/api/*` (Cloudflare, nginx `limit_req`,
  or `slowapi` middleware).
- Add caching headers on the interpretation endpoints — charts are pure
  functions of their input.
- Optional: mount Swiss Ephemeris data files at `/app/sweph` in the backend
  container and set `SWISSEPH_PATH=/app/sweph` for full JPL accuracy and
  Chiron / Lilith support.
