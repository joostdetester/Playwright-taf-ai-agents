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

function findStatusesInObject(obj, collector) {
  if (!obj || typeof obj !== 'object') return;
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (k === 'status' && typeof v === 'string') {
      const s = String(v).toLowerCase();
      collector.statuses.push(s);
    } else if ((k === 'time' || k === 'duration' || k === 'start' || k === 'stop') && typeof v !== 'undefined') {
      // record timestamps where found
      if (k === 'time' && typeof v === 'object') {
        if (v.start) collector.times.push(Number(v.start));
        if (v.stop) collector.times.push(Number(v.stop));
      } else if (k === 'start' || k === 'stop') {
        collector.times.push(Number(v));
      }
    } else if (typeof v === 'object') {
      findStatusesInObject(v, collector);
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

const files = fs.readdirSync(dir);
for (const f of files) {
  const p = path.join(dir, f);
  try {
    const content = fs.readFileSync(p, 'utf8');
    // Try parse as JSON and recursively extract statuses/times
    try {
      const obj = JSON.parse(content);
      const collector = { statuses: [], times: [] };
      if (Array.isArray(obj)) {
        for (const item of obj) findStatusesInObject(item, collector);
      } else {
        findStatusesInObject(obj, collector);
      }
      for (const s of collector.statuses) {
        if (s === 'passed') passed++;
        else if (s === 'failed') failed++;
        else if (s === 'skipped') skipped++;
        total++;
      }
      times.push(...collector.times.filter(t => Number.isFinite(Number(t))).map(Number));
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

const payload = { suite, total, passed, failed, skipped, status, start, stop, durationMs };
fs.writeFileSync(out, JSON.stringify(payload, null, 2));
console.log('Wrote summary:', out, JSON.stringify(payload));
