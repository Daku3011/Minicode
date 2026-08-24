# MiniCode User Manual

> **Welcome to MiniCode!** This comprehensive guide walks you through everything you need to know, organized in Notion-style pages for each role.

---

## Quick Navigation

| Role | Start Here | Key Actions |
|------|-----------|-----------|
| **Students** | [Getting Started](#getting-started) | Browse Problems → Start → Code → Submit |
| **Students** | [Learning Paths](#page-8-learning-paths-roadmaps) | Pick a Stream → Complete Milestones → Chat with AI Assistant |
| **Students** | [Learning Dashboard](#page-11-learning-dashboard) | View weak areas → Get AI recommendations |
| **Students** | [Achievements & Streaks](#page-12-achievements--streaks) | Earn badges → Maintain streaks |
| **Students** | [Portfolio](#page-14-student-portfolio) | Share your coding journey |
| **Students** | [Code Snippets](#page-15-code-snippet-library) | Save & share reusable code |
| **Students** | [External Integrations](#page-16-external-judge-integration) | Sync Codeforces/LeetCode |
| **Students** | [Discussion Forum](#page-10-discussion-forum) | Ask questions per problem |
| **Students** | [AI Chatbot](#page-9-ai-teaching-assistant) | Get programming help anytime |
| **Faculty** | [Faculty Dashboard](#faculty-dashboard) | Create Problems → Track Students → Manage Events |
| **Faculty** | [Code Review](#page-13-code-review-system) | Review student submissions |
| **Faculty** | [Interview Mode](#page-14-interview-mode) | Conduct timed coding interviews |
| **Faculty** | [Contests](#page-11-time-based-contests) | Run live coding competitions |
| **Admins** | [Admin Panel](#admin-panel) | Manage Users → View Stats → Sync XP |

---

## Getting Started

### System Requirements

- Modern browser (Chrome, Firefox, Safari, Edge)
- GitHub account (required for students)
- Institutional email (required for faculty)

### Access Points

| Environment | URL |
|-------------|-----|
| Local Development | `http://localhost:3000` |
| Staging/Production | `https://your-domain.com` |
| API Health | `http://localhost:8000/health` |

### Login Methods

#### Students: GitHub OAuth

1. Navigate to `/login`
2. Click **"Authorize with GitHub"**
3. Grant repository permissions when prompted
4. Complete GitHub OAuth consent
5. Redirected back and signed in automatically

> **Why GitHub?** MiniCode creates private repositories for each problem, enabling real coding workflows with git commits.

#### Faculty/Admin: Google OAuth

1. Navigate to `/login`
2. Click **"Faculty Authentication"**
3. Select **"Sign in with Google"**
4. Use institutional account (`@scet.ac.in` emails auto-create faculty role)

#### Faculty/Admin: Username + Password

1. Navigate to `/login`
2. Click **"Faculty Authentication"**
3. Enter credentials in Control Room form

> **Help & FAQ:** A stylized "Help & FAQ" button is available on the login card for immediate access to platform support and documentation.

**Development Credentials:**

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Faculty | faculty | faculty123 |
| Student | student | student123 |

---

## Student Portal

### Dashboard Overview

Your student dashboard provides:

- **XP & Level** - Current progress and rank
- **Problems Solved** - Completion statistics
- **Leaderboard Position** - Class ranking
- **Activity Heatmap** - GitHub-style contribution graph
- **Recent Activity** - Latest submissions and achievements

### Learning Dashboard (`/dashboard`)

Your personalized AI-powered learning dashboard:

- **XP/Level Overview** - Current stats at a glance
- **Weak Areas Chart** - Bar chart showing your weakest subjects based on submission scores
- **AI Recommendations** - Smart problem suggestions targeting your weak areas and current level
- **Recent Activity Feed** - Latest submissions and achievements timeline
- **Subject Breakdown** - Solved vs unsolved problems per topic area
- **Learning Path Progress** - Milestone completion across all streams

### Page 1: Problem Browser

#### Finding Problems

1. Click **"Problems"** in the navigation bar
2. Filter by difficulty: Easy / Medium / Hard
3. Filter by subject area (Algorithms, Data Structures, etc.)
4. Sort by XP reward or difficulty

#### Understanding Problem Cards

Each problem card displays:

| Field | Description |
|-------|-------------|
| **Title** | Problem name |
| **Difficulty** | Easy (green), Medium (yellow), Hard (red) |
| **XP Reward** | Points earned for solving |
| **Level Required** | Minimum level to unlock |
| **Solved Count** | How many students completed it |

#### Problem Details Page

Click a problem to view:

```
┌─────────────────────────────────────────────────────────────┐
│ Problem: Two Sum                                            │
├─────────────────────────────────────────────────────────────┤
│ Difficulty: Easy    XP: 100    Level: 1                     │
│                                                             │
│ ## Description                                              │
│ Given an array of integers nums and a target integer target,│
│ return indices of the two numbers such that they add up to  │
│ target.                                                     │
│                                                             │
│ ## Input Format                                             │
│ First line: n (array length)                                │
│ Second line: n space-separated integers                     │
│ Third line: target integer                                  │
│                                                             │
│ ## Output Format                                            │
│ Two space-separated indices                                 │
│                                                             │
│ ## Constraints                                              │
│ 2 ≤ n ≤ 10^4                                                │
│ -10^9 ≤ nums[i] ≤ 10^9                                      │
│                                                             │
│ ## Example                                                  │
│ Input:                                                      │
│ 4                                                           │
│ 2 7 11 15                                                   │
│ 9                                                           │
│ Output:                                                     │
│ 0 1                                                         │
│ Explanation: nums[0] + nums[1] = 2 + 7 = 9                  │
└─────────────────────────────────────────────────────────────┘
```

Problems follow a LeetCode-style structure designed to be self-explanatory even if you're new to DSA patterns:

- **Overview** — story and context in plain language
- **Understanding the Problem** — step-by-step explanation of input → expected output
- **Examples** — worked examples, each with an **Explanation** showing exactly how the output is derived (shown under every sample test case)
- **Approach Hints** — the relevant technique/pattern named for you (two pointers, BFS, DP, …) without spoiling the solution

### Page 2: Profile & Verification

#### Profile Overview
1. Click your avatar in the navbar and select **"Profile"**
2. View your complete stats: XP, Level, Problems Solved, and Ranking
3. Manage account settings and preferences

#### Student Email Verification
To ensure secure communication and access to specific features, verify your student email:
1. On your profile page, locate the **Email Verification** section
2. Enter your email address and click **"Send Verification Email"**
3. Check your inbox for a unique verification code dynamically sent to your provided address
4. Enter the code in the verification modal to complete the process

### Page 3: Starting a Problem

#### Repository Creation

1. Open problem details page
2. Click the **"Deploy Workspace"** button
3. MiniCode creates a private repository in your GitHub:
   - **Repo Name:** `minicode-{username}-{problem-slug}`
   - **Visibility:** Private (only you can see)
   - **Initial Files:** README.md (problem description + submission guidelines), solution.py (base file — rename its extension to match your language)

> **Note:** This requires GitHub OAuth permissions. If repo creation fails, re-login with GitHub.

#### What Gets Created

```
minicode-student1/two-sum/
├── README.md           # Problem statement
├── solution.py        # Starter code template
└── .git/             # Git repository (work locally)
```

### Page 3: Coding Workflow

#### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/username/minicode-username-problem.git
   cd minicode-username-problem
   ```

2. **Write your solution:**
   ```python
   def solve(nums, target):
       seen = {}
       for i, num in enumerate(nums):
           complement = target - num
           if complement in seen:
               return [seen[complement], i]
           seen[num] = i
       return []
   ```

3. **Commit your changes:**
   ```bash
   git add solution.py
   git commit -m "Implement two-sum solution"
   git push origin main
   ```

> **Tip:** Commit history is analyzed by the AI judge. Multiple meaningful commits show genuine effort.

#### Code Editor (Optional)

Some problems support in-browser editing:

1. Open problem details page
2. Click **"Edit Code"**
3. Write code in the editor
4. Click **"Save & Commit"** to sync to GitHub

### Page 4: Submission

#### Submitting Your Solution

1. Open the problem detail page
2. Click **"Deploy Workspace"** — MiniCode creates a private GitHub repo for you, seeded with a base `solution.py` and a README containing the submission guidelines
3. Clone the repo and write your solution
4. Click **"Evaluate Logic"** to run the judge on your latest push

#### Supported Languages & File Naming

All major languages are accepted. Rename your base file's extension so the judge finds it:

| Language | Required filename |
|----------|-------------------|
| Python | `solution.py` |
| C++ | `solution.cpp` |
| C | `solution.c` |
| Java | `solution.java` |
| JavaScript | `solution.js` |
| Go | `solution.go` |
| Rust | `solution.rs` |

Keep exactly one `solution.*` file at the repository root.

#### Fair Play

- Use AI minimally — treat it like a hint, not a solver.
- Submissions are screened automatically; flagged work goes to faculty review.
- Commit as you work: your commit history is part of the evaluation.

#### Mobile Devices

MiniCode is fully browsable on phones — you can read problems (with worked examples and explanations), view events, hackathons, leaderboards and profiles from the mobile menu. **Submissions are desktop-only**: the workspace/evaluation controls are replaced with a notice asking you to switch to a desktop browser.

#### Submission States

| State | Meaning | Color |
|-------|---------|-------|
| `pending` | Queued for evaluation | Gray |
| `processing` | Being judged | Blue |
| `accepted` | All test cases passed | Green |
| `wrong_answer` | Some outputs incorrect | Yellow |
| `error` | Code has bugs or judge failed | Red |

#### Real-time Updates

Submission status updates in real-time via WebSocket. You can:

- See processing stages: "Fetching code..." → "Analyzing..." → "Scoring..."
- Receive notification when complete
- View detailed feedback immediately

### Page 5: Feedback & Improvement

#### Understanding AI Feedback

The AI judge provides:

```
┌────────────────────────────────────────────────────────────┐
│ Submission Results                                         │
├────────────────────────────────────────────────────────────┤
│ Status: Accepted ✓                                         │
│ Score: 92/100                                              │
│ AI Probability: 12% (Human-written)                        │
│                                                            │
│ ## Analysis                                                │
│ ✅ Correct algorithm implementation using hash map          │
│ ✅ Optimal time complexity O(n)                             │
│ ✅ Clean, readable variable names                           │
│                                                            │
│ ## Suggestions                                             │
│ Consider early return optimization for empty arrays.       │
│                                                            │
│ ## Next Steps                                              │
│ Great work! Try "Three Sum" for a harder challenge.        │
└────────────────────────────────────────────────────────────┘
```

#### Sandbox Execution

Submissions are now evaluated in an isolated Docker sandbox:

1. Your code is extracted from your GitHub repository
2. It runs inside a secure container (Python/Node.js/Java) against test cases
3. Actual execution results (passed/failed test cases) are captured
4. Results are sent to Gemini AI for quality feedback and code review
5. If Docker is unavailable, the system falls back to AI-only evaluation

#### Resubmission

1. View feedback and identify issues
2. Improve code locally
3. Commit and push changes
4. Submit again

> **Note:** You can submit unlimited times. Only the highest score counts toward XP.

### Page 6: XP & Progression

#### Leveling System

| Level | XP Required | Title | Unlock |
|-------|-------------|-------|--------|
| 1 | 0 | Beginner | Basic problems |
| 2 | 100 | Explorer | Medium problems |
| 3 | 300 | Ninja | Advanced topics |
| 4 | 600 | Warrior | Hard problems |
| 5 | 1000 | Master | Expert challenges |
| 6 | 1500 | Legend | Elite challenges |

#### XP Awards

- **First solve:** Full problem XP reward
- **Score improvement:** Difference in XP (scaled by score %)
- **Faculty bonus:** Additional XP awards from faculty
- **Streak bonuses:** Extra XP for maintaining daily streaks (3, 7, 14, 30, 60, 100 days)
- **Achievement badges:** XP rewards for earning badges

#### Leaderboard

View rankings at `/leaderboard`:

| Rank | Student | XP | Level |
|------|---------|-----|-------|
| 🥇 | alice | 1,250 | 5 |
| 🥈 | bob | 980 | 4 |
| 🥉 | charlie | 750 | 4 |

### Page 7: Events

#### Event Types

| Type | Description | Team Size |
|------|-------------|---------|
| **Solo** | Individual competition | 1 |
| **Team** | Group submission | 2-5 |
| **Hackathon** | Extended duration | 1-10 |

#### Joining Events

1. Navigate to `/events`
2. Browse available events (active, upcoming)
3. Click **"Join Event"**
4. For team events: Receive/accept invitations

#### Event Submissions

1. Solve event-specific problems
2. Submit deliverables
3. View event leaderboard
4. Receive event rewards and badges

### Page 8: Learning Paths (Roadmaps)

Learning Paths are curated streams of milestones organized by topic. Currently available: **Cybersecurity**, **AI & Machine Learning**, **Web Development**, **Data Science**, **Cloud & DevOps**, **Mobile Development**, **Blockchain**, **System Design**, and **Open Source**.

#### Accessing Learning Paths

1. Click **"Roadmap"** in the navigation bar
2. Browse available streams — each shows its icon, color, and milestone count
3. Click a stream to view its milestones

#### Milestone Progression

Each stream has a sequence of milestones you complete in order:

```
┌────────────────────────────────────────────────────────────┐
│ Cybersecurity                                              │
├────────────────────────────────────────────────────────────┤
│ Overall Progress: 2 / 5 milestones                         │
│ [████████████████░░░░░░░░░░░░░░░░░░░░░░░░] 40%             │
│                                                            │
│ ✅ Networking Basics           — Completed   [+100 XP]     │
│ ✅ Web Security Fundamentals   — Completed   [+150 XP]     │
│ ▶ Cryptography 101            — In Progress [+150 XP]     │
│ 🔒 Ethical Hacking            — Locked      [+200 XP]     │
│ 🔒 CTF Challenge Master       — Locked      [+300 XP]     │
└────────────────────────────────────────────────────────────┘
```

| Status | Meaning |
|--------|---------|
| 🔒 Locked | Complete previous milestones to unlock |
| ▶ In Progress | Started — upload your work for evaluation |
| ✅ Completed | Needs improvement — can resubmit |
| 🏆 Rewarded | Passed with score ≥60 — XP earned |

#### Submitting Milestone Work

1. Click **"Start"** on a milestone to begin
2. Complete the related learning task
3. Click **"Submit Work"** and upload your file (PDF, DOCX, TXT, code files)
4. AI evaluates your submission (score 0-100)
5. Score **≥60** = passed! XP awarded, next milestone unlocks
6. Score **<60** = feedback provided, resubmit after improving

> **New milestones are auto-generated by AI** when you complete the current one, so the learning path never runs out!

#### AI Learning Materials

Click **"View Learning Materials"** on any unlocked milestone:

- **Hints** — Personalized guidance generated by Gemini AI based on your milestone and progress
- **Resources** — 3 curated external links tailored to help you complete that milestone

#### Stream Chatbot

Each stream has an AI assistant:

1. Click **"Stream Assistant"** (bottom-right corner)
2. Ask questions about the stream's topics, milestones, or concepts
3. The chatbot only answers questions related to that stream
4. Supports Markdown responses with code blocks, lists, and links
5. Resizable from top and left edges

### Page 9: AI Teaching Assistant

The AI Teaching Assistant is available globally from any page via the floating chat widget.

#### Accessing the Assistant

1. Look for the chat bubble icon at the **bottom-right corner** of any page
2. Click to expand the chat window
3. Type your question and press Enter

#### What You Can Ask

- **General programming help:** "Explain recursion in Python"
- **Problem hints:** "Give me a hint for Two Sum without giving the answer"
- **Code explanations:** "Why did my submission fail?" (uses your submission history)
- **Concept clarifications:** "What's the difference between HTTP and HTTPS?"
- **Learning advice:** "What should I learn after arrays?"

#### Context-Aware Responses

The assistant knows:
- Your current XP level and role
- Which problems you've attempted
- Your recent activity
- Your skill level (adjusts explanation complexity accordingly)

> **Rate limit:** 20 requests per minute per user.

### Page 10: Discussion Forum

Every problem now has a built-in discussion forum for asking questions and sharing knowledge.

#### Accessing Discussions

1. Open any problem detail page
2. Click the **"Discussions"** tab in the page header (next to Specifications / Final Result)
3. Browse existing threads or start a new one

#### Creating a Thread

1. Click **"New Thread"**
2. Enter a descriptive title
3. Write your question or observation (supports Markdown)
4. Click **"Post"**

#### Replying & Voting

- **Reply:** Add your answer to any thread
- **Upvote/Downvote:** Vote on helpful answers
- **Accepted Answer:** The thread author can mark the best answer
- **Sort:** By newest, top-voted, or unresolved first

### Page 11: Time-based Contests

Live synchronous coding competitions with real-time leaderboards.

#### Contest Types

| Type | Duration | Scoring |
|------|----------|---------|
| **Standard** | 1-3 hours | Score per problem |
| **ICPC-style** | 3-5 hours | ICPC scoring (penalty time) |
| **Short Sprint** | 30-60 min | 1-2 problems, speed matters |

#### Participating in a Contest

1. Navigate to `/contests`
2. Browse upcoming/active/completed contests
3. Click **"Register"** on an upcoming contest
4. At start time, click **"Enter Arena"**

#### Contest Arena

The contest arena provides:

- **Problem List** — Indexed problems (A, B, C, D...) in a sidebar
- **Code Editor** — Monaco Editor for writing solutions
- **Countdown Timer** — Shows remaining time
- **Live Standings** — Real-time leaderboard during the contest
- **Submit Button** — Submit per problem with time tracking

#### Scoring

- Points awarded per problem based on difficulty
- ICPC-style: penalties for incorrect submissions before acceptance
- Final standings calculated when contest ends
- Top 3 winners receive XP bonuses

### Page 12: Achievements & Streaks

Earn badges and maintain streaks to gamify your learning journey.

#### Available Badges

| Badge | Category | How to Earn |
|-------|----------|-------------|
| **First Blood** | Milestone | Submit your first problem |
| **Problem Solver** | Progression | Solve 10 problems |
| **Code Warrior** | Progression | Solve 25 problems |
| **Marathon Runner** | Progression | Solve 50 problems |
| **Speed Demon** | Performance | Submit correct solution within 10 minutes |
| **Bug Hunter** | Persistence | Submit 3+ times on same problem until accepted |
| **Perfect Score** | Excellence | Get 100/100 on any problem |
| **Social Butterfly** | Community | Join a cohort |
| **Level Master** | Progression | Reach Level 5 |
| **Streak King** | Consistency | Maintain a 30-day streak |

#### Viewing Badges

1. Navigate to `/profile/achievements`
2. Browse all available badges by category
3. See which ones you've earned (with dates) and which are still locked
4. View progress toward incomplete badges

#### Streaks System

Login and submission streaks reward daily consistency:

| Streak Length | Bonus |
|--------------|-------|
| 3 days | +10 XP |
| 7 days | +25 XP |
| 14 days | +50 XP |
| 30 days | +100 XP |
| 60 days | +250 XP |
| 100 days | +500 XP |

Your streak is displayed on your profile with:
- **Fire icon** with current streak count
- **Max streak** record
- **30-day calendar** showing activity with colored dots

### Page 13: Code Review System

Request and provide peer code reviews.

#### Requesting a Review

1. After submitting a problem, navigate to its submission page
2. Click **"Request Review"**
3. Specify any areas you want feedback on

#### Reviewing Code

1. Navigate to `/reviews` to see pending review assignments
2. Open a review request to see:
   - The student's code with syntax highlighting
   - AI judge results for reference
   - Inline commenting on specific lines
3. Submit scores for:
   - Overall quality (1-100)
   - Code complexity
   - Readability
4. Add inline comments on specific lines of code
5. Provide an overall summary

#### Review States

| State | Description |
|-------|-------------|
| `pending` | Waiting for reviewers |
| `in_progress` | Being reviewed |
| `completed` | Review submitted |
| `resolved` | All comments addressed |

### Page 14: Student Portfolio

Every student gets an auto-generated public portfolio page.

#### Viewing Your Portfolio

Your portfolio is automatically generated at `/u/{your-username}` and includes:

- **Profile Header** — Avatar, name, XP, level with gradient banner
- **Stats Grid** — Problems solved, total submissions, max streak, badges earned
- **Achievement Badges** — All earned badges displayed
- **Solved Problems Table** — Filterable by difficulty and subject
- **Activity Heatmap** — GitHub-style contribution graph showing submission frequency
- **XP Progression Chart** — SVG line chart of XP growth over time
- **Recent Activity** — Latest submissions and achievements
- **Share Button** — Copy your portfolio link to share

> **Public Access:** Anyone with the link can view your portfolio. No login required for the public version.

### Page 14: Interview Mode

Timed coding interview platform for faculty to assess students.

#### For Students: Taking an Interview

1. You'll receive an interview invitation link
2. Open the link at the scheduled time
3. The interview session opens with:
   - **Problem Description** panel
   - **Monaco Code Editor**
   - **Countdown Timer**
   - **Auto-save** — Your code is saved automatically as you type
4. Problems are displayed one at a time
5. When time expires, your final code is captured automatically
6. Faculty receives AI evaluation of your performance

#### Features

- **Recording:** Code changes are tracked throughout the session
- **Auto-save:** Code persists even if connection drops
- **AI Evaluation:** Post-interview analysis of your approach, code quality, and problem-solving

### Page 15: Code Snippet Library

Save, share, and discover reusable code snippets.

#### Browsing Snippets

1. Navigate to `/snippets`
2. Search by title, language, or tags
3. Filter by programming language
4. View trending snippets (most upvoted this week)

#### Creating a Snippet

1. Click **"New Snippet"**
2. Add a descriptive title and optional description
3. Write or paste your code (syntax-highlighted editor)
4. Select the programming language
5. Add tags (comma-separated)
6. Choose visibility (public or private)
7. Click **"Save"**

#### Interacting with Snippets

- **Upvote/Downvote** — Rate useful snippets
- **Comment** — Discuss improvements and ask questions below the code
- **Copy** — One-click copy to clipboard
- **Report** — Flag inappropriate content

### Page 16: External Judge Integration

Connect your accounts from other coding platforms to track all your achievements in one place.

#### Supported Platforms

| Platform | Data Synced |
|----------|-------------|
| **Codeforces** | Submission history, problems solved, rating |
| **LeetCode** | Solved problems, submission stats |
| **HackerRank** | Challenge completions, badges |

#### Linking an Account

1. Navigate to `/settings/integrations`
2. Select the platform from the dropdown
3. Enter your username on that platform
4. Click **"Link Account"**

#### Syncing Data

- Click **"Sync"** on individual platform cards
- Or click **"Sync All"** to refresh all linked platforms
- Cross-platform stats show: total submissions, accepted, acceptance rate

### Page 9: Notifications

#### Notification Types

| Type | Description | Icon |
|------|-------------|------|
| **XP Award** | Points received | ⭐ |
| **Level Up** | Level progression | 🏆 |
| **Submission** | Judge complete | ✅ |
| **Event** | Event updates | 🎯 |
| **Achievement** | Badge earned | 🏅 |
| **Streak** | Streak milestone | 🔥 |
| **Review** | Code review complete | 👁️ |
| **System** | Platform announcements | 📢 |

#### Managing Notifications

1. Click the **bell icon** in navbar
2. View unread count badge
3. Mark individual or all as read
4. Click to navigate to related content

---

## Faculty Dashboard

### Page 1: Overview

#### Faculty Home

Your faculty dashboard provides:

- **Class Statistics** - Total students, active today
- **Problem Analytics** - Submissions, acceptance rates
- **Recent Activity** - Student actions feed
- **Event Status** - Active and upcoming events

### Page 2: Problem Management

#### Creating Problems

1. Navigate to faculty problems section
2. Click **"Create Problem"**
3. Fill in required fields:

| Field | Description | Required |
|-------|-------------|---------|
| Title | Problem name | Yes |
| Description | Full problem statement | Yes |
| Difficulty | Easy/Medium/Hard | Yes |
| Subject | Topic area | No |
| Level | Unlock level | Yes |
| XP Reward | Points awarded | Yes |
| Visibility | Public/Private | Yes |
| Input Format | Input specification | No |
| Output Format | Output specification | No |
| Constraints | Problem limits | No |
| Hints | Optional hints | No |

4. Add test cases (input/expected output pairs)
5. Mark sample test cases (shown to students)
6. Click **"Create"**

#### AI Problem Generation

1. Click **"Generate with AI"**
2. Upload text file or paste problem description
3. Review generated statement
4. Edit and publish

#### Test Case Management

**Adding Test Cases:**

| Input Data | Expected Output | Explanation | Sample |
|-----------|----------------|-------------|--------|
| `4`<br>`2 7 11 15`<br>`9` | `0 1` | indices 0 and 1 sum to 9 | ✅ |
| `3`<br>`3 2 4`<br>`6` | `1 2` | indices 1 and 2 sum to 6 | ✅ |
| `2`<br>`1 1`<br>`2` | `0 1` | — | ❌ |

> **Sample** test cases are visible to students. Hidden cases are for judging only. The optional **Explanation** appears under the sample on the problem page (LeetCode-style) — use it to show how the input leads to the output.

> **AI Generation:** Uploading source material auto-generates a LeetCode-style statement (Overview, Understanding the Problem, worked Examples with Explanations, Approach Hints) plus ready-made test cases with explanations loaded into the form. The "Improve with AI" button expands short drafts into the same format.

### Page 3: Student Analytics

#### Student Profiles

1. Navigate to student list (`/faculty/students`)
2. Click a student to view:
   - Profile overview
   - XP and level
   - Problems solved
   - Submission history
   - Activity timeline
   - Badges earned
   - Current streaks

#### Problem Analytics

1. Navigate to problem analytics (`/faculty/analytics`)
2. Select a problem
3. View detailed metrics:

| Metric | Description |
|--------|-------------|
| Total Submissions | Count |
| Acceptance Rate | % accepted |
| Average Score | Mean score |
| AI Detection Flag | Estimated AI-assistance likelihood — heuristic only; only strong evidence (>85%) surfaces a note, and faculty review is required before any conclusion |

### Page 4: XP Management

#### Awarding XP

1. Navigate to student profile
2. Click **"Award XP"**
3. Enter amount and reason
4. Confirm

> **Effect:** Student receives notification and XP update.

#### Bulk XP Operations

Faculty can trigger XP sync for all students:
- Navigate to dashboard stats
- Click **"Sync XP"**

### Page 5: Events Management

#### Creating Events

1. Navigate to events (`/events`)
2. Click **"Create Event"**
3. Configure:

| Setting | Description |
|---------|-------------|
| Name | Event title |
| Description | Details |
| Type | Solo/Team/Hackathon |
| Start/End | Time window |
| Problems | Linked problems |
| Max Team Size | For team events |

#### Event Dashboard

- **Leaderboard** - Live rankings
- **Submissions** - Entry list
- **Analytics** - Participation metrics

### Page 6: Contests Management

#### Creating Contests

1. Navigate to `/contests`
2. Click **"Create Contest"**
3. Configure:

| Setting | Description |
|---------|-------------|
| Title | Contest name |
| Description | Rules and details |
| Start/End Time | Scheduled window |
| Duration | Minutes for the contest |
| Scoring Type | Standard or ICPC |
| Problems | Select problems for the contest |

#### Contest Administration

- **View Standings** - Real-time leaderboard
- **End Contest** - Manually end and finalize results
- **Auto-award XP** - Top 3 receive XP bonuses
- **Monitor Participants** - See who registered and started

### Page 6: Cohorts & Labs

#### Managing Cohorts

**Cohort** = Group of students assigned to a faculty member

1. Navigate to cohorts (`/cohorts`)
2. Create new cohort
3. Add students by username or bulk import
4. View cohort analytics

#### Managing Labs

**Lab** = Timed practice session within a cohort

1. Navigate to labs (`/labs`)
2. Create lab within a cohort
3. Set start/end time
4. Link problems
5. Monitor submissions in real-time

### Page 7: Notifications & News

#### News Posts

1. Navigate to news management
2. Click **"Create Post"**
3. Enter title, content, priority
4. Set expiration (optional)
5. Publish

#### Student Communication

- News posts reach all students
- Individual notifications for specific students
- Batch notification for cohorts

### Page 8: Code Review Management

#### Viewing Review Requests

1. Navigate to `/reviews`
2. See all pending review requests from students
3. Filter by problem, student, or date

#### Providing Reviews

1. Open a review request
2. View the student's code with inline commenting
3. Score: Overall quality, complexity, readability
4. Add line-by-line feedback
5. Submit review — student receives notification

### Page 9: Interview Management

#### Scheduling Interviews

1. Navigate to `/interviews`
2. Click **"New Interview"**
3. Select candidate(s)
4. Choose problems for the assessment
5. Set duration and scheduled time

#### Monitoring Interviews

- **Live Sessions** - See active interview status
- **Recording** - Code changes are tracked
- **AI Evaluation** - Post-interview analysis of candidate performance

### Page 10: Team Formation

#### Reviewing Team Requests

Students can form teams for events and contests:
- View open team formation requests
- See student profiles with skill tags
- Approve or reject team applications

### Page 10: Plugin Management

#### Installing Plugins

1. Navigate to plugins admin
2. Browse available plugins
3. Install/uninstall as needed
4. Configure plugin settings per plugin

#### Available Plugin Hooks

| Hook | Triggered When |
|------|---------------|
| `before_submission` | Before a submission is evaluated |
| `after_judge` | After evaluation is complete |
| `on_problem_create` | When a new problem is created |
| `on_user_login` | When a user logs in |

---

## Admin Panel

### Page 1: System Overview

#### Admin Dashboard

Your admin dashboard shows:

- **Platform Stats** - Total users, problems, submissions
- **Active Users** - Online now
- **System Health** - API, database, worker, sandbox status
- **Recent Activity** - Audit log

### Page 2: User Management

#### User List

Navigate to `/admin/users`:

| Username | Email | Role | XP | Status |
|----------|-------|------|-----|--------|
| alice | alice@example.com | student | 1,250 | Active |
| bob | bob@example.com | faculty | - | Active |
| charlie | charlie@example.com | student | 0 | Inactive |

#### Role Management

1. Click user row
2. Click **"Change Role"**
3. Select new role: Student / Faculty / Admin / Alumni
4. Confirm

> **Warning:** Role changes take effect immediately. Document changes for audit.

#### User Actions

| Action | Description |
|--------|-------------|
| Change Role | Promote/demote user |
| Reset XP | Clear XP to zero |
| Disable | Prevent login |
| Delete | Remove user (soft delete) |

### Page 3: System Configuration

#### XP Synchronization

Trigger global XP sync:

1. Navigate to admin panel
2. Click **"Sync All XP"**
3. Confirm action
4. View sync results

#### Sandbox Health

Monitor the code execution sandbox:

| Endpoint | Description |
|----------|-------------|
| `GET /admin/sandbox/status` | Check sandbox availability |
| `POST /admin/sandbox/build` | Build all sandbox images |
| `POST /admin/sandbox/build/{language}` | Build specific language image |

#### Plugin Management

Admin can:
- View all installed plugins
- Enable/disable plugins
- Uninstall plugins
- Configure plugin settings

#### Platform Stats

View detailed statistics:

- User growth over time
- Problem completion rates
- Submission patterns
- System performance

### Page 4: Platform Settings

#### Configuration Options

| Setting | Description |
|---------|-------------|
| Registration | Enable/disable new signups |
| GitHub OAuth | Configure OAuth app |
| Google OAuth | Configure OAuth app |
| Gemini Settings | AI judge configuration |
| Email Provider | Resend/SMTP settings |
| Rate Limits | API rate limiting |
| Sandbox | Docker sandbox configuration |
| External Integrations | Platform connection settings |

---

## Collaborative Coding

MiniCode supports real-time collaborative code editing sessions.

### Creating a Session

1. Navigate to the collaboration page
2. Click **"New Session"**
3. Share the session link with teammates
4. Start coding together in real-time

### Features

- **Real-time sync** — Code changes appear instantly for all participants
- **Cursor tracking** — See where others are editing
- **Session snapshots** — Periodic saves of code state
- **Participant management** — Join/leave sessions

### Use Cases

- Pair programming practice
- Group problem solving
- Teaching/demonstration sessions
- Team contest preparation

---

## Team Formation

Find teammates for events and contests based on complementary skills.

### Setting Up Your Profile

1. Navigate to `/team-formation`
2. Click **"Edit Profile"**
3. Select your preferred roles (Frontend, Backend, Full-stack, etc.)
4. Add your skill tags (Python, React, Docker, etc.)
5. Set availability preferences

### Finding a Team

- **Browse Requests** — See open team formation requests
- **Create Request** — Post your own looking-for-team ad
- **Smart Match** — Get AI-suggested teammates based on complementary skills
- **Apply** — Send applications to teams that interest you

### Application Flow

1. Find a team request that matches your interests
2. Click **"Apply"** with a brief message
3. The team creator reviews your profile and skills
4. They accept or reject your application
5. Once accepted, you're added to the team

---

## Dark Mode

MiniCode supports three theme modes to suit your preference.

### Switching Themes

Click the **Sun/Moon icon** in the navbar (top-right) to cycle through:

| Mode | Description |
|------|-------------|
| ☀️ **Light** | Bright, clean interface optimized for daytime |
| 🌙 **Dark** | Reduced eye strain for late-night coding |
| 💻 **System** | Follows your device's system preference |

The theme preference is saved to your browser and persists across sessions.

---

## Best Practices

### For Students

1. **Start Early** - Don't wait until deadline
2. **Commit Often** - Show your problem-solving process
3. **Read Feedback** - AI suggestions are valuable
4. **Iterate** - Improve scores by resubmitting
5. **Join Events** - Earn bonus XP and badges
6. **Maintain Streaks** - Daily consistency earns bonus XP
7. **Use the AI Assistant** - Ask for hints when stuck
8. **Build Your Portfolio** - Share your achievements

### For Faculty

1. **Clear Problems** - Write detailed constraints
2. **Test Cases** - Cover edge cases
3. **Timely Feedback** - Review submissions regularly
4. **Encourage** - Use XP awards for motivation
5. **Monitor** - Watch for AI-generated submissions
6. **Use Contests** - Run timed competitions for engagement
7. **Review Code** - Provide personalized feedback via code reviews
8. **Schedule Interviews** - Assess candidates with timed coding sessions

### For Admins

1. **Audit Trail** - Document role changes
2. **Monitor Health** - Check system metrics, sandbox status
3. **Backup Data** - Schedule regular backups
4. **Update Docs** - Keep this manual current
5. **Manage Plugins** - Keep plugins updated
6. **Monitor Sandbox** - Ensure Docker sandbox is operational

---

## Troubleshooting

### Quick Fixes

| Issue | Quick Solution |
|-------|---------------|
| Login fails | Clear cookies and re-login |
| OAuth error | Verify callback URL matches |
| Submissions pending | Check worker logs |
| Repo not found | Re-start problem |
| Score 0 | Check code for errors |
| XP not updating | Trigger XP sync |
| Sandbox errors | Check Docker is running |
| Plugin errors | Disable and re-enable plugin |

### Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| `E001` | OAuth callback mismatch | Update callback URL |
| `E002` | GitHub token expired | Re-login with GitHub |
| `E003` | Worker down | Check Celery service |
| `E004` | Judge timeout | Resubmit later |
| `E005` | Redis unavailable | Check Redis connection |
| `E006` | Sandbox unavailable | Check Docker service |

### Getting Help

When reporting issues, include:

- Your role (student/faculty/admin)
- Page URL where issue occurred
- Timestamp
- Submission ID or Event ID (if applicable)
- Screenshot or error message
- Steps to reproduce

---

<div align="center">

**Need more help?** Check [backend/Dev.md](./backend/Dev.md) for technical details or open an issue.

</div>
