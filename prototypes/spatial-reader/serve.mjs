import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';

const port=Number(process.env.PORT??4174);
const assets=new Map([
  ['index.html','text/html; charset=utf-8'],
  ['review.html','text/html; charset=utf-8'],
  ['app.js','text/javascript; charset=utf-8'],
  ['data.js','text/javascript; charset=utf-8'],
  ['style.css','text/css; charset=utf-8'],
]);
const server=createServer(async(req,res)=>{
  try{
    if(!['GET','HEAD'].includes(req.method)){
      res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;
    }
    const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=path==='/'?'index.html':path.slice(1);
    if(!assets.has(file)){res.writeHead(404);res.end('Not found');return;}
    const bytes=await readFile(new URL(file,import.meta.url));
    res.writeHead(200,{'Content-Type':assets.get(file),'Content-Length':bytes.length,'Cache-Control':'no-store'});
    res.end(req.method==='HEAD'?undefined:bytes);
  }catch{
    res.writeHead(500);res.end('Unable to read prototype asset');
  }
});
server.on('error',error=>{console.error(error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`Prototype: http://localhost:${port}/review.html`));
process.on('SIGINT',()=>server.close(()=>process.exit(0)));
process.on('SIGTERM',()=>server.close(()=>process.exit(0)));
