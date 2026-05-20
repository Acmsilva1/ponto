import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createServer } from 'node:http';

const port = Number(process.env.WEB_PORT || 5173);
const root = new URL('.', import.meta.url).pathname;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png'
};

function resolveFile(urlPath) {
  const safePath = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^\.\.(\/|\|$)/, '');
  const requested = join(root, safePath === '/' ? 'index.html' : safePath);
  if (existsSync(requested) && statSync(requested).isFile()) return requested;
  return join(root, 'index.html');
}

createServer((req, res) => {
  const file = resolveFile(req.url || '/');
  res.setHeader('content-type', mimeTypes[extname(file)] || 'application/octet-stream');
  createReadStream(file).pipe(res);
}).listen(port, () => {
  console.log(`Web rodando em http://localhost:${port}`);
});
