// Petit serveur de développement statique
// Usage: `node dev-server.js` (optionnel: définir PORT env var)

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const port = process.env.PORT || 8000;
const root = process.cwd();

const mime = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.json': 'application/json', '.txt': 'text/plain'
};

const server = http.createServer((req, res) => {
  try {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';
    const filePath = path.join(root, urlPath);
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('404 - Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.statusCode = 200;
      res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    });
  } catch (e) {
    res.statusCode = 500;
    res.end('Server error');
  }
});

server.listen(port, () => {
  const url = `http://localhost:${port}/index.html`;
  console.log(`Serving ${root} at ${url}`);
  // Ouvre le navigateur par défaut (Windows/macOS/Linux)
  const plat = process.platform;
  let cmd;
  if (plat === 'win32') cmd = `start "" "${url}"`;
  else if (plat === 'darwin') cmd = `open "${url}"`;
  else cmd = `xdg-open "${url}"`;
  exec(cmd, (err) => {
    if (err) console.log('Impossible d\'ouvrir automatiquement le navigateur:', err.message);
  });
});
