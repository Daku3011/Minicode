<p align="center">
  <img src="https://img.shields.io/badge/MiniCode-AI_Powered_Coding_Arena-8B5CF6?style=for-the-badge&labelColor=0F172A" alt="MiniCode Badge" />
</p>

<h1 align="center">⚡ MiniCode</h1>

<p align="center">
  <strong>An Elite, AI-Powered Competitive Coding Platform with Real-World GitHub Workflows</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Celery-Distributed_Workers-37814A?style=flat-square&logo=celery" alt="Celery" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis" alt="Redis" />
  <img src="https://img.shields.io/badge/Gemini_2.5_Flash-AI_Judge-4285F4?style=flat-square&logo=google" alt="Gemini AI" />
</p>

---

## 🎯 What is MiniCode?

MiniCode is a **full-stack competitive programming platform** designed to elevate modern educational institutions. Unlike traditional online judges that rely on isolated, built-in code editors, MiniCode bridges the gap between academic coding exercises and **real-world software engineering**.

We require students to navigate **actual GitHub workflows**. Faculty upload problem statements, and students provision private automated GitHub repositories, code completely in their local environments, push their solutions, and submit their real-world workflows for evaluation by our advanced **Gemini AI Judge**. 

---

## ✨ Key Features

### 🚀 Massive Scale: Celery, Redis, & Postgres (NEW)
We have overhauled the backend infrastructure to handle high-traffic concurrency required during active hackathons:
- **Asynchronous Judging:** Evaluating code with AI is now fully offloaded to a detached **Celery Worker Group**, backed by a **Redis Broker**. This prevents the main API thread from blocking.
- **Enterprise DB:** The platform has been fully upgraded from local SQLite to a robust **PostgreSQL 15** deployment capable of handling massive transactional volumes.
- **Intensive Performance Caching:** GitHub repos, analytical queries, and problem data are violently cached using `FastAPICache2` linked directly into a **Redis Cache Instance**, radically speeding up endpoint loading times.
- **Battle-Tested:** The `load_test.js` K6 suite validates stable throughput for >200 concurrent active users.

### 🕵️‍♂️ Strict AI Plagiarism & Generation Detection
We've integrated a powerful anti-cheating mechanism directly into the AI Judge:
- **Commit History Analysis:** The platform fetches the latest commits from the student's repository. Plagiarized or purely AI-generated submissions typically lack iterative, human-like commit histories.
- **Pattern Matching:** The AI aggressively scans for generic variable names, hallmark AI boilerplate code, and excessively explanatory comments.
- **Red Flag Warnings:** If the judge determines the code has an AI-generation probability of > 60%, it injects a highly visible **Red HTML Warning Block** directly into the feedback interface, immediately alerting reviewing faculty.

### 🧠 Advanced AI-Powered Judging (Gemini 2.5 Flash)
- **Direct GitHub Integration:** Fetches student code seamlessly from their synced GitHub repository.
- **Structured Evaluation:** Evaluates logical correctness against faculty-defined test cases.
- **Comprehensive Feedback:** Returns structured scoring (0–100) alongside detailed markdown feedback covering:
  - ✅ Correctness analysis
  - 📊 Time & space complexity evaluation
  - 💡 Code quality and stylistic suggestions
  - 🔍 Adaptive hints for incorrect solutions (without revealing the full answer)

### 🐙 True GitHub-Native Workflow
```text
Student clicks "Provision Repository"
       ↓
Private repo auto-created and linked on student's GitHub account
       ↓
Student clones → writes code locally → pushes iterative commits to `main`
       ↓
Clicks "Sync & Evaluate" → Submits job to Celery Worker Queue
       ↓
AI Judge analyzes code AND commit history heavily using Redis caching
       ↓
Score + detailed AI feedback + Plagiarism checks displayed instantly via polling/refresh
```

---

## 🏗️ System Architecture

