# MiniCode Backend Developer Guide

Comprehensive backend reference for maintaining and extending MiniCode.

## 1. Backend Purpose

Backend responsibilities:

- Authentication and role enforcement
- Problem, submission, and leaderboard APIs
- Event/news/notification APIs
- Async judging pipeline with Celery + Redis
- Persistence via SQLModel (PostgreSQL in Docker, SQLite/postgres locally)
- Code execution sandbox via Docker
- Real-time collaborative coding via WebSockets
- AI-powered features: judge, learning assistant, content generation
- Plugin system for extensibility

## 2. Technology Stack

- FastAPI
- SQLModel + SQLAlchemy engine management
- Celery + Redis
- PyGithub
- Google Gemini API (`google-genai`)
- JWT (`python-jose`) + password hashing (`passlib[bcrypt]`)
- Caching (`fastapi-cache2`)
- Security sanitization (`bleach`)
- Docker SDK for Python (sandbox execution)

## 3. Runtime Entry Points

- API app: `backend/main.py`
- DB engine/session: `backend/core/database.py`
- Auth primitives: `backend/services/auth.py`
- Celery worker app/tasks: `backend/worker.py`
- Judge logic: `backend/services/judge.py`
- Sandbox judge: `backend/services/sandbox_judge.py`

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

## 5. Database Model Map

### Core Tables (`core/models.py`)

- `User` — Auth identity, role, XP, levels, login activity
- `Problem` — Statement + metadata + unlock level + XP reward
- `TestCase` — Input/output pairs, sample visibility, optional LeetCode-style `explanation` shown with samples
- `Submission` — Repo, language, status, score, AI feedback
- `NewsItem` — Platform announcements
- `Notification` — Per-user notifications
- `QuestRewardClaim` — Quest/achievement XP tracking
- `CohortJoinRequest` — Student requests to join cohorts
- `Cohort` — Faculty-managed student groups
- `Lab` — Timed practice sessions within cohorts
- `Hackathon` — External hackathon listings
- `AlumniProfile` — Extended alumni information
- `AlumniNotification` — Alumni-specific notifications
- `ContactRequest` — Student-alumni messaging
- `Stream` — Learning path container
- `Milestone` — Individual step within a stream
- `UserMilestoneProgress` — Tracks user status per milestone

### Events (`core/models_events.py`)

- `Event` — Weekly challenges, team projects, announcements
- `EventParticipant` — Event join tracking with team info
- `TeamInvitation` — Team invitation system
- `EventSubmission` — Event-specific submission tracking

### Collaborative Coding (`core/models_collab.py`)

- `CollabSession` — Real-time collaborative coding session (id, title, problem_id, created_by, status, created_at)
- `CollabParticipant` — Participant in a collab session (id, session_id, user_id, role, joined_at, left_at)
- `CollabSessionSnapshot` — Periodic code state snapshot (id, session_id, code_content, snapshot_at)

### Discussion Forum (`core/models_discussion.py`)

- `DiscussionThread` — A discussion thread for a problem (id, problem_id, user_id, title, content, is_pinned, is_resolved, created_at, updated_at)
- `DiscussionReply` — Reply to a thread (id, thread_id, user_id, content, is_accepted_answer, created_at, updated_at)
- `DiscussionVote` — Upvote/downvote tracking (id, user_id, thread_id, reply_id, vote_type, created_at)

### Achievements & Streaks (`core/models_achievements.py`)

- `Badge` — Available achievement badges (id, name, slug, description, icon_url, category, criteria_json, xp_reward)
- `UserBadge` — Badges earned by users (id, user_id, badge_id, earned_at, displayed_on_profile)
- `Achievement` — In-progress achievement tracking (id, user_id, badge_id, progress, is_completed, completed_at)
- `UserStreak` — Streak tracking (id, user_id, streak_type, current_count, max_count, last_activity_date, updated_at)

### Contests (`core/models_contests.py`)

