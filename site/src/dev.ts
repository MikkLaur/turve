/**
 * Local development: builds the site with --dev (local API, style tile at /stiil/), serves it on :8080 with
 * the same security headers as production, serves the admin panel (../kapsaaed) on :8081, and rebuilds on change.
 * Run the API alongside: cd server && npm run dev
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { siteConfig } from './config';
import { securityHeaders } from './headers';

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const ADMIN = path.resolve(ROOT, '../kapsaaed');
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
};

function rebuild(): void {
  const result = spawnSync(process.execPath, ['--import', 'tsx', path.join(__dirname, 'build.ts'), '--dev'], { cwd: ROOT, stdio: 'inherit' });
  if (result.status !== 0) {
    console.error('Build failed; serving the previous output.');
  }
}

function serve(root: string, port: number, headers: Record<string, string>, notFound?: string): void {
  http
    .createServer((req, res) => {
      const urlPath = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
      let file = path.resolve(root, `.${urlPath}`);
      if (!file.startsWith(root)) {
        res.writeHead(403).end();
        return;
      }
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
        file = path.join(file, 'index.html');
      }
      const exists = fs.existsSync(file) && fs.statSync(file).isFile();
      const target = exists ? file : notFound ? path.join(root, notFound) : null;
      if (!target || !fs.existsSync(target)) {
        res.writeHead(404, headers).end('Not found');
        return;
      }
      res.writeHead(exists ? 200 : 404, { ...headers, 'Content-Type': TYPES[path.extname(target)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(target).pipe(res);
    })
    .listen(port, () => console.log(`Serving ${path.relative(process.cwd(), root) || root} on http://localhost:${port}`));
}

rebuild();
const cfg = siteConfig(true);
serve(DIST, 8080, securityHeaders(cfg), '404.html');
serve(ADMIN, 8081, {
  'Content-Security-Policy': `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src ${cfg.apiOrigin}; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
});

let timer: NodeJS.Timeout | undefined;
const onChange = () => {
  clearTimeout(timer);
  timer = setTimeout(rebuild, 150);
};
for (const dir of [path.join(ROOT, 'src'), path.join(ROOT, 'assets'), path.resolve(ROOT, '../server/src/catalog')]) {
  fs.watch(dir, { recursive: true }, onChange);
}
