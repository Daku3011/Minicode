import logging
from datetime import datetime, timezone

from sqlmodel import Session, func, select

from core.models_external import ExternalPlatformLink, ExternalSubmission

logger = logging.getLogger(__name__)


def link_account(
    user_id: int,
    platform: str,
    username: str,
    session: Session,
) -> ExternalPlatformLink:
    existing = session.exec(
        select(ExternalPlatformLink).where(
            ExternalPlatformLink.user_id == user_id,
            ExternalPlatformLink.platform == platform,
        )
    ).first()
    if existing:
        existing.platform_username = username
        existing.is_verified = False
        existing.synced_at = None
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing

    link = ExternalPlatformLink(
        user_id=user_id,
        platform=platform,
        platform_username=username,
        profile_url=_build_profile_url(platform, username),
    )
    session.add(link)
    session.commit()
    session.refresh(link)
    return link


def _build_profile_url(platform: str, username: str) -> str:
    urls = {
        "codeforces": f"https://codeforces.com/profile/{username}",
        "leetcode": f"https://leetcode.com/u/{username}/",
        "hackerrank": f"https://www.hackerrank.com/profile/{username}",
    }
    return urls.get(platform, "")


async def sync_submissions(user_id: int, platform: str, session: Session) -> int:
    link = session.exec(
        select(ExternalPlatformLink).where(
            ExternalPlatformLink.user_id == user_id,
            ExternalPlatformLink.platform == platform,
        )
    ).first()
    if not link:
        logger.warning(f"No linked account for user {user_id} on {platform}")
        return 0

    username = link.platform_username
    submissions = []

    try:
        if platform == "codeforces":
            submissions = await _fetch_codeforces(username)
        elif platform == "leetcode":
            submissions = await _fetch_leetcode(username)
        elif platform == "hackerrank":
            submissions = await _fetch_hackerrank(username)
        else:
            logger.warning(f"Unknown platform: {platform}")
            return 0
    except Exception as e:
        logger.error(f"Failed to sync {platform} for user {user_id}: {e}")
        return 0

    count = 0
    for sub in submissions:
        existing = session.exec(
            select(ExternalSubmission).where(
                ExternalSubmission.user_id == user_id,
                ExternalSubmission.platform == platform,
                ExternalSubmission.external_id == sub.get("external_id"),
            )
        ).first()
        if not existing:
            session.add(ExternalSubmission(
                user_id=user_id,
                platform=platform,
                external_id=sub.get("external_id"),
                problem_name=sub.get("problem_name", "Unknown"),
                problem_url=sub.get("problem_url"),
                difficulty=sub.get("difficulty"),
                language=sub.get("language"),
                status=sub.get("status", "unknown"),
                score=sub.get("score"),
                submitted_at=sub.get("submitted_at"),
            ))
            count += 1

    link.synced_at = datetime.now(timezone.utc)
    session.add(link)
    session.commit()
    logger.info(f"Synced {count} new {platform} submissions for user {user_id}")
    return count


async def _fetch_codeforces(username: str) -> list[dict]:
    import httpx
    url = f"https://codeforces.com/api/user.status?handle={username}"
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        data = resp.json()

    if data.get("status") != "OK":
        logger.warning(f"Codeforces API error for {username}: {data}")
        return []

    results = []
    for sub in data.get("result", [])[:200]:
        problem = sub.get("problem", {})
        verdict = sub.get("verdict", "unknown")
        results.append({
            "external_id": str(sub.get("id", "")),
            "problem_name": problem.get("name", "Unknown"),
            "problem_url": f"https://codeforces.com/problemset/problem/{problem.get('contestId', '')}/{problem.get('index', '')}",
            "difficulty": _cf_difficulty(problem.get("rating")),
            "language": sub.get("programmingLanguage"),
            "status": "accepted" if verdict == "OK" else "wrong_answer" if verdict in ("WRONG_ANSWER", "FAILED") else "unknown",
            "score": 100 if verdict == "OK" else 0,
            "submitted_at": datetime.fromtimestamp(sub.get("creationTimeSeconds", 0), tz=timezone.utc),
        })
    return results


def _cf_difficulty(rating: int | None) -> str:
    if rating is None:
        return "Unknown"
    if rating < 1200:
        return "Easy"
    elif rating < 2000:
        return "Medium"
    return "Hard"


async def _fetch_leetcode(username: str) -> list[dict]:
    import httpx
    query = """
    query userProfile($username: String!) {
      recentSubmissionList(username: $username) {
        id
        title
        titleSlug
        timestamp
        statusDisplay
        lang
      }
    }
    """
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            "https://leetcode.com/graphql",
            json={"query": query, "variables": {"username": username}},
            headers={"Content-Type": "application/json"},
        )
        if resp.status_code != 200:
            logger.warning(f"LeetCode API error for {username}: {resp.status_code}")
            return []
        data = resp.json()

    submissions = data.get("data", {}).get("recentSubmissionList", [])
    results = []
    for sub in submissions[:50]:
        results.append({
            "external_id": sub.get("id", ""),
            "problem_name": sub.get("title", "Unknown"),
            "problem_url": f"https://leetcode.com/problems/{sub.get('titleSlug', '')}/",
            "difficulty": None,
            "language": sub.get("lang"),
            "status": "accepted" if sub.get("statusDisplay") == "Accepted" else "unknown",
            "score": 100 if sub.get("statusDisplay") == "Accepted" else 0,
            "submitted_at": datetime.fromtimestamp(int(sub.get("timestamp", 0)), tz=timezone.utc),
        })
    return results


async def _fetch_hackerrank(username: str) -> list[dict]:
    import httpx
    url = f"https://www.hackerrank.com/rest/hackers/{username}/recent_challenges"
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"})
            if resp.status_code != 200:
                logger.warning(f"HackerRank API error for {username}: {resp.status_code}")
                return []
            data = resp.json()
    except Exception as e:
        logger.warning(f"HackerRank sync failed for {username}: {e}")
        return []

    models = data.get("models", []) if isinstance(data, dict) else data
    if not isinstance(models, list):
        return []

    results = []
    for sub in models[:50]:
        name = sub.get("name", "Unknown")
        results.append({
            "external_id": str(sub.get("id", "")),
            "problem_name": name,
            "problem_url": None,
            "difficulty": sub.get("difficulty"),
            "language": sub.get("language"),
            "status": "accepted" if sub.get("status") == "solved" else "unknown",
            "score": 100 if sub.get("status") == "solved" else 0,
            "submitted_at": None,
        })
    return results


def get_cross_platform_stats(user_id: int, session: Session) -> dict:
    links = session.exec(
        select(ExternalPlatformLink).where(
            ExternalPlatformLink.user_id == user_id
        )
    ).all()

    stats = {"linked_platforms": [], "total_submissions": 0, "accepted_submissions": 0}

    for link in links:
        platform = link.platform
        sub_count = session.exec(
            select(func.count(ExternalSubmission.id)).where(
                ExternalSubmission.user_id == user_id,
                ExternalSubmission.platform == platform,
            )
        ).one()

        accepted_count = session.exec(
            select(func.count(ExternalSubmission.id)).where(
                ExternalSubmission.user_id == user_id,
                ExternalSubmission.platform == platform,
                ExternalSubmission.status == "accepted",
            )
        ).one()

        stats["linked_platforms"].append({
            "platform": platform,
            "username": link.platform_username,
            "profile_url": link.profile_url,
            "total": sub_count,
            "accepted": accepted_count,
            "synced_at": link.synced_at,
        })
        stats["total_submissions"] += sub_count
        stats["accepted_submissions"] += accepted_count

    return stats