- `Contest` — Timed coding competition (id, title, description, start_time, end_time, registration_deadline, duration_minutes, problems_json, rules, scoring_type, status, created_by, created_at, updated_at)
- `ContestParticipant` — Contest registration (id, contest_id, user_id, score, rank, started_at, finished_at, registered_at)
- `ContestSubmission` — Per-problem contest submissions (id, contest_id, user_id, problem_index, submission_id, score, time_taken_seconds, submitted_at)
- `TeamProfile` — User's team formation preferences (id, user_id, preferred_roles_json, skill_tags_json, availability, looking_for_team, created_at, updated_at)
- `TeamFormationRequest` — Looking-for-team ads (id, creator_id, contest_id, description, required_roles_json, min_skill_level, status, created_at)
- `TeamFormationApplication` — Applications to join a team (id, request_id, user_id, message, status, created_at)

### Code Reviews (`core/models_review.py`)

- `CodeReview` — Code review record (id, submission_id, reviewer_id, status, overall_score, complexity_score, readability_score, comments_json, created_at, updated_at)
- `ReviewComment` — Inline code comments (id, review_id, file_path, line_start, line_end, comment, comment_type, resolved, created_at)
- `ReviewRequest` — Review request tracking (id, submission_id, requester_id, required_reviewers, status, created_at, completed_at)

### Plugin System (`core/models_plugin.py`)

- `Plugin` — Registered plugins (id, name, slug, description, version, type, config_schema_json, is_active, installed_at, updated_at)
- `PluginInstallation` — Per-user plugin installations (id, plugin_id, user_id, config_json, enabled, installed_at)

### Code Snippets (`core/models_snippets.py`)

- `CodeSnippet` — Reusable code snippets (id, user_id, title, description, language, code_content, tags_json, is_public, upvotes, downvotes, created_at, updated_at)
- `SnippetVote` — Snippet voting (id, snippet_id, user_id, vote_type, created_at)
- `SnippetComment` — Snippet discussion (id, snippet_id, user_id, content, created_at)

### Interviews (`core/models_interview.py`)

- `Interview` — Scheduled coding interview (id, creator_id, candidate_emails_json, problems_json, duration_minutes, scheduled_at, status, feedback, created_at)
- `InterviewSession` — Individual interview session (id, interview_id, candidate_id, start_time, end_time, status, recording_json, score)

### External Platforms (`core/models_external.py`)

- `ExternalPlatformLink` — Linked external judge accounts (id, user_id, platform, platform_username, profile_url, is_verified, synced_at, created_at)
- `ExternalSubmission` — Synced external submissions (id, user_id, platform, external_id, problem_name, problem_url, difficulty, language, status, score, submitted_at, synced_at)

## 6. Authentication and Authorization (`services/auth.py` + `routers/auth.py`)

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
  - `require_alumni` for alumni/faculty/admin

Google login rule:

- New users with `@scet.ac.in` are auto-created as faculty.

## 7. API Surface Overview

### Health

- `GET /`
- `GET /health`

### Auth

- `GET /auth/github/callback`
- `GET /auth/google/callback`
- `POST /auth/login`

### User/Profile

- `GET /user/me`
- `PUT /user/me/settings`
- `POST /user/send-verification-email` — Dynamically routes verification code to the provided email address
- `POST /user/verify-email`
- `GET /user/profile/email`

### Problems

- `GET /problems`
- `GET /problems/{problem_id}`
- `GET /problems/{problem_id}/testcases` — Sample cases incl. `explanation` field
- `POST /problems` (faculty/admin)
- `PUT /problems/{problem_id}` (owner/admin)
- `DELETE /problems/{problem_id}` (owner/admin)
- `POST /problems/{problem_id}/testcases` (owner/admin; accepts optional `explanation`)
- `POST /problems/generate-ai` (faculty/admin) — LeetCode-style statements: Overview, Understanding the Problem, worked Examples with Explanations, Approach Hints
- `POST /problems/improve-ai` (faculty/admin) — Expands short drafts into the same rich format

### Submissions

- `POST /problems/{problem_id}/start` — Provisions a private repo seeded with `solution.py` base file + README containing submission guidelines
- `POST /problems/{problem_id}/submit` — Language whitelist: `py, python, js, javascript, java, cpp, c, go, rs`; judge reads any single `solution.*` file at repo root
- `GET /submissions/{submission_id}`

