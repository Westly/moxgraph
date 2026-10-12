import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { archSection, parseArchidekt, parseMoxfield } from '../../src/imports/adapters.ts';
import { ImportClient, RELAY } from '../../src/imports/transport.ts';
import { ImportError } from '../../src/imports/types.ts';
import { parseDeckUrl } from '../../src/imports/url.ts';
const fixture = (name: string) => JSON.parse(readFileSync(`tests/fixtures/import-feasibility/${name}`, 'utf8'));
const soldiersName = 'moxfield-v2-3x55_3CFz060qxL2xac3NA.json';
const source = parseDeckUrl('https://moxfield.com/decks/3x55_3CFz060qxL2xac3NA');
test('provider fixtures preserve selected row quantities, identifiers, sections, languages and finishes', () => {
  for (const [name, rows, copies] of [[soldiersName,111,{mainboard:100,commanders:1,sideboard:8,maybeboard:30}],['moxfield-v2-zB7a13TqOUWlUZuylE905Q.json',126,{mainboard:99,commanders:1,maybeboard:39}]] as const) {
    const raw = fixture(name), deck = parseMoxfield(raw);
    assert.equal(deck.lines.length, rows);
    for (const [section, total] of Object.entries(copies)) assert.equal(deck.lines.filter(l=>l.section===section).reduce((n,l)=>n+l.quantity,0), total);
    for (const line of deck.lines) {
      const row = raw[line.section][line.sourceRowId];
      const selected = row.printingData?.length ? row.printingData[Number(line.key.slice(line.key.lastIndexOf('/')+1))] : row;
      const card = selected.card;
      assert.equal(line.scryfallId,card.scryfall_id); assert.equal(line.sourcePrintingId,card.id);
      assert.equal(line.language,card.lang); assert.equal(line.collectorNumber,card.cn); assert.equal(line.rawFinish,selected.finish); assert.equal(line.quantity,selected.quantity);
    }
    assert.ok(deck.notices.some(n=>n.includes('token suggestions'))); assert.equal(deck.lines.filter(l=>l.section==='tokens').length,0);
  }
  const raw = fixture('archidekt-19780118.json'), deck = parseArchidekt(raw);
  assert.equal(deck.lines.length,114);
  for (const line of deck.lines) {
    const row = raw.cards.find((r: {id:number})=>String(r.id)===line.sourceRowId);
    assert.equal(line.scryfallId,row.card.uid);assert.equal(line.sourcePrintingId,String(row.card.id)); assert.deepEqual(line.categories,row.categories);assert.equal(line.language,null);
  }
  assert.equal(deck.lines.filter(l=>l.section==='commanders').length,2); assert.equal(deck.lines.filter(l=>l.section==='sideboard').length,14);
});
test('Moxfield children never inherit parent printing; inconsistent totals reject the whole snapshot', () => {
  const broken = fixture('moxfield-v2-SbEkgxN4CEqiCG5B94rkkg.json');
  assert.throws(()=>parseMoxfield(broken), (e: unknown)=>e instanceof ImportError && e.code==='quantity');
  const island = structuredClone(broken.mainboard.Island);
  const isolated = { publicId:source.id,name:'Synthetic child isolation',mainboard:{Island:island},mainboardCount:5 };
  const lines = parseMoxfield(isolated).lines;
  assert.equal(lines.length,5);assert.equal(lines[0]!.language,'ja');assert.notEqual(lines[0]!.scryfallId,island.card.scryfall_id);
  delete island.printingData[0].card;
  const missing = parseMoxfield(isolated).lines[0]!;
  assert.equal(missing.scryfallId,null); assert.ok(missing.issues.length);
  island.printingData[0].quantity=2;assert.throws(()=>parseMoxfield(isolated), /inconsistent quantities/);
});
test('Archidekt categories count each row once and retain ambiguous inclusion for review', () => {
  assert.deepEqual(archSection(['Sideboard','Creature'],[{name:'Sideboard',included:true},{name:'Creature',included:true}]),{section:'sideboard',issues:[]});
  assert.equal(archSection(['Commander','Sideboard'],[]).section,'section_review');
  assert.equal(archSection(['Wishlist'],[{name:'Wishlist',included:false}]).section,'outside');
  assert.equal(archSection(['Custom'],null).section,'section_review');
  const raw=fixture('archidekt-19780118.json');raw.cards.push(raw.cards[0]); assert.throws(()=>parseArchidekt(raw),/Duplicate source/);
});
test('relay client requests only its fixed route, omits credentials, and honors retry cooldowns without retries', async () => {
  let now=100000, calls=0;
  const client = new ImportClient(async function(this:unknown, url, init) {assert.equal(this,undefined,'browser fetch must not be bound to the client instance');calls++;assert.equal(String(url),`${RELAY}/api/moxfield/${source.id}`);assert.equal(init?.credentials,'omit');assert.equal(init?.redirect,'error');return new Response('{}',{status:429,headers:{'Retry-After':'120'}});},()=>now);
  await assert.rejects(client.load(source,new AbortController().signal),(e:unknown)=>e instanceof ImportError && e.retryAt===220000);
  now+=60000;await assert.rejects(client.load(source,new AbortController().signal),/wait/); assert.equal(calls,1);
});
test('relay error, malformed JSON, identity mismatch and cancellation leave no accepted snapshot', async () => {
  for (const status of [404,403,502,503]) {const client=new ImportClient(async()=>new Response('',{status}));await assert.rejects(client.load(source,new AbortController().signal));}
  const bad=new ImportClient(async()=>new Response('not json',{headers:{'Content-Type':'application/json'}}));await assert.rejects(bad.load(source,new AbortController().signal),/invalid JSON/);
  const raw=fixture(soldiersName);raw.publicId='zB7a13TqOUWlUZuylE905Q';assert.throws(()=>parseMoxfield(raw,source),/different deck/);
  const controller=new AbortController();
  const client=new ImportClient(async()=>{controller.abort(); throw new Error('aborted');});
  await assert.rejects(client.load(source,controller.signal),(e:unknown)=>e instanceof ImportError && e.code==='cancelled');
});
