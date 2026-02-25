<p align="center">
  <img src="https://img.shields.io/badge/MiniCode-AI_Powered_Coding_Arena-8B5CF6?style=for-the-badge&labelColor=0F172A" />
</p>

<h1 align="center">⚡ MiniCode</h1>

<p align="center">
  <strong>An AI-Powered Competitive Coding Platform with Real-World GitHub Workflows</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi" />
  <img src="https://img.shields.io/badge/Gemini_2.5_Flash-AI_Judge-4285F4?style=flat-square&logo=google" />
  <img src="https://img.shields.io/badge/GitHub_OAuth-Integration-181717?style=flat-square&logo=github" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=flat-square&logo=tailwindcss" />
</p>

---

## 🎯 What is MiniCode?

MiniCode is a **full-stack competitive programming platform** designed for educational institutions. Unlike traditional online judges, MiniCode bridges the gap between academic coding exercises and **real-world software engineering** by requiring students to work with actual GitHub repositories.

**Faculty** upload problem statements. **Students** provision private GitHub repos, code locally, push solutions, and submit for evaluation by a **Gemini AI Judge** that provides detailed scoring, code quality analysis, and personalized feedback.

---

## ✨ Key Features

### 🔐 Multi-Role Authentication
| Role | Auth Method | Access |
|------|------------|--------|
| **Admin** | Username/Password (`admin`/`admin`) | Full system oversight, user management |
| **Faculty** | Username/Password | Create problems, view analytics & scoreboards |
| **Student** | GitHub OAuth | Solve problems, submit via GitHub repos |

### 🧠 AI-Powered Judging (Gemini 2.5 Flash)
- Fetches student code directly from their GitHub repository
- Evaluates correctness against test cases
- Returns **structured scoring** (0–100) with detailed feedback:
  - ✅ Correctness analysis
  - 📊 Time & space complexity review
  - 💡 Code quality suggestions
  - 🔍 Hints for wrong answers (without giving away the solution)

### 🐙 GitHub-Native Workflow
```
Student clicks "Provision Repository"
       ↓
Private repo auto-created on student's GitHub
       ↓
Student clones → codes locally → pushes to main
       ↓
Clicks "Sync & Evaluate" → AI Judge analyzes repo
       ↓
Score + detailed AI feedback displayed instantly
```

### 📊 Faculty Dashboard
- Real-time analytics per problem (submission counts, pass rates)
- Scoreboard for each problem statement
- Problem creation with test case management
- Only sees problems they authored

### 🏆 Leaderboard & Profiles
- Global XP-based leaderboard
- Student profiles with solve stats and streak tracking

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│           Next.js 16 + TailwindCSS 4             │
│     React 19 · Framer Motion · Lucide Icons      │
│                                                   │
│  /login  /problems  /problems/[id]  /leaderboard │
│  /admin/users  /faculty/dashboard  /profile       │
└────────────────────┬────────────────────────────┘
                     │ Axios + JWT
                     ▼
