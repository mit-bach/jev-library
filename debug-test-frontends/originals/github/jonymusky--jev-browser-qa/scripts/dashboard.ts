import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

// Local control panel: lists every run under artifacts/runs and serves videos,
// traces and screenshots from artifacts/. No external dependencies.
const PORT = Number(process.env.DASHBOARD_PORT ?? 4310);
const ROOT = resolve(process.cwd());
const ARTIFACTS = join(ROOT, 'artifacts');
const RUNS = join(ARTIFACTS, 'runs');
const PAGE = join(ROOT, 'dashboard', 'index.html');

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.zip': 'application/zip',
  '.md': 'text/markdown; charset=utf-8',
};

function listRuns() {
  if (!existsSync(RUNS)) return [];
  return readdirSync(RUNS)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .reverse()
    .map((f) => JSON.parse(readFileSync(join(RUNS, f), 'utf8')));
}

createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(200, { 'content-type': MIME['.html'] });
    createReadStream(PAGE).pipe(res);
    return;
  }
  if (url.pathname === '/api/runs') {
    res.writeHead(200, { 'content-type': MIME['.json'], 'cache-control': 'no-store' });
    res.end(JSON.stringify(listRuns()));
    return;
  }
  if (url.pathname.startsWith('/files/')) {
    const target = normalize(join(ARTIFACTS, decodeURIComponent(url.pathname.slice('/files/'.length))));
    if (!target.startsWith(ARTIFACTS) || !existsSync(target) || statSync(target).isDirectory()) {
      res.writeHead(404).end('not found');
      return;
    }
    const size = statSync(target).size;
    const type = MIME[extname(target)] ?? 'application/octet-stream';
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? '');
    if (range) {
      // Browsers seek videos with Range requests; without 206 playback stalls or never starts.
      const start = range[1] ? Number(range[1]) : 0;
      const end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      res.writeHead(206, { 'content-type': type, 'accept-ranges': 'bytes', 'content-range': `bytes ${start}-${end}/${size}`, 'content-length': end - start + 1 });
      createReadStream(target, { start, end }).pipe(res);
      return;
    }
    res.writeHead(200, { 'content-type': type, 'accept-ranges': 'bytes', 'content-length': size });
    createReadStream(target).pipe(res);
    return;
  }
  res.writeHead(404).end('not found');
}).listen(PORT, () => {
  console.log(`QA dashboard: http://localhost:${PORT}`);
});
