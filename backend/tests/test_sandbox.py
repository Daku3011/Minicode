import asyncio
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from sqlmodel import Session

from sandbox.runner import (
    run_in_sandbox,
    build_sandbox_images,
    check_sandbox_health,
    SandboxResult,
    SANDBOX_IMAGES,
)
from services.sandbox_judge import judge_with_sandbox_only
from utils.sandbox import docker_is_available, ensure_sandbox_images, get_sandbox_status


@pytest.mark.asyncio
async def test_run_in_sandbox_docker_not_found():
    with patch("asyncio.create_subprocess_exec", side_effect=FileNotFoundError):
        result = await run_in_sandbox("python", "print('hello')", [])
        assert isinstance(result, SandboxResult)
        assert result.success is False
        assert "Docker is not available" in result.error


@pytest.mark.asyncio
async def test_run_in_sandbox_unsupported_language():
    result = await run_in_sandbox("brainfuck", "+++", [])
    assert result.success is False
    assert "Unsupported language" in result.error


@pytest.mark.asyncio
async def test_run_in_sandbox_timeout():
    async def mock_communicate():
        raise asyncio.TimeoutError

    mock_proc = AsyncMock()
    mock_proc.communicate = mock_communicate
    mock_proc.returncode = None

    with patch("asyncio.create_subprocess_exec", return_value=mock_proc):
        result = await run_in_sandbox("python", "print('hi')", [], timeout=1)
        assert isinstance(result, SandboxResult)
        assert result.timed_out is True


@pytest.mark.asyncio
async def test_check_sandbox_health():
    with patch("asyncio.create_subprocess_exec") as mock_exec:
        proc = AsyncMock()
        proc.returncode = 0
        mock_exec.return_value = proc

        result = await check_sandbox_health()
        assert "docker_daemon" in result
        assert "python" in result
        assert "node" in result
        assert "java" in result


@pytest.mark.asyncio
async def test_build_sandbox_images():
    with patch("sandbox.runner.Path.exists", return_value=True):
        with patch("asyncio.create_subprocess_exec") as mock_exec:
            proc = AsyncMock()
            proc.returncode = 0
            mock_exec.return_value = proc

            results = await build_sandbox_images()
            assert isinstance(results, dict)
            for lang in ["python", "node", "java"]:
                assert lang in results


@pytest.mark.asyncio
async def test_sandbox_result_dataclass():
    result = SandboxResult(
        success=True,
        output="ok",
        error="",
        timed_out=False,
        exit_code=0,
        execution_time_ms=10.5,
        test_results=[{"passed": True}],
    )
    assert result.success is True
    assert result.test_results == [{"passed": True}]


@pytest.mark.asyncio
async def test_docker_is_available_true():
    with patch("utils.sandbox.asyncio.create_subprocess_exec") as mock_exec:
        proc = AsyncMock()
        proc.returncode = 0
        mock_exec.return_value = proc
        assert await docker_is_available() is True


@pytest.mark.asyncio
async def test_docker_is_available_false():
    with patch("utils.sandbox.asyncio.create_subprocess_exec") as mock_exec:
        proc = AsyncMock()
        proc.returncode = 1
        mock_exec.return_value = proc
        assert await docker_is_available() is False


@pytest.mark.asyncio
async def test_docker_is_available_not_found():
    with patch("utils.sandbox.asyncio.create_subprocess_exec", side_effect=FileNotFoundError):
        assert await docker_is_available() is False


@pytest.mark.asyncio
async def test_ensure_sandbox_images_docker_unavailable():
    with patch("utils.sandbox.docker_is_available", return_value=False):
        result = await ensure_sandbox_images(["python", "node"])
        assert result == {"python": False, "node": False}


@pytest.mark.asyncio
async def test_ensure_sandbox_images_docker_available():
    with patch("utils.sandbox.docker_is_available", return_value=True):
        with patch("sandbox.runner.Path.exists", return_value=True):
            with patch("asyncio.create_subprocess_exec") as mock_exec:
                proc = AsyncMock()
                proc.returncode = 0
                proc.communicate = AsyncMock(return_value=(b"", b""))
                mock_exec.return_value = proc

                result = await ensure_sandbox_images(["python"])
                assert result.get("python") is True


@pytest.mark.asyncio
async def test_get_sandbox_status_docker_unavailable():
    with patch("utils.sandbox.docker_is_available", return_value=False):
        status = await get_sandbox_status()
        assert status["available"] is False
        assert status["docker_running"] is False
        assert "Docker daemon is not running" in status["error"]


@pytest.mark.asyncio
async def test_judge_with_sandbox_only():
    with patch("services.sandbox_judge.run_in_sandbox", new_callable=AsyncMock) as mock_run:
        mock_run.return_value = SandboxResult(
            success=True,
            output='{"type": "result", "all_passed": true, "results": []}',
            error="",
            timed_out=False,
            exit_code=0,
            execution_time_ms=5.0,
            test_results=[],
        )

        result = await judge_with_sandbox_only("python", "print('ok')", [])
        assert result.success is True


@pytest.mark.asyncio
async def test_run_in_sandbox_exception():
    with patch("asyncio.create_subprocess_exec", side_effect=Exception("boom")):
        result = await run_in_sandbox("python", "print('x')", [])
        assert result.success is False
        assert "boom" in result.error


@pytest.mark.asyncio
async def test_sandbox_images_constant():
    assert "python" in SANDBOX_IMAGES
    assert "node" in SANDBOX_IMAGES
    assert "java" in SANDBOX_IMAGES
    assert SANDBOX_IMAGES["python"] == "sandbox-python:latest"
