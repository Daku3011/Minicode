# UI_Blueprint.md

## 1. Site Map

### Public/Student Routes
- `/login`  
  **Purpose:** Login page (OAuth and staff login). Includes Help & FAQ button.  
  **Auth:** Public  
- `/problems`  
  **Purpose:** List all problems, filter/search, view unlock status.  
  **Auth:** Student, Faculty, Admin  
- `/problems/[id]`  
  **Purpose:** Problem detail, start repo, submit solution, view results.  
  **Auth:** Student, Faculty, Admin  
- `/problems/[id]/discussion`  
  **Purpose:** Per-problem threaded discussion forum.  
  **Auth:** Student, Faculty, Admin  
- `/cohorts`  
  **Purpose:** List/join cohorts (students), create/manage (faculty).  
  **Auth:** Student, Faculty, Admin  
- `/cohorts/[id]`  
  **Purpose:** Cohort detail, join/view students.  
  **Auth:** Student, Faculty, Admin  
- `/leaderboard`  
  **Purpose:** View leaderboard.  
  **Auth:** Student, Faculty, Admin  
- `/profile`  
  **Purpose:** View/edit own profile, stats, email verification.  
  **Auth:** Student, Faculty, Admin  
- `/profile/achievements`  
  **Purpose:** View earned badges, achievements, and streak progress.  
  **Auth:** Student, Faculty, Admin  
- `/events`  
  **Purpose:** List events, join/submit.  
  **Auth:** Student, Faculty, Admin  
- `/events/[id]`  
  **Purpose:** Event detail, join/submit, view leaderboard.  
  **Auth:** Student, Faculty, Admin  
- `/contests`  
  **Purpose:** List timed coding contests.  
  **Auth:** Student, Faculty, Admin  
- `/contests/[id]`  
  **Purpose:** Contest detail and registration.  
  **Auth:** Student, Faculty, Admin  
- `/contests/[id]/arena`  
  **Purpose:** Live contest coding arena with timer and standings.  
  **Auth:** Student, Faculty, Admin  
- `/dashboard`  
  **Purpose:** Learning dashboard with recommendations and weak area analysis.  
  **Auth:** Student, Faculty, Admin  
- `/interviews`  
  **Purpose:** List available interview modes and sessions.  
  **Auth:** Student, Faculty, Admin  
- `/interviews/[id]`  
  **Purpose:** Interview mode detail and start.  
  **Auth:** Student, Faculty, Admin  
- `/interviews/session/[sessionId]`  
  **Purpose:** Active interview session with timer.  
  **Auth:** Student, Faculty, Admin  
- `/reviews`  
  **Purpose:** List code review requests.  
  **Auth:** Student, Faculty, Admin  
- `/reviews/[id]`  
  **Purpose:** Code review detail with inline comments.  
  **Auth:** Student, Faculty, Admin  
- `/snippets`  
  **Purpose:** Browse reusable code snippets.  
  **Auth:** Student, Faculty, Admin  
- `/snippets/[id]`  
  **Purpose:** Snippet detail and voting.  
  **Auth:** Student, Faculty, Admin  
- `/snippets/create`  
  **Purpose:** Create a new code snippet.  
  **Auth:** Student, Faculty, Admin  
- `/team-formation`  
  **Purpose:** Find teammates and manage team requests.  
  **Auth:** Student, Faculty, Admin  
- `/settings/integrations`  
  **Purpose:** Connect external judge accounts (LeetCode, Codeforces, CodeChef).  
  **Auth:** Student, Faculty, Admin  
- `/u/[username]`  
  **Purpose:** Public portfolio page with XP charts and activity heatmap.  
  **Auth:** Public  
- `/privacy`, `/terms`  
  **Purpose:** Static info pages.  
  **Auth:** Public

### Faculty/Admin Routes
- `/faculty/dashboard`  
  **Purpose:** Faculty dashboard, stats.  
  **Auth:** Faculty, Admin  
- `/faculty/problems`  
  **Purpose:** Manage problems (CRUD).  
  **Auth:** Faculty, Admin  
