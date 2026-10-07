"""Keep dependencies in their configured order, but ship widgets only to their pages."""
import re
COMMON = {'dom-safe.js', 'media-policy.js', 'museum-images.js', 'site-privacy.js', 'visitor-ui.js'}
DATA = {'runtime-config.js', 'supabase.min.js', 'auth-manager.js', 'data-contract.js', 'knowledge-store.js'}
WIDGETS = {
 'entry-search.js': 'data-entry-search', 'global-network.js': 'data-global-network',
 'world-browser.js': 'data-world-browser', 'network-explorer.js': 'jdm-network-explorer',
 'museum.js': ['catalog-list','people-list'], 'wiki-enhancements.js': 'wiki-entry-root',
 'wiki-timeline.js': 'timeline-comparison-root', 'timeline-details.js': 'timeline-comparison-root',
 'voices-books.js': 'voices-books-root', 'evidence-hub.js': 'data-evidence',
 'literature-library.js': 'literature-library', 'global-kiln-map.js': 'kiln-map',
 'technology-tree.js': 'porcelain-tech-tree', 'source-audit.js': 'curator-root',
 'museum-admin-auth.js': 'curator-root', 'museum-admin.js': 'curator-root',
}
CSS = {'leaflet.css':['kiln-map','data-global-network'],'global-kiln-map.css':'kiln-map','homepage-apple.css':'jdm-apple-home',
 'timeline-comparison.css':'timeline-comparison-root','timeline-interactive.css':'timeline-comparison-root',
 'timeline-details.css':'timeline-comparison-root','entry-search.css':'data-entry-search',
 'network-explorer.css':'jdm-network-explorer','global-network.css':'data-global-network',
 'technology-tree.css':'porcelain-tech-tree','evidence-hub.css':'data-evidence','world-browser.css':'data-world-browser'}
def on_post_page(output, page, config):
    content = page.content or ''
    def matches(markers):
        return any((m in content if m.startswith('data-') else ('id="'+m+'"' in content or 'class="'+m+'"' in content)) for m in ([markers] if isinstance(markers,str) else markers))
    wanted = COMMON | {name for name, markers in WIDGETS.items() if matches(markers)}
    if wanted - COMMON: wanted |= DATA
    if 'global-kiln-map.js' in wanted or 'global-network.js' in wanted: wanted.add('leaflet.js')
    configured = {str(x).split('/')[-1] for x in config.extra_javascript}
    def script(m):
        name=m.group(1).split('?')[0].split('/')[-1]
        return m.group(0) if name not in configured or name in wanted else ''
    output=re.sub(r'<script[^>]*src="([^"]+)"[^>]*>\s*</script>',script,output)
    def css(m):
        name=m.group(1).split('/')[-1]
        return '' if name in CSS and not matches(CSS[name]) else m.group(0)
    return re.sub(r'<link[^>]*href="([^"]+\.css)"[^>]*>',css,output)
