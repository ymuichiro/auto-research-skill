// Scroll is a timeline for a pinned scene, never the position of a flowing card.
const roots = [...document.querySelectorAll('[data-news-sequence]')];
if (roots.length) {
  const clamp = (value, max = 1) => Math.max(0, Math.min(max, value));
  const ease = value => value * value * (3 - 2 * value);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.site-header');
  const ruler = document.createElement('div');
  ruler.style.cssText = 'position:fixed;height:100svh;width:0;visibility:hidden;pointer-events:none';
  ruler.setAttribute('aria-hidden', 'true');
  document.body.append(ruler);
  const scenes = roots.map(root => ({root, viewport:root.querySelector('.news-viewport'),
    nodes:[...root.querySelectorAll('[data-listing-motion]')], painted:[], pinned:false}));
  const href = node => node.getAttribute('href') ?? node.querySelector('.editorial-briefing-link')?.getAttribute('href');
  let dirty = true, frame = 0, suspended = false, headerHeight = 64, anchor;
  const entryKey = history.state?.listingKey ?? `listing-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const storageKey = `ard-listing:${entryKey}`;
  let saved = history.state?.listingPosition;
  try { saved = JSON.parse(sessionStorage.getItem(storageKey)) ?? saved; } catch {}
  if (!Number.isFinite(saved?.y) && typeof saved?.href !== 'string') saved = undefined;
  history.replaceState({...history.state, listingKey:entryKey}, '');
  let restoring = !!saved && !location.hash, cancelled = false, generation = 0;
  if (restoring) history.scrollRestoration = 'manual';

  function schedule() { if (!frame && !suspended) frame = requestAnimationFrame(update); }
  function progress(scene) { return clamp((scrollY-scene.start)/scene.step, scene.nodes.length-1); }
  function position() {
    for (const scene of scenes) {
      if (scene.pinned && scrollY >= scene.start && scrollY <= scene.end) {
        const p = progress(scene), index = Math.floor(p);
        return {href:href(scene.nodes[index]), fraction:p-index, mode:'pinned'};
      }
      if (!scene.pinned) {
        const line = headerHeight + 60;
        const node = scene.nodes.find(node => node.parentElement.getBoundingClientRect().bottom > line);
        if (node && node.parentElement.getBoundingClientRect().top < innerHeight) {
          return {href:href(node), top:node.parentElement.getBoundingClientRect().top, mode:'static'};
        }
      }
    }
    return {y:scrollY};
  }
  function invalidate(preserve = false) {
    if (preserve && !dirty && !restoring) anchor = position();
    dirty = true; schedule();
  }
  function seek(point) {
    if (Number.isFinite(point?.y)) { scrollTo({top:point.y, behavior:'instant'}); return; }
    for (const scene of scenes) {
      const index = scene.nodes.findIndex(node => href(node) === point?.href);
      if (index < 0) continue;
      const top = scene.pinned
        ? scene.start + clamp(index + (point.fraction ?? 0), scene.nodes.length-1) * scene.step
        : scene.nodes[index].parentElement.getBoundingClientRect().top + scrollY - (point.top ?? headerHeight + 32);
      scrollTo({top, behavior:'instant'}); return;
    }
  }
  function measure() {
    headerHeight = header?.getBoundingClientRect().height ?? 64;
    const height = Math.max(0, (ruler.getBoundingClientRect().height || innerHeight) - headerHeight - 12);
    for (const scene of scenes) {
      scene.root.classList.remove('is-pinned');
      scene.nodes.forEach(node => {
        node.style.cssText = '';
        node.parentElement.style.zIndex = '';
        delete node.dataset.sceneFront;
      });
      const natural = Math.max(0, ...scene.nodes.map(node => node.parentElement.getBoundingClientRect().height));
      scene.pinned = !reduced.matches && scene.nodes.length > 1 && natural <= height-24;
      // The scene wraps the cards' real content instead of reserving an empty
      // full-screen stage and an arbitrary minimum card height.
      const cardHeight = Math.max(0, Math.min(height-24, natural));
      scene.height = Math.min(height, cardHeight+48);
      scene.step = Math.max(260, Math.min(560, scene.height * .62));
      scene.root.dataset.sceneMode = scene.pinned ? 'pinned' : 'static';
      scene.root.style.setProperty('--scene-top', `${headerHeight+6}px`);
      scene.root.style.setProperty('--scene-height', `${scene.height}px`);
      scene.root.style.setProperty('--scene-card-height', `${cardHeight}px`);
      scene.root.style.setProperty('--scene-span', `${scene.height+(scene.nodes.length-1+.45)*scene.step}px`);
      scene.root.classList.toggle('is-pinned', scene.pinned);
      scene.painted = [];
    }
    for (const scene of scenes) {
      scene.start = scene.root.getBoundingClientRect().top + scrollY - headerHeight - 6;
      scene.end = scene.start + (scene.nodes.length-1+.45) * scene.step;
    }
    dirty = false;
  }
  function paint(scene) {
    if (!scene.pinned) return;
    const p = progress(scene), index = Math.floor(p), q = ease(clamp((p-index-.2)/.75));
    scene.root.dataset.sceneIndex = String(index);
    scene.root.dataset.sceneProgress = String(p);
    for (let i = 0; i < scene.nodes.length; i++) {
      const node = scene.nodes[i];
      let y = 0, scale = 1, opacity = 0, pointer = 'none';
      if (i === index) { y = -64*q; scale = 1-.1*q; opacity = 1-.58*q; pointer = 'auto'; }
      else if (i === index+1) { y = scene.height*.9*(1-q); scale = .86+.14*q; opacity = 1; pointer = q > 0 ? 'auto' : 'none'; }
      else if (i === index-1) { y = -64; scale = .9; opacity = .42; }
      const next = {transform:`translateY(${y.toFixed(4)}px) scale(${scale.toFixed(5)})`, opacity:String(opacity), pointer,
        willChange:Math.abs(i-index) <= 1 ? 'transform, opacity' : 'auto'};
      const old = scene.painted[i] ?? {};
      if (old.transform !== next.transform) node.style.transform = next.transform;
      if (old.opacity !== next.opacity) node.style.opacity = next.opacity;
      if (old.pointer !== next.pointer) node.style.pointerEvents = next.pointer;
      if (old.willChange !== next.willChange) node.style.willChange = next.willChange;
      const front = i === (q >= .5 && index+1 < scene.nodes.length ? index+1 : index);
      if (node.dataset.sceneFront !== String(front)) node.dataset.sceneFront = String(front);
      if (!scene.painted[i]) node.parentElement.style.zIndex = String(i+1);
      scene.painted[i] = next;
    }
  }
  function update() {
    frame = 0;
    if (suspended) return;
    if (dirty) { measure(); if (anchor) { seek(anchor); anchor = undefined; } }
    scenes.forEach(paint);
  }
  function savePosition() {
    if (restoring) return;
    if (dirty) measure();
    saved = position();
    history.replaceState({...history.state, listingPosition:saved}, '');
    try { sessionStorage.setItem(storageKey, JSON.stringify(saved)); } catch {}
  }
  function restore() {
    if (!saved || cancelled || location.hash) { restoring = false; return; }
    const token = ++generation;
    restoring = true; history.scrollRestoration = 'manual';
    document.fonts.ready.then(() => requestAnimationFrame(() => {
      if (suspended || token !== generation) return;
      measure(); seek(saved); restoring = false; update();
    }));
  }
  // Keyboard and assistive-technology focus explicitly seek the requested card;
  // all original article links remain in document/reading order.
  for (const scene of scenes) scene.root.addEventListener('focusin', event => {
    const node = event.target.closest('[data-listing-motion]');
    if (!node || !scene.pinned) return;
    if (node.dataset.sceneFront === 'true' && !event.target.matches(':focus-visible')) return;
    const index = scene.nodes.indexOf(node);
    if (index >= 0) {
      anchor = undefined;
      if (dirty) measure();
      seek({href:href(node), fraction:0}); update();
    }
  });
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', () => invalidate(true));
  visualViewport?.addEventListener('resize', () => invalidate(true));
  document.fonts.ready.then(() => invalidate(true));
  document.fonts.addEventListener('loadingdone', () => invalidate(true));
  reduced.addEventListener('change', () => invalidate(true));
  const observer = new ResizeObserver(() => invalidate(true));
  observer.observe(document.body); observer.observe(ruler);
  if (header) observer.observe(header);
  document.addEventListener('click', event => { if (event.target.closest('a[href]')) savePosition(); }, true);
  for (const type of ['wheel','touchstart','keydown']) addEventListener(type, () => {
    anchor = undefined;
    if (restoring) { ++generation; restoring = false; cancelled = true; }
  }, {passive:true});
  addEventListener('pagehide', () => {
    savePosition(); cancelled = false; suspended = true; cancelAnimationFrame(frame); frame = 0;
  });
  addEventListener('pageshow', () => { suspended = false; restore(); invalidate(); });
  invalidate();
}
