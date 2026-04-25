const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || 4173);

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function resolvePath(urlPath) {
  const pathname = decodeURIComponent((urlPath || '/').split('?')[0]);
  const safePath = pathname === '/' ? '/index.html' : pathname;
  const fullPath = path.resolve(rootDir, `.${safePath}`);
  if (!fullPath.startsWith(rootDir)) {
    return null;
  }
  return fullPath;
}

http
  .createServer((req, res) => {
    const targetPath = resolvePath(req.url);
    if (!targetPath) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.stat(targetPath, (statError, stat) => {
      if (statError || !stat.isFile()) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      const extension = path.extname(targetPath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': contentTypes[extension] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      fs.createReadStream(targetPath).pipe(res);
    });
  })
  .listen(port, '0.0.0.0', () => {
    console.log(`admin_console ready at http://localhost:${port}`);
  });
