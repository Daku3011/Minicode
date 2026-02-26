# 🚀 MiniCode Deployment Guide

Deploy MiniCode with **Supabase** (database), **Render** (backend + frontend), and **Docker** containers optimized for high traffic.

---

## Architecture Overview

```
┌──────────────┐       ┌──────────────────┐       ┌─────────────────┐
│              │       │                  │       │                 │
│   Frontend   │──────▶│   Backend API    │──────▶│    Supabase     │
│   (Next.js)  │       │ (FastAPI+Gunicorn│       │  (PostgreSQL)   │
│   on Render  │       │   on Render)     │       │   Cloud DB      │
│              │       │                  │       │                 │
└──────────────┘       └──────────────────┘       └─────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  External APIs   │
                    │  • GitHub OAuth  │
                    │  • Gemini AI     │
                    └──────────────────┘
```

---

## Prerequisites

- [GitHub account](https://github.com)
- [Supabase account](https://supabase.com) (free tier works)
- [Render account](https://render.com) (free tier works, Starter recommended)
- [Google AI Studio account](https://aistudio.google.com) for Gemini API key
- [Docker](https://docker.com) installed locally (optional, for local testing)

---

## Step 1: Set Up Supabase (Database)

### 1.1 Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Name:** `minicode`
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your users
4. Click **"Create new project"** and wait for it to provision

### 1.2 Get Your Connection String

1. Go to **Project Settings → Database**
2. Scroll to **"Connection string"** section
3. Select **"URI"** tab
4. Copy the connection string. It looks like:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
5. Replace `[PASSWORD]` with your actual database password

> **⚠️ Important:** Use the **"Connection Pooling"** URI (port `6543`), NOT the direct connection (port `5432`). Pooling handles many concurrent connections efficiently.

### 1.3 Configure Connection Pooling

1. Go to **Project Settings → Database → Connection Pooling**
2. Ensure **"Pool Mode"** is set to **Transaction** (recommended for web apps)
3. Set **"Pool Size"** to at least **20** (matches our backend config)

---

## Step 2: Set Up GitHub OAuth App

### 2.1 Create OAuth App

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name:** `MiniCode`
   - **Homepage URL:** `https://minicode-web.onrender.com` (your frontend URL)
   - **Authorization callback URL:** `https://minicode-web.onrender.com/auth/callback`
4. Click **"Register application"**
5. Copy the **Client ID**
6. Click **"Generate a new client secret"** and copy it

### 2.2 Create Personal Access Token (for repo creation)

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Select scopes: `repo`, `user`
4. Copy the token

---

## Step 3: Deploy Backend on Render

### 3.1 Create Web Service

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository (`LeetCodeCodingClub`)
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `minicode-api` |
| **Region** | Oregon (or closest) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Docker` |
| **Instance Type** | Starter ($7/mo) or Standard ($25/mo) for production |

### 3.2 Set Environment Variables

In the **"Environment"** tab, add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Supabase connection string (Step 1.2) |
| `GITHUB_CLIENT_ID` | From Step 2.1 |
| `GITHUB_CLIENT_SECRET` | From Step 2.1 |
| `GITHUB_TOKEN` | From Step 2.2 |
| `GEMINI_API_KEY` | From [Google AI Studio](https://aistudio.google.com/apikey) |
| `JWT_SECRET` | Click "Generate" in Render |
| `CORS_ORIGINS` | `https://minicode-web.onrender.com` |
| `WEB_CONCURRENCY` | `4` (adjust based on plan) |

### 3.3 Set Health Check

- **Health Check Path:** `/health`

### 3.4 Pre-deploy Command (Automatic)

Render will automatically run `CREATE_TABLES=1 python main.py` before starting the web service. This creates your database tables exactly once, avoiding race conditions if you have multiple workers.

5. Click **"Create Web Service"**

### 3.5 Verify Backend

Once deployed, visit:
```
https://minicode-api.onrender.com/health
→ Should return: {"status": "healthy"}
```

---

## Step 4: Deploy Frontend on Render

### 4.1 Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect the same GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `minicode-web` |
| **Region** | Same as backend |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Runtime** | `Docker` |
| **Instance Type** | Starter ($7/mo) |

### 4.2 Set Environment Variables

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://minicode-api.onrender.com` |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | Same as backend |

> **Note:** `NEXT_PUBLIC_` vars are baked into the build. If you change them, you must **redeploy** (trigger a manual deploy in Render).

### 4.3 Verify Frontend

Visit `https://minicode-web.onrender.com` — you should see the MiniCode homepage.

---

## Step 5: Seed the Database

After both services are deployed, seed the database with initial problems:

### Option A: Run locally against Supabase

```bash
cd backend

# Set the Supabase DATABASE_URL
export DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# Install deps if not already done
pip install -r requirements.txt

# Run the seed script
python seed.py
```

### Option B: Use Render Shell

1. Go to your backend service on Render
2. Click **"Shell"** tab
3. Run:
   ```bash
   python seed.py
   ```

---

## Step 6: Update GitHub OAuth Callback

After noting your final Render URLs, update your GitHub OAuth App:

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Edit your OAuth App
3. Update **Authorization callback URL** to:
   ```
   https://minicode-web.onrender.com/auth/callback
   ```

---

## 🐳 Local Development with Docker

For local testing with Docker Compose:

### Prerequisites
- Docker and Docker Compose installed
- A Supabase project (or use local PostgreSQL)

### Run

```bash
# 1. Copy env template
cp .env.example .env

# 2. Fill in your values in .env

# 3. Build and run
docker compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# Health:   http://localhost:8000/health
```

### Useful Commands

```bash
# Run in background
docker compose up -d --build

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop everything
docker compose down

# Rebuild a single service
docker compose up --build backend
```

---

## ⚡ Scaling for High Traffic

### Backend (FastAPI + Gunicorn)

The backend is configured for concurrent traffic handling:

| Config | Default | Purpose |
|--------|---------|---------|
| `WEB_CONCURRENCY` | `4` | Number of Gunicorn workers (each handles requests independently) |
| `pool_size` | `20` | PostgreSQL connection pool size |
| `max_overflow` | `10` | Extra DB connections under load |
| `max-requests` | `1000` | Worker restart after N requests (prevents memory leaks) |

**Scaling tips:**
- **Workers:** Set `WEB_CONCURRENCY` to `2 × CPU cores + 1`. On Render Starter (0.5 CPU), use `2`. On Standard (1 CPU), use `4`.
- **Upgrade Render plan:** Standard ($25/mo) gives 1 CPU + 2GB RAM. Pro ($85/mo) gives 2 CPU + 4GB RAM.
- If you need more throughput, scale **horizontally** — Render supports multiple instances.

### Frontend (Next.js)

- Next.js standalone mode runs efficiently with minimal memory
- Static pages are pre-rendered at build time
- The Starter plan is sufficient for most frontend traffic

### Database (Supabase)

- Free tier: 500MB storage, sufficient for development
- Pro plan ($25/mo): 8GB storage, better performance, daily backups
- Enable **Read Replicas** for high read traffic
- Connection pooling via PgBouncer is already configured (port `6543`)

---

## 🛠️ Troubleshooting

### Backend won't start

```
Error: connection refused / FATAL: password authentication failed
```
→ Check `DATABASE_URL` is correct. Use the **pooler** URL (port `6543`).

### Frontend shows "Network Error"

→ Check `NEXT_PUBLIC_API_URL` points to your backend Render URL.  
→ Check `CORS_ORIGINS` on the backend includes your frontend URL.

### GitHub OAuth fails

→ Verify **callback URL** in GitHub OAuth App matches your frontend URL.  
→ Ensure `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set on both services.

### "Free instance spins down" / Slow first request

→ Render free tier spins down after 15 min of inactivity.  
→ Upgrade to Starter ($7/mo) for always-on instances.

### Database connection errors under load

→ Ensure you're using the **pooler** connection string (port `6543`).  
→ Increase `pool_size` in backend if needed.  
→ Upgrade Supabase plan for higher connection limits.

### Build fails on Render

→ Check Render build logs for errors.  
→ Ensure `requirements.txt` and `package.json` are complete.  
→ For frontend: `NEXT_PUBLIC_` env vars must be set as **build-time** variables (not just runtime).

---

## 📊 Cost Summary

| Service | Free Tier | Starter | Standard |
|---------|-----------|---------|----------|
| **Render Backend** | $0 (spins down) | $7/mo (always-on) | $25/mo (1 CPU) |
| **Render Frontend** | $0 (spins down) | $7/mo (always-on) | $25/mo |
| **Supabase** | $0 (500MB) | — | $25/mo (8GB) |
| **Total** | **$0/mo** | **$14/mo** | **$75/mo** |

> **Recommendation:** Start with **Starter** plan ($14/mo total) for a reliable always-on deployment. Upgrade to Standard when you have 50+ concurrent users.
