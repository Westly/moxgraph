import { checkedLibrary, migrateV1, unpackLibrary } from './codec';
import type { PackedEntry, PackedLibrary } from './codec';
import type { Library } from './model';
import { emptyLibrary } from './model';

export const DATABASE_NAME = 'moxgraph-local';
export const DATABASE_VERSION = 2;
const STORES = ['decks','lines','choices','cache','settings'] as const;
export class StorageConflictError extends Error {
  constructor() { super('Another tab changed your saved decks. Download a backup of this tab, then reload before saving again.'); }
}
export class LocalDatabase {
  private revision = 0;
  private loaded = false;
  private constructor(private readonly db: IDBDatabase) {}
  static open(factory: IDBFactory | undefined = globalThis.indexedDB, name = DATABASE_NAME, changed: () => void = () => {}): Promise<LocalDatabase> {
    return new Promise((resolve, reject) => {
      if (!factory) { reject(new Error('Browser storage is unavailable.')); return; }
      let settled = false, request: IDBOpenDBRequest;
      const fail = (error: unknown) => { if (!settled) { settled = true; clearTimeout(timer); reject(error); } };
      const timer = setTimeout(() => fail(new Error('Storage did not open. Close other Moxgraph tabs and retry.')), 5000);
      try { request = factory.open(name, DATABASE_VERSION); } catch (error) { fail(error); return; }
      request.onblocked = () => fail(new Error('A previous Moxgraph tab is holding the database open. Close it and reload.'));
      request.onerror = () => fail(request.error);
      request.onupgradeneeded = event => {
        const db = request.result, tx = request.transaction!;
        if (settled) { tx.abort(); return; }
        // No database is ever deleted to recover from an upgrade or validation error.
        for (const store of STORES) if (!db.objectStoreNames.contains(store)) db.createObjectStore(store, { keyPath: store === 'settings' ? 'key' : 'id' });
        if (event.oldVersion === 1) {
          const cursor = tx.objectStore('decks').openCursor();
          cursor.onsuccess = () => { const item = cursor.result; if (!item) return;
            try { writeEntry(tx, migrateV1(item.value)); item.continue(); } catch { tx.abort(); }
          };
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        if (settled) { db.close(); return; }
        settled = true; clearTimeout(timer);
        db.onversionchange = () => { db.close(); changed(); };
        resolve(new LocalDatabase(db));
      };
    });
  }
  close(): void { this.db.close(); }
  read(): Promise<Library> {
    return new Promise((resolve, reject) => {
      let tx: IDBTransaction; try { tx = this.db.transaction(STORES, 'readonly'); } catch (error) { reject(error); return; }
      const timer = setTimeout(() => { try { tx.abort(); } catch { /* finished */ } }, 5000);
      const records = new Map<string, unknown[]>();
      for (const name of STORES) { const request = tx.objectStore(name).getAll(undefined, 51); request.onsuccess = () => records.set(name, request.result); }
      tx.onabort = () => { clearTimeout(timer); reject(tx.error ?? new Error('Reading local storage was interrupted.')); };
      tx.oncomplete = () => {
        clearTimeout(timer);
        try {
          let decks = records.get('decks') as Omit<PackedEntry, 'lines' | 'choices' | 'cache'>[];
          const settings = records.get('settings') as { key: string; revision: number; selectedId: string | null; view: Library['view']; deckOrder?: string[] }[];
          if (settings.length > 1 || settings[0] && settings[0].key !== 'library') throw new Error('Invalid local settings.');
          const state = settings[0];
          if (state && (!Number.isSafeInteger(state.revision) || state.revision < 0)) throw new Error('Invalid local revision.');
          if (state?.deckOrder) {
            const order = state.deckOrder;
            if (!Array.isArray(order) || order.length !== decks.length || new Set(order).size !== decks.length || order.some(id => !decks.some(d => d.id === id))) throw new Error('Invalid deck order.');
            const byId = new Map(decks.map(d => [d.id,d])); decks = order.map(id => byId.get(id)!);
          }
          const tables = ['lines','choices','cache'].map(name => {
            const rows = records.get(name) as { id: string; value: unknown }[];
            if (rows.length !== decks.length || rows.some(row => !decks.some(d => d.id === row.id))) throw new Error('Incomplete saved deck.');
            return new Map(rows.map(row => [row.id, row.value]));
          });
          const library = unpackLibrary({ decks: decks.map(d => ({ ...d, lines: tables[0]!.get(d.id), choices: tables[1]!.get(d.id), cache: tables[2]!.get(d.id) })), selectedId: state?.selectedId ?? null, view: state?.view ?? 'decks' });
          this.revision = state?.revision ?? 0; this.loaded = true; resolve(library);
        } catch (error) { reject(error); }
      };
    });
  }
  write(library: Library): Promise<void> {
    if (!this.loaded) return Promise.reject(new Error('Read the saved library before writing.'));
    let packed: PackedLibrary; try { packed = checkedLibrary(library); } catch (error) { return Promise.reject(error); }
    const expected = this.revision;
    return new Promise((resolve, reject) => {
      let tx: IDBTransaction;
      try { tx = this.db.transaction(STORES, 'readwrite'); } catch (error) { reject(error); return; }
      let failure: unknown;
      const timer = setTimeout(() => { failure = new Error('Saving took too long. Your result is still held in this tab.'); try { tx.abort(); } catch { /* already finished */ } }, 10000);
      tx.onabort = () => { clearTimeout(timer); reject(failure ?? tx.error ?? new Error('Saving was interrupted.')); };
      tx.oncomplete = () => { clearTimeout(timer); this.revision = expected + 1; resolve(); };
      const request = tx.objectStore('settings').get('library');
      request.onsuccess = () => {
        try {
          if ((request.result?.revision ?? 0) !== expected) throw new StorageConflictError();
          for (const name of STORES) tx.objectStore(name).clear();
          for (const entry of packed.decks) writeEntry(tx, entry);
          tx.objectStore('settings').put({ key: 'library', revision: expected + 1, selectedId: packed.selectedId, view: packed.view, deckOrder: packed.decks.map(d => d.id) });
        } catch (error) { failure = error; tx.abort(); }
      };
    });
  }
}
function writeEntry(tx: IDBTransaction, entry: PackedEntry): void {
  const { lines, choices, cache, ...deck } = entry;
  tx.objectStore('decks').put(deck);
  tx.objectStore('lines').put({ id: entry.id, value: lines });
  tx.objectStore('choices').put({ id: entry.id, value: choices });
  tx.objectStore('cache').put({ id: entry.id, value: cache });
}

/** Serializes complete snapshots. A stale tab cannot overwrite a newer tab's revision. */
export class LibrarySession {
  value: Library = emptyLibrary();
  error: unknown = null;
  pending = 0;
  private tail: Promise<void> = Promise.resolve();
  constructor(private db: LocalDatabase | undefined, private changed: () => void = () => {}) {}
  setDatabase(db: LocalDatabase | undefined): void { this.db = db; }
  async commit(next: Library): Promise<boolean> {
    checkedLibrary(next); // Reject invalid/over-limit states before changing even in-memory results.
    this.value = next; const snapshot = structuredClone(next);
    this.pending++; this.changed();
    let saved = false;
    this.tail = this.tail.then(async () => {
      try { if (!this.db) throw new Error('Browser storage is unavailable.'); await this.db.write(snapshot); this.error = null; saved = true; }
      catch (error) { this.error = error; }
      finally { this.pending--; this.changed(); }
    });
    await this.tail; return saved;
  }
  settled(): Promise<void> { return this.tail; }
}
