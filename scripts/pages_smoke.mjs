import { chromium } from 'playwright';

const base=(process.env.SITE_URL||'https://justinxyj.github.io/jingdezhen-porcelain-wiki/').replace(/\/$/,'')+'/';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[],responses=[];
page.on('pageerror',e=>errors.push('pageerror: '+e.message));
page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text())});
page.on('response',r=>{if(r.status()>=500)responses.push(r.status()+' '+r.url())});

async function check(path,selector){
  await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:30000});
  await page.locator(selector).first().waitFor({state:'visible',timeout:20000});
  return page.title();
}
const checks=[
  ['首页','', 'body'],
  ['器物图谱','museum/catalog/','#catalog-list'],
  ['时间轴','museum/timeline/','#timeline'],
  ['72工序','craft/technology-tree/','#porcelain-tech-tree'],
  ['知识条目','entry/?slug=blue-and-white','#wiki-entry-root']
];
for(const [name,path,selector] of checks){await check(path,selector);console.log('PASS',name)}
await browser.close();
if(responses.length)throw new Error('HTTP 5xx: '+responses.join('; '));
if(errors.length)throw new Error('Browser errors:\n'+errors.join('\n'));
console.log('PASS pages smoke');