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

## 🚀 Live Environment (Staging)

| Component | Status | URL |
|-----------|--------|-----|
| **Frontend** | Live | [https://minicode-scet.vercel.app](https://minicode-scet.vercel.app) |
| **API Docs** | Live | [https://minicode-web.onrender.com/docs](https://minicode-web.onrender.com/docs) |
| **Source Code** | 🛠️ Dev | [https://github.com/Daku3011/Minicode](https://github.com/Daku3011/Minicode) |

## 🐳 Docker Commands

### 🚨 Important: Running Docker Commands
If your user doesn't have Docker permissions, you'll need to use `sudo`. Create a helper script for convenience:

```bash
# Create a docker helper script
echo 'export DOCKER_BUILDKIT=1' >> ~/.bashrc
alias docker="sudo docker"
alias docker-compose="sudo docker-compose"

# Or use sudo directly (password: daku123$)
sudo docker ps
sudo docker-compose up -d
```

---

## Getting Started

### 🌌 Option 1: The Zero-Friction Way (Docker)
Ensure you have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed.

```bash
# 1. Clone the repository
git clone https://github.com/Daku3011/Minicode.git
cd Minicode

# 2. Configure Environment
cp .env.example .env
# Edit .env with your GITHUB_CLIENT_ID, SECRET and GEMINI_API_KEY

# 3. Spin up the entire ecosystem
docker-compose up -d --build
```
> **Backend**: http://localhost:8000/docs  
> **Frontend**: http://localhost:3000

### Common Docker Commands

```bash
# Start all services
sudo docker-compose up -d

# Stop all services
sudo docker-compose down

# View running containers
sudo docker ps

# Restart only backend (after code changes)
sudo docker-compose restart backend

# Restart only frontend
sudo docker-compose restart frontend

# Rebuild backend after code changes
sudo docker-compose up -d --build backend

# Rebuild frontend after code changes
sudo docker-compose up -d --build frontend

# View logs
sudo docker logs minicode_backend_1
sudo docker-compose logs -f

# Reset database (WARNING: deletes all data)
sudo docker-compose down -v
sudo docker-compose up -d
```

### Fixing "ContainerConfig" Error

If you get a `'ContainerConfig'` error when rebuilding only frontend or backend:

```bash
# This is a Docker Compose cache issue - recreate all containers fresh
sudo docker-compose down
sudo docker-compose up -d
```

### Fixing PostgreSQL Authentication Issues

If you get "password authentication failed" error:

```bash
# Option 1: Reset password
sudo docker exec minicode_postgres_1 psql -U postgres -c "ALTER USER postgres PASSWORD 'postgres';"

# Option 2: Reset pg_hba.conf to trust all connections
sudo docker exec -u postgres minicode_postgres_1 sh -c 'cat > /var/lib/postgresql/data/pg_hba.conf << EOF
local   all             all                                     trust
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
host    all             all             0.0.0.0/0               trust
host    all             all             ::/0                    trust
local   replication     all                                     trust
host    replication     all             127.0.0.1/32            trust
host    replication     all             ::1/128                 trust
EOF
pg_ctl reload -D /var/lib/postgresql/data'

# Restart backend to apply changes
sudo docker-compose restart backend
```

### Health Check

```bash
curl http://localhost:8000/health
```

---

### Option 2: The Manual Way (Developer Mode)

#### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env and configure DATABASE_URL, REDIS_URL, etc.
python -m uvicorn main:app --reload --port 8000
```

#### 2. Async Worker Setup (Celery + Beat)
Requires a running **Redis** server.
```bash
cd backend
# With venv active
# Starts both the task worker and the periodic scheduler (beat)
celery -A worker.celery_app worker --beat --loglevel=info
```
> **Note**: In production, it's recommended to run `worker` and `beat` as two separate processes.

#### 3. Frontend Setup (Next.js)
```bash
cd frontend
npm install
# Create .env.local with NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

---

## ⚙️ Environment Configuration

| Variable | Description | Source |
|----------|-------------|--------|
| `GITHUB_CLIENT_ID` | OAuth App Client ID | [GitHub Dev Settings](https://github.com/settings/developers) |
| `GITHUB_CLIENT_SECRET` | OAuth App Secret | [GitHub Dev Settings](https://github.com/settings/developers) |
| `GEMINI_API_KEY` | AI Evaluation Engine Key | [Google AI Studio](https://aistudio.google.com/) |
| `DATABASE_URL` | PostgreSQL or SQLite URI | Supabase / Local Postgres |
| `REDIS_URL` | Cache and Task Broker URI | Local Redis / Upstash |

---

## FAQ

### 1. Docker Login Fails with "password authentication failed"?
This is caused by a known issue with the docker-compose environment variable expansion. The DATABASE_URL gets duplicated in the container.

**Solution**: Edit `docker-compose.yml` and hardcode the DATABASE_URL instead of using variable expansion:

```yaml
# Before (problematic):
- DATABASE_URL=${DATABASE_URL:-postgresql://postgres:postgres@postgres:5432/minicode}

# After (fixed):
- DATABASE_URL=postgresql://postgres:postgres@postgres:5432/minicode
```

Then rebuild:
```bash
docker-compose down
docker-compose up -d --build
```

### 2. Why is my code evaluation stuck on "Pending"?
This almost always means the **Celery Worker** is not running. Check the logs of the `minicode-worker` container or manually run the celery command in the backend directory.

### 3. GitHub Login redirects to an error page?
Ensure your **OAuth Callback URL** in GitHub Settings perfectly matches your frontend URL.  
- Development: `http://localhost:3000/auth/github/callback`  
- Production: `https://your-domain.com/auth/github/callback`

### 4. My Gemini AI score is 0 or "Error"?
Verify your `GEMINI_API_KEY` in the `.env`. If you are using the Free Tier, ensure you aren't hitting the rate limit (15 RPM).

### 4. How do I clear the cached leaderboard?
Restart the Redis instance or use the backend endpoint `/admin/cache/clear` (Admin only).

---

## UI/UX Design Philosophies
The UI/UX is built to break away from traditional "intimidating" dark-mode coding arenas. We utilize an aesthetic of approachability, incorporating fluid micro-animations, glassmorphism components, and neon-purple highlights. Take a closer look at the [DESIGN_VISION.md](DESIGN_VISION.md) for UX philosophies.

## 👤 Default Credentials (Development)
- **Admin**: `admin` / `admin123`
- **Faculty**: `faculty` / `faculty123`
- **Student**: `student` / `student123`

---
*Elevate competitive programming to the modern enterprise level.* 🚀
