import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { IDBFactory, IDBObjectStore } from 'fake-indexeddb';
import { Catalogue } from '../../src/data/catalogue.ts';
import { parseMoxfield } from '../../src/imports/adapters.ts';
import { resolveDeck, matchLine } from '../../src/imports/match.ts';
import { parseDeckUrl } from '../../src/imports/url.ts';
import { LocalDatabase, LibrarySession, StorageConflictError } from '../../src/storage/database.ts';
import { createEntry, defaultFilters, emptyLibrary, mergeLibraries, recompute, sameSource, updatedEntry, refreshEntry } from '../../src/storage/model.ts';
import type { Library, SavedEntry } from '../../src/storage/model.ts';
import { checkedLibrary, exportBackup, importBackup, packEntry, packLibrary, unpackLibrary, MAX_BACKUP_BYTES } from '../../src/storage/codec.ts';

const fileFetch: typeof fetch = async url => new Response(await readFile(`public${new URL(String(url)).pathname}`), { headers: { 'Content-Type': 'application/json' } });
const c = await Catalogue.open('https://local.test/data/', fileFetch), directory = await c.event();
const imported = parseMoxfield(JSON.parse(await readFile('tests/fixtures/import-feasibility/moxfield-v2-zB7a13TqOUWlUZuylE905Q.json','utf8')));
const resolved = await resolveDeck(imported, c, directory, new AbortController().signal);
function sample(): Library {
  const entry = createEntry(structuredClone(resolved)); entry.title = 'Local Orzhov'; entry.filters = { sections: ['commanders','mainboard','maybeboard'], search: 'Rahn', sort: 'copies' };
  return { decks: [entry], selectedId: entry.id, view: 'results' };
}
const snapshot = (l: Library) => JSON.stringify(packLibrary(l));
const signal = () => new AbortController().signal;
async function legacy(factory: IDBFactory, value: unknown): Promise<IDBDatabase> {
  return new Promise((resolve,reject) => { const r = factory.open('legacy',1); r.onupgradeneeded = () => r.result.createObjectStore('decks',{keyPath:'id'}).put(value); r.onerror = () => reject(r.error); r.onsuccess = () => resolve(r.result); });
}

