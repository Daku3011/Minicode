# 🛠️ MiniCode Backend — Developer Guide

> **What is this file?**
> A complete reference for any developer who wants to understand, maintain, or **rebuild this entire backend from scratch** — without AI assistance.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Environment Variables](#3-environment-variables)
4. [Architecture Diagram](#4-architecture-diagram)
5. [Database Models (`models.py`)](#5-database-models-modelspy)
6. [Authentication System (`auth.py`)](#6-authentication-system-authpy)
7. [API Server (`main.py`)](#7-api-server-mainpy)
8. [AI Judge Engine (`judge.py`)](#8-ai-judge-engine-judgepy)
9. [GitHub Repo Manager (`repo_manager.py`)](#9-github-repo-manager-repo_managerpy)
10. [Database Seeder (`seed.py`)](#10-database-seeder-seedpy)
11. [Complete Data Flow](#11-complete-data-flow)
12. [API Endpoint Reference](#12-api-endpoint-reference)
13. [Critical Gotchas & Common Questions](#13-critical-gotchas--common-questions)
14. [How to Build This From Scratch](#14-how-to-build-this-from-scratch)
15. [Learning Resources](#15-learning-resources)

---

## 1. Project Overview

**MiniCode** is a LeetCode-style coding platform where:

- **Students** log in via GitHub OAuth, browse coding problems, start solving them in auto-created GitHub repos, submit solutions, and get AI-powered feedback + scores.
- **Faculty** create problems, view analytics on submissions.
- **Admins** manage users and roles.

The backend is a **Python FastAPI** server that talks to:
- A **SQLite** database (via SQLModel ORM)
- **GitHub API** (for OAuth login + creating repos + fetching student code)
- **Google Gemini AI** (for judging/grading submitted code)

---

## 2. Tech Stack & Dependencies

| Package              | Purpose                                           |
| -------------------- | ------------------------------------------------- |
| `fastapi`            | Web framework (async, auto-docs at `/docs`)       |
| `uvicorn`            | ASGI server to run FastAPI                        |
| `sqlmodel`           | ORM (SQLAlchemy + Pydantic combined)              |
| `python-dotenv`      | Load `.env` file into `os.environ`                |
| `pygithub`           | GitHub REST API client (create repos, fetch code) |
| `httpx`              | Async HTTP client (GitHub OAuth token exchange)   |
| `python-jose[cryptography]` | JWT token creation & verification          |
| `passlib` (+ bcrypt) | Password hashing (for non-GitHub login)           |
| `google-genai`       | Google Gemini AI SDK (AI judge)                   |
| `psycopg2-binary`    | PostgreSQL driver (unused in dev; SQLite is used) |
| `redis`              | Listed but **not currently used** in the codebase |

Install everything:
```bash
cd backend
pip install -r requirements.txt
```

> ⚠️ `passlib` with bcrypt is imported in `auth.py` but NOT listed in `requirements.txt`. You may need to install it manually:
> ```bash
> pip install passlib[bcrypt]
> ```

---

## 3. Environment Variables

All variables live in `backend/.env`. Here's what each one does:

| Variable                  | Required? | Description                                                             |
| ------------------------- | --------- | ----------------------------------------------------------------------- |
| `DATABASE_URL`            | Yes       | Database connection string. Default: `sqlite:///./minicode.db`          |
| `GITHUB_CLIENT_ID`        | Yes       | GitHub OAuth App → Client ID (for login flow)                          |
| `GITHUB_CLIENT_SECRET`    | Yes       | GitHub OAuth App → Client Secret                                       |
| `GITHUB_TOKEN`            | No        | A personal access token (not actively used in code, kept for reference) |
| `GEMINI_API_KEY`          | Yes       | Google AI Studio API key (powers the judge)                             |
| `JWT_SECRET`              | Yes       | Secret key for signing JWT tokens                                       |

### How to get these:
1. **GitHub OAuth App** → Go to GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App
   - Set callback URL to `http://localhost:3000/auth/github/callback`
   - Copy Client ID and Client Secret
2. **Gemini API Key** → Go to [Google AI Studio](https://aistudio.google.com/app/apikey) → Create API Key
3. **JWT_SECRET** → Generate any random string (e.g., `openssl rand -base64 32`)

---

## 4. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                       │
│                      http://localhost:3000                       │
└─────────────────────┬───────────────────────┬───────────────────┘
                      │  HTTP Requests        │  GitHub OAuth
                      │  (Bearer JWT)         │  Redirect
                      ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (FastAPI)                            │
│                    http://localhost:8000                         │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────────┐  │
│  │ main.py  │  │ auth.py  │  │ judge.py  │  │repo_manager.py│  │
│  │ (Routes) │  │ (Auth)   │  │ (AI Judge)│  │ (GitHub Repos)│  │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └──────┬────────┘  │
│       │              │              │               │           │
│       ▼              ▼              ▼               ▼           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    models.py (ORM)                       │   │
│  │         User | Problem | TestCase | Submission           │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                         │                                       │
└─────────────────────────┼───────────────────────────────────────┘
                          │
              ┌───────────┼───────────────────┐
              ▼           ▼                   ▼
        ┌──────────┐ ┌──────────┐      ┌──────────────┐
        │ SQLite   │ │ GitHub   │      │ Google       │
        │ Database │ │ API      │      │ Gemini AI    │
        │ minicode │ │ (OAuth,  │      │ (Code Judge) │
        │   .db    │ │  Repos)  │      │              │
        └──────────┘ └──────────┘      └──────────────┘
```

---

## 5. Database Models (`models.py`)

This file defines **4 tables** using SQLModel (which is SQLAlchemy + Pydantic):

### `User` table
| Column                | Type            | Notes                                                |
| --------------------- | --------------- | ---------------------------------------------------- |
| `id`                  | int (PK)        | Auto-generated                                       |
| `username`            | str (unique)    | GitHub username or manual username                   |
| `email`               | str (unique)    | From GitHub or manual                                |
| `full_name`           | str (optional)  | Display name                                         |
| `avatar_url`          | str (optional)  | GitHub avatar                                        |
| `github_id`           | int (unique)    | GitHub's user ID                                     |
| `github_access_token` | str (optional)  | OAuth access token (needed to create repos)          |
| `hashed_password`     | str (optional)  | For non-GitHub login (bcrypt hash)                   |
| `role`                | str             | `"student"` / `"faculty"` / `"admin"` (default: student) |
| `created_at`          | datetime        | Auto-set on creation                                 |

**Relationships:**
- `submissions` → one-to-many → `Submission`
- `created_problems` → one-to-many → `Problem`

### `Problem` table
| Column          | Type            | Notes                               |
| --------------- | --------------- | ----------------------------------- |
| `id`            | int (PK)        | Auto-generated                      |
| `title`         | str (indexed)   | Problem title (e.g., "Two Sum")     |
| `description`   | str             | Full problem statement (markdown)   |
| `difficulty`    | str             | `"Easy"` / `"Medium"` / `"Hard"`   |
| `input_format`  | str (optional)  | Describes input format              |
| `output_format` | str (optional)  | Describes expected output           |
| `author_id`     | int (FK → User) | Who created it                      |
| `created_at`    | datetime        | Auto-set                            |

**Relationships:**
- `author` → many-to-one → `User`
- `test_cases` → one-to-many → `TestCase`
- `submissions` → one-to-many → `Submission`

### `TestCase` table
| Column            | Type          | Notes                                         |
| ----------------- | ------------- | --------------------------------------------- |
| `id`              | int (PK)      | Auto-generated                                |
| `problem_id`      | int (FK)      | Links to `Problem`                            |
| `input_data`      | str           | Input for the test case                       |
| `expected_output` | str           | Correct answer                                |
| `is_sample`       | bool          | If `True`, shown to students on problem page  |

### `Submission` table
| Column         | Type            | Notes                                                      |
| -------------- | --------------- | ---------------------------------------------------------- |
| `id`           | int (PK)        | Auto-generated                                             |
| `user_id`      | int (FK → User) | Who submitted                                              |
| `problem_id`   | int (FK)        | For which problem                                          |
| `repo_url`     | str (optional)  | GitHub repo URL                                            |
| `commit_sha`   | str (optional)  | Specific commit (currently unused by judge)                |
| `code_content` | str (optional)  | The actual code that was evaluated (stored after judging)  |
| `language`     | str (optional)  | e.g., `"python"`                                           |
| `status`       | str             | `"pending"` / `"accepted"` / `"wrong_answer"` / `"runtime_error"` / `"tle"` / `"mle"` / `"error"` |
| `score`        | int             | 0–100 score from AI judge                                  |
| `ai_feedback`  | str (optional)  | Detailed markdown feedback from Gemini                     |
| `judge_output` | str (optional)  | Short judge status message                                 |
| `memory_used`  | int (optional)  | In KB (not currently populated)                            |
| `time_taken`   | float (optional)| In seconds (not currently populated)                       |
| `timestamp`    | datetime        | When submitted                                             |

### Entity Relationship Diagram

```
  User ──────1:N──────▶ Problem       (author creates problems)
    │                      │
    │                      │
    │ 1:N                  │ 1:N
    ▼                      ▼
 Submission ◀──────N:1── Problem
    │
    │ N:1
    ▼
  User                                (student submits solutions)

  Problem ──1:N──▶ TestCase           (each problem has test cases)
```

---

## 6. Authentication System (`auth.py`)

This file handles **two auth methods** and **role-based access control**.

### Two Login Methods

#### Method 1: GitHub OAuth (Primary)
```
Student clicks "Login with GitHub"
       │
       ▼
Frontend redirects to GitHub authorization URL
       │
       ▼
GitHub redirects back to /auth/github/callback?code=xxx
       │
       ▼
Backend exchanges `code` for `access_token` (POST to GitHub)
       │
       ▼
Backend calls GitHub API /user to get profile info
       │
       ▼
Create or update User in DB (stores github_access_token)
       │
       ▼
Generate JWT token → return to frontend
       │
       ▼
Frontend stores JWT in localStorage, sends as "Bearer" header
```

#### Method 2: Username/Password (For admin/faculty)
```
POST /auth/login  (username + password as form data)
       │
       ▼
Look up User by username
       │
       ▼
Verify password against hashed_password using bcrypt
       │
       ▼
Generate JWT token → return to frontend
```

### Key Functions

| Function                | What it does                                                    |
| ----------------------- | --------------------------------------------------------------- |
| `verify_password()`     | Compares plain text password with bcrypt hash                   |
| `get_password_hash()`   | Creates a bcrypt hash from plain text password                  |
| `get_github_user_info()`| Async — Calls GitHub API `/user` with OAuth token               |
| `create_access_token()` | Creates a JWT with `{"sub": username, "exp": <time>}`           |
| `get_current_user()`    | **Dependency** — Extracts JWT from `Authorization: Bearer` header, decodes it, returns the `User` object from DB |
| `require_role(roles)`   | **Factory** — Returns a dependency that checks if user's role is in the allowed list |
| `require_admin`         | Pre-built dependency: only `"admin"` role can access            |
| `require_faculty`       | Pre-built dependency: `"faculty"` or `"admin"` can access       |

### JWT Token Structure
```json
{
  "sub": "username_here",
  "exp": 1735689600  // Unix timestamp (default: 15 minutes from creation!)
}
```

> ⚠️ **CRITICAL GOTCHA**: The default expiry in `create_access_token()` is only **15 minutes** (line 53 in auth.py), NOT the 1-week value defined in `ACCESS_TOKEN_EXPIRE_MINUTES`. This is because `create_access_token()` uses `timedelta(minutes=15)` as default when no `expires_delta` is passed, and **nobody passes one**. So tokens expire in 15 minutes and users get logged out. To fix: change the default or pass the proper delta.

---

## 7. API Server (`main.py`)

This is the **main entry point** — it wires everything together.

### Startup Flow
1. Load `.env` variables
2. Create SQLAlchemy engine from `DATABASE_URL`
3. Define `lifespan` handler → on startup, call `create_db_and_tables()` (auto-creates all tables from models)
4. Create FastAPI app with CORS middleware (allows all origins)
5. Define all route handlers

### Important: Duplicate `get_session()`
> ⚠️ There are **TWO** `get_session()` functions — one in `auth.py` (line 26) and one in `main.py` (line 23). They create **separate SQLAlchemy engines**. The one in `main.py` is used by route handlers (via `Depends(get_session)`), and the one in `auth.py` is used by `get_current_user()`. They both point to the same database URL, so this works, but it's a code smell — if you change the DB URL, you must change it in **both** `.env` references.

### Route Groups

The routes are organized into these logical groups:

1. **Problem endpoints** — CRUD for coding problems
2. **Auth endpoints** — GitHub OAuth callback + username/password login
3. **Problem interaction** — Start (create repo) and Submit (trigger judge)
4. **Leaderboard** — Aggregated scores
5. **Faculty analytics** — Submission stats per problem
6. **Admin** — User management
7. **Profile** — Current user info + stats

---

## 8. AI Judge Engine (`judge.py`)

This is the **brain** of the grading system. It does NOT execute code — it uses **Gemini AI** to analyze code and determine correctness.

### How Judging Works (Step by Step)

```
1. Student submits → POST /problems/{id}/submit
       │
       ▼
2. main.py creates a Submission record (status: "pending")
       │
       ▼
3. main.py calls judge_submission()
       │
       ▼
4. judge.py fetches code and commit history from GitHub:
   - Uses student's github_access_token
   - Looks for "solution.py" in "main" branch (or default branch)
   - Fetches the last 5 commits to analyze realistic development (AI code usually has 1 bulk commit)
   - The repo name is: minicode-{username}-{problem-title-slugified}
       │
       ▼
5. Builds a prompt with:
   - Problem description
   - All test cases (input + expected output)
   - Student's actual code
       │
       ▼
6. Sends prompt to Gemini 2.5 Flash
       │
       ▼
7. Gemini returns JSON:
   {
     "status": "accepted" | "wrong_answer" | "error",
     "score": 0-100,
     "ai_probability": 0-100,
     "feedback": "markdown string with analysis"
   }
       │
       ▼
8. Updates Submission in DB with status, score, feedback (injects red HTML Warning if ai_probability > 60)
```

### AI Personas (Fun Feature)
The judge supports different "personalities":
- `"standard"` — Fair & Experienced Coding Mentor
- `"cto"` — Grumpy CTO, focuses on engineering rigor
- `"professor"` — CS Professor, focuses on algorithms
- `"roast"` — Sarcastic reviewer, witty but helpful

> **Note**: The persona parameter exists in `run_ai_judge()` but is currently **hardcoded to "standard"** because `judge_submission()` doesn't pass a persona. To use other personas, you'd need to add a `persona` field to `SubmissionRequest` and thread it through.

### Key Functions

| Function                | What it does                                           |
| ----------------------- | ------------------------------------------------------ |
| `run_ai_judge()`        | Sends code + problem + test cases to Gemini → returns `(result_dict, error_string)` |
| `judge_submission()`    | Orchestrates: fetch code from GitHub → call AI judge → update Submission in DB |

> ⚠️ **CRITICAL**: The judge does NOT actually run the code. It's purely AI-based analysis. Gemini *reads* the code and test cases, then *predicts* if it's correct. This means:
> - It can be wrong (AI hallucination)
> - It can't catch runtime errors like infinite loops
> - Scores are subjective AI opinions, not deterministic
> - **[NEW Feature]** It conducts Strict AI-plagiarism checks. By reading the commit history and looking for typical AI boilerplate, it outputs an `ai_probability` and prominently flags potential cheating to the faculty.

---

## 9. GitHub Repo Manager (`repo_manager.py`)

Handles the **Git-based workflow** — creating repos for students and committing code.

### `create_student_repo(user, problem, session)`

When a student clicks "Start Problem":

1. Authenticates with GitHub using the student's stored `github_access_token`
2. Creates a **private** repo named `minicode-{username}-{problem-slug}`
3. Auto-initializes with a README (populated with problem description)
4. Creates a `solution.py` starter file with boilerplate code
5. If repo already exists (student already started), returns existing URL

### `commit_code_to_repo(user, repo_name, file_path, content, message)`

> ℹ️ This function exists but is **NOT currently called** from any route. It was designed for an in-browser code editor that would commit directly. Currently, students write code directly on GitHub.

### Repo Naming Convention
```
minicode-{username}-{problem-title-lowered-dashes}

Examples:
  minicode-john123-two-sum
  minicode-jane456-fizzbuzz
  minicode-alice-maximum-subarray
```

> ⚠️ **CRITICAL**: The repo name is generated in TWO places — `repo_manager.py` (line 14) and `main.py` (line 184). If the logic diverges, the judge won't find the code. Both must use the exact same formula.

---

## 10. Database Seeder (`seed.py`)

Run this to populate the database with initial data:

```bash
python seed.py
```

### What it creates:

**Users:**
| Username      | Password   | Role    |
| ------------- | ---------- | ------- |
| `admin`       | `admin`    | admin   |
| `facultyname` | `password` | faculty |

**Problems (5 total):**
| #  | Title            | Difficulty | Test Cases |
| -- | ---------------- | ---------- | ---------- |
| 1  | Two Sum          | Easy       | 3          |
| 2  | Hello World      | Easy       | 1          |
| 3  | FizzBuzz         | Easy       | 2          |
| 4  | Reverse String   | Easy       | 2          |
| 5  | Maximum Subarray | Medium     | 3          |

### Idempotent Design
- Checks if admin/faculty already exist before creating
- Checks if problems exist before seeding
- If problems exist but have no test cases, adds them
- Safe to run multiple times

---

## 11. Complete Data Flow

### Flow 1: Student Logs In via GitHub

```
Frontend                    Backend                         GitHub
   │                           │                              │
   │ Click "Login with GitHub" │                              │
   ├──redirect──────────────── ├──────────────────────────────▶│
   │                           │                              │
   │                           │   ◀── redirect with ?code= ──│
   │ GET /auth/github/callback │                              │
   ├──────────────────────────▶│                              │
   │                           │ POST exchange code for token  │
   │                           ├─────────────────────────────▶│
   │                           │◀── access_token ─────────────│
   │                           │                              │
   │                           │ GET /user (with access_token) │
   │                           ├─────────────────────────────▶│
   │                           │◀── { login, id, avatar } ────│
   │                           │                              │
   │                           │ Create/Update User in DB      │
   │                           │ Generate JWT                  │
   │ ◀── { access_token: JWT } │                              │
   │                           │                              │
   │ Store JWT in localStorage │                              │
```

### Flow 2: Student Solves a Problem

```
Frontend                    Backend                     GitHub         Gemini AI
   │                           │                          │               │
   │ POST /problems/1/start    │                          │               │
   ├──────────────────────────▶│                          │               │
   │                           │ Create private repo       │               │
   │                           ├────────────────────────▶ │               │
   │                           │◀── repo URL ──────────── │               │
   │ ◀── { repo_url }         │                          │               │
   │                           │                          │               │
   │ Student writes code on GitHub directly               │               │
   │ (edits solution.py in the created repo)              │               │
   │                           │                          │               │
   │ POST /problems/1/submit   │                          │               │
   ├──────────────────────────▶│                          │               │
   │                           │ Create Submission record  │               │
   │                           │ Fetch solution.py & commits│               │
   │                           ├────────────────────────▶ │               │
   │                           │◀── code & history ────── │               │
   │                           │                          │               │
   │                           │ Send code+history+problem│              │
   │                           ├──────────────────────────┼─────────────▶│
   │                           │                          │               │
   │                           │◀── { status, score, feedback } ─────────│
   │                           │                          │               │
   │                           │ Update Submission in DB   │               │
   │ ◀── { status, score,     │                          │               │
   │       ai_feedback, ... }  │                          │               │
```

### Flow 3: Leaderboard Calculation

```
GET /leaderboard
       │
       ▼
Fetch ALL users
       │
       ▼
For each user → get all submissions where status = "accepted"
       │
       ▼
Group by problem_id → keep MAX score per problem
       │
       ▼
Sum all max scores = total_score
Count distinct problems = problems_solved
       │
       ▼
Sort by total_score descending → assign ranks
       │
       ▼
Return leaderboard array
```

---

## 12. API Endpoint Reference

### Public Endpoints (No Auth)

| Method | Endpoint                      | Description                  |
| ------ | ----------------------------- | ---------------------------- |
| `GET`  | `/`                           | Health check                 |
| `GET`  | `/problems`                   | List all problems            |
| `GET`  | `/problems/{id}`              | Get single problem           |
| `GET`  | `/problems/{id}/testcases`    | Get sample test cases        |
| `GET`  | `/leaderboard`                | Get ranked leaderboard       |
| `GET`  | `/auth/github/callback?code=` | GitHub OAuth callback        |
| `POST` | `/auth/login`                 | Username/password login      |

### Authenticated Endpoints (Need `Bearer` token)

| Method | Endpoint                          | Role Required        | Description                          |
| ------ | --------------------------------- | -------------------- | ------------------------------------ |
| `GET`  | `/auth/me`                        | Any logged-in user   | Get current user profile + stats     |
| `POST` | `/problems/{id}/start`            | Any logged-in user   | Create GitHub repo for the problem   |
| `POST` | `/problems/{id}/submit`           | Any logged-in user   | Submit solution for AI judging       |
| `POST` | `/problems`                       | Faculty / Admin      | Create a new problem                 |
| `GET`  | `/faculty/problems`               | Faculty / Admin      | List problems created by this faculty|
| `GET`  | `/faculty/analytics/{problem_id}` | Faculty / Admin      | Get submission analytics             |
| `GET`  | `/admin/users`                    | Admin only           | List all users                       |
| `PUT`  | `/admin/users/{user_id}/role`     | Admin only           | Change a user's role                 |

---

## 13. Critical Gotchas & Common Questions

### 🔴 Critical Issues to Know About

1. **JWT Expiry is 15 minutes, not 1 week**
   - `ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7` is defined but **never used**.
   - `create_access_token()` defaults to `timedelta(minutes=15)` when `expires_delta` is not passed.
   - Users will be silently logged out after 15 minutes.

2. **Duplicate `get_session()` functions**
   - `main.py` line 23 and `auth.py` line 26 both define `get_session()`.
   - They create separate engine instances. This works because they use the same `DATABASE_URL`, but it's fragile.

3. **Repo name is generated in TWO places**
   - `repo_manager.py:14` and `main.py:184` both compute the repo name.
   - If you change the naming logic in one place, you MUST change the other, or the judge won't find the code.

4. **The AI Judge does NOT execute code**
   - It's a prompt-based analysis using Gemini. It can be wrong.
   - There's no sandboxed code execution, no Docker containers, no actual test running.

5. **`passlib` is missing from `requirements.txt`**
   - `auth.py` imports `from passlib.context import CryptContext` but `passlib` and `bcrypt` are not in `requirements.txt`.

6. **The `redis` package is installed but never used**
   - It's in `requirements.txt` but there's zero Redis code in the project. Can be removed.

7. **`commit_code_to_repo()` is never called**
   - The function exists in `repo_manager.py` but no route uses it. It was designed for future in-browser editor functionality.

### 🟡 Common Questions

**Q: How does a student's code get to the judge?**
A: The student writes code directly on GitHub (in the auto-created repo). When they hit "Submit", the backend uses the student's GitHub OAuth token to fetch `solution.py` from the repo's `main` branch via GitHub API.

**Q: Why SQLite and not PostgreSQL?**
A: `.env` sets `DATABASE_URL=sqlite:///./minicode.db`. The code supports both (there's a `connect_args` check for SQLite's `check_same_thread`). For production, change the URL to a PostgreSQL connection string.

**Q: How are roles assigned?**
A: New users from GitHub OAuth default to `"student"`. Only the seeded admin/faculty have other roles. An admin can change roles via `PUT /admin/users/{id}/role`.

**Q: What happens if the GitHub repo doesn't exist when submitting?**
A: `judge.py` catches the exception and stores `"# Error fetching code: {error}"` as the code content. The AI judge will then see this error message and likely return a failure status.

**Q: Can I run this without Gemini API?**
A: The judge will return `None` with `"AI Judge unavailable (API key missing)"`, and the submission will be marked as `"error"`.

---

## 14. How to Build This From Scratch

If you want to recreate this project manually, here's the step-by-step order:

### Step 1: Setup
```bash
mkdir backend && cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi sqlmodel python-dotenv pygithub httpx uvicorn python-jose[cryptography] google-genai passlib[bcrypt]
```

### Step 2: Create `.env` File
Set up all the environment variables listed in [Section 3](#3-environment-variables).

### Step 3: Define Models (`models.py`)
Create the 4 SQLModel classes in this order (due to foreign key dependencies):
1. `User` (no foreign keys)
2. `Problem` (FK → User for `author_id`)
3. `TestCase` (FK → Problem)
4. `Submission` (FK → User + Problem)

> **Tip**: Use `Optional[int]` for primary keys so SQLModel auto-generates them. Define `Relationship()` on both sides for back-population.

### Step 4: Build Auth (`auth.py`)
1. Setup `CryptContext` with bcrypt
2. Write `get_github_user_info()` — async function that calls GitHub API
3. Write `create_access_token()` — encodes JWT with `python-jose`
4. Write `get_current_user()` — FastAPI dependency that extracts and verifies JWT from Bearer header
5. Write `require_role()` — factory for role-based dependencies

### Step 5: Build Repo Manager (`repo_manager.py`)
1. Write `create_student_repo()` — uses PyGitHub to create repos with starter files
2. Decide on a consistent repo naming convention

### Step 6: Build Judge (`judge.py`)
1. Write `run_ai_judge()` — constructs a prompt, sends to Gemini, parses JSON response
2. Write `judge_submission()` — fetches code from GitHub, calls AI judge, updates DB

### Step 7: Wire Everything in `main.py`
1. Create FastAPI app with lifespan handler
2. Add CORS middleware
3. Define all routes in logical groups
4. Use `Depends()` for session, auth, and role injection

### Step 8: Seed the Database (`seed.py`)
1. Create admin and faculty users with hashed passwords
2. Create sample problems with test cases

### Step 9: Run
```bash
# Seed the database first
python seed.py

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Visit `http://localhost:8000/docs` for auto-generated Swagger UI.

---

## 15. Learning Resources

Everything a developer needs to learn each technology used in this project — official docs, YouTube tutorials, blogs, and courses.

---

### 🐍 Python (Core Language)

| Type | Resource | Link |
| ---- | -------- | ---- |
| 📚 Docs | Official Python Docs | https://docs.python.org/3/ |
| 🎥 YouTube | Python Full Course — Bro Code (12hrs, from zero) | https://www.youtube.com/watch?v=XKHEtdqhLK8 |
| 🎥 YouTube | Python for Beginners — Programming with Mosh | https://www.youtube.com/watch?v=kqtD5dpn9C8 |
| 🎥 YouTube | Intermediate Python — Tech With Tim | https://www.youtube.com/watch?v=HGOBQPFzWKo |
| 📝 Blog | Real Python (best Python tutorials site) | https://realpython.com/ |
| 📝 Blog | Python Type Hints Explained | https://realpython.com/python-type-checking/ |
| 🎓 Course | Python for Everybody (Free) — Coursera | https://www.coursera.org/specializations/python |

**Key topics to learn**: async/await, type hints, decorators, dependency injection pattern, context managers (`with` statement).

---

### ⚡ FastAPI (Web Framework)

| Type | Resource | Link |
| ---- | -------- | ---- |
| 📚 Docs | Official FastAPI Tutorial (excellent, start here!) | https://fastapi.tiangolo.com/tutorial/ |
| 🎥 YouTube | FastAPI Full Course — Sanjeev Thiyagarajan (19hrs) | https://www.youtube.com/watch?v=0sOvCWFmrtA |
| 🎥 YouTube | FastAPI Crash Course — TechWithTim | https://www.youtube.com/watch?v=62pP9pfzNRs |
| 🎥 YouTube | FastAPI + React Full Stack — freeCodeCamp | https://www.youtube.com/watch?v=Gf_xjMGCbCM |
| 📝 Blog | Build a REST API with FastAPI | https://realpython.com/fastapi-python-web-apis/ |
| 📝 Blog | FastAPI Dependency Injection Explained | https://fastapi.tiangolo.com/tutorial/dependencies/ |

**Key concepts for this project**:
- `@app.get()` / `@app.post()` decorators → define routes
- `Depends()` → dependency injection (used for DB sessions, auth)
- `lifespan` → startup/shutdown events
- Pydantic `BaseModel` → request body validation
- CORS middleware → allows frontend to call backend
- Auto-generated docs at `/docs` (Swagger UI)

---

### 🗃️ SQLModel (ORM — Database Layer)

| Type | Resource | Link |
| ---- | -------- | ---- |
| 📚 Docs | Official SQLModel Docs (by the FastAPI creator!) | https://sqlmodel.tiangolo.com/ |
| 🎥 YouTube | SQLModel Crash Course — Eric Roby | https://www.youtube.com/watch?v=aZMhfKPTih0 |
| 🎥 YouTube | SQLModel + FastAPI Tutorial | https://www.youtube.com/watch?v=kY1l2DlCNH4 |
| 📝 Blog | SQLModel vs SQLAlchemy vs Pydantic | https://sqlmodel.tiangolo.com/learn/why/ |

**Key concepts for this project**:
- `SQLModel` class = both a database table AND a Pydantic model
- `Field()` → column config (primary_key, foreign_key, index, unique, default)
- `Relationship()` → ORM relationships (one-to-many, many-to-one)
- `Session` → database connection context
- `session.exec(select(Model).where(...))` → querying
- `session.add()` / `session.commit()` / `session.refresh()` → writing

> 💡 **Tip**: If you already know SQLAlchemy, SQLModel is just a thin wrapper. If you know Pydantic, the model syntax will feel familiar.

---

### 🔐 Authentication — JWT + OAuth

#### JWT (JSON Web Tokens)

| Type | Resource | Link |
| ---- | -------- | ---- |
| 📚 Docs | JWT.io — Interactive JWT Debugger | https://jwt.io/ |
| 🎥 YouTube | JWT Explained in 5 Minutes — ByteByteGo | https://www.youtube.com/watch?v=7Q17ubqLfaM |
| 🎥 YouTube | JWT Auth with FastAPI — Pretty Printed | https://www.youtube.com/watch?v=5N3dpSahSJE |
| 📝 Blog | FastAPI Security Tutorial (Official) | https://fastapi.tiangolo.com/tutorial/security/ |
| 📝 Blog | Understanding JWT — Auth0 | https://auth0.com/learn/json-web-tokens/ |

**How JWT works in this project**:
1. User logs in → backend creates a JWT with `{"sub": "username", "exp": timestamp}`
2. JWT is signed with `JWT_SECRET` using HS256 algorithm
3. Frontend stores JWT in `localStorage`
4. Every API request includes `Authorization: Bearer <jwt>` header
5. Backend decodes + verifies JWT on each request via `get_current_user()` dependency

#### GitHub OAuth 2.0

| Type | Resource | Link |
| ---- | -------- | ---- |
| 📚 Docs | GitHub OAuth Docs (Official) | https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps |
| 🎥 YouTube | OAuth 2.0 Explained Simply — ByteByteGo | https://www.youtube.com/watch?v=ZV5yTm4pT8g |
| 🎥 YouTube | GitHub OAuth in 10 Minutes | https://www.youtube.com/watch?v=PUoO4dB3RF4 |
| 📝 Blog | OAuth 2.0 Simplified — Aaron Parecki | https://aaronparecki.com/oauth-2-simplified/ |

**OAuth flow in this project**:
```
Frontend → GitHub (authorize) → GitHub → Backend (exchange code for token) → GitHub API (/user) → Create user in DB → Return JWT
```

#### Password Hashing (bcrypt via passlib)

| Type | Resource | Link |
| ---- | -------- | ---- |
| 📚 Docs | Passlib Docs — bcrypt | https://passlib.readthedocs.io/en/stable/ |
| 🎥 YouTube | How bcrypt Works — Computerphile | https://www.youtube.com/watch?v=O6cmuiTBZVs |
| 📝 Blog | Password Hashing with FastAPI | https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/ |

---

### 🐙 GitHub API (PyGitHub)

| Type | Resource | Link |
| ---- | -------- | ---- |
| 📚 Docs | PyGitHub Documentation | https://pygithub.readthedocs.io/en/stable/ |
| 📚 Docs | GitHub REST API Docs | https://docs.github.com/en/rest |
| 🎥 YouTube | GitHub API Tutorial — Tech With Tim | https://www.youtube.com/watch?v=LmpAO9Iu9O0 |
| 📝 Blog | Automate GitHub with Python | https://realpython.com/github-api-python/ |

**Used in this project for**:
- Creating private repos for each student-problem pair
- Fetching `solution.py` from student's repo for judging
- Updating README with problem description
- Creating starter code files

**Key PyGitHub methods**:
```python
g = Github(access_token)
user = g.get_user()
repo = user.create_repo(name, private=True, auto_init=True)
content = repo.get_contents("solution.py", ref="main")
code = content.decoded_content.decode("utf-8")
repo.create_file("path", "commit msg", "content", branch="main")
repo.update_file("path", "commit msg", "content", sha, branch="main")
```

---

### 🤖 Google Gemini AI (Code Judge)

| Type | Resource | Link |
| ---- | -------- | ---- |
| 📚 Docs | Google Gemini API Docs | https://ai.google.dev/gemini-api/docs |
| 📚 Docs | google-genai Python SDK | https://googleapis.github.io/python-genai/ |
| 🎥 YouTube | Gemini API Full Tutorial — Code With Ania Kubów | https://www.youtube.com/watch?v=jMe1hYDMupM |
| 🎥 YouTube | Building with Gemini API — Google Official | https://www.youtube.com/watch?v=eLx8TjnTCp4 |
| 📝 Blog | Google AI Studio (get API key here) | https://aistudio.google.com/ |
| 📝 Blog | Prompt Engineering Guide | https://www.promptingguide.ai/ |

**How it's used in this project**:
```python
from google import genai

client = genai.Client(api_key="...")
response = await client.aio.models.generate_content(
    model='gemini-2.5-flash',
    contents=prompt_string
)
result = response.text  # Parse as JSON
```

**Key concept**: The AI judge doesn't execute code — it reads the code + test cases and predicts whether the solution is correct. Understanding prompt engineering helps you improve judge accuracy.

---

### 🌐 HTTPX (Async HTTP Client)

| Type | Resource | Link |
| ---- | -------- | ---- |
| 📚 Docs | HTTPX Official Docs | https://www.python-httpx.org/ |
| 🎥 YouTube | HTTPX vs Requests — ArjanCodes | https://www.youtube.com/watch?v=OPyoXx0yA0I |

**Used in this project for**: Exchanging the GitHub OAuth code for an access token (async POST to GitHub's token endpoint).

```python
async with httpx.AsyncClient() as client:
    response = await client.post(url, params={...}, headers={...})
    data = response.json()
```

---

### 🔧 Uvicorn (ASGI Server)

| Type | Resource | Link |
| ---- | -------- | ---- |
| 📚 Docs | Uvicorn Official Docs | https://www.uvicorn.org/ |
| 📝 Blog | ASGI vs WSGI Explained | https://fastapi.tiangolo.com/deployment/ |

**Key commands**:
```bash
# Development (with auto-reload)
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

### 🔑 python-dotenv (Environment Variables)

| Type | Resource | Link |
| ---- | -------- | ---- |
| 📚 Docs | python-dotenv PyPI | https://pypi.org/project/python-dotenv/ |
| 📝 Blog | Managing Env Variables in Python | https://dev.to/jakewitcher/using-env-files-for-environment-variables-in-python-applications-55a1 |

**Usage**: Create a `.env` file → call `load_dotenv()` → use `os.getenv("KEY")`.

---

### 📐 General Architecture & Design Patterns

| Type | Resource | Link |
| ---- | -------- | ---- |
| 🎥 YouTube | REST API Design Best Practices — ByteByteGo | https://www.youtube.com/watch?v=-mN3VyJuCjM |
| 🎥 YouTube | System Design for Beginners — freeCodeCamp | https://www.youtube.com/watch?v=m8Icp_Cid5o |
| 🎥 YouTube | Dependency Injection Explained — CodeAesthetic | https://www.youtube.com/watch?v=J1f5b4vcxCQ |
| 📝 Blog | RBAC (Role-Based Access Control) Explained | https://auth0.com/docs/manage-users/access-control/rbac |
| 📝 Blog | LeetCode System Design — How It Works | https://interviewing.io/guides/system-design-interview |
| 📝 Blog | Database Relationships Explained | https://hasura.io/learn/database/postgresql/relationships/ |

---

### 🎯 Recommended Learning Path (For Beginners)

If you're building this from scratch, learn in this order:

```
Week 1: Python Basics
  └── Variables, functions, classes, async/await, type hints
       │
Week 2: FastAPI Fundamentals
  └── Routes, request/response, Depends(), middleware, Pydantic
       │
Week 3: SQLModel + Databases
  └── Models, sessions, CRUD operations, relationships, migrations
       │
Week 4: Authentication
  └── JWT theory → bcrypt hashing → OAuth 2.0 flow → GitHub OAuth
       │
Week 5: External APIs
  └── GitHub API (PyGitHub) → Google Gemini API → HTTPX
       │
Week 6: Put It All Together
  └── Wire everything in main.py → seed data → test with Swagger UI
```

---

### 📺 Full-Stack Project Tutorials (Similar to This Project)

These tutorials build projects similar to MiniCode end-to-end:

| Resource | What It Covers | Link |
| -------- | -------------- | ---- |
| 🎥 FastAPI + React Full Stack (freeCodeCamp) | Full CRUD app with auth | https://www.youtube.com/watch?v=Gf_xjMGCbCM |
| 🎥 Build a LeetCode Clone — Kiran Dash | Full coding platform | https://www.youtube.com/watch?v=GnodkFKMBXk |
| 🎥 FastAPI Security Deep Dive — JVP Design | OAuth + JWT patterns | https://www.youtube.com/watch?v=6hTRw_HK3Ts |
| 📝 Full Stack FastAPI Template — Tiangolo | Official template project | https://github.com/fastapi/full-stack-fastapi-template |

---

> **Last Updated**: February 2026
> **Author**: Auto-generated developer documentation for the MiniCode backend.

