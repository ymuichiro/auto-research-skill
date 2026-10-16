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
  let entrySequence = 0;
  let entryKey = history.state?.readingKey ?? `reading-${Date.now()}`;
  const positions = new Map();
  let restoring = false;
  try {
    const saved = JSON.parse(sessionStorage.getItem(`ard-reading:${entryKey}`));
    if (saved?.article === first.dataset.articleId && Number.isFinite(saved.readingOffset)) positions.set(entryKey, saved);
  } catch { /* Reading still works when tab storage is unavailable. */ }
  // The same URL can now represent an article far down this document or the
  // first article after reload. Native absolute-Y restoration cannot cover both.
  history.scrollRestoration = 'manual';
  history.replaceState({...(history.state ?? {}), articleStream:true, readingKey:entryKey, article:first.dataset.articleId}, '');

  function rememberPosition(rect = stageArticle(active).getBoundingClientRect()) {
    const position = {article:active.dataset.articleId, readingOffset:-rect.top};
    positions.set(entryKey, position);
    return position;
  }

  function savePosition() {
    const position = rememberPosition();
    history.replaceState({...(history.state ?? {}), ...position, articleStream:true, readingKey:entryKey}, '');
    // Navigation may snapshot history.state before pagehide's replaceState.
    // Tab-scoped storage carries the final article-relative position through reload.
    try { sessionStorage.setItem(`ard-reading:${entryKey}`, JSON.stringify(position)); } catch {}
  }

  function restorePosition(position) {
    const owner = [...stream.querySelectorAll('[data-article-id]')].find(node => node.dataset.articleId === position?.article);
    if (!owner) return;
    active = owner;
    setHead(records.get(owner.dataset.articleId));
    if (Number.isFinite(position.readingOffset)) {
      scrollTo({top:stageArticle(owner).getBoundingClientRect().top + scrollY + position.readingOffset, behavior:'instant'});
    } else if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      const target = document.getElementById(owner === first ? id : `${owner.dataset.articleId}--${id}`);
      target?.scrollIntoView({block:'start',behavior:'instant'});
    }
  }

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
    if (suspended || restoring) return;
    const readingLine = Math.min(innerHeight * 0.3, 220);
    const articles = [...stream.querySelectorAll('[data-article-id]')];
    let candidate = articles[0];
    const geometry = new Map(articles.map(article => [article, stageArticle(article).getBoundingClientRect()]));
    const previews = [...stream.querySelectorAll('.next-article-preview')].map(node => [node, node.parentElement.getBoundingClientRect()]);
    articles.forEach((article) => {
      const rect = geometry.get(article);
      if (rect.top <= readingLine) candidate = article;
    });
    articles.forEach((article) => {
      article.dataset.current = String(article === candidate);
      if (article !== candidate) article.querySelectorAll('.reading-map a[aria-current]').forEach(link=>link.removeAttribute('aria-current'));
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
      history.replaceState({ ...(history.state ?? {}), ...rememberPosition(geometry.get(active)), articleStream:true, readingKey:entryKey, fragment:'' }, '', active.dataset.articlePath);
    }
    rememberPosition(geometry.get(active));
  }

  stream.addEventListener('click', (event) => {
    const retry = event.target.closest('[data-stream-retry]');
    if (retry) void loadNext(retry.closest('[data-next-url]'));
    const anchor = event.target.closest('a[href^="#"]');
    if (anchor && !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && !anchor.target && !anchor.hasAttribute('download')) {
      const target = document.getElementById(decodeURIComponent(anchor.getAttribute('href').slice(1)));
      const owner = anchor.closest('[data-article-id]');
      if (!owner) return;
      if (!target) return;
      event.preventDefault();
      savePosition();
      entryKey = `reading-${Date.now()}-${++entrySequence}`;
      active = owner;
      setHead(records.get(owner.dataset.articleId));
      const fragment = anchor.dataset.originalFragment ?? anchor.getAttribute('href');
      history.pushState({articleStream:true,readingKey:entryKey,article:owner.dataset.articleId,fragment},'',owner.dataset.articlePath+fragment);
      target.scrollIntoView({block:'start',behavior:'instant'});
      savePosition();
      updateActive();
    }
  });
  addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(updateActive); }, { passive: true });
  addEventListener('resize', updateActive);
  addEventListener('popstate', event => {
    if (!event.state?.articleStream) return;
    entryKey = event.state.readingKey;
    const position = positions.get(entryKey) ?? event.state;
    restoring = true;
    requestAnimationFrame(() => { restoring = false; restorePosition(position); updateActive(); });
  });
  // replaceState keeps the preceding navigation entry intact. BFCache retains the
  // stream and scroll position; a reload opens the actual active article URL.
  addEventListener('pagehide', () => {
    savePosition();
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
    entryKey = history.state?.readingKey ?? entryKey;
    if (history.state?.readingOffset != null || location.hash) {
      const position = positions.get(entryKey) ?? history.state;
      restoring = true;
      document.fonts.ready.then(() => requestAnimationFrame(() => { restoring = false; restorePosition(position); updateActive(); }));
    }
    observeNext(); updateActive();
  });
  reducedMotion.addEventListener('change', updateActive);
  observeNext();
})();
