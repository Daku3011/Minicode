<!-- # Deep repo analysis for backend, frontend, infra + improvements

**Session ID:** ses_2bcb3b608ffe3ScfxVoJ0aVz6E
**Created:** 3/31/2026, 3:19:26 PM
**Updated:** 3/31/2026, 3:22:33 PM

---

## User

You are a senior software architect, backend engineer, and system design expert.

I will provide you with a full GitHub repository (codebase, folder structure, README, configs, etc.).

Your job is to perform a COMPLETE, DEEP, and HONEST analysis of the project.

🎯 Objectives

Analyze the project from ALL perspectives:

1. 📁 Repository & Architecture Analysis
Explain the full folder structure
Identify frontend, backend, database layers
Describe how components interact (flow of data)
Identify architecture style (monolith, microservices, etc.)
Draw a mental/system architecture diagram in text
2. ⚙️ Tech Stack Evaluation
List all technologies used
Evaluate if they are appropriate
Suggest better alternatives (if any)
Identify over-engineering or missing tools
3. 🧠 Backend Deep Analysis
Analyze API design (REST quality, structure)
Evaluate database usage (schema, indexing, ORM usage)
Check scalability (async handling, queues, workers)
Identify bottlenecks (CPU, DB, API calls, blocking code)
Evaluate security (auth, validation, rate limiting)
4. 🎨 Frontend Analysis
Analyze UI architecture (components, state management)
Performance issues (re-renders, API calls)
UX quality (flow, feedback, responsiveness)
Code quality and maintainability
5. 🚀 Performance & Scalability
Estimate how many users the system can handle
Identify scaling limits (API, DB, external services)
Suggest improvements (Redis, queues, load balancing, CDN)
Analyze caching strategy
6. 🔌 External Integrations
Evaluate usage of APIs (e.g., GitHub, AI APIs)
Identify rate limit risks
Suggest optimization strategies
7. 💰 Cost Estimation
Estimate hosting cost (low, medium, high scale)
Identify expensive operations (AI calls, DB, compute)
Suggest cost optimization
8. 🧪 Testing & Reliability
Check for testing setup (unit, integration)
Identify missing tests
Suggest monitoring/logging improvements
9. 🔐 Security Review
Check authentication (JWT, OAuth)
Identify vulnerabilities
Suggest improvements (sanitization, headers, secrets)
10. 📈 Production Readiness Score

Give:

Score out of 10
Is it:
Beginner project
Intermediate
Production-ready
Startup-level
11. 🚨 Critical Issues

List:

Top 5 MUST-FIX issues before deployment
12. 🚀 Improvement Roadmap

Give:

Step-by-step plan to scale this to:
100 users
1000 users
10,000 users
13. 💡 Unique Ideas

Suggest:

Features to make it stand out (hackathon / startup level)
AI integrations or advanced features
Output Format
Use clear sections
Be brutally honest
Do NOT sugarcoat
Give practical, real-world advice 

--- -->

## Assistant (Build · mimo-v2-omni-free · 3.3s)

_Thinking:_

I'll start by exploring the repository structure to understand the project. Let me first read the README and examine the folder structure.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode</path>
<type>directory</type>
<entries>
.env
.env.example
.git/
.gitignore
backend/
DEPLOYMENT.md
design_assets/
DESIGN_VISION.md
docker-compose.yml
frontend/
load_test.js
node_modules/
RAILWAY_DEPLOYMENT.md
railway.json
README.md
render.yaml
test.Dockerfile

(17 entries)
</entries>
```

---

## Assistant (Build · mimo-v2-omni-free · 2.3s)

_Thinking:_

Let me read the README first to understand the project overview.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/README.md"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/README.md</path>
<type>file</type>
<content>1: <p align="center">
2:   <img src="https://img.shields.io/badge/MiniCode-AI_Powered_Coding_Arena-8B5CF6?style=for-the-badge&labelColor=0F172A" alt="MiniCode Badge" />
3: </p>
4: 
5: <h1 align="center">⚡ MiniCode</h1>
6: 
7: <p align="center">
8:   <strong>An Elite, AI-Powered Competitive Coding Platform with Real-World GitHub Workflows</strong>
9: </p>
10: 
11: <p align="center">
12:   <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
13:   <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
14:   <img src="https://img.shields.io/badge/Celery-Distributed_Workers-37814A?style=flat-square&logo=celery" alt="Celery" />
15:   <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql" alt="PostgreSQL" />
16:   <img src="https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis" alt="Redis" />
17:   <img src="https://img.shields.io/badge/Gemini_2.5_Flash-AI_Judge-4285F4?style=flat-square&logo=google" alt="Gemini AI" />
18: </p>
19: 
20: ---
21: 
22: ## 🎯 What is MiniCode?
23: 
24: MiniCode is a **full-stack competitive programming platform** designed to elevate modern educational institutions. Unlike traditional online judges that rely on isolated, built-in code editors, MiniCode bridges the gap between academic coding exercises and **real-world software engineering**.
25: 
26: We require students to navigate **actual GitHub workflows**. Faculty upload problem statements, and students provision private automated GitHub repositories, code completely in their local environments, push their solutions, and submit their real-world workflows for evaluation by our advanced **Gemini AI Judge**. 
27: 
28: ---
29: 
30: ## ✨ Key Features
31: 
32: ### 🚀 Massive Scale: Celery, Redis, & Postgres (NEW)
33: We have overhauled the backend infrastructure to handle high-traffic concurrency required during active hackathons:
34: - **Asynchronous Judging:** Evaluating code with AI is now fully offloaded to a detached **Celery Worker Group**, backed by a **Redis Broker**. This prevents the main API thread from blocking.
35: - **Enterprise DB:** The platform has been fully upgraded from local SQLite to a robust **PostgreSQL 15** deployment capable of handling massive transactional volumes.
36: - **Intensive Performance Caching:** GitHub repos, analytical queries, and problem data are violently cached using `FastAPICache2` linked directly into a **Redis Cache Instance**, radically speeding up endpoint loading times.
37: - **Battle-Tested:** The `load_test.js` K6 suite validates stable throughput for >200 concurrent active users.
38: 
39: ### 🕵️‍♂️ Strict AI Plagiarism & Generation Detection
40: We've integrated a powerful anti-cheating mechanism directly into the AI Judge:
41: - **Commit History Analysis:** The platform fetches the latest commits from the student's repository. Plagiarized or purely AI-generated submissions typically lack iterative, human-like commit histories.
42: - **Pattern Matching:** The AI aggressively scans for generic variable names, hallmark AI boilerplate code, and excessively explanatory comments.
43: - **Red Flag Warnings:** If the judge determines the code has an AI-generation probability of > 60%, it injects a highly visible **Red HTML Warning Block** directly into the feedback interface, immediately alerting reviewing faculty.
44: 
45: ### 🧠 Advanced AI-Powered Judging (Gemini 2.5 Flash)
46: - **Direct GitHub Integration:** Fetches student code seamlessly from their synced GitHub repository.
47: - **Structured Evaluation:** Evaluates logical correctness against faculty-defined test cases.
48: - **Comprehensive Feedback:** Returns structured scoring (0–100) alongside detailed markdown feedback covering:
49:   - ✅ Correctness analysis
50:   - 📊 Time & space complexity evaluation
51:   - 💡 Code quality and stylistic suggestions
52:   - 🔍 Adaptive hints for incorrect solutions (without revealing the full answer)
53: 
54: ### 🐙 True GitHub-Native Workflow
55: ```text
56: Student clicks "Provision Repository"
57:        ↓
58: Private repo auto-created and linked on student's GitHub account
59:        ↓
60: Student clones → writes code locally → pushes iterative commits to `main`
61:        ↓
62: Clicks "Sync & Evaluate" → Submits job to Celery Worker Queue
63:        ↓
64: AI Judge analyzes code AND commit history heavily using Redis caching
65:        ↓
66: Score + detailed AI feedback + Plagiarism checks displayed instantly via polling/refresh
67: ```
68: 
69: ---
70: 
71: ## 🏗️ System Architecture
72: 
73: ```text
74: ┌──────────────────────────────────────────────────┐
75: │                   Frontend                       │
76: │           Next.js 16 + TailwindCSS 4             │
77: │     React 19 · Framer Motion · Lucide Icons      │
78: └────────────────────┬─────────────────────────────┘
79:                      │ HTTP / JWT
80:                      ▼
81: ┌─────────────────────────────────────────────────┐
82: │                   Backend                       │
83: │              FastAPI + Uvicorn                  │
84: │                                                 │
85: │  Auth     ── GitHub OAuth + Password (bcrypt)   │
86: │  Cache    ── FastAPICache + Redis Server        │
87: │  Repos    ── PyGithub Native Integration        │
88: │  DB       ── PostgreSQL (Scaleable Prod DB)     │
89: └────────────────────┬─────────────────────────────┘
90:                      │ Message Broker / Jobs
91:                      ▼
92: ┌─────────────────────────────────────────────────┐
93: │           Celery Async AI Workers               │
94: │                                                 │
95: │  Judge    ── Gemini AI Analysis + Commit Checks │
96: │  Queue    ── Background job dispatcher          │
97: └─────────────────────────────────────────────────┘
98: ```
99: 
100: ---
101: 
102: ## 🚀 Quick Start Guide
103: 
104: ### Prerequisites
105: - **Python 3.10+**
106: - **Node.js 18+**
107: - **Docker Compose** (Required for scaling stack)
108: - A [GitHub OAuth App](https://github.com/settings/developers)
109: - A [Google Gemini API Key](https://aistudio.google.com/apikey)
110: 
111: ### 1. Clone the Repository
112: ```bash
113: git clone https://github.com/your-username/LeetCodeCodingClub.git
114: cd LeetCodeCodingClub
115: ```
116: 
117: ### 2. Full Up Scale (Docker Recommended)
118: The infrastructure requires Postgres, Redis, Celery, and the Backend API. Docker compose automatically links them all:
119: ```bash
120: cp .env.example .env
121: # Edit .env with your acquired GitHub OAuth and Gemini API keys!
122: docker compose up --build
123: ```
124: 
125: **Wait for the database container to stand up, then run the DB initialization & seeder on the backend container:**
126: ```bash
127: docker compose exec backend python seed.py
128: ```
129: 
130: Visit **[http://localhost:3000](http://localhost:3000)** and start coding! 🎉
131: 
132: ---
133: 
134: ## 🧪 K6 Load Testing
135: 
136: MiniCode ships with a high-concurrency stress testing script to validate the caching layers and Database connection pooling limits. 
137: 
138: Ensure the backend stack is fully running via Docker, then run k6 locally against the load endpoints.
139: ```bash
140: k6 run load_test.js
141: ```
142: The test suite validates 95th-percentile response limits under staged loading targeting 50, then 100, then 200 concurrent virtual users.
143: 
144: ---
145: 
146: ## 🔑 Default Sandbox Accounts
147: 
148: After running `seed.py`, use these accounts to test the platform:
149: 
150: | Username | Password | Role |
151: |----------|----------|------|
152: | `admin` | `admin` | **Admin** — full system access |
153: | `facultyname` | `password` | **Faculty** — problem management |
154: | *GitHub Login* | *OAuth* | **Student** — solve & submit |
155: 
156: ---
157: 
158: ## 🛠️ Tech Stack Matrix
159: 
160: | Layer | Core Technology | Purpose |
161: |-------|-----------|---------|
162: | **Frontend Framework** | Next.js 16, React 19 | Fast SSR, modern routing, UI framework |
163: | **Styling & UX** | TailwindCSS 4, Framer Motion | Fluid design system, slick animations |
164: | **Backend API** | FastAPI, Uvicorn | Lightning-fast REST API, full async support |
165: | **Background Jobs** | Celery + Redis Broker | Dedicated AI grading workers unblocking Node threads |
166: | **Caching Layer** | Redis 7 + FastAPICache | Ultra-fast endpoint memory acceleration |
167: | **ORM & Database** | SQLModel / PostgreSQL 15 | Robust scaleable dataset query processing |
168: | **Security & Auth** | JWT, bcrypt, slowapi, GitHub OAuth | Zero-trust multi-role authentication & rate tracking |
169: | **AI Processing** | Google Gemini 2.5 Flash | Real-time code evaluation & plagiarism detection |
170: 
171: ---
172: 
173: ## 📈 Roadmap
174: 
175: - [x] Code plagiarism & AI generation detection
176: - [x] Fully distributed load-scale architecture (Celery, Postgres, Redis)
177: - [ ] Traditional test-case-based judge (Docker sandboxed isolated execution via OpenEnv)
178: - [ ] Multiple modular AI Judge personas (CTO, Professor, Roast mode)
179: - [ ] Real-time leaderboard push updates via WebSockets
180: - [ ] Submission history with visual diff comparisons
181: - [ ] Multi-team based competitive tournaments
182: 
183: ---
184: 
185: ## 👥 Authors
186: 
187: Built by **Daku3011**

(End of file - total 187 lines)
</content>
```

---

## Assistant (Build · mimo-v2-omni-free · 3.4s)

_Thinking:_

Now let me explore the backend structure in detail. First, let me see the backend directory.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/backend"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/backend</path>
<type>directory</type>
<entries>
__pycache__/
.dockerignore
.env
.pytest_cache/
auth.py
Dev.md
Dockerfile
judge.py
main.py
minicode.db
models.py
repo_manager.py
requirements.txt
seed.py
tests/
venv/
worker.py

(17 entries)
</entries>
```

---

## Assistant (Build · mimo-v2-omni-free · 9.8s)

_Thinking:_

Let me also check the frontend structure.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/frontend"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/frontend</path>
<type>directory</type>
<entries>
__tests__/
.dockerignore
.env.local
.gitignore
.next/
Dockerfile
eslint.config.mjs
next-env.d.ts
next.config.ts
node_modules/
package-lock.json
package.json
postcss.config.mjs
public/
README.md
src/
stitch_templates/
tsconfig.json
vitest.config.mts

(19 entries)
</entries>
```

---

## Assistant (Build · mimo-v2-omni-free · 3.2s)

_Thinking:_

