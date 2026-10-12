import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {checkHeaders, checkPublishedText, checkRelayConfig, checkPortablePath} from '../scripts/release-policy.mjs';

test('static paths survive Windows Git checkout, including Conflux', () => {
  for (const path of ['tuples/con.json', 'assets/CON.js', 'brand/nul.png', 'data/com1/file.json']) assert.throws(() => checkPortablePath(path), /reserved filename/);
  checkPortablePath('tuples/set-con.json');
});
test('release rejects widened CSP, missing protection and secret/test-fixture leakage', async () => {
  const headers = await readFile('public/_headers','utf8'); checkHeaders(headers);
  for (const bad of [headers.replace("script-src 'self'", "script-src 'self' 'unsafe-inline'"), headers.replace("connect-src 'self'", "connect-src *"), headers.replace('DENY','SAMEORIGIN')]) assert.throws(() => checkHeaders(bad));
  for (const content of ['ghp_'+'a'.repeat(36), '-----BEGIN PRIVATE KEY-----', 'zB7a13TqOUWlUZuylE905Q', 'Local WBS 9 QA']) assert.throws(() => checkPublishedText(content,'assets/app.js'));
  assert.throws(() => checkPublishedText('<svg onload="bad()">','brand/logo.svg'));
  checkPublishedText('Moxgraph — https://moxgraph.com','index.html');
});
test('relay boundary rejects paid/storage bindings, logging, CPU/rate expansion and removed throttles', async () => {
  const config = JSON.parse(await readFile('tools/import-relay/wrangler.jsonc','utf8')); checkRelayConfig(config);
  for (const bad of [ {...config, r2_buckets:[{binding:'UNPLANNED'}]}, {...config, observability:{enabled:true}}, {...config, limits:{cpu_ms:1000}}, {...config, ratelimits:[]}, {...config, kv_namespaces:[]} ]) assert.throws(() => checkRelayConfig(bad));
});
