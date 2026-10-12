import { ImportError, MAX_BYTES } from './types';
import type { ImportedDeck, Source } from './types';
import { parseDeckUrl } from './url';
import { parseArchidekt, parseMoxfield } from './adapters';

export const RELAY = 'https://moxgraph-import-relay-probe.westlywhite.workers.dev';
export function retryTime(value: string | null, now: number): number {
  const date = value && /^\d+$/.test(value) ? now + Number(value) * 1000 : value ? Date.parse(value) : NaN;
  return Number.isFinite(date) ? Math.max(now + 60000, date) : now + 60000;
}
export async function boundedText(response: Response, signal?: AbortSignal): Promise<string> {
  if (!response.body || Number(response.headers.get('content-length')) > MAX_BYTES) throw new ImportError('limit', 'This response is larger than the 12 MiB import limit.');
  const reader = response.body.getReader(), chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      signal?.throwIfAborted();
      const { value, done } = await reader.read(); if (done) break;
      size += value.byteLength; if (size > MAX_BYTES) throw new ImportError('limit', 'This response exceeds the 12 MiB import limit.'); chunks.push(value);
    }
  } catch (error) { await reader.cancel().catch(()=>{}); throw error; }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder('utf-8', { fatal:true }).decode(bytes);
}
/** One request at a time, no retries. Cooldown lives only in this browser tab. */
export class ImportClient {
  private busy = false;
  private cooldown = new Map<string, number>();
  constructor(private fetcher: typeof fetch = fetch, private now = () => Date.now()) {}
  async load(source: Source, signal: AbortSignal): Promise<ImportedDeck> {
    const checked = parseDeckUrl(source.url);
    if (checked.id !== source.id || checked.provider !== source.provider) throw new ImportError('url', 'Invalid source identity.');
    if (this.busy) throw new ImportError('rate', 'An import is already running. Cancel it or wait for it to finish.');
    const retryAt = this.cooldown.get(source.provider) ?? 0;
    if (retryAt > this.now()) throw new ImportError('rate', 'Please wait before requesting this provider again.', retryAt);
    signal.throwIfAborted(); this.busy = true;
    this.cooldown.set(source.provider, this.now() + 5000);
    try {
      const combined = AbortSignal.any([signal, AbortSignal.timeout(25000)]);
      // Call the browser fetch function without binding it to this client instance.
      const request = this.fetcher;
      const response = await request(`${RELAY}/api/${checked.provider}/${checked.id}`, { method:'GET', credentials:'omit', redirect:'error', cache:'no-store', signal:combined });
      if (response.status === 429) {
        const next = retryTime(response.headers.get('retry-after'), this.now()); this.cooldown.set(source.provider, next);
        await response.body?.cancel(); throw new ImportError('rate', 'The provider or free relay is rate-limited. Wait until the indicated time, or import a saved export file.', next);
      }
      if (response.status === 404 || response.status === 401 || response.status === 403) {
        await response.body?.cancel(); throw new ImportError('missing', 'This deck is missing, private, or access is blocked. Check its public link or use an export file.');
      }
      if (!response.ok) { await response.body?.cancel(); throw new ImportError('unavailable', 'The provider or free relay is unavailable, including possible free-quota exhaustion. Try later or use an export file. No paid fallback is used.'); }
      if (!/^application\/json(?:;|$)/i.test(response.headers.get('content-type') ?? '')) { await response.body?.cancel(); throw new ImportError('format', 'The provider returned a page instead of deck JSON. Try later or use an export file.'); }
      const body = await boundedText(response, combined);
      let raw: unknown; try { raw = JSON.parse(body); } catch { throw new ImportError('format', 'The provider returned invalid JSON. Try a fresh export file.'); }
      signal.throwIfAborted();
      const deck = source.provider === 'moxfield' ? parseMoxfield(raw, source) : parseArchidekt(raw, source);
      return {...deck, inputKind:'link'};
    } catch (error) {
      if (signal.aborted) throw new ImportError('cancelled', 'Import cancelled. Your previous result is still available.');
      if (error instanceof ImportError) throw error;
      throw new ImportError('unavailable', 'The import connection failed or timed out. Check your connection; browser access or the free relay may be unavailable. Try later or use an export file.');
    } finally { this.busy = false; }
  }
}
