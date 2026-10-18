import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

export async function serveBuild({root:directory='public',basePath='',port=0}={}) {
  const root = path.resolve(directory);
  const server = http.createServer(async (request, response) => {
    try {
      let file = decodeURIComponent(new URL(request.url, 'http://local').pathname);
      if(basePath){if(!file.startsWith(basePath+'/'))throw new Error('Invalid base path');file=file.slice(basePath.length);}
      if (file.endsWith('/')) file += 'index.html';
      const target = path.resolve(root, '.' + file);
      if (!target.startsWith(root + path.sep)) throw new Error('Invalid path');
      const bytes = await readFile(target);
      const extension = path.extname(target);
      const type = {'.js':'text/javascript','.css':'text/css','.json':'application/json','.html':'text/html','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.xml':'application/xml'}[extension] ?? 'application/octet-stream';
      response.writeHead(200, {'Content-Type': type,'Cache-Control':'no-store'});
      response.end(bytes);
    } catch { response.writeHead(404); response.end('Not found'); }
  });
  await new Promise((resolve,reject) => {server.once('error',reject);server.listen(port, '127.0.0.1', resolve);});
  return { base: `http://127.0.0.1:${server.address().port}${basePath}`, close: () => new Promise(resolve => server.close(resolve)) };
}