- `/faculty/materials`  
  **Purpose:** Manage teaching materials.  
  **Auth:** Faculty, Admin  
- `/faculty/students`  
  **Purpose:** List students, view profiles.  
  **Auth:** Faculty, Admin  
- `/faculty/students/[username]`  
  **Purpose:** View/manage student profile, award XP.  
  **Auth:** Faculty, Admin  
- `/faculty/cohorts`  
  **Purpose:** Manage cohorts.  
  **Auth:** Faculty, Admin  
- `/faculty/cohorts/[id]`  
  **Purpose:** Cohort detail, add students.  
  **Auth:** Faculty, Admin  
- `/faculty/events`  
  **Purpose:** Manage events.  
  **Auth:** Faculty, Admin  
- `/faculty/events/[id]`  
  **Purpose:** Event detail, manage participants.  
  **Auth:** Faculty, Admin  
- `/faculty/profile`  
  **Purpose:** Faculty profile/settings.  
  **Auth:** Faculty, Admin  
- `/admin/users`  
  **Purpose:** Admin user management.  
  **Auth:** Admin

## 2. Component Inventory

### New Feature Components

#### `AchievementBadge`
- **Path:** `frontend/src/components/AchievementBadge.tsx`
- **Purpose:** Display a single achievement badge with icon, name, progress, and unlock state.
- **Key Props:** `badge: Badge`, `size?: 'sm' | 'md' | 'lg'`, `showProgress?: boolean`

#### `AchievementProgress`
- **Path:** `frontend/src/components/AchievementProgress.tsx`
- **Purpose:** Show overall achievement progress bar (X of Y badges earned).
- **Key Props:** `earned: number`, `total: number`, `xp?: number`

#### `ActivityHeatmap`
- **Path:** `frontend/src/components/ActivityHeatmap.tsx`
- **Purpose:** GitHub-style contribution heatmap for coding activity. Accepts daily submission counts.
- **Key Props:** `data: Record<string, number>`, `year?: number`

#### `ChatAssistant`
- **Path:** `frontend/src/components/ChatAssistant.tsx`
- **Purpose:** Persistent AI chatbot widget for coding help, accessible from any page.
- **Key Props:** (self-contained, uses internal state + API)

#### `CodeReviewPanel`
- **Path:** `frontend/src/components/CodeReviewPanel.tsx`
- **Purpose:** Displays code diff with inline review comments, approval status, and action buttons.
- **Key Props:** `review: Review`, `onApprove?: () => void`, `onRequestChanges?: () => void`

#### `ContestTimer`
- **Path:** `frontend/src/components/ContestTimer.tsx`
- **Purpose:** Countdown timer component that syncs with server time for contests.
- **Key Props:** `endTime: string`, `onEnd?: () => void`

#### `DiscussionPanel`
- **Path:** `frontend/src/components/DiscussionPanel.tsx`
- **Purpose:** Threaded discussion view with markdown rendering, voting, and reply support.
- **Key Props:** `problemId: number`, `threads: Thread[]`

#### `ExternalPlatformCard`
- **Path:** `frontend/src/components/ExternalPlatformCard.tsx`
- **Purpose:** Card for managing external judge account connections (LeetCode, Codeforces, CodeChef).
- **Key Props:** `platform: string`, `connected: boolean`, `onConnect: () => void`, `onSync: () => void`

#### `PortfolioHeader`
- **Path:** `frontend/src/components/PortfolioHeader.tsx`
- **Purpose:** Public profile header with avatar, bio, XP total, and social links.
- **Key Props:** `user: PortfolioUser`, `isOwner?: boolean`

#### `RecommendationCard`
- **Path:** `frontend/src/components/RecommendationCard.tsx`
- **Purpose:** Card displaying an AI-generated problem recommendation with relevance score.
- **Key Props:** `recommendation: Recommendation`, `onStart?: () => void`

