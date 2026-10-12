import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseCsv, parseExport } from '../../src/imports/exports.ts';
import { parseArchidekt } from '../../src/imports/adapters.ts';
const read = (name: string) => readFileSync(`tests/fixtures/import-feasibility/${name}`,'utf8');
test('official Archidekt CSV preserves every selected printing, finish, quantity and reserved section', () => {
  const csv = parseExport(read('archidekt-official.csv'),'archidekt-csv');
  const api = parseArchidekt(JSON.parse(read('archidekt-19780118.json')));
  const normalized = (deck: typeof csv) => deck.lines.map(l=>JSON.stringify([l.scryfallId,l.setCode,l.collectorNumber,l.quantity,l.rawFinish,l.section])).sort();
  assert.equal(csv.lines.length,114); assert.deepEqual(normalized(csv), normalized(api));
  assert.equal(csv.lines[0]!.name,'"Name Sticker" Goblin');
  assert.ok(csv.lines.some(l=>l.collectorNumber==='162★'));
});
test('Moxfield text keeps 87 rows/100 copies, with language, UUID and section omissions explicit', () => {
  const deck = parseExport(read('moxfield-official-orzhov.txt'),'moxfield-text');
  assert.equal(deck.lines.length,87);assert.equal(deck.lines.reduce((n,l)=>n+l.quantity,0),100);
  assert.ok(deck.lines.every(l=>l.language===null && l.scryfallId===null && l.section==='imported'));
  assert.equal(deck.lines.find(l=>l.name==='Vampiric Tutor')!.collectorNumber,'100');
  assert.equal(deck.lines.find(l=>l.name==='Arcane Signet')!.finish,'etched');
  assert.throws(()=>parseExport('1 Sol Ring','moxfield-text'),/not in Moxfield/);
});
test('CSV quoting, BOM, malformed columns and wrong-format files fail explicitly', () => {
  assert.deepEqual(parseCsv('a,b\r\n"x,y","a""b"\r\n"multi\nline",z'),[['a','b'],['x,y','a"b'],['multi\nline','z']]);
  assert.equal(parseExport('\uFEFF'+read('archidekt-official.csv'),'archidekt-csv').lines.length,114);
  assert.throws(()=>parseExport('Quantity,Name\n1,Sol Ring','archidekt-csv'),/Scryfall ID/);
  assert.throws(()=>parseExport(read('archidekt-official.csv')+'1,broken','archidekt-csv'),/columns/);
  assert.throws(()=>parseExport('{}','moxfield-v2'),/v2 snapshot/);
});
