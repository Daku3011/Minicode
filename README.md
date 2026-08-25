# MiniCode

<div align="center">

![MiniCode](https://img.shields.io/badge/MiniCode-v2.0-8B5CF6?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)

**The Modern Coding Arena for Colleges & Clubs**

A full-stack coding arena that combines real GitHub workflows with an AI-powered judge, role-based learning paths, live events, XP progression, and faculty/admin operations.

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Documentation](#documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Overview

MiniCode transforms competitive programming from a cold, intimidating terminal experience into an engaging, gamified learning journey. Built for:

- **Students** who want to practice coding with real GitHub workflows
- **Clubs** that run hackathons and coding events
- **Faculty** who need analytics and student tracking
- **Admins** who manage the platform

### What Makes MiniCode Different

| Traditional Judges | MiniCode |
|-------------------|----------|
| Raw terminal aesthetics | Modern SaaS UI with animations |
| Fear-based feedback | AI Mentor that empowers |
| Solo practice | Real GitHub workflow integration |
| Static problems | Dynamic events & team collaboration |
| Mysterious scoring | Transparent XP & level progression |

---

## Features

### Core Features

- [x] **GitHub-Native Workflow** - Students code in their own private repositories
- [x] **AI-Powered Judge** - Gemini-powered code evaluation with detailed feedback
- [x] **Role-Based Access** - Student, Faculty, and Admin roles with distinct workflows
- [x] **XP & Levels** - Gamified progression system with leaderboards
- [x] **Learning Paths (Roadmaps)** - Curated streams (Cybersecurity, AI/ML, Web Dev, Data Science, Cloud & DevOps, Mobile Development, Blockchain, System Design, Open Source) with milestone-based progression
- [x] **Dynamic Milestone Generation** - New milestones auto-created by AI as you complete them
- [x] **AI Stream Chatbot** - Per-stream assistant answering questions about that learning path
- [x] **AI-Generated Learning Materials** - Personalized hints and resources for each milestone
- [x] **Events System** - Hackathons, contests, and team collaboration
- [x] **Real-time Updates** - WebSocket-powered submission status
- [x] **AI Plagiarism Detection** - Conservative, evidence-based screening of AI-generated submissions (style alone never flags a student; high-confidence findings route to faculty review)
- [x] **Mobile Support** - Fully responsive browsing on phones (problems, events, hackathons, leaderboards, profile); submissions are desktop-only by design
- [x] **Cohorts & Labs** - Organized student groups for faculty management
- [x] **Dynamic Email Verification** - Secure student email verification flow correctly routing codes to users
- [x] **CI/CD Pipeline** - Automated testing, linting, and deployment via GitHub Actions
- [x] **Code Execution Sandbox** - Isolated Docker-based execution for Python, Node.js, and Java with seccomp security profiles
- [x] **Collaborative Coding** - Real-time collaborative sessions with WebSocket-based synchronization
- [x] **Discussion Forum** - Per-problem threaded discussions with voting, accepted answers and markdown support (linked from every problem page)
- [x] **AI Chatbot Assistant** - Platform-wide AI assistant for coding help, hints, and explanations
- [x] **Achievements & Badges** - Gamified achievement system with unlockable badges and progress tracking
- [x] **Streaks** - Daily login streaks with motivational tracking and rewards
- [x] **Contests** - Timed coding competitions with live leaderboards and auto-scoring
- [x] **Team Formation** - Matchmaking system for finding coding partners and forming teams
- [x] **Code Reviews** - Peer code review system with inline comments and approval workflow
- [x] **Plugin System** - Extensible plugin architecture for custom functionality
- [x] **Code Snippets** - Reusable code snippet library with search, voting and comments
- [x] **Learning Dashboard** - Personalized recommendations and weak area analysis
- [x] **Interview Mode** - Simulated technical interview environment with timed sessions
- [x] **Portfolio Pages** - Public portfolio profiles with XP charts and activity heatmaps
- [x] **External Judges** - Import and sync submissions from LeetCode, Codeforces, and CodeChef
- [x] **Dark Mode** - System-aware dark mode with toggle support

### Authentication

- **GitHub OAuth** - Primary student login
- **Google OAuth** - Faculty/Admin institutional login (`@scet.ac.in` auto-faculty)
- **Username/Password** - Development and fallback

### For Faculty

- Problem creation with AI generation assistance — produces LeetCode-style statements (Overview, Understanding the Problem, worked Examples with Explanations, Approach Hints)
- Sample test cases support per-example explanations shown to students
- Student analytics and submission tracking
- XP awarding and progress monitoring
- Event management
- Cohort and lab organization

### Submission Guidelines (shown on every problem)

- All languages accepted: Python, C++, C, Java, JavaScript, Go, Rust
- Workspaces start with a base `solution.py` — rename the extension to match your language (`solution.cpp`, `solution.java`, …); the judge reads any single `solution.*` file at the repo root
- Seeded repo READMEs include the language/filename table, git command notes and fair-play rules
- Use AI minimally; submissions are screened and commit history is part of the evaluation

### For Admins

- User role management
- Global system statistics
- XP synchronization
- Platform configuration

---

## Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                             MINICODE STACK                            │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐        ┌──────────────────────────────────────────┐ │
│  │              │        │                                          │ │
│  │   Student    │───────▶│           FRONTEND                       │ │
│  │   Browser    │        │     Next.js 16 + React 19                │ │
│  │              │        │     - App Router                         │ │
│  └──────────────┘        │     - Tailwind CSS                       │ │
│                          │     - Real-time WebSockets               │ │
│                          └─────────────────┬────────────────────────┘ │
│                                            │                          │
│                          ┌─────────────────▼────────────────────────┐ │
│                          │                                          │ │
│                          │          BACKEND API                     │ │
│                          │     FastAPI + SQLModel                   │ │
│                          │     - REST Endpoints                     │ │
│                          │     - Auth Middleware                    │ │
│                          │     - Rate Limiting                      │ │
│                          └──────────────┬───────────────────────────┘ │
│                                         │                             │
│     ┌─────────────────────────────────────────────────────────────────┤
│     │                    │                         │                  │
│     ▼                    ▼                         ▼                  │
│  ┌──────────┐     ┌──────────┐             ┌──────────────┐           │
│  │          │     │          │             │              │           │
│  │  Redis   │     │PostgreSQL│             │  GitHub API  │           │
│  │ (Cache + │◀───▶│ (Data)   │             │  (OAuth +    │           │
│  │  Broker) │     │          │             │    Repos)    │           │
│  └────┬─────┘     └──────────┘             └────────┬─────┘           │
│       │                                             │                 │
│       ▼                                             │                 │
│  ┌──────────────┐                                   │                 │
│  │              │                                   │                 │
│  │     Celery   │◀──────────────────────────────────┘                 │
│  │     Worker   │                                                     │
│  │    (Judge)   │         ┌──────────────────────────┐                │
│  └────┬─────────┘         │                          │                │
│       │                   │         Gemini AI        │                │
│       └──────────────────▶│        (AI Judge)        │                │
│                           │                          │                │
│                           └──────────────────────────┘                │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js | 16+ |
| **UI Framework** | React | 19 |
| **Styling** | Tailwind CSS | 4+ |
| **Backend** | FastAPI | 0.115+ |
| **Database** | SQLModel + PostgreSQL | 15 |
| **Cache/Broker** | Redis + Celery | 5.4+ |
| **AI Judge** | Multi-provider (OpenRouter / NVIDIA NIM / OpenCode Zen / Gemini) | Free-tier friendly, auto-failover |
| **Auth** | JWT + OAuth2 | - |
| **Container** | Docker | 24+ |
| **Sandbox** | Docker + seccomp | Python/Node/Java |
| **CI/CD** | GitHub Actions | Auto-test + lint |
| **WebSocket** | FastAPI WebSockets | Real-time collab |
| **Plugin Engine** | Python import hook | Extensible modules |

### Repository Structure

```
Minicode/
├── frontend/                  # Next.js application
│   ├── src/
│   │   ├── app/            # App Router pages (roadmap, faq, terms, privacy, problems, events, contests, interviews, ...)
│   │   ├── components/      # React components (AchievementBadge, ChatAssistant, CodeReviewPanel, ...)
│   │   ├── contexts/       # React contexts (ThemeContext, AuthContext)
│   │   ├── lib/           # Utilities & API wrappers
│   │   └── styles/        # Global styles
│   └── public/            # Static assets
├── backend/                 # FastAPI application
│   ├── routers/           # API route handlers (problems, contests, collab, reviews, plugins, ...)
│   ├── core/              # Database & SQLModel definitions (models for all features)
│   ├── services/          # Business logic (auth, judge, sandbox, collab_manager, achievement_service, ...)
│   ├── sandbox/           # Code execution sandbox (runner.py, Dockerfiles, seccomp profile)
│   ├── plugins/           # Plugin system (extensible via Python import hooks)
│   ├── utils/             # Shared utilities (caching, sandbox helpers)
│   ├── worker.py          # Celery worker
│   └── scripts/          # DB migration & seeding
├── Docs/                    # Documentation (USER_MANUAL, DEPLOYMENT, DESIGN_VISION, ...)
├── .github/workflows/      # GitHub Actions CI/CD pipeline
├── docker-compose.yml       # Full local stack
├── .env.example         # Environment template
└── README.md            # This file
```

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- GitHub OAuth App credentials
- Google OAuth credentials (optional for faculty)
- Gemini API key

### 1. Clone & Configure

```bash
git clone https://github.com/your-repo/Minicode.git
cd Minicode
cp .env.example .env
```

### 2. Set Environment Variables

Edit `.env` with your credentials:

```env
# Essential
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret

# Security (generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
FERNET_KEY=your_fernet_key

# Optional
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Start the Stack

```bash
docker-compose up -d --build
```

Access points:
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

### 4. Development Accounts

Seed data provides:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Faculty | faculty | faculty123 |
| Student | student | student123 |

---

## Environment Variables

### Essential

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `CELERY_BROKER_URL` | Celery broker URL | `redis://...` |
| `GITHUB_CLIENT_ID` | GitHub OAuth App ID | `Iv1.xxx` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Secret | `xxx` |
| `GEMINI_API_KEY` | Google AI API Key | `AIza.xxx` |
| `JWT_SECRET` | JWT signing secret (32+ bytes) | `hex-encoded` |
| `FERNET_KEY` | Token encryption key | `FernetKey` |

### Optional

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth App ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth App Secret |
| `CORS_ORIGINS` | Allowed frontend origins |
| `FRONTEND_API_URL` | Backend URL for frontend |
| `RESEND_API_KEY` | Email provider API key |
| `SMTP_EMAIL` / `SMTP_PASSWORD` | SMTP fallback credentials |

### AI Providers (pick any — first configured wins, with automatic failover)

| Variable | Description |
|----------|-------------|
| `AI_PROVIDER_ORDER` | Priority order, default `openrouter,nvidia,zen,gemini` |
| `OPENROUTER_API_KEY` | [OpenRouter](https://openrouter.ai/keys) — free-tier models (`deepseek-chat-v3:free`, `llama-3.3-70b:free`, …) |
| `OPENROUTER_MODELS` | Comma-separated model list override |
| `NVIDIA_API_KEY` | [NVIDIA NIM](https://build.nvidia.com) — free credits, very fast (`meta/llama-3.3-70b-instruct`, …) |
| `NVIDIA_MODELS` | Comma-separated model list override |
| `ZEN_API_KEY` | [OpenCode Zen](https://opencode.ai/zen) — code-focused gateway |
| `ZEN_BASE_URL` / `ZEN_MODELS` | Zen gateway overrides (default `https://opencode.ai/zen/v1`, `grok-code`) |
| `GEMINI_API_KEY` | Google Gemini — kept as fallback provider |
| `GEMINI_MODELS` | Default `gemini-2.5-flash,gemini-2.0-flash` |

> **Recommendation:** Set `OPENROUTER_API_KEY` + `NVIDIA_API_KEY` together — OpenRouter's free models handle day-to-day load and NVIDIA NIM absorbs spikes; Gemini remains a last-resort fallback if already configured.

---

## Documentation

| Document | Description |
|----------|-------------|
| [API Reference](http://localhost:8000/docs) | Interactive Swagger/OpenAPI documentation (auto-generated) |
| [USER_MANUAL.md](./Docs/USER_MANUAL.md) | Complete user guide by role |
| [backend/Dev.md](./backend/Dev.md) | Backend developer reference (models, APIs, sandbox, plugins) |
| [DEPLOYMENT.md](./Docs/DEPLOYMENT.md) | Deployment guide |
| [DESIGN_VISION.md](./Docs/DESIGN_VISION.md) | UI/UX design philosophy |
| [UI_Blueprint.md](./Docs/UI_Blueprint.md) | Detailed site map and component inventory |

---

## Submission Pipeline

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Start     │───▶│    Code     │───▶│   Submit    │───▶│   Pending   │
│  Problem    │    │   Locally   │    │   Code      │    │   Queue     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────┬───────┘
                                                                │
         ┌──────────────────────────────────────────────────────┘
         ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Fetch     │───▶│   Sandbox   │───▶│   AI Judge  │───▶│   Update    │
│  from GitHub│    │  Execution   │    │  (Gemini)   │    │  & Score    │
└─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                 │
                                                          ┌──────▼──────┐
                                                          │   Notify    │
                                                          │ (WebSocket) │
                                                          └─────────────┘
```

1. **Start Problem** - Creates private GitHub repository
2. **Code Locally** - Student writes solution with Git commits
3. **Submit** - Triggers async evaluation pipeline
4. **Pending** - Celery worker picks up task
5. **Fetch** - Worker retrieves code from GitHub
6. **Sandbox Execution** - Runs code in isolated Docker container with seccomp security (Python/Node/Java)
7. **AI Judge** - Gemini analyzes code, test results, and provides detailed feedback
8. **Update** - Stores score, feedback, XP, achievements, and streak
9. **Notify** - Real-time WebSocket and Redis pub/sub update to UI

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|---------|
| OAuth login fails | Verify callback URLs match frontend origin |
| Submissions stuck pending | Check Celery worker and Redis |
| Repo creation fails | Ensure FERNET_KEY is stable |
| AI judge error | Verify GEMINI_API_KEY and quota |
| WebSocket disconnect | Check Redis connectivity |
| Can't submit from phone | By design — mobile is view-only (browse problems/events/hackathons/profile); submissions require a desktop browser (≥1024px) |
| Judge says `solution.*` not found | Ensure exactly one `solution.<ext>` file exists at the repo root with the correct extension for your language |
| Upstash command quota exhausted | Switch `REDIS_URL` to Render Key Value (free, no per-command billing) and set `CACHE_BACKEND=memory`; see [ARCHITECTURE.md](./Docs/ARCHITECTURE.md) |
| Too many DB connections | Use the Supabase Supavisor pooler URL (port 6543) and lower `DB_POOL_SIZE`/`DB_MAX_OVERFLOW` |

---

## Production Hosting

Current production layout: **Vercel** (frontend) · **Render** (API + Celery worker) · **Supabase** (Postgres) · **Redis** (Render Key Value recommended over command-metered Upstash — free tier has no command limits).

See **[Docs/ARCHITECTURE.md](./Docs/ARCHITECTURE.md)** for the full architecture review: Redis command audit, provider comparison, connection-pool tuning, cost options and the improvement roadmap.

### Debug Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f celery_worker

# Restart services
docker-compose restart backend frontend

# Check health
curl http://localhost:8000/health
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<div align="center">

**Built with passion for the next generation of developers**


</div>