import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
const code=fs.readFileSync('docs/javascripts/wiki-enhancements.js','utf8').replace("  if(document.readyState==='loading')",'  window.__entryRender=render; window.__entryInit=init;\n  if(document.readyState===\'loading\')');
const entry={id:'fixture-id',slug:'fixture',category:'测试',zh:{title:'测试标题',summary:'仅用于渲染测试',content:'<p>仅用于渲染测试的正文。</p>'},sources:[]};
for(const html of ['<div id="wiki-entry-root"></div>','<article id="wiki-entry-root" class="wiki-entry-card wiki-entry-v2"></article>']){
 const dom=new JSDOM(html,{runScripts:'outside-only',url:'https://example.org/entry/'});const w=dom.window;w.eval(code);
 const root=w.document.getElementById('wiki-entry-root');
 for(let i=0;i<2;i++){w.__entryRender(root,entry,{recommendations:[]});assert.equal(w.document.querySelectorAll('.wiki-entry-card').length,1);assert.equal(w.document.querySelectorAll('.wiki-entry-card .wiki-entry-card').length,0);}
 dom.window.close();
}
for(const failure of [false,true]){
 const dom=new JSDOM('<article id="wiki-entry-root" class="wiki-entry-card wiki-entry-v2" data-static-rendered="true" data-entry-slug="fixture"><h1>初始标题</h1><section class="wiki-entry-body"><p>原始正文必须保持。</p></section><details class="visitor-research"><summary>深入研究</summary><a href="/research/">原始资料</a></details><footer class="wiki-entry-footer">阅读提示</footer></article>',{runScripts:'outside-only',url:'https://example.org/entry/fixture/'});
 const w=dom.window;let reads=0;
 w.JDM_KNOWLEDGE={url:e=>'/entry/'+e.slug+'/',get:async()=>{reads++;if(failure)throw Error('test outage');return entry;},recommendations:async()=>[{entry,target_label:'测试关联',target_category:'测试',reason:'测试关系'}]};
 w.eval(code);w.__entryInit();
 const root=w.document.getElementById('wiki-entry-root'),body=root.querySelector('.wiki-entry-body'),title=root.querySelector('h1'),before=root.innerHTML;
 w.__entryRender(root,entry,{});assert.equal(root.innerHTML,before);assert.equal(reads,0);
 const research=root.querySelector('details');research.open=true;research.dispatchEvent(new w.Event('toggle'));
 await new Promise(resolve=>setTimeout(resolve,30));
 assert.equal(root.querySelector('.wiki-entry-body'),body);assert.equal(root.querySelector('h1'),title);assert.equal(w.document.querySelectorAll('.wiki-entry-card').length,1);assert.ok(root.querySelector('.wiki-entry-footer'));
 assert.equal(root.dataset.enhancementState,failure?'error':'ready');assert.equal(reads,1);assert.ok(research.querySelector('.wiki-entry-live-related'));assert.ok(research.querySelector('a[href="/research/"]'));
 dom.window.close();
}
console.log('PASS: immutable static article, lazy successful/failed enhancement, no initial reads, idempotent dynamic div/article hosts');
