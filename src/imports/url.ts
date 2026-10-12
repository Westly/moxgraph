import { ImportError } from './types';
import type { Source } from './types';

/** Only public provider pages are accepted; never turn user text into a fetch target. */
export function parseDeckUrl(input: string): Source {
  const text = input.trim();
  if (text.length > 2048 || /[\\\u0000-\u0020]/.test(text)) throw new ImportError('url', 'Enter a public Moxfield or Archidekt deck link.');
  let url: URL;
  try { url = new URL(/^(?:www\.)?(?:moxfield|archidekt)\.com\//i.test(text) ? `https://${text}` : text); }
  catch { throw new ImportError('url', 'Enter a complete Moxfield or Archidekt deck link.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port || /%/.test(url.pathname)) {
    throw new ImportError('url', 'Use an HTTPS public deck link without a port or sign-in details.');
  }
  const host = url.hostname.replace(/^www\./, '');
  const mox = host === 'moxfield.com' && /^\/decks\/([A-Za-z0-9_-]{22})\/?$/.exec(url.pathname);
  const arch = host === 'archidekt.com' && /^\/decks\/([1-9][0-9]{0,15})(?:\/[A-Za-z0-9_-]+)?\/?$/.exec(url.pathname);
  if (mox) return { provider: 'moxfield', id: mox[1]!, url: `https://moxfield.com/decks/${mox[1]}` };
  if (arch) return { provider: 'archidekt', id: arch[1]!, url: `https://archidekt.com/decks/${arch[1]}` };
  throw new ImportError('url', 'Use a public deck page from moxfield.com/decks/… or archidekt.com/decks/….');
}
