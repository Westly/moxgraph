import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { artistCard, artistLinks, escapeHtml, externalLink, printingBadge } from '../../src/ui/components.ts';
import type { ArtistView } from '../../src/ui/components.ts';
import { decodePrinting, parseContract } from '../../src/models/boundaries.ts';
import demo from '../../src/demo/deck.json';
import reviewedLinks from '../../src/demo/artist-links.json';

const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const active = parseContract('ActiveManifest', read('public/data/active.json'));
const base = `public/data/${active.version}`;
const directory = parseContract('EventDirectory', read(`${base}/event.json`));
const links: Record<string, string> = reviewedLinks;

test('profile presentation keeps source identities, counts, and each usable published destination', () => {
  for (const attendance of directory.attendance) {
    const mapping = directory.mappings.find(item => item.id === attendance.mappingId)!;
    const view: ArtistView = { attendance, mapping, statistics: directory.statistics.find(item => item.artistKey === mapping.artistKeys[0]), scryfallUrl: links[attendance.guestId!] };
    const card = artistCard(view);
    const renderedLinks = artistLinks(view);
    assert.ok(card.includes(escapeHtml(attendance.rawName)));
    assert.ok(card.includes(`href="${escapeHtml(new URL(attendance.profileUrl).href)}"`));
    for (const sourceNames of Object.values(mapping.scryfallNames)) for (const name of sourceNames) assert.ok(card.includes(escapeHtml(name)));
    for (const link of attendance.links) if (link.displayUrl) assert.ok(renderedLinks.includes(`href="${escapeHtml(new URL(link.displayUrl).href)}"`), `${attendance.rawName}: ${link.label}`);
    for (const anchor of renderedLinks.matchAll(/<a\b[^>]*>/g)) {
      assert.match(anchor[0], /aria-label="[^"]+"/);
      assert.match(anchor[0], /title="[^"]+"/);
      assert.match(anchor[0], /rel="noopener noreferrer"/);
    }
  }
});

test('display rejects unsafe links and escapes untrusted source text', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'https://user:secret@example.com', 'not a URL']) assert.equal(externalLink(url, 'x', 'label'), '');
  assert.equal(escapeHtml('<img onerror="bad"> & \'quote\''), '&lt;img onerror=&quot;bad&quot;&gt; &amp; &#39;quote&#39;');
  const view: ArtistView = { attendance: { ...directory.attendance[0]!, rawName: '<script>alert(1)</script>', links: [{ ...directory.attendance[0]!.links[0]!, displayUrl: 'javascript:bad' }] }, mapping: directory.mappings[0]! };
  const html = artistCard(view);
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('javascript:'));
});

test('UI example retains nine selected source rows and exact baseline printings; not a full deck result', () => {
  assert.equal(demo.dataVersion, active.version);
  assert.equal(demo.lines.length, 9);
  const source = read(demo.sourceFixture);
  for (const line of demo.lines) {
    const printing = parseContract('CardPrinting', line.printing);
    const original = source[line.section][printing.name];
    assert.equal(original.card.scryfall_id, printing.id);
    assert.equal(original.quantity, line.quantity);
    assert.equal(original.finish === 'nonFoil' ? 'nonfoil' : original.finish, line.finish);
    const rows: unknown[] = read(`${base}/printings/${printing.id.slice(0, 3)}.json`);
    const exact = rows.map(decodePrinting).find(row => row.id === printing.id);
    assert.deepEqual(printing, exact);
    const attendee = directory.attendance.find(item => item.id === line.attendanceId)!;
    const mapping = directory.mappings.find(item => item.id === attendee.mappingId)!;
    assert.ok(printing.artistIds.some(id => mapping.sourceArtistIds.includes(id)));
    assert.ok(printing.finishes.includes(line.finish as 'foil' | 'nonfoil' | 'etched'));
    assert.ok(printingBadge(printing, line.finish).includes(escapeHtml(printing.collectorNumber)));
  }
});
