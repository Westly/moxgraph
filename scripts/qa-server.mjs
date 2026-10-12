// Local browser QA only. Uses the real app with an explicit, visible mock-provider toolbar.
// This entry point and all fixtures are excluded by the static release allowlist.
import { createServer } from 'vite';
const server = await createServer({ server: { host: 'localhost', port: 3001, strictPort: true }, plugins: [{
  name: 'local-acceptance-harness',
  transformIndexHtml: { order: 'pre', handler(html) { return html.replace(/src="\/src\/app\.ts(?:\?[^"]*)?"/, 'src="/tests/browser/harness.ts"'); } }
}] });
await server.listen(); server.printUrls();
