import {describe,it,expect} from 'vitest';
import vm from 'node:vm';
import {serviceWorkerSource} from '../scripts/service-worker.mjs';
function harness(missing=false){
 const listeners={};const matches=[];
 const cache={match:async(request,options)=>{const url=typeof request==='string'?request:request.url;matches.push({url,options});if(missing&&url.endsWith('main.js'))return undefined;if(typeof request!=='string'&&request.headers?.get('Origin')&&!options?.ignoreVary)return undefined;return new Response(url.endsWith('.js')?'export const ready=true;':'<!doctype html>',{headers:{'Vary':'Origin','Content-Type':url.endsWith('.js')?'text/javascript':'text/html'}})},addAll:async()=>{}};
 const caches={open:async()=>cache,keys:async()=>['micrometer-test'],delete:async()=>true};
 const self={location:new URL('https://example.test/lab/sw.js'),addEventListener:(type,fn)=>listeners[type]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{}}};
 vm.runInNewContext(serviceWorkerSource('test',['./','./main.js']),{self,caches,URL,fetch:async()=>{throw Error('Origin server stopped')}});
 return{listeners,matches};
}
describe('offline response matching',()=>{
 it('serves a cached module even when preview responses vary by Origin and the origin server is stopped',async()=>{const{listeners,matches}=harness();let response;listeners.fetch({request:new Request('https://example.test/lab/main.js',{headers:{Origin:'https://example.test'}}),respondWith:p=>response=p});expect(await(await response).text()).toBe('export const ready=true;');expect(matches[0].options.ignoreVary).toBe(true)});
 it('verifies all active-version resources before reporting ready',async()=>{for(const missing of [false,true]){const{listeners}=harness(missing);let work;let result;listeners.message({data:{type:'CHECK_READY'},ports:[{postMessage:r=>result=r}],waitUntil:p=>work=p});await work;expect(result.ready).toBe(!missing);expect(result.version).toBe('micrometer-test')}});
});
