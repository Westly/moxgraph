import { PDFDocument, PageSizes, rgb } from 'pdf-lib';
import type { PDFImage, PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { cardImages, exportFinish, exportSection, sortCards } from './cards';
import type { ExportCard } from './cards';

export const MAX_PDF_CARDS = 600;
type PdfOptions = {
  fontBytes: Uint8Array; signal: AbortSignal;
  loadImage: (url: string, signal: AbortSignal) => Promise<Uint8Array>;
  progress?: (done: number, total: number) => void;
  rasterize?: (text: string) => Promise<Uint8Array>;
};
const ink = rgb(.09,.18,.2), green = rgb(.09,.39,.32), muted = rgb(.32,.4,.42), border = rgb(.83,.87,.83);
const clean = (s: string) => s.normalize('NFC').replace(/[\u0000-\u001f\u007f]/g,' ');

/** A compact visual checklist: 12 exact printings per page, artist then deck. */
export async function cardsPdf(input: ExportCard[], options: PdfOptions): Promise<{bytes: Uint8Array; missingImages: number; pages: number}> {
  if (!input.length) throw new Error('Select decks with cards to export.');
  if (input.length > MAX_PDF_CARDS) throw new Error(`PDFs support up to ${MAX_PDF_CARDS} card entries. Select fewer decks or use CSV for the full list.`);
  options.signal.throwIfAborted();
  const cards = sortCards([...input]), pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(options.fontBytes,{subset:true}), supported = new Set(font.getCharacterSet());
  pdf.setTitle('Moxgraph - cards by artist and deck'); pdf.setCreator('moxgraph.com'); pdf.setLanguage('en');
  const width = (s: string, size: number) => [...s].every(c=>supported.has(c.codePointAt(0)!)) ? font.widthOfTextAtSize(s,size) : [...s].length * size * .65;
  const lines = (value: string, size: number, maxWidth: number, maxLines: number): string[] => {
    const result: string[] = []; let current = '';
    for (const word of clean(value).split(/\s+/)) {
      const proposed=current ? `${current} ${word}` : word;
      if(width(proposed,size)<=maxWidth){current=proposed;continue;}
      if(current){result.push(current);current='';}
      for(const char of word){if(current&&width(current+char,size)>maxWidth){result.push(current);current='';}current+=char;}
    }
    if(current)result.push(current);
    if(result.length<=maxLines)return result;
    const shown=result.slice(0,maxLines);let last=shown.pop()!;
    while(width(last+'…',size)>maxWidth)last=last.slice(0,-1);
    return [...shown,last+'…'];
  };
  const text = async (page: PDFPage, value: string, x: number, y: number, size: number, maxWidth: number, maxLines=1, color=ink) => {
    for (const [index,line] of lines(value,size,maxWidth,maxLines).entries()) {
      if ([...line].every(c=>supported.has(c.codePointAt(0)!))) page.drawText(line,{x,y:y-index*(size+2),size,font,color});
      else {
        if (!options.rasterize) throw new Error('This title needs a browser font. Export it from the website.');
        const picture = await pdf.embedPng(await options.rasterize(line));
        const scale = Math.min(maxWidth/picture.width,(size+3)/picture.height);
        page.drawImage(picture,{x,y:y-index*(size+2)-3,width:picture.width*scale,height:picture.height*scale});
      }
    }
  };
  let imageBytes = 0, failures = 0, missingImages = 0;
  const cache = new Map<string, PDFImage | null>();
  const image = async (url: string): Promise<PDFImage | null> => {
    if (cache.has(url)) return cache.get(url)!;
    if (failures>=3 || imageBytes>=40*1024*1024) return null;
    try {
      const bytes = await options.loadImage(url, options.signal); options.signal.throwIfAborted();
      if (bytes.byteLength > 2*1024*1024 || imageBytes+bytes.byteLength > 40*1024*1024) throw new Error('Image budget exceeded');
      imageBytes += bytes.byteLength;
      const picture = bytes[0]===0x89 ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
      cache.set(url,picture); failures=0; return picture;
    } catch { options.signal.throwIfAborted(); failures++; cache.set(url,null); return null; }
  };
  const totalPages = Math.ceil(cards.length/12), [pageWidth,pageHeight] = PageSizes.A4;
  const margin=28, gap=12, tileWidth=(pageWidth-margin*2-gap*3)/4, rowHeight=248;
  // Distinguish local copies with identical titles without exposing storage IDs.
  const deckIds = [...new Map(cards.map(c=>[c.deckId,c.deck])).entries()].sort(([a],[b])=>a.localeCompare(b));
  let page: PDFPage;
  for (const [i,card] of cards.entries()) {
    options.signal.throwIfAborted();
    if (i%12===0) {
      page = pdf.addPage(PageSizes.A4);
      await text(page,'moxgraph',margin,pageHeight-27,15,180,1,green);
      await text(page,'MagicCon: Atlanta 2026',pageWidth-206,pageHeight-25,10,180);
      page.drawLine({start:{x:margin,y:pageHeight-39},end:{x:pageWidth-margin,y:pageHeight-39},thickness:.6,color:border});
      await text(page,'Card images © Wizards of the Coast · moxgraph.com',margin,18,7,440,1,muted);
      await text(page,`${Math.floor(i/12)+1} / ${totalPages}`,pageWidth-63,18,8,40,1,muted);
    }
    const x=margin+(i%4)*(tileWidth+gap), top=pageHeight-55-Math.floor((i%12)/4)*rowHeight;
    const copies=deckIds.filter(([,name])=>name===card.deck), deckName=copies.length>1 ? `${card.deck} (${copies.findIndex(([id])=>id===card.deckId)+1})` : card.deck;
    await text(page!,card.artist,x,top,8.4,tileWidth,2,green);
    await text(page!,deckName,x,top-24,7.5,tileWidth,2,muted);
    const urls=cardImages(card), boxHeight=145, boxTop=top-46;
    const pictures=await Promise.all(urls.slice(0,2).map(image));
    if (!pictures.length || pictures.some(p=>!p)) missingImages++;
    const boxes=Math.max(1,pictures.length), boxWidth=(tileWidth-(boxes-1)*4)/boxes;
    for (let face=0;face<boxes;face++) {
      const picture=pictures[face], left=x+face*(boxWidth+4);
      if (picture) { const scaled=picture.scaleToFit(boxWidth,boxHeight); page!.drawImage(picture,{x:left+(boxWidth-scaled.width)/2,y:boxTop-boxHeight+(boxHeight-scaled.height)/2,width:scaled.width,height:scaled.height}); }
      else { page!.drawRectangle({x:left,y:boxTop-boxHeight,width:boxWidth,height:boxHeight,borderWidth:.5,borderColor:border}); await text(page!,'Image unavailable',left+5,boxTop-boxHeight/2,7,boxWidth-10,2,muted); }
    }
    page!.drawRectangle({x,y:top-204,width:7,height:7,borderWidth:.7,borderColor:muted});
    await text(page!,`${card.row.line.quantity}× ${card.row.printing?.name ?? card.row.line.name}`,x+12,top-203,7.8,tileWidth-12,2);
    const p=card.row.printing;
    await text(page!,p ? `${p.setCode.toUpperCase()} #${p.collectorNumber} · ${p.language.toUpperCase()} · ${exportFinish(card.row)}` : 'Printing needs review',x,top-224,6.6,tileWidth);
    await text(page!,`${exportSection(card.row)}${card.booth ? ` · Booth ${card.booth}` : !card.attending ? ' · No attendee match' : ''}`,x,top-233,6.6,tileWidth,1,muted);
    options.progress?.(i+1,cards.length);
    // Give cancellation and progress painting a turn, including cache-only exports.
    await new Promise(resolve=>setTimeout(resolve,0));
  }
  options.signal.throwIfAborted();
  return {bytes:await pdf.save(),missingImages,pages:totalPages};
}

export async function fetchCardImage(url: string, signal: AbortSignal): Promise<Uint8Array> {
  const parsed = new URL(url);
  if (parsed.origin !== 'https://cards.scryfall.io' || parsed.username || parsed.password) throw new Error('Unsupported image host');
  const response = await fetch(parsed,{signal:AbortSignal.any([signal,AbortSignal.timeout(6500)]),credentials:'omit',redirect:'error'});
  if (!response.ok || !/^image\/(?:jpeg|png)(?:;|$)/i.test(response.headers.get('Content-Type')??'')) throw new Error('Image unavailable');
  const reader=response.body?.getReader(); if (!reader) throw new Error('Image unavailable');
  const chunks: Uint8Array[]=[]; let size=0;
  try { while(true) { const {value,done}=await reader.read(); if(done)break; size+=value.length; if(size>2*1024*1024)throw new Error('Image too large'); chunks.push(value); } }
  finally { await reader.cancel(); }
  const bytes=new Uint8Array(size); let at=0; for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.length;} return bytes;
}

/** Browser fonts cover deck-title scripts outside the embedded Latin/Greek/Cyrillic font. */
export async function rasterizeLabel(value: string): Promise<Uint8Array> {
  const canvas=document.createElement('canvas'), context=canvas.getContext('2d'); if(!context)throw new Error('Browser text rendering unavailable');
  context.font='48px sans-serif'; canvas.width=Math.ceil(context.measureText(value).width)+8; canvas.height=66;
  context.font='48px sans-serif'; context.fillStyle='#172f35'; context.fillText(value,4,49);
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Text rendering failed')),'image/png'));
  return new Uint8Array(await blob.arrayBuffer());
}
