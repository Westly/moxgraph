import type { ArtistMapping } from '../models/contracts';
export function scryfallArtistUrl(mapping: ArtistMapping): string | undefined {
  if(mapping.status!=='verified')return undefined;
  const names=[...new Set(Object.values(mapping.scryfallNames).flat())].filter(Boolean);
  if(!names.length)return undefined;
  const terms=names.map(name=>`artist:"${name.replace(/\\/g,'\\\\').replace(/"/g,'\\"')}"`);
  const query=terms.length===1?terms[0]!: `(${terms.join(' or ')})`;
  const url=new URL('https://scryfall.com/search');
  url.search=new URLSearchParams({q:query,unique:'cards',as:'grid',order:'name'}).toString();
  return url.href;
}
