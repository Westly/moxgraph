/** Repeatable WBS 7 fixture report; no network or provider calls. */
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { Catalogue } from '../src/data/catalogue.ts';
import { parseArchidekt, parseMoxfield } from '../src/imports/adapters.ts';
import { parseExport } from '../src/imports/exports.ts';
import { resolveDeck, selectResults } from '../src/imports/match.ts';
import type { ImportedDeck } from '../src/imports/types.ts';
const fileFetch:typeof fetch=async url=>new Response(await readFile(`public${new URL(String(url)).pathname}`),{headers:{'Content-Type':'application/json'}});
const catalogue=await Catalogue.open('https://local.test/data/',fileFetch),directory=await catalogue.event();
const fixture=async(name:string)=>readFile(`tests/fixtures/import-feasibility/${name}`,'utf8');
const decks:ImportedDeck[]=[];
for(const [file,parser] of [['moxfield-v2-3x55_3CFz060qxL2xac3NA.json',parseMoxfield],['moxfield-v2-zB7a13TqOUWlUZuylE905Q.json',parseMoxfield],['archidekt-19780118.json',parseArchidekt]] as const)decks.push(parser(JSON.parse(await fixture(file))));
decks.push(parseExport(await fixture('archidekt-official.csv'),'archidekt-csv','Official Archidekt CSV'));
decks.push(parseExport(await fixture('moxfield-official-orzhov.txt'),'moxfield-text','Official Orzhov text'));
const results=[];
for(const deck of decks){
  const result=await resolveDeck(deck,catalogue,directory,new AbortController().signal);
  const summary=(sections:Set<string>)=>{const s=selectResults(result,sections,'','artist');return{physicalCopies:s.copies,sourceLines:s.sourceLines,uniquePrintings:s.printings,artists:s.groups.length};};
  results.push({title:deck.title,source:deck.source?.url??null,format:deck.format,lines:deck.lines.length,copies:deck.lines.reduce((n,l)=>n+l.quantity,0),sections:Object.fromEntries([...new Set(deck.lines.map(l=>l.section))].map(section=>[section,deck.lines.filter(l=>l.section===section).reduce((n,l)=>n+l.quantity,0)])),resolution:Object.fromEntries(['exact','alias','manual','ambiguous','unknown','conflict'].map(status=>[status,result.lines.filter(r=>r.status===status).length])),nonpaper:result.lines.filter(r=>r.printing&&!r.printing.paper).map(r=>({name:r.line.name,id:r.printing!.id})),defaultView:summary(new Set(['mainboard','commanders'])),allSections:summary(new Set(deck.lines.map(l=>l.section)))});
}
let rejection='';try{parseMoxfield(JSON.parse(await fixture('moxfield-v2-SbEkgxN4CEqiCG5B94rkkg.json')));}catch(error){rejection=(error as Error).message;}
assert.ok(rejection.includes('inconsistent'));
const report={wbs:'7.0',generatedAt:new Date().toISOString(),dataVersion:catalogue.manifest.version,networkRequests:0,fixtures:results,supplementalV2:{accepted:false,reason:rejection,fallback:'Explicit fresh v2 import or complete export only. No automatic v3 request.'}};
await writeFile('reports/import-matching-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