test('local save/reopen restores exact printing, Japanese card, guarded alias, name, filters and selection', async () => {
  const factory = new IDBFactory(), db = await LocalDatabase.open(factory), library = sample();
  assert.deepEqual(await db.read(), emptyLibrary()); await db.write(library); db.close();
  const restarted = await LocalDatabase.open(factory), actual = await restarted.read();
  assert.equal(snapshot(actual), snapshot(library));
  assert.ok(actual.decks[0]!.result.lines.some(r => r.printing?.language === 'ja'));
  assert.equal(actual.decks[0]!.result.lines.find(r => r.status === 'alias')!.printing!.collectorNumber, '1F★');
  await restarted.write(emptyLibrary()); assert.deepEqual(await restarted.read(), emptyLibrary()); restarted.close();
});
test('manual printing/finish/section and cached result survive backup round-trip, without saving derived matches', async () => {
  const library = sample(), e = library.decks[0]!, row = e.result.lines.find(r => r.printing?.finishes.includes('foil'))!;
  Object.assign(row, { status:'manual', manual: { selectedAt: new Date().toISOString(), section:'commanders', finish:'foil' } });
  e.result.lines = e.result.lines.map(r => matchLine(r, directory));
  const text = await exportBackup(library), actual = await importBackup(text);
  assert.equal(snapshot(actual), snapshot(library)); assert.ok(!text.includes('"matches":'));
  assert.equal(actual.decks[0]!.result.lines.find(r => r.line.key === row.line.key)!.manual!.section, 'commanders');
});
test('multiple decks preserve their list order, selected deck and distinct preferences across restart', async () => {
  const factory = new IDBFactory(), db = await LocalDatabase.open(factory), library = sample(), second = sample().decks[0]!;
  library.decks[0]!.id = 'ffffffff-ffff-ffff-ffff-ffffffffffff'; second.id = '00000000-0000-0000-0000-000000000000'; second.filters = defaultFilters();
  library.decks.push(second); library.selectedId = second.id;
  await db.read(); await db.write(library); db.close(); const reopened = await LocalDatabase.open(factory);
  assert.equal(snapshot(await reopened.read()),snapshot(library)); reopened.close();
});
test('backup validation rejects broken integrity, newer schemas, unsafe URLs, unknown fields, missing cache, duplicate IDs and limits', async () => {
  const library = sample(), text = await exportBackup(library);
  await assert.rejects(importBackup(text.replace('Local Orzhov','Changed Orzhov')));
  await assert.rejects(importBackup(text.replace('"version":2','"version":3')));
  await assert.rejects(importBackup('{not json}'));
  await assert.rejects(importBackup(' '.repeat(MAX_BACKUP_BYTES + 1)));
  const packed = packLibrary(library);
  const hostile = structuredClone(packed); hostile.decks[0]!.source.source!.url = 'javascript:alert(1)'; assert.throws(() => unpackLibrary(hostile));
  const image = structuredClone(packed); image.decks[0]!.cache.printings[0]!.imageUrl = 'javascript:alert(1)'; assert.throws(() => unpackLibrary(image));
  const missing = structuredClone(packed); missing.decks[0]!.cache.printings = []; assert.throws(() => unpackLibrary(missing));
  assert.throws(() => unpackLibrary({ ...packed, token:'never store credentials' }));
  assert.throws(() => unpackLibrary({ ...packed, decks:[packed.decks[0], packed.decks[0]] }));
  assert.throws(() => unpackLibrary({ ...packed, decks:Array(51).fill(packed.decks[0]) }));
  assert.throws(() => unpackLibrary({ ...packed, selectedId:crypto.randomUUID() }));
  const excessive = structuredClone(packed); excessive.decks[0]!.lines[0]!.source.quantity = 100001; assert.throws(() => unpackLibrary(excessive));
  const tooManyLines = structuredClone(packed); tooManyLines.decks[0]!.lines = Array(5001).fill(packed.decks[0]!.lines[0]); assert.throws(() => unpackLibrary(tooManyLines));
});
test('reimport keys by provider plus ID; merge keeps existing IDs and replace exactly adopts backup', () => {
  const library = sample(), incoming = sample(), entry = library.decks[0]!;
  assert.ok(sameSource(entry, incoming.decks[0]!.result));
  const different = structuredClone(entry.result); different.deck.source = parseDeckUrl('https://moxfield.com/decks/3x55_3CFz060qxL2xac3NA'); assert.equal(sameSource(entry, different), false);
  const sameId = structuredClone(library); sameId.decks[0]!.title = 'Backup title';
  assert.equal(mergeLibraries(library,sameId,'merge').decks[0]!.title, 'Local Orzhov');
  assert.equal(mergeLibraries(library,incoming,'merge').decks.length,2);
  assert.equal(snapshot(mergeLibraries(library,incoming,'replace')),snapshot(incoming));
  assert.equal(snapshot(mergeLibraries(emptyLibrary(),incoming,'merge')),snapshot({ ...incoming, view:'decks' }));
});
test('refresh preserves local preferences and manual choice only for identical source identity (quantity may change)', () => {
  const old = sample().decks[0]!, row = old.result.lines[0]!;
  row.status = 'manual'; row.manual = { selectedAt:new Date().toISOString(), section:'commanders', finish:null };
  const next = structuredClone(resolved); next.lines[0]!.line.quantity += 1;
  const refreshed = updatedEntry(old,next);
  assert.equal(refreshed.title, old.title); assert.deepEqual(refreshed.filters,old.filters);
  assert.deepEqual(refreshed.result.lines[0]!.manual,row.manual);
  next.lines[0]!.line.scryfallId = crypto.randomUUID();
  assert.equal(updatedEntry(old,next).result.lines[0]!.manual,undefined);
});
test('failed/cancelled refresh leaves the previous source, filters, timestamps and result untouched', async () => {
  const entry = sample().decks[0]!, original = JSON.stringify(entry);
  const failed = { lookupPrinting: async () => { throw new Error('Network failure'); }, lookupTuple: async () => { throw new Error('Network failure'); } } as unknown as Catalogue;
  await assert.rejects(refreshEntry(entry, imported, failed, directory, signal()));
  assert.equal(JSON.stringify(entry),original);
  const aborted = new AbortController(); aborted.abort(); await assert.rejects(refreshEntry(entry, imported, c, directory, aborted.signal));
  assert.equal(JSON.stringify(entry),original);
});
test('new event data recomputes attendance without changing printing; missing IDs stay pinned and recover', async () => {
  const entry = sample().decks[0]!, ids = entry.result.lines.map(r => r.printing?.id), noAttendance = { ...directory, attendance: [], mappings: [], statistics: [] };
  const updated = await recompute(entry,c,noAttendance,signal());
  assert.deepEqual(updated.result.lines.map(r => r.printing?.id),ids); assert.ok(updated.result.lines.every(r => r.matches.length === 0));
  assert.deepEqual(updated.filters,entry.filters);
  const missing = { manifest:{ ...c.manifest, version:'new-version' }, lookupPrinting:async (id:string) => ({status:'unknown',id}) } as unknown as Catalogue;
  const absent = await recompute(entry,missing,directory,signal());
  assert.ok(absent.result.lines.every(r => r.printing === null)); assert.deepEqual(absent.result.lines.map(r => r.selectedPrintingId),ids);
  const recovered = await recompute(absent,c,directory,signal()); assert.deepEqual(recovered.result.lines.map(r => r.printing?.id),ids);
  const restored = await importBackup(await exportBackup({decks:[absent],selectedId:absent.id,view:'results'}));
  assert.deepEqual(restored.decks[0]!.result.lines.map(r => r.selectedPrintingId),ids);
});
test('quota error after clear/partial puts aborts all five stores; in-memory result and backup remain usable', async () => {
  const factory = new IDBFactory(), db = await LocalDatabase.open(factory), original = sample(); await db.read(); await db.write(original);
  const session = new LibrarySession(db); session.value = original; const next = structuredClone(original); next.decks[0]!.title = 'Unsaved rename';
  const put = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function(...args: Parameters<typeof put>) { if (this.name === 'lines') throw new DOMException('Storage quota exhausted','QuotaExceededError'); return put.apply(this,args); };
  try { assert.equal(await session.commit(next),false); } finally { IDBObjectStore.prototype.put = put; }
  assert.equal(session.value.decks[0]!.title, 'Unsaved rename'); assert.ok(session.error);
  assert.equal(snapshot(await db.read()),snapshot(original));
  assert.equal((await importBackup(await exportBackup(session.value))).decks[0]!.title,'Unsaved rename');
  assert.equal(await session.commit(next),true); assert.equal(session.error,null); db.close();
});
test('denied/unavailable storage keeps new results in memory with a valid backup', async () => {
  const denied = { open: () => { throw new DOMException('Storage is denied','SecurityError'); } } as unknown as IDBFactory;
  await assert.rejects(LocalDatabase.open(denied),{name:'SecurityError'});
  const session = new LibrarySession(undefined), library = sample(); assert.equal(await session.commit(library),false);
  assert.equal(snapshot(await importBackup(await exportBackup(session.value))),snapshot(library));
});
test('serialized save followed by clear does not resurrect removed decks', async () => {
  const db = await LocalDatabase.open(new IDBFactory()); await db.read(); const session = new LibrarySession(db);
  const saving = session.commit(sample()), clearing = session.commit(emptyLibrary()); await Promise.all([saving,clearing]);
  assert.deepEqual(await db.read(),emptyLibrary()); assert.equal(session.pending,0); db.close();
});
test('another tab cannot silently overwrite a newer transaction', async () => {
  const factory = new IDBFactory(), a = await LocalDatabase.open(factory), b = await LocalDatabase.open(factory);
  await a.read(); await b.read(); const library = sample(); await a.write(library);
  await assert.rejects(b.write(emptyLibrary()),StorageConflictError); assert.equal(snapshot(await a.read()),snapshot(library)); a.close(); b.close();
});
test('version 1 migrates non-destructively into split stores with default filters', async () => {
  const factory = new IDBFactory(), entry = sample().decks[0]!, { filters: _filters, ...v1 } = packEntry(entry);
  const old = await legacy(factory,v1); old.close(); const db = await LocalDatabase.open(factory,'legacy'), actual = await db.read();
  assert.equal(actual.decks[0]!.title,entry.title); assert.deepEqual(actual.decks[0]!.filters,defaultFilters());
  assert.equal(actual.decks[0]!.result.lines.length,entry.result.lines.length); checkedLibrary(actual); db.close();
});
test('bad migration aborts without deleting v1 data; future schema is rejected', async () => {
  const factory = new IDBFactory(), bad = { id:crypto.randomUUID(), title:'Keep recoverable data' };
  const old = await legacy(factory,bad); old.close(); await assert.rejects(LocalDatabase.open(factory,'legacy'));
  const recovered = await new Promise<IDBDatabase>((resolve,reject) => { const r = factory.open('legacy',1); r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error); });
  assert.equal(recovered.version,1);
  const retained = await new Promise(resolve => { const r = recovered.transaction('decks').objectStore('decks').get(bad.id); r.onsuccess = () => resolve(r.result); });
  assert.deepEqual(retained,bad); recovered.close();
  const future = await new Promise<IDBDatabase>(resolve => { const r = factory.open('future',3); r.onsuccess=()=>resolve(r.result); }); future.close();
  await assert.rejects(LocalDatabase.open(factory,'future'),{name:'VersionError'});
});
test('a blocked upgrade returns an actionable error and leaves the existing database intact', async () => {
  const factory = new IDBFactory(), { filters: _filters, ...entry } = packEntry(sample().decks[0]!);
  const blocker = await legacy(factory,entry);
  await assert.rejects(LocalDatabase.open(factory,'legacy'),/holding the database open/); blocker.close();
});
