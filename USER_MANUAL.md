# MiniCode User Manual

This manual explains how each role uses MiniCode in daily workflow.

## Who Should Read This

- Students: solve problems, join events, track progress
- Faculty: create problems/events, monitor learners, award XP
- Admins: manage users and platform operations

## Before You Start

- Open the app in browser: `http://localhost:3000` (or your deployed frontend URL)
- Ensure backend is healthy: `http://localhost:8000/health`

## Login Guide

## Student Login (GitHub)

1. Go to `/login`.
2. Click `Authorize GitHub`.
3. Complete GitHub OAuth consent.
4. You are redirected back and signed in.

What this enables:

- Creation of a private repository per problem.
- Judge access to your repository code during submission.

## Faculty/Admin Login (Google)

1. Go to `/login`.
2. Click `Faculty Authentication`.
3. Click `Sign in with Google`.
4. Use institutional Google account.

Rules:

- `@scet.ac.in` users are allowed and auto-created as faculty if new.
- Existing admin/faculty can sign in if email is recognized.

## Faculty/Admin Login (Username + Password)

1. Go to `/login`.
2. Click `Faculty Authentication`.
3. Enter credentials in `Control Room` form.

Development defaults:

- Admin: `admin/admin123`
- Faculty: `faculty/faculty123`
- Student: `student/student123`

## Student Workflow

## 1. Browse Problems

- Open `Problems` from top navigation.
- Read difficulty, description, constraints, and samples.

## 2. Start a Problem

- Open problem details page.
- Click start action.
- MiniCode creates a private repository in your GitHub account.

Repo naming pattern:

- `minicode-<username>-<problem-title-slug>`

## 3. Write Your Solution

- Edit `solution.py` (or your chosen language strategy in your repo).
- Commit your changes.

Tip:

- Commit history is used as a judging context signal.

## 4. Submit for Evaluation

- Click submit in MiniCode.
- Submission enters `pending` state.
- Worker picks it up and AI judge evaluates.

Possible statuses:

- `accepted`
- `wrong_answer`
- `error`
- `pending`

## 5. Review Feedback

- View score, comments, and judge output in your submission details.
- Improve code and resubmit.

## 6. Track XP and Leaderboard

- XP increases based on accepted score and problem reward.
- Leaderboard ranking is based on XP.
- Profile shows solved count, streak, level, and recent submissions.

## Events (Student)

- Open `Events`.
- Join available event.
- For team events, use invitations/workflow provided by event UI.
- Submit event deliverables from event submission flow.
- Check event leaderboard and rewards.

## Notifications and News

- Use bell icon in navbar.
- Notifications include XP awards, activity updates, and system messages.
- Unread counter includes notifications and new news posts.

## Faculty Workflow

## 1. Manage Problems

- Open faculty problems area.
- Create problem with:
  - title, description, difficulty
  - level, XP reward
  - input/output format and optional hints/constraints
- Add test cases and mark sample cases for students.

## 2. Run AI Problem Generation

- Upload supported source file/text via problem generator.
- Review generated statement before publishing.

## 3. View Students and Analytics

- Open student list and profiles.
- Check problem analytics:
  - total submissions
  - accepted count
  - average score

## 4. Award XP

- Use faculty award XP action per student.
- Optional reason can be included.
- Student notification is generated automatically.

## 5. Events and News

- Create and manage events.
- Invite participants for team events.
- Publish news updates/announcements.

## Admin Workflow

## 1. User and Role Management

- Access admin user management.
- Promote/demote user roles as needed.

## 2. System Stats

- View admin stats endpoint-backed dashboard values.

## 3. XP Synchronization

- Trigger global XP sync when needed.

## Best Practices for Users

- Keep OAuth login token valid; re-login if actions fail.
- For students, make meaningful commits before submission.
- For faculty, create clear constraints and sample test cases.
- For admins, avoid frequent role changes without audit trail.

## Common Issues

- OAuth error page:
  - Usually callback URL mismatch or client secret issue.
- Submission stuck on pending:
  - Worker not running or Redis unavailable.
- Repo not found:
  - Student did not start problem via MiniCode or repo naming mismatch.
- Score or feedback looks wrong:
  - AI judging is probabilistic; refine and resubmit.

## Support Checklist

When reporting an issue, include:

- Role (`student`, `faculty`, or `admin`)
- Page URL
- Timestamp
- Submission ID or event ID (if relevant)
- Screenshot/error message
