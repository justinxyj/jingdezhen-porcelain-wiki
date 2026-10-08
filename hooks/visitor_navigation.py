"""Shared footer data and three-level breadcrumbs for public templates."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
GROUPS = {'history': ('历史', 'history/'), 'craft': ('工艺', 'craft/'), 'kilns': ('窑址', 'kilns/'), 'people': ('人物', 'museum/people/'), 'contemporary': ('当代景德镇', 'contemporary/'), 'research': ('研究', 'research/'), 'network': ('知识网络', 'network/')}
def on_env(env, config, files):
    env.globals['visitor_footer'] = json.loads((ROOT / 'docs/data/visitor-navigation.json').read_text(encoding='utf-8'))
    return env
def on_page_context(context, page, config, nav):
    # Generated Entries are build artifacts, not tracked Markdown source files.
    # Material's source-view action would point to a nonexistent GitHub raw path.
    if page.meta.get('entry_schema'):
        page.edit_url = None
    path = page.file.src_uri
    group = GROUPS.get(path.split('/')[0])
    if path.startswith('museum/'):
        group = ('博物馆', 'museum/')
    if page.meta.get('entry_category'):
        group = page.meta['entry_category']
    context['visitor_section'] = ('home' if page.is_homepage else 'time' if path in ['museum/timeline.md','museum/kiln-map.md','museum/time-and-map.md'] else 'search' if path == 'search.md' else 'research' if path.startswith('research/') else 'museum' if path.startswith('museum/') else 'encyclopedia')
    context['visitor_category'] = group if group and page.url != group[1] else None
    return context
