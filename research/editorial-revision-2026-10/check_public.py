"""Read public sitemaps and pages and record technical eligibility, not indexing."""
import concurrent.futures
import hashlib
import json
import re
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
SITE = 'https://research.notelligent.app/'

def fetch(url):
    try:
        request = urllib.request.Request(url, headers={'User-Agent': 'AutoResearchEditorialAudit/1.0'})
        with urllib.request.urlopen(request, timeout=25) as response:
            raw = response.read()
            return {'url': url, 'status': response.status, 'final_url': response.url,
                    'headers': {k.lower(): v for k,v in response.headers.items()},
                    'bytes': len(raw), 'html': raw.decode('utf-8', errors='replace')}
    except urllib.error.HTTPError as error:
        return {'url': url, 'status': error.code, 'final_url': error.url}
    except Exception as error:
        return {'url': url, 'error': str(error)}

class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.canonical, self.hreflang, self.meta = [], {}, {}
        self.h1, self.scripts, self.styles, self.links = 0, [], [], []
        self.lang = None
        self.json_texts, self.current_json = [], None
        self.texts = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'html': self.lang = a.get('lang')
        if tag == 'h1': self.h1 += 1
        if tag == 'meta': self.meta[a.get('name', a.get('property', ''))] = a.get('content', '')
        if tag == 'a': self.links.append(a.get('href', ''))
        if tag == 'script':
            if a.get('src'): self.scripts.append(a['src'])
            if a.get('type') == 'application/ld+json': self.current_json = []
        if tag == 'link':
            if a.get('rel') == 'canonical': self.canonical.append(a.get('href'))
            if a.get('hreflang'): self.hreflang[a['hreflang']] = a.get('href')
            if a.get('rel') == 'stylesheet': self.styles.append(a.get('href'))

    def handle_endtag(self, tag):
        if tag == 'script' and self.current_json is not None:
            self.json_texts.append(''.join(self.current_json))
            self.current_json = None

    def handle_data(self, text):
        if self.current_json is not None: self.current_json.append(text)
        else: self.texts.append(text)

sitemaps = []
urls = []
for name in ('sitemap.xml', 'sitemap-articles.xml', 'sitemap-pages.xml'):
    result = fetch(SITE+name)
    html = result.pop('html', '')
    try:
        result['locations'] = [node.text for node in ET.fromstring(html).iter()
                               if node.tag.endswith('}loc')]
        result['lastmod'] = [node.text for node in ET.fromstring(html).iter()
                             if node.tag.endswith('}lastmod')]
        if name != 'sitemap.xml': urls += result['locations']
    except ET.ParseError: result['parse_error'] = True
    sitemaps.append(result)

results = []
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    for result in pool.map(fetch, sorted(set(urls))):
        html = result.pop('html', '')
        if html:
            p = Page(html)
            result.update({'canonical': p.canonical, 'hreflang': p.hreflang,
                           'lang': p.lang, 'h1': p.h1, 'meta': p.meta,
                           'scripts': p.scripts, 'styles': p.styles,
                           'jsonld': [json.loads(t) for t in p.json_texts],
                           'links': p.links})
            relative = urllib.parse.urlparse(result['url']).path.lstrip('/')
            lang = 'en' if relative.startswith('en/') else 'ja'
            article_id = relative.removeprefix('en/').removesuffix('.html')
            body_path = ROOT / 'content/articles' / article_id / f'body.{lang}.html'
            if body_path.exists():
                result['article_body_exact_match'] = body_path.read_text().strip() in html
                result['article_body_sha256'] = hashlib.sha256(body_path.read_bytes()).hexdigest()
            if relative in ('', 'about.html', 'editorial-policy.html', 'privacy-policy.html',
                            'topics/ai-agents/index.html', 'topics/ai-agents/'):
                result['readable_text'] = re.sub(r'\s+', ' ', ' '.join(p.texts)).strip()
        results.append(result)

extras = [fetch(SITE+'robots.txt'),
          fetch('https://ymuichiro.github.io/auto-research-skill/'),
          fetch('https://ymuichiro.github.io/auto-research-skill/2026-08-12-beyond-ai-agents-hacw.html')]
for e in extras:
    html=e.pop('html', '')
    if e['url'].endswith('robots.txt'): e['body']=html
    else:
        e['canonical']=Page(html).canonical if html else []

articles = [r for r in results if 'article_body_exact_match' in r]
def expected_hreflang(r):
    relative = urllib.parse.urlparse(r['url']).path.lstrip('/').removeprefix('en/')
    return {'ja': SITE+relative, 'en': SITE+'en/'+relative, 'x-default': SITE+relative}

def schema_ok(r):
    relative = urllib.parse.urlparse(r['url']).path.lstrip('/')
    local = ROOT / 'public' / relative
    expected = Page(local.read_text())
    public_schemas = [s for s in r['jsonld'] if s.get('@type') == 'NewsArticle']
    local_schemas = []
    for raw in expected.json_texts:
        s = json.loads(raw)
        if s.get('@type') == 'NewsArticle': local_schemas.append(s)
    return (len(public_schemas) == 1 and public_schemas == local_schemas
            and public_schemas[0].get('url') == r['url']
            and public_schemas[0].get('mainEntityOfPage') == r['url']
            and public_schemas[0].get('inLanguage') == r['lang']
            and all(public_schemas[0].get(k) for k in ('headline','author','dateModified','image'))
            and r['meta'].get('description') == expected.meta.get('description')
            and r['meta'].get('article:published_time') == expected.meta.get('article:published_time')
            and r['meta'].get('article:modified_time') == expected.meta.get('article:modified_time'))

summary = {'captured_at_utc': datetime.now(timezone.utc).isoformat(),
           'sitemap_urls': len(set(urls)), 'articles_checked': len(articles),
           'status_not_200': [r['url'] for r in results if r.get('status') != 200],
           'canonical_mismatches': [r['url'] for r in results if r.get('canonical') != [r['url']]],
           'article_body_mismatches': [r['url'] for r in articles if not r['article_body_exact_match']],
           'noindex_urls': [r['url'] for r in results if 'noindex' in r.get('meta',{}).get('robots','').lower()
                            or 'noindex' in r.get('headers',{}).get('x-robots-tag','').lower()],
           'article_h1_failures': [r['url'] for r in articles if r['h1'] != 1],
           'article_hreflang_failures': [r['url'] for r in articles if r['hreflang'] != expected_hreflang(r)],
           'article_jsonld_failures': [r['url'] for r in articles if not schema_ok(r)],
           'script_urls': sorted(set(s for r in results for s in r.get('scripts',[])))}
(OUT/'public-verification.json').write_text(json.dumps({'summary':summary, 'sitemaps':sitemaps,
    'pages':results, 'extras':extras}, ensure_ascii=False, indent=2)+'\n')
print(json.dumps(summary, ensure_ascii=False, indent=2))
print('sitemaps:', [(r['url'], len(r.get('locations',[]))) for r in sitemaps])
print('robots:',extras[0].get('status'));
assert len(articles) == 72, 'expected all72 article bodies'
assert len(set(urls)) >= 72, 'sitemap coverage'
assert not any(summary[k] for k in ('status_not_200','canonical_mismatches','article_body_mismatches','noindex_urls','article_h1_failures','article_hreflang_failures','article_jsonld_failures')), 'public verification failed'
