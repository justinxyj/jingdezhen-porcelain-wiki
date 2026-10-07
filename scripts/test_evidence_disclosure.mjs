import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {JSDOM} from 'jsdom';
const sources=[
 {url:'https://example.org/museum',label:'Museum',source_type:'museum'},
 {url:'https://example.org/paper',label:'Paper',source_type:'journal'},
 {url:'https://example.org/document',label:'Document',source_type:'historical_document'},
 {url:'https://example.org/official',label:'Official',source_type:'official'},
 {url:'https://example.org/link',label:'Ordinary URL'},
 {url:'https://example.org/incomplete',label:'Incomplete verification',verification:{status:'verified'}},
 {url:'https://example.org/complete',label:'Complete synthetic record',source_type:'journal',verification:{status:'verified',reviewed_at:'2026-10-07',reviewer:'Synthetic test fixture',claim:'Fixture claim',locator:'Fixture page 1'}},
 {url:'https://example.org/museum',label:'Duplicate'},
 {url:'https://example.org/private',label:'Unpublished',status:'draft'},
];
const entry={id:'00000000-0000-4000-8000-000000000000',slug:'evidence-test',category:'测试',status:'published',zh:{title:'Synthetic evidence fixture',summary:'A test fixture.',content:'<p>Fixture body.</p>',meta:{}},sources};
const result=spawnSync(process.execPath,['scripts/sources_render_dynamic_harness.js'],{input:JSON.stringify([entry]),encoding:'utf8'});
assert.equal(result.status,0,result.stderr);
const html=JSON.parse(result.stdout)['evidence-test'];
const document=new JSDOM(html).window.document;
const disclosure=document.querySelector('details.visitor-references');
assert.ok(disclosure);assert.equal(disclosure.hasAttribute('open'),false);
assert.equal(disclosure.querySelector('summary').textContent,'参考资料 7');
for(const label of ['博物馆与馆藏机构 1','学术研究 2','历史文献 1','官方资料 1','其他资料 2'])assert.ok(html.includes(label),label);
assert.equal(document.querySelectorAll('.wiki-entry-source-links a').length,7);
assert.equal((html.match(/已核验（对应论述）/g)||[]).length,1,'Only a complete explicit record can carry a verified label');
assert.ok(!html.includes('Unpublished'));assert.ok(!html.includes('Duplicate'));
console.log('PASS: progressive disclosure, metadata-only categories, duplicate/private exclusion, complete verification chain boundary');
