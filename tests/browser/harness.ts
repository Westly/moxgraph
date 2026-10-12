/** Explicit local-only QA instrumentation, never shipped. All fixtures are public captures. */
import axe from 'axe-core';
const realFetch = window.fetch.bind(window);
const panel = document.createElement('aside');
panel.setAttribute('aria-label', 'Local QA controls');
panel.style.cssText = 'padding:12px;border:3px solid #176451;background:white;position:relative;z-index:30';
panel.innerHTML = `<strong>Local WBS 9 QA — mock provider, separate browser library</strong>
<label for="qa-mode">Provider response</label><select id="qa-mode"><option value="fixture">Captured deck</option><option value="changed">Changed Teysa printing</option><option value="404">Private/missing (404)</option><option value="429">Rate limited (429)</option><option value="503">Free quota/outage (503)</option><option value="wait">Wait until cancelled</option></select>
<button id="qa-metrics">Measure cached sorting</button><button id="qa-accessibility">Check accessibility (F8)</button><pre id="qa-report" role="status">Ready. Provider calls will use local fixtures.</pre>`;
document.body.prepend(panel);
const mode = panel.querySelector<HTMLSelectElement>('#qa-mode')!, report = panel.querySelector<HTMLPreElement>('#qa-report')!;
let requests = 0;
window.fetch = async (input, init) => {
  const url = new URL(String(input), location.href);
  if (url.hostname !== 'moxgraph-import-relay-probe.westlywhite.workers.dev') return realFetch(input, init);
  requests++;
  report.textContent = `Mock provider requests: ${requests}; response: ${mode.value}. No live provider request made.`;
  if (mode.value === 'wait') return new Promise((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(init.signal!.reason), { once: true }));
  if (/^\d+$/.test(mode.value)) return new Response('', { status: Number(mode.value), headers: { 'Retry-After': '60' } });
  const [provider, id] = url.pathname.split('/').slice(2);
  const files: Record<string,string> = { 'zB7a13TqOUWlUZuylE905Q': 'moxfield-v2-zB7a13TqOUWlUZuylE905Q.json', '3x55_3CFz060qxL2xac3NA': 'moxfield-v2-3x55_3CFz060qxL2xac3NA.json', '19780118': 'archidekt-19780118.json' };
  if (!id || !files[id]) return new Response('', { status: 404 });
  const raw = await (await realFetch(`/tests/fixtures/import-feasibility/${files[id]}`)).json();
  if (mode.value === 'changed' && provider === 'moxfield' && id === 'zB7a13TqOUWlUZuylE905Q') {
    const row = raw.commanders['Teysa Karlov'];
    row.card = { ...row.card, id: 'synthetic-changed-provider-id', scryfall_id: 'bcfaa19e-995e-447d-a0a2-46e5d117d5ec', set: 'rna', cn: '212', lang: 'en' }; row.finish = 'nonFoil';
  }
  return new Response(JSON.stringify(raw), { headers: { 'Content-Type': 'application/json' } });
};
await import('../../src/app');
// Save the actual browser-generated file for PDF rendering / CSV comparison.
// This explicit test-only control is never included in a production bundle.
new MutationObserver(()=>{
  const area=document.querySelector('.export-downloads'), link=area?.querySelector<HTMLAnchorElement>('a[download]');
  if(!link||area?.querySelector('[data-qa-capture]'))return;
  const button=document.createElement('button');button.className='button';button.dataset.qaCapture='';button.textContent='Save QA copy';
  area!.append(button);
  button.addEventListener('click',async()=>{
    try{
      const bytes=await (await realFetch(link.href)).arrayBuffer(),type=link.download.endsWith('.pdf')?'application/pdf':'text/csv';
      const response=await realFetch('/__qa/export',{method:'POST',headers:{'Content-Type':type},body:bytes});
      button.textContent=await response.text();
    }catch{button.textContent='QA capture failed';}
  });
}).observe(document.body,{subtree:true,childList:true});
async function accessibility() {
  const results = await axe.run({ exclude: [['aside[aria-label="Local QA controls"]']] }, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
  report.textContent = JSON.stringify({ axe: results.testEngine.version, url: results.url, passes: results.passes.length,
    violations: results.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.map(n => ({ target: n.target, message: n.failureSummary })) })),
    incomplete: results.incomplete.map(v => ({ id: v.id, nodes: v.nodes.length })) }, null, 2);
}
panel.querySelector('#qa-accessibility')!.addEventListener('click', () => void accessibility());
document.addEventListener('keydown', e => {
  if (e.key === 'F8') { e.preventDefault(); void accessibility(); }
  if (e.key === 'F7') { e.preventDefault(); panel.hidden = !panel.hidden; }
});
panel.querySelector('#qa-metrics')!.addEventListener('click', () => {
  const sort = document.querySelector<HTMLSelectElement>('#result-sort');
  if (!sort) { report.textContent = 'Open deck results before measuring.'; return; }
  const samples: number[] = [];
  for (let i = 0; i < 20; i++) {
    const start = performance.now(); sort.value = i % 2 ? 'artist' : 'copies'; sort.dispatchEvent(new Event('change', { bubbles: true }));
    // Force layout so the sample includes selector + render + layout, not only scheduling.
    document.querySelector('#result-list')!.getBoundingClientRect(); samples.push(performance.now() - start);
  }
  samples.sort((a,b) => a-b);
  report.textContent = JSON.stringify({ browser: navigator.userAgent, width: innerWidth, samples: samples.length, medianMs: samples[10], p95Ms: samples[18], maxMs: samples[19] }, null, 2);
});
