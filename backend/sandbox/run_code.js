const fs = require('fs');
const code = fs.readFileSync('/dev/stdin', 'utf-8');

let solutionFn;
try {
    const wrapped = new Function('module', 'exports', 'require',
        code + '\nreturn module.exports;');
    const mod = { exports: {} };
    const result = wrapped(mod, mod.exports, require);
    solutionFn = result || mod.exports;
    if (typeof solutionFn !== 'function') {
        const exported = Object.values(mod.exports).find(v => typeof v === 'function');
        if (exported) solutionFn = exported;
    }
} catch (e) {
    console.log(JSON.stringify({ type: 'compile_error', error: e.stack }));
    process.exit(1);
}

if (typeof solutionFn !== 'function') {
    console.log(JSON.stringify({ type: 'error', error: 'No callable function found' }));
    process.exit(1);
}

const testCases = JSON.parse(process.argv[2] || '[]');
const results = [];
let allPassed = true;
let totalTime = 0;

for (const tc of testCases) {
    const inp = tc.input_data;
    const expected = tc.expected_output;
    const start = Date.now();
    try {
        const actual = String(solutionFn(inp));
        const elapsed = Date.now() - start;
        totalTime += elapsed;
        const passed = actual.trim() === expected.trim();
        if (!passed) allPassed = false;
        results.push({ passed, input: String(inp), expected, actual, error: null, time_ms: elapsed });
    } catch (e) {
        const elapsed = Date.now() - start;
        totalTime += elapsed;
        allPassed = false;
        results.push({ passed: false, input: String(inp), expected, actual: '', error: e.stack, time_ms: elapsed });
    }
}

console.log(JSON.stringify({ type: 'result', all_passed: allPassed, results, total_time_ms: totalTime }));
