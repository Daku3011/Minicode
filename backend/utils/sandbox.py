import asyncio
import logging
from typing import Optional

logger = logging.getLogger(__name__)


async def docker_is_available() -> bool:
    try:
        proc = await asyncio.create_subprocess_exec(
            "docker", "info",
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.DEVNULL,
        )
        await proc.wait()
        return proc.returncode == 0
    except FileNotFoundError:
        return False


async def ensure_sandbox_images(languages: Optional[list[str]] = None) -> dict[str, bool]:
    from sandbox.runner import build_sandbox_images, SANDBOX_IMAGES

    if not await docker_is_available():
        logger.warning("Docker is not available. Cannot build sandbox images.")
        return {lang: False for lang in (languages or list(SANDBOX_IMAGES.keys()))}

    all_results = await build_sandbox_images()
    if languages:
        return {lang: all_results.get(lang, False) for lang in languages}
    return all_results


async def get_sandbox_status() -> dict:
    from sandbox.runner import check_sandbox_health

    docker_ok = await docker_is_available()
    if not docker_ok:
        return {
            "available": False,
            "docker_running": False,
            "images": {},
            "error": "Docker daemon is not running",
        }

    images = await check_sandbox_health()
    available = images.pop("docker_daemon", False) and any(images.values())

    return {
        "available": available,
        "docker_running": True,
        "images": images,
    }
