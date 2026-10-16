import { stageArticle, paintMotion } from './article-motion.js';

(() => {
  const stream = document.querySelector('[data-article-stream]');
  if (!stream || !('IntersectionObserver' in window)) return;
  const locale = stream.dataset.locale;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const loaded = new Set([...stream.querySelectorAll('[data-article-id]')].map((node) => node.dataset.articleId));
  const records = new Map();
  const requests = new WeakMap();
  const first = stream.querySelector('[data-article-id]');
  stageArticle(first);
  let active = first;
  let frame = 0;
  let suspended = false;
  let controller;
  let pendingFragment;

  function snapshotHead() {
    return { title: document.title, nodes: [...document.head.querySelectorAll('meta[name="description"], meta[property^="og:"], meta[name^="twitter:"], meta[property^="article:"], link[rel="canonical"], link[hreflang], script[type="application/ld+json"]')].map((node) => node.outerHTML).join('') };
  }
  records.set(first.dataset.articleId, snapshotHead());

  function setHead(record) {
    document.title = record.title;
    const template = document.createElement('template');
    template.innerHTML = record.nodes;
    document.head.querySelectorAll('meta[name="description"], meta[property^="og:"], meta[name^="twitter:"], meta[property^="article:"], link[rel="canonical"], link[hreflang], script[type="application/ld+json"]').forEach((node) => node.remove());
    document.head.append(template.content);
    const alternate = document.head.querySelector(`link[hreflang="${locale === 'ja' ? 'en' : 'ja'}"]`);
    const toggle = document.querySelector('.lang-switch');
    if (toggle && alternate) {
      // Keep local previews and base-path deployments on their own origin.
      const target = new URL(alternate.href);
      toggle.href = target.pathname + target.hash;
    }
  }

  function namespaceIds(root, prefix) {
    const ids = new Map();
    root.querySelectorAll('[id]').forEach((node) => { ids.set(node.id, `${prefix}--${node.id}`); node.id = ids.get(node.id); });
    root.querySelectorAll('*').forEach((node) => {
      for (const name of ['href', 'xlink:href', 'aria-labelledby', 'aria-describedby', 'aria-controls', 'for', 'fill', 'stroke', 'filter', 'clip-path', 'mask', 'style']) {
        const value = node.getAttribute(name);
        if (!value) continue;
        let next = value;
        if (name.startsWith('aria-') || name === 'for') next = value.split(/\s+/).map((id) => ids.get(id) ?? id).join(' ');
        else if (value.startsWith('#') && ids.has(value.slice(1))) {
          next = `#${ids.get(value.slice(1))}`;
          if (name === 'href' && node.tagName === 'A') node.dataset.originalFragment = value;
        }
        else next = value.replace(/url\(#([^)]*)\)/g, (match, id) => ids.has(id) ? `url(#${ids.get(id)})` : match);
        node.setAttribute(name, next);
      }
    });
  }

  async function loadNext(boundary) {
    const id = boundary.dataset.nextId;
    if (suspended || boundary.dataset.loading || loaded.has(id)) return;
    boundary.dataset.loading = 'true';
    const status = boundary.querySelector('.stream-status');
    const retry = boundary.querySelector('[data-stream-retry]');
    retry.hidden = true;
    status.textContent = locale === 'ja' ? '次の記事を準備しています' : 'Preparing the next briefing';
    const requestController = new AbortController();
    controller = requestController;
    requests.set(boundary, requestController);
    const timeout = setTimeout(() => requestController.abort(), 12000);
    try {
      const response = await fetch(boundary.dataset.nextUrl, { signal: requestController.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      if (typeof payload.html !== 'string' || typeof payload.continuation !== 'string' || typeof payload.head?.title !== 'string' || typeof payload.head?.nodes !== 'string') throw new Error('Incomplete article payload');
      if (payload.id !== id || payload.locale !== locale || loaded.has(id) || !boundary.isConnected || suspended || requests.get(boundary) !== requestController) throw new Error('Stale article response');
      const template = document.createElement('template');
      template.innerHTML = payload.html;
      const article = template.content.querySelector('[data-article-id]');
      if (!article || article.dataset.articleId !== id) throw new Error('Invalid article');
      const mount = boundary.querySelector('.article-mount');
      if (!mount) throw new Error('Missing article mount');
      namespaceIds(article, id);
      records.set(id, payload.head);
      loaded.add(id);
      observer.unobserve(boundary);
      // Keep the preview's top anchor and minimum footprint while its contents
      // expand downward. Removing an ancestor would disturb scroll anchoring.
      mount.style.minHeight = `${mount.getBoundingClientRect().height}px`;
      mount.replaceChildren(article);
      status.remove();
      retry.remove();
      boundary.removeAttribute('data-next-url');
      boundary.removeAttribute('data-next-id');
      stageArticle(article);
      boundary.classList.add('is-loaded');
      const continuation = document.createElement('template');
      continuation.innerHTML = payload.continuation;
      stream.append(continuation.content);
      document.dispatchEvent(new CustomEvent('article-added', { detail: article }));
      observeNext();
      updateActive();
    } catch (error) {
      if (suspended || requests.get(boundary) !== requestController) return;
      status.textContent = locale === 'ja' ? '読み込めませんでした。再試行するか、記事のリンクから開けます。' : 'Could not load. Retry or open the article using its link.';
      retry.hidden = false;
      observer.unobserve(boundary); // A failure must not produce an automatic retry loop.
    } finally {
      clearTimeout(timeout);
      if (requests.get(boundary) === requestController) {
        requests.delete(boundary);
        delete boundary.dataset.loading;
      }
    }
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) void loadNext(entry.target); });
  }, { rootMargin: '1000px 0px', threshold: 0 });

  function observeNext() {
    stream.querySelectorAll('[data-next-url]').forEach((boundary) => observer.observe(boundary));
  }

  function updateActive() {
    frame = 0;
    if (suspended) return;
    const readingLine = Math.min(innerHeight * 0.3, 220);
    let candidate = active;
    const articles = [...stream.querySelectorAll('[data-article-id]')];
    const geometry = new Map(articles.map(article => [article, stageArticle(article).getBoundingClientRect()]));
    const previews = [...stream.querySelectorAll('.next-article-preview')].map(node => [node, node.parentElement.getBoundingClientRect()]);
    articles.forEach((article) => {
      const rect = geometry.get(article);
      if (rect.top <= readingLine && rect.bottom > readingLine) candidate = article;
    });
    articles.forEach((article) => {
      article.classList.remove('is-approaching', 'is-receding');
      paintMotion(article, geometry.get(article), innerHeight, reducedMotion.matches);
    });
    previews.forEach(([node, rect]) => paintMotion(node, rect, innerHeight, reducedMotion.matches));
    const headings = [...candidate.querySelectorAll('.article-body h2')];
    const section = headings.filter((heading) => heading.getBoundingClientRect().top <= readingLine + 36).at(-1) ?? headings[0];
    candidate.querySelectorAll('.reading-map a').forEach((link) => {
      if (section && link.getAttribute('href') === `#${section.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (candidate !== active && candidate) {
      active = candidate;
      setHead(records.get(active.dataset.articleId));
      const fragment = pendingFragment?.owner === active && performance.now() < pendingFragment.until ? pendingFragment.hash : '';
      history.replaceState({ ...(history.state ?? {}), articleStream: true, article: active.dataset.articleId }, '', active.dataset.articlePath + fragment);
    }
  }

  stream.addEventListener('click', (event) => {
    const retry = event.target.closest('[data-stream-retry]');
    if (retry) void loadNext(retry.closest('[data-next-url]'));
    const anchor = event.target.closest('a[data-original-fragment]');
    if (anchor && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
      const target = document.getElementById(anchor.getAttribute('href').slice(1));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({block:'start',behavior:reducedMotion.matches?'instant':'smooth'});
      const owner = anchor.closest('[data-article-id]');
      pendingFragment = {owner,hash:anchor.dataset.originalFragment,until:performance.now()+2000};
      active = owner;
      setHead(records.get(owner.dataset.articleId));
      history.replaceState({...(history.state ?? {}),articleStream:true,article:owner.dataset.articleId},'',owner.dataset.articlePath+anchor.dataset.originalFragment);
    }
  });
  addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(updateActive); }, { passive: true });
  addEventListener('resize', updateActive);
  // replaceState keeps the preceding navigation entry intact. BFCache retains the
  // stream and scroll position; a reload opens the actual active article URL.
  addEventListener('pagehide', () => {
    history.replaceState({ ...(history.state ?? {}), articleStream: true, article: active.dataset.articleId,
      readingOffset: Math.max(0, -active.getBoundingClientRect().top) }, '');
    suspended = true; controller?.abort(); observer.disconnect();
    stream.querySelectorAll('[data-next-url]').forEach((boundary) => {
      if (requests.has(boundary)) {
        requests.delete(boundary);
        delete boundary.dataset.loading;
        boundary.querySelector('.stream-status').textContent = '';
      }
    });
  });
  addEventListener('pageshow', (event) => {
    suspended = false;
    if (!event.persisted && history.state?.article === first.dataset.articleId && history.state.readingOffset != null) {
      const offset = history.state.readingOffset;
      document.fonts.ready.then(() => requestAnimationFrame(() => scrollTo({top:first.getBoundingClientRect().top + scrollY + offset,behavior:'instant'})));
    }
    observeNext(); updateActive();
  });
  reducedMotion.addEventListener('change', updateActive);
  observeNext();
})();
