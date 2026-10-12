/** Offline execution of the real importer; measures every requested asset, including repeats. */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import os from 'node:os';
import assert from 'node:assert/strict';
import { Catalogue } from '../src/data/catalogue.ts';
import { parseMoxfield, parseArchidekt } from '../src/imports/adapters.ts';
import { resolveDeck, selectResults } from '../src/imports/match.ts';

const fixtures = ['moxfield-v2-3x55_3CFz060qxL2xac3NA.json', 'moxfield-v2-zB7a13TqOUWlUZuylE905Q.json', 'archidekt-19780118.json'];
const liveBodies = JSON.parse(await readFile('reports/import-relay-http-audit.json','utf8')) as {deckId:string; bodyBytes:number; observedAt:string}[];
const results = [];
for (const fixture of fixtures) {
  const requests: { path: string; decodedBytes: number; gzipBytes: number }[] = [];
  const fileFetch: typeof fetch = async input => {
    const path = new URL(String(input)).pathname, bytes = await readFile(`public${path}`);
    requests.push({ path, decodedBytes: bytes.length, gzipBytes: gzipSync(bytes).length });
    return new Response(bytes, { headers: { 'Content-Type': 'application/json' } });
  };
  const source = await readFile(`tests/fixtures/import-feasibility/${fixture}`);
  const deck = fixture.startsWith('moxfield') ? parseMoxfield(JSON.parse(source.toString())) : parseArchidekt(JSON.parse(source.toString()));
  const start = performance.now(), catalogue = await Catalogue.open('https://audit.test/data/', fileFetch), directory = await catalogue.event();
  const result = await resolveDeck(deck, catalogue, directory, new AbortController().signal);
  const offlineResolveMs = performance.now() - start;
  const samples = []; for (let i = 0; i < 100; i++) { const t = performance.now(); selectResults(result, new Set(['mainboard', 'commanders']), '', i % 2 ? 'artist' : 'copies'); samples.push(performance.now() - t); }
  samples.sort((a,b) => a-b);
  assert.ok(requests.every(r => /\/(active|manifest|event)\.json$|\/printings\/[0-9a-f]{3}\.json$/.test(r.path)), 'Unexpected whole-catalogue/artist-index request');
  const sum = (field: 'decodedBytes' | 'gzipBytes') => requests.reduce((n, r) => n+r[field], 0);
  // Network budget counts encoded metadata, including bootstrap and public provider JSON.
  const encoded = sum('gzipBytes') + gzipSync(source).length;
  const live = liveBodies.find(p => fixture.includes(p.deckId)); assert.ok(live, 'Missing full provider-body measurement');
  // The relay now sends identity encoding: include the full observed provider
  // response, not the compressed/minimized fixture. This is a dated estimate.
  const estimatedMetadataTransferBytes = sum('gzipBytes') + live.bodyBytes;
  assert.ok(estimatedMetadataTransferBytes < 5*1024*1024, `${fixture} exceeds 5 MiB encoded metadata budget`);
  results.push({ fixture, allSectionsIncluded: true, rows: deck.lines.length, copies: deck.lines.reduce((n,l) => n+l.quantity,0), requests: requests.length,
    distinctAssets: new Set(requests.map(r => r.path)).size, decodedMetadataBytes: sum('decodedBytes') + source.length,
    gzipMetadataBytes: encoded, providerFixtureDecodedBytes: source.length, providerFixtureGzipBytes: gzipSync(source).length,
    fullProviderBodyObservation: { bytes: live.bodyBytes, observedAt: live.observedAt, source: 'reports/import-relay-http-audit.json' }, estimatedMetadataTransferBytes,
    offlineResolveMs, selectorP95Ms: samples[94], selectorMaxMs: samples[99], assets: requests });
}
const shell = ['index.html', ...(await readdir('dist/assets')).filter(p => /\.(js|css)$/.test(p)).map(p => `assets/${p}`)];
const assets = await Promise.all(shell.map(async path => { const b = await readFile(`dist/${path}`); return { path, decodedBytes: b.length, gzipBytes: gzipSync(b).length }; }));
const shellGzipBytes = assets.reduce((n,a) => n+a.gzipBytes,0); assert.ok(shellGzipBytes <= 250*1024);
const report = { wbs: '9.5', generatedAt: new Date().toISOString(), device: { platform: os.platform(), arch: os.arch(), release: os.release(), cpu: os.cpus()[0]?.model, node: process.version },
  method: 'Actual Catalogue fetch calls against local immutable files; per-response gzip level 6, including duplicate requests. Not WAN timing. Budget estimate combines static gzip with full uncompressed provider bodies measured on 2026-10-11, separately from minimized fixtures. Recheck actual Pages encoding/transfer in WBS 10. Browser render timings are recorded in browser QA.',
  budgets: { shellGzipBytes: 250*1024, metadataGzipBytes: 5*1024*1024, cachedSortMs: 100 }, shellGzipBytes, shell: assets, imports: results };
await writeFile('reports/performance-audit.json', JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({ shellGzipBytes, imports: results.map(({ assets, ...r }) => r) },null,2));