```text
┌──────────────────────────────────────────────────┐
│                   Frontend                       │
│           Next.js 16 + TailwindCSS 4             │
│     React 19 · Framer Motion · Lucide Icons      │
└────────────────────┬─────────────────────────────┘
                     │ HTTP / JWT
                     ▼
┌─────────────────────────────────────────────────┐
│                   Backend                       │
│              FastAPI + Uvicorn                  │
│                                                 │
│  Auth     ── GitHub OAuth + Password (bcrypt)   │
│  Cache    ── FastAPICache + Redis Server        │
│  Repos    ── PyGithub Native Integration        │
│  DB       ── PostgreSQL (Scaleable Prod DB)     │
└────────────────────┬─────────────────────────────┘
                     │ Message Broker / Jobs
                     ▼
┌─────────────────────────────────────────────────┐
│           Celery Async AI Workers               │
│                                                 │
│  Judge    ── Gemini AI Analysis + Commit Checks │
│  Queue    ── Background job dispatcher          │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Docker Compose** (Required for scaling stack)
- A [GitHub OAuth App](https://github.com/settings/developers)
- A [Google Gemini API Key](https://aistudio.google.com/apikey)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/LeetCodeCodingClub.git
cd LeetCodeCodingClub
```

### 2. Full Up Scale (Docker Recommended)
The infrastructure requires Postgres, Redis, Celery, and the Backend API. Docker compose automatically links them all:
```bash
cp .env.example .env
# Edit .env with your acquired GitHub OAuth and Gemini API keys!
docker compose up --build
```

**Wait for the database container to stand up, then run the DB initialization & seeder on the backend container:**
```bash
docker compose exec backend python seed.py
```

Visit **[http://localhost:3000](http://localhost:3000)** and start coding! 🎉

---

## 🧪 K6 Load Testing

MiniCode ships with a high-concurrency stress testing script to validate the caching layers and Database connection pooling limits. 

Ensure the backend stack is fully running via Docker, then run k6 locally against the load endpoints.
```bash
k6 run load_test.js
```
The test suite validates 95th-percentile response limits under staged loading targeting 50, then 100, then 200 concurrent virtual users.

---

## 🔑 Default Sandbox Accounts

After running `seed.py`, use these accounts to test the platform:

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin` | **Admin** — full system access |
| `facultyname` | `password` | **Faculty** — problem management |
| *GitHub Login* | *OAuth* | **Student** — solve & submit |

---

## 🛠️ Tech Stack Matrix

| Layer | Core Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | Next.js 16, React 19 | Fast SSR, modern routing, UI framework |
| **Styling & UX** | TailwindCSS 4, Framer Motion | Fluid design system, slick animations |
| **Backend API** | FastAPI, Uvicorn | Lightning-fast REST API, full async support |
| **Background Jobs** | Celery + Redis Broker | Dedicated AI grading workers unblocking Node threads |
| **Caching Layer** | Redis 7 + FastAPICache | Ultra-fast endpoint memory acceleration |
| **ORM & Database** | SQLModel / PostgreSQL 15 | Robust scaleable dataset query processing |
| **Security & Auth** | JWT, bcrypt, slowapi, GitHub OAuth | Zero-trust multi-role authentication & rate tracking |
| **AI Processing** | Google Gemini 2.5 Flash | Real-time code evaluation & plagiarism detection |

---

## 📈 Roadmap

- [x] Code plagiarism & AI generation detection
- [x] Fully distributed load-scale architecture (Celery, Postgres, Redis)
- [ ] Traditional test-case-based judge (Docker sandboxed isolated execution via OpenEnv)
- [ ] Multiple modular AI Judge personas (CTO, Professor, Roast mode)
- [ ] Real-time leaderboard push updates via WebSockets
- [ ] Submission history with visual diff comparisons
- [ ] Multi-team based competitive tournaments

---

## 👥 Authors

Built by **Daku3011**
