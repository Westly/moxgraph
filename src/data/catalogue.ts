import type { ActiveManifest, Artist, CardPrinting, DataManifest, EventDirectory } from '../models/contracts';
import { decodePrinting, parseContract, DataValidationError } from '../models/boundaries';
import columns from '../../schemas/printing-columns.json';

export class DataUnavailableError extends Error {}
export type PrintingLookup = { status: 'found'; printing: CardPrinting } | { status: 'unknown'; id: string };
export type TupleLookup = { status: 'found'; printing: CardPrinting } |
  { status: 'unknown' | 'ambiguous'; candidates: string[]; reason: string };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const MAX_ASSET_BYTES = 20 * 1024 * 1024;
export async function sha256(bytes: Uint8Array): Promise<string> {
  const value = await crypto.subtle.digest('SHA-256', bytes as Uint8Array<ArrayBuffer>);
  return [...new Uint8Array(value)].map(v => v.toString(16).padStart(2, '0')).join('');
}

/** One instance pins one immutable version. Create a new instance for an explicit update. */
export class Catalogue {
  readonly manifest: DataManifest;
  private readonly base: URL;
  private readonly fetcher: typeof fetch;
  private readonly cache = new Map<string, { bytes: number; value: unknown }>();
  private readonly pending = new Map<string, Promise<unknown>>();
  private cacheBytes = 0;
  private constructor(base: URL, manifest: DataManifest, fetcher: typeof fetch) {
    this.base = base; this.manifest = manifest; this.fetcher = fetcher;
  }
  private static async read(url: URL, fetcher: typeof fetch, max: number, revalidate = false, signal?: AbortSignal): Promise<Uint8Array> {
    try {
      const response = await fetcher(url, { credentials: 'omit', redirect: 'error',
        cache: revalidate ? 'no-cache' : 'default', signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000) });
      if (!response.ok || !response.body) throw new Error('Request failed');
      if (!/^application\/json(?:;|$)/i.test(response.headers.get('Content-Type') ?? '')) throw new Error('Expected JSON');
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = []; let length = 0;
      try {
        while (true) {
          const { done, value } = await reader.read(); if (done) break;
          length += value.length;
          if (length > max) throw new Error('Asset exceeds bound');
          chunks.push(value);
        }
      } catch (error) { await reader.cancel(); throw error; }
      const bytes = new Uint8Array(length); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      return bytes;
    } catch { throw new DataUnavailableError('Catalogue data could not be loaded. Try again.'); }
  }
  static async open(baseUrl: string | URL = new URL('/data/', location.href), fetcher: typeof fetch = fetch): Promise<Catalogue> {
    const base = new URL(baseUrl);
    if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || !base.pathname.endsWith('/')) {
      throw new DataValidationError('Invalid catalogue base URL');
    }
    const activeBytes = await this.read(new URL('active.json', base), fetcher, 1024, true);
    const active: ActiveManifest = parseContract('ActiveManifest', JSON.parse(new TextDecoder().decode(activeBytes)));
    const data = await this.read(new URL(`${active.version}/manifest.json`, base), fetcher, active.manifestBytes);
    if (data.length !== active.manifestBytes || await sha256(data) !== active.manifestSha256) throw new DataUnavailableError('Manifest integrity check failed');
    const manifest = parseContract('DataManifest', JSON.parse(new TextDecoder().decode(data)));
    if (manifest.version !== active.version || JSON.stringify(manifest.printingColumns) !== JSON.stringify(columns)) {
      throw new DataValidationError('Catalogue version/column mismatch');
    }
    return new Catalogue(new URL(`${active.version}/`, base), manifest, fetcher);
  }
  async asset(path: string, signal?: AbortSignal): Promise<unknown> {
    signal?.throwIfAborted();
    const descriptor = this.manifest.files[path];
    if (!descriptor || descriptor.bytes > MAX_ASSET_BYTES) throw new DataUnavailableError('Asset absent from pinned manifest');
    const hit = this.cache.get(path);
    if (hit) { this.cache.delete(path); this.cache.set(path, hit); return hit.value; }
    if (this.pending.has(path)) return this.pending.get(path)!;
    const promise = (async () => {
      const bytes = await Catalogue.read(new URL(path, this.base), this.fetcher, descriptor.bytes, false, signal);
      if (bytes.length !== descriptor.bytes || await sha256(bytes) !== descriptor.sha256) throw new DataUnavailableError('Asset integrity check failed');
      const value: unknown = JSON.parse(new TextDecoder().decode(bytes));
      this.cache.set(path, { bytes: bytes.length, value }); this.cacheBytes += bytes.length;
      while (this.cache.size > 64 || this.cacheBytes > 24 * 1024 * 1024) {
        const first = this.cache.keys().next().value!;
        this.cacheBytes -= this.cache.get(first)!.bytes; this.cache.delete(first);
      }
      return value;
    })();
    this.pending.set(path, promise);
    try { return await promise; } finally { this.pending.delete(path); }
  }
  async lookupPrinting(id: string, signal?: AbortSignal): Promise<PrintingLookup> {
    if (!UUID.test(id)) throw new DataValidationError('Invalid Scryfall printing ID');
    const value = await this.asset(`printings/${id.slice(0, 3)}.json`, signal);
    if (!Array.isArray(value)) throw new DataValidationError('Invalid printing shard');
    for (const row of value) {
      const printing = decodePrinting(row);
      if (printing.id === id) return { status: 'found', printing };
    }
    return { status: 'unknown', id };
  }
  async lookupTuple(setCode: string, collectorNumber: string, language?: string, signal?: AbortSignal): Promise<TupleLookup> {
    if (!/^[a-z0-9]+$/.test(setCode)) throw new DataValidationError('Invalid set code');
    const path = `tuples/set-${setCode}.json`;
    if (!this.manifest.files[path]) return { status: 'unknown', candidates: [], reason: 'set_not_in_snapshot' };
    const tuples = await this.asset(path, signal);
    if (!Array.isArray(tuples)) throw new DataValidationError('Invalid tuple index');
    const candidates: string[] = [];
    for (const row of tuples) {
      if (!Array.isArray(row) || row.length !== 3 || !row.every(v => typeof v === 'string') || !UUID.test(row[2]!)) {
        throw new DataValidationError('Invalid tuple entry');
      }
      if (row[0] === collectorNumber && (!language || row[1] === language)) candidates.push(row[2]!);
    }
    if (candidates.length === 0) return { status: 'unknown', candidates, reason: 'tuple_not_in_snapshot' };
    if (!language || candidates.length !== 1) return { status: 'ambiguous', candidates, reason: 'language_or_unique_identity_required' };
    const result = await this.lookupPrinting(candidates[0]!, signal);
    if (result.status !== 'found' || result.printing.setCode !== setCode || result.printing.collectorNumber !== collectorNumber || result.printing.language !== language) {
      throw new DataValidationError('Tuple reference does not match printing');
    }
    return result;
  }
  async event(): Promise<EventDirectory> { return parseContract('EventDirectory', await this.asset('event.json')); }
  async artists(): Promise<Artist[]> {
    const data = await this.asset('artists.json');
    if (!Array.isArray(data)) throw new DataValidationError('Invalid artist directory');
    return data.map(a => parseContract('Artist', a));
  }
  async artistPrintings(sourceArtistId: string): Promise<string[]> {
    if (!UUID.test(sourceArtistId)) throw new DataValidationError('Invalid source artist ID');
    const data = await this.asset(`artist-index/${sourceArtistId}.json`);
    if (!Array.isArray(data) || !data.every(id => typeof id === 'string' && UUID.test(id))) throw new DataValidationError('Invalid artist index');
    return data;
  }
}
