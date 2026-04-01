# 🚀 MiniCode Global Deployment & Costing Guide

Welcome to the definitive deployment manual for **MiniCode**. This guide covers everything you need to know to take MiniCode from a local development environment to a globally distributed production environment. 

We have designed MiniCode to be deployable for **absolutely $0/month** for small-scale usage (hackathons, small classes) while being horizontally scalable for enterprise/university levels.

---

## 🏗️ Architecture Overview

MiniCode's architecture is built on modern, scalable cloud primitives:

```text
┌─────────────────┐       ┌────────────────────┐       ┌──────────────────┐
│                 │       │                    │       │                  │
│    Frontend     │──────▶│    Backend API     │──────▶│   Supabase DB    │
│  (Next.js 15)   │       │ (FastAPI/Gunicorn) │       │ (PostgreSQL 15)  │
│  Vercel/Render  │       │   Render/Railway   │       │   w/ PgBouncer   │
│                 │       │                    │       │                  │
└─────────────────┘       └─────────┬──────────┘       └──────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
┌──────────────┐             ┌──────────────┐               ┌──────────────┐
│  GitHub API  │             │   Redis DB   │               │ Celery Fleet │
│ (OAuth, Repos│             │ (Rate Limits,│               │ (Async Judge │
│  & Commits)  │             │  Caching)    │               │  Execution)  │
└──────────────┘             └──────────────┘               └──────────────┘
                                    │
                                    ▼
                             ┌──────────────┐
                             │  Gemini 2.5  │
                             │ (AI Judging) │
                             └──────────────┘
```

---

## 💰 Costing & Tier Breakdown

Below is a transparent breakdown of the costs associated with running MiniCode. 

### 🎓 The "Student & Bootstrapper" Tier ($0/month)
Perfect for college coding clubs, 48-hour hackathons, and personal portfolios.

| Component | Provider | Plan | Cost | Limits |
|-----------|----------|------|------|--------|
| **Database** | Supabase | Free Tier | $0/mo | 500MB storage, 2 active projects, 50 max connections |
| **Backend API** | Render / Railway | Free / Trial | $0/mo | Render spins down after 15m inactivity. |
| **Frontend** | Vercel | Hobby | $0/mo | 100GB Bandwidth, unlimited static requests |
| **Cache/Broker** | Upstash (Redis) | Free | $0/mo | 10k requests/day |
| **AI Judge** | Google AI Studio | Free Tier | $0/mo | 15 RPM (Requests Per Minute), 1M Tokens/min |
| **Auth** | GitHub OAuth | Free | $0/mo | Unlimited |

### 🚀 The "Production University" Tier (~$35 - $80/month)
Perfect for 200+ concurrent students, university courses, and major events.

| Component | Provider | Plan | Cost | Benefits |
|-----------|----------|------|------|----------|
| **Database** | Supabase | Pro Plan | $25/mo | 8GB storage, daily backups, increased connection limits |
| **Backend API** | Render / Railway | Standard/Pro | $7-$25/mo | Always-on, 1-2GB RAM, multi-worker FastAPI concurrency |
| **Frontend** | Vercel | Pro | $20/mo | Increased bandwidth, faster builds, team collaboration |
| **Cache/Broker** | Upstash (Redis) | Pay-as-you-go | ~$2/mo | High throughput for Celery task queuing |
| **AI Judge** | Google AI Studio | Pay-as-you-go | Variables | Fraction of a cent per submission |
| **Total** | | | **~$54/mo** | Highly stable, fast response times |

---

## 🎒 The GitHub Student Developer Pack Advantage

If you are a student, you can run the **Production Tier for FREE** using the [GitHub Student Developer Pack](https://education.github.com/pack).

**How to exploit the pack for MiniCode:**
1. **Render/Railway Credits:** Apply your student developer pack to get monthly platform credits, allowing you to run the **Standard ($25/mo)** backend instance for free.
2. **DigitalOcean:** You retrieve $200 in platform credits. You can spin up a heavy Docker droplet and run the entire MiniCode stack via `docker-compose` on a dedicated 4GB RAM VPS.
3. **GitHub Pro:** Get GitHub Pro for free, unlocking advanced API rate limits and private repository features natively, drastically improving backend sync speeds.

---

## 📦 Deployment Step-by-Step

### 1️⃣ Database (Supabase)
1. Create a project on [Supabase.com](https://supabase.com/).
2. Navigate to **Project Settings → Database**.
3. Copy the **Connection Pooling URI** (Port `6543`).
   *Format:* `postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
4. Set **Pool Mode** to **Transaction**.

### 2️⃣ OAuth (GitHub)
1. Go to [GitHub Developer Settings](https://github.com/settings/developers).
2. Create a new OAuth App.
3. Set **Authorization callback URL** to: `https://[YOUR_FRONTEND_DOMAIN]/auth/callback`
4. Save the **Client ID** and generate a **Client Secret**.

### 3️⃣ AI Engine (Gemini)
1. Open [Google AI Studio](https://aistudio.google.com/apikey).
2. Generate an API Key. Note: The free tier allows 15 RPM, meaning 15 students can submit code simultaneously every minute.

### 4️⃣ Deploying the Backend
You can deploy the backend using Render, Railway, or any Docker-compatible host.

**Option A: Render (Recommended for stability)**
1. Create a new **Web Service** on Render.
2. Point it to your GitHub Repo and select the `backend` directory.
3. Add the following Environment Variables:
   - `DATABASE_URL` (From Supabase)
   - `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`
   - `GEMINI_API_KEY`
   - `JWT_SECRET` (Generate a secure random string)
   - `CORS_ORIGINS` (Your frontend URL)
4. Render automatically runs `CREATE_TABLES=1 python main.py` to migrate the database before booting `uvicorn`.

**Option B: Railway (Recommended for speed)**
1. Create a new project on [Railway.app](https://railway.app/).
2. Point it to the `backend` directory.
3. Import the same environment variables.
4. Go to the **Variables** tab and set `PORT` to `8000`.

### 5️⃣ Deploying the Frontend
1. We highly recommend [Vercel](https://vercel.com/) for deploying the Next.js 15 frontend.
2. Import the `frontend` folder.
3. Set the following Build Environment Variables:
   - `NEXT_PUBLIC_API_URL` (Your deployed backend URL, e.g., `https://minicode-api.onrender.com`)
   - `NEXT_PUBLIC_GITHUB_CLIENT_ID`
4. Deploy!

### 6️⃣ Post-Deployment: Seeding
To initialize the platform with admin roles and sample events:
1. Open the remote shell (Render Shell or Railway Shell) for your backend service.
2. Execute:
   ```bash
   python seed.py
   ```
3. Your database is now populated and ready for action.

---

## 🐳 Self-Hosted Docker Deployment
For full control or utilizing a DigitalOcean student droplet, use the provided `docker-compose.yml`:

```bash
# Clone the repository
git clone https://github.com/your-username/MiniCode.git
cd MiniCode

# Setup variables
cp .env.example .env
nano .env # Fill in your DB, API keys, and GitHub credentials

# Build and run the entire ecosystem (Frontend, DB, Backend, Redis, Celery)
docker-compose up -d --build
```
Ensure you set your server's IP or Domain in the GitHub OAuth callback configurations.
