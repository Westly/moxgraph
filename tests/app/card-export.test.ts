import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Catalogue } from '../../src/data/catalogue.ts';
import { parseMoxfield } from '../../src/imports/adapters.ts';
import { resolveDeck, selectResults } from '../../src/imports/match.ts';
import { createEntry } from '../../src/storage/model.ts';
import { cardsCsv, csvCell, exportCards, exportSummary, sortCards } from '../../src/exports/cards.ts';
import { cardsPdf, fetchCardImage, MAX_PDF_CARDS } from '../../src/exports/pdf.ts';
import { PDFDocument } from 'pdf-lib';

const fileFetch: typeof fetch=async url=>new Response(await readFile(`public${new URL(String(url)).pathname}`),{headers:{'Content-Type':'application/json'}});
async function fixtures(){
  const c=await Catalogue.open('https://local.test/data/',fileFetch),directory=await c.event();
  return Promise.all(['3x55_3CFz060qxL2xac3NA','zB7a13TqOUWlUZuylE905Q'].map(async id=>createEntry(await resolveDeck(parseMoxfield(JSON.parse(await readFile(`tests/fixtures/import-feasibility/moxfield-v2-${id}.json`,'utf8'))),c,directory,new AbortController().signal))));
}
test('single and multiple deck exports preserve selected printings, quantities and artist/deck order',async()=>{
  const decks=await fixtures(),[a,b]=decks;
  const single=exportCards(decks,new Set([a!.id]),{sections:'main',includeOther:false});
  assert.ok(single.every(c=>c.deckId===a!.id));
  assert.equal(exportSummary(single).copies,selectResults(a!.result,new Set(['mainboard','commanders']),'','artist').copies);
  const together=exportCards(decks,new Set(decks.map(d=>d.id)),{sections:'main',includeOther:false});
  assert.equal(exportSummary(together).copies,51);
  assert.deepEqual(together,sortCards([...together].reverse()));
  for(const card of together){const original=decks.find(d=>d.id===card.deckId)!.result.lines.find(r=>r.line.key===card.row.line.key)!;assert.equal(card.row,original);assert.equal(card.row.printing!.id,original.selectedPrintingId??original.printing!.id);}
  assert.ok(together.some(c=>c.deckId===b!.id));
  const all=exportCards(decks,new Set(decks.map(d=>d.id)),{sections:'all',includeOther:true});
  assert.equal(new Set(all.map(c=>JSON.stringify([c.deckId,c.row.line.key]))).size,237);
  const alias=all.find(c=>c.row.status==='alias')!;assert.ok(cardsCsv([alias]).includes('7910ce6c-5cde-436e-8d28-62723f0fd592'));assert.ok(cardsCsv([alias]).includes('1F★'));
  const japanese=all.find(c=>c.row.printing?.language==='ja')!;assert.ok(cardsCsv([japanese]).includes('"ja"'));
});
test('joint credits repeat per artist without inflating physical totals; local copies stay separate',async()=>{
  const [deck]=await fixtures(),rows=exportCards([deck!],new Set([deck!.id]),{sections:'main',includeOther:false});
  const card=rows[0]!, repeated={...card,artist:'Another Artist',artistId:'another'};
  assert.equal(exportSummary([card,repeated]).copies,card.row.line.quantity);
  assert.equal(exportSummary([card,{...card,deckId:'local-copy'}]).copies,card.row.line.quantity*2);
  assert.equal(exportCards([deck!],new Set(),{sections:'all',includeOther:true}).length,0);
});
test('CSV quotes delimiters, newlines and accented names; guards formula cells',()=>{
  assert.equal(csvCell('Fačková, "K"\nline'),'"Fačková, ""K""\nline"');
  for(const cell of ['=1+1',' +SUM(A1)','\t@evil','-1','\rhello'])assert.ok(csvCell(cell).startsWith('"\''));
  assert.ok(cardsCsv([]).startsWith('\uFEFF"Artist","Deck"'));assert.ok(cardsCsv([]).endsWith('\r\n'));
});
test('PDF pagination, missing images, font accents, input limits and cancellation remain usable',async()=>{
  const [deck]=await fixtures(),rows=exportCards([deck!],new Set([deck!.id]),{sections:'all',includeOther:true});
  const fontBytes=new Uint8Array(await readFile('public/fonts/NotoSans-Regular.ttf'));
  let requests=0;const options={fontBytes,signal:new AbortController().signal,loadImage:async()=>{requests++;throw new Error('Offline');}};
  const sample=rows.slice(0,13).map(c=>({...c,artist:'Magali Villeneuve / Livia Prima / Martina Fačková',deck:'A long deck title that must wrap and end within its card column'}));
  const output=await cardsPdf(sample,options),parsed=await PDFDocument.load(output.bytes);
  assert.equal(parsed.getPageCount(),2);assert.equal(output.missingImages,13);assert.equal(requests,3);assert.ok(output.bytes.byteLength>10000);
  await assert.rejects(()=>cardsPdf([],options),/Select decks/);
  await assert.rejects(()=>cardsPdf(Array(MAX_PDF_CARDS+1).fill(rows[0]),options),/up to/);
  const controller=new AbortController();controller.abort();await assert.rejects(()=>cardsPdf(rows,{...options,signal:controller.signal}),{name:'AbortError'});
  await assert.rejects(()=>fetchCardImage('https://example.com/private',new AbortController().signal),/Unsupported image host/);
});
