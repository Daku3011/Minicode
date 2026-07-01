import logging
import re
from github import Github
from sqlmodel import Session
from core.models import User, Problem
from services.auth import decrypt_token

logger = logging.getLogger(__name__)


def build_repo_name(user: User, problem: Problem) -> str:
    """Build a deterministic, GitHub-safe repository name for a user's problem."""
    raw_title = (problem.title or "problem").lower().strip()
    # Keep alphanumerics and hyphens only; collapse repeated separators.
    slug = re.sub(r"[^a-z0-9]+", "-", raw_title)
    slug = re.sub(r"-+", "-", slug).strip("-")
    if not slug:
        slug = f"problem-{problem.id}"

    # Include problem id to prevent collisions for identical titles.
    return f"minicode-{user.username}-{problem.id}-{slug}"


def create_student_repo(user: User, problem: Problem, session: Session):
    """
    Creates a dedicated repository for a student to solve a specific problem.
    """
    # Try decrypting the token first
    decrypted_token = None
    if user.github_access_token:
        decrypted_token = decrypt_token(user.github_access_token)

    if not decrypted_token:
        raise Exception(
            "User has no valid GitHub access token. Please re-authenticate with GitHub."
        )

    g = Github(decrypted_token)
    repo_name = build_repo_name(user, problem)
    gh_user = g.get_user()
    owner_login = gh_user.login

    try:
        # Create the repository
        repo = gh_user.create_repo(
            repo_name,
            description=f"Solution for {problem.title} on MiniCode",
            private=True,
            auto_init=True,
        )

        # Update the auto-generated README with problem description
        default_branch = repo.default_branch
        try:
            readme = repo.get_contents("README.md", ref=default_branch)
            repo.update_file(
                "README.md",
                "Initialize with problem description",
                f"# {problem.title}\n\n{problem.description}",
                readme.sha,
                branch=default_branch,
            )
        except Exception:
            pass

        # Create a starter code file
        repo.create_file(
            "solution.py",
            "Add starter code",
            "# Write your solution here\n\ndef solve():\n    pass\n",
            branch=default_branch,
        )

        return repo.html_url
    except Exception as e:
        logger.error(f"Error creating repo: {e}")
        # If repo already exists, just return its URL or handle accordingly
        try:
            # Prefer authenticated owner login over local username to avoid mismatch issues.
            repo = g.get_repo(f"{owner_login}/{repo_name}")
            return repo.html_url
        except Exception:
            try:
                # Fallback path for some token scopes/providers.
                repo = gh_user.get_repo(repo_name)
                return repo.html_url
            except Exception:
                raise e


def commit_code_to_repo(
    user: User, repo_name: str, file_path: str, content: str, commit_message: str
) -> str:
    """
    Commits code from the in-browser editor to the student's repository.
    """
    decrypted_token = decrypt_token(user.github_access_token)
    if not decrypted_token:
        raise Exception("User has no valid GitHub access token")

    g = Github(decrypted_token)
    repo = g.get_repo(f"{user.username}/{repo_name}")
    default_branch = repo.default_branch

    try:
        contents = repo.get_contents(file_path, ref=default_branch)
        repo.update_file(
            contents.path, commit_message, content, contents.sha, branch=default_branch
        )
    except Exception:
        repo.create_file(file_path, commit_message, content, branch=default_branch)

    return repo.get_branch(default_branch).commit.sha
