import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Catalogue } from '../../src/data/catalogue.ts';
import { makeLine } from '../../src/imports/adapters.ts';
import { resolveLine } from '../../src/imports/resolve.ts';
import { matchLine } from '../../src/imports/match.ts';
import { printingImages } from '../../src/ui/deck.ts';

const fileFetch: typeof fetch = async url => new Response(await readFile(`public${new URL(String(url)).pathname}`), { headers: { 'Content-Type': 'application/json' } });
const c = await Catalogue.open('https://fixture.test/data/', fileFetch), directory = await c.event();
const captured = JSON.parse(await readFile('tests/fixtures/artist-counting.json', 'utf8')).cards;

test('real same-set Heliod variants change attendance; tuple, language, finish and image retain the selected edition', async () => {
  for (const [key, expected] of [['heliod_regular', 0], ['heliod_constellation', 1], ['heliod_regular_ja', 0]] as const) {
    const card = captured[key];
    for (const finish of ['nonfoil', 'foil'] as const) {
      const line = makeLine({ key, name: card.name, quantity: 1, section: 'mainboard', setCode: card.set, collectorNumber: card.collector_number, language: card.lang, finish });
      for (const scryfallId of [card.id, null]) {
        const row = matchLine(await resolveLine({ ...line, scryfallId }, 'moxfield', c), directory);
        assert.equal(row.status, 'exact'); assert.equal(row.printing!.id, card.id);
        assert.equal(row.matches.length, expected); assert.equal(row.line.finish, finish);
        assert.equal(row.printing!.sourceArtistCredit, card.artist);
        assert.equal(row.printing!.language, card.lang);
        assert.ok(printingImages(row.printing!).includes(card.id));
      }
    }
  }
});

test('synthetic conflicting names do not merge people and explicit artist IDs never fall back to another name', async () => {
  const found = await c.lookupPrinting(captured.heliod_constellation.id);
  assert.equal(found.status, 'found'); if (found.status !== 'found') return;
  const base = await resolveLine(makeLine({ key: 'synthetic', name: found.printing.name, quantity: 1, section: 'mainboard', scryfallId: found.printing.id }), 'moxfield', c);
  const original = directory.mappings.find(m => m.sourceArtistIds.includes(found.printing.artistIds[0]!))!;
  const other = directory.mappings.find(m => m.attendanceId !== original.attendanceId)!;
  const ambiguous = { ...directory, mappings: directory.mappings.map(m => m.id === other.id ? { ...m, scryfallNames: original.scryfallNames } : m) };
  const noIds = { ...found.printing, artistIds: [], faces: [] };
  assert.equal(matchLine({ ...base, printing: noIds }, ambiguous).attendanceState, 'artist_unmapped');
  assert.equal(matchLine({ ...base, printing: { ...noIds, artistIds: ['00000000-0000-0000-0000-000000000000'] } }, directory).matches.length, 0);
  const removed = { ...directory, attendance: directory.attendance.filter(a => a.id !== original.attendanceId) };
  assert.equal(matchLine(base, removed).matches.length, 0);
  assert.equal(base.printing!.id, captured.heliod_constellation.id);
});
