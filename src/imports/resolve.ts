import aliases from '../../data/curated/printing-aliases.json';
import type { Catalogue } from '../data/catalogue';
import type { CardPrinting } from '../models/contracts';
import type { ImportLine, Provider, ResolvedLine } from './types';

export function unresolved(line: ImportLine, status: ResolvedLine['status'], reason: string, candidates: string[] = []): ResolvedLine {
  return { line, status, reason, candidates, printing:null, matches:[], attendanceState:'unresolved' };
}
function contradictions(line: ImportLine, printing: CardPrinting): string[] {
  const issues: string[] = [];
  if (line.setCode && line.setCode.toLowerCase() !== printing.setCode) issues.push('set code');
  if (line.collectorNumber && line.collectorNumber !== printing.collectorNumber) issues.push('collector number');
  if (line.language && line.language.toLowerCase() !== printing.language) issues.push('language');
  if (line.finish && !printing.finishes.includes(line.finish)) issues.push('finish');
  if (line.oracleId && !printing.oracleIds.includes(line.oracleId.toLowerCase())) issues.push('Oracle identity');
  return issues;
}
export async function resolveLine(line: ImportLine, provider: Provider, catalogue: Catalogue, signal?: AbortSignal): Promise<ResolvedLine> {
  signal?.throwIfAborted();
  if (line.issues.length) return unresolved(line, 'conflict', line.issues.join(' '));
  let printing: CardPrinting | null = null;
  if (line.scryfallId) {
    const found = await catalogue.lookupPrinting(line.scryfallId.toLowerCase(), signal);
    if (found.status === 'found') printing = found.printing;
    else {
      for (const alias of aliases.aliases) {
        const source = alias.source;
        if (catalogue.manifest.cardSnapshotId !== aliases.baseline || provider !== alias.provider || alias.status !== 'reviewed') continue;
        if (line.scryfallId !== source.id || line.sourcePrintingId !== source.sourcePrintingId || line.name !== source.name || line.setCode !== source.set || line.collectorNumber !== source.cn || line.language !== source.lang || line.finish !== source.finish) continue;
        const target = await catalogue.lookupPrinting(alias.target.id, signal);
        if (target.status !== 'found') return unresolved(line,'unknown','The reviewed legacy mapping target is unavailable; a fresh review is required.');
        const p = target.printing, expected = alias.target;
        if (p.setCode !== expected.set || p.collectorNumber !== expected.cn || p.language !== expected.lang || p.sourceArtistCredit !== expected.artist || p.illustrationId !== expected.illustrationId || !p.finishes.includes(expected.finish as 'etched') || !p.paper) return unresolved(line,'conflict','The reviewed legacy mapping target has changed; a fresh review is required.');
        return { line, printing:p, status:'alias', reason:alias.displayNotice, candidates:[], matches:[], attendanceState:'unresolved' };
      }
      return unresolved(line,'unknown','This source printing ID is absent from the dated catalogue. No different printing was substituted.');
    }
  } else if (line.setCode && line.collectorNumber) {
    const found = await catalogue.lookupTuple(line.setCode.toLowerCase(), line.collectorNumber, line.language ?? undefined, signal);
    if (found.status !== 'found') return unresolved(line,found.status,found.status === 'ambiguous' ? 'Confirm the exact printing and language. The export does not establish a unique complete identity.' : 'No printing in this catalogue matches the source tuple.',found.candidates);
    printing = found.printing;
  } else return unresolved(line,'unknown','An exact printing ID or set, collector number and language is required. Names alone are not used to select a printing.');
  const conflicts = contradictions(line, printing);
  if (conflicts.length) return unresolved(line,'conflict',`The printing ID and source disagree about ${conflicts.join(', ')}. Confirm the actual printing before matching.`, [printing.id]);
  return { line, printing, status:'exact', reason:null, candidates:[], matches:[], attendanceState:'unresolved' };
}
