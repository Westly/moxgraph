import type { CardPrinting, EventDirectory } from '../models/contracts';

export type Provider = 'moxfield' | 'archidekt';
export type Finish = 'nonfoil' | 'foil' | 'etched';
export type Source = { provider: Provider; id: string; url: string };
export type ImportLine = {
  key: string; sourceRowId: string; sourcePrintingId: string | null;
  name: string; quantity: number; section: string; categories: string[];
  scryfallId: string | null; oracleId: string | null;
  setCode: string | null; collectorNumber: string | null; language: string | null;
  finish: Finish | null; rawFinish: string | null; issues: string[];
};
export type ImportedDeck = {
  provider: Provider; source: Source | null; title: string;
  inputKind?: 'link' | 'file' | 'paste';
  format: 'moxfield-v2' | 'archidekt-json' | 'archidekt-csv' | 'moxfield-text';
  importedAt: string; sourceUpdatedAt: string | null; sourceVersion: string | null;
  lines: ImportLine[]; notices: string[];
};
export type CreditMatch = { attendanceId: string; artistIds: string[]; faceIndexes: number[]; credits: string[] };
export type ResolvedLine = {
  line: ImportLine; printing: CardPrinting | null;
  status: 'exact' | 'alias' | 'manual' | 'unknown' | 'ambiguous' | 'conflict';
  reason: string | null; candidates: string[]; matches: CreditMatch[];
  attendanceState: 'attending' | 'no_listed_attendee' | 'artist_unmapped' | 'credit_missing' | 'unresolved';
  manual?: { selectedAt: string; section: string; finish: Finish | null };
  /** Retained even when a newer catalogue no longer contains this exact ID. */
  selectedPrintingId?: string;
};
export type DeckResult = {
  deck: ImportedDeck; lines: ResolvedLine[]; dataVersion: string;
  cardSnapshotId: string; eventSnapshotId: string; directory: EventDirectory;
};
export type ImportErrorCode = 'url' | 'format' | 'quantity' | 'limit' | 'private' | 'missing' | 'rate' | 'unavailable' | 'cancelled' | 'catalogue';
export class ImportError extends Error {
  constructor(public readonly code: ImportErrorCode, message: string, public readonly retryAt?: number) { super(message); this.name = 'ImportError'; }
}
export const MAX_BYTES = 12 * 1024 * 1024;
export const MAX_LINES = 5000;
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const SECTION_NAMES: Record<string, string> = {
  mainboard: 'Main deck', commanders: 'Commander', sideboard: 'Sideboard', maybeboard: 'Maybeboard',
  companions: 'Companion', signatureSpells: 'Signature spells', attractions: 'Attractions', stickers: 'Stickers',
  tokens: 'Selected tokens', outside: 'Outside the deck', section_review: 'Section needs review', imported:'Unsectioned export',
};
