import logging
from fastapi import APIRouter, Depends, HTTPException

from core.models import User
from services.auth import require_admin
from sandbox.runner import build_sandbox_images, check_sandbox_health, SANDBOX_IMAGES
from utils.sandbox import docker_is_available

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin/sandbox", tags=["admin-sandbox"])


@router.get("/status")
async def get_sandbox_status(admin: User = Depends(require_admin)):
    docker_ok = await docker_is_available()
    if not docker_ok:
        return {
            "available": False,
            "error": "Docker daemon is not running or not accessible",
            "images": {},
        }

    images = await check_sandbox_health()
    available = images.pop("docker_daemon", False) and any(images.values())

    return {
        "available": available,
        "docker_running": True,
        "images": images,
    }


@router.post("/build")
async def build_sandbox(admin: User = Depends(require_admin)):
    docker_ok = await docker_is_available()
    if not docker_ok:
        raise HTTPException(
            status_code=503,
            detail="Docker daemon is not running. Cannot build sandbox images.",
        )

    results = await build_sandbox_images()
    all_built = all(results.values())

    if not all_built:
        failed = [lang for lang, ok in results.items() if not ok]
        return {
            "success": False,
            "built": results,
            "message": f"Failed to build images for: {', '.join(failed)}",
        }

    return {
        "success": True,
        "built": results,
        "message": "All sandbox images built successfully",
    }


@router.post("/build/{language}")
async def build_single_sandbox(language: str, admin: User = Depends(require_admin)):
    if language not in SANDBOX_IMAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language: {language}. Supported: {', '.join(SANDBOX_IMAGES.keys())}",
        )

    docker_ok = await docker_is_available()
    if not docker_ok:
        raise HTTPException(
            status_code=503,
            detail="Docker daemon is not running.",
        )

    import asyncio
    from pathlib import Path

    dockerfile_map = {
        "python": "Dockerfile.python",
        "node": "Dockerfile.node",
        "java": "Dockerfile.java",
    }

    sandbox_dir = Path(__file__).parent.parent / "sandbox"
    dockerfile = sandbox_dir / dockerfile_map[language]
    image = SANDBOX_IMAGES[language]

    if not dockerfile.exists():
        raise HTTPException(status_code=500, detail=f"Dockerfile not found: {dockerfile}")

    proc = await asyncio.create_subprocess_exec(
        "docker", "build", "-t", image, "-f", str(dockerfile), str(sandbox_dir),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    _, stderr = await proc.communicate()

    if proc.returncode != 0:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to build {image}: {stderr.decode()}",
        )

    return {"success": True, "image": image, "language": language}
