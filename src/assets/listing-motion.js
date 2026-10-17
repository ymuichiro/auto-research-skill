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
  // Native scroll restoration owns position. Repaint after BFCache/history and
  // font/layout changes instead of moving the document to simulate a transition.
  addEventListener('pagehide', () => {
    suspended = true;
    cancelAnimationFrame(frame);
    frame = 0;
  });
  addEventListener('pageshow', () => { suspended = false; invalidate(); });
  invalidate();
}