### Leaderboard

- `GET /leaderboard`

### Faculty

- `GET /faculty/students`
- `GET /faculty/problems`
- `GET /faculty/analytics/{problem_id}`
- `GET /faculty/student/{username}`
- `POST /faculty/award-xp/{username}`
- `GET /faculty/dashboard-stats`

### Admin

- `GET /admin/stats`
- `GET /admin/users`
- `PUT /admin/users/{user_id}/role`
- `POST /admin/sync-all-xp`

### Roadmap (Learning Paths)

- `GET /roadmap/streams` — List all active streams (auto-seeds if empty)
- `GET /roadmap/streams/{id}` — Stream detail with milestone progress for user
- `POST /roadmap/milestones/{id}/start` — Start a milestone
- `POST /roadmap/milestones/{id}/submit` — Upload file for AI evaluation
- `POST /roadmap/milestones/{id}/learning-materials` — Generate personalized hints/resources via Gemini
- `POST /roadmap/streams/{id}/chat` — Stream-specific AI chatbot
- `POST /roadmap/milestones/{id}/subtask-toggle` — Toggle subtask completion
- `POST /roadmap/milestones/{id}/generate-subtasks` — AI subtask generation
- `GET /roadmap/progress` — Aggregate user progress across all milestones
- `GET /roadmap/seed` — (Re)seed stream and milestone data
- `GET /roadmap/seed-additional` — Incremental seeding for newly added streams without overwriting existing data

### Collaborative Coding

- `WS /ws/collab/{session_id}` — WebSocket for real-time collaborative editing
- `POST /collab/sessions` — Create a collab session
- `GET /collab/sessions` — List user's sessions
- `GET /collab/sessions/{id}` — Session details
- `POST /collab/sessions/{id}/join` — Join a session
- `POST /collab/sessions/{id}/leave` — Leave a session
- `DELETE /collab/sessions/{id}` — Delete a session
- `GET /collab/sessions/{id}/snapshots` — Get session snapshots

### Discussions

All discussion routes are nested under a problem: `/problems/{problem_id}/discussions`.
Thread/reply creation, updates and votes accept **JSON request bodies** (Pydantic models
`ThreadCreate`, `ThreadUpdate`, `ReplyCreate`, `ReplyUpdate`, `VoteInput`).

- `GET /problems/{id}/discussions?page=&per_page=&sort=` — List threads (`sort`: `top|unresolved|latest`)
- `POST /problems/{id}/discussions` — Create a thread (body: `{title, content}`)
- `GET /problems/{id}/discussions/{thread_id}` — Thread detail (increments view count)
- `PUT /problems/{id}/discussions/{thread_id}` — Update thread (body: `{title?, content?, is_resolved?}`)
- `DELETE /problems/{id}/discussions/{thread_id}` — Delete thread (author only)
- `GET /problems/{id}/discussions/{thread_id}/replies` — List replies (accepted answer first)
- `POST /problems/{id}/discussions/{thread_id}/replies` — Add reply (body: `{content, parent_id?}`)
- `PUT/DELETE /problems/{id}/discussions/{thread_id}/replies/{reply_id}` — Edit/delete reply
- `POST /problems/{id}/discussions/{thread_id}/replies/{reply_id}/accept` — Mark accepted answer (thread author)
- `POST /problems/{id}/discussions/{thread_id}/vote` — Vote on thread (body: `{vote_type: 1|-1}`, toggling removes)
- `POST /problems/{id}/discussions/{thread_id}/replies/{reply_id}/vote` — Vote on reply

### AI Teaching Assistant

- `POST /assistant/chat` — General programming Q&A with user context
- `POST /assistant/hint/{problem_id}` — Generate contextual hints
- `POST /assistant/explain/{submission_id}` — Explain submission failure
- Rate limit: 20 req/min per user

### Learning Dashboard

- `GET /learning/dashboard` — Full dashboard data
- `GET /learning/recommendations` — AI problem recommendations
- `GET /learning/weak-areas` — Weak topics analysis
- `GET /learning/stats` — Learning statistics
- `GET /learning/path` — Personalized learning path
- `GET /portfolio/{username}` — Portfolio data
- `GET /portfolio/{username}/public` — Public portfolio

