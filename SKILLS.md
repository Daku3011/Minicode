# Project Skills & Guidelines

This document outlines the mandatory use of the Antigravity Skills library for all development tasks in the MiniCode project.

## Mandatory Rule

> [!IMPORTANT]
> **Always utilize the dedicated skills library (found in `.gemini/antigravity/skills`) when executing any task.**
> Before starting any implementation, research, or debugging, identify the most relevant skills and follow their documented patterns.

---

## 🚀 Prompting for Success

To get the most out of these skills, follow the "Specific Skill + Context" pattern.

| Scenario | 🛑 Bad Prompt | ✅ Good Prompt |
| :--- | :--- | :--- |
| **New Feature** | "Help me build a login page" | "Use `@brainstorming` to design a login system with GitHub OAuth" |
| **Code Review** | "Check my code" | "Use `@lint-and-validate` on `src/app.js` for logic errors" |
| **Security** | "Make my API secure" | "Use `@api-security-best-practices` on `routes/api/users.js`" |
| **Debugging** | "Fix this error" | "Use `@systematic-debugging` to find why the judging task hangs" |

### Pro Tips
- **Chain Skills**: `Use @brainstorming to design, then @nextjs-best-practices to implement.`
- **Be Specific**: Mention file paths and specific requirements in your prompt.
- **Reference Files**: `Use @security-auditor on frontend/src/auth/callback.tsx`.

---

## 🏗️ Workflow Playbooks

Use these sequences for complex, multi-step objectives.

### 1. Ship a SaaS MVP
1. **Plan Scope**: Use `@brainstorming` and `@writing-plans` to define boundaries.
2. **Backend/API**: Implement core logic with `@fastapi-pro` and `@api-patterns`.
3. **Frontend**: Build the UI with `@nextjs-best-practices` and `@frontend-design`.
4. **Test**: Cover critical journeys with `@test-driven-development` and `@browser-automation`.
5. **Ship**: Release safely with `@deployment-procedures`.

### 2. Security Audit
1. **Threat Model**: Use `@threat-modeling-expert` to identify trust boundaries.
2. **Access Control**: Verify auth with `@broken-authentication` and `@idor-testing`.
3. **API Integrity**: Audit points with `@api-security-best-practices`.
4. **Harden**: Implement fixes and verify with `@verification-before-completion`.

### 3. AI Agent System
1. **Define KPIs**: Set thresholds with `@ai-agents-architect` and `@agent-evaluation`.
2. **RAG Design**: Build retrieval pipelines with `@rag-implementation`.
3. **Orchestration**: Implement flows with `@langgraph` or `@mcp-builder`.
4. **Iteration**: Use `@kaizen` to address failure modes identified in evaluation.

### 4. QA & Browser Automation
1. **Strategy**: Define journeys with `@e2e-testing-patterns`.
2. **Implementation**: Build resilient tests with `@browser-automation`.
3. **Hardening**: Triage flakes with `@systematic-debugging` and `@test-fixing`.

### 5. DDD Core Domain
1. **Fit/Scope**: Evaluate DDD justification with `@domain-driven-design`.
2. **Strategic**: Map contexts with `@ddd-strategic-design` and `@ddd-context-mapping`.
3. **Tactical**: Encode invariants with `@ddd-tactical-patterns`.

---

## 🛠️ Skill Navigator

### 🏗️ Architecture & Engineering
- **[senior-fullstack](file:///C:/Users/rdwar/.gemini/antigravity/skills/senior-fullstack/SKILL.md)**: Overall application structure and integration.
- **[backend-architect](file:///C:/Users/rdwar/.gemini/antigravity/skills/backend-architect/SKILL.md)**: Scalable backend design and API architecture.

### 💻 Language & Framework Experts
- **[python-pro](file:///C:/Users/rdwar/.gemini/antigravity/skills/python-pro/SKILL.md)** / **[fastapi-pro](file:///C:/Users/rdwar/.gemini/antigravity/skills/fastapi-pro/SKILL.md)**: Backend logic and SQLModel.
- **[nextjs-best-practices](file:///C:/Users/rdwar/.gemini/antigravity/skills/nextjs-best-practices/SKILL.md)**: Frontend components and App Router.

### 🎨 Frontend, UI & UX
- **[frontend-design](file:///C:/Users/rdwar/.gemini/antigravity/skills/frontend-design/SKILL.md)** / **[shadcn](file:///C:/Users/rdwar/.gemini/antigravity/skills/shadcn/SKILL.md)**: Modern UI and components.
- **[design-spells](file:///C:/Users/rdwar/.gemini/antigravity/skills/design-spells/SKILL.md)**: Animations and micro-interactions.

---

## 🚑 Troubleshooting & Recovery

### 🪟 Windows (Truncation Crash Loops)
If the agent crashes immediately with a "truncation" or "trajectory" error:
1. **Close the app** completely.
2. **Backup & Clear State**: Remove folders in `%AppData%\antigravity\Local Storage` and `%USERPROFILE%\.gemini\antigravity-browser-profile\Default\Local Storage`.
3. **Lazy Loading**: Ensure instructions are loaded only when a skill is active.
4. **Helper Script**: See `windows-truncation-recovery.md` for a community batch script.

### 🐧 Ubuntu/Linux (Context Overload)
If the agent becomes unstable when the full library is present:
1. **Archive Skills**: Move the full `skills/` folder to `skills_library/`.
2. **Activate Specifics**: Use the `./scripts/activate-skills.sh` script to only link the bundles or IDs you need.
   - Example: `./scripts/activate-skills.sh "Web Wizard"`
3. **Clear History**: Start a fresh conversation to reset the context window.

---

## 📋 Standard Project Commands

### Local Development (Docker)
- **Start Stack**: `docker-compose up -d --build`
- **Stop Stack**: `docker-compose down`
- **View Logs**: `docker-compose logs -f [service_name]`

### Testing
- **Backend**: `pytest` (inside `backend` directory)
- **Frontend**: `npm run test` (inside `frontend` directory)
- **Quality**: `npm run lint` (frontend)
