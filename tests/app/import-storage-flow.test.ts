import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { IDBFactory } from 'fake-indexeddb';
import { Catalogue } from '../../src/data/catalogue.ts';
import { ImportClient } from '../../src/imports/transport.ts';
import { parseDeckUrl } from '../../src/imports/url.ts';
import { resolveDeck, selectResults } from '../../src/imports/match.ts';
import { LocalDatabase, LibrarySession } from '../../src/storage/database.ts';
import { createEntry, refreshEntry } from '../../src/storage/model.ts';
import { exportBackup, importBackup, packLibrary } from '../../src/storage/codec.ts';

const fileFetch: typeof fetch = async url => new Response(await readFile(`public${new URL(String(url)).pathname}`), { headers: { 'Content-Type': 'application/json' } });
const json = (value: unknown) => new Response(JSON.stringify(value), { headers: { 'Content-Type': 'application/json' } });
const source = parseDeckUrl('https://moxfield.com/decks/zB7a13TqOUWlUZuylE905Q');
const fixture = JSON.parse(await readFile(`tests/fixtures/import-feasibility/moxfield-v2-${source.id}.json`, 'utf8'));
const signal = () => new AbortController().signal;

test('transport → adapter → exact matching → transactional storage → changed-print refresh → backup/reopen', async () => {
  const c = await Catalogue.open('https://fixture.test/data/', fileFetch), d = await c.event();
  const factory = new IDBFactory(), db = await LocalDatabase.open(factory), session = new LibrarySession(db);
  session.value = await db.read();
  const load = async (raw: unknown) => new ImportClient(async () => json(raw)).load(source, signal());
  const first = createEntry(await resolveDeck(await load(fixture), c, d, signal()));
  assert.equal(selectResults(first.result, new Set(['mainboard', 'commanders']), '', 'artist').copies, 34);
  assert.ok(await session.commit({ decks: [first], selectedId: first.id, view: 'results' }));
  const before = JSON.stringify(packLibrary(session.value));
  // Deterministic provider faults traverse the real client and never reach commit.
  for (const status of [404, 429, 500, 503]) {
    const client = new ImportClient(async () => new Response('', { status }));
    await assert.rejects(client.load(source, signal()));
    assert.equal(JSON.stringify(packLibrary(await db.read())), before);
  }
  const changed = structuredClone(fixture);
  // Synthetic provider revision using a real captured print: replace only Teysa's selection.
  const old = changed.commanders['Teysa Karlov'];
  assert.ok(old && !old.printingData?.length);
  old.card = { ...old.card, id: 'synthetic-changed-provider-id', scryfall_id: 'bcfaa19e-995e-447d-a0a2-46e5d117d5ec', set: 'rna', cn: '212', lang: 'en' };
  old.finish = 'nonFoil';
  const next = await refreshEntry(first, await load(changed), c, d, signal());
  const a = first.result.lines.find(r => r.line.name === 'Teysa Karlov')!, b = next.result.lines.find(r => r.line.name === 'Teysa Karlov')!;
  assert.notEqual(a.printing!.id, b.printing!.id);
  assert.equal(b.printing!.sourceArtistCredit, 'Magali Villeneuve'); assert.notDeepEqual(a.printing!.artistIds, b.printing!.artistIds);
  assert.equal(a.matches.length, 0); assert.equal(b.matches.length, 0); // Neither artist is listed at Atlanta.
  assert.ok(await session.commit({ decks: [first, { ...next, id: crypto.randomUUID(), title: 'Changed printing copy' }], selectedId: first.id, view: 'results' }));
  const backup = await exportBackup(session.value), restored = await importBackup(backup);
  assert.equal(restored.decks.length, 2); assert.ok(await session.commit(restored)); db.close();
  const restarted = await LocalDatabase.open(factory);
  assert.deepEqual(packLibrary(await restarted.read()), packLibrary(restored)); restarted.close();
});
