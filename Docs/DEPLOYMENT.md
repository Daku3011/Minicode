# 🚀 MiniCode Global Deployment & Costing Guide

Welcome to the definitive deployment manual for **MiniCode**. This guide covers everything you need to know to take MiniCode from a local development environment to a globally distributed production environment. 

We have designed MiniCode to be deployable for **absolutely $0/month** for small-scale usage (hackathons, small classes) while being horizontally scalable for enterprise/university levels.

---

## 🏗️ Architecture Overview

MiniCode's architecture is built on modern, scalable cloud primitives:

```text
┌─────────────────┐       ┌────────────────────┐       ┌──────────────────┐
│                 │       │                    │       │                  │
│    Frontend     │──────▶│    Backend API     │──────▶│   PostgreSQL     │
│  (Next.js 16)   │       │ (FastAPI/Gunicorn) │       │ (PostgreSQL 15)  │
│  Vercel/Render  │       │   Render/Railway   │       │                  │
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
| **Database** | Local PostgreSQL | Docker | $0/mo | Limited by disk space |
| **Backend API** | Render / Railway | Free / Trial | $0/mo | Render spins down after 15m inactivity. |
| **Frontend** | Vercel | Hobby | $0/mo | 100GB Bandwidth, unlimited static requests |
| **Cache/Broker** | Upstash (Redis) | Free | $0/mo | 10k requests/day |
| **AI Judge** | Google AI Studio | Free Tier | $0/mo | 15 RPM (Requests Per Minute), 1M Tokens/min |
| **Auth** | GitHub OAuth | Free | $0/mo | Unlimited |

### 🚀 The "Production University" Tier (~$35 - $80/month)
Perfect for 200+ concurrent students, university courses, and major events.

| Component | Provider | Plan | Cost | Benefits |
|-----------|----------|------|------|----------|
| **Database** | Managed PostgreSQL (Supabase/Railway) | Pro Plan | $10-$25/mo | Daily backups, increased connection limits |
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

### 0️⃣ Generate Security Keys

Before deploying, generate the required security keys:

```bash
# Generate FERNET_KEY (for token encryption)
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Generate JWT_SECRET
openssl rand -hex 32
```

Set these in your environment variables:
- `FERNET_KEY` - Used for encrypting GitHub tokens and sensitive data
- `JWT_SECRET` - Used for signing authentication tokens

### 1️⃣ Database (PostgreSQL)

#### Option A: Local Development (Docker)
The `docker-compose.yml` includes a PostgreSQL container. Simply run:
```bash
docker-compose up -d postgres
```
The `DATABASE_URL` will be: `postgresql://postgres:postgres@localhost:5432/minicode`

