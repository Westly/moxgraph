import { parseContract, safeWebUrl } from '../models/boundaries';
import type { CardPrinting, EventDirectory } from '../models/contracts';
import { sha256 } from '../data/catalogue';
import { matchLine } from '../imports/match';
import { parseDeckUrl } from '../imports/url';
import { UUID, MAX_LINES } from '../imports/types';
import type { ImportedDeck, ImportLine, ResolvedLine } from '../imports/types';
import type { Filters, Library, SavedEntry } from './model';
import { defaultFilters } from './model';

export const MAX_BACKUP_BYTES = 32 * 1024 * 1024;
export const MAX_DECKS = 50;
export const MAX_LIBRARY_LINES = 25000;
export type PackedLine = { source: ImportLine; printingId: string | null; selectedPrintingId: string | null; status: ResolvedLine['status']; reason: string | null; candidates: string[] };
export type Choice = { key: string; value: NonNullable<ResolvedLine['manual']> };
export type PackedEntry = {
  id: string; title: string; createdAt: string; updatedAt: string; filters: Filters;
  source: Omit<ImportedDeck, 'lines'>; lines: PackedLine[]; choices: Choice[];
  cache: { printings: CardPrinting[]; directory: EventDirectory; dataVersion: string; cardSnapshotId: string; eventSnapshotId: string };
};
export type PackedLibrary = { decks: PackedEntry[]; selectedId: string | null; view: Library['view'] };
export class StorageValidationError extends Error {}
const invalid = (): never => { throw new StorageValidationError('This saved data is invalid, incomplete, too large, or from an unsupported version. Nothing was replaced.'); };
function record(value: unknown, keys: string[], optional: string[] = []): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid();
  const obj = value as Record<string, unknown>;
  if (Object.keys(obj).some(k => !keys.includes(k) && !optional.includes(k)) || keys.some(k => !Object.hasOwn(obj, k))) return invalid();
  return obj;
}
function text(v: unknown, max = 2000): asserts v is string { if (typeof v !== 'string' || v.length > max) invalid(); }
function nullable(v: unknown, max = 2000): void { if (v !== null) text(v, max); }
function list(v: unknown, max: number): asserts v is unknown[] { if (!Array.isArray(v) || v.length > max) invalid(); }
function strings(v: unknown, max: number): void { list(v, max); v.forEach(x => text(x)); }
function uuid(v: unknown): asserts v is string { text(v, 36); if (!UUID.test(v) || v !== v.toLowerCase()) invalid(); }
function iso(v: unknown): void { text(v, 30); if (!Number.isFinite(Date.parse(v)) || new Date(v).toISOString() !== v) invalid(); }
function one(v: unknown, values: unknown[]): void { if (!values.includes(v)) invalid(); }
const finishes = [null, 'nonfoil', 'foil', 'etched'];
function webUrls(value: unknown): void {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    // The event deliberately retains verbatim, sometimes malformed social strings.
    // Only reviewed displayUrl values are ever used as links by the UI.
    if (key === 'originalUrl') { text(child, 4096); continue; }
    if (/(?:url|urls)$/i.test(key)) {
      const urls = Array.isArray(child) ? child : [child];
      for (const url of urls) if (url !== null) { text(url, 4096); safeWebUrl(url); }
    } else webUrls(child);
  }
}
function filters(value: unknown): Filters {
  const f = record(value, ['sections', 'search', 'sort']); strings(f.sections, 100); text(f.search, 2000); one(f.sort, ['artist', 'copies', 'card', 'set']);
  return value as Filters;
}
function line(value: unknown): ImportLine {
  const l = record(value, ['key','sourceRowId','sourcePrintingId','name','quantity','section','categories','scryfallId','oracleId','setCode','collectorNumber','language','finish','rawFinish','issues']);
  for (const key of ['key','sourceRowId','name','section']) text(l[key]);
  if (!l.key || !l.section || !Number.isSafeInteger(l.quantity) || Number(l.quantity) < 1 || Number(l.quantity) > 100000) invalid();
  for (const key of ['sourcePrintingId','scryfallId','oracleId','setCode','collectorNumber','language','rawFinish']) nullable(l[key]);
  strings(l.categories, 100); strings(l.issues, 100); one(l.finish, finishes);
  return value as ImportLine;
}
export function packEntry(entry: SavedEntry): PackedEntry {
  const { lines: _lines, ...source } = entry.result.deck;
  return { id: entry.id, title: entry.title, createdAt: entry.createdAt, updatedAt: entry.updatedAt, filters: entry.filters, source,
    lines: entry.result.lines.map(r => ({ source: r.line, printingId: r.printing?.id ?? null, selectedPrintingId: r.selectedPrintingId ?? r.printing?.id ?? null, status: r.status, reason: r.reason, candidates: r.candidates })),
    choices: entry.result.lines.flatMap(r => r.manual ? [{ key: r.line.key, value: r.manual }] : []),
    cache: { printings: [...new Map(entry.result.lines.flatMap(r => r.printing ? [[r.printing.id, r.printing] as const] : [])).values()], directory: entry.result.directory, dataVersion: entry.result.dataVersion, cardSnapshotId: entry.result.cardSnapshotId, eventSnapshotId: entry.result.eventSnapshotId } };
}
export function unpackEntry(value: unknown): SavedEntry {
  const e = record(value, ['id','title','createdAt','updatedAt','filters','source','lines','choices','cache']);
  uuid(e.id); text(e.title); if (!e.title.trim()) invalid(); iso(e.createdAt); iso(e.updatedAt); filters(e.filters);
  const s = record(e.source, ['provider','source','title','format','importedAt','sourceUpdatedAt','sourceVersion','notices'], ['inputKind']);
  one(s.provider, ['moxfield','archidekt']); text(s.title); iso(s.importedAt); if (s.sourceUpdatedAt !== null) iso(s.sourceUpdatedAt); nullable(s.sourceVersion); strings(s.notices, 100);
  one(s.format, s.provider === 'moxfield' ? ['moxfield-v2','moxfield-text'] : ['archidekt-json','archidekt-csv']);
  if (s.inputKind !== undefined) one(s.inputKind, ['link','file','paste']);
  if (s.source !== null) { const src = record(s.source, ['provider','id','url']); text(src.url); const parsed = parseDeckUrl(src.url); if (parsed.url !== src.url || parsed.id !== src.id || parsed.provider !== src.provider || src.provider !== s.provider) invalid(); }
  const cache = record(e.cache, ['printings','directory','dataVersion','cardSnapshotId','eventSnapshotId']);
  for (const key of ['dataVersion','cardSnapshotId','eventSnapshotId']) text(cache[key], 200);
  const directory = parseContract('EventDirectory', cache.directory); webUrls(directory);
  if (new Set(directory.attendance.map(a => a.id)).size !== directory.attendance.length || new Set(directory.mappings.map(m => m.id)).size !== directory.mappings.length || directory.attendance.some(a => !directory.mappings.some(m => m.id === a.mappingId && m.attendanceId === a.id))) invalid();
  list(cache.printings, MAX_LINES);
  const printings = new Map<string, CardPrinting>();
  for (const p of cache.printings) { const printing = parseContract('CardPrinting', p); webUrls(printing); if (printings.has(printing.id)) invalid(); printings.set(printing.id, printing); }
  list(e.lines, MAX_LINES); list(e.choices, MAX_LINES);
  const choices = new Map<string, NonNullable<ResolvedLine['manual']>>();
  for (const item of e.choices) { const c = record(item, ['key','value']); text(c.key); const m = record(c.value, ['selectedAt','section','finish']); iso(m.selectedAt); text(m.section); if (!m.section) invalid(); one(m.finish, finishes); if (choices.has(c.key)) invalid(); choices.set(c.key, c.value as NonNullable<ResolvedLine['manual']>); }
  const keys = new Set<string>(), used = new Set<string>(); let copies = 0;
  const lines: ResolvedLine[] = e.lines.map(value => {
    const r = record(value, ['source','printingId','selectedPrintingId','status','reason','candidates']);
    const source = line(r.source); if (keys.has(source.key)) invalid(); keys.add(source.key); copies += source.quantity;
    for (const id of [r.printingId, r.selectedPrintingId]) if (id !== null) uuid(id);
    if (r.printingId !== null && (r.printingId !== r.selectedPrintingId || !printings.has(r.printingId as string))) invalid();
    const printing = r.printingId ? printings.get(r.printingId as string)! : null; if (printing) used.add(printing.id);
    one(r.status, ['exact','alias','manual','unknown','ambiguous','conflict']); nullable(r.reason, 4000); strings(r.candidates, 5000); (r.candidates as string[]).forEach(uuid);
    const manual = choices.get(source.key);
    if (!!manual !== (r.status === 'manual') || manual && !r.selectedPrintingId || printing && !['exact','alias','manual'].includes(r.status as string) || ['exact','alias'].includes(r.status as string) && !r.selectedPrintingId) invalid();
    return matchLine({ line: source, printing, status: r.status as ResolvedLine['status'], reason: r.reason as string | null, candidates: r.candidates as string[], matches: [], attendanceState: 'unresolved', ...(r.selectedPrintingId ? { selectedPrintingId: r.selectedPrintingId as string } : {}), ...(manual ? { manual } : {}) }, directory);
  });
  if (copies > 100000 || used.size !== printings.size || [...choices.keys()].some(k => !keys.has(k))) invalid();
  return { id: e.id, title: e.title as string, createdAt: e.createdAt as string, updatedAt: e.updatedAt as string, filters: e.filters as Filters,
    result: { deck: { ...s, lines: lines.map(r => r.line) } as ImportedDeck, lines, directory, dataVersion: cache.dataVersion as string, cardSnapshotId: cache.cardSnapshotId as string, eventSnapshotId: cache.eventSnapshotId as string } };
}
export function packLibrary(library: Library): PackedLibrary { return { decks: library.decks.map(packEntry), selectedId: library.selectedId, view: library.view }; }
export function unpackLibrary(value: unknown): Library {
  const l = record(value, ['decks','selectedId','view']); list(l.decks, MAX_DECKS); one(l.view, ['decks','results','artists']); if (l.selectedId !== null) uuid(l.selectedId);
  const decks = l.decks.map(unpackEntry);
  if (new Set(decks.map(d => d.id)).size !== decks.length || l.selectedId !== null && !decks.some(d => d.id === l.selectedId) || decks.reduce((n,d) => n + d.result.lines.length, 0) > MAX_LIBRARY_LINES) invalid();
  return { decks, selectedId: l.selectedId as string | null, view: l.view as Library['view'] };
}
export function checkedLibrary(library: Library): PackedLibrary {
  const packed = packLibrary(library); bounded(JSON.stringify(packed), MAX_BACKUP_BYTES - 1024); unpackLibrary(packed); return packed;
}
function bounded(text: string, limit = MAX_BACKUP_BYTES): void { if (text.length > limit || new TextEncoder().encode(text).byteLength > limit) invalid(); }
const checksum = (value: unknown) => sha256(new TextEncoder().encode(JSON.stringify(value)));
export async function exportBackup(library: Library): Promise<string> {
  const payload = { application: 'moxgraph', version: 2, exportedAt: new Date().toISOString(), library: checkedLibrary(library) };
  const result = JSON.stringify({ ...payload, checksum: await checksum(payload) }); bounded(result); return result;
}
export async function importBackup(text: string): Promise<Library> {
  bounded(text); let value: unknown; try { value = JSON.parse(text); } catch { return invalid(); }
  const b = record(value, ['application','version','exportedAt','library','checksum']);
  if (b.application !== 'moxgraph' || b.version !== 2) invalid(); iso(b.exportedAt);
  const { checksum: digest, ...payload } = b;
  if (await checksum(payload) !== digest) invalid();
  return unpackLibrary(b.library);
}
/** Documented predecessor: the same entry envelope before per-deck filters existed. */
export function migrateV1(value: unknown): PackedEntry {
  const e = record(value, ['id','title','createdAt','updatedAt','source','lines','choices','cache']);
  const next = { ...e, filters: defaultFilters() }; unpackEntry(next); return next as PackedEntry;
}
