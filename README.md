<p align="center">
  <img src="https://img.shields.io/badge/MiniCode-AI_Powered_Coding_Arena-8B5CF6?style=for-the-badge&labelColor=0F172A" alt="MiniCode Badge" />
</p>

<h1 align="center">⚡ MiniCode</h1>

<p align="center">
  <strong>An Elite, AI-Powered Competitive Coding Platform with Real-World GitHub Workflows</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Celery-Distributed_Workers-37814A?style=flat-square&logo=celery" alt="Celery" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis" alt="Redis" />
  <img src="https://img.shields.io/badge/Gemini_2.5_Flash-AI_Judge-4285F4?style=flat-square&logo=google" alt="Gemini AI" />
</p>

---

## 🎯 What is MiniCode?

**MiniCode** is a **full-stack competitive programming platform** designed to elevate modern educational institutions and university clubs by bringing them out of outdated, isolated coding judges and into real-world software engineering environments. 

Rather than restricting students to a tiny browser code editor, **MiniCode demands real-world GitHub workflows**. Faculty publish challenges, students auto-provision private GitHub repositories directly to their accounts, and push their solutions via local IDEs (VSCode, JetBrains). When a student requests evaluation, our massive **Celery Worker Fleet** fetches their raw commits, runs logic testing, and evaluates the code for style, complexity, and plagiarism utilizing a distributed **Gemini AI Engine**.

---

## ✨ System Features

### 🚀 Massive Scale: Enterprise Grade Architecture
We have completely overhauled the legacy backend infrastructure to effortlessly sustain high-traffic concurrency, such as during heavily active, 48-hour global hackathons.
* **Elastic Asynchronous Judging:** AI code evaluations are strictly handled by a detached **Celery Worker Group**, scaled horizontally through a **Redis Broker**. The core API logic remains non-blocking.
* **Enterprise DB Backend:** Complete transition to a production-ready **PostgreSQL 15** database, guaranteeing atomic multi-student transactions.
* **Aggressive Redis Caching:** Heavy analytical queries (Leaderboards, Profiles, Repositories) are actively cached utilizing `FastAPICache2` linked directly to Redis.

### 🕵️‍♂️ Anti-Plagiarism & AI Generation Protection
We integrated powerful anti-cheating heuristic metrics directly into the core AI Judge evaluation pipeline:
* **Iterative Commit Telemetry:** The AI Judge actively inspects the commit history and git timestamps of the connected repository. A massive code drop in a single commit immediately triggers a manual review alert.
* **Direct Prompt Injection Protection:** The AI scrutinizes code for hallmark generative AI boilerplate formatting, suspiciously over-explanatory comments, and generic variable nomenclature indicating ChatGPT/Claude output.
* **Red Flag Dashboard:** Faculty receives blatant visual red flags via a unique `AI Confidence Score`, enabling robust academic integrity validation.

### 🧠 Gemini 2.5 Flash Evaluation Engine
* **Structured Multi-Phase Evaluation:** Real-world execution testing against dynamic input/output edge cases combined with an abstract semantic logic review.
* **Markdown-Rich Analysis:**
  - ✅ **Correctness**: Real-time pass/fail validation.
  - 📊 **Big O Complexity**: Granular Time (`O(N)`) and Space (`O(1)`) memory usage footprint validation.
  - 💡 **Clean Code Practices**: Meaningful structural architecture feedback.

### 🐙 True GitHub-Native Workflow

```text
Student Selects "Provision Repository"
       ↓
Private GitHub repo created dynamically via GitHub Graph APIs
       ↓
Student git clones code locally → Commits logic natively → Pushes to `main` branch
       ↓
Student executes "Sync & Evaluate" → Submits evaluation job to Celery Worker Hash
       ↓
Gemini AI Judge processes logic and commit history from GitHub cache
       ↓
Score + 10x Engineer Feedback displayed instantly on Frontend
```

---

## 🏗️ System Architecture

```text
┌──────────────────────────────────────────────────┐
│                   Frontend                       │
│           Next.js 15 + TailwindCSS 4             │
│        Framer Motion UI · React Server           │
└────────────────────┬─────────────────────────────┘
                     │ HTTPS / JWT
                     ▼
┌─────────────────────────────────────────────────┐
│                   Backend                       │
│           FastAPI + Uvicorn + SQLAlchemy        │
│                                                 │
│  Auth     ── GitHub OAuth + Password (bcrypt)   │
│  Cache    ── FastAPICache + Redis Server        │
│  Repos    ── PyGithub Native Repository Engine  │
│  DB       ── Supabase PostgreSQL Pooler         │
└────────────────────┬─────────────────────────────┘
                     │ Message Broker (AMQP/Redis)
                     ▼
┌─────────────────────────────────────────────────┐
│           Celery Async AI Workers               │
│                                                 │
│  Engine   ── Google Gemini 2.5 Logic Assessment │
│  Queue    ── Distributed Job Dispatcher         │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Deployment & Installation

Want to deploy MiniCode globally for your institution? View the [DEPLOYMENT.md](DEPLOYMENT.md) guide for a transparent cost analysis spanning **$0/month Free Tier** deployment using Supabase, Vercel, and Render, scaling up to high-traffic paid tiers.

### Setting Up Locally via Docker

A complete `docker-compose.yml` environment is included for instant, zero-friction spinning up.

```bash
# 1. Clone & Env Setup
git clone https://github.com/your-username/MiniCode.git
cd MiniCode
cp .env.example .env

# 2. Add your GitHub OAuth IDs and Gemini API Keys in .env

# 3. Pull Images & Launch
docker-compose up -d --build
```
> **Backend**: [http://localhost:8000/docs](http://localhost:8000/docs) (OpenAPI UI)
> **Frontend**: [http://localhost:3000](http://localhost:3000)

## 🎨 UI/UX Design Philosophies
The UI/UX is built to break away from traditional "intimidating" dark-mode coding arenas. We utilize an aesthetic of approachability, incorporating fluid micro-animations, glassmorphism components, and neon-purple highlights. Take a closer look at the [DESIGN_VISION.md](DESIGN_VISION.md) for UX philosophies.

Admin: admin / admin123
Faculty: faculty / faculty123
Student: student / student123

---
*Elevate competitive programming to the modern enterprise level.* 🚀
