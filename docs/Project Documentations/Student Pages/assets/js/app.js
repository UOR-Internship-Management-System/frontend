(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  function inferModal(message, options = {}) {
    const text = String(message ?? '');
    const lower = text.toLowerCase();
    if (options.variant) return options.variant;
    if (lower.includes('error') || lower.includes('issue') || lower.includes('cannot') || lower.includes('failed')) return 'danger';
    if (lower.includes('warning')) return 'warning';
    if (lower.includes('success') || lower.includes('verified') || lower.includes('saved')) return 'success';
    return 'info';
  }
  const variantMap = {
    info: { icon: 'info', title: 'Notice' },
    success: { icon: 'check_circle', title: 'Success' },
    danger: { icon: 'cancel', title: 'Action Required' },
    warning: { icon: 'warning', title: 'Confirm Action' },
    loading: { icon: '', title: 'Please wait' }
  };
  function ensureModal() {
    let overlay = $('#appModalOverlay');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'appModalOverlay';
    overlay.className = 'app-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <div class="app-modal-card" tabindex="-1">
        <div class="app-modal-icon" data-modal-icon-wrap><span class="material-symbols-outlined" data-modal-icon>info</span></div>
        <div class="app-spinner" data-modal-spinner hidden></div>
        <h2 class="app-modal-title" data-modal-title>Notice</h2>
        <p class="app-modal-message" data-modal-message></p>
        <div class="app-modal-actions" data-modal-actions></div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay && overlay.dataset.blocking !== 'true') closeAppModal();
    });
    return overlay;
  }
  function closeAppModal(result) {
    const overlay = ensureModal();
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    const resolver = overlay._resolver;
    overlay._resolver = null;
    if (typeof resolver === 'function') resolver(result);
  }
  function showAppModal(message, options = {}) {
    const overlay = ensureModal();
    const variant = inferModal(message, options);
    const meta = { ...variantMap[variant], ...options };
    $('[data-modal-title]', overlay).textContent = meta.title || variantMap[variant].title;
    $('[data-modal-message]', overlay).textContent = String(message ?? '');
    const iconWrap = $('[data-modal-icon-wrap]', overlay);
    const spinner = $('[data-modal-spinner]', overlay);
    if (variant === 'loading' || options.loading) {
      iconWrap.hidden = true;
      spinner.hidden = false;
    } else {
      iconWrap.hidden = false;
      spinner.hidden = true;
      $('[data-modal-icon]', overlay).textContent = meta.icon || variantMap[variant].icon;
      iconWrap.style.color = variant === 'danger' ? 'var(--state-danger)' : variant === 'success' ? 'var(--state-success)' : 'var(--md-sys-color-primary)';
    }
    overlay.dataset.blocking = options.blocking ? 'true' : 'false';
    const actions = $('[data-modal-actions]', overlay);
    actions.innerHTML = '';
    const buttons = options.buttons || (options.hideActions ? [] : [{ label: options.okText || 'Close', value: true, kind: 'filled' }]);
    buttons.forEach(button => {
      const tag = button.kind === 'outlined' ? 'md-outlined-button' : 'md-filled-button';
      const el = document.createElement(tag);
      el.type = 'button';
      el.textContent = button.label;
      if (button.danger) el.classList.add('button-danger');
      el.addEventListener('click', () => closeAppModal(button.value));
      actions.appendChild(el);
    });
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('.app-modal-card', overlay)?.focus(), 30);
    return new Promise(resolve => { overlay._resolver = resolve; });
  }
  function showConfirmModal(message, options = {}) {
    return showAppModal(message, {
      variant: 'warning',
      title: options.title || 'Confirm Action',
      buttons: [
        { label: options.cancelText || 'Cancel', value: false, kind: 'outlined' },
        { label: options.okText || 'Continue', value: true, kind: 'filled', danger: options.danger }
      ]
    });
  }
  function showConfirmModalSyncFallback(message) {
    showConfirmModal(message, { okText: 'Continue' });
    return true;
  }
  function renderLoadingRows(container, count = 3, mode = 'rows') {
    if (!container) return;
    const row = mode === 'table'
      ? `<div class="skeleton-table-row" aria-hidden="true"><div class="skeleton skeleton-table-cell"></div><div class="skeleton skeleton-table-cell"></div><div class="skeleton skeleton-table-cell"></div><div class="skeleton skeleton-table-cell"></div></div>`
      : `<div class="skeleton-data-row" aria-hidden="true"><div class="skeleton-row-content"><div class="skeleton skeleton-line skeleton-line-title"></div><div class="skeleton skeleton-line skeleton-line-text"></div></div><div class="skeleton-row-actions"><div class="skeleton skeleton-button"></div><div class="skeleton skeleton-button"></div></div></div>`;
    container.innerHTML = Array.from({ length: count }, () => row).join('');
    container.setAttribute('aria-busy', 'true');
  }
  function renderRealContent(container, html) {
    if (!container) return;
    container.innerHTML = html;
    container.setAttribute('aria-busy', 'false');
  }
  function paginationHtml(total, page, pageSize, label = 'records') {
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(total, page * pageSize);
    const buttons = [];
    buttons.push(`<button type="button" class="pagination-btn" data-page="${Math.max(1, page - 1)}" ${page <= 1 ? 'disabled' : ''}>Previous</button>`);
    for (let i = 1; i <= pages; i++) buttons.push(`<button type="button" class="pagination-btn ${i === page ? 'active' : ''}" data-page="${i}" ${i === page ? 'aria-current="page"' : ''}>${i}</button>`);
    buttons.push(`<button type="button" class="pagination-btn" data-page="${Math.min(pages, page + 1)}" ${page >= pages ? 'disabled' : ''}>Next</button>`);
    return `<div class="pagination-info">Showing ${start} to ${end} of ${total} ${label}</div><div class="pagination-controls">${buttons.join('')}</div>`;
  }
  function bindPagination(wrapper, handler) {
    if (!wrapper) return;
    wrapper.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const next = Number(btn.getAttribute('data-page'));
        if (!btn.disabled && Number.isFinite(next)) handler(next);
      });
    });
  }
  function normalizeLinks() {
    const map = {
      'signup.html': '01-student-sign-up.html',
      'register.html': '01-student-sign-up.html',
      'login.html': '04-student-login.html',
      'forgot-password.html': '05-forgot-password.html',
      'verify-otp.html': '02-verify-otp.html'
    };
    $$('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (map[href]) a.setAttribute('href', map[href]);
    });
  }
  function initTheme() {
    const stored = localStorage.getItem('student-ui-theme');
    const preferred = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = stored || preferred;
    if (!$('#themeToggleBtn')) {
      const btn = document.createElement('button');
      btn.id = 'themeToggleBtn';
      btn.type = 'button';
      btn.className = 'theme-toggle-btn';
      btn.setAttribute('aria-label', 'Toggle dark mode');
      btn.innerHTML = '<span class="material-symbols-outlined">dark_mode</span>';
      document.body.appendChild(btn);
      btn.addEventListener('click', () => {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        localStorage.setItem('student-ui-theme', next);
        btn.querySelector('.material-symbols-outlined').textContent = next === 'dark' ? 'light_mode' : 'dark_mode';
      });
    }
    const icon = $('#themeToggleBtn .material-symbols-outlined');
    if (icon) icon.textContent = document.documentElement.dataset.theme === 'dark' ? 'light_mode' : 'dark_mode';
  }
  function closeActiveModal() {
    const custom = $('#appModalOverlay.active');
    if (custom) { closeAppModal(false); return; }
    const active = $('.modal-overlay.active');
    if (active) { active.classList.remove('active'); document.body.style.overflow = ''; }
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeActiveModal();
  });
  document.addEventListener('DOMContentLoaded', () => {
    normalizeLinks();
    initTheme();
    $$('.modal-card-window').forEach(card => card.classList.add('modal-window-card'));
    $$('.modal-overlay').forEach(modal => modal.setAttribute('aria-modal', 'true'));
  });
  window.appEscapeHtml = escapeHtml;
  window.renderLoadingRows = renderLoadingRows;
  window.renderRealContent = renderRealContent;
  window.paginationHtml = paginationHtml;
  window.bindPagination = bindPagination;
  window.showAppModal = showAppModal;
  window.showConfirmModal = showConfirmModal;
  window.showConfirmModalSyncFallback = showConfirmModalSyncFallback;
  window.alert = (message) => showAppModal(message);
  window.confirm = (message) => showConfirmModalSyncFallback(message);
})();
