// Public retrieval only. No deck storage, credentials, scheduled jobs or paid services.
export const MAX_BYTES = 12 * 1024 * 1024;
export function upstream(path) {
  const m = /^\/api\/(moxfield|archidekt)\/([A-Za-z0-9_-]+)$/.exec(path);
  if (!m) return null;
  if (m[1] === 'moxfield' && /^[A-Za-z0-9_-]{22}$/.test(m[2]))
    return `https://api.moxfield.com/v2/decks/all/${m[2]}`;
  if (m[1] === 'archidekt' && /^[1-9][0-9]{0,15}$/.test(m[2]))
    return `https://archidekt.com/api/decks/${m[2]}/`;
  return null;
}
const ALLOWED = new Set(['https://moxgraph.com', 'https://www.moxgraph.com',
  'https://moxgraph-import-probe.pages.dev', 'http://localhost:3000']);
const BASE = {'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'no-referrer', 'X-Robots-Tag':'noindex, nofollow'};
export async function handle(request, fetcher = fetch, env = {}) {
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');
  const headers = {...BASE, 'Content-Type':'application/json; charset=utf-8', 'Vary':'Origin'};
  const error = (status, code) => new Response(JSON.stringify({error:code}), {status, headers});
  if (origin && origin !== url.origin && !ALLOWED.has(origin)) return error(403,'origin_not_allowed');
  if (origin) headers['Access-Control-Allow-Origin'] = origin;
  headers['Access-Control-Expose-Headers'] = 'Retry-After';
  if (request.method !== 'GET') return error(405,'get_only');
  if (url.search) return error(400,'query_not_allowed');
  if (url.pathname === '/') return new Response('Moxgraph public deck retrieval. Use moxgraph.com to import a deck.', {headers:{...BASE,'Content-Type':'text/plain; charset=utf-8'}});
  const target = upstream(url.pathname);
  if (!target) return error(404,'unknown_public_deck_path');
  const provider = url.pathname.split('/')[2];
  const ip = request.headers.get('CF-Connecting-IP');
  if (!ip) return error(400,'missing_client_address');
  try {
    // Cloudflare-managed short-lived counters; no deck IDs or contents in keys.
    // Missing/broken bindings fail closed before any provider request.
    for (const [name,key] of [['IMPORT_BURST_LIMIT',ip],['IMPORT_IP_LIMIT',ip],['IMPORT_PROVIDER_LIMIT',provider]]) {
      if (!env[name]?.limit) return error(503,'rate_limit_unavailable');
      const {success} = await env[name].limit({key});
      if (!success) { headers['Retry-After']='60'; return error(429,'relay_rate_limited'); }
    }
  } catch { return error(503,'rate_limit_unavailable'); }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetcher(target, {method:'GET', redirect:'manual',
      headers:{'Accept':'application/json', 'Accept-Encoding':'identity', 'User-Agent':'moxgraph/0.1 (public deck import; https://moxgraph.com)'},
      signal:controller.signal});
    if (response.status !== 200) {
      await response.body?.cancel();
      clearTimeout(timer);
      if (response.status === 429) headers['Retry-After'] = '60';
      return error([404,429].includes(response.status) ? response.status : 502, `provider_http_${response.status}`);
    }
    if (!/^application\/json(?:;|$)/i.test(response.headers.get('Content-Type') ?? '')) {
      await response.body?.cancel(); clearTimeout(timer); return error(502,'provider_not_json');
    }
    if (Number(response.headers.get('Content-Length')) > MAX_BYTES) {
      await response.body?.cancel(); clearTimeout(timer); return error(502,'provider_response_too_large');
    }
    // Avoid decompression/recompression in this byte-counting Worker. The browser
    // still caps decoded data; static catalogue assets retain gzip/Brotli support.
    headers['Content-Encoding'] = 'identity';
    // Batch small upstream chunks inside the native runtime before entering JS.
    // Workers' readAtLeast preserves the same 12 MiB bound and 15 s deadline.
    // The standard-reader fallback keeps the handler portable for unit tests.
    let reader, batched = false;
    try {
      reader = response.body.getReader({mode:'byob'});
      batched = typeof reader.readAtLeast === 'function';
      if (!batched) { reader.releaseLock(); reader = response.body.getReader(); }
    } catch { reader = response.body.getReader(); }
    let bytes = 0;
    const body = new ReadableStream({
      async pull(stream) {
        try {
          const chunk = batched ? await reader.readAtLeast(256 * 1024, new Uint8Array(256 * 1024)) : await reader.read();
          if (chunk.done) { clearTimeout(timer); stream.close(); return; }
          bytes += chunk.value.byteLength;
          if (bytes > MAX_BYTES) throw new Error('provider_response_too_large');
          stream.enqueue(chunk.value);
        } catch (err) { clearTimeout(timer); controller.abort(); await reader.cancel().catch(()=>{}); stream.error(err); }
      },
      async cancel() { clearTimeout(timer); controller.abort(); await reader.cancel(); }
    });
    return new Response(body, {headers});
  } catch { clearTimeout(timer); return error(502,'provider_unavailable'); }
}
export default {fetch:(request, env) => handle(request, fetch, env)};
