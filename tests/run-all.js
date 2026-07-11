// run-all.js — execute all test files
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const testsDir = __dirname;
const tests = fs.readdirSync(testsDir)
  .filter(f => f.endsWith('.test.js'))
  .filter(f => f !== 'run-all.js');

console.log(`\nRunning ${tests.length} test files...\n`);

let totalPass = 0, totalFail = 0, totalErrors = 0;
const failedFiles = [];

for (const t of tests) {
  const filePath = path.join(testsDir, t);
  try {
    const out = execSync(`node "${filePath}"`, {
      stdio: 'pipe',
      encoding: 'utf8',
      timeout: 30000,
    });
    process.stdout.write(out);
    // Count results from the output
    const matches = out.match(/(\d+)\/(\d+) passed/g);
    if (matches) {
      matches.forEach(m => {
        const [pass, total] = m.match(/\d+/g).map(Number);
        totalPass += pass;
        totalErrors += total;
      });
    }
    totalFail++;
  } catch (e) {
    // Non-zero exit
    if (e.stdout) process.stdout.write(e.stdout.toString());
    if (e.stderr) process.stderr.write(e.stderr.toString());
    failedFiles.push(t);
  }
}

console.log(`\n${'='.repeat(50)}`);
console.log(`Files: ${tests.length - failedFiles.length}/${tests.length} passed`);
if (totalErrors > 0) {
  console.log(`Total assertions: ${totalPass}/${totalErrors} passed`);
}
if (failedFiles.length > 0) {
  console.log(`\nFailed files:`);
  failedFiles.forEach(f => console.log(`  - ${f}`));
}
console.log('='.repeat(50));

process.exit(failedFiles.length > 0 ? 1 : 0);
