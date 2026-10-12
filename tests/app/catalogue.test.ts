import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Catalogue, DataUnavailableError } from '../../src/data/catalogue';
import { parseContract, DataValidationError, safeWebUrl } from '../../src/models/boundaries';
import type { CardPrinting } from '../../src/models/contracts';

const root = path.resolve('public');
const requests: string[] = [];
const localFetch: typeof fetch = async input => {
  const url = new URL(String(input)); requests.push(url.pathname);
  try {
    const data = await readFile(path.join(root,url.pathname));
    return new Response(data,{headers:{'Content-Type':'application/json'}});
  } catch { return new Response('not found',{status:404}); }
};
const open = () => Catalogue.open('https://test.invalid/data/', localFetch);
const json = async (p: string) => JSON.parse(await readFile(p,'utf8'));

test('real exact-print fixtures retain source identities, multilingual names and face credits', async () => {
  const catalogue = await open();
  const fixtures = await json('tests/fixtures/scryfall-printings.json');
  let checked = 0;
  for (const {card} of fixtures.cases) {
    const result = await catalogue.lookupPrinting(card.id);
    assert.equal(result.status,'found');
    if (result.status !== 'found') throw new Error(card.id);
    const p = result.printing;
    assert.equal(p.name,card.name); assert.equal(p.printedName,card.printed_name??null);
    assert.equal(p.setCode,card.set); assert.equal(p.collectorNumber,card.collector_number);
    assert.equal(p.language,card.lang); assert.deepEqual(p.finishes,card.finishes);
    assert.deepEqual(p.games,card.games); assert.equal(p.paper,card.games.includes('paper')); assert.equal(p.digital,card.digital);
    assert.deepEqual(p.oracleIds,[...new Set([card.oracle_id,...(card.card_faces??[]).map((f:any)=>f.oracle_id)].filter(Boolean))].sort());
    assert.equal(p.sourceArtistCredit,card.artist??null); assert.deepEqual(p.artistIds,card.artist_ids??[]);
    assert.equal(p.scryfallUrl,card.scryfall_uri);
    assert.equal(p.faces.length,card.card_faces?.length??0);
    for (const [i,f] of p.faces.entries()) {
      assert.equal(f.sourceArtistCredit,card.card_faces[i].artist??null);
      assert.deepEqual(f.artistIds,card.card_faces[i].artist_id?[card.card_faces[i].artist_id]:[]);
      assert.equal(f.illustrationId,card.card_faces[i].illustration_id??null);
    }
    checked++;
  }
  assert.equal(checked,15);
});

test('all owner-deck and Archidekt selected IDs retain tuples; historical ID remains unknown', async () => {
  const catalogue = await open(); let known = 0, unknown = 0;
  for (const id of ['3x55_3CFz060qxL2xac3NA','zB7a13TqOUWlUZuylE905Q']) {
    const d = await json(`tests/fixtures/import-feasibility/moxfield-v2-${id}.json`);
    for (const section of ['mainboard','commanders','sideboard','maybeboard']) {
      for (const row of Object.values(d[section]??{}) as any[]) {
        for (const line of row.printingData?.length?row.printingData:[row]) {
          const c = line.card, result = await catalogue.lookupPrinting(c.scryfall_id);
          if (result.status==='unknown') { assert.equal(c.scryfall_id,'f0deab39-dfa3-4652-a05f-b221b979009a'); unknown++; continue; }
          assert.deepEqual([result.printing.setCode,result.printing.collectorNumber,result.printing.language],[c.set,c.cn,c.lang]); known++;
        }
      }
    }
  }
  const arch = await json('tests/fixtures/import-feasibility/archidekt-19780118.json');
  for (const {card} of arch.cards) {
    const r = await catalogue.lookupPrinting(card.uid); assert.equal(r.status,'found');
    if (r.status==='found') assert.deepEqual([r.printing.setCode,r.printing.collectorNumber],[card.edition.editioncode,card.collectorNumber]);
    known++;
  }
  assert.equal(known,350); assert.equal(unknown,1);
});

test('tuple lookup preserves collector symbols and never assumes a missing language', async () => {
  const catalogue = await open();
  const exact = await catalogue.lookupTuple('p30m','1F★','en');
  assert.equal(exact.status,'found');
  if (exact.status==='found') assert.equal(exact.printing.id,'7910ce6c-5cde-436e-8d28-62723f0fd592');
  assert.equal((await catalogue.lookupTuple('p30m','1F★')).status,'ambiguous');
  assert.equal((await catalogue.lookupTuple('p30m','1F★','zz')).status,'unknown');
  await assert.rejects(catalogue.lookupTuple('../private','1','en'),DataValidationError);
});

test('Conflux tuple lookup uses a portable filename and preserves the exact printing', async () => {
  const catalogue = await open(); requests.length = 0;
  const result = await catalogue.lookupTuple('con', '1', 'en');
  assert.equal(result.status, 'found');
  if (result.status === 'found') assert.deepEqual([result.printing.setCode, result.printing.collectorNumber, result.printing.language], ['con', '1', 'en']);
  assert.ok(requests.includes(`/data/${catalogue.manifest.version}/tuples/set-con.json`));
});

