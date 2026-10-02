import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(fileURLToPath(new URL('./dist/', import.meta.url)));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
http.createServer(async (request, response) => { try { const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); const file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`); if (!file.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; } const content = await readFile(file); response.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0' }); response.end(content); } catch { response.writeHead(404); response.end('Not found'); } }).listen(4173, '127.0.0.1', () => console.log('DAYFORM Local: http://127.0.0.1:4173'));