┌─────────────────────────────────────────────────┐
│                   Backend                        │
│              FastAPI + Uvicorn                    │
│                                                   │
│  Auth     ── GitHub OAuth + Password (bcrypt)    │
│  Models   ── SQLModel (User, Problem, TestCase,  │
│               Submission)                         │
│  Judge    ── Gemini 2.5 Flash AI Analysis        │
│  Repos    ── PyGithub (auto repo provisioning)   │
│  DB       ── SQLite (dev) / PostgreSQL (prod)    │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+** with `pip`
- **Node.js 18+** with `npm`
- A [GitHub OAuth App](https://github.com/settings/developers) (for student login)
- A [Google Gemini API Key](https://aistudio.google.com/apikey) (for AI judging)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/LeetCodeCodingClub.git
cd LeetCodeCodingClub
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install passlib python-multipart bcrypt==4.1.2

# Configure environment
cp .env.example .env  # Then edit with your keys
```

**`.env` Configuration:**
```env
DATABASE_URL=sqlite:///./minicode.db
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_random_secret_key
```

```bash
# Seed the database (creates admin, faculty, and sample problems)
python seed.py

# Start the server
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
# Create .env.local with:
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
echo "NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_oauth_client_id" >> .env.local

# Start the dev server
npm run dev
```

### 4. Open in Browser

Visit **[http://localhost:3000](http://localhost:3000)** and start coding! 🎉

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Admin/Faculty login (form data: `username`, `password`) |
| `GET` | `/auth/github/callback?code=` | GitHub OAuth callback |
| `GET` | `/auth/me` | Get current authenticated user |

### Problems
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/problems` | List all problems |
| `GET` | `/problems/{id}` | Get problem details |
| `GET` | `/problems/{id}/testcases` | Get sample test cases |
| `POST` | `/problems` | Create problem (Faculty only) |
| `POST` | `/problems/{id}/start` | Provision GitHub repo for student |
| `POST` | `/problems/{id}/submit` | Submit solution for AI evaluation |

### Faculty
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/faculty/problems` | Get faculty's own problems |
| `GET` | `/faculty/analytics/{id}` | Get problem analytics & scoreboard |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/users` | List all users |
| `GET` | `/leaderboard` | Global leaderboard |

---

## 🔑 Default Accounts

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin` | Admin — full system access |
| `facultyname` | `password` | Faculty — problem management |
| *GitHub Login* | *OAuth* | Student — solve & submit |

---

## 🗂️ Project Structure

```
LeetCodeCodingClub/
├── backend/
│   ├── main.py              # FastAPI app, routes, endpoints
│   ├── auth.py              # Authentication (JWT, OAuth, password)
│   ├── models.py            # SQLModel schemas (User, Problem, etc.)
│   ├── judge.py             # Gemini AI Judge engine
│   ├── repo_manager.py      # GitHub repo provisioning (PyGithub)
│   ├── seed.py              # Database seeder (accounts + problems)
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment config
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── login/           # Dual-mode login page
│       │   ├── problems/        # Problem list + detail + repo flow
│       │   ├── admin/           # Admin user management
│       │   ├── faculty/         # Faculty dashboard + analytics
│       │   ├── leaderboard/     # Global rankings
│       │   ├── profile/         # Student profile & stats
│       │   └── auth/github/     # OAuth callback handler
│       ├── contexts/
│       │   └── AuthContext.tsx   # Global auth state management
│       └── lib/
│           └── api.ts           # Axios instance with JWT interceptor
│
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16, React 19 | SSR, routing, UI |
| **Styling** | TailwindCSS 4, Framer Motion | Design system, animations |
| **Icons** | Lucide React | UI iconography |
| **Backend** | FastAPI, Uvicorn | REST API, async support |
| **ORM** | SQLModel (SQLAlchemy) | Database models & queries |
| **Database** | SQLite (dev) / PostgreSQL (prod) | Data persistence |
| **Auth** | JWT + GitHub OAuth + bcrypt | Multi-role authentication |
| **AI Judge** | Google Gemini 2.5 Flash | Code evaluation & feedback |
| **Git Integration** | PyGithub | Repo provisioning & code fetching |
| **HTTP** | Axios (frontend), httpx (backend) | API communication |

---

## 🧪 GitHub OAuth Setup

1. Go to [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name:** `MiniCode`
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/auth/github/callback`
4. Copy **Client ID** and **Client Secret** to your `.env` files

---

## 📈 Roadmap

- [ ] Docker Compose for one-command deployment
- [ ] Traditional test-case-based judge (Docker sandboxed execution)
- [ ] Multiple AI Judge personas (CTO, Professor, Roast mode)
- [ ] Real-time leaderboard updates via WebSocket
- [ ] Problem tagging and filtering by topic
- [ ] Submission history with diff view
- [ ] Team-based competitions
- [ ] Code plagiarism detection

---

## 👥 Owner

Built By Daku3011
