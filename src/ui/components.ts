import { safeWebUrl as validateWebUrl } from '../models/boundaries';
import type { Attendance, ArtistMapping, ArtistStatistics, CardPrinting } from '../models/contracts';

export const escapeHtml = (value: unknown): string => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
// Display helpers hide invalid destinations instead of breaking an entire view.
function safeWebUrl(value: string): URL | null {
  try { return validateWebUrl(value); } catch { return null; }
}
const paths = {
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  download: '<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>',
  archive: '<rect x="3" y="3" width="18" height="4" rx="1"/><path d="M5 7v14h14V7m-9 5h4"/>',
  upload: '<path d="M12 16V4m-4 4 4-4 4 4M4 16v5h16v-5"/>',
  edit: '<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14Z"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  undo: '<path d="M4 4v6h6M4 10l4-4a7 7 0 1 1-1 11"/>',
  external: '<path d="M14 4h6v6m0-6L10 14M10 5H5v14h14v-5"/>',
  cards: '<rect x="7" y="3" width="13" height="17" rx="2"/><path d="m4 7-2 1 3 14 10-2"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  shop: '<path d="m4 9 2-6h12l2 6M5 10v11h14V10M3 9h18M9 21v-7h6v7"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7h.01"/>',
  facebook: '<path d="M15 3h-3a4 4 0 0 0-4 4v14m-3-11h11m-2-7v4h-2v14"/>',
  twitter: '<path d="m4 3 16 18h-5L4 3Zm16 0L4 21"/>',
  youtube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 6 3-6 3Z"/>',
  link: '<path d="m9 15 6-6m-5 9-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m-2 6a4 4 0 0 0 6 0l5-5a4 4 0 0 0-6-6l-2 2"/>',
  chevron: '<path d="m8 5 7 7-7 7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  person: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
} as const;
export type IconName = keyof typeof paths;
export function icon(name: IconName): string {
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
}
export function externalLink(url: string | null | undefined, content: string, label: string, className = ''): string {
  if (!url || !safeWebUrl(url)) return '';
  return `<a class="${className}" href="${escapeHtml(safeWebUrl(url))}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">${content}</a>`;
}
export function iconLink(url: string | null | undefined, name: IconName, label: string): string {
  return externalLink(url, `${icon(name)}<span class="tooltip" aria-hidden="true">${escapeHtml(label)}</span>`, label, 'icon-link');
}
export type ArtistView = { attendance: Attendance; mapping: ArtistMapping; statistics?: ArtistStatistics; scryfallUrl?: string };
export function portrait(artist: Attendance, size = 'portrait'): string {
  const fallback = `<span class="portrait-fallback">${icon('person')}</span>`;
  const picture = artist.portraitUrl && safeWebUrl(artist.portraitUrl)
    ? `<img src="${escapeHtml(safeWebUrl(artist.portraitUrl))}" alt="" loading="lazy" decoding="async" width="96" height="96" data-portrait>` : '';
  return externalLink(artist.profileUrl, `<span class="${size}">${fallback}${picture}</span>`, `${artist.rawName} — official MagicCon profile`, 'portrait-link');
}
export function artistLinks(view: ArtistView): string {
  const artist = view.attendance;
  const seen = new Set([safeWebUrl(artist.profileUrl)?.href, view.scryfallUrl ? safeWebUrl(view.scryfallUrl)?.href : undefined]);
  let links = iconLink(artist.profileUrl, 'pin', `${artist.rawName} — MagicCon profile`) + iconLink(view.scryfallUrl, 'cards', `${artist.rawName} — Scryfall cards`);
  for (const link of artist.links) {
    const url = link.displayUrl && safeWebUrl(link.displayUrl)?.href;
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const platform = link.platform;
    const platformIcon: IconName = platform && ['instagram', 'facebook', 'twitter', 'youtube'].includes(platform) ? platform as IconName : 'link';
    // The event's store field often points to a gallery; retain its published label.
    const name: IconName = link.type === 'website' ? 'globe' : link.type === 'store_url' ? (/gallery/i.test(link.label) || new URL(url).hostname === 'scryfall.com' ? 'cards' : 'shop') : platformIcon;
    links += iconLink(url, name, `${artist.rawName} — ${link.label}`);
  }
  return `<div class="artist-links" role="group" aria-label="Links for ${escapeHtml(artist.rawName)}">${links}</div>`;
}
export function artistCard(view: ArtistView): string {
  const { attendance: artist, statistics } = view;
  const count = statistics?.uniqueCards;
  return `<article class="artist-card">${portrait(artist,'portrait portrait-feature')}<div class="artist-card-body"><h2>${externalLink(artist.profileUrl, escapeHtml(artist.rawName), `${artist.rawName} — official MagicCon profile`)}</h2><p class="artist-location">${artist.booth ? `Booth ${escapeHtml(artist.booth)}` : ''}${artist.booth && artist.days.length ? ' · ' : ''}${escapeHtml(artist.days.join(' · '))}</p><p class="artist-count" title="Unique paper cards illustrated; reprints and languages counted once">${count == null ? 'Card count unavailable' : `${count.toLocaleString()} cards illustrated`}</p>${artistLinks(view)}</div></article>`;
}
export function statusPanel(title: string, detail: string, action = '', kind: 'empty' | 'error' = 'empty'): string {
  return `<div class="state-panel ${kind}"${kind === 'error' ? ' role="alert"' : ''}>${icon(kind === 'error' ? 'info' : 'cards')}<h2>${escapeHtml(title)}</h2><p>${escapeHtml(detail)}</p>${action}</div>`;
}
export function savedDeckRow(title: string, description: string): string {
  return `<button class="deck-row" data-example><span class="deck-row-icon">${icon('cards')}</span><span><strong>${escapeHtml(title)}</strong><span class="muted">${escapeHtml(description)}</span></span><span class="badge">Example</span>${icon('arrow')}</button>`;
}
export type PreviewLine = { section: string; quantity: number; finish: string; attendanceId: string; printing: CardPrinting };
export const sectionLabels: Record<string, string> = { mainboard: 'Main deck', commanders: 'Commander', sideboard: 'Sideboard', maybeboard: 'Maybeboard' };
export function urlInputForm(exampleUrl: string): string {
  return `<form id="import-form"><label for="deck-url">Public deck link</label><div class="url-field">${icon('link')}<input type="url" id="deck-url" name="deck-url" value="${escapeHtml(exampleUrl)}" spellcheck="false" required aria-describedby="import-note import-status" autocomplete="off"></div><p class="field-note" id="import-note">This design preview opens a captured example. Live imports are coming next.</p><button class="button primary" type="submit">Preview example ${icon('arrow')}</button><p id="import-status" class="form-status" role="status"></p></form>`;
}
export function sectionFilter(selected: ReadonlySet<string>): string {
  return `<fieldset class="section-filters"><legend>Deck sections</legend>${Object.entries(sectionLabels).map(([key, label]) => `<label><input type="checkbox" value="${key}" ${selected.has(key) ? 'checked' : ''}><span>${escapeHtml(label)}</span></label>`).join('')}</fieldset>`;
}
export function printingBadge(printing: CardPrinting, finish: string | null): string {
  return `<span class="printing-badge">${escapeHtml(printing.setCode.toUpperCase())} <span aria-hidden="true">·</span> #${escapeHtml(printing.collectorNumber)} <span aria-hidden="true">·</span> ${escapeHtml(printing.language.toUpperCase())} <span aria-hidden="true">·</span> ${escapeHtml(finish === 'nonfoil' ? 'Nonfoil' : finish === 'etched' ? 'Etched foil' : finish === 'foil' ? 'Foil' : 'Finish unknown')}</span>`;
}
export function cardRow(line: PreviewLine): string {
  return `<details class="card-row" data-printing="${escapeHtml(line.printing.id)}"><summary><span class="quantity" aria-label="${line.quantity} ${line.quantity === 1 ? 'copy' : 'copies'}">${line.quantity}×</span><span class="card-main"><strong>${escapeHtml(line.printing.name)}</strong>${printingBadge(line.printing, line.finish)}</span><span class="section-name">${escapeHtml(sectionLabels[line.section])}</span><span class="expand-label">View card</span>${icon('chevron')}</summary><div class="card-expanded" data-card-content></div></details>`;
}
export function cardDetail(line: PreviewLine): string {
  const p = line.printing, url = p.imageUrl && safeWebUrl(p.imageUrl);
  return `<div class="card-image">${url ? `<img src="${escapeHtml(url)}" alt="${escapeHtml(p.name)} — ${escapeHtml(p.setCode.toUpperCase())} #${escapeHtml(p.collectorNumber)}" width="244" height="340" loading="lazy" data-card-image>` : '<p>Image unavailable for this printing.</p>'}</div><div><span class="eyebrow">Selected printing</span><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.setName)}</p><p>${printingBadge(p, line.finish)}</p><p>Illustrated by <strong>${escapeHtml(p.sourceArtistCredit)}</strong></p>${externalLink(p.scryfallUrl, `View this printing on Scryfall ${icon('external')}`, `View this printing on Scryfall — ${p.name}`, 'text-link')}<p class="micro">Card image © Wizards of the Coast.</p></div>`;
}
export function artistGroup(view: ArtistView, lines: PreviewLine[]): string {
  const count = lines.reduce((total, line) => total + line.quantity, 0);
  return `<section class="artist-group"><header>${portrait(view.attendance, 'portrait portrait-small')}<div><h2>${externalLink(view.attendance.profileUrl, escapeHtml(view.attendance.rawName), `${view.attendance.rawName} — MagicCon profile`)}</h2><p class="micro">${view.attendance.booth ? `Booth ${escapeHtml(view.attendance.booth)} · ` : ''}${escapeHtml(view.attendance.days.join(' · '))}</p></div><span class="count-badge">${count} ${count === 1 ? 'copy' : 'copies'}</span>${iconLink(view.scryfallUrl, 'cards', `${view.attendance.rawName} — Scryfall cards`)}</header><div>${lines.map(cardRow).join('')}</div></section>`;
}
