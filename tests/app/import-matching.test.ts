import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Catalogue } from '../../src/data/catalogue.ts';
import { parseMoxfield, parseArchidekt, makeLine } from '../../src/imports/adapters.ts';
import { matchLine, resolveDeck, selectResults } from '../../src/imports/match.ts';
import type { CardPrinting, EventDirectory } from '../../src/models/contracts.ts';
import type { ResolvedLine } from '../../src/imports/types.ts';
const fileFetch: typeof fetch = async url => new Response(await readFile(`public${new URL(String(url)).pathname}`),{headers:{'Content-Type':'application/json'}});
const catalogue = () => Catalogue.open('https://local.test/data/',fileFetch);
test('real full decks join only their selected IDs; digital printing is retained but not a physical copy', async () => {
  const c = await catalogue(), directory = await c.event();
  for (const [file, parser] of [['moxfield-v2-3x55_3CFz060qxL2xac3NA.json',parseMoxfield],['moxfield-v2-zB7a13TqOUWlUZuylE905Q.json',parseMoxfield],['archidekt-19780118.json',parseArchidekt]] as const) {
    const deck = parser(JSON.parse(await readFile(`tests/fixtures/import-feasibility/${file}`,'utf8')));
    const result = await resolveDeck(deck,c,directory,new AbortController().signal);
    for (const r of result.lines) for (const m of r.matches) {
      const mapping = directory.mappings.find(a=>a.attendanceId===m.attendanceId)!;
      assert.ok([...r.printing!.artistIds,...r.printing!.faces.flatMap(f=>f.artistIds)].some(id=>mapping.sourceArtistIds.includes(id)), r.line.name);
    }
    const all = selectResults(result,new Set(deck.lines.map(l=>l.section)),'','artist');
    assert.ok(all.copies <= deck.lines.reduce((n,l)=>n+l.quantity,0));
    const digital = result.lines.find(r=>r.printing?.id==='fd1442b4-da59-4042-835f-143c8dcaa73b');
    if(digital){assert.equal(digital.status,'exact');assert.equal(digital.printing!.paper,false);assert.ok(!all.matched.includes(digital));}
    const signet = result.lines.find(r=>r.status==='alias');
    if(signet) assert.equal(signet.matches.length,0);
  }
});
test('synthetic joint/face credits count one physical line across two artists and do not split ambiguous names', async () => {
  const c = await catalogue(), original = await c.event();
  const directory: EventDirectory = {...original, attendance: original.attendance.slice(0,2), mappings: original.mappings.filter(m=>original.attendance.slice(0,2).some(a=>a.mappingId===m.id))};
  const [a,b] = directory.mappings;
  const found = await c.lookupPrinting('fd1442b4-da59-4042-835f-143c8dcaa73b');assert.equal(found.status,'found');if(found.status!=='found') return;
  // Synthetic paper record isolates multi-artist and face attribution behavior.
  const printing: CardPrinting = {...found.printing,paper:true,artistIds:[a!.sourceArtistIds[0]!,b!.sourceArtistIds[0]!],sourceArtistCredit:'Joint credit',faces:[{index:0,name:'Face A',oracleId:null,sourceArtistCredit:a!.magicconNames[0]!,artistIds:[a!.sourceArtistIds[0]!],illustrationId:null,imageUrl:null},{index:1,name:'Face B',oracleId:null,sourceArtistCredit:b!.magicconNames[0]!,artistIds:[b!.sourceArtistIds[0]!],illustrationId:null,imageUrl:null}]};
  const row: ResolvedLine = {line:makeLine({key:'joint',name:'Joint card',quantity:3,section:'mainboard'}),printing,status:'exact',reason:null,candidates:[],matches:[],attendanceState:'unresolved'};
  const matched = matchLine(row,directory);assert.equal(matched.matches.length,2);assert.deepEqual(matched.matches[0]!.faceIndexes,[0]);assert.deepEqual(matched.matches[1]!.faceIndexes,[1]);
  const deck = {provider:'moxfield',source:null,title:'Synthetic',format:'moxfield-v2',importedAt:new Date().toISOString(),sourceUpdatedAt:null,sourceVersion:null,lines:[row.line],notices:[]} as const;
  const selected=selectResults({deck:{...deck,lines:[row.line],notices:[]},lines:[matched],directory,dataVersion:'test',cardSnapshotId:'test',eventSnapshotId:'test'},new Set(['mainboard']),'','artist');
  assert.equal(selected.copies,3);assert.equal(selected.sourceLines,1);assert.equal(selected.printings,1);assert.equal(selected.groups.reduce((n,g)=>n+g.lines.reduce((x,r)=>x+r.line.quantity,0),0),6);
  const noIDs={...printing,artistIds:[],faces:[],sourceArtistCredit:'Unreviewed One & Unreviewed Two'};
  assert.equal(matchLine({...row,printing:noIDs},directory).attendanceState,'artist_unmapped');
  const exactName=Object.values(a!.scryfallNames).flat()[0]!;
  assert.equal(matchLine({...row,printing:{...noIDs,sourceArtistCredit:exactName}},directory).matches.length,1);
  assert.equal(matchLine({...row,printing:{...noIDs,sourceArtistCredit:null}},directory).attendanceState,'credit_missing');
  assert.equal(matchLine({...row,printing:null},directory).matches.length,0);
});
test('cancellation rejects the transaction instead of returning a partial deck', async () => {
  const c=await catalogue(),d=await c.event(),controller=new AbortController();controller.abort();
  const deck=parseMoxfield(JSON.parse(await readFile('tests/fixtures/import-feasibility/moxfield-v2-zB7a13TqOUWlUZuylE905Q.json','utf8')));
  await assert.rejects(resolveDeck(deck,c,d,controller.signal),{name:'AbortError'});
});
