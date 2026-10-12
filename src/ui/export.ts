import type { SavedEntry } from '../storage/model';
import { cardsCsv, exportCards, exportSummary } from '../exports/cards';
import { escapeHtml as h } from './components';

export function openExport(decks: SavedEntry[], selectedIds: string[]): void {
  const trigger = document.activeElement as HTMLElement, d=document.createElement('dialog');
  const controller=new AbortController(), urls: string[]=[]; let busy=false;
  d.className='library-dialog export-dialog'; d.setAttribute('aria-labelledby','export-title');
  d.innerHTML=`<form method="dialog"><button class="text-button dialog-close">Close ×</button></form><h2 id="export-title">Export cards</h2><p>Sorted by artist, then deck.</p><fieldset class="export-decks"><legend>Choose decks</legend>${decks.map(deck=>`<label class="export-deck-choice"><input type="checkbox" name="export-deck" value="${h(deck.id)}" ${selectedIds.includes(deck.id)?'checked':''}><span>${h(deck.title)}</span></label>`).join('')}</fieldset><div class="export-options"><label for="export-sections">Deck sections</label><select id="export-sections"><option value="main">Main deck &amp; commander</option><option value="all">All sections</option></select><label><input type="checkbox" id="export-other"> Include cards without an attending artist</label></div><p id="export-count" role="status"></p><div class="dialog-actions"><button class="button" data-format="csv">Download CSV</button><button class="button primary" data-format="pdf">Download PDF</button></div><p class="export-status" role="status"></p><div class="export-downloads"></div>`;
  document.body.append(d); d.showModal();
  const count=d.querySelector<HTMLElement>('#export-count')!, status=d.querySelector<HTMLElement>('.export-status')!;
  const selected=()=>exportCards(decks,new Set([...d.querySelectorAll<HTMLInputElement>('[name="export-deck"]:checked')].map(i=>i.value)),{sections:d.querySelector<HTMLSelectElement>('#export-sections')!.value as 'main'|'all',includeOther:d.querySelector<HTMLInputElement>('#export-other')!.checked});
  const update=()=>{
    const cards=selected(), summary=exportSummary(cards);
    count.textContent=`${summary.copies} cards · ${summary.artists} attending artists${summary.entries!==new Set(cards.map(c=>JSON.stringify([c.deckId,c.row.line.key]))).size ? ' · Joint credits appear under each artist' : ''}`;
    d.querySelectorAll<HTMLButtonElement>('[data-format]').forEach(b=>{b.disabled=busy||!cards.length;});
    d.querySelectorAll<HTMLInputElement|HTMLSelectElement>('input,select').forEach(i=>{i.disabled=busy;});
  };
  d.addEventListener('change',()=>{status.textContent='';status.setAttribute('role','status');d.querySelector('.export-downloads')!.replaceChildren();update();}); update();
  d.addEventListener('close',()=>{controller.abort();d.remove();setTimeout(()=>urls.forEach(url=>URL.revokeObjectURL(url)),30000);if(trigger?.isConnected)trigger.focus();});
  d.querySelectorAll<HTMLButtonElement>('[data-format]').forEach(button=>button.addEventListener('click',async()=>{
    if(busy)return;const cards=selected();if(!cards.length)return;busy=true;update();
    status.setAttribute('role','status'); status.textContent='Preparing export…';d.querySelector('.export-downloads')!.replaceChildren();
    const kind=button.dataset.format!;
    try {
      let blob: Blob, warning='';
      if(kind==='csv') blob=new Blob([cardsCsv(cards)],{type:'text/csv;charset=utf-8'});
      else {
        const {cardsPdf,fetchCardImage,rasterizeLabel,MAX_PDF_CARDS}=await import('../exports/pdf');
        if(cards.length>MAX_PDF_CARDS)throw new Error(`PDFs support up to ${MAX_PDF_CARDS} entries. Select fewer decks or download CSV.`);
        const response=await fetch('/fonts/NotoSans-Regular.ttf',{signal:controller.signal});
        if(!response.ok)throw new Error('The PDF font could not load. Check your connection and try again.');
        const output=await cardsPdf(cards,{fontBytes:new Uint8Array(await response.arrayBuffer()),signal:controller.signal,loadImage:fetchCardImage,rasterize:rasterizeLabel,progress:(done,total)=>{status.textContent=`Preparing PDF… ${done} of ${total} cards`;}});
        blob=new Blob([new Uint8Array(output.bytes)],{type:'application/pdf'});
        if(output.missingImages) warning=` ${output.missingImages} card ${output.missingImages===1?'image was':'images were'} unavailable; their names and printings are included.`;
      }
      controller.signal.throwIfAborted();
      const url=URL.createObjectURL(blob);urls.push(url);
      const link=document.createElement('a');link.href=url;link.download=`moxgraph-cards-${new Date().toISOString().slice(0,10)}.${kind}`;link.className='text-link';link.textContent=`Save ${kind.toUpperCase()}`;
      d.querySelector('.export-downloads')!.replaceChildren(link);link.click();
      status.textContent=`${kind.toUpperCase()} ready.${warning}`;
    } catch(error) { if(!controller.signal.aborted){status.setAttribute('role','alert');status.textContent=error instanceof Error?error.message:'Export could not finish. Please try again.';} }
    finally{busy=false;if(d.open)update();}
  }));
}