#### Option B: Managed PostgreSQL (Production)
1. Create a project on [Supabase.com](https://supabase.com/) or [Railway](https://railway.app/).
2. Navigate to **Project Settings → Database**.
3. Copy the **Connection Pooling URI** (Port `6543` for Supabase).
   - *Format (Supabase):* `postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
   - *Format (Railway):* `postgresql://postgres:PASSWORD@xxx.railway.app:5432/railway`
4. Set **Pool Mode** to **Transaction** (Supabase only).

### 2️⃣ OAuth (GitHub)
1. Go to [GitHub Developer Settings](https://github.com/settings/developers).
2. Create a new OAuth App.
3. Set **Authorization callback URL** to: `https://[YOUR_FRONTEND_DOMAIN]/auth/callback`
4. Save the **Client ID** and generate a **Client Secret**.

### 3️⃣ AI Engine (Gemini)
1. Open [Google AI Studio](https://aistudio.google.com/apikey).
2. Generate an API Key.
   - Note: The free tier allows 15 RPM, meaning 15 students can submit code simultaneously every minute.

### 4️⃣ The Zero-Cost Stack (100% Free)
If you want to deploy MiniCode without spending a dime, follow this "Multi-Cloud" approach.

#### 1. Database: [Supabase](https://supabase.com/) (PostgreSQL)
- Create a new project.
- Go to **Project Settings** -> **Database**.
- Copy the **Connection String** (Transaction URI) to use as your `DATABASE_URL`.
- *Note: Unlike Render's free DB, Supabase is persistent and won't expire.*

#### 2. Cache & Message Broker: [Upstash](https://upstash.com/) (Redis)
- Create a **Redis** database.
- Copy the **Connection URI**. It should look like `rediss://...`.
- **Note:** Ensure you use the `rediss://` prefix (SSL) if working on Render/Vercel.
- Use this same URI for **both** `REDIS_URL` and `CELERY_BROKER_URL`.

#### 3. Backend API & Worker: [Render](https://render.com/) (Free Web Service)
Render's Free Tier only allows one Web Service. We have optimized the code to run both the API and the Celery worker in a single container.
- Create a new **Web Service**.
- Set **Runtime** to `Docker`.
- Add These Environment Variables:
  - `DATABASE_URL` (From Supabase)
  - `REDIS_URL` (From Upstash)
  - `CELERY_BROKER_URL` (From Upstash)
  - `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` / `GITHUB_TOKEN`
  - `GEMINI_API_KEY`
  - `SMTP_EMAIL` / `SMTP_PASSWORD`
  - `PORT`: `8000`
- **Memory Limit:** Ensure `WEB_CONCURRENCY=1` to stay within the 512MB free RAM limit.

#### 4. Frontend: [Vercel](https://vercel.com/) (Hobby Tier)
- Connect your GitHub repo.
- Point it to the `frontend` directory.
- Add Build Environment Variables:
  - `NEXT_PUBLIC_API_URL`: Your Render.com backend URL.
  - `NEXT_PUBLIC_GITHUB_CLIENT_ID`: Your GitHub Meta-App ID.

### 6️⃣ Railway Deployment

Railway provides a simple deployment path with a pre-configured `railway.json` in the project root.

#### Steps:
1. Connect your GitHub repository to [Railway](https://railway.app/).
2. Select the repository root as the project directory.
3. Railway will automatically detect the `railway.json` configuration.
4. Add the following environment variables in the Railway dashboard:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `REDIS_URL` (Redis connection string)
   - `CELERY_BROKER_URL` (same as REDIS_URL)
   - `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` / `GITHUB_TOKEN`
   - `GEMINI_API_KEY`
   - `FERNET_KEY` (generate with the command above)
   - `JWT_SECRET`
   - `SMTP_EMAIL` / `SMTP_PASSWORD`
5. Deploy the service.

#### Railway Configuration (`railway.json`):
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "backend/Dockerfile"
  },
  "deploy": {
    "runtime": "V2",
    "numReplicas": 1,
    "preDeployCommand": [
      "env CREATE_TABLES=1 ONLY_CREATE_TABLES=1 python main.py && python seed.py"
    ],
    "sleepApplication": false
  }
}
```

### 7️⃣ Keeping the Backend Awake (Anti-Sleep)
Render's Free Tier spins down after 15 minutes of inactivity. To keep it responsive:
1. Use a free monitoring service like [Cron-job.org](https://cron-job.org/) or [Better Stack](https://betterstack.com/).
2. Set it to ping your backend's `/health` endpoint every **14 minutes**.
3. Target URL: `https://your-app.onrender.com/health`

#### 🛠 Troubleshooting: Common Errors

> [!IMPORTANT]
> **Error: "could not translate host name... Name does not resolve"**
> This happens if your Supabase password contains special characters (like `@` or `!`). You **MUST** URL-encode these characters.
> - **Wrong**: `postgresql://user:p@ssword!@host...`
> - **Right**: `postgresql://user:p%40ssword%21@host...`
> - **Pro-Tip**: Use the "Hide Password" toggle in the Supabase dashboard to get the pre-encoded URI.

> [!IMPORTANT]
> **Error: "Cannot connect to redis://localhost:6379"**
> This means your `minicode-worker` is trying to look for a local Redis. Ensure you have set **both** of these in your Render Environment:
> - `REDIS_URL`: `rediss://...` (from Upstash)
> - `CELERY_BROKER_URL`: `rediss://...` (same as above)