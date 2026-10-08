"""Release gate: every generated Entry must use the actual Material site shell."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit
import json
import sys

BASE = 'https://justinxyj.github.io/jingdezhen-porcelain-wiki/'
ROOT = Path(__file__).resolve().parents[1]

class Document(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.nav_links = []
        self.header_shape = []
        self.header_depth = self.nav_depth = 0
        self.schema = []
        self.in_schema = False
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.tags.append((tag, a))
        classes = a.get('class', '').split()
        if tag == 'header' and 'md-header' in classes:
            self.header_depth = 1
        elif self.header_depth:
            self.header_depth += 1 if tag not in ['input', 'img', 'link', 'meta', 'br'] else 0
        if self.header_depth:
            self.header_shape.append((tag, a.get('class'), a.get('data-md-component'), a.get('type'), a.get('for')))
        if tag == 'nav' and 'visitor-primary-nav' in classes:
            self.nav_depth = 1
        elif self.nav_depth and tag == 'nav':
            self.nav_depth += 1
        if self.nav_depth and tag == 'a':
            self.nav_links.append(a.get('href', ''))
        if tag == 'script' and a.get('type') == 'application/ld+json':
            self.in_schema = True
            self.schema.append('')
    def handle_endtag(self, tag):
        if self.header_depth:
            self.header_depth -= 1
        if tag == 'nav' and self.nav_depth:
            self.nav_depth -= 1
        if tag == 'script':
            self.in_schema = False
    def handle_data(self, data):
        if self.in_schema:
            self.schema[-1] += data
    def count_class(self, cls):
        return sum(cls in a.get('class', '').split() for _, a in self.tags)


def validate(text, url, home, site):
    doc = Document(text)
    assert 'visitor-static-nav' not in text, 'obsolete standalone navigation'
    assert doc.count_class('md-header') == 1, 'exactly one Material Header required'
    assert doc.count_class('visitor-primary-nav') == 1, 'exactly one shared primary navigation required'
    assert sum(a.get('aria-label') == '主导航' for _, a in doc.tags) == 1, 'additional primary navigation is forbidden'
    assert doc.header_shape == home.header_shape, 'Material Header structure diverged from homepage'
    actual = [urljoin(url, x) for x in doc.nav_links]
    expected = [urljoin(BASE, x) for x in home.nav_links]
    assert actual == expected, 'primary navigation differs from homepage'
    for link in actual:
        path = urlsplit(link).path.removeprefix('/jingdezhen-porcelain-wiki/')
        assert (site / path / 'index.html').is_file(), f'missing navigation target: {link}'
    canon = [a.get('href') for tag, a in doc.tags if tag == 'link' and a.get('rel') == 'canonical']
    assert canon == [url], 'canonical URL missing or duplicated'
    assert doc.count_class('wiki-entry-card') == 1, 'Entry article missing or duplicated'
    assert not any(tag == 'a' and 'md-content__button' in a.get('class', '').split() and 'github.com/' in a.get('href', '') for tag, a in doc.tags), 'generated Entry has a nonexistent GitHub source action'
    assert '<h2>详细介绍</h2>' in text and '<h2>参考资料</h2>' in text, 'readable body and sources required'
    assert 'data-static-rendered="true"' in text, 'server-rendered reading required'
    assert len(doc.schema) == 1, 'exactly one JSON-LD document required'
    schema = json.loads(doc.schema[0])
    assert schema['url'] == url and schema['mainEntity']['mainEntityOfPage'] == url, 'JSON-LD URL mismatch'
    assert any(tag == 'meta' and a.get('name') == 'robots' and a.get('content', '').startswith('index,follow') for tag, a in doc.tags), 'indexable robots metadata required'


def main():
    site = Path(sys.argv[1] if len(sys.argv) > 1 else 'site').resolve()
    home = Document((site / 'index.html').read_text())
    pages = sorted((site / 'entry').glob('*/index.html'))
    assert len(pages) == 250, f'Expected 250 Entry pages, found {len(pages)}'
    sources = sorted((ROOT / 'docs/entry').glob('*/index.md'))
    assert len(sources) == 250 and not list((ROOT / 'docs/entry').glob('*/index.html')), 'all Entries must pass through MkDocs; no standalone HTML sources'
    for source in sources:
        text = source.read_text()
        assert text.startswith('---\n') and 'entry_schema' in text, f'{source}: missing SEO frontmatter'
        assert not any(token in text for token in ['<html', '<head>', '<body', 'visitor-primary-nav', 'visitor-static-nav']), f'{source}: generator owns article only'
    for page in pages:
        validate(page.read_text(), BASE + f'entry/{page.parent.name}/', home, site)
    all_pages = sorted(site.rglob('*.html'))
    for page in all_pages:
        text = page.read_text()
        doc = Document(text)
        assert 'visitor-static-nav' not in text, f'{page}: obsolete navigation'
        assert doc.count_class('md-header') == doc.count_class('visitor-primary-nav') == 1, f'{page}: missing/duplicate shared chrome'
        assert doc.header_shape == home.header_shape, f'{page}: Header structure differs from homepage'
        assert sum(a.get('aria-label') == '主导航' for _, a in doc.tags) == 1, f'{page}: duplicate semantic primary navigation'

    # Mutation checks prove the gate rejects old UI and duplicate/mismatched headers.
    sample = pages[0].read_text()
    mutations = [sample.replace('</body>', '<nav class="visitor-static-nav"></nav></body>'),
                 sample.replace('</body>', '<header class="md-header"></header></body>'),
                 sample.replace('visitor-primary-nav', 'removed-primary-nav', 1),
                 sample.replace('data-md-component="header"', 'data-md-component="old-header"', 1),
                 sample.replace('</body>', '<a class="md-content__button" href="https://github.com/justinxyj/jingdezhen-porcelain-wiki/raw/main/docs/entry/missing/index.md">source</a></body>')]
    for bad in mutations:
        try:
            validate(bad, BASE + f'entry/{pages[0].parent.name}/', home, site)
        except AssertionError:
            continue
        raise AssertionError('Header regression mutation unexpectedly accepted')
    for path in ['scripts/generate_entry_pages.py', 'docs/stylesheets/visitor.css', 'docs/javascripts/visitor-ui.js']:
        assert 'visitor-static-nav' not in (ROOT/path).read_text(), f'{path}: obsolete implementation returned'
    for path in ['scripts/generate_entry_pages.py', 'docs/javascripts/wiki-enhancements.js', 'types/jdm-globals.d.ts']:
        assert 'JDM_STATIC_ENTRY_SLUG' not in (ROOT/path).read_text(), f'{path}: obsolete static-shell global returned'
    print(f'PASS: 250 Entry SEO/body checks; {len(all_pages)} site pages share one Header/navigation; links checked; {len(mutations)} regression mutations rejected')

if __name__ == '__main__':
    main()
