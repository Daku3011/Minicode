# MiniCode Backend Developer Guide

Comprehensive backend reference for maintaining and extending MiniCode.

## 1. Backend Purpose

Backend responsibilities:

- Authentication and role enforcement
- Problem, submission, and leaderboard APIs
- Event/news/notification APIs
- Async judging pipeline with Celery + Redis
- Persistence via SQLModel (PostgreSQL in Docker, SQLite/postgres locally)

## 2. Technology Stack

- FastAPI
- SQLModel + SQLAlchemy engine management
- Celery + Redis
- PyGithub
- Google Gemini API (`google-genai`)
- JWT (`python-jose`) + password hashing (`passlib[bcrypt]`)
- Caching (`fastapi-cache2`)
- Security sanitization (`bleach`)

## 3. Runtime Entry Points

- API app: `backend/main.py`
- DB engine/session: `backend/database.py`
- Auth primitives: `backend/auth.py`
- Celery worker app/tasks: `backend/worker.py`
- Judge logic: `backend/judge.py`

## 4. Startup Lifecycle (`main.py`)

On app startup (`lifespan`):

1. Runs migrations (`scripts.migrate_db.run_migrations`).
2. Runs seeding (`scripts.seed_db.seed_database`) if applicable.
3. Initializes cache:
   - Redis backend if `REDIS_URL` reachable.
   - In-memory fallback otherwise.

Middlewares and security:

- Security headers middleware (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, HSTS non-local).
- CORS from `CORS_ORIGINS` env.
- SlowAPI limiter configured globally.

## 5. Database Model Map (`models.py`)

Core tables:

- `User`
  - Auth identity, role, XP, levels, login activity
- `Problem`
  - Statement + metadata + unlock level + XP reward
- `TestCase`
  - Input/output pairs, sample visibility
- `Submission`
  - Repo, language, status, score, AI feedback

Additional feature tables:

- `NewsItem`
- `Notification`
- Event models are in `models_events.py`:
  - `Event`, `EventParticipant`, `EventSubmission`, `TeamInvitation`

## 6. Authentication and Authorization (`auth.py` + `routers/auth.py`)

Supported auth flows:

- GitHub OAuth callback: `GET /auth/github/callback`
- Google OAuth callback: `GET /auth/google/callback`
- Username/password login: `POST /auth/login`

Important implementation details:

- JWT includes `sub` and `exp`.
- Default expiry is one week via `ACCESS_TOKEN_EXPIRE_MINUTES`.
- GitHub access tokens are encrypted at rest using `FERNET_KEY`.
- `get_current_user` resolves bearer token to `User`.
- Role guards:
  - `require_faculty` for faculty/admin
  - `require_admin` for admin-only

Google login rule:

- New users with `@scet.ac.in` are auto-created as faculty.

## 7. API Surface Overview

## Health

- `GET /`
- `GET /health`

## Auth

- `GET /auth/github/callback`
- `GET /auth/google/callback`
- `POST /auth/login`

## User/Profile

- `GET /user/me`
- `PUT /user/me/settings`
- `POST /user/send-verification-email`
- `POST /user/verify-email`
- `GET /user/profile/email`

## Problems

- `GET /problems`
- `GET /problems/{problem_id}`
- `GET /problems/{problem_id}/testcases`
- `POST /problems` (faculty/admin)
- `PUT /problems/{problem_id}` (owner/admin)
- `DELETE /problems/{problem_id}` (owner/admin)
- `POST /problems/{problem_id}/testcases` (owner/admin)
- `POST /problems/generate-ai` (faculty/admin)

## Submissions

- `POST /problems/{problem_id}/start`
- `POST /problems/{problem_id}/submit`
- `GET /submissions/{submission_id}`

## Leaderboard

- `GET /leaderboard`

## Faculty

- `GET /faculty/students`
- `GET /faculty/problems`
- `GET /faculty/analytics/{problem_id}`
- `GET /faculty/student/{username}`
- `POST /faculty/award-xp/{username}`
- `GET /faculty/dashboard-stats`

## Admin

- `GET /admin/stats`
- `GET /admin/users`
- `PUT /admin/users/{user_id}/role`
- `POST /admin/sync-all-xp`

## Events / News / Notifications

- Events: `/events/*` in `events.py`
- News: `/news/*` in `news.py`
- Notifications: `/notifications/*` in `notifications.py`

## 8. Submission and Judge Pipeline

Trigger path:

1. `POST /problems/{id}/submit` creates `Submission(status="pending")`.
2. Router enqueues `process_submission_task.delay(submission.id)`.
3. Celery worker loads submission/user/problem/test cases.
4. `judge_submission(...)` fetches repository solution and commit history.
5. `run_ai_judge(...)` prompts Gemini for:
   - status
   - score
   - ai_probability
   - markdown feedback
6. Submission updated and committed.
7. XP and leaderboard cache are updated when accepted improvements occur.

Operational note:

- Judge performs AI-assisted analysis and does not execute code in sandbox.

## 9. Repository Provisioning (`repo_manager.py`)

`create_student_repo`:

- Creates private GitHub repository for student/problem pair.
- Initializes README with problem description.
- Creates starter `solution.py`.
- If already exists, returns existing repository URL.

Naming convention:

- `minicode-{username}-{problem-title-slug}`

Keep this naming logic consistent with submission/judge flow.

## 10. Worker and Scheduled Tasks (`worker.py`)

Primary async task:

- `process_submission_task` for queued judging.

Periodic tasks via beat schedule:

- XP synchronization (`sync_xp_task`)
- Leaderboard refresh (`refresh_leaderboard_task`)
- Inactive reminder emails (`send_inactive_reminders_task`)
- Faculty reports (`send_faculty_reports_task`)

## 11. Environment Variables

Backend expects:

- `DATABASE_URL`
- `REDIS_URL`
- `CELERY_BROKER_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GEMINI_API_KEY`
- `JWT_SECRET`
- `FERNET_KEY`
- `CORS_ORIGINS`
- `SMTP_EMAIL`
- `SMTP_PASSWORD`

## 12. Development Commands

## API

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Worker

```bash
cd backend
source venv/bin/activate
celery -A worker.celery_app worker --loglevel=info
```

## Beat

```bash
cd backend
source venv/bin/activate
celery -A worker.celery_app beat --loglevel=info
```

## Tests

```bash
cd backend
pytest
```

## 13. Safe Change Guidelines

- Preserve auth dependency boundaries (`get_current_user`, `require_faculty`, `require_admin`).
- When altering submission flow, update:
  - `routers/submissions.py`
  - `judge.py`
  - `worker.py`
- Keep repo naming contract aligned between submit and provisioning logic.
- If you add new statuses, update frontend mappings and analytics aggregations.
- Validate cache invalidation paths for leaderboard-impacting changes.

## 14. Known Risks and Gotchas

- AI judging can be non-deterministic and occasionally incorrect.
- Token encryption depends on stable `FERNET_KEY` across restarts.
- Submissions remain pending if worker is down or broker unavailable.
- OAuth callback URL mismatch is a common integration failure.
- `faculty/dashboard-stats` accepted-count query currently checks `"Accepted"` (capitalized), while submission status values are usually lowercase (`"accepted"`).

## 15. Suggested Next Backend Improvements

- Add deterministic sandbox execution for correctness baseline.
- Introduce explicit API versioning (`/api/v1`).
- Add structured audit logs for role changes and manual XP awards.
- Expand test coverage around events and async worker flows.
