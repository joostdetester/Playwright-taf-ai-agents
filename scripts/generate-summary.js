#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const argv = require('minimist')(process.argv.slice(2));
const out = argv.out || 'summary.json';
const suite = argv.suite || 'suite';
const dir = path.resolve(process.cwd(), 'allure-results');

let passed = 0, failed = 0, total = 0;

if (!fs.existsSync(dir)) {
  fs.writeFileSync(out, JSON.stringify({ suite, total: 0, passed: 0, failed: 0 }, null, 2));
  console.log('No allure-results directory, wrote empty summary to', out);
  process.exit(0);
}

const files = fs.readdirSync(dir);
for (const f of files) {
  const p = path.join(dir, f);
  try {
    const content = fs.readFileSync(p, 'utf8');
    // Count JSON statuses
    const jsonStatusMatches = (content.match(/"status"\s*:\s*"(passed|failed|skipped)"/gi) || []);
    for (const m of jsonStatusMatches) {
      const s = /"status"\s*:\s*"(passed|failed|skipped)"/i.exec(m)[1].toLowerCase();
      if (s === 'passed') passed++;
      else if (s === 'failed') failed++;
      total++;
    }
    // Count xml patterns (junit/allure xml)
    const xmlPass = (content.match(/status\s*=\s*"passed"/gi) || []).length + (content.match(/<status>\s*passed\s*<\/status>/gi) || []).length;
    const xmlFail = (content.match(/status\s*=\s*"failed"/gi) || []).length + (content.match(/<status>\s*failed\s*<\/status>/gi) || []).length;
    passed += xmlPass;
    failed += xmlFail;
    total += xmlPass + xmlFail;
  } catch (err) {
    // ignore
  }
}

fs.writeFileSync(out, JSON.stringify({ suite, total, passed, failed }, null, 2));
console.log('Wrote summary:', out, JSON.stringify({ suite, total, passed, failed }));
