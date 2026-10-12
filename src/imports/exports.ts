import { archSection, finishDeck, makeLine, parseArchidekt, parseMoxfield, quantity, selectedFinish } from './adapters';
import { ImportError, MAX_BYTES, MAX_LINES } from './types';
import type { ImportedDeck } from './types';

export type ExportFormat = 'moxfield-v2' | 'archidekt-json' | 'archidekt-csv' | 'moxfield-text';
/** Quoted multiline cells and doubled quotes; retain Archidekt's bare quotes in card names. */
export function parseCsv(input: string): string[][] {
  const rows: string[][] = []; let row: string[] = [], index = 0;
  while (index < input.length) {
    let cell = '';
    if (input[index] === '"') {
      const quoted = /^"((?:[^"]|"")*)"(?=,|\r?\n|$)/.exec(input.slice(index));
      if (quoted) { cell = quoted[1]!.replace(/""/g, '"'); index += quoted[0].length; }
      else { const end = input.slice(index).search(/[,\r\n]/); const stop = end < 0 ? input.length : index + end; cell = input.slice(index, stop); index = stop; }
    } else {
      const end = input.slice(index).search(/[,\r\n]/); const stop = end < 0 ? input.length : index + end; cell = input.slice(index, stop); index = stop;
    }
    row.push(cell);
    if (input[index] === ',') { index++; if (index === input.length) row.push(''); }
    else { if (input[index] === '\r') index++; if (input[index] === '\n') index++; rows.push(row); row = []; }
    if (rows.length > MAX_LINES + 1 || row.length > 80) throw new ImportError('limit', 'The CSV exceeds the supported import limits.');
  }
  if (row.length) rows.push(row);
  return rows.filter(row => row.some(cell => cell.trim()));
}
export function parseExport(input: string, format: ExportFormat, title = 'Imported export'): ImportedDeck {
  if (new TextEncoder().encode(input).byteLength > MAX_BYTES) throw new ImportError('limit', 'The file or pasted text exceeds 12 MiB.');
  input = input.replace(/^\uFEFF/, '');
  if (!input.trim()) throw new ImportError('format', 'Choose a file or paste an export first.');
  if (format === 'moxfield-v2' || format === 'archidekt-json') {
    let raw: unknown; try { raw = JSON.parse(input); } catch { throw new ImportError('format', 'This file is not valid JSON. Select the matching export format.'); }
    return format === 'moxfield-v2' ? parseMoxfield(raw) : parseArchidekt(raw);
  }
  const deck: ImportedDeck = { provider:format === 'archidekt-csv' ? 'archidekt' : 'moxfield', source:null, title:title.slice(0,200), format,
    importedAt:new Date().toISOString(), sourceUpdatedAt:null, sourceVersion:null, lines:[], notices:[] };
  if (format === 'archidekt-csv') {
    const rows = parseCsv(input), headers = rows.shift()?.map(h=>h.trim()) ?? [];
    const required = ['Quantity','Name','Edition code','Collector number','Category','Secondary categories','Finish','Scryfall ID'];
    if (new Set(headers).size !== headers.length || required.some(h=>!headers.includes(h))) throw new ImportError('format', 'Export Archidekt CSV with the header, Quantity, Name, Edition code, Collector number, Category, Secondary categories, Finish and Scryfall ID columns.');
    rows.forEach((cells, index) => {
      if (cells.length !== headers.length) throw new ImportError('format', `CSV row ${index+2} has an unexpected number of columns.`);
      const row = Object.fromEntries(headers.map((h,i)=>[h,cells[i]!]));
      if (!/^\d+$/.test(row.Quantity!.trim())) throw new ImportError('quantity', `Invalid quantity in CSV row ${index+2}.`);
      const categories = [row.Category!, ...row['Secondary categories']!.split(',')].map(c=>c.trim()).filter(Boolean);
      const rawFinish = row.Finish!.trim() || null;
      deck.lines.push(makeLine({ key:`csv/${index+2}`, name:row.Name!, quantity:quantity(Number(row.Quantity)), categories,
        ...archSection(categories, null), scryfallId:row['Scryfall ID']!.trim() || null,
        setCode:row['Edition code']!.trim().toLowerCase() || null, collectorNumber:row['Collector number']!.trim() || null,
        rawFinish, finish:selectedFinish(rawFinish) }));
    });
    deck.notices.push('CSV category definitions and provider row IDs are not available. File row numbers are retained; custom section memberships may need review.');
  } else {
    const rows = input.split(/\r?\n/).filter(row=>row.trim());
    rows.forEach((row, index) => {
      const match = /^(\d+) (.+) \(([A-Za-z0-9]+)\) (\S+?)(?: \*([FE])\*)?$/.exec(row.trim());
      if (!match) throw new ImportError('format', `Text line ${index+1} is not in Moxfield “Copy for Moxfield” format: quantity, name, (SET), collector number and optional *F* or *E*.`);
      const rawFinish = match[5] === 'F' ? 'foil' : match[5] === 'E' ? 'etched' : 'nonFoil';
      deck.lines.push(makeLine({ key:`text/${index+1}`, name:match[2]!, quantity:quantity(Number(match[1])), section:'imported',
        setCode:match[3]!.toLowerCase(), collectorNumber:match[4]!, rawFinish, finish:selectedFinish(rawFinish) }));
    });
    deck.notices.push('Moxfield text omits printing UUIDs and language. No English default is assumed: confirm each printing. Commander labels and considering cards may also be absent; these lines stay in “Unsectioned export”. Use the public deck link for fuller data.');
  }
  return finishDeck(deck);
}
