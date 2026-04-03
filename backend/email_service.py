import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from sqlmodel import Session, select, func
from typing import List, Dict, Any
from models import User, Problem, Submission
import logging
import os

logger = logging.getLogger(__name__)

SMTP_CONFIG = {
    "host": "smtp.gmail.com",
    "port": 587,
    "email": os.getenv("SMTP_EMAIL", "minicode.scet@gmail.com"),
    "password": os.getenv("SMTP_PASSWORD", ""),
}


def send_email(to_email: str, subject: str, html_content: str):
    if not SMTP_CONFIG["password"]:
        logger.warning("SMTP password not configured, skipping email")
        return False

    msg = MIMEMultipart("alternative")
    msg["From"] = SMTP_CONFIG["email"]
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(SMTP_CONFIG["host"], SMTP_CONFIG["port"]) as server:
            server.starttls()
            server.login(SMTP_CONFIG["email"], SMTP_CONFIG["password"])
            server.sendmail(SMTP_CONFIG["email"], to_email, msg.as_string())
        logger.info(f"Email sent to {to_email}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


def generate_motivation_email(username, top_activity, leaderboard_top=None, suggestions=None):
    activity_html = ""
    for act in top_activity[:5]:
        activity_html += f"""
        <div style="background: #f8fafc; border-left: 3px solid #6366f1; padding: 12px 16px; margin: 8px 0; border-radius: 0 8px 8px 0;">
            <div style="font-weight: bold; color: #1e293b; font-size: 14px;">{act.get('title', 'Activity')}</div>
            <div style="color: #64748b; font-size: 12px; margin-top: 4px;">{act.get('description', '')}</div>
        </div>
        """
        
    leaderboard_html = ""
    if leaderboard_top:
        leaderboard_html = """
        <div style="margin-top: 24px; background: #f8fafc; border-radius: 12px; padding: 16px;">
            <h3 style="margin-top: 0; color: #1e293b; font-size: 16px;">Current Top Contenders:</h3>
        """
        for entry in leaderboard_top:
            leaderboard_html += f"""
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px;">
                <span style="font-weight: 600; color: #1e293b;">{entry['username']}</span>
                <span style="color: #6366f1; font-weight: 700;">{entry['xp']} XP</span>
            </div>
            """
        leaderboard_html += "</div>"

    suggestions_html = ""
    if suggestions:
        suggestions_html = """
        <div style="margin-top: 24px; padding: 20px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px;">
            <h3 style="margin-top: 0; color: #0369a1; font-size: 16px;">🚀 Quick Wins for You:</h3>
            <p style="color: #075985; font-size: 13px; margin-bottom: 12px;">Start with these Easy challenges to get back in the flow:</p>
        """
        for prob in suggestions[:2]:
            suggestions_html += f"""
            <div style="margin-bottom: 12px; background: white; padding: 12px; border-radius: 8px; border: 1px solid #e0f2fe;">
                <div style="font-weight: bold; color: #0369a1; font-size: 14px;">{prob.title}</div>
                <div style="color: #0ea5e9; font-size: 11px; font-weight: bold; margin-top: 2px;">EARN {(prob.level or 1) * 20} XP</div>
            </div>
            """
        suggestions_html += "</div>"

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f1f5f9; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }}
            .header {{ background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 24px; text-align: center; }}
            .header h1 {{ color: white; margin: 0; font-size: 28px; letter-spacing: -0.025em; }}
            .header p {{ color: rgba(255,255,255,0.9); margin: 12px 0 0; font-size: 16px; }}
            .content {{ padding: 32px 24px; }}
            .content h2 {{ color: #1e293b; font-size: 22px; margin: 0 0 16px; font-weight: 700; }}
            .content p {{ color: #475569; font-size: 15px; line-height: 1.6; }}
            .cta {{ display: inline-block; background: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; margin: 24px 0; transition: background 0.2s; }}
            .footer {{ background: #f8fafc; padding: 24px; text-align: center; color: #94a3b8; font-size: 12px; }}
            .badge {{ display: inline-block; padding: 2px 8px; border-radius: 4px; background: #eef2ff; color: #6366f1; font-size: 11px; font-weight: 600; text-transform: uppercase; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>MiniCode</h1>
                <p>Don't fall behind, {username}!</p>
            </div>
            <div class="content">
                <h2>The Arena is Heating Up 🔥</h2>
                <p>Your friends and rivals are making massive progress. While you've been focused elsewhere, the leaderboard has shifted!</p>
                
                {activity_html}
                
                {suggestions_html}

                {leaderboard_html}

                <div style="text-align: center; margin-top: 32px;">
                    <p style="margin-bottom: 8px; font-weight: 500; color: #64748b;">Ready to reclaim your spot?</p>
                    <a href="https://minicode.vercel.app" class="cta">Resume Your Journey</a>
                </div>
                
                <div style="margin-top: 32px; padding: 20px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px;">
                    <div style="font-weight: 700; color: #92400e; margin-bottom: 4px;">💡 Did you know?</div>
                    <div style="color: #b45309; font-size: 14px;">Solving just one "Hard" problem can jump you up to 10 spots on the ranking.</div>
                </div>
            </div>
            <div class="footer">
                <p>© 2026 MiniCode Arena. Bringing out the best in every coder.</p>
                <p>You received this because your account has been inactive for more than 48 hours.</p>
            </div>
        </div>
    </body>
    </html>
    """


def send_engagement_lure_emails(session: Session, days_inactive: int = 2):
    cutoff_date = datetime.utcnow() - timedelta(days=days_inactive)

    # Find users who haven't logged in OR haven't submitted in days_inactive
    inactive_users = session.exec(
        select(User).where(
            User.role == "student",
            (User.last_login < cutoff_date) | (User.last_login == None)
        )
    ).all()

    if not inactive_users:
        logger.info("No inactive students for lure emails")
        return {"sent": 0, "total": 0}

    # Get top 3 from leaderboard for lure content
    top_students = session.exec(
        select(User.username, User.xp)
        .where(User.role == "student")
        .order_by(User.xp.desc())
        .limit(3)
    ).all()
    
    leaderboard_data = [{"username": s[0], "xp": s[1]} for s in top_students]

    # Get some recent successful activity from others
    recent_activity = session.exec(
        select(User.username, Problem.title)
        .join(Submission, Submission.user_id == User.id)
        .join(Problem, Problem.id == Submission.problem_id)
        .where(Submission.status == "accepted")
        .order_by(Submission.timestamp.desc())
        .limit(10)
    ).all()

    activity_map = []
    seen_users = set()
    for username, title in recent_activity:
        if username not in seen_users:
            activity_map.append({
                "title": f"New Milestone reached!",
                "description": f"{username} just solved '{title}' and earned massive XP!"
            })
            seen_users.add(username)
        if len(activity_map) >= 5: break

    sent_count = 0

    for student in inactive_users:
        if not student.email: continue
        
        # Get 2 easy problems student hasn't solved
        solved_ids_subquery = select(Submission.problem_id).where(Submission.user_id == student.id, Submission.status == "accepted")
        easy_problems = session.exec(
            select(Problem)
            .where(Problem.difficulty.overlap(["Easy", "easy"]))
            .where(Problem.id.not_in(solved_ids_subquery))
            .order_by(func.random())
            .limit(2)
        ).all()
        
        # If no explicit "Easy" ones found, just get any 2 unsolved
        if not easy_problems:
            easy_problems = session.exec(
                select(Problem)
                .where(Problem.id.not_in(solved_ids_subquery))
                .order_by(func.random())
                .limit(2)
            ).all()

        html = generate_motivation_email(
            student.username, 
            activity_map if activity_map else [{"title": "New problems added", "description": "Check out the latest algorithm challenges!"}], 
            leaderboard_top=leaderboard_data,
            suggestions=easy_problems
        )
        
        if send_email(
            student.email,
            f"🚀 {student.username}, reclaim your ranking!",
            html
        ):
            sent_count += 1

    return {"sent": sent_count, "total": len(inactive_users)}


def send_faculty_report(faculty_user: User, student_stats: List[dict]):
    if not faculty_user.faculty_report_email:
        logger.warning(f"Faculty {faculty_user.username} has no report email configured")
        return False

    report_rows = ""
    for s in student_stats:
        report_rows += f"""
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">{s['username']}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">{s['xp']}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">{s['submissions']}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">{s['last_active']}</td>
        </tr>
        """

    html = f"""
    <h2>Weekly Student Engagement Report</h2>
    <p>Hello Prof. {faculty_user.username}, here is the engagement summary for your students:</p>
    <table style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="background: #f8fafc; text-align: left;">
                <th style="padding: 12px;">Student</th>
                <th style="padding: 12px;">Current XP</th>
                <th style="padding: 12px;">Submissions</th>
                <th style="padding: 12px;">Last Active</th>
            </tr>
        </thead>
        <tbody>
            {report_rows}
        </tbody>
    </table>
    """
    
    return send_email(faculty_user.faculty_report_email, f"MiniCode Faculty Report: {datetime.now().strftime('%Y-%m-%d')}", html)
