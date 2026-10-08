"""Compare archived homepages with the published homepage using identical viewports."""
import argparse,json,os,shutil,urllib.parse
from pathlib import Path
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--before',default='http://127.0.0.1:8015/jingdezhen-porcelain-wiki/')
parser.add_argument('--baseline',default='http://127.0.0.1:8014/jingdezhen-porcelain-wiki/')
parser.add_argument('--current',default='https://justinxyj.github.io/jingdezhen-porcelain-wiki/')
parser.add_argument('--output',type=Path,default=Path('/tmp/ux2-home-measurement.json'))
a=parser.parse_args();rows=[]
with sync_playwright() as p:
 opts={'headless':True,'executable_path':shutil.which('chromium')}
 if os.getenv('HTTPS_PROXY'):
  u=urllib.parse.urlsplit(os.environ['HTTPS_PROXY']);opts['proxy']={'server':f'{u.scheme}://{u.hostname}:{u.port or 80}','bypass':'127.0.0.1,localhost'}
  if u.username:opts['proxy']['username']=urllib.parse.unquote(u.username)
  if u.password:opts['proxy']['password']=urllib.parse.unquote(u.password)
 b=p.chromium.launch(**opts)
 for width,height in [(1440,1000),(390,844)]:
  for label,url in [('Before first UX fa567b2',a.before),('Round 2 production baseline 4b7a2bd',a.baseline),('Current production',a.current)]:
   page=b.new_page(ignore_https_errors=True,viewport={'width':width,'height':height},reduced_motion='reduce');page.goto(url,wait_until='domcontentloaded');page.wait_for_timeout(1000)
   x=page.evaluate('''()=>{const main=document.querySelector('main');const visible=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.top<innerHeight&&r.bottom>0};return {total_height:document.documentElement.scrollHeight,sections:main.querySelectorAll('section').length,first_screen:[...main.querySelectorAll('h1,h2,p,input,button,a')].filter(visible).map(e=>({tag:e.tagName,text:(e.innerText||e.getAttribute('placeholder')||'').trim().slice(0,60)}))}}''')
   rows.append({'baseline':label,'url':url,'viewport':[width,height],**x});page.close()
 b.close()
a.output.write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
for row in rows:print(row['baseline'],row['viewport'],row['total_height'],row['sections'],len(row['first_screen']))
