// Geometry belongs to the untransformed stage. Motion never feeds its own
// transformed bounds back into progress, even on very long articles.
export function sampleMotion({ top, bottom }, height, reduced = false) {
  const line = Math.min(height * .3, 220);
  const entry = Math.max(0, Math.min(1, (top - line) / Math.max(1, height - line)));
  const exit = Math.max(0, Math.min(1, (line - bottom) / (line + 80)));
  const eased = entry * entry * (3 - 2 * entry);
  const departure = exit * exit * (3 - 2 * exit);
  return {
    phase: entry > 0 ? 'approaching' : exit > 0 ? 'receding' : 'reading',
    entry, exit,
    y: reduced ? 0 : eased * Math.min(110, height * .14) - departure * 64,
    scale: reduced ? 1 : 1 - eased * .085 - departure * .05,
    opacity: reduced ? 1 : 1 - eased * .16 - departure * .12
  };
}

export function stageArticle(article) {
  if (article.parentElement.classList.contains('article-stage')) return article.parentElement;
  const stage = document.createElement('div');
  stage.className = 'article-stage';
  article.before(stage);
  stage.append(article);
  return stage;
}

export function paintMotion(article, rect, height, reduced) {
  const motion = sampleMotion(rect, height, reduced);
  article.dataset.motionPhase = motion.phase;
  article.style.transformOrigin = motion.exit > 0 ? 'center bottom' : 'center top';
  article.style.transform = motion.y ? `translateY(${motion.y}px) scale(${motion.scale})` : 'none';
  article.style.opacity = String(motion.opacity);
  return motion;
}
