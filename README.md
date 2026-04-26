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
- [x] **Events System** - Hackathons, contests, and team collaboration
- [x] **Real-time Updates** - WebSocket-powered submission status
- [x] **AI Plagiarism Detection** - Identifies AI-generated submissions
- [x] **Cohorts & Labs** - Organized student groups for faculty management

### Authentication

- **GitHub OAuth** - Primary student login
- **Google OAuth** - Faculty/Admin institutional login (`@scet.ac.in` auto-faculty)
- **Username/Password** - Development and fallback

### For Faculty

- Problem creation with AI generation assistance
- Student analytics and submission tracking
- XP awarding and progress monitoring
- Event management
- Cohort and lab organization

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
| **Frontend** | Next.js | 15+ |
| **UI Framework** | React | 19 |
| **Styling** | Tailwind CSS | 3.4+ |
| **Backend** | FastAPI | 0.100+ |
| **Database** | SQLModel + PostgreSQL | 15 |
| **Cache/Broker** | Redis + Celery | 7+ |
| **AI Judge** | Google Gemini | 2.5 |
| **Auth** | JWT + OAuth2 | - |
| **Container** | Docker | 24+ |

### Repository Structure

```
Minicode/
├── frontend/                  # Next.js application
│   ├── src/
│   │   ├── app/            # App Router pages
│   │   ├── components/      # React components
│   │   ├── lib/           # Utilities
│   │   └── styles/        # Global styles
│   └── public/            # Static assets
├── backend/                 # FastAPI application
│   ├── routers/           # API route handlers
│   ├── core/              # Database & SQLModel definitions
│   ├── services/          # Business logic (auth, judge, email)
│   ├── utils/             # Shared utilities (caching)
│   ├── worker.py          # Celery worker
│   └── scripts/          # DB migration & seeding
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

# Security (generate with)
# openssl rand -hex 32
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

---

## Documentation

| Document | Description |
|----------|-------------|
| [USER_MANUAL.md](./USER_MANUAL.md) | Complete user guide by role |
| [backend/Dev.md](./backend/Dev.md) | Backend developer reference |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deployment guide |
| [DESIGN_VISION.md](./DESIGN_VISION.md) | UI/UX design philosophy |
| [SKILLS.md](./SKILLS.md) | Development skills library |

---

## Submission Pipeline

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Start     │───▶│    Code     │───▶│   Submit    │───▶│   Pending   │
│  Problem    │    │   Locally   │    │   Code      │    │   Queue     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────┬───────┘
                                                               │
         ┌─────────────────────────────────────────────────────┘
         ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Fetch     │───▶│   AI Judge  │───▶│   Update    │───▶│   Notify    │
│  from GitHub│    │  (Gemini)   │    │  & Score    │    │ (WebSocket) │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

1. **Start Problem** - Creates private GitHub repository
2. **Code Locally** - Student writes solution with Git commits
3. **Submit** - Triggers async evaluation pipeline
4. **Pending** - Celery worker picks up task
5. **Fetch** - Worker retrieves code from GitHub
6. **AI Judge** - Gemini analyzes code and test cases
7. **Update** - Stores score, feedback, and XP
8. **Notify** - Real-time WebSocket update to UI

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