#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Parse args: --out=FILE and --suite=NAME
const rawArgs = process.argv.slice(2);
let out = 'summary.json';
let suite = 'suite';
for (const a of rawArgs) {
  if (a.startsWith('--out=')) out = a.split('=')[1];
  if (a.startsWith('--suite=')) suite = a.split('=')[1];
}

const dir = path.resolve(process.cwd(), 'allure-results');

function findTestResults(obj, collector) {
  if (!obj) return;
  // If this object looks like an Allure test result (has a name and status), treat it as one result
  if (typeof obj === 'object' && (obj.name || obj.fullName || obj.uuid) && typeof obj.status === 'string') {
    collector.results.push({ status: String(obj.status).toLowerCase(), name: obj.name || obj.fullName || obj.uuid, time: (obj.time || obj) });
    return;
  }
  // If array, scan items
  if (Array.isArray(obj)) {
    for (const item of obj) findTestResults(item, collector);
    return;
  }
  // Otherwise recurse into object properties
  if (typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      try { findTestResults(obj[k], collector); } catch (e) {}
    }
  }
}

if (!fs.existsSync(dir)) {
  const payload = { suite, total: 0, passed: 0, failed: 0, skipped: 0, status: 'UNKNOWN' };
  fs.writeFileSync(out, JSON.stringify(payload, null, 2));
  console.log('No allure-results directory, wrote empty summary to', out);
  process.exit(0);
}

let total = 0, passed = 0, failed = 0, skipped = 0;
let times = [];
let failedNames = [];

const files = fs.readdirSync(dir);
for (const f of files) {
  const p = path.join(dir, f);
  try {
    const content = fs.readFileSync(p, 'utf8');
    // Try parse as JSON and recursively extract statuses/times
    try {
      const obj = JSON.parse(content);
      const collector = { results: [] };
      if (Array.isArray(obj)) {
        for (const item of obj) findTestResults(item, collector);
      } else {
        findTestResults(obj, collector);
      }
      for (const r of collector.results) {
        const s = (r.status || '').toLowerCase();
        if (s === 'passed') passed++;
        else if (s === 'failed') failed++;
        else if (s === 'skipped') skipped++;
        total++;
        if (s === 'failed' && r.name) failedNames.push(String(r.name));
        // collect potential time info
        if (r.time) {
          // r.time may be an object like {start,stop} or a numeric start
          if (typeof r.time === 'object') {
            if (r.time.start) times.push(Number(r.time.start));
            if (r.time.stop) times.push(Number(r.time.stop));
          } else if (Number.isFinite(Number(r.time))) {
            times.push(Number(r.time));
          }
        }
      }
      continue;
    } catch (err) {
      // not JSON - fall back to regex
    }

    // Fallback: pattern matching in text (xml/junit or non-JSON allure files)
    const jsMatches = content.match(/"status"\s*:\s*"(passed|failed|skipped)"/gi) || [];
    for (const m of jsMatches) {
      const s = /"status"\s*:\s*"(passed|failed|skipped)"/i.exec(m)[1].toLowerCase();
      if (s === 'passed') passed++;
      else if (s === 'failed') failed++;
      else if (s === 'skipped') skipped++;
      total++;
    }
    const xmlPass = (content.match(/status\s*=\s*"passed"/gi) || []).length + (content.match(/<status>\s*passed\s*<\/status>/gi) || []).length;
    const xmlFail = (content.match(/status\s*=\s*"failed"/gi) || []).length + (content.match(/<status>\s*failed\s*<\/status>/gi) || []).length;
    const xmlSkip = (content.match(/status\s*=\s*"skipped"/gi) || []).length + (content.match(/<status>\s*skipped\s*<\/status>/gi) || []).length;
    passed += xmlPass; failed += xmlFail; skipped += xmlSkip; total += xmlPass + xmlFail + xmlSkip;
    // Try mtime as a fallback time indication
    try { const st = fs.statSync(p); times.push(Math.floor(st.mtimeMs)); } catch (e) {}
  } catch (err) {
    // ignore unreadable files
  }
}

// Determine overall status
let status = 'UNKNOWN';
if (total > 0) status = failed > 0 ? 'FAILED' : 'PASSED';

// Determine start/stop if available
let start = null, stop = null, durationMs = null;
if (times.length > 0) {
  times.sort((a,b)=>a-b);
  start = new Date(times[0]).toISOString();
  stop = new Date(times[times.length-1]).toISOString();
  durationMs = times[times.length-1] - times[0];
}

const payload = { suite, total, passed, failed, skipped, failedTests: failedNames, status, start, stop, durationMs };
fs.writeFileSync(out, JSON.stringify(payload, null, 2));
console.log('Wrote summary:', out, JSON.stringify(payload));
