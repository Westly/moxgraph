// Local browser QA only. Uses the real app with an explicit, visible mock-provider toolbar.
// This entry point and all fixtures are excluded by the static release allowlist.
import { createServer } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
const server = await createServer({ server: { host: '127.0.0.1', port: 3001, strictPort: true }, plugins: [{
  name: 'local-acceptance-harness',
  configureServer(server) {
    server.middlewares.use('/__qa/export', async (req,res) => {
      if(req.method!=='POST'){res.statusCode=405;res.end();return;}
      const extension=req.headers['content-type']==='application/pdf'?'pdf':req.headers['content-type']==='text/csv'?'csv':null;
      if(!extension){res.statusCode=400;res.end();return;}
      try {
        const chunks=[];let size=0;
        for await(const chunk of req){size+=chunk.length;if(size>64*1024*1024)throw new Error('Too large');chunks.push(chunk);}
        await mkdir('data/staging/pdf-qa',{recursive:true});
        await writeFile(`data/staging/pdf-qa/browser-export.${extension}`,Buffer.concat(chunks));
        res.setHeader('Content-Type','text/plain');res.end(`Saved browser-export.${extension} (${size} bytes)`);
      }catch{res.statusCode=400;res.end('Could not capture QA file');}
    });
  },
  transformIndexHtml: { order: 'pre', handler(html) { return html.replace(/src="\/src\/app\.ts(?:\?[^"]*)?"/, 'src="/tests/browser/harness.ts"'); } }
}] });
await server.listen(); server.printUrls();
