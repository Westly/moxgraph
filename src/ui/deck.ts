import type { ArtistView } from './components';
import { escapeHtml as h, externalLink, portrait, artistLinks, printingBadge } from './components';
import type { CardPrinting } from '../models/contracts';
import type { ResolvedLine } from '../imports/types';
import { SECTION_NAMES } from '../imports/types';
import { sectionOf, finishOf } from '../imports/match';
import { safeWebUrl } from '../models/boundaries';

export const sectionName = (key: string) => SECTION_NAMES[key] ?? key;
export function printingImages(p: CardPrinting): string {
  const images = p.imageUrl ? [{ name:p.name, imageUrl:p.imageUrl }] : p.faces.filter(f => f.imageUrl);
  return `<div class="printing-images${images.length > 1 ? ' multiple-faces' : ''}">${images.length ? images.map(face => {
    try { return `<div class="card-image">${externalLink(p.scryfallUrl, `<img src="${h(safeWebUrl(face.imageUrl!))}" alt="${h(face.name ?? p.name)} — ${h(p.setCode.toUpperCase())} #${h(p.collectorNumber)} ${h(p.language)}" width="244" height="340" loading="lazy" decoding="async" data-card-image>`, `${face.name ?? p.name} — view this printing on Scryfall`)}</div>`; }
    catch { return '<div class="card-image image-missing">Image unavailable</div>'; }
  }).join('') : '<div class="card-image image-missing">Image unavailable</div>'}</div>`;
}
export function resultRow(r: ResolvedLine, artist?: ArtistView): string {
  const p = r.printing!;
  return `<article class="card-tile" data-line="${h(r.line.key)}"><div class="card-tile-top"><span>${artist ? externalLink(artist.attendance.profileUrl,h(artist.attendance.rawName),`${artist.attendance.rawName}${artist.attendance.booth ? ` — Booth ${artist.attendance.booth}` : ''}`) : h(p.sourceArtistCredit ?? 'Artist unlisted')}</span>${artist ? portrait(artist.attendance,'portrait portrait-badge') : ''}</div>${printingImages(p)}<div class="card-caption"><h3><span class="copy-pill">${r.line.quantity}×</span> ${externalLink(p.scryfallUrl,h(p.name),`${p.name} — view this printing on Scryfall`)}</h3>${printingBadge(p,finishOf(r))}</div></article>`;
}
// Kept concise for reuse in the focused printing review workflow.
export function resultDetail(r: ResolvedLine): string {
  const p = r.printing!;
  return `${printingImages(p)}<div><h3>${h(p.name)}</h3><p>${printingBadge(p,finishOf(r))}</p><p>${h(p.sourceArtistCredit)}</p></div>`;
}
export function resultGroup(artist: ArtistView, lines: ResolvedLine[]): string {
  const count = lines.reduce((n,r)=>n+r.line.quantity,0);
  return `<section class="artist-group"><header><div><h2>${externalLink(artist.attendance.profileUrl,h(artist.attendance.rawName),`${artist.attendance.rawName} — MagicCon profile`)}</h2><p class="micro">${artist.attendance.booth ? `Booth ${h(artist.attendance.booth)} · ` : ''}${count} ${count === 1 ? 'card' : 'cards'}</p></div>${artistLinks(artist)}</header><div class="card-grid">${lines.map(r=>resultRow(r,artist)).join('')}</div></section>`;
}
export function resultTable(lines: ResolvedLine[]): string {
  if (!lines.length) return '';
  return `<section class="card-table-section"><h2>Card list</h2><div class="table-scroll" role="region" aria-label="Card list" tabindex="0"><table class="card-table"><thead><tr><th scope="col">Card</th><th scope="col">Qty</th><th scope="col">Artist credit</th><th scope="col">Printing</th><th scope="col">Section</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead><tbody>${lines.map(r => `<tr><th scope="row">${h(r.printing?.name ?? r.line.name)}</th><td>${r.line.quantity}</td><td>${h(r.printing?.sourceArtistCredit ?? r.printing?.faces.map(f=>f.sourceArtistCredit).filter(Boolean).join(' / ')) || 'Needs review'}</td><td>${r.printing ? printingBadge(r.printing,finishOf(r)) : 'Needs review'}</td><td>${h(sectionName(sectionOf(r)))}</td><td><button class="text-button" data-review="${h(r.line.key)}" aria-label="Edit printing or section for ${h(r.line.name)}">Edit</button></td></tr>`).join('')}</tbody></table></div></section>`;
}
export function reviewQueue(lines: ResolvedLine[]): string {
  const pending = lines.filter(r => !r.printing || sectionOf(r)==='section_review' || sectionOf(r)==='imported');
  if (!pending.length) return '';
  return `<section class="review-queue" id="review-queue"><h2>${pending.length} ${pending.length === 1 ? 'card needs' : 'cards need'} review</h2>${pending.map(r=>`<div class="review-row"><div><strong>${r.line.quantity}× ${h(r.line.name)}</strong><p>${h(!r.printing ? r.reason : 'Choose a deck section.')}</p></div><button class="button" data-review="${h(r.line.key)}">Review</button></div>`).join('')}</section>`;
}