#### `SnippetCard`
- **Path:** `frontend/src/components/SnippetCard.tsx`
- **Purpose:** Card for code snippet preview with language badge, votes, and tags.
- **Key Props:** `snippet: Snippet`, `onVote?: (id: number, dir: 1 | -1) => void`

#### `StreakDisplay`
- **Path:** `frontend/src/components/StreakDisplay.tsx`
- **Purpose:** Flame icon with current streak count and motivational message.
- **Key Props:** `currentStreak: number`, `longestStreak?: number`

#### `TeamCard`
- **Path:** `frontend/src/components/TeamCard.tsx`
- **Purpose:** Card showing a team formation request with required skills and apply button.
- **Key Props:** `request: TeamRequest`, `onApply?: () => void`

#### `ThemeToggle`
- **Path:** `frontend/src/components/ThemeToggle.tsx`
- **Purpose:** Dark/light/system mode toggle with sun/moon icons.
- **Key Props:** (self-contained, uses ThemeContext)

#### `WeakAreasChart`
- **Path:** `frontend/src/components/WeakAreasChart.tsx`
- **Purpose:** Radar/spider chart showing relative strength across coding categories.
- **Key Props:** `data: { category: string; score: number }[]`

#### `XPChart`
- **Path:** `frontend/src/components/XPChart.tsx`
- **Purpose:** Line chart showing XP accumulation over time.
- **Key Props:** `data: { date: string; xp: number }[]`

### Contexts

#### `ThemeContext`
- **Path:** `frontend/src/contexts/ThemeContext.tsx`
- **Purpose:** Provides `theme`, `setTheme`, and `resolvedTheme` globally, syncs with localStorage and system preference.

### Primitives & Reusable Components

#### `ProblemCard`
- **Path:** `frontend/src/components/ProblemCard.tsx`
- **Responsibilities:** Display problem summary, lock state, XP, difficulty.
- **Props:**
  ```ts
  interface ProblemCardProps {
    problem: {
      id: number;
      title: string;
      difficulty: string;
      description?: string;
      xp_reward?: number;
      subject?: string | null;
      level: number;
    };
    userUnlockedLevel?: number;
    isFaculty?: boolean;
  }
  ```
- **State:** None
- **Events:** None
- **Usage:** Used in `/problems`, `/faculty/problems`.

#### `StudentProfileView`
- **Path:** `frontend/src/components/StudentProfileView.tsx`
- **Responsibilities:** Show student stats, activity, awards, email verification.
- **Props:**
  ```ts
  interface StudentProfileViewProps {
    data: ProfileData;
    isFacultyView?: boolean;
  }
  ```
- **State:** Multiple (tab, email, OTP, award XP, etc.)
- **Events:** Award XP, verify email, tab switch.
- **Usage:** `/profile`, `/faculty/students/[username]`

#### `FeedbackModal`
- **Path:** `frontend/src/components/FeedbackModal.tsx`
- **Responsibilities:** Submit feedback with optional image.
- **Props:**
  ```ts
  interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
  }
  ```
- **State:** Email, subject, message, image, status.
- **Events:** Submit, image upload, close.
- **Usage:** `/login`, global modal.

#### `NewsPanel`
- **Path:** `frontend/src/components/NewsPanel.tsx`
- **Responsibilities:** Show news/announcements, mark as read.
- **Props:**
  ```ts
  interface NewsPanelProps {
    isOpen: boolean;
    onClose: () => void;
  }
  ```
- **State:** News list, loading, create news (admin).
- **Events:** Mark read, create, delete.
- **Usage:** Navbar, global.

#### `LoadingSpinner`
- **Path:** `frontend/src/components/LoadingSpinner.tsx`
- **Responsibilities:** Show loading indicator.
- **Props:**
  ```ts
  interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    label?: string;
    className?: string;
  }
  ```
- **State:** None
- **Usage:** All pages for loading states.

#### `Navbar`
- **Path:** `frontend/src/components/Navbar.tsx`
- **Responsibilities:** Navigation, unread notifications, news panel.
- **State:** Unread count, showNews.
- **Events:** Logout, open news, clear notifications.

