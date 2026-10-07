import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><body><select id="catalog-glaze"><option value="">全部</option></select><select id="catalog-pattern"><option value="">全部</option></select><select id="catalog-institution"><option value="">全部</option></select><div id="catalog-count"></div><div id="catalog-list"></div><div id="people-list"></div></body>',{url:'https://example.org/jingdezhen-porcelain-wiki/museum/catalog/',runScripts:'outside-only'});
const w=dom.window;
const known={id:'known',slug:'fixture-known',category:'器物',status:'published',zh:{title:'Known metadata fixture',summary:'Test fixture',meta:{glaze:['铜红釉'],pattern:['莲纹'],institution:'Test Museum'}}};
const unknown={id:'unknown',slug:'fixture-unknown',category:'器物',status:'published',zh:{title:'大都会红釉莲纹瓶（标题不能作为元数据）',summary:'Unknown metadata fixture',meta:{}}};
const atlas=entry=>({entry,timeline:[],worlds:[],people:[],kilns:[],documents:[],craftProcesses:[]});
const person={entry:{id:'person',slug:'fixture-person',category:'人物',status:'published',zh:{title:'Synthetic person',summary:'A documented contribution fixture.',meta:{birth_year:1934,importance:'Contribution fixture.',keywords:['Fixture keyword']}}},era:'modern',role:'Test role',worlds:[],works:[],kilns:[],documents:[],craftProcesses:[],sameEra:[],relatedPeople:[]};
w.JDM_KNOWLEDGE={objectAtlas:async()=>[atlas(known),atlas(unknown)],personAtlas:async()=>[person],url:e=>'/jingdezhen-porcelain-wiki/entry/'+e.slug+'/'};
w.eval(fs.readFileSync('docs/javascripts/dom-safe.js','utf8'));w.eval(fs.readFileSync('docs/javascripts/museum.js','utf8'));
for(let i=0;i<20;i++)await new Promise(resolve=>setTimeout(resolve,5));
const d=w.document;
assert.equal(d.querySelectorAll('.catalog-card').length,2);
assert.deepEqual([...d.querySelector('#catalog-institution').options].map(x=>x.value),['','Test Museum']);
for(const [id,value] of [['glaze','铜红釉'],['pattern','莲纹'],['institution','Test Museum']]){
 const select=d.querySelector('#catalog-'+id);select.value=value;select.dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.equal(d.querySelectorAll('.catalog-card').length,1,id);assert.ok(d.querySelector('.catalog-card').textContent.includes('Known metadata fixture'));
 select.value='';select.dispatchEvent(new w.Event('change',{bubbles:true}));
}
assert.ok(d.querySelector('.person-card').textContent.includes('1934—卒年不详'));
assert.ok(d.querySelector('.person-card').textContent.includes('为什么重要'));
assert.ok(d.querySelector('.person-card').textContent.includes('Contribution fixture.'));
assert.ok(d.querySelector('[aria-label="关键词"]').textContent.includes('Fixture keyword'));
w.close();console.log('PASS: exact metadata facets, title-only metadata excluded, partial lifespan, importance and keywords (synthetic fixtures)');
