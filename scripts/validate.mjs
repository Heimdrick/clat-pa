#!/usr/bin/env node
/**
 * Pre-deploy validation for the single-file PA app.
 *
 * The app ships as one index.html with three inline <script> blocks: two
 * vendored libraries (MSAL, jsPDF) and the application itself. A syntax error
 * anywhere in the app block takes the whole tool down silently on Netlify,
 * so it is checked here before anything reaches main.
 *
 * Checks:
 *   1. index.html parses and the expected script blocks are present
 *   2. the application script block is valid JavaScript
 *   3. every literal $('id') / getElementById('id') resolves to an id in the HTML
 *   4. no leftover debugger statements or merge-conflict markers
 */
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const FILE = 'index.html';
const html = readFileSync(FILE, 'utf8');
const errors = [];
const warn = [];

// --- 1. structure ---------------------------------------------------------
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (scripts.length < 3) {
  errors.push(`expected at least 3 <script> blocks, found ${scripts.length}`);
}
const app = scripts[scripts.length - 1] ?? '';
if (!app.includes('function calc(')) {
  errors.push('application script block does not contain calc() — block order may have changed');
}

// --- 2. syntax ------------------------------------------------------------
const dir = mkdtempSync(join(tmpdir(), 'clat-pa-'));
const jsPath = join(dir, 'app.mjs');
writeFileSync(jsPath, app);
try {
  execFileSync(process.execPath, ['--check', jsPath], { stdio: 'pipe' });
} catch (e) {
  errors.push(`application script has a syntax error:\n${e.stderr?.toString() ?? e.message}`);
}

// --- 3. dangling element references ---------------------------------------
// Ids that are deliberately optional: the code null-checks them before use.
// Add to this set only when the reference is genuinely guarded.
const OPTIONAL_IDS = new Set(['btnDefaults']);

const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
const refs = new Map();
for (const m of app.matchAll(/(?:\$|document\.getElementById)\(\s*'([A-Za-z0-9_-]+)'\s*\)/g)) {
  refs.set(m[1], (refs.get(m[1]) ?? 0) + 1);
}
const dangling = [...refs.keys()].filter(id => !ids.has(id) && !OPTIONAL_IDS.has(id));
if (dangling.length) {
  errors.push(`referenced in JS but no matching id in the HTML: ${dangling.join(', ')}`);
}

// --- 4. hygiene -----------------------------------------------------------
if (/^(<{7}|={7}|>{7})/m.test(html)) errors.push('merge conflict markers left in index.html');
if (/\bdebugger\b/.test(app)) warn.push('debugger statement left in the application script');

// --- report ---------------------------------------------------------------
const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
console.log(`${FILE}: ${kb} KB · ${scripts.length} script blocks · ${ids.size} ids · ${refs.size} literal element refs`);
for (const w of warn) console.log(`warning: ${w}`);
if (errors.length) {
  console.error('\nvalidation failed:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('validation passed');
