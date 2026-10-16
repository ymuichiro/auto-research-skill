const toggle = document.querySelector('.nav-toggle');
const navigation = document.querySelector('.site-nav');
const header = document.querySelector('.site-header');
if (header && 'ResizeObserver' in window) {
  new ResizeObserver(() => document.documentElement.style.setProperty('--ard-header-height', `${header.getBoundingClientRect().height}px`)).observe(header);
}
if (toggle && navigation) {
  toggle.hidden = false;
  document.documentElement.classList.add('has-site-ui');
  toggle.addEventListener('click', () => toggle.setAttribute('aria-expanded', String(toggle.getAttribute('aria-expanded') !== 'true')));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });
}

function initReadingControls(root = document) {
  root.querySelectorAll('[data-open-related]').forEach((button) => {
    const dialog = button.closest('[data-article-id]')?.querySelector('[data-related-dialog]');
    if (!dialog?.showModal || button.dataset.initialized) return;
    button.hidden = false;
    button.dataset.initialized = 'true';
    button.addEventListener('click', () => dialog.showModal());
    dialog.addEventListener('close', () => {
      // Native close already restores focus. A queued close event must not take
      // focus back after the reader has moved on to another control or heading.
      if (document.activeElement === document.body || dialog.contains(document.activeElement)) button.focus({ preventScroll:true });
    });
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
      }
    });
  });
  root.querySelectorAll('[data-native-share]').forEach((button) => { button.hidden = typeof navigator.share !== 'function'; });
}
initReadingControls();
document.addEventListener('article-added', (event) => initReadingControls(event.detail));
