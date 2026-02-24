const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
};

function serveFile(filePath, res) {
  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const filePath = path.join(ROOT, urlPath);

  // Exact file match
  try {
    if (fs.statSync(filePath).isFile()) return serveFile(filePath, res);
  } catch {}

  // Directory → index.html
  try {
    if (fs.statSync(filePath).isDirectory()) {
      const index = path.join(filePath, 'index.html');
      if (fs.existsSync(index)) return serveFile(index, res);
    }
  } catch {}

  // .html extension fallback
  try {
    if (fs.statSync(filePath + '.html').isFile()) return serveFile(filePath + '.html', res);
  } catch {}

  // 404
  const notFound = path.join(ROOT, '404.html');
  if (fs.existsSync(notFound)) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    fs.createReadStream(notFound).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => console.log(`Serving on port ${PORT}`));
