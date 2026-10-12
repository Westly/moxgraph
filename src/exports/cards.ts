import type { SavedEntry } from '../storage/model';
import type { ResolvedLine } from '../imports/types';
import { finishOf, physicalMatch, sectionOf } from '../imports/match';
import { SECTION_NAMES } from '../imports/types';

export type ExportOptions = { sections: 'main' | 'all'; includeOther: boolean };
export type ExportCard = {
  artist: string; artistId: string; booth: string; deckId: string; deck: string;
  sourceUrl: string; row: ResolvedLine; attending: boolean;
};
const alphabet = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
const compare = (a: string, b: string) => alphabet.compare(a,b) || (a < b ? -1 : a > b ? 1 : 0);
export function sortCards(cards: ExportCard[]): ExportCard[] {
  return cards.sort((a,b) => compare(a.artist,b.artist) || compare(a.artistId,b.artistId) || compare(a.deck,b.deck) || compare(a.deckId,b.deckId) || compare(a.row.printing?.name ?? a.row.line.name,b.row.printing?.name ?? b.row.line.name) || compare(a.row.printing?.id ?? '',b.row.printing?.id ?? '') || compare(a.row.line.key,b.row.line.key));
}
/** Retain each physical source row; repeat joint credits once per matching attendee. */
export function exportCards(decks: SavedEntry[], ids: ReadonlySet<string>, options: ExportOptions): ExportCard[] {
  const cards: ExportCard[] = [];
  for (const deck of decks.filter(d => ids.has(d.id))) {
    const people = new Map(deck.result.directory.attendance.map(a=>[a.id,a]));
    for (const row of deck.result.lines) {
      if (options.sections === 'main' && !['mainboard','commanders'].includes(sectionOf(row))) continue;
      const base = { deckId: deck.id, deck: deck.title, sourceUrl: deck.result.deck.source?.url ?? '', row };
      if (physicalMatch(row)) {
        for (const id of new Set(row.matches.map(m=>m.attendanceId))) {
          const person = people.get(id);
          if (person) cards.push({ ...base, artist: person.rawName, artistId: id, booth: person.booth ?? '', attending: true });
        }
      } else if (options.includeOther) {
        const credit = row.printing?.sourceArtistCredit || [...new Set(row.printing?.faces.map(f=>f.sourceArtistCredit).filter(Boolean))].join(' / ');
        cards.push({ ...base, artist: row.printing ? credit || 'Artist unlisted' : 'Printing needs review', artistId: '', booth: '', attending: false });
      }
    }
  }
  return sortCards(cards);
}
export const exportSection = (row: ResolvedLine) => SECTION_NAMES[sectionOf(row)] ?? sectionOf(row);
export const exportFinish = (row: ResolvedLine) => { const finish=finishOf(row); return finish ? {nonfoil:'Nonfoil',foil:'Foil',etched:'Etched foil'}[finish] : 'Unknown finish'; };
export function exportSummary(cards: ExportCard[]) {
  const physical = new Map(cards.map(c=>[JSON.stringify([c.deckId,c.row.line.key]),c.row.line.quantity]));
  return { copies: [...physical.values()].reduce((a,b)=>a+b,0), entries: cards.length, artists: new Set(cards.filter(c=>c.attending).map(c=>c.artistId)).size };
}
// Quoting alone does not stop spreadsheet formula execution.
export function csvCell(value: unknown): string {
  let text = String(value ?? '');
  if (/^[\s\u0000-\u001f]*[=+@-]/u.test(text) || /^[\t\r\n]/u.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"','""')}"`;
}
export function cardsCsv(cards: ExportCard[]): string {
  const columns = ['Artist','Deck','Quantity','Card','Set','Collector number','Language','Finish','Section','Attending','Booth','Printing artist credit','Face credits','Scryfall ID','Scryfall URL','Source deck URL','Local deck ID','Source row','Resolution'];
  return '\uFEFF' + [columns, ...sortCards([...cards]).map(c => {
    const p = c.row.printing;
    return [c.artist,c.deck,c.row.line.quantity,p?.name ?? c.row.line.name,p?.setCode ?? c.row.line.setCode,p?.collectorNumber ?? c.row.line.collectorNumber,p?.language ?? c.row.line.language,exportFinish(c.row),exportSection(c.row),c.attending?'Yes':'No',c.booth,p?.sourceArtistCredit,p?.faces.map(f=>`${f.name ?? `Face ${f.index+1}`}: ${f.sourceArtistCredit ?? 'Unlisted'}`).join(' | '),p?.id ?? c.row.selectedPrintingId ?? '',p?.scryfallUrl,c.sourceUrl,c.deckId,c.row.line.key,c.row.status];
  })].map(row=>row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
export function cardImages(card: ExportCard): string[] {
  const p = card.row.printing;
  return p?.imageUrl ? [p.imageUrl] : p?.faces.flatMap(f=>f.imageUrl ? [f.imageUrl] : []) ?? [];
}
