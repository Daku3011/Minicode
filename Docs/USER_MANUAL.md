# MiniCode User Manual

> **Welcome to MiniCode!** This comprehensive guide walks you through everything you need to know, organized in Notion-style pages for each role.

---

## Quick Navigation

| Role | Start Here | Key Actions |
|------|-----------|-----------|
| **Students** | [Getting Started](#getting-started) | Browse Problems → Start → Code → Submit |
| **Students** | [Learning Paths](#page-8-learning-paths-roadmaps) | Pick a Stream → Complete Milestones → Chat with AI Assistant |
| **Faculty** | [Faculty Dashboard](#faculty-dashboard) | Create Problems → Track Students → Manage Events |
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
└─────────────────────────────────────────────────────────────┘
```

### Page 2: Starting a Problem

#### Repository Creation

1. Open problem details page
2. Click the **"Start Problem"** button
3. MiniCode creates a private repository in your GitHub:
   - **Repo Name:** `minicode-{username}-{problem-slug}`
   - **Visibility:** Private (only you can see)
   - **Initial Files:** README.md (with problem description), solution.py (starter code)

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

1. Open problem details page
2. Click **"Submit Solution"**
3. Select language (Python, JavaScript, etc.)
4. Confirm submission

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

#### Resubmission

1. View feedback and identify issues
2. Improve code locally
3. Commit and push changes
4. Submit again

> **Note:** You can submit unlimited times. Only the highest score counts toward XP.

### Page 6: XP & Progression

#### Leveling System

| Level | XP Required | Unlock |
|-------|-------------|--------|
| 1 | 0 | Basic problems |
| 2 | 100 | Medium problems |
| 3 | 300 | Advanced topics |
| 4 | 600 | Hard problems |
| 5 | 1000 | Expert challenges |

#### XP Awards

- **First solve:** Full problem XP reward
- **Score improvement:** Difference in XP (scaled by score %)
- **Faculty bonus:** Additional XP awards from faculty

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

Learning Paths are curated streams of milestones organized by topic. Currently available: **Cybersecurity**, **AI & Machine Learning**, **Web Development**, and **Data Science**.

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

### Page 9: Notifications

#### Notification Types

| Type | Description | Icon |
|------|-------------|------|
| **XP Award** | Points received | ⭐ |
| **Level Up** | Level progression | 🏆 |
| **Submission** | Judge complete | ✅ |
| **Event** | Event updates | 🎯 |
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

| Input Data | Expected Output | Sample |
|-----------|----------------|--------|
| `4`<br>`2 7 11 15`<br>`9` | `0 1` | ✅ |
| `3`<br>`3 2 4`<br>`6` | `0 1` | ✅ |
| `2`<br>`1 1`<br>`2` | `0 1` | ❌ |

> **Sample** test cases are visible to students. Hidden cases are for judging only.

### Page 3: Student Analytics

#### Student Profiles

1. Navigate to student list (`/faculty/students`)
2. Click a student to view:
   - Profile overview
   - XP and level
   - Problems solved
   - Submission history
   - Activity timeline

#### Problem Analytics

1. Navigate to problem analytics (`/faculty/analytics`)
2. Select a problem
3. View detailed metrics:

| Metric | Description |
|--------|-------------|
| Total Submissions | Count |
| Acceptance Rate | % accepted |
| Average Score | Mean score |
| AI Detection Flag | Suspicious % |

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

---

## Admin Panel

### Page 1: System Overview

#### Admin Dashboard

Your admin dashboard shows:

- **Platform Stats** - Total users, problems, submissions
- **Active Users** - Online now
- **System Health** - API, database, worker status
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
3. Select new role: Student / Faculty / Admin
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

---

## Best Practices

### For Students

1. **Start Early** - Don't wait until deadline
2. **Commit Often** - Show your problem-solving process
3. **Read Feedback** - AI suggestions are valuable
4. **Iterate** - Improve scores by resubmitting
5. **Join Events** - Earn bonus XP and badges

### For Faculty

1. **Clear Problems** - Write detailed constraints
2. **Test Cases** - Cover edge cases
3. **Timely Feedback** - Review submissions regularly
4. **Encourage** - Use XP awards for motivation
5. **Monitor** - Watch for AI-generated submissions

### For Admins

1. **Audit Trail** - Document role changes
2. **Monitor Health** - Check system metrics
3. **Backup Data** - Schedule regular backups
4. **Update Docs** - Keep this manual current

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

### Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| `E001` | OAuth callback mismatch | Update callback URL |
| `E002` | GitHub token expired | Re-login with GitHub |
| `E003` | Worker down | Check Celery service |
| `E004` | Judge timeout | Resubmit later |
| `E005` | Redis unavailable | Check Redis connection |

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