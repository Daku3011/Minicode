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
  <img src="https://img.shields.io/badge/Gemini_2.5_Flash-AI_Judge-4285F4?style=flat-square&logo=google" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/GitHub_OAuth-Integration-181717?style=flat-square&logo=github" alt="GitHub OAuth" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=flat-square&logo=tailwindcss" alt="TailwindCSS" />
</p>

---

## 🎯 What is MiniCode?

MiniCode is a **full-stack competitive programming platform** designed to elevate modern educational institutions. Unlike traditional online judges that rely on isolated, built-in code editors, MiniCode bridges the gap between academic coding exercises and **real-world software engineering**.

We require students to navigate **actual GitHub workflows**. Faculty upload problem statements, and students provision private automated GitHub repositories, code completely in their local environments, push their solutions, and submit their real-world workflows for evaluation by our advanced **Gemini AI Judge**. 

---

## ✨ Key Features

### 🕵️‍♂️ Strict AI Plagiarism & Generation Detection (NEW)
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
Clicks "Sync & Evaluate" → AI Judge analyzes code AND commit history
       ↓
Score + detailed AI feedback + Plagiarism checks displayed instantly
```

### 🔐 Multi-Role Architecture
| Role | Auth Method | Capabilities |
|------|------------|--------|
| **Admin** | Secure Username/Password | Full system oversight, overall user management |
| **Faculty** | Secure Username/Password | Create complex problems, manage test cases, view deep analytics & scoreboards |
| **Student** | GitHub OAuth | Solve problems, provision repos, earn XP, track leaderboards |

### 📊 Real-time Faculty Dashboard
- In-depth problem analytics (submission counts, pass/fail ratios).
- Dedicated scoreboards and attempt trackers for every problem statement.
- Only displays problems authored by the authenticated faculty member.

### 🏆 Gamified Leaderboards & Profiles
- Global, XP-based ranking system.
- Detailed student profiles tracking solve statistics, win streaks, and recent activity.

---

## 🏗️ System Architecture

```text
┌──────────────────────────────────────────────────┐
│                   Frontend                       │
│           Next.js 16 + TailwindCSS 4             │
│     React 19 · Framer Motion · Lucide Icons      │
│                                                  │
│  /login  /problems  /problems/[id]  /leaderboard │
│  /admin/users  /faculty/dashboard  /profile      │
└────────────────────┬─────────────────────────────┘
                     │ Axios + JWT
                     ▼
┌─────────────────────────────────────────────────┐
│                   Backend                       │
│              FastAPI + Uvicorn                  │
│                                                 │
│  Auth     ── GitHub OAuth + Password (bcrypt)   │
│  Models   ── SQLModel (User, Problem, TestCase) │
│  Judge    ── Gemini AI Analysis + Commit Checks │
│  Repos    ── PyGithub (Repo provisioning)       │
│  DB       ── SQLite (dev) / PostgreSQL (prod)   │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- A [GitHub OAuth App](https://github.com/settings/developers)
- A [Google Gemini API Key](https://aistudio.google.com/apikey)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/LeetCodeCodingClub.git
cd LeetCodeCodingClub
```

### 2. Quick Setup (Docker Recommended)
The absolute easiest way to spin up MiniCode locally:
```bash
cp .env.example .env
# Edit .env with your acquired GitHub OAuth and Gemini API keys!
docker compose up --build
```
Visit **[http://localhost:3000](http://localhost:3000)** and start coding! 🎉

---

### 3. Manual Local Setup

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment keys
cp .env.example .env 
```

**Required `.env` Configuration:**
```env
DATABASE_URL=sqlite:///./minicode.db
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_random_secret_key
```

```bash
# Seed the development database (creates admin, faculty, and sample test cases)
python seed.py

# Spin up the FastAPI server
uvicorn main:app --reload --port 8000
```

#### Frontend Setup
```bash
cd frontend

# Install exact dependencies
npm install

# Configure environment variables
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
echo "NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_oauth_client_id" >> .env.local

# Start the dev server
npm run dev
```

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
| **ORM & Database** | SQLModel / SQLite / Postgres | Robust database models & query handling |
| **Security & Auth** | JWT, bcrypt, GitHub OAuth | Zero-trust multi-role authentication |
| **AI Processing** | Google Gemini 2.5 Flash | Real-time code evaluation & plagiarism detection |
| **Git Operations** | PyGithub | Automated repo provisioning & branch analysis |

---

## 📈 Roadmap

- [x] Code plagiarism & AI generation detection
- [ ] Traditional test-case-based judge (Docker sandboxed isolated execution via OpenEnv)
- [ ] Multiple modular AI Judge personas (CTO, Professor, Roast mode)
- [ ] Real-time leaderboard push updates via WebSockets
- [ ] Submission history with visual diff comparisons
- [ ] Multi-team based competitive tournaments

---

## 👥 Authors

Built by **Daku3011**
