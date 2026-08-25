# MiniCode — Architecture Review & Cost Optimization

> Reviewed: Aug 2026 · Current hosting: Backend on Render, DB on Supabase, Redis on Upstash, Frontend on Vercel

---

## 1. Current State

```
┌──────────────┐   HTTPS    ┌─────────────────┐    SQL    ┌──────────────────┐
│    Vercel    │ ────────▶  │     Render      │ ────────▶ │     Supabase     │
│  Next.js 16  │            │ FastAPI+Celery  │           │  PostgreSQL 15   │
│  (frontend)  │ ◀────────  │  gunicorn/uvicorn│ ◀─────── │  (free/managed)  │
└──────────────┘  REST/WS   └───────┬─────────┘  pool     └──────────────────┘
                                    │ broker/cache/pubsub
                            ┌───────▼─────────┐
                            │  Upstash Redis  │  ← metered PER COMMAND
                            │  500K cmds/mo   │
                            └─────────────────┘
```

## 2. Why Upstash quota burns out in ~1 week

Audit of every Redis touchpoint in the codebase, ordered by command cost:

| # | Consumer | Commands | Notes |
|---|----------|----------|-------|
| 1 | **Celery worker BRPOP polling** | 🔴 **~500K–1M+/day** | Kombu's Redis transport continuously `BRPOP`s each queue on every consumer connection. With concurrency 4 × several queues ≈ hundreds of thousands of blocked-poll commands/day *even when idle*. This alone exhausts the free tier. |
| 2 | Celery result backend | 🟠 High | Every task writes `SET/EXPIRE/PERSIST` results nobody reads (`process_submission_task.delay()` is fire-and-forget). |
| 3 | Celerybeat schedules | 🟡 Moderate | XP sync + leaderboard refresh every 5 min → task publish + result storage churn around the clock. |
| 4 | fastapi-cache2 (leaderboard GET) | 🟡 Low-Moderate | Cache key builder does a `GET` (version) + `GET` (entry) + `SET` per request window; scales with traffic. |
| 5 | Leaderboard invalidation | 🟢 Low | One `INCR` per accepted submission. |
| 6 | WebSocket pub/sub | 🟢 Low | One subscription; messages only on submissions. |

**Root cause: Celery's default transport design assumes a self-hosted Redis with unlimited commands. It is fundamentally mismatched with per-command billing.**

---

## 3. Options

| Option | Cost | Effort | Verdict |
|--------|------|--------|---------|
| **A. Render Key Value** (Redis-compatible, same platform as backend) | Free tier: 25 MB, **no command limits**, private networking | Zero code changes — swap `REDIS_URL` | ✅ **Recommended now.** Usage data is tiny (<1 MB); command count stops mattering entirely. Lower latency too (same network as API). |
| B. Keep Upstash + heavy tuning | Free | Done in this release (see §4) | Cuts usage ~95%+, but polling still leaks commands when idle. Fine as a stopgap. |
| C. Drop Celery → Postgres-backed job table polled by an asyncio worker inside the API process | Free | Medium (1–2 days) | Best long-term for this scale: one less service, Supabase already paid for. Judging is I/O-bound AI calls, fits an in-process queue. |
| D. Self-hosted Redis/Valkey on a small VPS ($5/mo) | $5/mo + ops burden | Low | Only worth it if consolidating other services onto the VPS too. |
| E. Railway/Fly managed Redis | ~$5/mo | Zero | No command limits but adds cross-cloud latency and another bill. |

### Recommendation
1. **Now:** switch `REDIS_URL` to Render Key Value (Option A) and deploy the tuning from §4 regardless.
2. **Next quarter (optional):** Option C to remove the Redis dependency completely.

---

## 4. Command-usage fixes shipped in this release

| Change | File | Effect |
|--------|------|--------|
| Broker viscous polling: `BRPOP` every 5 s instead of continuously (`CELERY_POLLING_INTERVAL`) | `worker.py` | Idle polling ↓ ~99 % (the #1 burner) |
| Result backend disabled by default (`task_ignore_result=True`; opt-in via `CELERY_RESULT_BACKEND`) | `worker.py` | Eliminates SET/EXPIRE/GET per task |
| Worker concurrency default 4 → 1 (`CELERY_CONCURRENCY`) | `start.sh` | 4× fewer consumer connections polling |
| Beat schedules relaxed: leaderboard refresh 5→15 min, XP sweep 5→30 min (env-tunable) | `worker.py` | Background task churn ↓ ~83 % |
| `CACHE_BACKEND=memory` option to bypass Redis for HTTP caching | `main.py` | Optional zero-Redis mode for cache |

With these, even staying on Upstash should fit comfortably in the free tier (~<50K cmds/month at current scale).

---

## 5. Database (Supabase) findings & fixes

| Finding | Risk | Fix |
|---------|------|-----|
| SQLAlchemy pool `10+20 overflow` per process × 3 processes = up to **90 connections** vs Supabase caps (~60 direct) | "too many connections" errors under load | Pool defaults lowered to `5+5` (env-tunable `DB_POOL_SIZE`, `DB_MAX_OVERFLOW`) |
| Direct (port 5432) URL likely used app-wide | Connection exhaustion; IPv6/add-on issues | Use the **Supavisor transaction pooler** URL (port 6543, username `postgres.<project-ref>`) for the app; keep direct URL only for migrations |
| Free-tier projects pause after ~1 week of inactivity | Outages | Keep the Render cron pinging `/ping`, or upgrade to Supabase Pro |

---

## 6. Other architecture observations (roadmap)

1. **Single point of coupling:** judging depends on Gemini/provider availability — already mitigated by the multi-provider failover layer.
2. **Gunicorn startup kills:** fixed earlier via `--timeout 180`. Startup migrations take 30–50 s; consider moving migrations to the release step (Render pre-deploy command) so boot is instant.
3. **WebSocket scaling:** pub/sub via Redis only matters with >1 API instance. On a single instance, an in-process asyncio broadcast would remove that dependency (pair well with Option C).
4. **Observability gaps:** no APM/error tracking. Add Sentry (free tier) to backend + frontend; log-based alerting on Render.
5. **Backups:** rely on Supabase PITR/backups on paid tier; export periodic dumps to object storage on free tier.
6. **Secrets:** ensure `FERNET_KEY` and `JWT_SECRET` are set once and never rotated casually (FERNET_KEY rotation invalidates all stored GitHub tokens).

---

## 7. Environment variables added

| Variable | Default | Purpose |
|----------|---------|---------|
| `CELERY_POLLING_INTERVAL` | `5` | Seconds between broker polls (raise to save commands) |
| `CELERY_VISIBILITY_TIMEOUT` | `3600` | Task visibility timeout |
| `CELERY_RESULT_BACKEND` | *(unset = disabled)* | Enable only if you actually read task results |
| `CELERY_CONCURRENCY` | `1` | Worker processes |
| `SYNC_XP_INTERVAL_SECONDS` | `1800` | Periodic XP sweep interval |
| `LEADERBOARD_REFRESH_INTERVAL_SECONDS` | `900` | Leaderboard backstop refresh |
| `CACHE_BACKEND` | `auto` | `auto` \| `redis` \| `memory` |
| `DB_POOL_SIZE` / `DB_MAX_OVERFLOW` / `DB_POOL_RECYCLE` | `5` / `5` / `300` | SQLAlchemy pool tuning |
