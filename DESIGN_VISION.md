# 🎨 MiniCode Design & UX Vision

This document outlines the ideal User Experience (UX) and Design System for **MiniCode**, specifically tailored from the perspective of a **newbie student** who might be intimidated by traditional, harsh competitive programming platforms.

The goal is to use this document as a blueprint for generating stunning, intuitive interfaces using **Stitch** or other design tools.

---

## 1. 🌟 Design Philosophy: The "Newbie" Perspective
As a beginner, traditional coding judges (like Codeforces or raw LeetCode) look scary. They have too much text, confusing terminology, and harsh red "Wrong Answer" text. 

**For MiniCode, we want:**
- **Zero Friction:** I need to know exactly what to click when I log in.
- **Encouragement over Punishment:** Failing a test case shouldn't feel bad. It should feel like a learning opportunity guided by my AI mentor.
- **Gamified Progress:** I want to see my XP bar go up, earn badges, and see a "streak" flame.
- **Premium Feel:** The platform should look like a modern, expensive SaaS tool. It should have real-time animations, smooth transitions, and a gorgeous color palette.

---

## 2. 🎨 Core Aesthetics & Theme
To achieve the "Wow" factor and feel highly premium:
- **Theme:** "Sleek Dark Mode" with vibrant neon accents (Glassmorphism elements). 
- **Colors:**
  - **Background:** Deep space slate (`#0F172A` or `#09090b`)
  - **Cards/Surfaces:** Slightly lighter translucent panels with soft blur (backdrop-blur).
  - **Primary Accents:** Electric Purple (`#8B5CF6`) for primary actions, Neon Cyan (`#06b6d4`) for secondary.
  - **Success/Feedback:** Emerald Green (`#10b981`) for correct answers. Hot Pink/Coral (`#f43f5e`) for errors (softened, not a harsh red).
- **Typography:** Modern, clean sans-serif like **Inter**, **Outfit**, or **Plus Jakarta Sans**. Code snippets should use **JetBrains Mono** or **Fira Code**.
- **Micro-animations:** Buttons should gently scale on hover. The XP bar should animate smoothly when filling up. Confetti or subtle glowing effects when a problem is solved correctly.

---

## 3. 🖥️ Key Screens & Ideal Features (Stitch Blueprints)

When generating these screens in Stitch, use the following feature sets and layouts:

### A. The Student Dashboard / Profile (`/profile`)
**Vibe:** Welcoming, clear, encouraging.
**Access:** Students reach this by clicking their profile photo in the navbar from any page.
**Features to include:**
- **Top Nav:** Profile picture, current level/title (e.g., "Level 3: Code Ninja"), and a flaming streak counter (🔥 3 Days). The main MiniCode logo links strictly to the `/problems` arena.
- **Hero Section:** "Welcome back, [Name]! Ready to crush some code?" with a large, glowing button to "Resume Learning" or "Daily Challenge".
- **Progress Widgets:** A visually appealing ring chart showing "Topics Mastered" (Arrays, Strings, Hash Maps).
- **Problem Feed / Recent Activity:** Cards showing recommended problems or recent submissions. Each card has:
  - Difficulty badge (colored dots: green/easy, yellow/med).
  - "Provision GitHub Repo" button prominently displayed.
  - Estimated time to solve.

### B. The Problem Solving Arena
**Vibe:** Focused, professional, but not overwhelming.
**Features to include:**
- **Layout:** Split pane.
  - **Left Pane (The Lore):** Problem description written engagingly. Clear examples with visual breakdowns (not just raw text input/output, but maybe small diagrams or highlighted code).
  - **Right Pane (The Action):** Since they code locally and push to GitHub, this pane should show the connected repository status (e.g., "🐙 Connected to `username/minicode-two-sum`").
- **The Magic Button:** A big, beautiful, glowing button saying **"Sync & Evaluate Code"**.
- **Status Tracker:** A timeline showing the evaluation state: "Fetching repo..." -> "Running tests..." -> "Gemini AI is analyzing...".

### C. The AI Mentor Feedback Screen (Post-Submission)
**Vibe:** Helpful, instructive, like a friendly teacher.
**Features to include:**
- **The Score Matrix:** Instead of just "Pass/Fail", show a beautiful grid:
  - ✅ Correctness (100/100)
  - ⚡ Time Complexity (O(n) - Great!)
  - 🧠 Code Quality (85/100)
