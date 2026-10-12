import { escapeHtml as h } from './components';
import type { Library, SavedEntry } from '../storage/model';
import { mergeLibraries } from '../storage/model';
import { checkedLibrary, exportBackup, importBackup, MAX_BACKUP_BYTES } from '../storage/codec';

function dialog(title: string, content: string): HTMLDialogElement {
  const trigger = document.activeElement as HTMLElement, element = document.createElement('dialog');
  element.className = 'library-dialog'; element.setAttribute('aria-labelledby','library-title');
  element.innerHTML = `<form method="dialog"><button class="text-button dialog-close" aria-label="Close dialog">Close ×</button></form><h2 id="library-title">${h(title)}</h2>${content}`;
  document.body.append(element); element.showModal();
  element.addEventListener('close', () => { element.remove(); if (trigger?.isConnected) trigger.focus(); });
  return element;
}
export function confirmLocal(title: string, message: string, action: string): Promise<boolean> {
  return new Promise(resolve => {
    const d = dialog(title, `<p>${h(message)}</p><form method="dialog" class="dialog-actions"><button class="button" value="cancel">Cancel</button><button class="button danger" value="confirm">${h(action)}</button></form>`);
    d.addEventListener('close', () => resolve(d.returnValue === 'confirm'));
  });
}
export function renameLocal(entry: SavedEntry): Promise<string | null> {
  return new Promise(resolve => {
    const d = dialog('Rename this deck', `<p>This changes its name only in this browser.</p><form id="rename-form"><label for="local-title">Local deck name</label><input id="local-title" value="${h(entry.title)}" required maxlength="2000"><button class="button primary">Save name</button></form>`);
    let name: string | null = null;
    d.querySelector('input')!.select();
    d.querySelector('#rename-form')!.addEventListener('submit', e => { e.preventDefault(); const value = d.querySelector('input')!.value.trim(); if (value) { name = value; d.close(); } });
    d.addEventListener('close', () => resolve(name));
  });
}
export function chooseReimport(entries: SavedEntry[]): Promise<string | null> {
  return new Promise(resolve => {
    const d = dialog('This deck is already saved', `<p>Choose which local copy to update, or keep a separate copy. An update keeps its local name and filters. Manual choices carry over only for unchanged source rows.</p><form id="reimport-form"><label for="update-target">Save this import as</label><select id="update-target">${entries.map(e => `<option value="${e.id}">Update ${h(e.title)}</option>`).join('')}<option value="copy">A separate copy</option></select><button class="button primary">Continue</button></form>`);
    let choice: string | null = null;
    d.querySelector('#reimport-form')!.addEventListener('submit', e => { e.preventDefault(); choice = d.querySelector('select')!.value; d.close(); });
    d.addEventListener('close', () => resolve(choice));
  });
}
export async function downloadBackup(library: Library): Promise<void> {
  const data = await exportBackup(library), url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = `moxgraph-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
}
export function openRestore(current: () => Library, apply: (value: Library) => Promise<void>): void {
  const d = dialog('Restore a deck backup', `<p>A Moxgraph backup contains your deck lists, exact printings, manual choices and filters. Its contents stay in this browser.</p><form id="backup-read"><label for="backup-file">Moxgraph JSON backup (up to 32 MiB)</label><input id="backup-file" type="file" accept=".json,application/json"><details><summary>Or paste backup JSON</summary><label for="backup-text">Backup JSON</label><textarea id="backup-text" rows="5" spellcheck="false"></textarea></details><button class="button">Preview backup</button></form><p id="backup-status" role="status"></p><div id="backup-preview"></div>`);
  const status = d.querySelector<HTMLElement>('#backup-status')!, area = d.querySelector<HTMLElement>('#backup-preview')!;
  let busy = false;
  d.querySelector('#backup-read')!.addEventListener('submit', async event => {
    event.preventDefault(); if (busy) return; busy = true; area.innerHTML = ''; status.textContent = 'Validating backup…';
    try {
      const file = d.querySelector<HTMLInputElement>('#backup-file')!.files?.[0], pasted = d.querySelector<HTMLTextAreaElement>('#backup-text')!.value;
      if (file && pasted.trim()) throw new Error('Choose a file or pasted backup, not both.');
      if (file && file.size > MAX_BACKUP_BYTES) throw new Error('This file exceeds 32 MiB. Nothing was replaced.');
      const incoming = await importBackup(file ? await file.text() : pasted); if (!d.open) return;
      const existing = current(), overlap = incoming.decks.filter(x => existing.decks.some(y => x.id === y.id)).length;
      status.textContent = 'Backup validated. Review the changes before restoring.';
      area.innerHTML = `<h3>${incoming.decks.length} decks · ${incoming.decks.reduce((n,x) => n + x.result.lines.length, 0)} source lines</h3><ul class="backup-decks">${incoming.decks.map(x => `<li>${h(x.title)} <span class="muted">(${h(x.result.deck.provider)})</span></li>`).join('')}</ul><form id="backup-apply"><fieldset><legend>How to restore</legend><label><input type="radio" name="restore-mode" value="merge" checked> Merge: add ${incoming.decks.length - overlap} decks; keep ${overlap} existing IDs unchanged.</label><label><input type="radio" name="restore-mode" value="replace"> Replace: remove all ${existing.decks.length} local decks and use only this backup.</label></fieldset><p class="field-note">Separate copies of the same provider deck remain separate. Download a backup of your current library before replacing it.</p><button type="button" class="text-button" data-current-backup>Download current backup</button><button class="button primary">Confirm restore</button></form>`;
      area.querySelector('[data-current-backup]')!.addEventListener('click', () => { void downloadBackup(current()).catch(() => { status.textContent = 'Backup download could not be prepared. Your decks have not changed.'; }); });
      area.querySelector('#backup-apply')!.addEventListener('submit', async event => {
        event.preventDefault(); if (busy) return; busy = true;
        try {
          // Rebuild against current state; a stale preview must not resurrect a deleted deck.
          if (current() !== existing) throw new Error('Your library changed while this preview was open. Preview this backup again.');
          const mode = area.querySelector<HTMLInputElement>('input:checked')!.value as 'merge' | 'replace';
          const next = mergeLibraries(existing, incoming, mode); checkedLibrary(next);
          await apply(next); d.close();
        } catch (error) { status.textContent = error instanceof Error ? error.message : 'Restore failed. Your previous library is unchanged.'; }
        finally { busy = false; }
      });
    } catch (error) { status.textContent = error instanceof Error ? error.message : 'The backup could not be validated. Nothing was replaced.'; }
    finally { busy = false; }
  });
}