test('event directory retains all attendees, raw names, profile and published socials', async () => {
  const catalogue = await open();
  const event = await catalogue.event();
  const source = await json('data/curated/events/atlanta-2026.json');
  assert.equal(event.attendance.length,source.attendees.length);
  assert.equal(event.attendance.length,catalogue.manifest.coverage.attendees);
  for (const a of event.attendance) {
    const original = source.attendees.find((s:any)=>s.event_attendee_id===a.id);
    assert.equal(a.rawName,original.display_name); assert.equal(a.profileUrl,original.official_profile_url);
    assert.equal(a.portraitUrl,original.portrait.url);
    assert.deepEqual(a.links.map(l=>[l.originalUrl,l.displayUrl]),original.links.map((l:any)=>[l.published_href,l.usable_url]));
  }
  const artists = await catalogue.artists(); assert.equal(artists.length,catalogue.manifest.coverage.artists);
  const palumbo = artists.find(a=>a.displayName==='David Palumbo')!;
  const ids = await catalogue.artistPrintings(palumbo.sourceIds[0]!);
  assert.ok(ids.length>1758);
  assert.ok(event.mappings.some(m=>m.artistKeys.includes(palumbo.key)));
});

test('missing/corrupt shards fail as unavailable, never as a non-attending artist', async () => {
  const failFetch: typeof fetch = async (input,init) => String(input).includes('/printings/') ? new Response('missing',{status:404}) : localFetch(input,init);
  const cat = await Catalogue.open('https://test.invalid/data/',failFetch);
  await assert.rejects(cat.lookupPrinting('7910ce6c-5cde-436e-8d28-62723f0fd592'),DataUnavailableError);
  const corrupt: typeof fetch = async (input,init) => String(input).includes('/printings/') ? new Response('[]',{headers:{'Content-Type':'application/json'}}) : localFetch(input,init);
  const cat2 = await Catalogue.open('https://test.invalid/data/',corrupt);
  await assert.rejects(cat2.lookupPrinting('7910ce6c-5cde-436e-8d28-62723f0fd592'),/integrity/);
});

test('manifest corruption is rejected before lookup files are requested', async () => {
  const corrupt: typeof fetch = async (input,init) => String(input).endsWith('/manifest.json') ? new Response('{}',{headers:{'Content-Type':'application/json'}}) : localFetch(input,init);
  await assert.rejects(Catalogue.open('https://test.invalid/data/',corrupt),/integrity/);
});

test('parallel duplicate lookups share a request and use one pinned data version', async () => {
  const cat = await open(); requests.length = 0;
  await Promise.all([1,2,3].map(()=>cat.lookupPrinting('7910ce6c-5cde-436e-8d28-62723f0fd592')));
  assert.deepEqual(requests,[`/data/${cat.manifest.version}/printings/791.json`]);
});

test('malformed contracts and unsafe URLs are rejected at boundaries', async () => {
  const c = await open(); const r = await c.lookupPrinting('7910ce6c-5cde-436e-8d28-62723f0fd592');
  assert.equal(r.status,'found'); if(r.status!=='found') return;
  const bad: CardPrinting = {...r.printing,collectorNumber:12 as unknown as string};
  assert.throws(()=>parseContract('CardPrinting',bad),DataValidationError);
  assert.throws(()=>parseContract('CardPrinting',{...r.printing,privateField:'unexpected'}),DataValidationError);
  assert.throws(()=>parseContract('ActiveManifest',{schemaVersion:1,version:'../../secret',manifestSha256:'0'.repeat(64),manifestBytes:100}),DataValidationError);
  assert.throws(()=>safeWebUrl('javascript:alert(1)'),DataValidationError);
  assert.throws(()=>safeWebUrl('https://name:secret@example.com'),DataValidationError);
});

test('failed retrieval can be explicitly retried and non-JSON responses remain unavailable', async () => {
  let fail = true;
  const flaky: typeof fetch = async (input,init) => {
    if (fail && String(input).includes('/printings/')) return new Response('<html>missing</html>',{headers:{'Content-Type':'text/html'}});
    return localFetch(input,init);
  };
  const cat = await Catalogue.open('https://test.invalid/data/',flaky);
  await assert.rejects(cat.lookupPrinting('7910ce6c-5cde-436e-8d28-62723f0fd592'),DataUnavailableError);
  fail = false;
  assert.equal((await cat.lookupPrinting('7910ce6c-5cde-436e-8d28-62723f0fd592')).status,'found');
});

test('unknown valid UUID differs from invalid input and missing index data', async () => {
  const cat = await open();
  assert.deepEqual(await cat.lookupPrinting('00000000-0000-0000-0000-000000000000'),{status:'unknown',id:'00000000-0000-0000-0000-000000000000'});
  await assert.rejects(cat.lookupPrinting('not-a-uuid'),DataValidationError);
  await assert.rejects(cat.artistPrintings('00000000-0000-0000-0000-000000000000'),DataUnavailableError);
});

test('a response exceeding its declared manifest size is stopped before parsing', async () => {
  const oversized: typeof fetch = async (input,init) => {
    if (String(input).endsWith('/active.json')) return new Response(' '.repeat(1025),{headers:{'Content-Type':'application/json'}});
    return localFetch(input,init);
  };
  await assert.rejects(Catalogue.open('https://test.invalid/data/',oversized),DataUnavailableError);
});