#### `PageLoader`
- **Path:** `frontend/src/components/PageLoader.tsx`
- **Responsibilities:** Top progress bar on route change.
- **State:** loading, progress.

### Contexts

#### `AuthContext`
- **Path:** `frontend/src/contexts/AuthContext.tsx`
- **Responsibilities:** User auth state, login/logout, fetch user.
- **Interface:**
  ```ts
  interface User {
    id: number;
    username: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: "student" | "admin" | "faculty";
    github_id: number | null;
    created_at: string;
    unlocked_level?: number;
    stats?: { solved: number; rank: number; xp: number; level: number; level_name: string; streak: number; };
  }
  interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
  }
  ```

### Page-Specific Components
- Each page in `src/app/` is a React component, often using the above primitives and context.

## 3. Data Contracts & API Mapping

### Example: Problems

#### Backend Endpoint: List Problems
- **Method:** GET `/problems`
- **Request:** None
- **Response:** `Problem[]`
  ```json
  [
    {
      "id": 1,
      "title": "Two Sum",
      "description": "...",
      "difficulty": "Easy",
      "subject": "algorithms",
      "level": 1,
      "xp_reward": 100,
      "author_id": 2,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
  ```
- **Auth:** Any authenticated user
- **Frontend Usage:** `/problems`, `/faculty/problems`, `ProblemCard`

#### Backend Endpoint: Get Problem Detail
- **Method:** GET `/problems/{id}`
- **Response:** `Problem`
- **Frontend Usage:** `/problems/[id]`

#### Backend Endpoint: Start Problem (provision repo)
- **Method:** POST `/problems/{id}/start`
- **Request:** `{}` (user from token)
- **Response:** `{ repo_url: string }`
- **Frontend Usage:** `/problems/[id]` (Start button)

#### Backend Endpoint: Submit Solution
- **Method:** POST `/problems/{id}/submit`
- **Request:** `{ language: string }`
- **Response:** Submission result (status, feedback, score)
- **Frontend Usage:** `/problems/[id]` (Submit button)

#### Backend Endpoint: Get Testcases
- **Method:** GET `/problems/{id}/testcases`
- **Response:** `[{ id, input, expected_output }]`
- **Frontend Usage:** `/problems/[id]`

#### Backend Endpoint: Create Problem
- **Method:** POST `/problems`
- **Request:** `ProblemCreate`
  ```json
  {
    "title": "string",
    "description": "string",
    "difficulty": "Easy|Medium|Hard",
    "subject": "string",
    "level": 1,
    "xp_reward": 100
  }
  ```
- **Auth:** Faculty/Admin
- **Frontend Usage:** `/faculty/problems`, `/problems/create`

#### Backend Endpoint: Edit/Delete Problem
- **Method:** PUT `/problems/{id}`, DELETE `/problems/{id}`
- **Auth:** Faculty/Admin
- **Frontend Usage:** `/faculty/problems`

### Example: Cohorts

#### Backend Endpoint: List Cohorts
- **Method:** GET `/cohorts`
- **Response:** `Cohort[]`
- **Frontend Usage:** `/cohorts`, `/faculty/cohorts`

#### Backend Endpoint: Add Student to Cohort
- **Method:** POST `/cohorts/{id}/students`
- **Request:** `{ username: string }`
- **Frontend Usage:** `/faculty/cohorts/[id]`

### Example: Auth

#### Backend Endpoint: Login
- **Method:** POST `/auth/login`
- **Request:** FormData `{ username, password }`
- **Frontend Usage:** `/login`

#### Backend Endpoint: OAuth Callbacks
- **Method:** GET `/auth/github/callback`, `/auth/google/callback`
- **Frontend Usage:** `/auth/github/callback`, `/auth/google/callback`

### Example: Roadmap (Learning Paths)

#### Backend Endpoint: Seed Additional Streams
- **Method:** GET `/roadmap/seed-additional`
- **Response:** `{ message: "Incremental seeding completed successfully", streams_added: [...] }`
- **Frontend Usage:** Backend/Admin action for populating new streams.

### Example: User Profile

