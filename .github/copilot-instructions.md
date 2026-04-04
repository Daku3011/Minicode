# Project Guidelines

## Code Style
- Follow existing patterns in each area instead of introducing new structure.
- Backend uses FastAPI + SQLModel patterns from `backend/main.py`, `backend/models.py`, and `backend/auth.py`.
- Frontend uses Next.js App Router + TypeScript patterns from `frontend/src/app`, reusable components in `frontend/src/components`, and API access in `frontend/src/lib/api.ts`.
- Keep changes focused and avoid broad refactors unless requested.

## Architecture
- This repo is split into:
  - `frontend/`: Next.js UI, auth context, and page routes.
  - `backend/`: FastAPI API, auth, judging, events, and persistence.
  - `backend/worker.py`: Celery worker for asynchronous submission processing.
- Submission flow depends on coordinated behavior across `backend/main.py`, `backend/repo_manager.py`, `backend/judge.py`, and `backend/worker.py`.

## Build and Test
- Frontend setup and dev:
  - `cd frontend && npm install`
  - `cd frontend && npm run dev`
- Frontend quality checks:
  - `cd frontend && npm run lint`
  - `cd frontend && npm run test`
- Backend setup and dev:
  - `cd backend && pip install -r requirements.txt`
  - `cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000`
- Backend tests:
  - `cd backend && pytest`
- Worker process (when touching async judging):
  - `cd backend && celery -A worker.celery_app worker --loglevel=info`
- Full stack containerized run:
  - `docker-compose up -d --build`

## Conventions
- Keep backend authorization rules explicit through dependency helpers in `backend/auth.py` (`require_faculty`, `require_admin`).
- When changing repository provisioning logic, keep naming behavior consistent across `backend/main.py` and `backend/repo_manager.py`.
- The judge in `backend/judge.py` is AI-analysis based; do not assume local code execution semantics unless explicitly added.
- Add or update tests with behavior changes:
  - Backend tests in `backend/tests/`
  - Frontend tests in `frontend/__tests__/`

## Documentation Links
- Backend implementation details and gotchas: `backend/Dev.md`
- Product overview and architecture: `README.md`
- UI and design direction: `DESIGN_VISION.md`
- Deployment guides: `DEPLOYMENT.md` and `RAILWAY_DEPLOYMENT.md`