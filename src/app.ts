import './styles/base.css';
import { Catalogue } from './data/catalogue';
import type { EventDirectory } from './models/contracts';
import { artistCard, escapeHtml as h, externalLink, icon, statusPanel } from './ui/components';
import type { ArtistView } from './ui/components';
import { resultGroup, resultRow, resultDetail, reviewQueue, sectionName } from './ui/deck';
import { openReview } from './ui/review';
import { parseDeckUrl } from './imports/url';
import { ImportClient } from './imports/transport';
import { parseExport } from './imports/exports';
import type { ExportFormat } from './imports/exports';
import { resolveDeck, selectResults, sectionOf } from './imports/match';
import { ImportError, MAX_BYTES } from './imports/types';
import type { DeckResult, ImportedDeck, ResolvedLine } from './imports/types';
import { scryfallArtistUrl } from './ui/artist-url';
import { LocalDatabase, LibrarySession } from './storage/database';
import { createEntry, sameSource, updatedEntry, recompute } from './storage/model';
import type { Library, SavedEntry } from './storage/model';
import { chooseReimport, confirmLocal, renameLocal, downloadBackup, openRestore } from './ui/library';

const main = document.querySelector<HTMLElement>('#main')!;
const footer = document.querySelector<HTMLElement>('#data-freshness')!;
const operation = document.querySelector<HTMLElement>('#operation')!;
const storageStatus = document.querySelector<HTMLElement>('#storage-status')!;
const session = new LibrarySession(undefined, renderStorageStatus);
let storageReady = false, preferencesTimer: ReturnType<typeof setTimeout> | undefined;
let undoLibrary: Library | undefined;
const client = new ImportClient();
let catalogue: Catalogue | undefined, directory: EventDirectory | undefined, artists: ArtistView[] = [];
let result: DeckResult | undefined, active: AbortController | undefined;
let view: 'decks' | 'results' | 'artists' = 'decks';
let loading = true, loadFailed = false;
let resultSearch = '', directorySearch = '', resultSort = 'artist', directorySort = 'name';
let urlDraft = '', pasteDraft = '', formatDraft = 'moxfield-v2';
const sections = new Set(['mainboard','commanders']);
const date = (value: string) => new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(value));