#### Backend Endpoint: Get Own Profile
- **Method:** GET `/user/me`
- **Frontend Usage:** `/profile`, `AuthContext`

#### Backend Endpoint: Update Settings
- **Method:** PUT `/user/me/settings`
- **Frontend Usage:** `/profile`

#### Backend Endpoint: Send/Verify Email
- **Method:** POST `/user/send-verification-email` (Uses recipient email from the request body payload), `/user/verify-email`
- **Frontend Usage:** `/profile`, `StudentProfileView`

### Example: News/Notifications

#### Backend Endpoint: Get News
- **Method:** GET `/news`
- **Frontend Usage:** `NewsPanel`

#### Backend Endpoint: Mark Notifications Read
- **Method:** POST `/notifications/mark-all-read`
- **Frontend Usage:** `NewsPanel`, `Navbar`

### Mapping Table (Sample)

| Frontend Page/Component         | Backend Endpoint(s) Called                | Needs Verification |
|---------------------------------|-------------------------------------------|--------------------|
| `/problems`                     | GET `/problems`                           | No                 |
| `/problems/[id]`                | GET `/problems/{id}`, POST `/problems/{id}/start`, POST `/problems/{id}/submit`, GET `/problems/{id}/testcases`, GET `/submissions/{id}` | No |
| `/faculty/problems`             | GET `/faculty/problems`, POST `/problems`, PUT `/problems/{id}`, DELETE `/problems/{id}` | No |
| `/cohorts`                      | GET `/cohorts`, POST `/cohorts`, POST `/cohorts/join` | No |
| `/faculty/cohorts/[id]`         | GET `/cohorts/{id}`, POST `/cohorts/{id}/students` | No |
| `/profile`                      | GET `/user/me`, PUT `/user/me/settings`, POST `/user/send-verification-email`, POST `/user/verify-email` | No |
| `NewsPanel`                     | GET `/news`, POST `/notifications/mark-all-read`, POST `/notifications/mark-news-read` | No |
| `FeedbackModal`                 | POST `/feedback`                          | No                 |
| `/login`                        | POST `/auth/login`, GET `/auth/github/callback`, GET `/auth/google/callback` | No |
| `/leaderboard`                  | GET `/leaderboard`                        | No                 |
| `/admin/users`                  | GET `/admin/users`, PUT `/admin/users/{user_id}/role` | No |
| `/faculty/students`             | GET `/faculty/students`                   | No                 |
| `/faculty/students/[username]`  | GET `/faculty/student/{username}`         | No                 |

## 4. UX Flows

### Login/Auth
1. User visits `/login`.
2. Can choose OAuth (GitHub/Google) or staff login.
3. On success, redirected by role:
   - Admin: `/admin/users`
   - Faculty: `/faculty/profile`
   - Student: `/problems`
4. UI States: loading, error, success.

### Start Problem (Repo Provisioning)
1. User visits `/problems/[id]`.
2. Clicks "Start" → POST `/problems/{id}/start`.
3. Receives `repo_url`, UI shows repo link.
4. UI States: loading, error, repo provisioned.

### Submit Solution (Async)
1. User submits code via `/problems/[id]`.
2. POST `/problems/{id}/submit`.
3. UI polls GET `/submissions/{id}` for result.
4. UI States: submitting, loading, success, error.

### View Results
1. After submission, result shown in `/problems/[id]`.
2. UI shows feedback, score, errors.

### Manage Cohorts/Events
- Faculty can create/join cohorts, add students, manage events.
- UI States: loading, success, error, empty.

### Admin Flows
- Admin can view users, update roles, view stats.
- UI States: loading, success, error.

## 5. State Management Recommendations

- **Local State:** Form fields, modal open/close, tab selection.
- **Context:** Auth state (`AuthContext`), user info.
- **Global Store/Query:** Use React Query or SWR for API data (problems, cohorts, leaderboard, profile).
- **Caching:** Use React Query/SWR cache for GET endpoints, invalidate on mutation.
- **Optimistic Updates:** For marking notifications read, adding students to cohort, etc.

