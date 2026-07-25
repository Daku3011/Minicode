# Minicode: The Modern Coding Arena Transforming How Students Learn Programming

> TL;DR: Minicode is an open-source coding arena platform that combines GitHub workflows with AI-powered code evaluation, gamified XP progression, and role-based learning paths. Live demo: https://minicode-web.vercel.app.

---

## What Is Minicode?

Minicode is an open-source coding arena platform that transforms competitive programming from a cold, terminal-based exercise into an engaging, gamified learning journey. Live demo available at [https://minicode-web.vercel.app](https://minicode-web.vercel.app).

> ⭐ **Project Credits**
>
> **Initiative by:** Coding Club SCET & Computer Department SCET
>
> **Faculty Guidance:** Dhatri Pandya & Dipali Kasat
>
> **Developed by:** Dwarkesh Ramani & Jenil Gajera

## Why Traditional Coding Platforms Fall Short for Education

Traditional competitive programming platforms like Codeforces, HackerRank, and LeetCode were built for individual practice under time pressure. They excel at algorithmic challenges but miss critical educational needs:

- **No real-world workflow integration** - Students code in sterile online editors instead of actual repositories
- **Fear-based feedback** - Binary pass/fail results discourage learning from mistakes
- **Isolated experience** - No team collaboration or event-based learning
- **Mysterious progression** - Hidden scoring systems provide no clear learning path

Educational institutions need platforms that mirror real development environments while fostering collaboration and growth.

## How Minicode Solves These Problems

Minicode introduces three innovations that reshape coding education:

### 1. GitHub-Native Workflow Integration

Students start problems by creating private GitHub repositories. They code locally using their preferred IDE, commit changes with meaningful messages, and submit through the platform. This mirrors professional development workflows rather than artificial online editors.

### 2. AI-Powered Judge with Constructive Feedback

The Gemini AI judge evaluates submissions beyond binary correctness, providing detailed explanations, suggestions for improvement, and personalized learning materials. Students receive actionable feedback that helps them grow, not just scores that label them.

### 3. Gamified Progression System

XP points, levels, and leaderboards transform coding practice from a chore into a game. Learning paths guide students through structured milestones in 9 specialized streams: Cybersecurity, AI/ML, Web Development, Data Science, Cloud & DevOps, Mobile Development, Blockchain, System Design, and Open Source.

## Who Can Use Minicode

| Role | Primary Activities |
|------|-----------------|
| **Students** | Solve problems via GitHub repos, earn XP, follow learning paths, join events |
| **Faculty** | Create problems, track student progress, manage cohorts, run contests |
| **Admins** | Manage users/roles, view analytics, configure platform, sync XP |

Each role has a tailored dashboard and workflow optimized for their responsibilities.

## Architecture Deep Dive

The Minicode stack integrates modern cloud technologies into a cohesive learning platform:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌──────────────┐        ┌────────────────────────┐     │
│  │   Student    │───────▶│     FRONTEND           │     │
│  │   Browser    │        │   Next.js 16 + React 19│     │
│  └──────────────┘        └───────────┬────────────┘     │
│                                      │                  │
│                          ┌───────────▼────────────┐     │
│                          │       BACKEND API      │     │
│                          │  FastAPI + SQLModel    │     │
│                          └─────┬───────────────┬──┘     │
│                                │               │        │
│              ┌─────────────────┼───────────────┼        |
│              ▼                 ▼               ▼        |  
│        ┌──────────┐     ┌──────────┐   ┌─────────────┐  |
│        │  Redis   │     │PostgreSQL│   │  GitHub API │  |
│        │(Cache/   │     │          │   │             │  |
│        │Broker)   │◀──▶ │ (Data)   │   │(OAuth/Repos)│  |
│        └────┬─────┘     └──────────┘   └─────┬───────┘  |
│             │                                │          |
│             ▼                                │          |
│        ┌──────────────┐                      │          |
│        │              │                      │          |
│        │    Celery    │◀─────────────────────┘          |
│        │   (Judge)    │                                 |
│        └──────┬───────┘     ┌──────────────────────┐    |
│               │             │                      │    |
│               └────────────▶│      Gemini AI       │    |
│                             │    (Evaluation)      │    |
│                             └──────────────────────┘    |
└─────────────────────────────────────────────────────────┘
```

## The Submission Pipeline in Action

Minicode's submission process mirrors professional CI/CD workflows:

1. **Start Problem** - Creates a private GitHub repository with initial boilerplate
2. **Code Locally** - Students write solutions using their IDE and commit to GitHub
3. **Submit** - Triggers async evaluation via Celery worker
4. **Fetch** - Worker retrieves latest code from the repository
5. **AI Judge** - Gemini analyzes code against test cases and provides feedback
6. **Update** - Scores and XP are stored in PostgreSQL
7. **Notify** - WebSocket pushes real-time results to the frontend

This pipeline teaches students professional workflows while providing immediate, helpful feedback.

## Technology Choices Explained

| Layer | Technology | Rationale |
|-------|-----------|----------|
| **Frontend** | Next.js 16 + React 19 | App Router for clean routing, Server Actions for mutations, modern React features |
| **Styling** | Tailwind CSS 4 | Utility-first styling enables rapid UI iteration and consistent design system |
| **Backend** | FastAPI | Async-first Python framework with automatic OpenAPI docs |
| **Database** | SQLModel + PostgreSQL | Type-safe ORM with full SQL power for analytics queries |
| **Queue** | Celery + Redis | Reliable async processing for AI judge evaluation and webhook handling |
| **AI Judge** | Google Gemini 2.5 | Advanced reasoning capabilities for code analysis and feedback generation |

## Deployment Options for Any Budget

### Zero-Cost Tier (~$0/month)

| Service | Provider | Free Tier |
|---------|----------|----------|
| Database | Supabase | 500MB PostgreSQL |
| Cache/Broker | Upstash | 10K Redis ops/day |
| Backend | Render | 750 free hours/month |
| Frontend | Vercel | Hobby tier for static sites |

### Production Tier (~$54/month)

| Service | Provider | Cost |
|---------|----------|------|
| Database | Supabase | $25/month |
| Cache/Broker | Upstash | $10/month |
| Backend | Render | $14/month |
| Frontend | Vercel | $15/month (optional Pro) |

The architecture supports both scales, making it accessible to student clubs and enterprise institutions alike.

## Comparison Table: Minicode vs Traditional Platforms

| Feature | HackerRank | LeetCode | Codeforces | Minicode |
|---------|-----------|----------|------------|----------|
| GitHub Integration | ❌ | ❌ | ❌ | ✅ |
| AI Feedback | ❌ | ❌ | ❌ | ✅ |
| Team Collaboration | ❌ | ❌ | ❌ | ✅ |
| Learning Paths | ❌ | Partial | ❌ | ✅ |
| Faculty Dashboard | ❌ | ❌ | ❌ | ✅ |
| Event System | ❌ | ❌ | ❌ | ✅ |
| XP Progression | ❌ | ❌ | ❌ | ✅ |
| Real Repository Practice | ❌ | ❌ | ❌ | ✅ |

## Getting Started as a Student

### Prerequisites

- GitHub account (for OAuth login)
- Basic programming knowledge (any language)
- Docker (for local deployment) or access to hosted instance

### Quick Setup

```bash
# Clone and configure
git clone https://github.com/mrprewsh/Minicode.git
cd Minicode
cp .env.example .env

# Edit .env with your credentials
# Start all services
docker-compose up -d --build

# Visit http://localhost:3000 to begin
```

### Your First Problem

1. Log in with GitHub OAuth
2. Browse available problems in your chosen stream
3. Click "Start Problem" to create your repository
4. Clone the repo locally and implement your solution
5. Commit and push to GitHub
6. Submit via the Minicode interface
7. Receive AI feedback within seconds

## Common Mistakes When Setting Up Minicode

### 1. Incorrect OAuth Callback URLs

The GitHub OAuth app must have callback URLs matching your frontend origin. For local development, use `http://localhost:3000/api/auth/callback/github`. Production deployments require the actual domain.

### 2. Missing Environment Variables

Ensure `GEMINI_API_KEY`, `JWT_SECRET`, and `FERNET_KEY` are set correctly. The platform will fail silently at runtime without these.

### 3. Redis Connectivity Issues

Celery workers require stable Redis connectivity. Use `docker-compose logs celery_worker` to debug queue-related problems.

## FAQ

**Q: What programming languages does Minicode support for problem solving?**

A: Currently Python, JavaScript, and TypeScript with expansion planned. The AI judge adapts to language-specific patterns and provides relevant feedback.

**Q: How does the AI-powered judge work technically?**

A: Celery workers fetch code from GitHub repositories and send it to Gemini with structured prompts containing test cases, expected outputs, and evaluation criteria.

**Q: Can Minicode be self-hosted for free?**

A: Yes, using Supabase free PostgreSQL, Upstash free Redis, and Render free tier. The zero-cost deployment guide covers this configuration.

**Q: What makes Minicode different from standard GitHub Codespaces?**

A: Codespaces provides isolated environments; Minicode integrates evaluation, gamification, and learning paths into existing repositories while tracking progress institution-wide.

**Q: How do faculty create problems with AI assistance?**

A: The problem creation interface includes AI generation suggestions for test cases, boilerplate code, and difficulty calibration based on learning path requirements.