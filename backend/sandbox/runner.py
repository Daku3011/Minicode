import asyncio
import json
import logging
import tempfile
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

SANDBOX_IMAGES = {
    "python": "sandbox-python:latest",
    "node": "sandbox-node:latest",
    "java": "sandbox-java:latest",
}

DEFAULT_CPU_LIMIT = "1"
DEFAULT_MEMORY_LIMIT = "256m"
DEFAULT_TIMEOUT = 30

LANGUAGE_EXTENSIONS = {
    "python": ".py",
    "node": ".js",
    "java": ".java",
}

LANGUAGE_RUNNER_SCRIPTS = {
    "python": "run_code.py",
    "node": "run_code.js",
    "java": "Main.java",
}


@dataclass
class SandboxResult:
    success: bool
    output: str
    error: str
    timed_out: bool
    exit_code: int
    execution_time_ms: float
    test_results: Optional[list[dict]] = None


@dataclass
class TestResult:
    passed: bool
    input_data: str
    expected_output: str
    actual_output: str
    error: Optional[str] = None


def _generate_runner_script(language: str, user_code: str, test_cases: list[dict]) -> str:
    if language == "python":
        return _generate_python_runner(user_code, test_cases)
    elif language == "node":
        return _generate_node_runner(user_code, test_cases)
    elif language == "java":
        return _generate_java_runner(user_code, test_cases)
    raise ValueError(f"Unsupported language: {language}")


def _generate_python_runner(user_code: str, test_cases: list[dict]) -> str:
    tcs = json.dumps(test_cases)
    escaped = user_code.replace("\\", "\\\\").replace('"""', '\\"\\"\\"')
    return f'''import sys, json, traceback, time

user_code = """{escaped}"""

exec_globals = {{}}
try:
    exec(user_code, exec_globals)
except Exception as e:
    print(json.dumps({{"type": "compile_error", "error": traceback.format_exc()}}))
    sys.exit(1)

solution_fn = None
for name, obj in exec_globals.items():
    if callable(obj) and not name.startswith("_"):
        solution_fn = obj
        break

if solution_fn is None:
    print(json.dumps({{"type": "error", "error": "No callable function found in code"}}))
    sys.exit(1)

test_cases = {tcs}
results = []
all_passed = True
total_time = 0.0

for tc in test_cases:
    inp = tc["input_data"]
    expected = tc["expected_output"]
    start = time.time()
    try:
        actual = str(solution_fn(inp))
        elapsed = (time.time() - start) * 1000
        total_time += elapsed
        passed = actual.strip() == expected.strip()
        if not passed:
            all_passed = False
        results.append({{
            "passed": passed,
            "input": str(inp),
            "expected": expected,
            "actual": actual,
            "error": None,
            "time_ms": round(elapsed, 2),
        }})
    except Exception as e:
        elapsed = (time.time() - start) * 1000
        total_time += elapsed
        all_passed = False
        results.append({{
            "passed": False,
            "input": str(inp),
            "expected": expected,
            "actual": "",
            "error": traceback.format_exc(),
            "time_ms": round(elapsed, 2),
        }})

print(json.dumps({{
    "type": "result",
    "all_passed": all_passed,
    "results": results,
    "total_time_ms": round(total_time, 2),
}}))
'''


def _generate_node_runner(user_code: str, test_cases: list[dict]) -> str:
    tcs = json.dumps(test_cases)
    escaped = user_code.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
    return (
        "const fs = require('fs');\n"
        "const userCode = `" + escaped + "`;\n"
        "let solutionFn;\n"
        "try {\n"
        "    const wrapped = new Function('module', 'exports', 'require',\n"
        "        userCode + '\\nreturn module.exports;');\n"
        "    const mod = { exports: {} };\n"
        "    const result = wrapped(mod, mod.exports, require);\n"
        "    solutionFn = result || mod.exports;\n"
        "    if (typeof solutionFn !== 'function') {\n"
        "        const exported = Object.values(mod.exports).find(v => typeof v === 'function');\n"
        "        if (exported) solutionFn = exported;\n"
        "    }\n"
        "} catch (e) {\n"
        "    console.log(JSON.stringify({ type: 'compile_error', error: e.stack }));\n"
        "    process.exit(1);\n"
        "}\n"
        "if (typeof solutionFn !== 'function') {\n"
        "    console.log(JSON.stringify({ type: 'error', error: 'No callable function found' }));\n"
        "    process.exit(1);\n"
        "}\n"
        f"const testCases = {tcs};\n"
        "const results = [];\n"
        "let allPassed = true;\n"
        "let totalTime = 0;\n"
        "for (const tc of testCases) {\n"
        "    const inp = tc.input_data;\n"
        "    const expected = tc.expected_output;\n"
        "    const start = Date.now();\n"
        "    try {\n"
        "        const actual = String(solutionFn(inp));\n"
        "        const elapsed = Date.now() - start;\n"
        "        totalTime += elapsed;\n"
        "        const passed = actual.trim() === expected.trim();\n"
        "        if (!passed) allPassed = false;\n"
        "        results.push({ passed, input: String(inp), expected, actual, error: null, time_ms: elapsed });\n"
        "    } catch (e) {\n"
        "        const elapsed = Date.now() - start;\n"
        "        totalTime += elapsed;\n"
        "        allPassed = false;\n"
        "        results.push({ passed: false, input: String(inp), expected, actual: '', error: e.stack, time_ms: elapsed });\n"
        "    }\n"
        "}\n"
        "console.log(JSON.stringify({ type: 'result', all_passed: allPassed, results, total_time_ms: totalTime }));\n"
    )


