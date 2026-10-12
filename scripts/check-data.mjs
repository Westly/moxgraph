// Offline release gate: validate every record, checksum and cross-file reference.
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import * as validators from '../src/models/validators.js';
import { checkHeaders, checkPublishedText, checkPortablePath } from './release-policy.mjs';

const root = path.resolve(process.argv[2] ?? 'public');
const hash = b => createHash('sha256').update(b).digest('hex');
const read = async p => JSON.parse(await readFile(p, 'utf8'));
function require(condition, message) { if (!condition) throw new Error(message); }
function validate(name, value) {
  const check = validators[`validate${name}`];
  require(check(value), `Invalid ${name} ${value.id ?? ''}: ${JSON.stringify(check.errors?.slice(0,3))}`);
}
function urls(value, key = '') {
  if (typeof value === 'string' && (key.endsWith('Url') || key.endsWith('Urls') || key === 'url') && key !== 'originalUrl') {
    const url = new URL(value);
    require(['https:', 'http:'].includes(url.protocol) && !url.username && !url.password && url.hostname, `Unsafe ${key}`);
  } else if (Array.isArray(value)) value.forEach(v => urls(v, key));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([k,v]) => urls(v,k));
}
async function walk(dir) {
  const paths = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    require(!entry.isSymbolicLink(), `Symlink prohibited: ${entry.name}`);
    const filename = path.join(dir,entry.name);
    if (entry.isDirectory()) paths.push(...await walk(filename)); else paths.push(filename);
  }
  return paths;
}
const all = await walk(root);
require(all.length <= 10000, 'Release exceeds 10,000-file guard');
for (const file of all) {
  const rel = path.relative(root, file).replaceAll('\\','/');
  checkPortablePath(rel);
  require(['index.html','404.html','robots.txt','_headers','_redirects'].includes(rel) ||
    /^data\/[a-z0-9_/-]+\.json$/.test(rel) || /^(assets|brand)\/[a-zA-Z0-9_./-]+\.(js|css|woff2|svg|png|jpg|webp|ico)$/.test(rel),
    `Unapproved deployable file: ${rel}`);
  require(!/(^|\/)(?:functions|node_modules|\.git|\.env|data\/raw|data\/staging)(\/|$)|_worker|wrangler|\.sqlite|\.map$|\.py$|\.mjs$|\.tsx?$/.test(rel), `Unexpected server/source artifact: ${rel}`);
  require((await stat(file)).size <= 20 * 1024 * 1024, `Oversized asset: ${rel}`);
  if (/\.(?:html|js|css|svg)$/.test(rel)) checkPublishedText(await readFile(file,'utf8'),rel);
}
const active = await read(path.join(root,'data/active.json'));
validate('ActiveManifest',active);
const versionRoot = path.join(root,'data',active.version);
const manifestBytes = await readFile(path.join(versionRoot,'manifest.json'));
require(manifestBytes.length === active.manifestBytes && hash(manifestBytes) === active.manifestSha256, 'Active manifest integrity');
const manifest = JSON.parse(manifestBytes);
validate('DataManifest',manifest);
require(manifest.version === active.version,'Version mismatch');
const packaging = await read(new URL('../reports/static-data-packaging.json',import.meta.url));
require(packaging.version === manifest.version,'Packaging evidence/version mismatch');
for (const [source,expectedHash] of Object.entries(packaging.inputHashes)) {
  require(!path.isAbsolute(source) && !source.split('/').includes('..'),'Unsafe provenance path');
  require(hash(await readFile(new URL('../'+source,import.meta.url)))===expectedHash,`Source changed; run data:build: ${source}`);
}
const columns = await read(new URL('../schemas/printing-columns.json',import.meta.url));
require(JSON.stringify(columns) === JSON.stringify(manifest.printingColumns),'Printing columns mismatch');
const expected = new Set(['data/active.json',`data/${active.version}/manifest.json`, ...Object.keys(manifest.files).map(p=>`data/${active.version}/${p}`)]);
for (const file of all) {
  const rel = path.relative(root,file).replaceAll('\\','/');
  if (rel.startsWith('data/')) require(expected.has(rel),`Unmanifested/stale data: ${rel}`);
}
async function asset(p, expectedKind) {
  const descriptor = manifest.files[p];
  require(descriptor?.kind === expectedKind, `Missing/wrong asset descriptor: ${p}`);
  const raw = await readFile(path.join(versionRoot,p));
  require(raw.length === descriptor.bytes && hash(raw) === descriptor.sha256, `Integrity: ${p}`);
  const value = JSON.parse(raw);
  require((Array.isArray(value) ? value.length : value.attendance.length) === descriptor.records, `Count: ${p}`);
  return value;
}
const artists = await asset('artists.json','artists');
const artistIds = new Set(), artistKeys = new Set();
for (const a of artists) {
  validate('Artist',a);
  require(!artistKeys.has(a.key),'Duplicate artist key'); artistKeys.add(a.key);
  for (const id of a.sourceIds) { require(!artistIds.has(id),'Duplicate source artist'); artistIds.add(id); }
}
const printings = new Map(), languages = new Set(), sets = new Set(), creditCounts = new Map();
let faceCount = 0;
for (const [p,d] of Object.entries(manifest.files)) if (d.kind === 'printings') {
  const rows = await asset(p,'printings');
  require(/^printings\/[0-9a-f]{3}\.json$/.test(p),'Invalid printing shard path');
  for (const row of rows) {
    require(Array.isArray(row) && row.length === columns.length,'Invalid compact row');
    const card = Object.fromEntries(columns.map((k,i)=>[k,row[i]]));
    validate('CardPrinting',card); urls(card);
    require(p === `printings/${card.id.slice(0,3)}.json`,'Wrong UUID shard');
    require(!printings.has(card.id),'Duplicate printing');
    require(card.faces.every((f,i)=>f.index===i),'Noncontiguous face identity');
    const credits = [...new Set([...card.artistIds,...card.faces.flatMap(f=>f.artistIds)])];
    for (const id of credits) {
      require(artistIds.has(id),'Missing source artist reference');
      creditCounts.set(id,(creditCounts.get(id)??0)+1);
    }
    printings.set(card.id,[card.setCode,card.collectorNumber,card.language,credits]);
    languages.add(card.language); sets.add(card.setCode); faceCount += card.faces.length;
  }
}
const tupleIds = new Set();
for (const [p,d] of Object.entries(manifest.files)) if (d.kind === 'tuples') {
  require(/^tuples\/set-[a-z0-9]+\.json$/.test(p),'Nonportable tuple path');
  const set = p.slice('tuples/set-'.length,-5);
  require(sets.has(set),'Unknown tuple set');
  for (const tuple of await asset(p,'tuples')) {
    require(Array.isArray(tuple) && tuple.length===3,'Tuple shape');
    const [cn,lang,id] = tuple, target = printings.get(id);
    require(target && target[0]===set && target[1]===cn && target[2]===lang,'Tuple identity disagreement');
    require(!tupleIds.has(id),'Duplicate tuple ID'); tupleIds.add(id);
  }
}
require(tupleIds.size===printings.size,'Incomplete tuple coverage');
let reverseIndexes = 0;
for (const [p,d] of Object.entries(manifest.files)) if (d.kind === 'artist-index') {
  const artist = p.slice('artist-index/'.length,-5);
  require(artistIds.has(artist),'Unknown reverse-index artist');
  const ids = await asset(p,'artist-index');
  require(new Set(ids).size===ids.length && ids.length===(creditCounts.get(artist)??0),'Artist-index coverage');
  for (const id of ids) require(printings.get(id)?.[3].includes(artist),'Incorrect artist-printing reference');
  reverseIndexes++;
}
require(reverseIndexes === artistIds.size,'Missing reverse indexes');
const directory = await asset('event.json','event'); validate('EventDirectory',directory); urls(directory);
const attendanceIds = new Set(directory.attendance.map(a=>a.id));
const mappingIds = new Set(directory.mappings.map(m=>m.id));
require(attendanceIds.size===directory.attendance.length && mappingIds.size===directory.mappings.length,'Duplicate event identity');
for (const a of directory.attendance) require(a.eventId===directory.event.id && mappingIds.has(a.mappingId),'Attendance mapping reference');
for (const m of directory.mappings) {
  require(m.eventId===directory.event.id && attendanceIds.has(m.attendanceId),'Mapping attendance reference');
  require(m.artistKeys.every(k=>artistKeys.has(k)) && m.sourceArtistIds.every(id=>artistIds.has(id)),'Mapping artist reference');
}
for (const s of directory.statistics) require(artistKeys.has(s.artistKey) && s.snapshotId===manifest.cardSnapshotId,'Statistics reference');
const sources = await asset('sources.json','sources');
for (const source of sources) { validate('SourceSnapshot',source); urls(source); }
require(sources.some(s=>s.id===manifest.cardSnapshotId) && sources.some(s=>s.id===manifest.eventSnapshotId),'Snapshot provenance');
const actual = { printings: printings.size, languages: languages.size, sets: sets.size, artists: artists.length,
  attendees: directory.attendance.length, faces: faceCount };
for (const [k,v] of Object.entries(actual)) require(manifest.coverage[k]===v,`Coverage mismatch: ${k}`);
const headers = await readFile(path.join(root,'_headers'),'utf8');
checkHeaders(headers);
require(headers.includes('/data/active.json\n  Cache-Control: no-cache') && headers.includes('max-age=31536000, immutable'),'Cache policy missing');
console.log(JSON.stringify({root,version:manifest.version,releaseFiles:all.length,validated:actual,integrity:'passed',references:'passed',limits:'passed'}));
