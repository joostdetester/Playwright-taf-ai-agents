const fs = require('fs');
const path = require('path');

function readFrontmatter(file) {
  const txt = fs.readFileSync(file, 'utf8');
  if (!txt.startsWith('---')) return null;
  const parts = txt.split('---');
  if (parts.length < 3) return null;
  return parts[1];
}

function parseYamlBlock(block) {
  const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const obj = {};
  for (const l of lines) {
    const m = l.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (m) obj[m[1]] = m[2].replace(/^\[|\]$/g, '').trim();
  }
  return obj;
}

function walk(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) results.push(...walk(p));
    else if (entry.endsWith('.md')) results.push(p);
  }
  return results;
}

const targets = ['ai', '.github/agents'];
let failed = false;
for (const t of targets) {
  const files = walk(t);
  for (const f of files) {
    const fm = readFrontmatter(f);
    if (!fm) {
      console.error(`MISSING frontmatter: ${f}`);
      failed = true;
      continue;
    }
    const data = parseYamlBlock(fm);
    const required = ['title', 'description', 'owner', 'tags'];
    for (const r of required) {
      if (!data[r]) {
        console.error(`MISSING field ${r} in frontmatter: ${f}`);
        failed = true;
      }
    }
  }
}

if (failed) {
  console.error('Frontmatter validation failed');
  process.exit(2);
} else {
  console.log('Frontmatter validation passed');
  process.exit(0);
}
