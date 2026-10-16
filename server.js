const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const publicRoot = path.join(__dirname, 'public');
const svgRoot = path.join(__dirname, 'src', 'svg');
const siteEntries = new Set(['index.html', 'public', 'examples']);
const port = Number(process.env.PORT) || 3000;
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function send(response, statusCode, body, contentType = 'text/plain; charset=utf-8') {
  response.writeHead(statusCode, { 'Content-Type': contentType });
  response.end(body);
}

async function buildIconBundle() {
  const sourcePath = path.join(publicRoot, 'miller-icons.js');
  const svgDirectory = svgRoot;
  const source = await fs.promises.readFile(sourcePath, 'utf8');
  const entries = await fs.promises.readdir(svgDirectory, { withFileTypes: true });
  const iconFiles = entries
    .filter((entry) => entry.isFile() && /\.svg$/i.test(entry.name))
    .filter((entry) => /^[\w.-]+\.svg$/i.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name));
  const icons = Object.fromEntries(await Promise.all(iconFiles.map(async (entry) => {
    const name = path.basename(entry.name, path.extname(entry.name));
    const markup = await fs.promises.readFile(path.join(svgDirectory, entry.name), 'utf8');
    return [name, markup.trim()];
  })));

  const startMarker = '  // MILLER_ICON_REGISTRY_START';
  const endMarker = '  // MILLER_ICON_REGISTRY_END';
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker);
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No se encontró el bloque del registro de iconos en miller-icons.js');
  }

  const registry = `${startMarker}\n  const icons = Object.freeze(${JSON.stringify(icons, null, 2)});\n  ${endMarker}`;
  const bundle = `${source.slice(0, start)}${registry}${source.slice(end + endMarker.length)}`;
  await fs.promises.writeFile(sourcePath, bundle, 'utf8');
  return bundle;
}

const server = http.createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  } catch {
    send(response, 400, 'Bad request');
    return;
  }

  if (request.method !== 'GET') {
    send(response, 405, 'Method not allowed');
    return;
  }

  if (pathname === '/public/miller-icons.js') {
    buildIconBundle()
      .then((bundle) => {
        response.writeHead(200, {
          'Content-Type': contentTypes['.js'],
          'Cache-Control': 'no-store',
        });
        response.end(bundle);
      })
      .catch((error) => {
        console.error('No se pudo generar miller-icons.js desde src/svg:', error);
        send(response, 500, 'No se pudo generar el registro de iconos');
      });
    return;
  }

  if (pathname === '/api/icons') {
    fs.readdir(svgRoot, { withFileTypes: true }, (error, entries) => {
      if (error) {
        console.error('No se pudo leer src/svg:', error);
        send(response, 500, 'No se pudo leer src/svg');
        return;
      }

      const files = entries
        .filter((entry) => entry.isFile() && /\.svg$/i.test(entry.name))
        .map((entry) => entry.name)
        .sort((a, b) => a.localeCompare(b));
      send(response, 200, JSON.stringify(files), 'application/json; charset=utf-8');
    });
    return;
  }

  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.resolve(root, `.${requestedPath}`);
  const relativePath = path.relative(root, filePath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    send(response, 403, 'Forbidden');
    return;
  }
  if (!siteEntries.has(relativePath.split(path.sep)[0])) {
    send(response, 404, 'File not found');
    return;
  }

  fs.readFile(filePath, (error, contents) => {
    if (error) {
      send(response, error.code === 'ENOENT' ? 404 : 500, 'File not found');
      return;
    }

    const contentType = contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    send(response, 200, contents, contentType);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Galería disponible en http://127.0.0.1:${port}`);
});
