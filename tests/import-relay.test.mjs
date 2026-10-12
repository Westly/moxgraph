import {test} from 'node:test';
import assert from 'node:assert/strict';
import {handle as rawHandle, upstream, MAX_BYTES} from '../tools/import-relay/worker.mjs';
const bindings = () => Object.fromEntries(['IMPORT_BURST_LIMIT','IMPORT_IP_LIMIT','IMPORT_PROVIDER_LIMIT'].map(k => [k,{limit:async()=>({success:true})}]));
const handle = (request, fetcher, env = bindings()) => {
 const headers=new Headers(request.headers); headers.set('CF-Connecting-IP','192.0.2.1');
 return rawHandle(new Request(request,{headers}),fetcher,env);
};
const root='https://moxgraph-import-relay-probe.westlywhite.workers.dev';
const path='/api/moxfield/3x55_3CFz060qxL2xac3NA';
const json=()=>new Response('{"publicId":"test"}',{headers:{'Content-Type':'application/json','Set-Cookie':'never-forward=1'}});
test('only fixed provider hosts and exact identifiers can be requested',()=>{
 assert.equal(upstream(path),'https://api.moxfield.com/v2/decks/all/3x55_3CFz060qxL2xac3NA');
 assert.equal(upstream('/api/archidekt/19780118'),'https://archidekt.com/api/decks/19780118/');
 for(const p of ['/api/moxfield/abc','/api/archidekt/1/other','/api/evil/123','/api/archidekt/123%2fsecret','/api/archidekt/001','/api/moxfield/https://localhost'])assert.equal(upstream(p),null);
});
test('rejects unsupported routes, methods, query and origins before network',async()=>{
 let calls=0; const f=()=>{calls++;return json()};
 for(const [p,options,status] of [[path+'?url=https://evil.test',{},400],['/other',{},404],[path,{method:'POST'},405],[path,{headers:{Origin:'https://evil.test'}},403]]){
  assert.equal((await handle(new Request(root+p,options),f)).status,status);
 }assert.equal(calls,0);
});
test('does not forward caller secrets or upstream cookies; preserves body bytes',async()=>{
 const r=await handle(new Request(root+path,{headers:{Origin:'https://moxgraph.com',Authorization:'secret',Cookie:'private=1'}}),async(url,init)=>{
  assert.equal(url,upstream(path));assert.equal(init.redirect,'manual');
  assert.deepEqual(Object.keys(init.headers).sort(),['Accept','Accept-Encoding','User-Agent']);assert.equal(init.headers['Accept-Encoding'],'identity');return json();
 });assert.equal(r.headers.get('Set-Cookie'),null);assert.equal(r.headers.get('Access-Control-Allow-Origin'),'https://moxgraph.com');
 assert.equal(r.headers.get('Cache-Control'),'no-store');assert.equal(await r.text(),'{"publicId":"test"}');
 assert.equal(r.headers.get('Content-Encoding'),'identity');
});

test('all rate limits run before upstream; denial and broken configuration fail closed',async()=>{
 for(const name of ['IMPORT_BURST_LIMIT','IMPORT_IP_LIMIT','IMPORT_PROVIDER_LIMIT']){
  let calls=0;const env=bindings();env[name].limit=async()=>({success:false});
  const r=await handle(new Request(root+path,{headers:{Origin:'https://moxgraph.com'}}),async()=>{calls++;return json()},env);
  assert.equal(r.status,429);assert.equal(calls,0);assert.equal(r.headers.get('Retry-After'),'60');
  assert.equal(r.headers.get('Access-Control-Expose-Headers'),'Retry-After');assert.deepEqual(await r.json(),{error:'relay_rate_limited'});
 }
 for(const env of [{},{IMPORT_BURST_LIMIT:{limit:async()=>{throw Error('internal')}}}]){
  const r=await handle(new Request(root+path),()=>assert.fail('must not call provider'),env);
  assert.equal(r.status,503);assert.deepEqual(await r.json(),{error:'rate_limit_unavailable'});
 }
});

test('rate keys use only trusted client IP and fixed provider name; never deck IDs or caller-forwarded headers',async()=>{
 const seen=[];const env=Object.fromEntries(Object.keys(bindings()).map(k=>[k,{limit:async({key})=>{seen.push([k,key]);return{success:true}}}]));
 const r=await handle(new Request(root+path,{headers:{'X-Forwarded-For':'attacker','User-Agent':'attacker'}}),json,env);await r.text();
 assert.deepEqual(seen,[['IMPORT_BURST_LIMIT','192.0.2.1'],['IMPORT_IP_LIMIT','192.0.2.1'],['IMPORT_PROVIDER_LIMIT','moxfield']]);
 assert.equal((await rawHandle(new Request(root+path),()=>assert.fail('no IP'),env)).status,400);
});
test('does not retry or follow redirects, and distinguishes 429 and 404',async()=>{
 for(const [status,expected] of [[302,502],[403,502],[404,404],[429,429],[500,502]]){
  let calls=0;const r=await handle(new Request(root+path),async()=>{calls++;return new Response('',{status,headers:{Location:'https://evil.test'}})});
  assert.equal(r.status,expected);assert.equal(calls,1);assert.deepEqual(await r.json(),{error:`provider_http_${status}`});
 }
});
test('rejects non JSON and oversized declared responses',async()=>{
 for(const headers of [{'Content-Type':'text/html'},{'Content-Type':'application/json','Content-Length':String(MAX_BYTES+1)}]){
  const r=await handle(new Request(root+path),async()=>new Response('body',{headers}));assert.equal(r.status,502);
 }
});
test('enforces streamed response limit when length is absent or misleading',async()=>{
 const r=await handle(new Request(root+path),async()=>new Response(new Uint8Array(MAX_BYTES+1),{headers:{'Content-Type':'application/json','Content-Length':'1'}}));
 await assert.rejects(r.arrayBuffer(),/provider_response_too_large/);
});
test('network failure produces bounded error without sensitive exception text',async()=>{
 const r=await handle(new Request(root+path),async()=>{throw Error('internal-secret')});
 assert.equal(r.status,502);assert.deepEqual(await r.json(),{error:'provider_unavailable'});
});
