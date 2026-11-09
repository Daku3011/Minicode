# MiniCode experience and deployment review

Reviewed 9 November 2026. Scope: `Daku3011/Minicode`; the separate landing-page repository is unchanged. This is a source/configuration review, not an inspection of production dashboards, secrets, database contents, or billing.

## Delivered

- A responsive home workspace with real account statistics, searchable tool discovery, category filters and faculty/admin shortcuts. Previously `/` immediately redirected to login.
- Shorter desktop navigation and a mobile home entry connecting to all tools. Existing routes remain available.
- Shared light/dark surface tokens, visible keyboard focus, skip navigation and reduced-motion support. The home and problem catalog use these tokens; older feature pages still have mixed hard-coded colors and need a separate visual pass.
- Server-side catalog filtering, stable sorting and bounded pagination. Previously browser search silently covered only the first 50 items, while the API loaded the whole accessible catalog to count it.
- SQL-level visibility filtering preserves faculty/admin access and student access through assigned cohort labs. Search escapes wildcard characters.
- Cancellable, debounced catalog requests; explicit loading, empty and retry states.
- Temporary account-fetch failures retain the authentication cookie and show a recovery action. Only an actual 401 clears the session. API calls now have a 90-second timeout to accommodate cold starts while bounding waiting.
- Lower database connection defaults (pool 2, overflow 1 per process), connection and pool timeouts, and reserved-character password encoding.
- Render blueprint uses one API worker and one Celery execution process by default. The migration command now exits after migrations instead of launching a permanent server.

## Hosting findings

| Layer | Finding | Required deployment check |
| --- | --- | --- |
| Vercel | Next.js uses `NEXT_PUBLIC_API_URL`; the fallback is localhost. | Set root directory to `frontend`, set the HTTPS Render API URL for production and previews, then rebuild. Never put DB credentials or private keys in `NEXT_PUBLIC_*`. |
| Render API | Free web services sleep after 15 idle minutes and can restart; startup can take around a minute. | Expect cold starts. Do not represent the service as always available or use browser polling to keep it awake. |
| Render jobs | The repo requires Celery plus Redis, and includes a separate Beat scheduler. `render.yaml` uses paid `starter` plans. | Verify that the worker is actually running. A free web API alone does not run queued submissions. Free background workers are unavailable; do not blindly apply the full blueprint expecting a zero-cost deployment. |
| Supabase | Every API/Celery process creates its own SQLAlchemy pool. | Budget `(pool_size + max_overflow) × processes` across all services. Start with the modest defaults and measure. Copy the connection string from Supabase Connect. |
| Connection mode | Render is a persistent backend, not a Vercel function. | Supabase recommends direct connections for reachable IPv6 backends or the session pooler for IPv4-only persistent backends. Transaction pooling has session-state limitations; retain it only after checking your workload. |
| OAuth / CORS | Callback origins and CORS must match the deployed frontend. | Check GitHub/Google callback URLs, exact `CORS_ORIGINS`, and stable shared `JWT_SECRET` / `FERNET_KEY` across API and workers. |
| Migrations | Startup still runs migration/seeding logic; paid blueprint also has a pre-deploy migration. | Test against a staging copy. Consolidating this into one explicit migration lifecycle is follow-up work, not a schema change in this PR. |

Sources checked: [Render free services](https://render.com/docs/free), [Render pre-deploy commands](https://render.com/docs/deploys), [Render worker limitations](https://render.com/docs/migrate-from-heroku), [Supabase connection guide](https://supabase.com/docs/guides/database/connecting-to-postgres).

## Remaining priorities

1. **Judge infrastructure:** confirm whether the current deployment has an active Celery worker, Redis broker and isolated execution support. Rendering a successful frontend does not prove submissions work. Exercise a real submission in staging before release.
2. **Security review:** the sample-testcase route is unauthenticated and falls back to returning all tests when none are marked sample. Audit private problem access and hidden-test disclosure before broadening usage. Production CORS currently falls back to `*` if unset; configure explicit origins.
3. **Deployment lifecycle:** migrations/seeding during every API startup can make cold starts slower. Move toward versioned, one-time migrations and explicit production seeding controls.
4. **Frontend consistency:** bring the remaining feature-specific screens onto shared tokens and common loading/error components. Verify faculty, alumni, contests and interview flows with real role-specific accounts.
5. **CI debt:** repository-wide ESLint and Ruff already contain extensive violations. Fix incrementally without disabling the rules. The existing card tests had outdated field/copy expectations and were corrected here.

## Release order

Deploy the backend first, then the frontend: older APIs ignore the new filtering parameters and would display incomplete results with the new browser. Run the test suite and production frontend build, then verify login, search beyond 50 records, assigned private labs, retry after an API outage, and a complete submission. Review Render plan settings before applying its blueprint. No production deployment, database migration, billing change or secret change was performed by this work.

## Validation

- Next.js production build and TypeScript check passed.
- Frontend: 4 tests passed, including discovery and recovery after a temporary account-fetch failure.
- Backend full run: 27 passed, 1 existing async test skipped; after adding the assigned-private-lab regression case, all 4 catalog tests passed.
- Repository-wide ESLint and Ruff checks remain failing on existing code debt; these are not claimed as green.
- Browser screenshots could not be verified: local Chromium startup is blocked by the execution environment. Responsive/dark-mode browser QA remains required before merging.
- No live OAuth, Supabase, Redis, AI judge, or Render/Vercel deployment was exercised.
