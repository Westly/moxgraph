import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Catalogue } from '../../src/data/catalogue.ts';
import { parseMoxfield, parseArchidekt, makeLine } from '../../src/imports/adapters.ts';
import { parseExport } from '../../src/imports/exports.ts';
import { resolveLine } from '../../src/imports/resolve.ts';
const fixture = async (name: string) => JSON.parse(await readFile(`tests/fixtures/import-feasibility/${name}`,'utf8'));
const fileFetch: typeof fetch = async url => {
  try {return new Response(await readFile(`public${new URL(String(url)).pathname}`),{headers:{'Content-Type':'application/json'}});}catch{return new Response('',{status:404});}
};
export const openCatalogue = () => Catalogue.open('https://local.test/data/',fileFetch);
test('all 351 selected owner/Archidekt lines resolve exactly, with only the guarded legacy alias', async () => {
  const catalogue=await openCatalogue();let exact=0,alias=0;
  for (const [name,parser] of [['moxfield-v2-3x55_3CFz060qxL2xac3NA.json',parseMoxfield],['moxfield-v2-zB7a13TqOUWlUZuylE905Q.json',parseMoxfield],['archidekt-19780118.json',parseArchidekt]] as const) {
    const deck=parser(await fixture(name));
    for (const line of deck.lines) {
      const result=await resolveLine(line,deck.provider,catalogue);
      if (result.status==='alias') {alias++;assert.equal(line.scryfallId,'f0deab39-dfa3-4652-a05f-b221b979009a');assert.equal(result.printing!.collectorNumber,'1F★');assert.equal(result.printing!.sourceArtistCredit,'Gaboleps');assert.ok(result.reason);}
      else {assert.equal(result.status,'exact',`${line.name}: ${result.reason}`);assert.equal(result.printing!.id,line.scryfallId);exact++;}
    }
  }
  assert.equal(exact,350);assert.equal(alias,1);
});
test('source conflicts, unknown IDs and incomplete tuples never borrow another printing', async () => {
  const catalogue=await openCatalogue(), deck=parseMoxfield(await fixture('moxfield-v2-zB7a13TqOUWlUZuylE905Q.json'));
  const signet=deck.lines.find(l=>l.name==='Arcane Signet')!;
  assert.equal((await resolveLine({...signet,sourcePrintingId:'other'},'moxfield',catalogue)).status,'unknown');
  assert.equal((await resolveLine({...signet,finish:'foil'},'moxfield',catalogue)).status,'unknown');
  const vampire=deck.lines.find(l=>l.name==='Vampiric Tutor')!;
  assert.equal((await resolveLine({...vampire,language:'en'},'moxfield',catalogue)).status,'conflict');
  const unknown=await resolveLine({...vampire,scryfallId:'00000000-0000-0000-0000-000000000000'},'moxfield',catalogue);
  assert.equal(unknown.status,'unknown'); assert.equal(unknown.printing,null);
  assert.equal((await resolveLine(makeLine({key:'no-id',name:'Sol Ring',quantity:1,section:'mainboard'}),'moxfield',catalogue)).status,'unknown');
});
test('all 87 language-less export rows remain reviewable, including unique-language tuples', async () => {
  const catalogue=await openCatalogue(),deck=parseExport(await readFile('tests/fixtures/import-feasibility/moxfield-official-orzhov.txt','utf8'),'moxfield-text');
  let ambiguous=0,unknown=0;
  for(const line of deck.lines){const result=await resolveLine(line,deck.provider,catalogue);if(result.status==='ambiguous')ambiguous++;else if(result.status==='unknown')unknown++;else assert.fail(result.status);}
  assert.equal(ambiguous,86);assert.equal(unknown,1);
});