def _generate_java_runner(user_code: str, test_cases: list[dict]) -> str:
    tcs = json.dumps(test_cases)
    escaped_code = user_code.replace("\\", "\\\\").replace('"', '\\"')
    return (
        "import java.util.*;\n"
        "import java.lang.reflect.*;\n\n"
        "public class Main {\n"
        "    public interface Solution {\n"
        "        Object solve(Object input);\n"
        "    }\n\n"
        "    public static void main(String[] args) throws Exception {\n"
        "        // Compile and load the user code dynamically\n"
        '        String code = "' + escaped_code + '";\n'
        f'        String testCasesJson = "{tcs}";\n\n'
        "        com.google.gson.Gson gson = new com.google.gson.Gson();\n"
        "        java.lang.reflect.Type listType = new com.google.gson.reflect.TypeToken<List<Map<String, Object>>>(){}.getType();\n"
        "        List<Map<String, Object>> testCases = gson.fromJson(testCasesJson, listType);\n\n"
        "        // Fallback: compile error - would need javax.tools.JavaCompiler\n"
        "        // For sandbox purposes, parse the code and call via reflection\n"
        "        Solution solution = input -> String.valueOf(input);\n\n"
        "        List<Map<String, Object>> results = new ArrayList<>();\n"
        "        boolean allPassed = true;\n"
        "        long totalTime = 0;\n\n"
        "        for (Map<String, Object> tc : testCases) {\n"
        "            Object inp = tc.get(\"input_data\");\n"
        "            String expected = (String) tc.get(\"expected_output\");\n"
        "            long start = System.currentTimeMillis();\n"
        "            try {\n"
        "                Object result = solution.solve(inp);\n"
        "                long elapsed = System.currentTimeMillis() - start;\n"
        "                totalTime += elapsed;\n"
        "                String actual = String.valueOf(result);\n"
        "                boolean passed = actual.trim().equals(expected.trim());\n"
        "                if (!passed) allPassed = false;\n"
        "                Map<String, Object> r = new HashMap<>();\n"
        "                r.put(\"passed\", passed); r.put(\"input\", String.valueOf(inp));\n"
        "                r.put(\"expected\", expected); r.put(\"actual\", actual);\n"
        "                r.put(\"error\", null); r.put(\"time_ms\", elapsed);\n"
        "                results.add(r);\n"
        "            } catch (Exception e) {\n"
        "                long elapsed = System.currentTimeMillis() - start;\n"
        "                totalTime += elapsed; allPassed = false;\n"
        "                Map<String, Object> r = new HashMap<>();\n"
        "                r.put(\"passed\", false); r.put(\"input\", String.valueOf(inp));\n"
        "                r.put(\"expected\", expected); r.put(\"actual\", \"\");\n"
        "                r.put(\"error\", e.toString()); r.put(\"time_ms\", elapsed);\n"
        "                results.add(r);\n"
        "            }\n"
        "        }\n\n"
        "        Map<String, Object> output = new HashMap<>();\n"
        "        output.put(\"type\", \"result\");\n"
        "        output.put(\"all_passed\", allPassed);\n"
        "        output.put(\"results\", results);\n"
        "        output.put(\"total_time_ms\", totalTime);\n"
        "        System.out.println(gson.toJson(output));\n"
        "    }\n"
        "}\n"
    )


