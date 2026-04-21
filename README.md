# MiniCode

MiniCode is a full-stack coding arena for colleges and clubs. It combines real GitHub workflows with an AI-assisted judge, role-based learning paths, live events, XP progression, and faculty/admin operations.

## What MiniCode Does

- Students solve coding problems in private GitHub repositories.
- Submissions are queued and evaluated asynchronously by a Celery worker.
- Faculty create problems, monitor student progress, run events, and award XP.
- Admins manage users, roles, and system-level controls.

## Architecture

```text
Frontend (Next.js 16, React 19)
  -> Backend API (FastAPI)
  -> Redis (cache + Celery broker/result backend)
  -> PostgreSQL or SQLite (SQLModel)
  -> Celery worker + beat (background judging and scheduled jobs)
  -> External APIs (GitHub OAuth/API, Google OAuth, Gemini)
```

## Repository Structure

```text
frontend/   Next.js App Router UI + auth context + pages
backend/    FastAPI app, routers, judge, DB models, worker, scripts
docker-compose.yml  Full local stack (frontend, backend, postgres, redis, worker, beat)
```

## Core Features

- Role-based auth and access control (`student`, `faculty`, `admin`)
- GitHub OAuth login for coding workflow
- Google OAuth login path for faculty/admin (`@scet.ac.in` auto-faculty rule)
- Problem lifecycle: create, start (repo provision), submit, async judge result
- Events, team participation, invitations, and event leaderboard
- News + notifications + unread tracking
- XP, levels, leaderboard, faculty XP rewards
- Redis-backed caching and rate-limiting middleware support

## Quick Start (Docker Recommended)

## 1. Prerequisites

- Docker
- Docker Compose

## 2. Configure Environment

From project root:

```bash
cp .env.example .env
```

Update required values in `.env`:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GEMINI_API_KEY`
- `JWT_SECRET`
- `FERNET_KEY`

Generate secure values:

```bash
openssl rand -hex 32   # JWT_SECRET
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"  # FERNET_KEY
```

## 3. Start the Stack

```bash
docker-compose up -d --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend API docs: `http://localhost:8000/docs`
- Backend health: `http://localhost:8000/health`

## 4. Default Development Accounts

Seeded automatically by backend startup script:

- Admin: `admin` / `admin123`
- Faculty: `faculty` / `faculty123`
- Student: `student` / `student123`

## Local Development (Without Docker)

## Backend

**Linux/macOS:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env  # then edit values
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Windows (PowerShell):**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
copy ..\.env.example .env  # then edit values
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Worker (required for submission judging)

**Linux/macOS:**
```bash
cd backend
source venv/bin/activate
celery -A worker.celery_app worker --loglevel=info
```

**Windows:**
```bash
cd backend
.\venv\Scripts\activate
celery -A worker.celery_app worker --loglevel=info -P solo
```

Optional scheduler:

**Linux/macOS:**
```bash
cd backend
source venv/bin/activate
celery -A worker.celery_app beat --loglevel=info
```

**Windows:**
```bash
cd backend
.\venv\Scripts\activate
celery -A worker.celery_app beat --loglevel=info
```

## Frontend

```bash
cd frontend
npm install
copy ..\.env.example .env.local  # Use 'cp' on Linux
# set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLModel database connection string |
| `REDIS_URL` | Redis connection for cache |
| `CELERY_BROKER_URL` | Celery broker and backend |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `GEMINI_API_KEY` | AI judge backend |
| `JWT_SECRET` | JWT signing key |
| `FERNET_KEY` | Encryption key for stored GitHub access tokens |
| `CORS_ORIGINS` | Allowed frontend origins |
| `NEXT_PUBLIC_API_URL` | Frontend API base URL |
| `RESEND_API_KEY` | API Key for Resend email provider |
| `SMTP_EMAIL` / `SMTP_PASSWORD` | Fallback SMTP credentials (if Resend not used) |

## Authentication and Roles

- Student path:
  - Usually GitHub OAuth.
  - Can use seeded credentials in development.
- Faculty/Admin path:
  - Username/password (`/auth/login`) or Google OAuth callback.
  - Google flow auto-creates `faculty` users for `@scet.ac.in` emails.

Role guards are enforced in backend dependencies (`require_faculty`, `require_admin`).

## Submission Pipeline

1. Student starts a problem: backend creates private GitHub repo.
2. Student codes in that repository.
3. Student submits from UI.
4. API creates `Submission(status="pending")` and queues Celery task.
5. Worker fetches code and commit history from GitHub.
6. AI judge analyzes correctness, quality, and AI-likelihood signal.
7. Submission updated with score, status, and feedback.

Important: This judge is AI-analysis based and does not execute the code in a local sandbox.

## Testing

## Backend

```bash
cd backend
pytest
```

## Frontend

```bash
cd frontend
npm run lint
npm run test
```

## Useful Operations

```bash
# logs
docker-compose logs -f backend
docker-compose logs -f celery_worker

# restart core services
docker-compose restart backend frontend

# stop everything
docker-compose down
```

## Documentation Map

- User guide: `USER_MANUAL.md`
- Backend deep dive: `backend/Dev.md`
- Deployment specifics: `DEPLOYMENT.md`
- Product/design direction: `DESIGN_VISION.md`

## Troubleshooting

- Login fails after OAuth:
  - Verify callback URLs exactly match frontend routes.
  - Ensure client IDs/secrets are correctly set in environment.
- Submissions stay `pending`:
  - Celery worker is not running or cannot reach Redis.
- GitHub repo creation fails:
  - Ensure user logged in through GitHub and token encryption key (`FERNET_KEY`) is stable.
- AI judge returns error:
  - Check `GEMINI_API_KEY` and worker logs.
