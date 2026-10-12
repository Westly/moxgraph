/** Explicit, bounded live smoke test: three public decks, no retries or saved bodies. */
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { setTimeout } from 'node:timers/promises';
import assert from 'node:assert/strict';
import { parseMoxfield, parseArchidekt } from '../src/imports/adapters.ts';
const cases = [
  ['moxfield', '3x55_3CFz060qxL2xac3NA', 'moxfield-v2-3x55_3CFz060qxL2xac3NA.json'],
  ['moxfield', 'zB7a13TqOUWlUZuylE905Q', 'moxfield-v2-zB7a13TqOUWlUZuylE905Q.json'],
  ['archidekt', '19780118', 'archidekt-19780118.json']
];
const perf = JSON.parse(await readFile('reports/performance-audit.json', 'utf8'));
const results = [];
for (const [provider, id, fixture] of cases) {
  if (results.length) await setTimeout(11000);
  const r = await fetch(`https://moxgraph-import-relay-probe.westlywhite.workers.dev/api/${provider}/${id}`, {
    headers: { Origin: 'http://localhost:3000', 'Accept-Encoding': 'identity' }, signal: AbortSignal.timeout(20000)
  });
  assert.equal(r.status, 200, r.ok ? 'success' : await r.text()); assert.equal(r.headers.get('Access-Control-Allow-Origin'), 'http://localhost:3000');
  const reader = r.body!.getReader(), chunks = []; let bytes = 0;
  for (;;) { const part = await reader.read(); if (part.done) break; bytes += part.value.length; if (bytes > 12*1024*1024) { await reader.cancel(); throw Error('oversize'); } chunks.push(part.value); }
  const body = Buffer.concat(chunks), parse = provider === 'moxfield' ? parseMoxfield : parseArchidekt;
  const deck = parse(JSON.parse(body.toString())), expected = parse(JSON.parse(await readFile(`tests/fixtures/import-feasibility/${fixture}`, 'utf8')));
  assert.deepEqual(deck.lines, expected.lines, `${provider} selected printings/quantities/sections changed from the captured fixture`);
  const p = perf.imports.find((p: {fixture: string}) => p.fixture === fixture);
  const estimatedMetadataTransferBytes = p.gzipMetadataBytes - p.providerFixtureGzipBytes + bytes;
  assert.ok(estimatedMetadataTransferBytes < 5*1024*1024);
  const result = { provider, fixture, observedAt: new Date().toISOString(), status: r.status, bodyBytes: bytes,
    headers: Object.fromEntries(['content-encoding','content-type','cache-control','access-control-allow-origin','access-control-expose-headers'].map(k => [k,r.headers.get(k)])),
    bodySha256: createHash('sha256').update(body).digest('hex'), selectedLinesEqualFixture: true, sourceRows: deck.lines.length,
    copies: deck.lines.reduce((n,l) => n+l.quantity,0), estimatedMetadataTransferBytes };
  results.push(result); console.log(JSON.stringify(result));
}
await writeFile('reports/relay-live-validation.json', JSON.stringify({wbs:'9.7', workerVersion: process.argv[2] ?? 'record separately',
  note:'Three anonymous requests, 11 seconds apart. Raw public response bodies are not saved. Combined metadata estimate adds full uncompressed live JSON to local static gzip measurements; production Pages transfer remains WBS 10.', results},null,2)+'\n');