function setView(next: typeof view, focus = true, remember = true): void {
  view = next;
  document.querySelectorAll<HTMLButtonElement>('nav [data-view]').forEach(button => {
    if (button.dataset.view === view) button.setAttribute('aria-current','page'); else button.removeAttribute('aria-current');
  });
  document.title = `${view === 'decks' ? 'Your decks' : view === 'artists' ? 'Artist directory' : 'Deck results'} · Moxgraph`;
  render();
  if (remember) savePreferences();
  if(focus){main.querySelector<HTMLElement>('h1')?.focus();window.scrollTo({top:0,behavior:'instant'});}
}
function selectedEntry(): SavedEntry | undefined { return session.value.decks.find(d => d.id === session.value.selectedId); }
function selectSaved(): void {
  const entry = selectedEntry(); result = entry?.result;
  const filters = entry?.filters; sections.clear(); for (const section of filters?.sections ?? ['mainboard','commanders']) sections.add(section);
  resultSearch = filters?.search ?? ''; resultSort = filters?.sort ?? 'artist';
}
function renderStorageStatus(): void {
  if (!storageReady) { storageStatus.textContent = 'Opening your local deck library…'; return; }
  if (session.error) {
    const detail = session.error instanceof Error ? session.error.message : 'Browser storage is denied, full, or unavailable.';
    storageStatus.innerHTML = `<div role="alert"><strong>Changes are held in this tab; they are not saved.</strong><p>${h(detail)} Download a backup before closing this tab. Previously saved data is retained when a write fails.</p></div><div class="deck-actions"><button class="button" data-backup>Download backup</button><button class="button" data-storage-retry>Retry saving</button></div>`;
  } else storageStatus.innerHTML = `<span role="status">${session.pending || preferencesTimer ? 'Saving on this device…' : 'Saved on this device · No account or cloud sync'}</span>`;
}
function savePreferences(): void {
  if (!storageReady) return;
  session.value = { ...session.value, view, decks: session.value.decks.map(d => d.id === session.value.selectedId ? { ...d, filters: { sections: [...sections], search: resultSearch, sort: resultSort as SavedEntry['filters']['sort'] } } : d) };
  clearTimeout(preferencesTimer);
  preferencesTimer = setTimeout(() => { preferencesTimer = undefined; void session.commit(session.value).catch(storageError); }, 450);
  renderStorageStatus();
}
function storageError(error: unknown): void { session.error = error; renderStorageStatus(); }
async function applyLibrary(next: Library, focus = true): Promise<boolean> {
  clearTimeout(preferencesTimer); preferencesTimer = undefined;
  const saved = await session.commit(next); selectSaved(); setView(session.value.view, focus, false); return saved;
}
async function saveEntry(entry: SavedEntry): Promise<boolean> {
  undoLibrary = undefined;
  const exists = session.value.decks.some(d => d.id === entry.id);
  return applyLibrary({ ...session.value, decks: exists ? session.value.decks.map(d => d.id === entry.id ? entry : d) : [...session.value.decks, entry], selectedId: entry.id, view: 'results' });
}
function artistViews(data: EventDirectory): ArtistView[] {
  return data.attendance.map(attendance => { const mapping = data.mappings.find(m => m.id === attendance.mappingId)!; return { attendance, mapping, statistics: data.statistics.find(s => s.artistKey === mapping.artistKeys[0]), scryfallUrl: scryfallArtistUrl(mapping) }; });
}
async function libraryAction(button: HTMLButtonElement): Promise<void> {
  if (button.hasAttribute('data-backup')) await downloadBackup(session.value);
  if (button.hasAttribute('data-backup-deck')) { const entry = selectedEntry(); if (entry) await downloadBackup({ decks: [entry], selectedId: entry.id, view: 'results' }); }
  if (active || !storageReady) return;
  if (button.dataset.openDeck) {
    const next = { ...session.value, selectedId: button.dataset.openDeck, view: 'results' as const };
    await applyLibrary(next); await updateSavedData();
  }
  if (button.dataset.rename) {
    const entry = session.value.decks.find(d => d.id === button.dataset.rename); if (!entry) return;
    const title = await renameLocal(entry); if (title) { undoLibrary = undefined; const saved = await applyLibrary({ ...session.value, decks: session.value.decks.map(d => d.id === entry.id ? { ...d, title } : d) }); showOperation(saved ? 'Local deck name saved.' : 'Name changed in this tab. Download a backup before closing.'); }
  }
  if (button.dataset.delete) {
    const entry = session.value.decks.find(d => d.id === button.dataset.delete); if (!entry) return;
    if (await confirmLocal('Delete this local deck?', `Remove “${entry.title}”, its cached results and manual choices from this browser? The source deck stays on ${entry.result.deck.provider}. You can undo this removal in this tab.`, 'Delete local deck')) {
      undoLibrary = session.value;
      const decks = session.value.decks.filter(d => d.id !== entry.id);
      const saved = await applyLibrary({ decks, selectedId: session.value.selectedId === entry.id ? decks[0]?.id ?? null : session.value.selectedId, view: 'decks' }); showOperation(saved ? 'Local deck deleted. Undo is available in this tab.' : 'Deck removed from this tab only. Browser storage could not save the removal.');
    }
  }
  if (button.hasAttribute('data-clear-library') && await confirmLocal('Clear all local decks?', `Remove all ${session.value.decks.length} decks, their manual choices and cached results from this browser? Download a backup first if you want to keep them. You can undo this removal in this tab.`, 'Clear all local decks')) {
    undoLibrary = session.value; const saved = await applyLibrary({ decks: [], selectedId: null, view: 'decks' }); showOperation(saved ? 'All local decks cleared. Undo is available in this tab.' : 'Decks cleared from this tab only. Browser storage could not save the removal.');
  }
  if (button.hasAttribute('data-undo') && undoLibrary) { const previous = undoLibrary; undoLibrary = undefined; const saved = await applyLibrary(previous); showOperation(saved ? 'Removal undone. Decks saved on this device.' : 'Removal undone in this tab. Download a backup before closing.'); }
  if (button.hasAttribute('data-restore')) openRestore(() => session.value, async next => {
    undoLibrary = undefined; const saved = await applyLibrary(next);
    showOperation(saved ? 'Backup restored and saved on this device.' : 'Backup restored in this tab. Download it before closing; local storage could not save it.');
    await updateSavedData();
  });
  if (button.hasAttribute('data-storage-retry')) {
    await session.settled();
    // A failed first read is never treated as permission to overwrite an unread library.
    if (!database) {
      const candidate = await LocalDatabase.open(undefined, undefined, databaseChanged);
      try { const saved = await candidate.read(); if (saved.decks.length) throw new Error('Saved decks already exist. Back up this tab, then reload to recover them before merging.'); database = candidate; session.setDatabase(candidate); }
      catch (error) { candidate.close(); throw error; }
    }
    await applyLibrary(session.value, false);
  }
}
let database: LocalDatabase | undefined;
function databaseChanged(): void { database = undefined; session.setDatabase(undefined); storageError(new Error('The database was upgraded by another tab. Download a backup and reload this tab.')); }
async function boot(): Promise<void> {
  try { database = await LocalDatabase.open(undefined, undefined, databaseChanged); session.value = await database.read(); session.setDatabase(database); }
  catch (error) { database?.close(); database = undefined; session.error = error; }
  storageReady = true; selectSaved(); setView(session.value.view, false, false); renderStorageStatus(); await load();
}
async function updateSavedData(): Promise<void> {
  if (active || !catalogue || !directory || loading || loadFailed) return;
  const stale = session.value.decks.filter(d => d.result.dataVersion !== catalogue!.manifest.version || d.result.eventSnapshotId !== catalogue!.manifest.eventSnapshotId);
  if (!stale.length) return;
  active = new AbortController(); const controller = active; updateBusy();
  try {
    const replacements = new Map<string, SavedEntry>();
    for (const entry of stale) { showOperation(`Updating attendance for ${entry.title}. Keeping each selected printing…`); replacements.set(entry.id, await recompute(entry, catalogue, directory, controller.signal)); }
    controller.signal.throwIfAborted();
    const saved = await applyLibrary({ ...session.value, decks: session.value.decks.map(d => replacements.get(d.id) ?? d) }, false);
    showOperation(`Attendance updated using current data. Selected printing IDs were retained.${saved ? '' : ' This update is held in this tab; download a backup before closing.'}`);
  } catch { showOperation('Attendance update did not finish. Your last successful results and their data versions are still available. Reload to retry the attendance update.', true); }
  finally { active = undefined; updateBusy(); operation.querySelector('[data-cancel]')?.setAttribute('data-dismiss',''); operation.querySelector('[data-cancel]')?.removeAttribute('data-cancel'); const button = operation.querySelector('button'); if (button) button.textContent = 'Dismiss'; }
}
function dataState(): string {
  return loading ? '<div class="state-panel" role="status"><span class="loading-dot"></span><h2>Loading the artist directory…</h2></div>' : statusPanel('The catalogue is unavailable','Check your connection, then try loading the data again.','<button class="button" data-retry>Load data again</button>','error');
}
function render(): void { if(view==='decks')renderDecks();else if(view==='artists')renderDirectory();else renderResults();bindImages();updateBusy(); }
function renderDecks(): void {
  main.innerHTML = `<div class="page-heading"><span class="eyebrow">Cards → artists → MagicCon</span><h1 tabindex="-1">Find the artists <br>in your deck.</h1><p>Bring the right cards to the right people.<br>Start with the printing you actually own.</p></div>
    <div class="import-layout"><section class="panel import-panel" aria-labelledby="import-heading"><div class="panel-heading"><span class="step-label">01</span><h2 id="import-heading">Start with a deck link</h2></div><p>Made for public Moxfield and Archidekt decks.</p><form id="import-form"><label for="deck-url">Public deck link</label><div class="url-field">${icon('link')}<input type="text" inputmode="url" id="deck-url" value="${h(urlDraft)}" placeholder="moxfield.com/decks/… or archidekt.com/decks/…" spellcheck="false" required maxlength="2048" aria-describedby="import-note" autocomplete="off"></div><p class="field-note" id="import-note">Your public deck ID is sent to its provider through Moxgraph’s retrieval service. Your selected card printings are matched in this browser.</p><button class="button primary" type="submit" data-import-action>Find artists ${icon('arrow')}</button></form>
    <details class="export-import"><summary>Import a file or paste an export</summary><p class="micro">Choose the format you have. JSON and Archidekt CSV retain printing IDs. Moxfield text omits language and sections, so every row needs review. Name-only lists are not supported.</p><form id="export-form"><label for="export-format">Export format</label><select id="export-format"><option value="moxfield-v2">Moxfield v2 API JSON</option><option value="archidekt-json">Archidekt API JSON</option><option value="archidekt-csv">Archidekt CSV (with Scryfall ID)</option><option value="moxfield-text">Moxfield “Copy for Moxfield” text</option></select><label for="export-file">Choose a file (up to 12 MiB)</label><input id="export-file" type="file" accept=".json,.csv,.txt,application/json,text/csv,text/plain"><label for="export-text">Or paste the export</label><textarea id="export-text" rows="5" spellcheck="false" placeholder="Paste the complete export here…">${h(pasteDraft)}</textarea><p class="micro">Choose a file or paste text, one at a time. Files and pasted exports are processed locally.</p><button class="button" data-import-action>Import export</button></form></details></section>
    <aside class="event-panel"><span class="eyebrow">Meet the artists</span><h2>MagicCon: Atlanta</h2><p class="event-date">November 13–15, 2026</p><p class="muted">Atlanta, Georgia</p><div class="event-rule"></div><div class="event-count"><strong>${directory?.attendance.length ?? '—'}</strong><span>listed artists<br>in the directory</span></div><button class="text-button" data-view="artists">Explore the artists ${icon('arrow')}</button></aside></div>
    <section class="saved-section"><div class="section-heading"><h2>Your saved decks (${session.value.decks.length})</h2><span class="micro">Only on this device</span></div><div class="library-actions"><button class="button" data-backup>Download backup</button><button class="button" data-restore data-library-action>Restore backup</button>${session.value.decks.length ? '<button class="text-button danger" data-clear-library data-library-action>Clear all decks</button>' : ''}${undoLibrary ? '<button class="text-button" data-undo data-library-action>Undo last removal</button>' : ''}</div>${session.value.decks.length ? session.value.decks.map(entry => `<div class="saved-deck"><button class="deck-row" data-open-deck="${entry.id}" data-library-action><span class="deck-row-icon">${icon('cards')}</span><span><strong>${h(entry.title)}</strong><span class="muted">${h(entry.result.deck.provider)} · ${entry.result.deck.lines.length} source lines · ${date(entry.updatedAt)}</span></span>${entry.id === session.value.selectedId ? '<span class="badge">Selected</span>' : ''}${icon('arrow')}</button><div class="saved-deck-actions"><button class="text-button" data-rename="${entry.id}" data-library-action>Rename</button><button class="text-button danger" data-delete="${entry.id}" data-library-action>Delete<span class="sr-only"> ${h(entry.title)}</span></button></div></div>`).join('') : '<div class="saved-empty"><div><strong>Your next signing list starts here.</strong><p>Import a deck to see its exact printings grouped by artist.</p></div></div>'}<p class="source-note">Decks, selected printings and manual choices are saved in this browser’s local storage. They do not sync to other devices. Private browsing, clearing site data or browser storage eviction can erase them; download a backup to keep a copy. Up to 50 decks and 25,000 source lines. No login, tracking cookies or stored credentials.</p><p class="source-note">Public deck links contact their provider through our retrieval service. Card images and artist portraits contact Scryfall and MagicCon. Files, backups, manual choices and local names stay on this device.</p></section>`;
  const url = main.querySelector<HTMLInputElement>('#deck-url')!;
  url.addEventListener('input',()=>{urlDraft=url.value;});
  main.querySelector('#import-form')!.addEventListener('submit',event=>{event.preventDefault();void runImport(async signal=>client.load(parseDeckUrl(url.value),signal));});
  const format = main.querySelector<HTMLSelectElement>('#export-format')!;format.value=formatDraft;
  const paste = main.querySelector<HTMLTextAreaElement>('#export-text')!;
  format.addEventListener('change',()=>{formatDraft=format.value;});paste.addEventListener('input',()=>{pasteDraft=paste.value;});
  main.querySelector('#export-form')!.addEventListener('submit',event=>{event.preventDefault();
    const file = main.querySelector<HTMLInputElement>('#export-file')!.files?.[0], text=paste.value, kind=format.value;
    void runImport(async()=>{
      if(file && text.trim())throw new ImportError('format','Choose a file or pasted text, not both. Clear one and try again.');
      if(file && file.size>MAX_BYTES)throw new ImportError('limit','The file exceeds 12 MiB. Choose a smaller deck export.');
      return {...parseExport(file ? await file.text() : text,kind as ExportFormat,file?.name ?? 'Pasted export'),inputKind:file?'file':'paste'};
    });
  });
}
function renderDirectory(): void {
  main.innerHTML=`<div class="page-heading compact"><span class="eyebrow">MagicCon: Atlanta · November 13–15</span><h1 tabindex="-1">Meet the artists.</h1><p>The people behind the cards. Open a portrait or name for their official MagicCon profile.</p></div><div class="toolbar"><label class="search-field">${icon('search')}<span class="sr-only">Search artists or Scryfall names</span><input id="artist-search" type="search" placeholder="Search artists or Scryfall names…" value="${h(directorySearch)}"></label><label class="sort-field">Sort by<select id="artist-sort"><option value="name">Artist A–Z</option><option value="cards">Most cards illustrated</option></select></label></div><div class="list-meta"><p id="artist-count" role="status"></p><span class="micro">Portraits &amp; profiles from MagicCon</span></div><div id="artist-list"></div><p class="source-note">Counts are unique paper-game cards across the catalogue, not cards in your deck. Reprints and languages do not increase that count. Attendance can change; check the official profiles before your visit.</p>`;
  const search=main.querySelector<HTMLInputElement>('#artist-search')!,sort=main.querySelector<HTMLSelectElement>('#artist-sort')!;sort.value=directorySort;
  search.addEventListener('input',()=>{directorySearch=search.value;updateDirectory();});sort.addEventListener('change',()=>{directorySort=sort.value;updateDirectory();});updateDirectory();
}
function updateDirectory(): void {
  const list=main.querySelector('#artist-list')!,count=main.querySelector('#artist-count')!;
  if(loading||loadFailed){list.innerHTML=dataState();count.textContent='';return;}
  const shown=artists.filter(a=>[a.attendance.rawName,...Object.values(a.mapping.scryfallNames).flat()].join(' ').toLocaleLowerCase().includes(directorySearch.trim().toLocaleLowerCase()));
  shown.sort((a,b)=>(directorySort==='cards'?(b.statistics?.uniqueCards??-1)-(a.statistics?.uniqueCards??-1):0)||a.attendance.rawName.localeCompare(b.attendance.rawName));
  count.textContent=`${shown.length} of ${artists.length} artists`;
  list.innerHTML=shown.length?`<div class="artist-grid">${shown.map(artistCard).join('')}</div>`:statusPanel('No artists found','Try another name or clear your search.','<button class="button" data-clear-artists>Clear search</button>');bindImages();
}
function renderResults(): void {
  if(!result){main.innerHTML=`<h1 tabindex="-1">Deck results</h1>${statusPanel('Start with your deck','Import a public link or supported export to find the artists behind your selected printings.','<button class="button" data-view="decks">Import a deck</button>')}`;return;}
  const {deck}=result, available=[...new Set(['mainboard','commanders',...result.lines.map(sectionOf)])];
  const old=catalogue && Date.now()-Date.parse(catalogue.manifest.sourceUpdatedAt)>14*86400000;
  main.innerHTML=`<button class="text-button back-button" data-view="decks">← Back to decks</button><div class="page-heading compact"><span class="eyebrow">${h(deck.provider)} / ${h(deck.format)}${deck.inputKind ? ` / ${h(deck.inputKind)}` : ''}</span><h1 tabindex="-1">${h(selectedEntry()?.title ?? deck.title)}</h1><p>${deck.lines.reduce((n,l)=>n+l.quantity,0)} captured copies · ${deck.lines.length} source lines · Imported ${date(deck.importedAt)}${deck.sourceUpdatedAt ? ` · Source updated ${date(deck.sourceUpdatedAt)}` : ''}</p></div><div class="deck-actions">${externalLink(deck.source?.url,'View source deck ↗','View source deck','text-link')}${deck.source ? '<button class="button" data-refresh data-import-action>Refresh from source</button>' : ''}<button class="text-button" data-rename="${h(session.value.selectedId ?? '')}" data-library-action>Rename locally</button><button class="text-button" data-backup-deck>Back up this deck</button><span class="micro">${session.error ? 'Held in this tab · not saved' : 'Saved on this device'}</span></div>
    ${old?'<p class="resolution-notice">Card data is more than 14 days old. New printings may remain unresolved. Review the source identity; no different printing is substituted.</p>':''}${deck.notices.length?`<details class="import-notices"><summary>Import notes (${deck.notices.length})</summary><ul>${deck.notices.map(n=>`<li>${h(n)}</li>`).join('')}</ul></details>`:''}
    ${reviewQueue(result.lines)}<div id="result-summary" class="result-summary" aria-live="polite"></div><div class="results-controls"><fieldset class="section-filters"><legend>Deck sections</legend>${available.map(key=>`<label><input type="checkbox" value="${h(key)}" ${sections.has(key)?'checked':''}><span>${h(sectionName(key))} (${result!.lines.filter(r=>sectionOf(r)===key).reduce((n,r)=>n+r.line.quantity,0)})</span></label>`).join('')}</fieldset><div class="toolbar"><label class="search-field">${icon('search')}<span class="sr-only">Search cards or artists</span><input type="search" id="result-search" maxlength="2000" placeholder="Search cards or artists…" value="${h(resultSearch)}"></label><label class="sort-field">Sort by<select id="result-sort"><option value="artist">Artist A–Z</option><option value="copies">Most copies</option><option value="card">Card A–Z within artist</option><option value="set">Set within artist</option></select></label></div></div><div id="result-list"></div><p class="source-note">Totals count each matching physical copy once. A jointly illustrated card appears under each credited attending artist, so group counts can add up to more than the total. Generated token suggestions and digital-only printings are excluded from physical totals.</p><p class="source-note">Data: ${h(result.dataVersion)} · ${h(result.cardSnapshotId)} · ${h(result.eventSnapshotId)}</p>`;
  const search=main.querySelector<HTMLInputElement>('#result-search')!,sort=main.querySelector<HTMLSelectElement>('#result-sort')!;sort.value=resultSort;
  search.addEventListener('input',()=>{resultSearch=search.value;updateResults();savePreferences();});sort.addEventListener('change',()=>{resultSort=sort.value;updateResults();savePreferences();});
  main.querySelectorAll<HTMLInputElement>('.section-filters input').forEach(input=>input.addEventListener('change',()=>{input.checked?sections.add(input.value):sections.delete(input.value);updateResults();savePreferences();}));updateResults();
}
function updateResults(): void {
  if(!result)return;
  const selected=selectResults(result,sections,resultSearch,resultSort), resultArtists=artistViews(result.directory);
  main.querySelector('#result-summary')!.innerHTML=`<div><strong>${selected.copies}</strong><span>matched physical copies</span></div><div><strong>${selected.sourceLines}</strong><span>matched source lines</span></div><div><strong>${selected.printings}</strong><span>unique printings</span></div><div><strong>${selected.groups.length}</strong><span>attending artists</span></div>`;
  const other=selected.other.filter(r=>r.printing),unresolved=selected.other.length-other.length;
  const reason=(r:ResolvedLine)=>!r.printing?.paper?'Not available in paper':r.attendanceState==='credit_missing'?'Artist credit missing':r.attendanceState==='artist_unmapped'?'Artist credit needs mapping review':'No listed attendee for this printing';
  main.querySelector('#result-list')!.innerHTML=(selected.groups.length?selected.groups.map(g=>resultGroup(resultArtists.find(a=>a.attendance.id===g.attendanceId)!,g.lines)).join(''):statusPanel('No artist matches in this view','Select other sections, clear your search, or review unresolved printings. A match requires the selected printing’s artist to be listed at this event.','<button class="button" data-reset-results>Reset filters</button>'))+
    (unresolved?`<p class="source-note">${unresolved} unresolved source lines in this view. Open the review queue above to confirm their printing.</p>`:'')+
    (other.length?`<details class="other-results"><summary>Other resolved lines (${other.length})</summary><p class="micro">Retained for completeness; excluded from matched physical totals.</p>${other.map(r=>`<div class="other-reason">${h(reason(r))}</div>${resultRow(r)}`).join('')}</details>`:'');
  main.querySelectorAll<HTMLDetailsElement>('details[data-line]').forEach(details=>details.addEventListener('toggle',()=>{
    const content=details.querySelector('[data-card-content]')!;
    if(details.open&&!content.hasChildNodes()){const row=result!.lines.find(r=>r.line.key===details.dataset.line);if(row)content.innerHTML=resultDetail(row,details.dataset.attendance);bindImages();}
  }));bindImages();
}
function updateBusy(): void { document.querySelectorAll<HTMLButtonElement>('[data-import-action]').forEach(b=>{b.disabled=!!active||loading||loadFailed||!storageReady;});document.querySelectorAll<HTMLButtonElement>('[data-library-action]').forEach(b=>{b.disabled=!!active||!storageReady;}); }
function showOperation(message:string,error=false):void {
  operation.hidden=false;
  if(!operation.querySelector('[data-message]'))operation.innerHTML='<div data-message role="status"></div>';
  const text=operation.querySelector<HTMLElement>('[data-message]')!;
  text.setAttribute('role',error?'alert':'status');text.textContent=message;
  const action=active?'data-cancel':'data-dismiss';
  if(!operation.querySelector(`[${action}]`)){operation.querySelector('button')?.remove();operation.insertAdjacentHTML('beforeend',active?'<button class="button" data-cancel>Cancel import</button>':'<button class="text-button" data-dismiss>Dismiss</button>');}
  if(error){operation.tabIndex=-1;operation.focus();operation.scrollIntoView({block:'start',behavior:'instant'});}
}
async function runImport(read:(signal:AbortSignal)=>Promise<ImportedDeck>, targetId?:string):Promise<void> {
  if(active)return;
  if(!catalogue||!directory){showOperation('The catalogue is not ready. Open Artists and use Load data again.',true);return;}
  active=new AbortController();const controller=active;updateBusy();showOperation('Reading the deck…');
  try {
    const deck=await read(controller.signal);controller.signal.throwIfAborted();let last=0;
    const next=await resolveDeck(deck,catalogue,directory,controller.signal,(done,total)=>{if(done===total||Date.now()-last>200){showOperation(`Checking exact printings… ${done} of ${total}`);last=Date.now();}});
    controller.signal.throwIfAborted();
    let entry:SavedEntry;
    const matches=session.value.decks.filter(d=>sameSource(d,next));
    const choice=targetId??(matches.length?await chooseReimport(matches):'new');controller.signal.throwIfAborted();
    if(!choice){showOperation('Import cancelled. Your saved decks are unchanged.');return;}
    const prior=session.value.decks.find(d=>d.id===choice);
    entry=prior?await recompute(updatedEntry(prior,next),catalogue,directory,controller.signal):createEntry(next);
    if(choice==='copy')entry.title=`${entry.title.slice(0,1993)} (copy)`;
    controller.signal.throwIfAborted();const saved=await saveEntry(entry);
    const pending=entry.result.lines.filter(r=>!r.printing).length;
    showOperation(`${saved?'Saved':'Loaded in this tab:'} ${entry.title}. ${pending} source ${pending===1?'line needs':'lines need'} printing review.${saved?'':' Download a backup; browser storage could not save this change.'}`);
  }catch(error){
    const message=controller.signal.aborted?'Import cancelled.':error instanceof Error && !(error instanceof DOMException)?error.message:'Catalogue data could not be verified. Check your connection and retry, or reload the page for current data.';
    const retry=error instanceof ImportError&&error.retryAt?` Retry after ${new Date(error.retryAt).toLocaleTimeString()}.`:'';
    showOperation(`${message}${retry}${result?' Your previous result is still available.':''}`,true);
  }finally{active=undefined;updateBusy();const cancel=operation.querySelector('[data-cancel]');if(cancel)cancel.outerHTML='<button class="text-button" data-dismiss>Dismiss</button>';}
}
function bindImages():void {
  document.querySelectorAll<HTMLImageElement>('img[data-portrait],img[data-card-image]').forEach(image=>{
    const failed=()=>{if(image.hasAttribute('data-portrait'))image.remove();else{const message=document.createElement('p');message.textContent='Image unavailable for this printing.';image.replaceWith(message);}};
    image.onerror=failed;if(image.complete&&!image.naturalWidth)failed();
  });
}
document.addEventListener('click',event=>{
  const button=(event.target as Element).closest<HTMLButtonElement>('button');if(!button)return;const next=button.dataset.view;
  if(next==='decks'||next==='artists'||next==='results')setView(next);
  if(button.hasAttribute('data-cancel'))active?.abort();
  if(button.hasAttribute('data-dismiss'))operation.hidden=true;
  if(button.hasAttribute('data-refresh')&&result?.deck.source){const source=result.deck.source;void runImport(signal=>client.load(source,signal),session.value.selectedId??undefined);}
  if(button.hasAttribute('data-retry'))void load();
  if(button.dataset.review&&!active&&result&&catalogue&&directory){const owner=selectedEntry();if(owner)void openReview(button.dataset.review,result,catalogue,directory,chosen=>{if(result!==owner.result||active)return;void saveEntry({...owner,updatedAt:new Date().toISOString(),result:{...owner.result,lines:owner.result.lines.map(r=>r.line.key===chosen.line.key?chosen:r)}}).then(saved=>showOperation(`Confirmed ${chosen.printing!.name}.${saved?' Saved on this device.':' Download a backup to preserve this choice.'}`)).catch(storageError);},bindImages);}
  void libraryAction(button).catch(error=>showOperation(error instanceof Error?error.message:'The local action could not finish.',true));
  if(button.hasAttribute('data-clear-artists')){directorySearch='';renderDirectory();main.querySelector<HTMLInputElement>('#artist-search')?.focus();}
  if(button.hasAttribute('data-reset-results')){sections.clear();sections.add('mainboard');sections.add('commanders');resultSearch='';resultSort='artist';savePreferences();renderResults();main.querySelector<HTMLInputElement>('#result-search')?.focus();}
});
async function load():Promise<void>{
  if(active)return;loading=true;loadFailed=false;footer.textContent='Loading event data…';render();
  try{catalogue=await Catalogue.open();directory=await catalogue.event();artists=artistViews(directory);footer.textContent=`Event checked ${date(directory.event.retrievedAt)} · Card data ${date(catalogue.manifest.sourceUpdatedAt)}`;}
  catch{loadFailed=true;footer.textContent='Current event data unavailable';showOperation(result?'Current data could not load. Your saved results are still available with their recorded data versions. Open Artists to retry.':'The catalogue could not load. Open Artists to retry.',true);}
  loading=false;if(view==='artists')updateDirectory();else if(view==='decks'){const count=main.querySelector('.event-count strong');if(count)count.textContent=directory?String(directory.attendance.length):'—';if(loadFailed)showOperation('The catalogue could not load. Open Artists to retry.',true);}updateBusy();if(!loadFailed)await updateSavedData();
}
setView('decks',false,false);void boot();


