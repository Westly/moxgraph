"use strict";
const input = document.querySelector("#url");
const run = document.querySelector("#run");
const result = document.querySelector("#result");
const save = document.querySelector("#save");
document.querySelector("#origin").textContent = location.origin;
let evidence;
function endpoint(text) {
  const url = new URL(text);
  if (url.protocol !== "https:" || url.username || url.password || url.port) throw new Error("Use an HTTPS public deck URL without credentials or a port.");
  const match = url.pathname.match(/^\/decks\/([A-Za-z0-9_-]+)(?:\/[^/]*)?\/?$/);
  if (!match) throw new Error("Expected a public deck path.");
  if (["moxfield.com", "www.moxfield.com"].includes(url.hostname) && /^[A-Za-z0-9_-]{22}$/.test(match[1]))
    return {provider:"moxfield", url:`https://api.moxfield.com/v2/decks/all/${match[1]}`};
  if (["archidekt.com", "www.archidekt.com"].includes(url.hostname) && /^\d+$/.test(match[1]))
    return {provider:"archidekt", url:`https://archidekt.com/api/decks/${match[1]}/`};
  throw new Error("Only Moxfield and Archidekt public deck URLs are allowed.");
}
run.addEventListener("click", async () => {
  run.disabled = true;
  save.disabled = true;
  result.textContent = "Request in progress…";
  evidence = {schemaVersion:1, observedAt:new Date().toISOString(), origin:location.origin,
    method:"GET", mode:"cors", credentials:"omit", customHeaders:false};
  try {
    Object.assign(evidence, endpoint(input.value.trim()));
    const response = await fetch(evidence.url, {mode:"cors", credentials:"omit", signal:AbortSignal.timeout(20000)});
    Object.assign(evidence, {status:response.status, responseType:response.type,
      exposedHeaders:Object.fromEntries(response.headers.entries())});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    evidence.shape = {topLevelKeys:Object.keys(payload).sort(),
      boards:payload.boards ? Object.fromEntries(Object.entries(payload.boards).map(([k,v])=>[k,{count:v.count,rows:Object.keys(v.cards ?? {}).length}])) : undefined,
      cardRows:Array.isArray(payload.cards) ? payload.cards.length : undefined};
    evidence.outcome = "readable-json";
  } catch(error) {
    evidence.outcome = "failed";
    evidence.error = {name:error.name, message:error.message};
    evidence.note = "A failed fetch alone does not distinguish CORS, a challenge, or network failure. Inspect the browser console for the cause. No response body is retained.";
  }
  result.textContent = JSON.stringify(evidence, null, 2);
  save.disabled = false;
  setTimeout(()=>{run.disabled=false;}, 2000);
});
save.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(evidence,null,2)+"\n"], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `moxgraph-probe-${evidence.provider ?? "invalid"}-${Date.now()}.json`;
  link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
});