- **The "Mentor's Notes":** A chat-bubble style section where the Gemini AI gives a personalized breakdown: *"Awesome job using a HashMap! Next time, try to handle the edge case where the array is empty to make it perfectly robust."*
- **Hints (If Failed):** If the user fails, don't show the exact answer. Have a blurred box that says "Click to reveal a hint from your AI Mentor".

### D. The Leaderboard & Profile
**Vibe:** Competitive but friendly.
**Features to include:**
- **Leaderboard:** A podium aesthetic for the top 3 users. Rows for other users with their avatars, XP, and badges. 
- **Profile Page:** A GitHub-style contribution graph (green squares) to show activity. A "Trophy Case" showcasing badges like "Bug Squasher" or "First Blood" (for solving a problem first).

### E. The Login / Welcome Screen
**Vibe:** Exciting, modern, a gateway to greatness.
**Features to include:**
- **Split Screen or Floating Card Layout:** A visually stunning background (maybe an abstract dark mesh or gentle animated gradient) with a sleek glass card in the center.
- **Clear User Paths:** 
  - A gigantic, inviting **"Continue with GitHub"** button prominent for students. (Includes the GitHub logo).
  - A smaller, secondary tab or link for **"Faculty / Admin Login"** to keep the student path perfectly clear.
- **Value Proposition:** Short punchy text on the side: "Master your skills. Real repos. AI Feedback." 

### F. The Faculty Portal
**Vibe:** Analytical, organized, empowering.
**Features to include:**
- **Dashboard Overview:** High-level metrics showing class engagement: "Total Submissions Today", "Average Pass Rate", "Most Struggled Problem". 
- **Problem Manager:** A sleek data table listing their created problems. Status dots (Active/Draft). 
- **Problem Creation Wizard:** A step-by-step form (not a huge intimidating wall of inputs).
  - Step 1: Description & Lore.
  - Step 2: Test Cases (with a clean UI to add input/output pairs).
  - Step 3: Deployment.
- **Student Insights:** A view to seeing how a specific student is doing, looking at their GitHub commit timeline directly from the portal.

### G. The Admin Portal
**Vibe:** Command Center, secure, powerful.
**Features to include:**
- **System Health:** Quick widgets showing API usage (Gemini limits, GitHub API limits), active users, and database health.
- **User Management Grid:** A powerful, filterable table. Ability to quickly revoke access, reset roles, or ban abusive users.
- **Global Settings:** Toggles for system-wide features (e.g., "Maintenance Mode", "Disable New Registrations"). 

---

## 4. 📝 Summary of Stitch Prompts 
If using the Stitch UI generator, here are condensed prompts to build the UI:

1. **Dashboard:** *"A dark-mode dashboard for a beginner coding student. Top nav with user level and streak (🔥). A beautiful hero section welcoming them. A grid of problem cards with 'Easy/Medium/Hard' tags and a prominent 'Start in GitHub' button. Glassmorphism styling, deep blue/slate backgrounds with vibrant purple accents."*
2. **Problem View:** *"A coding problem page with a split layout. Left side has beautifully formatted problem instructions. Right side has a sleek widget showing GitHub repo connection status, and a large glowing 'Evaluate with AI' button. Dark mode, modern typography, extremely polished."*
3. **AI Feedback:** *"A success screen for a coding submission. Shows a beautiful score breakdown (Correctness, Speed, Quality). Features a friendly card outlining personalized AI mentor feedback. Uses emerald greens and sleek dark slate colors. Confetti-like subtle background effects."*
4. **Login Screen:** *"A dark mode login screen for a coding platform. A sleek glassmorphism card in the center. A large, prominent 'Log in with GitHub' button. A subtle toggle for 'Faculty Login'. Background should have a gorgeous, abstract deep purple and cyan glowing mesh."*
5. **Faculty Dashboard:** *"A clean, analytical dashboard for a computer science professor. Dark mode. Shows cards for 'Total Submissions' and 'Pass Rate'. A data table listing active coding assignments. A prominent 'Create New Problem' button. Professional yet modern."*
6. **Admin Command Center:** *"A highly technical admin dashboard. Dark mode. System health widgets showing API usage and active connections. A compact data grid for managing user roles. Accent colors should emphasize system status (green for healthy, yellow for warnings)."*
