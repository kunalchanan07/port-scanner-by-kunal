# Port Scanner by Kunal - Deployment & Netlify Setup Guide

This guide explains how to fix the `"Scan failed: Connected to host"` issue when deploying on Netlify by setting up your Python FastAPI backend and connecting them.

---

## 1. Why Did "Scan failed: Connected to host" Occur on Netlify?

- Netlify is a static website host (it hosts HTML, CSS, JavaScript, and assets in the `dist` folder).
- Browsers cannot run raw Python sockets (`socket.socket`, `socket.SOCK_STREAM`, `connect_ex()`) client-side.
- When your frontend made a `fetch('/api/scan')` call, Netlify's Single Page Application redirect (`/* -> /index.html`) intercepted the request and returned your HTML homepage (`index.html`) with a `text/html` header instead of a JSON response.
- The frontend rejected the HTML response with `Connected to host`, aborting the scan.

---

## 2. Solution Architecture

1. **Frontend:** Hosted on Netlify as a fast, responsive React Single Page Application.
2. **Backend:** Hosted on a free or low-cost Python cloud provider (e.g. **Render**, **Railway**, **Fly.io**, or your own VPS).
3. **Connection:** Netlify talks to the Python FastAPI backend over HTTPS using `VITE_API_BASE_URL` with CORS enabled.

---

## 3. How to Deploy the Python FastAPI Backend

Your project includes the complete, production-ready backend code in `main.py` and dependencies in `requirements.txt`.

### Option A: Deploy on Render.com (Recommended & Free)
1. Push your repository to GitHub or create a repo with `main.py` and `requirements.txt`.
2. Go to [Render.com](https://render.com) and click **New +** -> **Web Service**.
3. Select your repository.
4. Configure the settings:
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Click **Create Web Service**.
6. Once deployed, Render will give you a public URL like:
   `https://port-scanner-backend.onrender.com`

### Option B: Deploy on Railway.app
1. Go to [Railway.app](https://railway.app) and click **New Project** -> **Deploy from GitHub repo**.
2. Railway detects Python automatically. Set the Start Command to:
   `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Click **Generate Domain** in the service settings to get your live URL:
   `https://port-scanner-production.up.railway.app`

### Option C: Run on a VPS (Ubuntu / Debian / Docker)
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run with uvicorn in production (or use systemd / gunicorn)
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 4. How to Connect the Python Backend to Your Netlify Website

1. Log in to your [Netlify Dashboard](https://app.netlify.com).
2. Select your **Port Scanner by Kunal** site.
3. Go to **Site configuration** -> **Environment variables**.
4. Set or verify the variable:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `https://port-scanner-by-kunal.onrender.com`
5. Save the variable.
6. Trigger a new deploy (**Deploys** -> **Trigger deploy** -> **Clear cache and deploy site**).

> **Why a redeploy is required:** Vite client-side environment variables (`import.meta.env.VITE_*`) are statically embedded into JavaScript bundles at build time (`npm run build`). Once you set `VITE_API_BASE_URL`, clearing the cache and rebuilding ensures the frontend bundles directly point to `https://port-scanner-by-kunal.onrender.com`.
> **Automatic Fallback:** The frontend code also defaults to `https://port-scanner-by-kunal.onrender.com`, and `netlify.toml` now includes an automatic reverse proxy redirect from `/api/*` to `https://port-scanner-by-kunal.onrender.com/api/:splat` so HTML will never be returned.

---

## 5. Security & Authorization Rules Enforced

The Python backend enforces strict security controls in `main.py`:
- **Allowed targets:** `localhost`, `127.0.0.1`, `::1`, `scanme.nmap.org`, and public domains/IPs.
- **Restricted targets:** Internal private subnets (`192.168.0.0/16`, `10.0.0.0/8`, `172.16.0.0/12`), link-local (`169.254.0.0/16`), and internal domains (`.local`, `.internal`) are rejected with an explicit 403/error JSON response to prevent SSRF (Server-Side Request Forgery).
- **Concurrency & Rate Protection:** Maximum 100 ports per request, with `ThreadPoolExecutor(max_workers=20)` and timeouts between 0.1s and 5.0s.