Now let me read the backend main files to understand the backend architecture. I'll read the main.py, auth.py, models.py, and worker.py.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/backend/main.py"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/backend/main.py</path>
<type>file</type>
<content>1: import os
2: from datetime import datetime
3: from fastapi import FastAPI, Depends, HTTPException, Request
4: from fastapi.middleware.cors import CORSMiddleware
5: from sqlmodel import SQLModel, Session, create_engine, select
6: from typing import List, Optional
7: from dotenv import load_dotenv
8: import httpx
9: from fastapi.security import OAuth2PasswordRequestForm
10: from auth import verify_password
11: from pydantic import BaseModel, field_validator
12: import uvicorn
13: import logging
14: from slowapi import Limiter, _rate_limit_exceeded_handler
15: from slowapi.util import get_remote_address
16: from slowapi.errors import RateLimitExceeded
17: from fastapi.middleware.trustedhost import TrustedHostMiddleware
18: from starlette.middleware.base import BaseHTTPMiddleware
19: from fastapi_cache import FastAPICache
20: from fastapi_cache.backends.redis import RedisBackend
21: from fastapi_cache.decorator import cache
22: from redis import asyncio as aioredis
23: import bleach
24: 
25: load_dotenv()
26: 
27: logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
28: logger = logging.getLogger(__name__)
29: 
30: limiter = Limiter(key_func=get_remote_address)
31: 
32: 
33: from models import User, Problem, Submission, TestCase
34: from auth import get_current_user, create_access_token, get_github_user_info, get_session, require_admin, require_faculty
35: from repo_manager import create_student_repo
36: from judge import judge_submission
37: 
38: DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/minicode")
39: 
40: # Connection pooling for high-traffic production use
41: if DATABASE_URL.startswith("sqlite"):
42:     connect_args = {"check_same_thread": False}
43:     engine = create_engine(DATABASE_URL, connect_args=connect_args)
44: else:
45:     engine = create_engine(
46:         DATABASE_URL,
47:         pool_size=20,           # Max persistent connections
48:         max_overflow=10,        # Extra connections under load
49:         pool_pre_ping=True,     # Verify connections before use
50:         pool_recycle=300,       # Recycle connections every 5 min
51:     )
52: 
53: def create_db_and_tables():
54:     SQLModel.metadata.create_all(engine)
55: 
56: if __name__ == "__main__" and os.getenv("CREATE_TABLES"):
57:     create_db_and_tables()
58:     print("Tables created successfully")
59:     if os.getenv("ONLY_CREATE_TABLES"):
60:         import sys
61:         sys.exit(0)
62: 
63: def get_session():
64:     with Session(engine) as session:
65:         yield session
66: 
67: from contextlib import asynccontextmanager
68: 
69: @asynccontextmanager
70: async def lifespan(app: FastAPI):
71:     # Startup logic: Database tables are created via preDeployCommand (Render)
72:     # or manually to avoid race conditions between Gunicorn workers.
73:     redis_url = os.getenv("REDIS_URL")
74:     if redis_url:
75:         try:
76:             redis = aioredis.from_url(redis_url)
77:             await redis.ping()
78:             FastAPICache.init(RedisBackend(redis), prefix="minicode-cache")
79:             logger.info("Redis cache initialized")
80:         except Exception as e:
81:             logger.warning(f"Failed to connect to Redis: {e}. Falling back to InMemoryBackend")
82:             from fastapi_cache.backends.inmemory import InMemoryBackend
83:             FastAPICache.init(InMemoryBackend(), prefix="minicode-cache")
84:     else:
85:         from fastapi_cache.backends.inmemory import InMemoryBackend
86:         FastAPICache.init(InMemoryBackend(), prefix="minicode-cache")
87:         logger.info("InMemory cache initialized (No REDIS_URL provided)")
88:     yield
89:     # Shutdown logic (if any)
90: 
91: app = FastAPI(title="MiniCode API", lifespan=lifespan)
92: app.state.limiter = limiter
93: app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
94: 
95: class SecurityHeadersMiddleware(BaseHTTPMiddleware):
96:     async def dispatch(self, request, call_next):
97:         response = await call_next(request)
98:         response.headers["X-Content-Type-Options"] = "nosniff"
99:         response.headers["X-Frame-Options"] = "DENY"
100:         response.headers["X-XSS-Protection"] = "1; mode=block"
101:         
102:         # Omit HSTS on localhost to prevent forcing HTTPS in dev
103:         host = request.headers.get("host", "")
104:         if not ("localhost" in host or "127.0.0.1" in host):
105:             response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
106:             
107:         return response
108: 
109: app.add_middleware(SecurityHeadersMiddleware)
110: 
111: # CORS: Read allowed origins from env (comma-separated), default "*" for dev
112: cors_origins_str = os.getenv("CORS_ORIGINS", "*")
113: cors_origins = [o.strip() for o in cors_origins_str.split(",")] if cors_origins_str != "*" else ["*"]
114: 
115: app.add_middleware(
116:     CORSMiddleware,
117:     allow_origins=cors_origins,
118:     allow_credentials=True,
119:     allow_methods=["*"],
120:     allow_headers=["*"],
121: )
122: 
123: @app.get("/")
124: def read_root():
125:     return {"message": "Welcome to MiniCode API"}
126: 
127: @app.get("/health")
128: def health_check():
129:     """Health check endpoint for load balancers and Render."""
130:     return {"status": "healthy"}
131: 
132: # Problem Endpoints
133: @app.get("/problems", response_model=List[Problem])
134: @cache(expire=300)
135: def get_problems(session: Session = Depends(get_session)):
136:     return session.exec(select(Problem)).all()
137: 
138: @app.get("/problems/{problem_id}")
139: @cache(expire=300)
140: def get_problem(problem_id: int, session: Session = Depends(get_session)):
141:     problem = session.get(Problem, problem_id)
142:     if not problem:
143:         raise HTTPException(status_code=404, detail="Problem not found")
144:     return problem
145: 
146: @app.get("/problems/{problem_id}/testcases")
147: def get_problem_testcases(problem_id: int, session: Session = Depends(get_session)):
148:     """Return sample test cases for display on the problem page."""
149:     test_cases = session.exec(select(TestCase).where(TestCase.problem_id == problem_id)).all()
150:     # Only return sample test cases to students (is_sample=True)
151:     samples = [tc for tc in test_cases if tc.is_sample]
152:     # If no samples marked, return all (for problems without is_sample distinction)
153:     if not samples:
154:         samples = test_cases
155:     return [{"id": tc.id, "input": tc.input_data, "expected_output": tc.expected_output} for tc in samples]
156: 
157: @app.post("/problems", response_model=Problem)
158: def create_problem(
159:     problem: Problem, 
160:     user: User = Depends(require_faculty), 
161:     session: Session = Depends(get_session)
162: ):
163:     # Input validation / sanitization
164:     problem.title = bleach.clean(problem.title)
165:     allowed_tags = list(bleach.sanitizer.ALLOWED_TAGS) + ['p', 'h1', 'h2', 'h3', 'strong', 'em', 'code', 'pre', 'ul', 'li', 'ol']
166:     problem.description = bleach.clean(problem.description, tags=allowed_tags)
167:     
168:     problem.author_id = user.id
169:     session.add(problem)
170:     session.commit()
171:     session.refresh(problem)
172:     return problem
173: 
174: # Auth Endpoints
175: @app.get("/auth/github/callback")
176: @limiter.limit("10/minute")
177: async def github_callback(request: Request, code: str, redirect_uri: Optional[str] = None, session: Session = Depends(get_session)):
178:     # Exchange code for token
179:     params = {
180:         "client_id": os.getenv("GITHUB_CLIENT_ID"),
181:         "client_secret": os.getenv("GITHUB_CLIENT_SECRET"),
182:         "code": code
183:     }
184:     if redirect_uri:
185:         params["redirect_uri"] = redirect_uri
186: 
187:     async with httpx.AsyncClient() as client:
188:         response = await client.post(
189:             "https://github.com/login/oauth/access_token",
190:             params=params,
191:             headers={"Accept": "application/json"}
192:         )
193:         token_data = response.json()
194:         access_token = token_data.get("access_token")
195:     
196:     if not access_token:
197:         error_desc = token_data.get("error_description", token_data.get("error", "Unknown error"))
198:         logger.error(f"GitHub OAuth error: {token_data}")
199:         raise HTTPException(status_code=400, detail=f"GitHub OAuth failed: {error_desc}")
200:     
201:     # Get user info
202:     github_user = await get_github_user_info(access_token)
203:     
204:     # Create or update user
205:     statement = select(User).where(User.github_id == github_user["id"])
206:     user = session.exec(statement).first()
207:     
208:     if not user:
209:         user = User(
210:             username=github_user["login"],
211:             email=github_user.get("email") or f"{github_user['login']}@github.com",
212:             full_name=github_user.get("name"),
213:             avatar_url=github_user.get("avatar_url"),
214:             github_id=github_user["id"],
215:             github_access_token=access_token
216:         )
217:         session.add(user)
218:     else:
219:         user.github_access_token = access_token
220:     
221:     session.commit()
222:     session.refresh(user)
223:     
224:     # Create JWT
225:     token = create_access_token(data={"sub": user.username})
226:     return {"access_token": token, "token_type": "bearer"}
227: 
228: 
229: @app.post("/auth/login")
230: @limiter.limit("5/minute")
231: async def login(
232:     request: Request,
233:     form_data: OAuth2PasswordRequestForm = Depends(),
234:     session: Session = Depends(get_session)
235: ):
236:     # Username mapped to username field 
237:     user = session.exec(select(User).where(User.username == form_data.username)).first()
238:     
239:     if not user or not user.hashed_password:
240:         raise HTTPException(status_code=400, detail="Incorrect username or password")
241:     
242:     if not verify_password(form_data.password, user.hashed_password):
243:         raise HTTPException(status_code=400, detail="Incorrect username or password")
244:         
245:     token = create_access_token(data={"sub": user.username})
246:     return {"access_token": token, "token_type": "bearer"}
247: 
248: 
249: class SubmissionRequest(BaseModel):
250:     language: str
251: 
252:     @field_validator('language')
253:     @classmethod
254:     def validate_language(cls, v: str) -> str:
255:         allowed_languages = ['py', 'python', 'javascript', 'js', 'java', 'cpp', 'c', 'go', 'rs']
256:         if v.lower() not in allowed_languages:
257:             raise ValueError(f"Language must be one of {allowed_languages}")
258:         return v.lower()
259: 
260: # Problem Interaction
261: @app.post("/problems/{problem_id}/start")
262: async def start_problem(
263:     problem_id: int, 
264:     user: User = Depends(get_current_user), 
265:     session: Session = Depends(get_session)
266: ):
267:     problem = session.get(Problem, problem_id)
268:     if not problem:
269:         raise HTTPException(status_code=404, detail="Problem not found")
270:     
271:     repo_url = create_student_repo(user, problem, session)
272:     return {"repo_url": repo_url}
273: 
274: @app.post("/problems/{problem_id}/submit")
275: @limiter.limit("2/minute")
276: async def submit_problem(
277:     request: Request,
278:     problem_id: int,
279:     submission_req: SubmissionRequest,
280:     user: User = Depends(get_current_user),
281:     session: Session = Depends(get_session)
282: ):
283:     problem = session.get(Problem, problem_id)
284:     if not problem:
285:         raise HTTPException(status_code=404, detail="Problem not found")
286:     
287:     repo_name = f"minicode-{user.username}-{problem.title.lower().replace(' ', '-')}"
288:     repo_url = f"https://github.com/{user.username}/{repo_name}"
289:     
290:     submission = Submission(
291:         user_id=user.id,
292:         problem_id=problem.id,
293:         repo_url=repo_url,
294:         language=submission_req.language,
295:         status="pending"
296:     )
297:     session.add(submission)
298:     session.commit()
299:     session.refresh(submission)
300:     
301:     # Trigger judging via Celery
302:     try:
303:         from worker import process_submission_task
304:         process_submission_task.delay(submission.id)
305:     except Exception as e:
306:         logger.error(f"Failed to queue judge task: {e}")
307:         submission.status = "error"
308:         submission.ai_feedback = f"Failed to queue judge task: {str(e)}"
309:         session.add(submission)
310:         session.commit()
311:     
312:     # Refresh to get updated fields from the judge
313:     session.refresh(submission)
314:     
315:     return {
316:         "id": submission.id,
317:         "status": submission.status,
318:         "score": submission.score,
319:         "ai_feedback": submission.ai_feedback,
320:         "judge_output": submission.judge_output,
321:         "code_content": submission.code_content,
322:         "repo_url": submission.repo_url,
323:     }
324: 
325: @app.get("/submissions/{submission_id}")
326: def get_submission_status(
327:     submission_id: int, 
328:     session: Session = Depends(get_session),
329:     user: User = Depends(get_current_user)
330: ):
331:     submission = session.get(Submission, submission_id)
332:     if not submission:
333:         raise HTTPException(status_code=404, detail="Submission not found")
334:         
335:     # Security: Only allow user to check their own submissions (unless admin/faculty)
336:     if submission.user_id != user.id and user.role not in ["admin", "faculty"]:
337:         raise HTTPException(status_code=403, detail="Not authorized")
338:         
339:     return {
340:         "id": submission.id,
341:         "status": submission.status,
342:         "score": submission.score,
343:         "ai_feedback": submission.ai_feedback,
344:         "code_content": submission.code_content,
345:         "judge_output": submission.judge_output
346:     }
347: 
348: # Leaderboard Endpoint
349: @app.get("/leaderboard")
350: @cache(expire=300)
351: def get_leaderboard(session: Session = Depends(get_session)):
352:     users = session.exec(select(User)).all()
353:     leaderboard = []
354:     for user in users:
355:         # Calculate distinct problem accepted scores
356:         submissions = session.exec(select(Submission).where(Submission.user_id == user.id, Submission.status == "accepted")).all()
357:         # Get max score per problem
358:         problem_scores = {}
359:         for sub in submissions:
360:             if sub.problem_id not in problem_scores or sub.score > problem_scores[sub.problem_id]:
361:                 problem_scores[sub.problem_id] = sub.score
362:         
363:         total_score = sum(problem_scores.values())
364:         problems_solved = len(problem_scores)
365:         
366:         if total_score > 0:
367:             leaderboard.append({
368:                 "id": user.id,
369:                 "name": user.full_name or user.username,
370:                 "username": user.username,
371:                 "score": total_score,
372:                 "problems": problems_solved,
373:                 "avatar": user.avatar_url
374:             })
375:             
376:     # Sort by score descending
377:     leaderboard.sort(key=lambda x: x["score"], reverse=True)
378:     
379:     # Assign ranks
380:     for i, entry in enumerate(leaderboard):
381:         entry["rank"] = i + 1
382:         
383:     return leaderboard
384: 
385: # Faculty Analytics
386: @app.get("/faculty/problems", response_model=List[Problem])
387: def get_faculty_problems(user: User = Depends(require_faculty), session: Session = Depends(get_session)):
388:     return session.exec(select(Problem).where(Problem.author_id == user.id)).all()
389: 
390: @app.get("/faculty/analytics/{problem_id}")
391: def get_problem_analytics(
392:     problem_id: int, 
393:     user: User = Depends(require_faculty), 
394:     session: Session = Depends(get_session)
395: ):
396:     problem = session.get(Problem, problem_id)
397:     if not problem or (user.role != "admin" and problem.author_id != user.id):
398:         raise HTTPException(status_code=403, detail="Not authorized")
399:     
400:     submissions = session.exec(select(Submission).where(Submission.problem_id == problem_id)).all()
401:     
402:     return {
403:         "problem_title": problem.title,
404:         "total_submissions": len(submissions),
405:         "accepted_count": len([s for s in submissions if s.status == "accepted"]),
406:         "average_score": sum(s.score for s in submissions) / len(submissions) if submissions else 0
407:     }
408: 
409: # Admin User Management
410: @app.get("/admin/stats")
411: def get_admin_stats(admin: User = Depends(require_admin), session: Session = Depends(get_session)):
412:     users = session.exec(select(User)).all()
413:     submissions = session.exec(select(Submission)).all()
414:     api_usage = len(submissions) * 15 + 45200 # Computed representation of API calls
415:     alerts = len([s for s in submissions if s.status == "error" or s.status == "runtime_error"])
416:     
417:     return {
418:         "total_users": len(users),
419:         "api_usage": api_usage,
420:         "system_alerts": alerts,
421:         "db_health": "99.98%",
422:         "peak_concurrent": max(12, len(users) * 2)
423:     }
424: 
425: @app.get("/admin/users")
426: def get_all_users(admin: User = Depends(require_admin), session: Session = Depends(get_session)):
427:     users = session.exec(select(User)).all()
428:     return [{
429:         "id": u.id,
430:         "username": u.username,
431:         "email": u.email,
432:         "role": u.role,
433:         "joined": u.created_at.strftime("%Y-%m-%d") if u.created_at else ""
434:     } for u in users]
435: 
436: @app.put("/admin/users/{user_id}/role")
437: def update_user_role(
438:     user_id: int, 
439:     role: str, 
440:     admin: User = Depends(require_admin), 
441:     session: Session = Depends(get_session)
442: ):
443:     user = session.get(User, user_id)
444:     if not user:
445:         raise HTTPException(status_code=404, detail="User not found")
446:     user.role = role
447:     session.add(user)
448:     session.commit()
449:     return {"message": f"User {user.username} updated to {role}"}
450: 
451: # Auth & User endpoints (to be implemented in auth.py)
452: @app.get("/auth/me")
453: def get_me(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
454:     # Calculate stats for profile
455:     submissions = session.exec(select(Submission).where(Submission.user_id == user.id)).all()
456:     accepted_subs = [s for s in submissions if s.status == "accepted"]
457:     
458:     problem_scores = {}
459:     for sub in accepted_subs:
460:         if sub.problem_id not in problem_scores or sub.score > problem_scores[sub.problem_id]:
461:             problem_scores[sub.problem_id] = sub.score
462:             
463:     total_score = sum(problem_scores.values())
464:     problems_solved = len(problem_scores)
465:     
466:     recent_submissions = []
467:     sorted_submissions = sorted(submissions, key=lambda x: (x.timestamp or datetime.min), reverse=True)
468:     for sub in sorted_submissions[:5]:
469:         prob = session.get(Problem, sub.problem_id)
470:         recent_submissions.append({
471:             "id": sub.id,
472:             "problem": prob.title if prob else f"Problem {sub.problem_id}",
473:             "status": sub.status,
474:             "time": sub.timestamp.strftime("%Y-%m-%d %H:%M") if sub.timestamp else ""
475:         })
476:         
477:     return {
478:         "id": user.id,
479:         "username": user.username,
480:         "email": user.email,
481:         "full_name": user.full_name,
482:         "avatar_url": user.avatar_url,
483:         "role": user.role,
484:         "github_id": user.github_id,
485:         "created_at": user.created_at.strftime("%Y-%m-%d") if user.created_at else "",
486:         "stats": {
487:             "solved": problems_solved,
488:             "rank": 0, # Will be calculated by leaderboard in real app, mocked for now or could do a query
489:             "xp": total_score,
490:             "streak": 1 # Mocked streak
491:         },
492:         "recentSubmissions": recent_submissions
493:     }
494: 
495: if __name__ == "__main__":
496:     import uvicorn
497:     port = int(os.environ.get("PORT", 8000))
498:     uvicorn.run("main:app", host="0.0.0.0", port=port)

(End of file - total 498 lines)
</content>
```

---

## Assistant (Build · mimo-v2-omni-free · 2.3s)

_Thinking:_

Now let me read the models.py to understand the database schema.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/backend/models.py"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/backend/models.py</path>
<type>file</type>
<content>1: from datetime import datetime
2: from typing import Optional, List
3: from sqlmodel import SQLModel, Field, Relationship
4: 
5: class User(SQLModel, table=True):
6:     __tablename__ = "users"
7:     id: Optional[int] = Field(default=None, primary_key=True)
8:     username: str = Field(index=True, unique=True)
9:     email: str = Field(index=True, unique=True)
10:     full_name: Optional[str] = None
11:     avatar_url: Optional[str] = None
12:     github_id: Optional[int] = Field(default=None, unique=True)
13:     github_access_token: Optional[str] = None
14:     hashed_password: Optional[str] = None
15:     role: str = Field(default="student") # student, faculty, admin
16:     created_at: datetime = Field(default_factory=datetime.utcnow)
17: 
18:     submissions: List["Submission"] = Relationship(back_populates="user")
19:     created_problems: List["Problem"] = Relationship(back_populates="author")
20: 
21: class Problem(SQLModel, table=True):
22:     id: Optional[int] = Field(default=None, primary_key=True)
23:     title: str = Field(index=True)
24:     description: str
25:     difficulty: str = Field(default="Easy") # Easy, Medium, Hard
26:     input_format: Optional[str] = None
27:     output_format: Optional[str] = None
28:     author_id: Optional[int] = Field(default=None, foreign_key="users.id")
29:     created_at: datetime = Field(default_factory=datetime.utcnow)
30: 
31:     author: Optional["User"] = Relationship(back_populates="created_problems")
32:     test_cases: List["TestCase"] = Relationship(back_populates="problem")
33:     submissions: List["Submission"] = Relationship(back_populates="problem")
34: 
35: class TestCase(SQLModel, table=True):
36:     id: Optional[int] = Field(default=None, primary_key=True)
37:     problem_id: int = Field(foreign_key="problem.id")
38:     input_data: str
39:     expected_output: str
40:     is_sample: bool = Field(default=False)
41: 
42:     problem: Problem = Relationship(back_populates="test_cases")
43: 
44: class Submission(SQLModel, table=True):
45:     id: Optional[int] = Field(default=None, primary_key=True)
46:     user_id: int = Field(foreign_key="users.id")
47:     problem_id: int = Field(foreign_key="problem.id")
48:     repo_url: Optional[str] = None
49:     commit_sha: Optional[str] = None
50:     code_content: Optional[str] = None
51:     language: Optional[str] = None
52:     status: str = Field(default="pending") # pending, accepted, wrong_answer, runtime_error, tle, mle, error
53:     score: int = Field(default=0)
54:     ai_feedback: Optional[str] = None
55:     judge_output: Optional[str] = None
56:     memory_used: Optional[int] = None # in KB
57:     time_taken: Optional[float] = None # in seconds
58:     timestamp: datetime = Field(default_factory=datetime.utcnow)
59: 
60:     user: User = Relationship(back_populates="submissions")
61:     problem: Problem = Relationship(back_populates="submissions")

(End of file - total 61 lines)
</content>
```

---

## Assistant (Build · mimo-v2-omni-free · 3.3s)

_Thinking:_

Now let me read auth.py, worker.py, and judge.py to understand the authentication and judging logic.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/backend/auth.py"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/backend/auth.py</path>
<type>file</type>
<content>1: import os
2: import httpx
3: from datetime import datetime, timedelta
4: from typing import Optional
5: from fastapi import Depends, HTTPException, status
6: from fastapi.security import OAuth2PasswordBearer
7: from jose import JWTError, jwt
8: from sqlmodel import Session, select, create_engine
9: from dotenv import load_dotenv
10: from passlib.context import CryptContext
11: from models import User
12: 
13: load_dotenv()
14: 
15: pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
16: 
17: def verify_password(plain_password, hashed_password):
18:     return pwd_context.verify(plain_password, hashed_password)
19: 
20: def get_password_hash(password):
21:     return pwd_context.hash(password)
22: 
23: DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/minicode")
24: 
25: if DATABASE_URL.startswith("sqlite"):
26:     engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
27: else:
28:     engine = create_engine(DATABASE_URL)
29: 
30: def get_session():
31:     with Session(engine) as session:
32:         yield session
33: 
34: GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
35: GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
36: JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey")
37: ALGORITHM = "HS256"
38: ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 week
39: 
40: oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
41: 
42: async def get_github_user_info(access_token: str):
43:     async with httpx.AsyncClient() as client:
44:         response = await client.get(
45:             "https://api.github.com/user",
46:             headers={"Authorization": f"Bearer {access_token}"}
47:         )
48:         if response.status_code != 200:
49:             raise HTTPException(status_code=400, detail="Invalid GitHub token")
50:         return response.json()
51: 
52: def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
53:     to_encode = data.copy()
54:     if expires_delta:
55:         expire = datetime.utcnow() + expires_delta
56:     else:
57:         expire = datetime.utcnow() + timedelta(minutes=15)
58:     to_encode.update({"exp": expire})
59:     encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
60:     return encoded_jwt
61: 
62: async def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
63:     credentials_exception = HTTPException(
64:         status_code=status.HTTP_401_UNAUTHORIZED,
65:         detail="Could not validate credentials",
66:         headers={"WWW-Authenticate": "Bearer"},
67:     )
68:     try:
69:         payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
70:         username: str = payload.get("sub")
71:         if username is None:
72:             raise credentials_exception
73:     except JWTError:
74:         raise credentials_exception
75:     
76:     statement = select(User).where(User.username == username)
77:     user = session.exec(statement).first()
78:     if user is None:
79:         raise credentials_exception
80:     return user
81: 
82: def require_role(roles: list[str]):
83:     async def role_checker(user: User = Depends(get_current_user)):
84:         if user.role not in roles:
85:             raise HTTPException(
86:                 status_code=status.HTTP_403_FORBIDDEN,
87:                 detail="You do not have permission to accessDR this resource"
88:             )
89:         return user
90:     return role_checker
91: 
92: require_admin = require_role(["admin"])
93: require_faculty = require_role(["faculty", "admin"])

(End of file - total 93 lines)
</content>
```

---

## Assistant (Build · mimo-v2-omni-free · 2.5s)

_Thinking:_

Now let me read the worker.py and judge.py to understand the background processing.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/backend/worker.py"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/backend/worker.py</path>
<type>file</type>
<content>1: import os
2: import asyncio
3: from celery import Celery
4: from sqlmodel import Session
5: from dotenv import load_dotenv
6: import logging
7: 
8: # We need to load env and our logic
9: load_dotenv()
10: 
11: from models import Submission, Problem, TestCase, User
12: from main import engine
13: from judge import judge_submission
14: 
15: logger = logging.getLogger(__name__)
16: 
17: # Initialize Celery
18: redis_url = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/1")
19: celery_app = Celery("minicode_worker", broker=redis_url, backend=redis_url)
20: 
21: celery_app.conf.update(
22:     task_serializer="json",
23:     accept_content=["json"],
24:     result_serializer="json",
25:     timezone="UTC",
26:     enable_utc=True,
27: )
28: 
29: @celery_app.task(name="process_submission_task")
30: def process_submission_task(submission_id: int):
31:     """
32:     Background worker that runs the synchronous DB wrapper and async Gemini API calls 
33:     via asyncio.run()
34:     """
35:     logger.info(f"Worker picked up submission {submission_id}")
36: 
37:     # Spin up its own Database Session to prevent connection issues across threads
38:     with Session(engine) as session:
39:         submission = session.get(Submission, submission_id)
40:         if not submission:
41:             logger.error(f"Submission {submission_id} not found in database.")
42:             return f"Error: Submission {submission_id} not found"
43: 
44:         user = session.get(User, submission.user_id)
45:         problem = session.get(Problem, submission.problem_id)
46:         
47:         # We need the full proxy object models, but fetching standard queries
48:         # is enough for standard relationships in our app structure.
49:         
50:         test_cases = session.query(TestCase).filter(TestCase.problem_id == problem.id).all()
51:         
52:         # The judge_submission API is an async function because it calls genai.Client.aio
53:         # Standard celery tasks are synchronous. We must use asyncio.run to await it.
54:         try:
55:             asyncio.run(judge_submission(submission, user, problem, test_cases, session))
56:             logger.info(f"Successfully evaluated submission {submission_id}")
57:             return f"Evaluated submission {submission_id} successfully."
58:         except Exception as e:
59:             logger.error(f"Error during background judge: {e}")
60:             import traceback
61:             logger.error(traceback.format_exc())
62:             
63:             # Update safety net
64:             submission.status = "error"
65:             submission.ai_feedback = f"Internal Exception during background evaluation: {str(e)}"
66:             session.add(submission)
67:             session.commit()
68:             return f"Failed submission {submission_id}"
69: 

(End of file - total 69 lines)
</content>
```

---

## Assistant (Build · mimo-v2-omni-free · 3.2s)

_Thinking:_

Now let me read the judge.py file.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/backend/judge.py"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/backend/judge.py</path>
<type>file</type>
<content>1: import os
2: import json
3: from google import genai
4: from models import Submission, TestCase, User, Problem
5: from github import Github
6: 
7: async def run_ai_judge(user_code: str, problem_desc: str, test_cases_info: str, commit_history_info: str = "", persona: str = "standard"):
8:     """
9:     Uses Gemini to analyze the code, act as judge, and provide feedback + score.
10:     """
11:     api_key = os.getenv("GEMINI_API_KEY")
12:     if not api_key:
13:         return None, "AI Judge unavailable (API key missing)."
14:     
15:     client = genai.Client(api_key=api_key)
16:     
17:     persona_prompts = {
18:         "standard": "You are a Fair & Experienced Coding Mentor and Judge.",
19:         "cto": "You are a Grumpy CTO. Focus on Engineering Rigor and Architecture.",
20:         "professor": "You are a CS Professor. Focus on Algorithms and Complexity.",
21:         "roast": "You are a Sarcastic Code Reviewer. Be witty but helpful."
22:     }
23:     
24:     role = persona_prompts.get(persona, persona_prompts["standard"])
25:     
26:     prompt = f"""
27:     ROLE: {role}
28:     
29:     TASK: You are an AI Hackathon Judge. Analyze this student's code submission for the given problem. You are also performing a STRICT AI-plagiarism detection check.
30:     
31:     PROBLEM STATEMENT:
32:     {problem_desc}
33:     
34:     TEST CASES:
35:     {test_cases_info}
36:     
37:     COMMIT HISTORY:
38:     {commit_history_info}
39:     
40:     STUDENT CODE:
41:     ```
42:     {user_code}
43:     ```
44:     
45:     INSTRUCTIONS:
46:     1. First, determine if the code would produce the correct output for the given test cases.
47:     2. Respond with a JSON object (and ONLY a JSON object, no markdown fences) with these fields:
48:        - "status": "accepted" if the code is correct, "wrong_answer" if incorrect, "error" if the code has bugs
49:        - "score": a number from 0 to 100 based on correctness, code quality, and efficiency
50:        - "ai_probability": a number from 0 to 100 representing the probability that this code was AI-generated. Be highly suspicious of generic variable names, standard AI boilerplate, excessive overly-explanatory comments, and suspicious commit histories (e.g., a single massive commit, or AI-like commit messages).
51:        - "feedback": a detailed markdown string with your analysis. Include:
52:          * Whether the solution is correct
53:          * Code quality observations
54:          * Time/space complexity analysis
55:          * Suggestions for improvement
56:          * If wrong, give hints without giving the full answer
57:          * EXTREMELY IMPORTANT: If ai_probability > 60, you MUST include a brief explanation in the feedback about why you suspect AI generation.
58:     """
59:     
60:     try:
61:         from google.genai import types
62:         response = await client.aio.models.generate_content(
63:             model='gemini-2.5-flash',
64:             contents=prompt,
65:             config=types.GenerateContentConfig(
66:                 response_mime_type="application/json",
67:             )
68:         )
69:         
70:         text = response.text.strip()
71:         import re
72:         
73:         # Find JSON object
74:         json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
75:         if json_match:
76:             text = json_match.group(1).strip()
77:         else:
78:             obj_match = re.search(r'(\{.*\})', text, re.DOTALL)
79:             if obj_match:
80:                 text = obj_match.group(1).strip()
81:                 
82:         result = json.loads(text)
83:         
84:         # Inject warning if AI probability is high
85:         ai_prob = result.get("ai_probability", 0)
86:         if isinstance(ai_prob, (int, float)) and ai_prob > 60:
87:             warning_msg = f"""<div style="background-color: #ffebee; color: #c62828; padding: 12px; border-radius: 6px; border: 1px solid #ef5350; margin-bottom: 16px; font-weight: bold;">
88: ⚠️ WARNING: This submission has a high likelihood ({ai_prob}%) of being AI-generated based on code patterns and commit history.
89: </div>\n\n"""
90:             result["feedback"] = warning_msg + result.get("feedback", "")
91:             
92:         return result, None
93:     except json.JSONDecodeError:
94:         # If JSON parsing fails due to unescaped newlines etc, extract feedback robustly
95:         fallback_feedback = response.text if response else "Could not parse AI response."
96:         if response:
97:             import re
98:             # Extract content from "feedback": "..."
99:             match = re.search(r'"feedback"\s*:\s*"(.*?)"\s*\}?$', response.text, re.DOTALL)
100:             if match:
101:                 fallback_feedback = match.group(1).replace('\\n', '\n').replace('\\"', '"')
102:                 
103:         return {
104:             "status": "accepted",
105:             "score": 75,
106:             "feedback": fallback_feedback
107:         }, None
108:     except Exception as e:
109:         return None, f"Gemini Error: {str(e)}"
110: 
111: async def judge_submission(submission: Submission, user: User, problem: Problem, test_cases: list[TestCase], session):
112:     """
113:     Main entry point for judging. Fetches code from GitHub and runs AI judge.
114:     """
115:     # 1. Get code from GitHub
116:     user_code = "# Code not found"
117:     commit_history_info = "No commit history available."
118: 
119:     
120:     if user.github_access_token and submission.repo_url:
121:         try:
122:             g = Github(user.github_access_token)
123:             repo_name = submission.repo_url.rstrip("/").split("/")[-1]
124:             # GitHub Optimization: Fetch repo by full name instead of hitting /user endpoint first
125:             repo = g.get_repo(f"{user.username}/{repo_name}")
126:             
127:             # Helper to try multiple branches and extensions
128:             content_file = None
129:             branches_to_try = [repo.default_branch, "main", "master"]
130:             
131:             for branch in branches_to_try:
132:                 try:
133:                     root_files = repo.get_contents("", ref=branch)
134:                     if not isinstance(root_files, list):
135:                         root_files = [root_files]
136:                         
137:                     for f in root_files:
138:                         if f.name.lower().startswith("solution."):
139:                             # It's better to fetch explicitly if the file is large, but root_files objects have content if small.
140:                             # We'll just fetch by name to be safe
141:                             content_file = repo.get_contents(f.name, ref=branch)
142:                             break
143:                             
144:                     if content_file:
145:                         break
146:                 except Exception:
147:                     continue
148:                     
149:             if content_file:
150:                 user_code = content_file.decoded_content.decode("utf-8")
151:             else:
152:                 user_code = f"# Error fetching code: A file named 'solution.*' was not found in repository {repo_name}."
153:                 
154:             # Fetch recent commits
155:             commit_history_info = "Recent Commits:\n"
156:             try:
157:                 commits = repo.get_commits()
158:                 for i, c in enumerate(commits[:5]):
159:                     commit_history_info += f"- [{c.commit.author.date}] {c.commit.author.name}: {c.commit.message}\n"
160:             except Exception as e:
161:                 commit_history_info += f"Could not fetch commits: {str(e)}\n"
162: 
163:         except Exception as e:
164:             print(f"Error fetching code from GitHub: {e}")
165:             user_code = f"# Error fetching code: {str(e)}"
166:             commit_history_info = "No commit history available due to error."
167:     
168:     # 2. Build test case info string for AI
169:     test_cases_info = ""
170:     if test_cases:
171:         for i, tc in enumerate(test_cases):
172:             test_cases_info += f"Test Case {i+1}:\n  Input: {tc.input_data}\n  Expected Output: {tc.expected_output}\n\n"
173:     else:
174:         test_cases_info = "No test cases provided. Judge based on problem description."
175:     
176:     # 3. Run AI Judge
177:     ai_result_data = await run_ai_judge(user_code, problem.description, test_cases_info, commit_history_info)
178:     ai_result, error = ai_result_data
179:     
180:     if ai_result:
181:         submission.status = ai_result.get("status", "error")
182:         submission.score = ai_result.get("score", 0)
183:         submission.ai_feedback = ai_result.get("feedback", "No feedback generated.")
184:         submission.judge_output = f"AI Judge evaluated the code from repo."
185:     else:
186:         submission.status = "error"
187:         submission.score = 0
188:         submission.ai_feedback = error or "Judge failed to evaluate."
189:         submission.judge_output = "Judge error"
190:     
191:     submission.code_content = user_code  # Store what was evaluated
192:     
193:     session.add(submission)
194:     session.commit()
195:     return submission

(End of file - total 195 lines)
</content>
```

---

## Assistant (Build · mimo-v2-omni-free · 3.5s)

_Thinking:_

Now let me read the frontend structure to understand the UI components. First, let me check the frontend package.json and src directory.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/frontend/package.json"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/frontend/package.json</path>
<type>file</type>
<content>1: {
2:   "name": "frontend",
3:   "version": "0.1.0",
4:   "private": true,
5:   "scripts": {
6:     "dev": "next dev",
7:     "build": "next build",
8:     "start": "next start",
9:     "lint": "eslint",
10:     "test": "vitest run"
11:   },
12:   "dependencies": {
13:     "@monaco-editor/react": "^4.7.0",
14:     "@tailwindcss/typography": "^0.5.19",
15:     "axios": "^1.13.5",
16:     "clsx": "^2.1.1",
17:     "cookies-next": "^6.1.1",
18:     "framer-motion": "^12.34.0",
19:     "jwt-decode": "^4.0.0",
20:     "lucide-react": "^0.563.0",
21:     "next": "^16.2.1",
22:     "react": "19.2.3",
23:     "react-dom": "19.2.3",
24:     "react-markdown": "^10.1.0",
25:     "remark-gfm": "^4.0.1",
26:     "shadcn-ui": "^0.9.5",
27:     "tailwind-merge": "^3.4.0"
28:   },
29:   "devDependencies": {
30:     "@tailwindcss/postcss": "^4",
31:     "@testing-library/dom": "^10.4.1",
32:     "@testing-library/jest-dom": "^6.9.1",
33:     "@testing-library/react": "^16.3.2",
34:     "@types/node": "^20",
35:     "@types/react": "^19",
36:     "@types/react-dom": "^19",
37:     "@vitejs/plugin-react": "^6.0.1",
38:     "eslint": "^9",
39:     "eslint-config-next": "16.1.6",
40:     "jsdom": "^29.0.1",
41:     "tailwindcss": "^4",
42:     "typescript": "^5",
43:     "vitest": "^4.1.2"
44:   }
45: }

(End of file - total 45 lines)
</content>
```

---

## Assistant (Build · mimo-v2-omni-free · 3.3s)

_Thinking:_

Now let me explore the frontend source code structure.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/frontend/src"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/frontend/src</path>
<type>directory</type>
<entries>
app/
components/
contexts/
lib/

(4 entries)
</entries>
```

---

## Assistant (Build · mimo-v2-omni-free · 13.6s)

_Thinking:_

Let me read the frontend app structure.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/frontend/src/app"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/frontend/src/app</path>
<type>directory</type>
<entries>
admin/
auth/
faculty/
favicon.ico
globals.css
layout.tsx
leaderboard/
login/
page.tsx
problems/
profile/

(11 entries)
</entries>
```

---

## Assistant (Build · mimo-v2-omni-free · 2.5s)

_Thinking:_

Let me read the layout.tsx and page.tsx to understand the frontend structure. Let me also check one of the components to see the pattern.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/frontend/src/app/layout.tsx"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/frontend/src/app/layout.tsx</path>
<type>file</type>
<content>1: import type { Metadata } from "next";
2: import { Inter } from "next/font/google";
3: import "./globals.css";
4: import Navbar from "@/components/Navbar";
5: import { AuthProvider } from "@/contexts/AuthContext";
6: 
7: const inter = Inter({ subsets: ["latin"] });
8: 
9: export const metadata: Metadata = {
10:   title: "MiniCode | Internal Coding Platform",
11:   description: "A premium coding practice platform for students.",
12: };
13: 
14: export default function RootLayout({
15:   children,
16: }: Readonly<{
17:   children: React.ReactNode;
18: }>) {
19:   return (
20:     <html lang="en" className="dark">
21:       <head>
22:         <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
23:       </head>
24:       <body className={`${inter.className} min-h-screen`}>
25:         <AuthProvider>
26:           <Navbar />
27:           <main>{children}</main>
28:         </AuthProvider>
29:       </body>
30:     </html>
31:   );
32: }

(End of file - total 32 lines)
</content>
```

---

## Assistant (Build · mimo-v2-omni-free · 3.6s)

_Thinking:_

Let me check the AuthContext to understand how authentication is managed on the frontend.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/frontend/src/contexts/AuthContext.tsx"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/frontend/src/contexts/AuthContext.tsx</path>
<type>file</type>
<content>1: "use client";
2: 
3: import React, { createContext, useContext, useEffect, useState } from "react";
4: import { deleteCookie, getCookie, setCookie } from "cookies-next";
5: import api from "../lib/api";
6: 
7: export interface User {
8:     id: number;
9:     username: string;
10:     email: string;
11:     full_name: string | null;
12:     avatar_url: string | null;
13:     role: "student" | "admin" | "faculty";
14:     github_id: number;
15:     created_at: string;
16: }
17: 
18: interface AuthContextType {
19:     user: User | null;
20:     loading: boolean;
21:     login: (token: string) => Promise<void>;
22:     logout: () => void;
23: }
24: 
25: const AuthContext = createContext<AuthContextType>({
26:     user: null,
27:     loading: true,
28:     login: async () => { },
29:     logout: () => { },
30: });
31: 
32: export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
33:     const [user, setUser] = useState<User | null>(null);
34:     const [loading, setLoading] = useState(true);
35: 
36:     const fetchUser = async () => {
37:         try {
38:             const token = getCookie("minicode_token");
39:             if (!token) {
40:                 setLoading(false);
41:                 return;
42:             }
43:             const response = await api.get("/auth/me");
44:             setUser(response.data);
45:         } catch (error) {
46:             console.error("Failed to fetch user:", error);
47:             deleteCookie("minicode_token");
48:             setUser(null);
49:         } finally {
50:             setLoading(false);
51:         }
52:     };
53: 
54:     useEffect(() => {
55:         fetchUser();
56:     }, []);
57: 
58:     const login = async (token: string) => {
59:         setCookie("minicode_token", token, { maxAge: 60 * 60 * 24 * 7 }); // 1 week
60:         api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
61:         await fetchUser();
62:     };
63: 
64:     const logout = () => {
65:         deleteCookie("minicode_token");
66:         delete api.defaults.headers.common["Authorization"];
67:         setUser(null);
68:         window.location.href = "/login";
69:     };
70: 
71:     return (
72:         <AuthContext.Provider value={{ user, loading, login, logout }}>
73:             {children}
74:         </AuthContext.Provider>
75:     );
76: };
77: 
78: export const useAuth = () => useContext(AuthContext);

(End of file - total 78 lines)
</content>
```

---

## Assistant (Build · mimo-v2-omni-free · 15.9s)

_Thinking:_

Now let me check the docker-compose.yml to understand the infrastructure.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/docker-compose.yml"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/docker-compose.yml</path>
<type>file</type>
<content>1: 
2: services:
3:   backend:
4:     build:
5:       context: ./backend
6:       dockerfile: Dockerfile
7:     ports:
8:       - "8000:8000"
9:     environment:
10:       - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/minicode
11:       - REDIS_URL=redis://redis:6379/0
12:       - CELERY_BROKER_URL=redis://redis:6379/1
13:       - GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
14:       - GEMINI_API_KEY=${GEMINI_API_KEY}
15:       - JWT_SECRET=${JWT_SECRET}
16:       - CORS_ORIGINS=http://localhost:3000
17:       - WEB_CONCURRENCY=2
18:     restart: unless-stopped
19:     healthcheck:
20:       test: [ "CMD", "curl", "-f", "http://localhost:8000/health" ]
21:       interval: 30s
22:       timeout: 10s
23:       retries: 3
24:     depends_on:
25:       postgres:
26:         condition: service_healthy
27:       redis:
28:         condition: service_healthy
29: 
30:   celery_worker:
31:     build:
32:       context: ./backend
33:       dockerfile: Dockerfile
34:     command: ["celery", "-A", "worker.celery_app", "worker", "--loglevel=info"]
35:     environment:
36:       - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/minicode
37:       - REDIS_URL=redis://redis:6379/0
38:       - CELERY_BROKER_URL=redis://redis:6379/1
39:       - GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
40:       - GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
41:       - GITHUB_TOKEN=${GITHUB_TOKEN}
42:       - GEMINI_API_KEY=${GEMINI_API_KEY}
43:     depends_on:
44:       postgres:
45:         condition: service_healthy
46:       redis:
47:         condition: service_healthy
48: 
49:   postgres:
50:     image: postgres:15-alpine
51:     environment:
52:       - POSTGRES_USER=postgres
53:       - POSTGRES_PASSWORD=postgres
54:       - POSTGRES_DB=minicode
55:     ports:
56:       - "5432:5432"
57:     volumes:
58:       - postgres_data:/var/lib/postgresql/data
59:     healthcheck:
60:       test: ["CMD-SHELL", "pg_isready -U postgres"]
61:       interval: 10s
62:       timeout: 5s
63:       retries: 5
64: 
65:   redis:
66:     image: redis:7-alpine
67:     ports:
68:       - "6379:6379"
69:     healthcheck:
70:       test: ["CMD", "redis-cli", "ping"]
71:       interval: 10s
72:       timeout: 5s
73:       retries: 5
74: 
75:   frontend:
76:     build:
77:       context: ./frontend
78:       dockerfile: Dockerfile
79:       args:
80:         - NEXT_PUBLIC_API_URL=http://localhost:8000
81:         - NEXT_PUBLIC_GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
82:     ports:
83:       - "3000:3000"
84:     depends_on:
85:       backend:
86:         condition: service_healthy
87:     restart: unless-stopped
88: 
89: volumes:
90:   postgres_data:

(End of file - total 90 lines)
</content>
```

---

## Assistant (Build · mimo-v2-omni-free · 3.8s)

_Thinking:_

Let me also read the repo_manager.py to understand GitHub repository management.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/backend/repo_manager.py"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/backend/repo_manager.py</path>
<type>file</type>
<content>1: import os
2: from github import Github
3: from sqlmodel import Session
4: from models import User, Problem
5: 
6: def create_student_repo(user: User, problem: Problem, session: Session):
7:     """
8:     Creates a dedicated repository for a student to solve a specific problem.
9:     """
10:     if not user.github_access_token:
11:         raise Exception("User has no GitHub access token")
12:     
13:     g = Github(user.github_access_token)
14:     repo_name = f"minicode-{user.username}-{problem.title.lower().replace(' ', '-')}"
15:     
16:     try:
17:         # Create the repository
18:         # In a real scenario, you might want to use a template repo
19:         # repo = g.get_user().create_repo_from_template(repo_name, template_repo)
20:         
21:         repo = g.get_user().create_repo(
22:             repo_name,
23:             description=f"Solution for {problem.title} on MiniCode",
24:             private=True,
25:             auto_init=True
26:         )
27:         
28:         # Update the auto-generated README with problem description
29:         default_branch = repo.default_branch
30:         try:
31:             readme = repo.get_contents("README.md", ref=default_branch)
32:             repo.update_file(
33:                 "README.md",
34:                 "Initialize with problem description",
35:                 f"# {problem.title}\n\n{problem.description}",
36:                 readme.sha,
37:                 branch=default_branch
38:             )
39:         except Exception:
40:             pass
41:         
42:         # Create a starter code file
43:         repo.create_file(
44:             "solution.py",
45:             "Add starter code",
46:             "# Write your solution here\n\ndef solve():\n    pass\n",
47:             branch=default_branch
48:         )
49:         
50:         return repo.html_url
51:     except Exception as e:
52:         print(f"Error creating repo: {e}")
53:         # If repo already exists, just return its URL or handle accordingly
54:         try:
55:             repo = g.get_repo(f"{user.username}/{repo_name}")
56:             return repo.html_url
57:         except:
58:             raise e
59: 
60: def commit_code_to_repo(user: User, repo_name: str, file_path: str, content: str, commit_message: str):
61:     """
62:     Commits code from the in-browser editor to the student's repository.
63:     """
64:     g = Github(user.github_access_token)
65:     repo = g.get_repo(f"{user.username}/{repo_name}")
66:     default_branch = repo.default_branch
67:     
68:     try:
69:         contents = repo.get_contents(file_path, ref=default_branch)
70:         repo.update_file(contents.path, commit_message, content, contents.sha, branch=default_branch)
71:     except:
72:         repo.create_file(file_path, commit_message, content, branch=default_branch)
73:     
74:     return repo.get_branch(default_branch).commit.sha

(End of file - total 74 lines)
</content>
```

---

## Assistant (Build · mimo-v2-omni-free · 4.0s)

_Thinking:_

Now let me check the load test file to understand performance testing.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/load_test.js"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/load_test.js</path>
<type>file</type>
<content>1: import http from 'k6/http';
2: import { check, sleep } from 'k6';
3: 
4: export const options = {
5:   stages: [
6:     { duration: '30s', target: 50 },
7:     { duration: '1m', target: 100 },
8:     { duration: '1m', target: 200 },
9:     { duration: '30s', target: 0 },
10:   ],
11:   thresholds: {
12:     http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
13:     http_req_failed: ['rate<0.01'],    // less than 1% errors
14:   },
15: };
16: 
17: const BASE_URL = 'http://localhost:8000';
18: 
19: export default function () {
20:   const problemsRes = http.get(`${BASE_URL}/problems`);
21:   check(problemsRes, {
22:     'problems fetched successfully': (r) => r.status === 200,
23:   });
24: 
25:   const leaderboardRes = http.get(`${BASE_URL}/leaderboard`);
26:   check(leaderboardRes, {
27:     'leaderboard fetched successfully': (r) => r.status === 200,
28:   });
29: 
30:   sleep(1);
31: }

(End of file - total 31 lines)
</content>
```

---

## Assistant (Build · mimo-v2-omni-free · 3.9s)

_Thinking:_

Let me also look at the env example and .gitignore to understand the configuration.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/.env.example"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/.env.example</path>
<type>file</type>
<content>1: # ============================================
2: # MiniCode Environment Variables
3: # Copy this file and fill in your values:
4: #   cp .env.example backend/.env
5: #   cp .env.example frontend/.env.local (only NEXT_PUBLIC_ vars)
6: # ============================================
7: 
8: # === Database (PostgreSQL) ===
9: DATABASE_URL=postgresql://postgres:postgres@localhost:5432/minicode
10: 
11: # === Redis & Celery ===
12: REDIS_URL=redis://localhost:6379/0
13: CELERY_BROKER_URL=redis://localhost:6379/1
14: 
15: # === GitHub OAuth App ===
16: GITHUB_CLIENT_ID=your_github_client_id
17: GITHUB_CLIENT_SECRET=your_github_client_secret
18: GITHUB_TOKEN=your_github_personal_access_token
19: 
20: # === Google Gemini AI ===
21: GEMINI_API_KEY=your_gemini_api_key
22: 
23: # === JWT Authentication ===
24: JWT_SECRET=generate_a_random_32_char_string_here
25: 
26: # === CORS (comma-separated allowed origins) ===
27: CORS_ORIGINS=https://your-frontend-url.onrender.com
28: 
29: # === Server Config ===
30: WEB_CONCURRENCY=4
31: 
32: # === Frontend (prefix with NEXT_PUBLIC_ for client-side access) ===
33: NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
34: NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com

(End of file - total 34 lines)
</content>
```

---

## Assistant (Build · mimo-v2-omni-free · 4.2s)

_Thinking:_

Now let me check the seed.py file to understand the database seeding process.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/backend/seed.py"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/backend/seed.py</path>
<type>file</type>
<content>1: import os
2: from sqlmodel import Session, select
3: from models import User, Problem, TestCase
4: from main import engine, create_db_and_tables
5: from auth import get_password_hash
6: 
7: def seed_db():
8:     create_db_and_tables()
9:     with Session(engine) as session:
10:         # Check admin
11:         admin = session.exec(select(User).where(User.username == "admin")).first()
12:         if not admin:
13:             admin = User(
14:                 username="admin",
15:                 email="admin@minicode.com",
16:                 full_name="System Admin",
17:                 role="admin",
18:                 hashed_password=get_password_hash("admin")
19:             )
20:             session.add(admin)
21:             
22:         # Check faculty
23:         faculty = session.exec(select(User).where(User.username == "facultyname")).first()
24:         if not faculty:
25:             faculty = User(
26:                 username="facultyname",
27:                 email="faculty@minicode.com",
28:                 full_name="Faculty Member",
29:                 role="faculty",
30:                 hashed_password=get_password_hash("password")
31:             )
32:             session.add(faculty)
33:         
34:         session.commit()
35:         
36:         # Make sure faculty exists for reference
37:         faculty = session.exec(select(User).where(User.username == "facultyname")).first()
38:             
39:         # Seed sample problems with test cases
40:         existing = session.exec(select(Problem)).all()
41:         if not existing:
42:             # Problem 1: Two Sum
43:             p1 = Problem(
44:                 title="Two Sum",
45:                 description="Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
46:                 difficulty="Easy",
47:                 input_format="First line: space-separated integers (nums)\nSecond line: integer (target)",
48:                 output_format="Two space-separated integers (indices)",
49:                 author_id=faculty.id if faculty else None
50:             )
51:             session.add(p1)
52:             session.commit()
53:             session.refresh(p1)
54:             
55:             session.add_all([
56:                 TestCase(problem_id=p1.id, input_data="2 7 11 15\n9", expected_output="0 1", is_sample=True),
57:                 TestCase(problem_id=p1.id, input_data="3 2 4\n6", expected_output="1 2", is_sample=True),
58:                 TestCase(problem_id=p1.id, input_data="3 3\n6", expected_output="0 1", is_sample=True),
59:             ])
60:             
61:             # Problem 2: Hello World
62:             p2 = Problem(
63:                 title="Hello World",
64:                 description="Write a program that prints 'Hello World' to the standard output.",
65:                 difficulty="Easy",
66:                 input_format="No input",
67:                 output_format="Hello World",
68:                 author_id=faculty.id if faculty else None
69:             )
70:             session.add(p2)
71:             session.commit()
72:             session.refresh(p2)
73:             
74:             session.add_all([
75:                 TestCase(problem_id=p2.id, input_data="", expected_output="Hello World", is_sample=True),
76:             ])
77:             
78:             # Problem 3: FizzBuzz
79:             p3 = Problem(
80:                 title="FizzBuzz",
81:                 description="Given an integer n, return a list of strings where:\n- For multiples of 3, print 'Fizz'\n- For multiples of 5, print 'Buzz'\n- For multiples of both 3 and 5, print 'FizzBuzz'\n- Otherwise print the number\n\nPrint each result on a new line.",
82:                 difficulty="Easy",
83:                 input_format="Single integer n",
84:                 output_format="n lines of FizzBuzz output",
85:                 author_id=faculty.id if faculty else None
86:             )
87:             session.add(p3)
88:             session.commit()
89:             session.refresh(p3)
90:             
91:             session.add_all([
92:                 TestCase(problem_id=p3.id, input_data="5", expected_output="1\n2\nFizz\n4\nBuzz", is_sample=True),
93:                 TestCase(problem_id=p3.id, input_data="15", expected_output="1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz", is_sample=True),
94:             ])
95: 
96:             # Problem 4: Reverse String
97:             p4 = Problem(
98:                 title="Reverse String",
99:                 description="Write a function that reverses a string. The input string is given as a single line.",
100:                 difficulty="Easy",
101:                 input_format="A single string",
102:                 output_format="The reversed string",
103:                 author_id=faculty.id if faculty else None
104:             )
105:             session.add(p4)
106:             session.commit()
107:             session.refresh(p4)
108: 
109:             session.add_all([
110:                 TestCase(problem_id=p4.id, input_data="hello", expected_output="olleh", is_sample=True),
111:                 TestCase(problem_id=p4.id, input_data="Hannah", expected_output="hannaH", is_sample=True),
112:             ])
113: 
114:             # Problem 5: Maximum Subarray
115:             p5 = Problem(
116:                 title="Maximum Subarray",
117:                 description="Given an integer array nums, find the subarray with the largest sum, and return its sum.\n\nA subarray is a contiguous non-empty sequence of elements within an array.",
118:                 difficulty="Medium",
119:                 input_format="Space-separated integers",
120:                 output_format="Single integer (maximum subarray sum)",
121:                 author_id=faculty.id if faculty else None
122:             )
123:             session.add(p5)
124:             session.commit()
125:             session.refresh(p5)
126: 
127:             session.add_all([
128:                 TestCase(problem_id=p5.id, input_data="-2 1 -3 4 -1 2 1 -5 4", expected_output="6", is_sample=True),
129:                 TestCase(problem_id=p5.id, input_data="1", expected_output="1", is_sample=True),
130:                 TestCase(problem_id=p5.id, input_data="5 4 -1 7 8", expected_output="23", is_sample=True),
131:             ])
132: 
133:             session.commit()
134:             print("Seeded 5 problems with test cases.")
135:         else:
136:             # Add test cases to existing problems if they don't have any
137:             for p in existing:
138:                 tc_count = len(session.exec(select(TestCase).where(TestCase.problem_id == p.id)).all())
139:                 if tc_count == 0:
140:                     if "hello" in p.title.lower():
141:                         session.add(TestCase(problem_id=p.id, input_data="", expected_output="Hello World", is_sample=True))
142:                     elif "two sum" in p.title.lower():
143:                         session.add_all([
144:                             TestCase(problem_id=p.id, input_data="2 7 11 15\n9", expected_output="0 1", is_sample=True),
145:                             TestCase(problem_id=p.id, input_data="3 2 4\n6", expected_output="1 2", is_sample=True),
146:                         ])
147:                     else:
148:                         session.add(TestCase(problem_id=p.id, input_data="sample input", expected_output="sample output", is_sample=True))
149:             session.commit()
150:             print("Added test cases to existing problems.")
151:         
152:         print("Database seeded successfully.")
153: 
154: if __name__ == "__main__":
155:     seed_db()

(End of file - total 155 lines)
</content>
```

---

## Assistant (Build · mimo-v2-omni-free · 4.4s)

_Thinking:_

Now let me check a few frontend components to understand the UI architecture better. Let me see what's in the components directory.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/frontend/src/components"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/frontend/src/components</path>
<type>directory</type>
<entries>
Navbar.tsx
ProblemCard.tsx

(2 entries)
</entries>
```

---

## Assistant (Build · mimo-v2-omni-free · 3.0s)

_Thinking:_

Let me read the Navbar and ProblemCard components.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/frontend/src/components/Navbar.tsx"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/frontend/src/components/Navbar.tsx</path>
<type>file</type>
<content>1: "use client";
2: 
3: import Link from "next/link";
4: import { usePathname, useRouter } from "next/navigation";
5: import { Terminal, Search, Flame, LogIn, LogOut, Medal } from "lucide-react";
6: import { clsx } from "clsx";
7: import { useAuth } from "@/contexts/AuthContext";
8: 
9: export default function Navbar() {
10:     const { user, logout, loading } = useAuth();
11:     const router = useRouter();
12:     const pathname = usePathname();
13: 
14:     if (pathname === "/login") {
15:         return null;
16:     }
17: 
18:     const handleLogin = () => {
19:         router.push("/login");
20:     };
21: 
22:     return (
23:         <header className="sticky top-0 z-50 glass-card border-b border-white/10 px-4 md:px-8 py-3 bg-background-dark/80 backdrop-blur-xl">
24:             <div className="max-w-7xl mx-auto flex items-center justify-between">
25:                 <Link href={user ? (user.role === 'admin' ? '/admin/users' : user.role === 'faculty' ? '/faculty/dashboard' : '/problems') : "/"} className="flex items-center gap-3">
26:                     <div className="bg-primary p-2 rounded-lg">
27:                         <Terminal className="text-white w-6 h-6" />
28:                     </div>
29:                     <h2 className="text-xl font-extrabold tracking-tight text-white hidden sm:block">MiniCode</h2>
30:                 </Link>
31: 
32:                 {user && (
33:                     <div className="hidden md:flex flex-1 max-w-md mx-8">
34:                         <div className="relative w-full">
35:                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
36:                             <input 
37:                                 type="text"
38:                                 className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:ring-primary focus:border-primary placeholder-slate-500 focus:outline-none" 
39:                                 placeholder="Search challenges, docs..." 
40:                             />
41:                         </div>
42:                     </div>
43:                 )}
44: 
45:                 <div className="flex items-center gap-4">
46:                     {!loading && user ? (
47:                         <>
48:                             {user.role === "student" && (
49:                                 <>
50:                                     <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-primary/20 border border-primary/30 rounded-full">
51:                                         <Medal className="text-primary w-4 h-4" />
52:                                         <span className="text-xs font-bold text-primary uppercase tracking-wider">Level 3: Code Ninja</span>
53:                                     </div>
54:                                     <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
55:                                         <Flame className="text-orange-500 w-4 h-4" />
56:                                         <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">3 Days</span>
57:                                     </div>
58:                                 </>
59:                             )}
60:                             <div className="flex items-center gap-3 ml-2">
61:                                 <Link href="/profile" className="h-10 w-10 rounded-full border-2 border-primary overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer">
62:                                     {user.avatar_url ? (
63:                                         <img src={user.avatar_url} alt="Profile" className="h-full w-full object-cover" />
64:                                     ) : (
65:                                         <div className="h-full w-full bg-slate-800 flex items-center justify-center text-white font-bold">
66:                                             {user.username.charAt(0).toUpperCase()}
67:                                         </div>
68:                                     )}
69:                                 </Link>
70:                                 <button 
71:                                     onClick={logout}
72:                                     className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
73:                                     title="Logout"
74:                                 >
75:                                     <LogOut className="w-5 h-5" />
76:                                 </button>
77:                             </div>
78:                         </>
79:                     ) : !loading && !user ? (
80:                         <button
81:                             onClick={handleLogin}
82:                             className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl transition-all"
83:                         >
84:                             <LogIn className="w-4 h-4" />
85:                             <span>Login</span>
86:                         </button>
87:                     ) : (
88:                         <div className="w-32 h-10 bg-white/5 animate-pulse rounded-xl" />
89:                     )}
90:                 </div>
91:             </div>
92:         </header>
93:     );
94: }

(End of file - total 94 lines)
</content>
```

---

## Assistant (Build · mimo-v2-omni-free · 4.5s)

_Thinking:_

Let me also check the lib/api to understand the API setup.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/frontend/src/lib"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/frontend/src/lib</path>
<type>directory</type>
<entries>
api.ts

(1 entries)
</entries>
```

---

## Assistant (Build · mimo-v2-omni-free · 4.1s)

_Thinking:_

Let me read the api.ts file.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/frontend/src/lib/api.ts"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/frontend/src/lib/api.ts</path>
<type>file</type>
<content>1: import axios from "axios";
2: import { getCookie } from "cookies-next";
3: 
4: const api = axios.create({
5:     baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
6: });
7: 
8: api.interceptors.request.use(
9:     (config) => {
10:         const token = getCookie("minicode_token");
11:         if (token) {
12:             config.headers.Authorization = `Bearer ${token}`;
13:         }
14:         return config;
15:     },
16:     (error) => {
17:         return Promise.reject(error);
18:     }
19: );
20: 
21: export default api;

(End of file - total 21 lines)
</content>
```

---

## Assistant (Build · mimo-v2-omni-free · 5.4s)

_Thinking:_

Now let me check the requirements.txt for backend dependencies.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/backend/requirements.txt"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/backend/requirements.txt</path>
<type>file</type>
<content>1: fastapi
2: sqlmodel
3: python-dotenv
4: pygithub
5: httpx
6: psycopg2-binary
7: redis
8: uvicorn
9: python-jose[cryptography]
10: google-genai
11: gunicorn
12: passlib[bcrypt]
13: bcrypt==4.0.1
14: python-multipart
15: slowapi
16: fastapi-cache2[redis]
17: bleach
18: pytest
19: pytest-asyncio
20: httpx
21: pytest-mock
22: jinja2
23: celery

(End of file - total 23 lines)
</content>
```

---

## Assistant (Build · mimo-v2-omni-free · 5.7s)

_Thinking:_

Let me check one more thing - let's see the DESIGN_VISION.md and DEPLOYMENT.md files.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/DESIGN_VISION.md"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/DESIGN_VISION.md</path>
<type>file</type>
<content>1: # 🎨 MiniCode Design & UX Vision
2: 
3: This document outlines the ideal User Experience (UX) and Design System for **MiniCode**, specifically tailored from the perspective of a **newbie student** who might be intimidated by traditional, harsh competitive programming platforms.
4: 
5: The goal is to use this document as a blueprint for generating stunning, intuitive interfaces using **Stitch** or other design tools.
6: 
7: ---
8: 
9: ## 1. 🌟 Design Philosophy: The "Newbie" Perspective
10: As a beginner, traditional coding judges (like Codeforces or raw LeetCode) look scary. They have too much text, confusing terminology, and harsh red "Wrong Answer" text. 
11: 
12: **For MiniCode, we want:**
13: - **Zero Friction:** I need to know exactly what to click when I log in.
14: - **Encouragement over Punishment:** Failing a test case shouldn't feel bad. It should feel like a learning opportunity guided by my AI mentor.
15: - **Gamified Progress:** I want to see my XP bar go up, earn badges, and see a "streak" flame.
16: - **Premium Feel:** The platform should look like a modern, expensive SaaS tool. It should have real-time animations, smooth transitions, and a gorgeous color palette.
17: 
18: ---
19: 
20: ## 2. 🎨 Core Aesthetics & Theme
21: To achieve the "Wow" factor and feel highly premium:
22: - **Theme:** "Sleek Dark Mode" with vibrant neon accents (Glassmorphism elements). 
23: - **Colors:**
24:   - **Background:** Deep space slate (`#0F172A` or `#09090b`)
25:   - **Cards/Surfaces:** Slightly lighter translucent panels with soft blur (backdrop-blur).
26:   - **Primary Accents:** Electric Purple (`#8B5CF6`) for primary actions, Neon Cyan (`#06b6d4`) for secondary.
27:   - **Success/Feedback:** Emerald Green (`#10b981`) for correct answers. Hot Pink/Coral (`#f43f5e`) for errors (softened, not a harsh red).
28: - **Typography:** Modern, clean sans-serif like **Inter**, **Outfit**, or **Plus Jakarta Sans**. Code snippets should use **JetBrains Mono** or **Fira Code**.
29: - **Micro-animations:** Buttons should gently scale on hover. The XP bar should animate smoothly when filling up. Confetti or subtle glowing effects when a problem is solved correctly.
30: 
31: ---
32: 
33: ## 3. 🖥️ Key Screens & Ideal Features (Stitch Blueprints)
34: 
35: When generating these screens in Stitch, use the following feature sets and layouts:
36: 
37: ### A. The Student Dashboard / Profile (`/profile`)
38: **Vibe:** Clean whiteboard aesthetic—light, sketchy, hand-drawn feel. A breath of fresh air compared to the dark coding arena.
39: **Access:** Students reach this by clicking their profile photo in the navbar from any page.
40: **Theme:** Light mode (`#FAFAF9`), sketch-borders, marker-highlight accents, sticky-note task lists, hand-drawn underlines.
41: **Features to include:**
42: - **Sidebar:** Navigation for Dashboard, My Submissions, Achievements, Insights, Settings, and Docs. Includes a "Profile Completion" progress bar at the bottom.
43: - **Welcome Hero:** Personalized greeting with the user's name and a hand-drawn underline. A "Start Coding" button links back to `/problems`.
44: - **Metric Cards (4-column grid):** Problems Solved, Total Submissions, Current Streak, Global Rank. Each card has a gradient progress bar and a status badge.
45: - **Activity Chart:** An SVG line chart showing submission activity over the past 7 days with a whiteboard-style gradient fill.
46: - **Sticky-Note To-Do:** A rotated, yellow sticky note with checkboxes for the student's personal task list.
47: - **Recent Activity Feed:** Shows recent submissions and syncs with avatars and timestamps.
48: - **Topic Progress Table:** A data table showing mastery for each topic (Arrays, Strings, Loops) with progress bars, status badges, and action links.
49: - **MiniCode Logo:** In the navbar, the logo links to `/problems` (the Coding Arena), not the dashboard.
50: 
51: ### B. The Problem Solving Arena
52: **Vibe:** Focused, professional, but not overwhelming.
53: **Features to include:**
54: - **Layout:** Split pane.
55:   - **Left Pane (The Lore):** Problem description written engagingly. Clear examples with visual breakdowns (not just raw text input/output, but maybe small diagrams or highlighted code).
56:   - **Right Pane (The Action):** Since they code locally and push to GitHub, this pane should show the connected repository status (e.g., "🐙 Connected to `username/minicode-two-sum`").
57: - **The Magic Button:** A big, beautiful, glowing button saying **"Sync & Evaluate Code"**.
58: - **Status Tracker:** A timeline showing the evaluation state: "Fetching repo..." -> "Running tests..." -> "Gemini AI is analyzing...".
59: 
60: ### C. The AI Mentor Feedback Screen (Post-Submission)
61: **Vibe:** Helpful, instructive, like a friendly teacher.
62: **Features to include:**
63: - **The Score Matrix:** Instead of just "Pass/Fail", show a beautiful grid:
64:   - ✅ Correctness (100/100)
65:   - ⚡ Time Complexity (O(n) - Great!)
66:   - 🧠 Code Quality (85/100)
67: - **The "Mentor's Notes":** A chat-bubble style section where the Gemini AI gives a personalized breakdown: *"Awesome job using a HashMap! Next time, try to handle the edge case where the array is empty to make it perfectly robust."*
68: - **Hints (If Failed):** If the user fails, don't show the exact answer. Have a blurred box that says "Click to reveal a hint from your AI Mentor".
69: 
70: ### D. The Leaderboard & Profile
71: **Vibe:** Competitive but friendly.
72: **Features to include:**
73: - **Leaderboard:** A podium aesthetic for the top 3 users. Rows for other users with their avatars, XP, and badges. 
74: - **Profile Page:** A GitHub-style contribution graph (green squares) to show activity. A "Trophy Case" showcasing badges like "Bug Squasher" or "First Blood" (for solving a problem first).
75: 
76: ### E. The Login / Welcome Screen
77: **Vibe:** Exciting, modern, a gateway to greatness.
78: **Features to include:**
79: - **Split Screen or Floating Card Layout:** A visually stunning background (maybe an abstract dark mesh or gentle animated gradient) with a sleek glass card in the center.
80: - **Clear User Paths:** 
81:   - A gigantic, inviting **"Continue with GitHub"** button prominent for students. (Includes the GitHub logo).
82:   - A smaller, secondary tab or link for **"Faculty / Admin Login"** to keep the student path perfectly clear.
83: - **Value Proposition:** Short punchy text on the side: "Master your skills. Real repos. AI Feedback." 
84: 
85: ### F. The Faculty Portal
86: **Vibe:** Analytical, organized, empowering.
87: **Features to include:**
88: - **Dashboard Overview:** High-level metrics showing class engagement: "Total Submissions Today", "Average Pass Rate", "Most Struggled Problem". 
89: - **Problem Manager:** A sleek data table listing their created problems. Status dots (Active/Draft). 
90: - **Problem Creation Wizard:** A step-by-step form (not a huge intimidating wall of inputs).
91:   - Step 1: Description & Lore.
92:   - Step 2: Test Cases (with a clean UI to add input/output pairs).
93:   - Step 3: Deployment.
94: - **Student Insights:** A view to seeing how a specific student is doing, looking at their GitHub commit timeline directly from the portal.
95: 
96: ### G. The Admin Portal
97: **Vibe:** Command Center, secure, powerful.
98: **Features to include:**
99: - **System Health:** Quick widgets showing API usage (Gemini limits, GitHub API limits), active users, and database health.
100: - **User Management Grid:** A powerful, filterable table. Ability to quickly revoke access, reset roles, or ban abusive users.
101: - **Global Settings:** Toggles for system-wide features (e.g., "Maintenance Mode", "Disable New Registrations"). 
102: 
103: ---
104: 
105: ## 4. 📝 Summary of Stitch Prompts 
106: If using the Stitch UI generator, here are condensed prompts to build the UI:
107: 
108: 1. **Dashboard:** *"A dark-mode dashboard for a beginner coding student. Top nav with user level and streak (🔥). A beautiful hero section welcoming them. A grid of problem cards with 'Easy/Medium/Hard' tags and a prominent 'Start in GitHub' button. Glassmorphism styling, deep blue/slate backgrounds with vibrant purple accents."*
109: 2. **Problem View:** *"A coding problem page with a split layout. Left side has beautifully formatted problem instructions. Right side has a sleek widget showing GitHub repo connection status, and a large glowing 'Evaluate with AI' button. Dark mode, modern typography, extremely polished."*
110: 3. **AI Feedback:** *"A success screen for a coding submission. Shows a beautiful score breakdown (Correctness, Speed, Quality). Features a friendly card outlining personalized AI mentor feedback. Uses emerald greens and sleek dark slate colors. Confetti-like subtle background effects."*
111: 4. **Login Screen:** *"A dark mode login screen for a coding platform. A sleek glassmorphism card in the center. A large, prominent 'Log in with GitHub' button. A subtle toggle for 'Faculty Login'. Background should have a gorgeous, abstract deep purple and cyan glowing mesh."*
112: 5. **Faculty Dashboard:** *"A clean, analytical dashboard for a computer science professor. Dark mode. Shows cards for 'Total Submissions' and 'Pass Rate'. A data table listing active coding assignments. A prominent 'Create New Problem' button. Professional yet modern."*
113: 6. **Admin Command Center:** *"A highly technical admin dashboard. Dark mode. System health widgets showing API usage and active connections. A compact data grid for managing user roles. Accent colors should emphasize system status (green for healthy, yellow for warnings)."*

(End of file - total 113 lines)
</content>
```

---

## Assistant (Build · mimo-v2-omni-free · 5.8s)

_Thinking:_

Now let me also check if there are any tests.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/backend/tests"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/backend/tests</path>
<type>directory</type>
<entries>
__pycache__/
conftest.py
test_main.py

(3 entries)
</entries>
```

---

## Assistant (Build · mimo-v2-omni-free · 2.2s)

_Thinking:_

Let me read the test files to understand the testing setup.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/backend/tests/conftest.py"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/backend/tests/conftest.py</path>
<type>file</type>
<content>1: import pytest
2: from fastapi.testclient import TestClient
3: from sqlmodel import SQLModel, Session, create_engine
4: from sqlmodel.pool import StaticPool
5: 
6: from main import app, get_session
7: from models import User, Problem
8: 
9: # Use SQLite for testing
10: sqlite_url = "sqlite://"
11: 
12: engine = create_engine(
13:     sqlite_url, 
14:     connect_args={"check_same_thread": False}, 
15:     poolclass=StaticPool
16: )
17: 
18: @pytest.fixture(name="session")
19: def session_fixture():
20:     SQLModel.metadata.create_all(engine)
21:     with Session(engine) as session:
22:         yield session
23:     SQLModel.metadata.drop_all(engine)
24: 
25: from fastapi_cache import FastAPICache
26: from fastapi_cache.backends.inmemory import InMemoryBackend
27: 
28: @pytest.fixture(autouse=True)
29: def init_cache():
30:     FastAPICache.init(InMemoryBackend())
31: 
32: @pytest.fixture(name="client")
33: def client_fixture(session: Session):
34:     def get_session_override():
35:         return session
36:     app.dependency_overrides[get_session] = get_session_override
37:     with TestClient(app) as client:
38:         yield client
39:     app.dependency_overrides.clear()
40: 
41: @pytest.fixture(name="test_user")
42: def test_user_fixture(session: Session):
43:     user = User(
44:         username="testuser",
45:         email="test@example.com",
46:         full_name="Test User",
47:         role="student"
48:     )
49:     session.add(user)
50:     session.commit()
51:     session.refresh(user)
52:     return user
53: 
54: @pytest.fixture(name="test_faculty")
55: def test_faculty_fixture(session: Session):
56:     user = User(
57:         username="faculty",
58:         email="faculty@example.com",
59:         full_name="Faculty User",
60:         role="faculty"
61:     )
62:     session.add(user)
63:     session.commit()
64:     session.refresh(user)
65:     return user

(End of file - total 65 lines)
</content>
```

---

## Assistant (Build · mimo-v2-omni-free · 4.3s)

_Thinking:_

Let me read the test_main.py file.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/dwarkeshramani/Projects/Minicode/backend/tests/test_main.py"
}
```

**Output:**
```
<path>/home/dwarkeshramani/Projects/Minicode/backend/tests/test_main.py</path>
<type>file</type>
<content>1: import pytest
2: from fastapi.testclient import TestClient
3: from sqlmodel import Session
4: from models import Problem
5: from auth import get_current_user, require_faculty
6: 
7: def test_health_check(client: TestClient):
8:     response = client.get("/health")
9:     assert response.status_code == 200
10:     assert response.json() == {"status": "healthy"}
11: 
12: def test_get_problems_empty(client: TestClient):
13:     response = client.get("/problems")
14:     assert response.status_code == 200
15:     assert response.json() == []
16: 
17: def test_create_problem(client: TestClient, session: Session, test_faculty):
18:     # Mock authentication
19:     from main import app
20:     app.dependency_overrides[require_faculty] = lambda: test_faculty
21:     
22:     payload = {
23:         "title": "Two Sum",
24:         "description": "Given an array of integers <script>alert('xss')</script>...",
25:         "difficulty": "Easy",
26:         "input_format": "List of Ints",
27:         "output_format": "List of Ints"
28:     }
29:     
30:     response = client.post("/problems", json=payload)
31:     app.dependency_overrides.clear()
32:     
33:     assert response.status_code == 200
34:     data = response.json()
35:     assert data["title"] == "Two Sum"
36:     # Ensure Bleach sanitizes input
37:     assert "<script>" not in data["description"]
38:     assert data["author_id"] == test_faculty.id
39: 
40: def test_get_problem(client: TestClient, session: Session, test_faculty):
41:     problem = Problem(
42:         title="Valid Palindrome",
43:         description="Verify palindrome string",
44:         difficulty="Easy",
45:         author_id=test_faculty.id
46:     )
47:     session.add(problem)
48:     session.commit()
49:     
50:     response = client.get(f"/problems/{problem.id}")
51:     assert response.status_code == 200
52:     assert response.json()["title"] == "Valid Palindrome"
53: 
54: def test_rate_limiter(client: TestClient):
55:     # Trigger login multiple times to hit rate limit
56:     for _ in range(6):
57:         response = client.post("/auth/login", data={"username": "test", "password": "password"})
58:     
59:     # 6th request should be rate limited (5/min allowed)
60:     assert response.status_code == 429
61:     assert "Rate limit exceeded" in response.text
62: 
63: def test_security_headers(client: TestClient):
64:     response = client.get("/health")
65:     assert response.headers.get("X-Content-Type-Options") == "nosniff"
66:     assert response.headers.get("X-XSS-Protection") == "1; mode=block"
67: 
68: def test_invalid_language_submission(client: TestClient, session: Session, test_user, test_faculty):
69:     from main import app
70:     app.dependency_overrides[get_current_user] = lambda: test_user
71:     
72:     problem = Problem(
73:         title="Test Problem",
74:         description="Test",
75:         difficulty="Easy",
76:         author_id=test_faculty.id
77:     )
78:     session.add(problem)
79:     session.commit()
80:     
81:     payload = {
82:         "language": "rubyyy"  # Invalid language
83:     }
84:     
85:     response = client.post(f"/problems/{problem.id}/submit", json=payload)
86:     app.dependency_overrides.clear()
87:     
88:     assert response.status_code == 422
89:     assert "Language must be one of" in str(response.json())

(End of file - total 89 lines)
</content>
```

---

## Assistant (Build · mimo-v2-omni-free · 55.7s)

_Thinking:_

Now I have a comprehensive understanding of the project. Let me analyze it from all perspectives as requested. I'll structure my analysis according to the objectives provided.

Let me start with my analysis. I'll provide a comprehensive, honest assessment of the MiniCode project.

# 🔍 MiniCode: Complete Deep Analysis

## 📁 1. Repository & Architecture Analysis

### Full Folder Structure
```
Minicode/
├── backend/                    # FastAPI Backend
│   ├── main.py                 # API endpoints, DB setup, middleware
│   ├── models.py               # SQLModel data models
│   ├── auth.py                 # JWT auth, GitHub OAuth, password hashing
│   ├── judge.py                # Gemini AI judging logic
│   ├── repo_manager.py         # GitHub repository CRUD
│   ├── worker.py               # Celery async task runner
│   ├── seed.py                 # Database seeder
│   ├── tests/                  # Pytest unit tests
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                   # Next.js 16 Frontend
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React Context (Auth)
│   │   └── lib/               # API utilities
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml          # Multi-service orchestration
├── load_test.js                # K6 load testing
├── .env.example                # Environment template
└── README.md
```

### Architecture Flow
```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js 16)                          │
│  Pages: /problems, /profile, /admin, /faculty, /leaderboard            │
│  State: React Context (AuthContext) + Cookies                           │
│  Styling: TailwindCSS 4 + Framer Motion                                │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │ HTTP/REST + JWT Bearer
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (FastAPI)                               │
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Auth Layer │  │ Cache Layer │  │  DB Layer   │  │ Rate Limit  │    │
│  │  (JWT/OAuth)│  │ (Redis/InM) │  │ (SQLModel)  │  │ (SlowAPI)   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                                         │
│  Endpoints: /problems, /auth/*, /submissions, /admin/*, /faculty/*     │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │ Celery Task Queue
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    CELERY WORKERS (Background)                          │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │                  AI JUDGE PIPELINE                           │       │
│  │  GitHub API → Fetch Code → Gemini Analysis → Store Result   │       │
│  └─────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL SERVICES                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  PostgreSQL  │  │    Redis     │  │  GitHub API  │                  │
│  │    (DB)      │  │ (Cache/Broker)│  │  + Gemini   │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
```

**Architecture Style**: **Modular Monolith** with async workers. Not microservices (single codebase, shared DB), but has async decoupling via Celery.

---

## ⚙️ 2. Tech Stack Evaluation

| Layer | Technology | Verdict | Notes |
|-------|------------|---------|-------|
| **Frontend** | Next.js 16 + React 19 | ⚠️ Overkill | Latest versions for a coding platform, SSR not needed |
| **Styling** | TailwindCSS 4 | ✅ Good | Fast development, consistent design |
| **Backend** | FastAPI + Uvicorn | ✅ Excellent | Best Python async framework choice |
| **ORM** | SQLModel | ⚠️ Limiting | Good for small projects, but lacks advanced SQLAlchemy features |
| **Database** | PostgreSQL 15 | ✅ Excellent | Production-grade RDBMS |
| **Cache/Broker** | Redis 7 | ✅ Excellent | Perfect for caching + Celery broker |
| **Task Queue** | Celery | ✅ Good | Industry standard for Python async jobs |
| **AI** | Gemini 2.5 Flash | ⚠️ Risky | Fast, but Google API limits can be restrictive |
| **Auth** | JWT + bcrypt | ✅ Good | Standard, secure approach |

### Issues Identified:
1. **SQLModel limitation**: No Alembic migrations, no advanced query optimization
2. **No ORM pagination**: `session.exec(select(Problem)).all()` will fail with 10k+ problems
3. **React 19**: Bleeding edge, potential stability issues

---

## 🧠 3. Backend Deep Analysis

### API Design Assessment

**Strengths:**
- Consistent REST patterns (`/problems`, `/problems/{id}`, `/submissions/{id}`)
- Proper HTTP status codes (404, 403, 429)
- Input validation with Pydantic (`SubmissionRequest`)

**Weaknesses:**
```python
# main.py:356 - N+1 Query Problem
for user in users:
    submissions = session.exec(select(Submission).where(...)).all()
    # This executes per-user, causing O(n) queries
```

**Missing:**
- No API versioning (`/api/v1/...`)
- No request body validation for `/problems` POST (relies on model defaults)
- No pagination on `/problems` and `/leaderboard`

### Database Schema Analysis

```sql
-- Good:
- Indexed: username, email, title
- Foreign keys: proper relationships
- Timestamps: created_at fields

-- Bad:
- No indexes on: Submission.status, Submission.problem_id, Submission.user_id
- Missing: updated_at, deleted_at (soft delete)
- No composite indexes for common queries
```

### Scalability Concerns

| Bottleneck | Severity | Fix |
|------------|----------|-----|
| **Leaderboard endpoint** | 🔴 Critical | Caching (done) + Materialized views |
| **Judge pipeline** | 🟡 Medium | Rate limit Gemini API, add retry logic |
| **GitHub API calls** | 🟡 Medium | Aggressive caching, handle rate limits |
| **No connection pooling config** | 🟢 Low | Already configured (pool_size=20) |

### Security Review

**Good:**
- ✅ Rate limiting on auth endpoints (5/minute login, 10/minute OAuth)
- ✅ Input sanitization with Bleach
- ✅ Security headers middleware
- ✅ Password hashing with bcrypt
- ✅ JWT expiration (7 days)

**Critical Issues:**
```python
# auth.py:36 - HARDCODED JWT SECRET DEFAULT
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey")  # NEVER DO THIS

# auth.py:87 - Typo in error message
detail="You do not have permission to accessDR this resource"

# main.py:215 - Storing GitHub tokens in plaintext
github_access_token=access_token  # Should be encrypted
```

**Missing Security:**
- No CORS origin validation in production (defaults to `*`)
- No HTTPS enforcement in code
- No CSRF protection
- No input length validation on problem descriptions
- GitHub OAuth state parameter not validated (CSRF risk)

---

## 🎨 4. Frontend Analysis

### UI Architecture

**Current State**: Minimal implementation
- Only 2 components (`Navbar.tsx`, `ProblemCard.tsx`)
- No state management beyond AuthContext
- Direct API calls via axios (no SWR/React Query for caching)

**Issues:**
```typescript
// Navbar.tsx:52-57 - Hardcoded mock data
<span className="text-xs font-bold text-primary uppercase tracking-wider">Level 3: Code Ninja</span>
<span className="text-xs font-bold text-orange-500 uppercase tracking-wider">3 Days</span>
```

**Missing Features:**
- Problem detail page with code editor
- Submission result page
- Faculty dashboard (stub)
- Admin panel (stub)
- Leaderboard page

### Performance Concerns:
1. **No loading states** - Pages will show blank while fetching
2. **No error boundaries** - Unhandled errors crash the app
3. **No image optimization** - Avatar URLs loaded directly
4. **No code splitting** - Large bundle size

---

## 🚀 5. Performance & Scalability

### Current Capacity Estimate
| Metric | Estimate | Reasoning |
|--------|----------|-----------|
| **Concurrent users** | 200-500 | Redis caching + Celery workers |
| **Problems** | 10,000+ | PostgreSQL handles this easily |
| **Submissions/hour** | 5,000+ | Depends on Gemini rate limits |
| **GitHub API calls** | Limited | 5,000/hour per token |

### Scaling Limits

```
Current Architecture Bottleneck Analysis:
┌─────────────────────────────────────────┐
│           Gemini API Limits             │
│     (60 RPM free tier)                  │
│              ⚠️ RATE LIMITED            │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│        GitHub API Limits                │
│     (5,000 requests/hour)               │
│              ⚠️ SHARED ACROSS USERS     │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│        Database Connections             │
│     (pool_size=20, max_overflow=10)     │
│              ✅ ADEQUATE FOR NOW        │
└─────────────────────────────────────────┘
```

### Recommended Improvements

**Immediate (Scale to 1000 users):**
1. Add Redis Sentinel for high availability
2. Add API response caching (problems, leaderboard)
3. Add database read replicas for analytics queries
4. Implement connection pooling with PgBouncer

**Medium-term (Scale to 10,000 users):**
1. Horizontal scaling with multiple Celery workers
2. Move to managed PostgreSQL (RDS/Cloud SQL)
3. Add CDN for static assets
4. Implement WebSocket for real-time submission status

---

## 🔌 6. External Integrations

### GitHub Integration Risk Assessment

| API Endpoint | Usage | Rate Limit | Risk |
|-------------|-------|------------|------|
| `GET /user` | OAuth callback | 5,000/hour | 🟢 Low |
| `GET /repos/{owner}/{repo}` | Fetch code | 5,000/hour | 🟡 Medium |
| `GET /repos/{owner}/{repo}/commits` | Commit history | 5,000/hour | 🟡 Medium |
| `POST /user/repos` | Create repo | 5,000/hour | 🟡 Medium |

**Issues:**
```python
# judge.py:157 - No pagination, could fetch ALL commits
commits = repo.get_commits()
for i, c in enumerate(commits[:5]):  # Only uses first 5
```

**Missing:**
- No webhook support for real-time repo updates
- No GitHub App installation (limited to user OAuth tokens)
- No cache invalidation when repos are updated

### Gemini AI Integration

**Current Usage:**
```python
# judge.py:62 - Direct API call, no retry logic
response = await client.aio.models.generate_content(...)
```

**Issues:**
- No request caching (same code judged multiple times)
- No timeout handling
- No fallback if Gemini is down
- JSON parsing is fragile (regex-based)

---

## 💰 7. Cost Estimation

### Hosting Costs (Monthly)

| Service | Free Tier | Production (1000 users) | Production (10,000 users) |
|---------|-----------|------------------------|--------------------------|
| **Database** (Postgres) | Local/Docker | $15-30 (Render/Railway) | $100-200 (RDS) |
| **Redis** | Local/Docker | $10-20 (Upstash) | $50-100 (ElastiCache) |
| **Backend API** | Free (limited) | $25-50 (Render) | $200-400 (EC2/ECS) |
| **Celery Workers** | Shared with API | $25-50 (separate) | $200-400 |
| **Frontend** | Vercel free | $20 (Vercel Pro) | $100+ |
| **Total** | **$0** | **$95-200** | **$650-1,200** |

### Expensive Operations

| Operation | Cost Driver | Optimization |
|-----------|-------------|--------------|
| **AI Judging** | Gemini API ($0.00025/1K tokens) | Cache results, batch submissions |
| **GitHub API** | Rate limits (not $, but availability) | Aggressive caching, queue requests |
| **Database** | Compute + storage | Indexing, query optimization |

---

## 🧪 8. Testing & Reliability

### Test Coverage Analysis

**Backend Tests:** ⚠️ Minimal (5 tests)
```python
# test_main.py covers:
✅ Health check
✅ Empty problems list
✅ Create problem (with XSS sanitization)
✅ Get single problem
✅ Rate limiter
✅ Security headers
✅ Invalid language submission

# Missing:
❌ Authentication flow
❌ GitHub OAuth flow
❌ Submission judging flow
❌ Leaderboard calculation
❌ User role management
❌ Error handling paths
```

**Frontend Tests:** ❌ None
- `__tests__/` directory exists but empty
- `vitest.config.mts` configured but no tests

### Reliability Concerns

1. **No health checks for external services** (GitHub, Gemini)
2. **No circuit breakers** for failing APIs
3. **No graceful degradation** if Gemini is down
4. **No monitoring/alerting** configured
5. **No structured logging** (just print statements in some places)

---

## 🔐 9. Security Review

### Critical Security Issues

```
🔴 CRITICAL:
1. JWT_SECRET defaults to "supersecretkey" (auth.py:36)
2. GitHub OAuth state parameter not validated (main.py:177)
3. No HTTPS enforcement in code
4. GitHub tokens stored in plaintext (models.py:13)
5. CORS allows all origins in development mode

🟡 MEDIUM:
6. No CSRF protection on state-changing endpoints
7. No request size limits (DoS risk)
8. No SQL injection protection beyond ORM (should verify)
9. No account lockout after failed logins
10. Session tokens never invalidated on password change
```

### Security Recommendations

**Immediate:**
```python
# Fix JWT secret
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise ValueError("JWT_SECRET environment variable is required")

# Add encryption for GitHub tokens
from cryptography.fernet import Fernet
# Encrypt before storing, decrypt when using

# Add CORS validation
if os.getenv("ENVIRONMENT") == "production":
    # Strict CORS origins
    pass
```

---

## 📈 10. Production Readiness Score

### Score: **4.5/10**

| Category | Score | Notes |
|----------|-------|-------|
| **Code Quality** | 6/10 | Clean structure, but inconsistencies |
| **Security** | 3/10 | Critical vulnerabilities present |
| **Testing** | 3/10 | Minimal test coverage |
| **Documentation** | 7/10 | Good README, missing API docs |
| **Scalability** | 5/10 | Architecture supports scaling, but not implemented |
| **Reliability** | 4/10 | No monitoring, minimal error handling |
| **DevOps** | 5/10 | Docker setup, but no CI/CD |

### Classification: **Startup MVP / Hackathon Project**
- Functional prototype demonstrating core concept
- Not production-ready for public launch
- Requires significant hardening before real users

---

## 🚨 11. Critical Issues (MUST-FIX)

```
1. 🔐 JWT_SECRET DEFAULT VALUE
   File: auth.py:36
   Impact: All tokens can be forged
   Fix: Require env var, fail if missing

2. 🌐 CORS WILDCARD IN DEV
   File: main.py:113
   Impact: Any site can make authenticated requests
   Fix: Strict origin validation in production

3. 🔑 PLAINTEXT GITHUB TOKENS
   File: models.py:13, main.py:215
   Impact: Token theft via DB breach
   Fix: Encrypt with Fernet or similar

4. 📊 N+1 QUERY IN LEADERBOARD
   File: main.py:356
   Impact: O(n) DB queries, won't scale
   Fix: Single aggregated SQL query

5. ⏱️ NO GEMINI TIMEOUT/RETRY
   File: judge.py:62
   Impact: Jobs hang forever on API issues
   Fix: Add timeout and retry with backoff
```

---

## 🚀 12. Improvement Roadmap

### Scale to 100 Users (Week 1-2)

```yaml
Priority 1: Security Fixes
- [ ] Fix JWT secret handling
- [ ] Encrypt GitHub tokens
- [ ] Add HTTPS enforcement
- [ ] Validate OAuth state parameter

Priority 2: Basic Reliability
- [ ] Add error handling to all endpoints
- [ ] Add loading states to frontend
- [ ] Implement basic logging
- [ ] Add health checks for external services

Priority 3: Testing
- [ ] Add auth flow tests
- [ ] Add submission flow tests
- [ ] Add frontend component tests
```

### Scale to 1,000 Users (Month 1-2)

```yaml
Priority 1: Database Optimization
- [ ] Add indexes on Submission table
- [ ] Implement pagination for all list endpoints
- [ ] Add connection pooling with PgBouncer
- [ ] Set up database backups

Priority 2: Caching Layer
- [ ] Cache problem details (5 min TTL)
- [ ] Cache leaderboard (10 min TTL)
- [ ] Add cache invalidation on updates
- [ ] Implement cache warming

Priority 3: Monitoring
- [ ] Add Sentry for error tracking
- [ ] Add application metrics (Prometheus)
- [ ] Set up alerts for API failures
- [ ] Add request tracing
```

### Scale to 10,000 Users (Month 3-6)

```yaml
Priority 1: Infrastructure
- [ ] Move to Kubernetes/ECS
- [ ] Add load balancer
- [ ] Set up auto-scaling
- [ ] Add CDN for static assets

Priority 2: Queue Architecture
- [ ] Separate Celery workers by queue type
- [ ] Add priority queues for submissions
- [ ] Implement dead letter queue
- [ ] Add queue monitoring dashboard

Priority 3: Advanced Features
- [ ] WebSocket for real-time updates
- [ ] Submission history with diffs
- [ ] Advanced analytics dashboard
- [ ] Multi-region deployment
```

---

## 💡 13. Unique Ideas (Hackathon/Startup Level)

### Immediate Feature Additions

1. **Real-time Submission Status**
   - WebSocket connection for live judging updates
   - Progress bar showing "Fetching code → Analyzing → Generating feedback"

2. **AI Code Comparison**
   - "Did you write this?" - Show diff between student's first commit and final
   - Highlight suspicious patterns visually

3. **Peer Review System**
   - Students can anonymously review each other's solutions
   - Earn XP for helpful reviews

4. **Gamification 2.0**
   - Achievement system (First Blood, Speed Demon, Bug Hunter)
   - Team battles for hackathons
   - Daily coding streaks with rewards

### Advanced AI Features

5. **Personalized Learning Path**
   - AI analyzes student's weak areas
   - Recommends specific problems to practice

6. **AI Teaching Assistant**
   - Students can ask questions about problems
   - AI provides hints without spoiling solutions

7. **Code Complexity Prediction**
   - Before submission, estimate time/space complexity
   - Warn students if approach is inefficient

### Technical Innovations

8. **Live Code Collaboration**
   - Faculty can watch students code in real-time
   - Intervention capability for struggling students

9. **Automatic Test Case Generation**
   - AI generates additional test cases based on common edge cases
   - Faculty can approve/reject suggested test cases

10. **Plagiarism Network Graph**
    - Visual graph showing suspicious similarities between submissions
    - Cross-reference with public repositories

---

## Summary

**MiniCode** is a well-conceptualized competitive programming platform with solid architectural foundations. The core idea of integrating real GitHub workflows with AI judging is innovative and practical for educational settings.

**Strengths:**
- Clean separation of concerns (async workers, caching, auth)
- Modern tech stack (FastAPI, Next.js, React 19)
- Good documentation and design vision
- Security awareness (rate limiting, input sanitization)

**Weaknesses:**
- Critical security vulnerabilities must be fixed
- Minimal testing coverage
- No production monitoring
- Frontend is mostly stubs

**Recommendation:** Fix security issues immediately, add comprehensive tests, then focus on scaling infrastructure before launching to real users.

---

