/** Real workerd rate-limit bindings with an in-memory provider; no external calls. */
import { Miniflare, Response, convertV4MiniflareOptions } from 'miniflare';
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const config = JSON.parse(await readFile('tools/import-relay/wrangler.jsonc', 'utf8'));
let providerCalls = 0;
let payload = '{"fixture":true}';
const mf = new Miniflare(convertV4MiniflareOptions({
  modules: [
    { type: 'ESModule', path: 'audit-entry.mjs', contents: 'import worker from "./worker.mjs"; export default worker;' },
    { type: 'ESModule', path: 'worker.mjs', contents: await readFile('tools/import-relay/worker.mjs', 'utf8') }
  ], compatibilityDate: config.compatibility_date,
  cf: false, telemetry: { enabled: false },
  ratelimits: Object.fromEntries(config.ratelimits.map(({ name, ...value }) => [name, value])),
  outboundService: async () => { providerCalls++; return new Response(payload, { headers: { 'Content-Type': 'application/json' } }); }
}));
try {
  const statuses = [];
  for (let i = 0; i < 3; i++) {
    const r = await mf.dispatchFetch('https://relay.test/api/archidekt/19780118', { headers: { 'CF-Connecting-IP': '192.0.2.7', Origin: 'https://moxgraph.com' } });
    statuses.push(r.status); await r.text();
    if (i === 2) assert.equal(r.headers.get('Retry-After'), '60');
  }
  assert.deepEqual(statuses, [200, 200, 429]); assert.equal(providerCalls, 2);
  payload = JSON.stringify({ fixture: 'α'.repeat(300000), tail: 'end-of-last-partial-batch' });
  const large = await mf.dispatchFetch('https://relay.test/api/archidekt/19780118', { headers: { 'CF-Connecting-IP': '192.0.2.8' } });
  assert.equal(large.status, 200); assert.equal(await large.text(), payload);
  const report = { wbs: '9.7', observedAt: new Date().toISOString(), runtime: 'Miniflare/workerd', externalRequests: 0, statuses, burstProviderCalls: 2,
    nativeBatchRoundTrip: { bytes: Buffer.byteLength(payload), identical: true }, totalMockProviderCalls: providerCalls,
    note: 'Actual local rate-limit bindings and native BYOB stream; mocked provider. Cloudflare counters are colo-local and eventually consistent.' };
  await writeFile('reports/relay-local-validation.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally { await mf.dispose(); }
