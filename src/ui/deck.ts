import type { ArtistView } from './components';
import { escapeHtml as h, icon, externalLink, portrait, artistLinks, printingBadge } from './components';
import type { CardPrinting } from '../models/contracts';
import type { ResolvedLine } from '../imports/types';
import { SECTION_NAMES } from '../imports/types';
import { sectionOf, finishOf } from '../imports/match';
import { safeWebUrl } from '../models/boundaries';

export const sectionName = (key: string) => SECTION_NAMES[key] ?? key;
export function resultRow(r: ResolvedLine, attendanceId = ''): string {
  const p = r.printing!;
  return `<details class="card-row" data-line="${h(r.line.key)}" data-attendance="${h(attendanceId)}"><summary><span class="quantity">${r.line.quantity}×</span><span class="card-main"><strong>${h(p.name)}</strong>${printingBadge(p, finishOf(r))}${r.status !== 'exact' ? `<span class="micro">${r.status === 'alias' ? 'Reviewed legacy mapping' : 'Manually confirmed printing'}</span>` : ''}</span><span class="section-name">${h(sectionName(sectionOf(r)))}</span><span class="expand-label">View card</span>${icon('chevron')}</summary><div class="card-expanded" data-card-content></div></details>`;
}
export function printingImages(p: CardPrinting): string {
  const images = p.imageUrl ? [{ name:p.name, imageUrl:p.imageUrl }] : p.faces.filter(f => f.imageUrl);
  return `<div class="printing-images">${images.length ? images.map(face => {
    try { return `<div class="card-image"><img src="${h(safeWebUrl(face.imageUrl!))}" alt="${h(face.name ?? p.name)} — ${h(p.setCode.toUpperCase())} #${h(p.collectorNumber)} ${h(p.language)}" width="244" height="340" loading="lazy" data-card-image></div>`; }
    catch { return '<p>Image unavailable for this printing.</p>'; }
  }).join('') : '<p>Image unavailable for this printing.</p>'}</div>`;
}
export function resultDetail(r: ResolvedLine, attendanceId = ''): string {
  const p = r.printing!, match = r.matches.find(m => m.attendanceId === attendanceId);
  return `${printingImages(p)}<div><span class="eyebrow">Selected printing${p.paper ? '' : ' · not available in paper'}</span><h3>${h(p.name)}</h3><p>${h(p.setName)} · ${h(p.category)}</p><p>${printingBadge(p,finishOf(r))}</p><p>Printing credit: <strong>${h(p.sourceArtistCredit) || 'Not supplied'}</strong></p>${p.faces.map(face => `<p class="face-credit">${h(face.name ?? `Face ${face.index + 1}`)}: <strong>${h(face.sourceArtistCredit) || 'Credit not supplied'}</strong>${match?.faceIndexes.includes(face.index) ? ' · Matches this artist' : ''}</p>`).join('')}<p>${h(sectionName(sectionOf(r)))} · ${r.line.quantity} ${r.line.quantity === 1 ? 'copy' : 'copies'}</p>${r.line.categories.length ? `<p class="micro">Source categories: ${h(r.line.categories.join(' / '))}</p>` : ''}${r.reason ? `<p class="resolution-notice">${h(r.reason)}</p>` : ''}${externalLink(p.scryfallUrl, `View this printing on Scryfall ${icon('external')}`, `View this printing on Scryfall — ${p.name}`, 'text-link')}<details class="provenance"><summary>Source identity</summary><p>Row ${h(r.line.sourceRowId)} · Provider printing ${h(r.line.sourcePrintingId) || 'not supplied'}</p><p>Scryfall ID: ${h(r.line.scryfallId) || 'not supplied'}</p><p>${h(r.line.setCode) || '?'} #${h(r.line.collectorNumber) || '?'} · language ${h(r.line.language) || 'not supplied'} · finish ${h(r.line.rawFinish) || 'not supplied'}</p><p>Resolved ID: ${h(p.id)}</p></details><button class="text-button" data-review="${h(r.line.key)}">Review this printing or section</button><p class="micro">Card image © Wizards of the Coast.</p></div>`;
}
export function resultGroup(artist: ArtistView, lines: ResolvedLine[]): string {
  const count = lines.reduce((n,r)=>n+r.line.quantity,0);
  return `<section class="artist-group"><header>${portrait(artist.attendance,'portrait portrait-small')}<div><h2>${externalLink(artist.attendance.profileUrl,h(artist.attendance.rawName),`${artist.attendance.rawName} — MagicCon profile`)}</h2><p class="micro">${h(artist.attendance.booth ? `Booth ${artist.attendance.booth}` : 'Booth not listed')}${artist.attendance.days.length ? ` · ${h(artist.attendance.days.join(' · '))}` : ''}</p></div><span class="count-badge">${count} ${count === 1 ? 'copy' : 'copies'}</span></header><div class="group-links">${artistLinks(artist)}</div>${lines.map(r=>resultRow(r,artist.attendance.id)).join('')}</section>`;
}
export function reviewQueue(lines: ResolvedLine[]): string {
  const pending = lines.filter(r => !r.printing || sectionOf(r)==='section_review' || sectionOf(r)==='imported');
  if (!pending.length) return '';
  return `<details class="review-queue" id="review-queue"><summary>${icon('info')} ${pending.length} source lines need review <span class="micro">Across all sections</span></summary><p class="micro">Unresolved printings never contribute artist matches. Unsectioned exports stay outside the default main-deck view until you choose their section.</p>${pending.map(r=>`<div class="review-row"><div><strong>${r.line.quantity}× ${h(r.line.name)}</strong><p>${h(r.line.setCode) || '?'} #${h(r.line.collectorNumber) || '?'} · ${h(r.line.language) || 'language not supplied'}</p><p>${h(!r.printing ? r.reason : 'Confirm this row’s section.')} ${r.line.categories.length ? `Source categories: ${h(r.line.categories.join(' / '))}.` : ''}</p></div><button class="button" data-review="${h(r.line.key)}">Review</button></div>`).join('')}</details>`;
}

