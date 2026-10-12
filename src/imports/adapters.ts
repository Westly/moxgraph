import { ImportError, MAX_LINES, UUID } from './types';
import type { Finish, ImportedDeck, ImportLine, Provider, Source } from './types';

export function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ImportError('format', `The ${label} data is not in the supported format.`);
  return value as Record<string, unknown>;
}
export function text(value: unknown, fallback = ''): string {
  if (value == null) return fallback;
  if (typeof value !== 'string' || value.length > 2000) throw new ImportError('format', 'A source text field is invalid or too long.');
  return value;
}
export function identity(value: unknown): string | null {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && Number.isSafeInteger(value)) return String(value);
  return text(value) || null;
}
function timestamp(value: unknown): string | null {
  if(value==null)return null;
  const raw=text(value), parsed=Date.parse(raw);
  if(!Number.isFinite(parsed))throw new ImportError('format','A source timestamp is invalid. Use a fresh snapshot.');
  return new Date(parsed).toISOString();
}
export function quantity(value: unknown, zero = false): number {
  if (!Number.isSafeInteger(value) || Number(value) < (zero ? 0 : 1) || Number(value) > 100000) throw new ImportError('quantity', 'A card quantity or section count is invalid. Export a fresh, complete snapshot and try again.');
  return value as number;
}
export function selectedFinish(raw: string | null): Finish | null {
  return raw === 'nonFoil' || raw === 'Normal' || raw === 'nonfoil' ? 'nonfoil' : raw === 'Foil' || raw === 'foil' ? 'foil' : raw === 'Etched' || raw === 'etched' ? 'etched' : null;
}
export function makeLine(partial: Partial<ImportLine> & Pick<ImportLine, 'key' | 'name' | 'quantity' | 'section'>): ImportLine {
  const line: ImportLine = { sourceRowId: partial.key, sourcePrintingId: null, scryfallId: null, oracleId: null,
    categories: [], setCode: null, collectorNumber: null, language: null, finish: null, rawFinish: null, issues: [], ...partial };
  for(const value of [line.name,line.key,line.sourceRowId,line.sourcePrintingId,line.scryfallId,line.oracleId,line.setCode,line.collectorNumber,line.language,line.rawFinish,...line.categories])if(value!=null)text(value);
  if(line.categories.length>100)throw new ImportError('limit','Too many categories on a card row.');
  if (line.scryfallId && !UUID.test(line.scryfallId)) line.issues.push('The source printing UUID is invalid.');
  if (line.rawFinish && !line.finish) line.issues.push(`Unrecognized finish: ${line.rawFinish}.`);
  if (line.setCode && !/^[a-z0-9]+$/i.test(line.setCode)) line.issues.push('The source set code is invalid.');
  if (line.language && !/^[a-z]{2,3}$/i.test(line.language)) line.issues.push('The source language is invalid.');
  return line;
}
export function finishDeck(deck: ImportedDeck): ImportedDeck {
  if (deck.lines.length > MAX_LINES || deck.lines.reduce((sum, line) => sum + line.quantity, 0) > 100000) throw new ImportError('limit', `This import exceeds ${MAX_LINES.toLocaleString()} lines or 100,000 copies.`);
  if (new Set(deck.lines.map(line => line.key)).size !== deck.lines.length) throw new ImportError('format', 'Duplicate source row identifiers were found. Import a fresh export.');
  return deck;
}
function base(provider: Provider, title: string, source: Source | null, format: ImportedDeck['format']): ImportedDeck {
  return { provider, title: title || 'Untitled deck', source, format, importedAt: new Date().toISOString(), sourceUpdatedAt: null, sourceVersion: null, lines: [], notices: [] };
}
export function parseMoxfield(value: unknown, expected?: Source): ImportedDeck {
  const raw = object(value, 'Moxfield v2 deck');
  if (raw.boards || !raw.mainboard || !/^[A-Za-z0-9_-]{22}$/.test(text(raw.publicId))) throw new ImportError('format', 'Use the Moxfield v2 deck JSON. This response is not a supported v2 snapshot.');
  const id = text(raw.publicId);
  if (expected && (expected.provider !== 'moxfield' || expected.id !== id)) throw new ImportError('format', 'The response belongs to a different deck.');
  if (raw.private === true || raw.visibility === 'private') throw new ImportError('private', 'Only public decks can be imported.');
  const deck = base('moxfield', text(raw.name), { provider:'moxfield', id, url:`https://moxfield.com/decks/${id}` }, 'moxfield-v2');
  deck.sourceUpdatedAt = timestamp(raw.lastUpdatedAtUtc); deck.sourceVersion = identity(raw.version);
  const sections = new Set(['mainboard','commanders','sideboard','maybeboard','companions','signatureSpells','attractions','stickers']);
  for (const key of Object.keys(raw)) if (key.endsWith('Count') && raw[key.slice(0, -5)] && typeof raw[key.slice(0, -5)] === 'object') sections.add(key.slice(0, -5));
  for (const section of sections) {
    if (raw[section] === undefined && raw[`${section}Count`] === undefined) continue;
    const board = object(raw[section], `${section} section`);
    const declared = quantity(raw[`${section}Count`], true); let total = 0;
    for (const [rowId, value] of Object.entries(board)) {
      const row = object(value, 'card row'), parentQuantity = quantity(row.quantity);
      if (row.printingData != null && !Array.isArray(row.printingData)) throw new ImportError('format', 'Moxfield printing selections are malformed.');
      const selected = Array.isArray(row.printingData) && row.printingData.length ? row.printingData : [row];
      let rowTotal = 0;
      selected.forEach((selectedValue, index) => {
        const child = object(selectedValue, 'selected printing');
        const card = child.card == null ? {} : object(child.card, 'selected card');
        const qty = quantity(child.quantity); rowTotal += qty; total += qty;
        const rawFinish = identity(child.finish), sourcePrintingId = identity(card.id ?? child.id);
        const issues = child.card == null ? ['The selected child printing has no card identity; its parent identity was not borrowed.'] : [];
        deck.lines.push(makeLine({ key: `${section}/${rowId}/${index}`, sourceRowId: rowId, sourcePrintingId,
          name: text(card.name, rowId), quantity: qty, section, categories: [section],
          scryfallId: identity(card.scryfall_id), setCode: identity(card.set)?.toLowerCase() ?? null,
          collectorNumber: identity(card.cn), language: identity(card.lang)?.toLowerCase() ?? null,
          rawFinish, finish: selectedFinish(rawFinish), issues }));
        if (deck.lines.length > MAX_LINES) throw new ImportError('limit', 'This deck has too many selected printing lines.');
      });
      if (rowTotal !== parentQuantity) throw new ImportError('quantity', `Moxfield supplied inconsistent quantities in ${section}. Selected printings total ${rowTotal}, but their row declares ${parentQuantity}. Nothing was imported; refresh the source or use a complete file export.`);
    }
    if (total !== declared) throw new ImportError('quantity', `Moxfield supplied inconsistent ${section} quantities: ${total} copies versus ${declared} declared. Nothing was imported. Refresh the source or use a complete export; no quantities have been guessed.`);
  }
  if (Array.isArray(raw.tokens) && raw.tokens.length) deck.notices.push(`Moxfield v2 lists ${raw.tokens.length} generated token suggestions without selected quantities. These suggestions are not imported as owned token copies.`);
  return finishDeck(deck);
}
export type CategoryDefinition = { name: string; included: boolean };
const reserved: Record<string, string> = { commander:'commanders', commanders:'commanders', sideboard:'sideboard', maybeboard:'maybeboard', considering:'maybeboard', companion:'companions', companions:'companions', tokens:'tokens', token:'tokens', 'signature spells':'signatureSpells', attractions:'attractions', stickers:'stickers' };
export function archSection(categories: string[], definitions: CategoryDefinition[] | null, companion = false): { section: string; issues: string[] } {
  const explicit = new Set(categories.map(c => {const key=c.trim().toLowerCase();return Object.hasOwn(reserved,key)?reserved[key]:undefined;}).filter((s): s is string => Boolean(s)));
  if (companion) explicit.add('companions');
  if (explicit.size > 1) return { section:'section_review', issues:['Conflicting reserved deck categories; confirm the section before counting this line.'] };
  if (explicit.size === 1) return { section:[...explicit][0]!, issues:[] };
  if (!definitions) {
    const standard = new Set(['land','creature','artifact','enchantment','sorcery','instant','planeswalker','battle','mainboard','main deck']);
    return categories.length && categories.every(c => standard.has(c.toLowerCase())) ? { section:'mainboard', issues:[] } : { section:'section_review', issues:['This CSV does not define whether its custom categories are in the deck. Confirm the section.'] };
  }
  const flags = categories.map(c => definitions.find(d => d.name === c)?.included);
  if (flags.some(f => f === undefined) || flags.includes(true) && flags.includes(false)) return { section:'section_review', issues:['Unknown or conflicting category inclusion; confirm the deck section.'] };
  return { section:flags.length && flags.every(f => f === false) ? 'outside' : 'mainboard', issues:[] };
}
export function parseArchidekt(value: unknown, expected?: Source): ImportedDeck {
  const raw = object(value, 'Archidekt deck'), id = identity(raw.id);
  if (!id || !/^[1-9][0-9]{0,15}$/.test(id) || !Array.isArray(raw.cards) || !Array.isArray(raw.categories)) throw new ImportError('format', 'The Archidekt response is missing its deck, cards or category definitions.');
  if (expected && (expected.provider !== 'archidekt' || expected.id !== id)) throw new ImportError('format', 'The response belongs to a different deck.');
  if (raw.private === true) throw new ImportError('private', 'Only public decks can be imported.');
  const deck = base('archidekt', text(raw.name), { provider:'archidekt', id, url:`https://archidekt.com/decks/${id}` }, 'archidekt-json');
  const definitions = raw.categories.map(value => { const category = object(value, 'category'); if (typeof category.includedInDeck !== 'boolean') throw new ImportError('format', 'Category inclusion metadata is missing.'); return { name:text(category.name), included:category.includedInDeck }; });
  if (new Set(definitions.map(c=>c.name)).size !== definitions.length) throw new ImportError('format', 'Duplicate Archidekt category definitions.');
  deck.sourceUpdatedAt = timestamp(raw.updatedAt);
  for (const value of raw.cards) {
    const row = object(value, 'card row'), card = object(row.card, 'selected card'), oracle = object(card.oracleCard, 'oracle display information');
    const edition = card.edition == null ? {} : object(card.edition, 'edition');
    if (!Array.isArray(row.categories)) throw new ImportError('format', 'Card categories are missing.');
    const categories = row.categories.map(value => text(value));
    const section = archSection(categories, definitions, row.companion === true);
    const rowId = identity(row.id); if (!rowId) throw new ImportError('format', 'An Archidekt row identifier is missing.');
    const rawFinish = identity(row.modifier);
    deck.lines.push(makeLine({ key: `archidekt/${rowId}`, sourceRowId:rowId, sourcePrintingId:identity(card.id),
      name:text(oracle.name, 'Unnamed card'), quantity:quantity(row.quantity), ...section, categories,
      scryfallId:identity(card.uid), oracleId:identity(oracle.uid), setCode:identity(edition.editioncode)?.toLowerCase() ?? null,
      collectorNumber:identity(card.collectorNumber), language:null, rawFinish, finish:selectedFinish(rawFinish) }));
  }
  return finishDeck(deck);
}
