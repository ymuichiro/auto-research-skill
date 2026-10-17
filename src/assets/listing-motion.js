// The server-rendered stages keep normal flow, native history restoration and
// link hit testing. Never use a transformed card's bounds as motion input.
export function sampleListingMotion({ top, bottom }, height, header = 70, reduced = false) {
  const clamp = value => Math.max(0, Math.min(1, value));
  const line = Math.max(header + 24, height * .32);
  const entry = clamp((top - line) / Math.max(1, height * .92 - line));
  // Recede while the previous card's tail is still visible, as the next card
  // reaches the reading line, rather than waiting until it is behind the header.
  const exit = clamp((line - bottom) / Math.max(1, line - header + height * .08));
  const ease = value => value * value * (3 - 2 * value);
  const arriving = ease(entry), leaving = ease(exit);
  return {
    phase: entry > 0 ? 'approaching' : exit > 0 ? 'receding' : 'reading',
    y: reduced ? 0 : arriving * Math.min(120, height * .16) - leaving * 54,
    scale: reduced ? 1 : 1 - arriving * .12 - leaving * .07,
    opacity: reduced ? 1 : 1 - arriving * .12 - leaving * .14
  };
}

const surfaces = typeof document === 'undefined' ? [] : [...document.querySelectorAll('[data-listing-motion]')];
if (surfaces.length) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const painted = new WeakMap();
  const header = document.querySelector('.site-header');
  let layouts = [], dirty = true, frame = 0, suspended = false, headerHeight = 70;
  const entryKey = history.state?.listingKey ?? `listing-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const storageKey = `ard-listing:${entryKey}`;
  let saved = history.state?.listingPosition;
  try { saved = JSON.parse(sessionStorage.getItem(storageKey)) ?? saved; } catch {}
  if (typeof saved?.href !== 'string' || !Number.isFinite(saved.top)) saved = undefined;
  history.replaceState({...history.state, listingKey:entryKey}, '');
  // Native restoration can anchor to a temporarily transformed card and land
  // at a different Y after reload. Restore the untransformed reading point.
  let restoring = !!saved && !location.hash, restoreGeneration = 0, restoreCancelled = false;
  if (restoring) history.scrollRestoration = 'manual';
  const href = node => node.getAttribute('href') ?? node.querySelector('.editorial-briefing-link')?.getAttribute('href');
  function schedule() {
    if (!frame && !suspended) frame = requestAnimationFrame(update);
  }
  function invalidate() { dirty = true; schedule(); }
  function measure() {
    const scroll = scrollY;
    headerHeight = header?.getBoundingClientRect().height ?? 70;
    layouts = surfaces.map(node => {
      const rect = node.parentElement.getBoundingClientRect();
      return {node, top:rect.top + scroll, bottom:rect.bottom + scroll};
    });
    dirty = false;
  }
  function savePosition() {
    if (restoring) return;
    if (dirty) measure();
    const line = Math.max(headerHeight + 24, innerHeight * .32);
    const item = layouts.filter(item => item.top-scrollY <= line).at(-1) ?? layouts[0];
    saved = {href:href(item.node), top:item.top-scrollY};
    history.replaceState({...history.state, listingPosition:saved}, '');
    // Reload can snapshot history.state before pagehide. Tab storage preserves
    // the final point; history.state remains a fallback if storage is blocked.
    try { sessionStorage.setItem(storageKey, JSON.stringify(saved)); } catch {}
  }
  function restorePosition() {
    if (!saved || location.hash || restoreCancelled) { restoring = false; return; }
    const position = saved, generation = ++restoreGeneration;
    restoring = true;
    history.scrollRestoration = 'manual';
    document.fonts.ready.then(() => requestAnimationFrame(() => {
      if (suspended || generation !== restoreGeneration) return;
      const node = surfaces.find(node => href(node) === position.href);
      if (node && Number.isFinite(position.top)) {
        scrollTo({top:node.parentElement.getBoundingClientRect().top + scrollY - position.top, behavior:'instant'});
      }
      restoring = false;
      invalidate();
    }));
  }
  function update() {
    frame = 0;
    if (suspended) return;
    if (dirty) measure();
    const scroll = scrollY, height = innerHeight;
    const focused = document.activeElement?.matches(':focus-visible')
      ? document.activeElement.closest('[data-listing-motion]') : null;
    for (const {node, top, bottom} of layouts) {
      const motion = sampleListingMotion({top:top-scroll, bottom:bottom-scroll}, height, headerHeight, reduced.matches || node === focused);
      const transform = motion.y || motion.scale !== 1 ? `translateY(${motion.y}px) scale(${motion.scale})` : 'none';
      const origin = motion.phase === 'receding' ? 'center bottom' : 'center top';
      const previous = painted.get(node) ?? {};
      if (previous.phase !== motion.phase) node.dataset.listingPhase = motion.phase;
      if (previous.transform !== transform) node.style.transform = transform;
      if (previous.origin !== origin) node.style.transformOrigin = origin;
      if (previous.opacity !== motion.opacity) node.style.opacity = String(motion.opacity);
      painted.set(node, {phase:motion.phase, transform, origin, opacity:motion.opacity});
    }
  }
  const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(invalidate);
  observer?.observe(document.body);
  surfaces.forEach(node => observer?.observe(node.parentElement));
  if (header) observer?.observe(header);
  addEventListener('scroll', observer ? schedule : invalidate, {passive:true});
  addEventListener('resize', invalidate);
  addEventListener('load', invalidate, true);
  addEventListener('focusin', schedule);
  addEventListener('focusout', schedule);
  visualViewport?.addEventListener('resize', invalidate);
  document.fonts.ready.then(invalidate);
  document.fonts.addEventListener('loadingdone', invalidate);
  reduced.addEventListener('change', schedule);
  document.addEventListener('click', event => {
    if (event.target.closest('a[href]')) savePosition();
  }, true);
  for (const type of ['wheel','touchstart','keydown']) addEventListener(type, () => {
    if (restoring) { ++restoreGeneration; restoring = false; restoreCancelled = true; invalidate(); }
  }, {passive:true});
  addEventListener('pagehide', () => {
    savePosition();
    restoreCancelled = false;
    suspended = true;
    cancelAnimationFrame(frame);
    frame = 0;
  });
  addEventListener('pageshow', () => { suspended = false; restorePosition(); invalidate(); });
  invalidate();
}
