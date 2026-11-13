import{serviceWorkerSource}from'./service-worker.mjs';
import{readdir,readFile,writeFile}from'node:fs/promises';import{createHash}from'node:crypto';
async function walk(p){let a=[];for(const e of await readdir(p,{withFileTypes:true})){const q=p+'/'+e.name;if(e.isDirectory())a.push(...await walk(q));else a.push(q)}return a}
const files=(await walk('dist')).filter(x=>!x.endsWith('sw.js')&&!x.endsWith('offline-manifest.json'));const hash=createHash('sha256');for(const f of files)hash.update(await readFile(f));const version=hash.digest('hex').slice(0,16);const assets=['./',...files.filter(f=>f!=='dist/index.html').map(f=>'./'+f.slice(5)),'./offline-manifest.json'];await writeFile('dist/offline-manifest.json',JSON.stringify({version,assets}));
await writeFile('dist/sw.js',serviceWorkerSource(version,assets));
console.log('Offline package:',assets.length,'assets;',version);