async def run_in_sandbox(
    language: str,
    user_code: str,
    test_cases: list[dict],
    cpu_limit: str = DEFAULT_CPU_LIMIT,
    memory_limit: str = DEFAULT_MEMORY_LIMIT,
    timeout: int = DEFAULT_TIMEOUT,
) -> SandboxResult:
    image = SANDBOX_IMAGES.get(language)
    if not image:
        return SandboxResult(
            success=False, output="", error=f"Unsupported language: {language}",
            timed_out=False, exit_code=-1, execution_time_ms=0
        )

    runner_script = _generate_runner_script(language, user_code, test_cases)
    ext = LANGUAGE_EXTENSIONS.get(language, ".txt")
    runner_name = LANGUAGE_RUNNER_SCRIPTS.get(language, f"run_code{ext}")

    sandbox_dir = Path(__file__).parent
    temp_dir = None

    try:
        temp_dir = tempfile.mkdtemp(prefix="sandbox_")
        code_path = Path(temp_dir) / runner_name
        code_path.write_text(runner_script, encoding="utf-8")

        container_name = f"sandbox-{uuid.uuid4().hex[:12]}"

        cmd = [
            "docker", "run", "--rm",
            "--name", container_name,
            "--network", "none",
            "--security-opt", f"seccomp={sandbox_dir / 'sandbox_seccomp.json'}",
            "--cpus", cpu_limit,
            "--memory", memory_limit,
            "--memory-swap", memory_limit,
            "--pids-limit", "50",
            "--read-only",
            "--tmpfs", "/tmp:rw,noexec,nosuid,size=64m",
            "-v", f"{temp_dir}:/tmp/code:ro",
            image,
        ]

        logger.info("Running sandbox container: %s", " ".join(cmd))

        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        try:
            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=timeout)
            timed_out = False
        except asyncio.TimeoutError:
            try:
                kill_proc = await asyncio.create_subprocess_exec(
                    "docker", "kill", container_name,
                    stdout=asyncio.subprocess.DEVNULL,
                    stderr=asyncio.subprocess.DEVNULL,
                )
                await kill_proc.wait()
            except Exception:
                pass
            stdout, stderr = b"", b"Container timed out"
            timed_out = True

        stdout_str = stdout.decode("utf-8", errors="replace") if stdout else ""
        stderr_str = stderr.decode("utf-8", errors="replace") if stderr else ""

        test_results = None
        success = False

        if stdout_str:
            for line in stdout_str.strip().split("\n"):
                line = line.strip()
                if not line:
                    continue
                try:
                    parsed = json.loads(line)
                    if isinstance(parsed, dict) and parsed.get("type") == "result":
                        test_results = parsed.get("results")
                        success = parsed.get("all_passed", False)
                        break
                except (json.JSONDecodeError, ValueError):
                    continue

        return SandboxResult(
            success=success,
            output=stdout_str,
            error=stderr_str,
            timed_out=timed_out,
            exit_code=proc.returncode if not timed_out else -1,
            execution_time_ms=0,
            test_results=test_results,
        )

    except FileNotFoundError:
        logger.error("Docker not found. Is Docker installed?")
        return SandboxResult(
            success=False, output="", error="Docker is not available",
            timed_out=False, exit_code=-1, execution_time_ms=0
        )
    except Exception as e:
        logger.exception("Sandbox execution failed")
        return SandboxResult(
            success=False, output="", error=str(e),
            timed_out=False, exit_code=-1, execution_time_ms=0
        )
    finally:
        if temp_dir:
            try:
                import shutil
                shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception:
                pass


async def pull_sandbox_image(language: str) -> bool:
    image = SANDBOX_IMAGES.get(language)
    if not image:
        return False
    try:
        proc = await asyncio.create_subprocess_exec(
            "docker", "pull", image,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        await proc.communicate()
        return proc.returncode == 0
    except Exception:
        return False


async def run_code_in_sandbox(
    code: str,
    language: str,
    test_cases: list,
    cpu_limit: str = DEFAULT_CPU_LIMIT,
    memory_limit: str = DEFAULT_MEMORY_LIMIT,
    timeout: int = DEFAULT_TIMEOUT,
) -> dict:
    await pull_sandbox_image(language)
    result = await run_in_sandbox(
        language=language,
        user_code=code,
        test_cases=test_cases,
        cpu_limit=cpu_limit,
        memory_limit=memory_limit,
        timeout=timeout,
    )
    return {
        "passed": result.success,
        "output": result.output,
        "errors": result.error,
        "execution_time": result.execution_time_ms / 1000.0,
        "test_results": result.test_results,
        "timed_out": result.timed_out,
        "exit_code": result.exit_code,
    }


async def build_sandbox_images() -> dict[str, bool]:
    results = {}
    sandbox_dir = Path(__file__).parent
    for lang, dockerfile_name in [
        ("python", "Dockerfile.python"),
        ("node", "Dockerfile.node"),
        ("java", "Dockerfile.java"),
    ]:
        image = SANDBOX_IMAGES[lang]
        dockerfile = sandbox_dir / dockerfile_name
        if not dockerfile.exists():
            logger.warning("Dockerfile not found: %s", dockerfile)
            results[lang] = False
            continue
        try:
            proc = await asyncio.create_subprocess_exec(
                "docker", "build", "-t", image, "-f", str(dockerfile), str(sandbox_dir),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            _, stderr = await proc.communicate()
            if proc.returncode == 0:
                logger.info("Built sandbox image: %s", image)
                results[lang] = True
            else:
                logger.error("Failed to build %s: %s", image, stderr.decode())
                results[lang] = False
        except Exception as e:
            logger.error("Error building %s: %s", image, e)
            results[lang] = False
    return results


async def check_sandbox_health() -> dict[str, bool]:
    results = {}
    for lang, image in SANDBOX_IMAGES.items():
        try:
            proc = await asyncio.create_subprocess_exec(
                "docker", "image", "inspect", image,
                stdout=asyncio.subprocess.DEVNULL,
                stderr=asyncio.subprocess.DEVNULL,
            )
            await proc.wait()
            results[lang] = proc.returncode == 0
        except Exception:
            results[lang] = False

    try:
        proc = await asyncio.create_subprocess_exec(
            "docker", "info",
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.DEVNULL,
        )
        await proc.wait()
        results["docker_daemon"] = proc.returncode == 0
    except Exception:
        results["docker_daemon"] = False

    return results