### Achievements & Streaks

- `GET /achievements` — List all badges
- `GET /achievements/my` — Current user's badges
- `GET /achievements/user/{user_id}` — Another user's badges
- `POST /achievements/check` — Manually trigger badge check
- `GET /achievements/streaks` — Current user's streaks
- `POST /achievements/streaks/checkin` — Manual streak check-in

### Contests

- `POST /contests` — Create contest (faculty/admin)
- `GET /contests` — List contests with filters
- `GET /contests/{id}` — Contest details
- `POST /contests/{id}/register` — Register for contest
- `POST /contests/{id}/start` — Start your attempt
- `POST /contests/{id}/submit/{problem_index}` — Submit during contest
- `GET /contests/{id}/standings` — Live leaderboard
- `GET /contests/{id}/my-status` — Current user's contest status
- `POST /contests/{id}/end` — End contest (faculty)

### Team Formation

- `POST /team-formation/profile` — Set team formation profile
- `GET /team-formation/profile` — Get my profile
- `POST /team-formation/requests` — Create team request
- `GET /team-formation/requests` — List open requests
- `GET /team-formation/requests/{id}` — Request details
- `POST /team-formation/requests/{id}/apply` — Apply to a team
- `POST /team-formation/requests/{id}/applications/{app_id}/respond` — Accept/reject
- `GET /team-formation/match` — Smart match suggestions

### Code Reviews

- `POST /reviews/request` — Request code review
- `GET /reviews/pending` — Reviews assigned to me
- `GET /reviews/my-requests` — My review requests
- `POST /reviews/{id}/submit` — Submit review
- `GET /reviews/{id}` — Review details
- `POST /reviews/comments/{id}/resolve` — Resolve comment
- `GET /reviews/submission/{submission_id}` — Reviews for a submission

### Plugins

- `POST /plugins/install` — Install a plugin
- `GET /plugins` — List installed plugins
- `GET /plugins/{id}` — Plugin details
- `PUT /plugins/{id}/toggle` — Enable/disable plugin
- `DELETE /plugins/{id}` — Uninstall plugin
- `GET /plugins/marketplace` — Available plugins

### Code Snippets

- `POST /snippets` — Create snippet
- `GET /snippets` — List with search/filter/pagination
- `GET /snippets/{id}` — Snippet detail (includes comments with author names)
- `PUT /snippets/{id}` — Update snippet
- `DELETE /snippets/{id}` — Delete snippet
- `POST /snippets/{id}/vote` — Vote on snippet
- `POST /snippets/{id}/comment` — Comment on a snippet (body: `{content}`)
- `GET /snippets/trending` — Trending snippets
- `GET /snippets/my` — My snippets

### Interviews

- `POST /interviews` — Schedule interview (faculty)
- `GET /interviews` — List interviews
- `GET /interviews/{id}` — Interview details
- `POST /interviews/{id}/sessions` — Start candidate session
- `POST /interviews/sessions/{session_id}/code` — Submit code during session
- `GET /interviews/sessions/{session_id}` — Get session state
- `POST /interviews/sessions/{session_id}/end` — End session
- `POST /interviews/{id}/evaluate` — AI evaluation

### External Platforms

- `POST /external/link` — Link external platform account
- `GET /external/accounts` — List linked accounts
- `POST /external/sync` — Sync all platforms
- `GET /external/stats` — Cross-platform stats
- `DELETE /external/accounts/{id}` — Unlink account

### Sandbox Admin

- `GET /admin/sandbox/status` — Sandbox health check
- `POST /admin/sandbox/build` — Build all sandbox images
- `POST /admin/sandbox/build/{language}` — Build specific language image

### Events / News / Notifications

- Events: `/events/*` in `events.py`
- News: `/news/*` in `news.py`
- Notifications: `/notifications/*` in `notifications.py`
- Hackathons: `/hackathons/*` in `hackathons.py`
- Cohorts: `/cohorts/*` in `cohorts.py`
- Labs: `/labs/*` in `labs.py`
- Alumni: `/alumni/*` in `alumni.py`

