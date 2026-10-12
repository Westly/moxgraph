// Local-only production build preview with the checked _headers and actual gzip transfer.
import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
const root = path.resolve('dist');
const headerText = await readFile(path.join(root,'_headers'),'utf8');
const rules=[]; let rule;
for (const line of headerText.split(/\r?\n/)) {
  if (!line.trim()) continue;
  if (line.startsWith('/')) { rule={ path:line.trim(), headers:{} }; rules.push(rule); }
  else { const i=line.indexOf(':'); rule.headers[line.slice(0,i).trim()]=line.slice(i+1).trim(); }
}
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon'};
http.createServer(async (req,res) => {
  try {
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
    const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=path.resolve(root,'.'+(p==='/'?'/index.html':p));
    if (!file.startsWith(root+path.sep)) { res.writeHead(403).end(); return; }
    const content=await readFile(file), type=mime[path.extname(file)]??'application/octet-stream';
    const headers={'Content-Type':type,'Vary':'Accept-Encoding'};
    for (const r of rules) {
      const pattern='^'+r.path.replace(/[.+?^${}()|[\]\\]/g,'\\$&').replace(/:version/g,'[^/]+').replace(/\*/g,'.*')+'$';
      if (new RegExp(pattern).test(p)) Object.assign(headers,r.headers);
    }
    const body=/gzip/.test(req.headers['accept-encoding']??'') && /text|json|svg/.test(type) ? gzipSync(content) : content;
    if (body!==content) headers['Content-Encoding']='gzip';
    headers['Content-Length']=String(body.length);res.writeHead(200,headers); res.end(req.method==='HEAD'?undefined:body);
  } catch { res.writeHead(404,{'Content-Type':'text/plain'}).end('Not found'); }
}).listen(3000,'localhost',()=>console.log('Static release QA with CSP and gzip: http://localhost:3000'));
