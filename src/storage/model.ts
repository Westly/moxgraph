import type { DeckResult, ImportLine, ResolvedLine } from '../imports/types';
import type { Catalogue } from '../data/catalogue';
import type { EventDirectory } from '../models/contracts';
import { matchLine, resolveDeck } from '../imports/match';
import { resolveLine } from '../imports/resolve';

export type Filters = { sections: string[]; search: string; sort: 'artist' | 'copies' | 'card' | 'set' };
export type SavedEntry = { id: string; title: string; createdAt: string; updatedAt: string; filters: Filters; result: DeckResult };
export type Library = { decks: SavedEntry[]; selectedId: string | null; view: 'decks' | 'results' | 'artists' };
export const emptyLibrary = (): Library => ({ decks: [], selectedId: null, view: 'decks' });
export const defaultFilters = (): Filters => ({ sections: ['mainboard', 'commanders'], search: '', sort: 'artist' });
export const createEntry = (result: DeckResult): SavedEntry => ({ id: crypto.randomUUID(), title: result.deck.title, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), filters: defaultFilters(), result });
export const sameSource = (a: SavedEntry, b: DeckResult): boolean => !!a.result.deck.source && !!b.deck.source && a.result.deck.provider === b.deck.provider && a.result.deck.source.id === b.deck.source.id;

/** Quantity may change without changing the physical printing represented by a row. */
export function sourceIdentity(line: ImportLine): string {
  const { quantity: _quantity, ...identity } = line;
  return JSON.stringify(identity);
}

/** A refresh never carries a manual override onto changed/reassigned source identity. */
export function updatedEntry(previous: SavedEntry, next: DeckResult): SavedEntry {
  const old = new Map(previous.result.lines.map(row => [row.line.key, row]));
  const lines = next.lines.map(row => {
    const prior = old.get(row.line.key);
    if (!prior?.manual || sourceIdentity(prior.line) !== sourceIdentity(row.line)) return row;
    return matchLine({ ...prior, line: row.line }, next.directory);
  });
  return { ...previous, updatedAt: new Date().toISOString(), result: { ...next, lines } };
}

/** Use pinned UUIDs on data updates, never a name/tuple substitute for a saved printing. */
export async function recompute(entry: SavedEntry, catalogue: Catalogue, directory: EventDirectory, signal: AbortSignal): Promise<SavedEntry> {
  const lines: ResolvedLine[] = [];
  for (const row of entry.result.lines) {
    signal.throwIfAborted();
    const id = row.selectedPrintingId ?? row.printing?.id;
    if (!id) { lines.push(matchLine(await resolveLine(row.line, entry.result.deck.provider, catalogue, signal), directory)); continue; }
    const found = await catalogue.lookupPrinting(id, signal);
    lines.push(matchLine({ ...row, selectedPrintingId: id, printing: found.status === 'found' ? found.printing : null,
      reason: found.status === 'found' ? (row.printing ? row.reason : 'The saved printing is available again. Its exact ID was retained.') : 'This saved printing is absent from the current catalogue. Its exact ID is retained; review or import a newer source.',
      candidates: found.status === 'found' ? [] : [id] }, directory));
  }
  return { ...entry, result: { ...entry.result, lines, directory, dataVersion: catalogue.manifest.version, cardSnapshotId: catalogue.manifest.cardSnapshotId, eventSnapshotId: catalogue.manifest.eventSnapshotId } };
}

export async function refreshEntry(entry: SavedEntry, deck: DeckResult['deck'], catalogue: Catalogue, directory: EventDirectory, signal: AbortSignal): Promise<SavedEntry> {
  const next = updatedEntry(entry, await resolveDeck(deck, catalogue, directory, signal));
  // Revalidate carried manual choices against current card data as well as attendance.
  return recompute(next, catalogue, directory, signal);
}

export function mergeLibraries(current: Library, incoming: Library, mode: 'merge' | 'replace'): Library {
  if (mode === 'replace') return structuredClone(incoming);
  const ids = new Set(current.decks.map(d => d.id));
  return { ...current, decks: [...current.decks, ...incoming.decks.filter(d => !ids.has(d.id))], selectedId: current.selectedId ?? incoming.selectedId };
}
