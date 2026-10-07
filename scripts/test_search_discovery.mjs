import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const rows=Array.from({length:30},(_,i)=>({id:String(i),slug:'blue-'+i,status:'published',category:'器物',zh:{title:'青花瓶 '+i,summary:'元代青花器物',meta:{era:'yuan',timeline:[{era:'yuan',lane:'jdz'}]}},sources:[]}));
rows.push({id:'t',slug:'tang-ying',category:'人物',zh:{title:'唐英',summary:'清代督陶官',meta:{}},status:'published'});
function builder(table){let values=table==='entries'?[...rows]:[],start=0,end=Infinity;const api={select(){return api},eq(key,value){values=values.filter(x=>x[key]===value);return api},in(key,list){values=values.filter(x=>list.includes(x[key]));return api},order(){return api},limit(n){end=n-1;return api},range(a,b){start=a;end=b;return api},abortSignal(){return api},then(resolve,reject){return Promise.resolve(values.slice(start,end+1)).then(resolve,reject)}};return api;}
const window={JDM_AUTH:{getClient:()=>({from:builder}),request:async fn=>fn({from:builder},undefined)},JDM_CONTRACT:{entries:x=>x,mediaList:x=>x}};
vm.runInNewContext(fs.readFileSync(new URL('../docs/javascripts/knowledge-store.js',import.meta.url),'utf8'),{window,console,AbortController,setTimeout,clearTimeout,URLSearchParams});
const store=window.JDM_KNOWLEDGE;
assert.equal((await store.searchEntries('does-not-exist')).length,0);
assert.equal((await store.searchEntries('qinghua',{limit:100})).length,30);
assert.equal((await store.searchEntries('tang ying'))[0].slug,'tang-ying');
assert.equal((await store.searchEntries('青花瓷',{limit:100})).length,30);
assert.equal((await store.searchEntries('青花',{category:'人物'})).length,0);
const a=await store.searchDiscoveryPage('青花',{limit:12}),b=await store.searchDiscoveryPage('青花',{limit:12,offset:12}),c=await store.searchDiscoveryPage('青花',{limit:12,offset:24});
assert.equal(a.total,30);assert.equal(a.results.length,12);assert.equal(c.results.length,6);assert.equal(new Set([...a.results,...b.results,...c.results].map(e=>e.id)).size,30);
assert.equal(store.url(rows[0]),'/jingdezhen-porcelain-wiki/entry/blue-0/');
console.log('PASS: zero-match exclusion, aliases, category filtering, non-overlapping pages, canonical entry URLs');
