import type { Catalogue } from '../data/catalogue';
import type { EventDirectory } from '../models/contracts';
import { resolveLine } from './resolve';
import type { DeckResult, ImportedDeck, ResolvedLine, CreditMatch } from './types';

const normalized = (value: string) => value.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-US');

/** Exact source IDs first; a whole reviewed credit may be used only when IDs are absent. */
export function matchLine(result: ResolvedLine, directory: EventDirectory): ResolvedLine {
  const printing = result.printing;
  if (!printing) return { ...result, matches: [], attendanceState: 'unresolved' };
  const listed = new Set(directory.attendance.filter(a => a.status === 'listed').map(a => a.id));
  const mappings = directory.mappings.filter(m => m.status === 'verified' && listed.has(m.attendanceId));
  const credits = [{ artistIds: printing.artistIds, sourceArtistCredit: printing.sourceArtistCredit, index: -1 }, ...printing.faces];
  const matches = new Map<string, CreditMatch>();
  let hasCredit = false, unmapped = false;
  for (const credit of credits) {
    if (credit.artistIds.length || credit.sourceArtistCredit) hasCredit = true;
    const candidates = credit.artistIds.length
      ? mappings.filter(m => m.sourceArtistIds.some(id => credit.artistIds.includes(id)))
      : credit.sourceArtistCredit
        ? mappings.filter(m => Object.values(m.scryfallNames).flat().some(n => normalized(n) === normalized(credit.sourceArtistCredit!))) : [];
    // Never split joint text or choose among conflicting name-only mappings.
    if (!credit.artistIds.length && credit.sourceArtistCredit && candidates.length !== 1) { unmapped = true; continue; }
    for (const mapping of candidates) {
      const match = matches.get(mapping.attendanceId) ?? { attendanceId: mapping.attendanceId, artistIds: [], faceIndexes: [], credits: [] };
      match.artistIds = [...new Set([...match.artistIds, ...credit.artistIds.filter(id => mapping.sourceArtistIds.includes(id))])];
      if (credit.index >= 0 && !match.faceIndexes.includes(credit.index)) match.faceIndexes.push(credit.index);
      if (credit.sourceArtistCredit && !match.credits.includes(credit.sourceArtistCredit)) match.credits.push(credit.sourceArtistCredit);
      matches.set(mapping.attendanceId, match);
    }
  }
  return { ...result, matches: [...matches.values()], attendanceState: matches.size ? 'attending' : !hasCredit ? 'credit_missing' : unmapped ? 'artist_unmapped' : 'no_listed_attendee' };
}

export async function resolveDeck(deck: ImportedDeck, catalogue: Catalogue, directory: EventDirectory, signal: AbortSignal, progress: (done: number, total: number) => void = () => {}): Promise<DeckResult> {
  const lines: ResolvedLine[] = new Array(deck.lines.length);
  const controller = new AbortController(), combined = AbortSignal.any([signal, controller.signal]);
  let next = 0, done = 0;
  const work = async () => {
    while (next < deck.lines.length) {
      combined.throwIfAborted();
      const index = next++;
      try {
        lines[index] = matchLine(await resolveLine(deck.lines[index]!, deck.provider, catalogue, combined), directory);
        progress(++done, deck.lines.length);
      } catch (error) { controller.abort(); throw error; }
    }
  };
  const outcomes = await Promise.allSettled(Array.from({ length: Math.min(6, deck.lines.length) }, work));
  signal.throwIfAborted();
  const failed = outcomes.find(r => r.status === 'rejected');
  if (failed?.status === 'rejected') throw failed.reason;
  return { deck, lines, directory, dataVersion: catalogue.manifest.version, cardSnapshotId: catalogue.manifest.cardSnapshotId, eventSnapshotId: catalogue.manifest.eventSnapshotId };
}

export const sectionOf = (r: ResolvedLine): string => r.manual?.section ?? r.line.section;
export const finishOf = (r: ResolvedLine) => r.manual ? r.manual.finish : r.line.finish;
export const physicalMatch = (r: ResolvedLine): boolean => !!r.printing?.paper && r.matches.length > 0;
export function selectResults(result: DeckResult, sections: ReadonlySet<string>, query: string, sort: string) {
  const names = new Map(result.directory.attendance.map(a => [a.id, a.rawName]));
  const needle = query.trim().toLocaleLowerCase();
  const visible = result.lines.filter(r => sections.has(sectionOf(r)) && [r.line.name, r.printing?.printedName, r.printing?.name, r.printing?.sourceArtistCredit,
    ...(r.printing?.faces.map(f => f.sourceArtistCredit) ?? []), ...r.matches.map(m => names.get(m.attendanceId))].join(' ').toLocaleLowerCase().includes(needle));
  const matched = visible.filter(physicalMatch);
  const groups = result.directory.attendance.map(artist => ({ attendanceId: artist.id, name: artist.rawName, lines: matched.filter(r => r.matches.some(m => m.attendanceId === artist.id)) })).filter(g => g.lines.length);
  const copies = (lines: ResolvedLine[]) => lines.reduce((n, r) => n + r.line.quantity, 0);
  groups.forEach(g => g.lines.sort((a,b) => (sort === 'set' ? a.printing!.setCode.localeCompare(b.printing!.setCode) : sort === 'copies' ? b.line.quantity - a.line.quantity : 0) || a.printing!.name.localeCompare(b.printing!.name) || a.line.key.localeCompare(b.line.key)));
  groups.sort((a,b) => (sort === 'copies' ? copies(b.lines) - copies(a.lines) : 0) || a.name.localeCompare(b.name));
  return { visible, matched, groups, other: visible.filter(r => !physicalMatch(r)), copies: copies(matched), sourceLines: new Set(matched.map(r => r.line.key)).size, printings: new Set(matched.map(r => r.printing!.id)).size };
}