## 6. Accessibility, Responsiveness, and Design-System Recommendations

- **Accessibility:** Use semantic HTML, ARIA labels for modals, forms, and navigation. Ensure keyboard navigation for all interactive elements.
- **Responsiveness:** Use Tailwind CSS (already present), ensure mobile breakpoints for all layouts.
- **Design Tokens:** Define color, spacing, font tokens in `tailwind.config.js`.
- **Component Library:** Consider Headless UI or Radix UI for accessible primitives (modals, menus).
- **ARIA Guidance:** All modals/dialogs should have `role="dialog"`, `aria-modal="true"`, and focus trap.

## 7. Testing Plan

- **Unit Tests:** Components (props, rendering, events), utility functions.
- **Integration Tests:** Page flows (login, problem start/submit, cohort join).
- **E2E Tests:** User journeys (Cypress/Playwright): login, solve problem, view leaderboard, faculty CRUD.
- **Examples:**
  - Test `/problems` renders list, filters.
  - Test `/problems/[id]` handles start, submit, result.
  - Test `/login` handles OAuth and error states.
  - Test `/faculty/problems` CRUD.

## 8. Missing Features and Prioritized Improvements

### Must-Have
- **Error boundaries** for all pages.
- **Loading skeletons** for all async data.
- **Role-based route guards** (currently handled in page logic, but could be improved).
- **API error handling** (show user-friendly messages).

### Nice-to-Have
- **Dark mode toggle** (if not present).
- **Bulk actions** for admin/faculty (e.g., add multiple students).
- **Notification system** for async events (submission results, cohort changes).
- **Accessibility audit** and improvements.

## 9. File List

### Frontend Files Inspected
- `/frontend/src/app/problems/page.tsx`
- `/frontend/src/app/problems/[id]/page.tsx`
- `/frontend/src/app/problems/create/page.tsx`
- `/frontend/src/app/login/page.tsx`
- `/frontend/src/app/faculty/problems/page.tsx`
- `/frontend/src/app/faculty/students/page.tsx`
- `/frontend/src/app/faculty/students/[username]/page.tsx`
- `/frontend/src/app/faculty/cohorts/page.tsx`
- `/frontend/src/app/faculty/cohorts/[id]/page.tsx`
- `/frontend/src/components/ProblemCard.tsx`
- `/frontend/src/components/StudentProfileView.tsx`
- `/frontend/src/components/FeedbackModal.tsx`
- `/frontend/src/components/NewsPanel.tsx`
- `/frontend/src/components/LoadingSpinner.tsx`
- `/frontend/src/components/Navbar.tsx`
- `/frontend/src/components/PageLoader.tsx`
- `/frontend/src/contexts/AuthContext.tsx`
- `/frontend/src/lib/api.ts`

### Backend Files Inspected
- `/backend/routers/problems.py`
- `/backend/routers/submissions.py`
- `/backend/routers/auth.py`
- `/backend/routers/users.py`
- `/backend/routers/cohorts.py`
- `/backend/routers/faculty.py`
- `/backend/routers/admin.py`
- `/backend/core/models.py`

## 10. Files to Inspect Further

- `/frontend/src/app/events/*` and `/backend/routers/events.py` (not found, but referenced in code: needs verification for event flows).
- `/frontend/src/app/profile/page.tsx` (for full profile editing/verification logic).
- `/frontend/src/app/admin/users/page.tsx` (for admin user management UI).
- `/frontend/src/app/faculty/materials/page.tsx` (materials management).
- `/frontend/src/app/faculty/dashboard/page.tsx` (faculty dashboard).
- `/frontend/src/app/leaderboard/page.tsx` (leaderboard details).
- `/frontend/src/app/privacy/page.tsx`, `/frontend/src/app/terms/page.tsx` (static content).
- `/backend/routers/feedback.py` (for feedback endpoint details).
- `/backend/routers/events.py` (if exists, for event management endpoints).

---

**If any mapping cannot be confirmed from code, it is marked as "needs verification" above.**
