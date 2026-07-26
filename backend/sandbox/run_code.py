import sys
import json
import traceback
import time

user_code = sys.stdin.read()

exec_globals = {}
try:
    exec(user_code, exec_globals)
except Exception as e:
    print(json.dumps({"type": "compile_error", "error": traceback.format_exc()}))
    sys.exit(1)

solution_fn = None
for name, obj in exec_globals.items():
    if callable(obj) and not name.startswith("_"):
        solution_fn = obj
        break

if solution_fn is None:
    print(json.dumps({"type": "error", "error": "No callable function found in code"}))
    sys.exit(1)

test_cases = json.loads(sys.argv[1]) if len(sys.argv) > 1 else []
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
        results.append({
            "passed": passed,
            "input": str(inp),
            "expected": expected,
            "actual": actual,
            "error": None,
            "time_ms": round(elapsed, 2),
        })
    except Exception as e:
        elapsed = (time.time() - start) * 1000
        total_time += elapsed
        all_passed = False
        results.append({
            "passed": False,
            "input": str(inp),
            "expected": expected,
            "actual": "",
            "error": traceback.format_exc(),
            "time_ms": round(elapsed, 2),
        })

print(json.dumps({
    "type": "result",
    "all_passed": all_passed,
    "results": results,
    "total_time_ms": round(total_time, 2),
}))
