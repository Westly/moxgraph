import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { scryfallArtistUrl } from '../../src/ui/artist-url.ts';
import { resultDetail, resultRow } from '../../src/ui/deck.ts';
import { Catalogue } from '../../src/data/catalogue.ts';
import { parseMoxfield } from '../../src/imports/adapters.ts';
import { resolveDeck } from '../../src/imports/match.ts';
const fileFetch:typeof fetch=async url=>new Response(await readFile(`public${new URL(String(url)).pathname}`),{headers:{'Content-Type':'application/json'}});
test('artist searches encode every reviewed alias without using MagicCon spelling as a fallback',async()=>{
  const c=await Catalogue.open('https://local.test/data/',fileFetch),d=await c.event();
  for(const mapping of d.mappings){const link=scryfallArtistUrl(mapping);assert.ok(link);const url=new URL(link);assert.equal(url.hostname,'scryfall.com');assert.equal(url.searchParams.get('unique'),'cards');for(const name of Object.values(mapping.scryfallNames).flat())assert.ok(url.searchParams.get('q')!.includes(`artist:"${name.replace(/\\/g,'\\\\').replace(/"/g,'\\"')}"`));}
  const david=d.mappings.find(m=>m.magicconNames.includes('David Palumbo'))!;
  assert.equal(new URL(scryfallArtistUrl(david)!).searchParams.get('q'),'artist:"David Palumbo"');
  assert.equal(scryfallArtistUrl({...david,status:'review_needed'}),undefined);
  assert.equal(scryfallArtistUrl({...david,scryfallNames:{}}),undefined);
  const escaped=scryfallArtistUrl({...david,scryfallNames:{synthetic:['A "Quote" \\ Artist & Co.']}})!;
  assert.equal(new URL(escaped).searchParams.get('q'),'artist:"A \\"Quote\\" \\\\ Artist & Co."');
});
test('card details preserve non-English identity, exact image/link and manual/alias provenance',async()=>{
  const c=await Catalogue.open('https://local.test/data/',fileFetch),d=await c.event();
  const deck=parseMoxfield(JSON.parse(await readFile('tests/fixtures/import-feasibility/moxfield-v2-zB7a13TqOUWlUZuylE905Q.json','utf8')));
  const result=await resolveDeck(deck,c,d,new AbortController().signal);
  const vampire=result.lines.find(r=>r.line.name==='Vampiric Tutor')!;
  assert.equal(vampire.printing!.language,'ja');const detail=resultDetail(vampire);
  assert.ok(detail.includes(vampire.printing!.scryfallUrl.replaceAll('&','&amp;')));assert.ok(detail.includes(vampire.printing!.imageUrl!));assert.ok(detail.includes('JA'));
  const alias=result.lines.find(r=>r.status==='alias')!;const html=resultDetail(alias);assert.ok(html.includes(alias.line.scryfallId!));assert.ok(html.includes(alias.printing!.id));assert.ok(html.includes('1F★'));
  assert.ok(resultRow({...vampire,manual:{selectedAt:'test',section:'mainboard',finish:null},status:'manual'}).includes('Finish unknown'));
});
