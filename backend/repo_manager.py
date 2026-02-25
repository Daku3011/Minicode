import os
from github import Github
from sqlmodel import Session
from models import User, Problem

def create_student_repo(user: User, problem: Problem, session: Session):
    """
    Creates a dedicated repository for a student to solve a specific problem.
    """
    if not user.github_access_token:
        raise Exception("User has no GitHub access token")
    
    g = Github(user.github_access_token)
    repo_name = f"minicode-{user.username}-{problem.title.lower().replace(' ', '-')}"
    
    try:
        # Create the repository
        # In a real scenario, you might want to use a template repo
        # repo = g.get_user().create_repo_from_template(repo_name, template_repo)
        
        repo = g.get_user().create_repo(
            repo_name,
            description=f"Solution for {problem.title} on MiniCode",
            private=True,
            auto_init=True
        )
        
        # Update the auto-generated README with problem description
        try:
            readme = repo.get_contents("README.md", ref="main")
            repo.update_file(
                "README.md",
                "Initialize with problem description",
                f"# {problem.title}\n\n{problem.description}",
                readme.sha,
                branch="main"
            )
        except Exception:
            pass
        
        # Create a starter code file
        repo.create_file(
            "solution.py",
            "Add starter code",
            "# Write your solution here\n\ndef solve():\n    pass\n",
            branch="main"
        )
        
        return repo.html_url
    except Exception as e:
        print(f"Error creating repo: {e}")
        # If repo already exists, just return its URL or handle accordingly
        try:
            repo = g.get_user().get_repo(repo_name)
            return repo.html_url
        except:
            raise e

def commit_code_to_repo(user: User, repo_name: str, file_path: str, content: str, commit_message: str):
    """
    Commits code from the in-browser editor to the student's repository.
    """
    g = Github(user.github_access_token)
    repo = g.get_user().get_repo(repo_name)
    
    try:
        contents = repo.get_contents(file_path, ref="main")
        repo.update_file(contents.path, commit_message, content, contents.sha, branch="main")
    except:
        repo.create_file(file_path, commit_message, content, branch="main")
    
    return repo.get_branch("main").commit.sha
