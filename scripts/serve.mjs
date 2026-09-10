import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist');
const port = Number(process.env.PORT ?? 4321);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

const CSP = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "font-src 'self'",
  "img-src 'self' data:",
  "connect-src 'none'",
  "form-action 'self'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
].join('; ');

const SECURITY_HEADERS = {
  'content-security-policy': CSP,
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'cross-origin-opener-policy': 'same-origin',
  'x-lattice': 'ctrl-k, then ./secret',
};

const isCli = (ua = '') => /^(curl|wget|httpie|python-requests|libwww-perl|fetch)/i.test(ua);

const wantsEnglish = (accept = '') => {
  const ru = /\bru\b/i.test(accept);
  const en = /\ben\b/i.test(accept);
  return en && !ru;
};

async function readFileIfAny(path) {
  try {
    const s = await stat(path);
    if (s.isDirectory()) return null;
    return await readFile(path);
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let pathname = decodeURIComponent(url.pathname);

  if ((pathname === '/' || pathname === '/en/' || pathname === '/en') && isCli(req.headers['user-agent'])) {
    pathname = wantsEnglish(String(req.headers['accept-language'] ?? '')) || pathname.startsWith('/en')
      ? '/en/card.txt'
      : '/card.txt';
  }

  const safe = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  let file = join(root, safe);
  if (safe.endsWith('/')) file = join(file, 'index.html');

  let body = await readFileIfAny(file);
  if (!body && !extname(file)) body = await readFileIfAny(join(file, 'index.html'));

  if (!body) {
    const page = await readFileIfAny(join(root, '404.html'));
    res.writeHead(404, {
      'content-type': page ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8',
      ...SECURITY_HEADERS,
    });
    res.end(page ?? '404' + String.fromCharCode(10));
    return;
  }

  const type = TYPES[extname(file)] ?? 'application/octet-stream';
  const immutable = /\/a\/|\/fonts\//.test(safe);
  res.writeHead(200, {
    'content-type': type,
    'content-length': body.length,
    'cache-control': immutable ? 'public, max-age=31536000, immutable' : 'public, max-age=300',
    ...SECURITY_HEADERS,
  });
  res.end(body);
});

server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