## 8. Submission and Judge Pipeline

Trigger path:

1. `POST /problems/{id}/submit` creates `Submission(status="pending")`.
2. Router enqueues `process_submission_task.delay(submission.id)`.
3. Celery worker loads submission/user/problem/test cases.
4. `judge_submission(...)` fetches repository solution and commit history.
5. **Sandbox execution** (if available): Code runs in Docker container against test cases.
6. `run_ai_judge(...)` prompts Gemini for:
   - status
   - score
   - ai_probability (conservative, evidence-based: style alone is never sufficient; only >70 with concrete corroboration such as single-commit paste of a full solution or tool references in comments)
   - markdown feedback
7. Submission updated and committed.
8. XP and leaderboard cache are updated when accepted improvements occur.

Operational note:

- Judge performs both sandbox execution (actual test case results) AND AI-assisted analysis.
- If Docker sandbox is unavailable, falls back to AI-only evaluation.
- AI-detection note: the heuristic warning banner only appears when `ai_probability > 85`, and its wording is non-accusatory with an explicit disclaimer that faculty review is required — this avoids false-positive shaming of students who write clean, well-commented code.

### Sandbox Architecture (`backend/sandbox/`)

```
backend/sandbox/
├── runner.py               # Async Docker-based code runner
├── Dockerfile.python        # Python 3.11 sandbox image
├── Dockerfile.node          # Node.js 20 sandbox image
├── Dockerfile.java          # Java 21 sandbox image
└── sandbox_seccomp.json     # Seccomp security profile
```

Sandbox runner features:
- Language-specific Docker images with non-root users
- Resource limits: 256MB memory, 1 CPU, 30s timeout
- Seccomp syscall filtering for security
- Temporary file mounting for student code
- Structured results: passed/failed, output, errors, execution time

## 9. Services Overview

### Core Services

| Service | File | Responsibility |
|---------|------|---------------|
| Auth | `services/auth.py` | Password hashing, token management, OAuth, role guards |
| Judge | `services/judge.py` | AI code evaluation via Gemini |
| Sandbox Judge | `services/sandbox_judge.py` | Docker sandbox execution + AI quality feedback |
| AI Generator | `services/ai_generator.py` | AI content generation with model failover |
| Repo Manager | `services/repo_manager.py` | GitHub repo creation and file management |
| Sync XP | `services/sync_xp.py` | XP recalculation and level synchronization |
| Email | `services/email_service.py` | Email sending via Resend + SMTP fallback |
| Email Verification | `services/email_verification.py` | OTP-based email verification |
| WebSockets | `services/websockets_manager.py` | Redis pub/sub WebSocket event broadcasting |
| Admin Service | `services/admin.service.py` | Admin business logic |
| Collab Manager | `services/collab_manager.py` | Real-time collaborative editing rooms |

### New Feature Services

| Service | File | Responsibility |
|---------|------|---------------|
| Achievement Service | `services/achievement_service.py` | Badge checking/awarding, streak management |
| Review Service | `services/review_service.py` | Code review lifecycle management |
| Plugin Engine | `services/plugin_engine.py` | Plugin discovery, loading, hook system |
| Snippet Service | `services/snippet_service.py` | Snippet CRUD, search, voting |
| Contest Service | `services/contest_service.py` | Contest lifecycle, scoring, standings |
| Interview Service | `services/interview_service.py` | Interview scheduling, session management |
| Learning Service | `services/learning_service.py` | Weak area analysis, recommendations |
| Assistant Service | `services/assistant_service.py` | AI teaching assistant with conversation memory |
| External Judge Service | `services/external_judge_service.py` | Codeforces/LeetCode/HackerRank sync |

## 10. Plugin System (`services/plugin_engine.py`)

The plugin system provides a hook-based extension architecture:

### Base Plugin Class

```python
class BasePlugin:
    name: str
    version: str
    description: str
    
    def before_submission(self, submission, user, problem):
        pass
    
    def after_judge(self, submission, result):
        pass
    
    def on_problem_create(self, problem, user):
        pass
    
    def on_user_login(self, user):
        pass
```

