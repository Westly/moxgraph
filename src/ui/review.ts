import type { Catalogue } from '../data/catalogue';
import type { CardPrinting, EventDirectory } from '../models/contracts';
import { escapeHtml as h, printingBadge, externalLink } from './components';
import { printingImages, sectionName } from './deck';
import { UUID, SECTION_NAMES } from '../imports/types';
import type { DeckResult, ResolvedLine, Finish } from '../imports/types';
import { sectionOf, finishOf, matchLine } from '../imports/match';

/** Manual choices require preview and confirmation, keeping all source fields intact. */
export async function openReview(key:string,result:DeckResult,catalogue:Catalogue,directory:EventDirectory,commit:(row:ResolvedLine)=>void,bindImages:()=>void):Promise<void> {
  const row=result.lines.find(r=>r.line.key===key);if(!row)return;
  const trigger=document.activeElement as HTMLElement,dialog=document.createElement('dialog');dialog.className='printing-dialog';
  dialog.setAttribute('aria-labelledby','review-title');
  dialog.innerHTML=`<form method="dialog"><button class="text-button dialog-close" aria-label="Close printing review">Close ×</button></form><h2 id="review-title">Review ${h(row.line.name)}</h2><p>${h(row.reason)||'Confirm the exact printing and section you own.'}</p><p class="micro">Original: ${h(row.line.setCode)||'?'} #${h(row.line.collectorNumber)||'?'} · language ${h(row.line.language)||'not supplied'} · ${h(row.line.scryfallId)||'ID not supplied'}. Your original source fields will be retained.</p><div id="candidate-list" role="status">Loading candidates…</div><form id="printing-preview"><label for="printing-id">Exact Scryfall printing ID</label><input id="printing-id" required pattern="[0-9a-fA-F-]{36}" placeholder="UUID from the Scryfall card page"><button class="button">Preview printing</button></form><p id="review-status" role="status"></p><div id="printing-choice"></div>`;
  document.body.append(dialog);dialog.showModal();const controller=new AbortController();let revision=0;
  dialog.addEventListener('close',()=>{controller.abort();dialog.remove();if(trigger?.isConnected)trigger.focus();});
  const status=dialog.querySelector<HTMLElement>('#review-status')!;
  const preview=async(id:string)=>{
    const current=++revision,area=dialog.querySelector<HTMLElement>('#printing-choice')!;area.innerHTML='';
    try {
      if(!UUID.test(id))throw new Error('Enter a valid Scryfall printing UUID.');status.textContent='Loading exact printing…';
      const found=await catalogue.lookupPrinting(id.toLowerCase(),controller.signal);controller.signal.throwIfAborted();if(current!==revision)return;
      if(found.status!=='found')throw new Error('That printing is absent from this catalogue. Check the ID or use a newer export.');
      const p=found.printing;status.textContent='Review the image and identity before confirming.';
      const available=[...new Set([...Object.keys(SECTION_NAMES),sectionOf(row)])];
      area.innerHTML=`<div class="manual-preview">${printingImages(p)}<h3>${h(p.name)}</h3><p>${h(p.setName)}</p>${printingBadge(p,null)}<p>Credit: ${h(p.sourceArtistCredit)||'not supplied'}</p>${!p.paper?'<p class="resolution-notice">Not available in paper. Excluded from physical signing totals.</p>':''}${externalLink(p.scryfallUrl,'Check this printing on Scryfall ↗','Check this printing on Scryfall','text-link')}</div><form id="confirm-printing"><label for="manual-finish">Finish</label><select id="manual-finish"><option value="">Unknown / not confirmed</option>${p.finishes.map(f=>`<option value="${f}">${f==='nonfoil'?'Nonfoil':f==='etched'?'Etched foil':'Foil'}</option>`).join('')}</select><label for="manual-section">Deck section</label><select id="manual-section">${available.map(s=>`<option value="${h(s)}">${h(sectionName(s))}</option>`).join('')}</select><p class="field-note">Confirm only if this is your actual printing. This explicit choice overrides unresolved or conflicting source identity and is labeled manual.</p><button class="button primary">Confirm this printing</button></form>`;
      const finish=dialog.querySelector<HTMLSelectElement>('#manual-finish')!,section=dialog.querySelector<HTMLSelectElement>('#manual-section')!;
      finish.value=p.finishes.includes(finishOf(row) as Finish)?finishOf(row)??'':'';section.value=sectionOf(row);
      dialog.querySelector('#confirm-printing')!.addEventListener('submit',event=>{event.preventDefault();
        const chosen:ResolvedLine={...row,printing:p,selectedPrintingId:p.id,status:'manual',reason:'You explicitly confirmed this printing. Original source identity is retained.',candidates:[],manual:{selectedAt:new Date().toISOString(),section:section.value,finish:finish.value as Finish||null}};
        dialog.close();commit(matchLine(chosen,directory));
      });bindImages();
    }catch(error){if(!controller.signal.aborted&&current===revision)status.textContent=error instanceof Error?error.message:'Candidate unavailable. Try again.';}
  };
  dialog.querySelector('#printing-preview')!.addEventListener('submit',event=>{event.preventDefault();void preview(dialog.querySelector<HTMLInputElement>('#printing-id')!.value.trim());});
  try {
    const ids=[...new Set([...(row.printing?[row.printing.id]:[]),...row.candidates])].slice(0,50),candidates:CardPrinting[]=[];
    for(const id of ids){const found=await catalogue.lookupPrinting(id,controller.signal);if(found.status==='found')candidates.push(found.printing);}
    controller.signal.throwIfAborted();const list=dialog.querySelector('#candidate-list')!;
    list.innerHTML=candidates.length?`<label for="candidate-select">Catalogue candidates (${candidates.length})</label><select id="candidate-select"><option value="">Choose a candidate to preview…</option>${candidates.map(p=>`<option value="${p.id}">${h(p.name)} · ${h(p.setCode.toUpperCase())} #${h(p.collectorNumber)} · ${h(p.language.toUpperCase())}${p.paper?'':' · nonpaper'}</option>`).join('')}</select>`:'<p>No catalogue candidates were found. Enter an exact printing UUID from Scryfall, or close this review and import a fresh source.</p>';
    dialog.querySelector<HTMLSelectElement>('#candidate-select')?.addEventListener('change',event=>{const id=(event.target as HTMLSelectElement).value;dialog.querySelector<HTMLInputElement>('#printing-id')!.value=id;if(id)void preview(id);else{revision++;dialog.querySelector('#printing-choice')!.innerHTML='';}});
  }catch{if(!controller.signal.aborted)dialog.querySelector('#candidate-list')!.textContent='Candidates could not load. Try an exact ID or close and retry.';}
}
