import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cacheFile = join(root, 'data/cache/live.json');
const TIMEOUT = 8000;
const UA = 'imam-chobanov-site/0.1 (+build script; contact pkd12305@gmail.com)';

const GH_USER = 'H1z3-br0';

const stripControls = (s) =>
  Array.from(s)
    .filter((c) => c.codePointAt(0) >= 32)
    .join('');

async function get(url) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT);
  try {
    const res = await fetch(url, {
      signal: ctl.signal,
      headers: { 'user-agent': UA, accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return JSON.parse(stripControls(await res.text()));
  } finally {
    clearTimeout(timer);
  }
}

async function github() {

  const repos = await get(
    `https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=pushed&type=owner`
  );
  if (!Array.isArray(repos)) throw new Error('неожиданный ответ');
  const repo = repos.find((r) => !r.fork && !r.archived && r.name !== GH_USER);
  if (!repo) throw new Error('нет подходящих репозиториев');

  let message = null;
  try {
    const commits = await get(`https://api.github.com/repos/${repo.full_name}/commits?per_page=1`);
    const head = Array.isArray(commits) ? commits[0] : null;
    if (head?.commit?.message) {
      message = String(head.commit.message).split(String.fromCharCode(10))[0].slice(0, 120);
    }
  } catch {

  }

  return { repo: repo.name, repoUrl: repo.html_url, message, date: repo.pushed_at };
}

const sources = { github };

const prev = await readFile(cacheFile, 'utf8').then(JSON.parse).catch(() => ({}));
const out = { fetchedAt: new Date().toISOString() };
let fresh = 0;

for (const [key, fn] of Object.entries(sources)) {
  try {
    out[key] = { ...(await fn()), stale: false };
    fresh++;
    console.log(`  ${key}: обновлено`);
  } catch (err) {
    const cached = prev[key];
    if (cached) {
      out[key] = { ...cached, stale: true };
      console.warn(`  ${key}: ${err.message} — беру из кэша от ${prev.fetchedAt ?? '?'}`);
    } else {
      console.warn(`  ${key}: ${err.message} — кэша нет, строка не отрендерится`);
    }
  }
}
if (!fresh && prev.fetchedAt) out.fetchedAt = prev.fetchedAt;

await mkdir(dirname(cacheFile), { recursive: true });
await writeFile(cacheFile, JSON.stringify(out, null, 2) + String.fromCharCode(10));
console.log('  → data/cache/live.json');