### Hook Points

| Hook | Trigger | Parameters |
|------|---------|------------|
| `before_submission` | Before evaluation | submission, user, problem |
| `after_judge` | After evaluation | submission, result |
| `on_problem_create` | New problem created | problem, user |
| `on_user_login` | User logs in | user |

Plugins are loaded dynamically from `backend/plugins/` directory.

## 11. Achievement Triggers

The achievement service checks for badge eligibility on these triggers:

| Trigger | Badges Checked |
|---------|---------------|
| `problems_solved` | Problem Solver, Code Warrior, Marathon Runner |
| `first_submission` | First Blood |
| `speed_demon` | Speed Demon (≤10 min to solve) |
| `bug_hunter` | Bug Hunter (3+ submissions on same problem) |
| `perfect_score` | Perfect Score (100/100) |
| `join_cohort` | Social Butterfly |
| `level_reached` | Level Master (level ≥5) |
| `streak_milestone` | Streak King (30-day streak) |

## 12. Worker and Scheduled Tasks (`worker.py`)

Primary async task:

- `process_submission_task` for queued judging.

Periodic tasks via beat schedule:

| Task | Interval | Description |
|------|----------|-------------|
| `sync_xp_task` | 5 min | XP synchronization |
| `refresh_leaderboard_task` | 5 min | Leaderboard cache refresh |
| `send_inactive_reminders_task` | 24h | Engagement lure emails |
| `send_faculty_reports_task` | 7 days | Faculty weekly reports |

## 13. Environment Variables

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
- `RESEND_API_KEY`
- `ENVIRONMENT`
- `WEB_CONCURRENCY`

## 14. Development Commands

### API

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Worker

```bash
cd backend
source venv/bin/activate
celery -A worker.celery_app worker --loglevel=info
```

### Beat

```bash
cd backend
source venv/bin/activate
celery -A worker.celery_app beat --loglevel=info
```

### Tests

```bash
cd backend
pytest

# Run specific test file
pytest tests/test_sandbox.py -v
```

### Sandbox Images

```bash
# Build all sandbox images
python -c "from sandbox.runner import build_sandbox_images; import asyncio; asyncio.run(build_sandbox_images())"

# Or via API
curl -X POST http://localhost:8000/admin/sandbox/build
```

## 15. Safe Change Guidelines

- Preserve auth dependency boundaries (`get_current_user`, `require_faculty`, `require_admin`).
- When altering submission flow, update:
  - `routers/submissions.py`
  - `judge.py`
  - `worker.py`
  - `sandbox_judge.py` (if sandbox execution is involved)
- Keep repo naming contract aligned between submit and provisioning logic.
- If you add new statuses, update frontend mappings and analytics aggregations.
- Validate cache invalidation paths for leaderboard-impacting changes.
- When adding new models, import them in `scripts/migrate_db.py` for auto-table-creation.
- Plugin hook signatures must remain backward compatible.

## 16. Known Risks and Gotchas

- AI judging can be non-deterministic and occasionally incorrect.
- Token encryption depends on stable `FERNET_KEY` across restarts.
- Submissions remain pending if worker is down or broker unavailable.
- OAuth callback URL mismatch is a common integration failure.
- Sandbox requires Docker to be installed and running on the host.
- Plugin system loads arbitrary Python — only install trusted plugins.
- External API integrations depend on third-party API availability and rate limits.
- WebSocket collab sessions are in-memory — lost on server restart.
- Snippet search uses simple SQL LIKE queries (not full-text search).

## 17. Suggested Next Backend Improvements

- Add full-text search for snippets and discussions.
- Introduce explicit API versioning (`/api/v1`).
- Add structured audit logs for role changes and manual XP awards.
- Expand test coverage around events, async worker flows, and sandbox execution.
- Add rate limiting for sandbox execution to prevent abuse.
- Implement snippet forking/cloning from existing snippets.
- Add WebSocket authentication for collab sessions.
- Migrate in-memory collab rooms to Redis for horizontal scaling.
