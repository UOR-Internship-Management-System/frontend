/**
 * Material Design 3 Expressive (M3E) - Interactive Engine
 * UOR Internship Management System (IMS) Adaptation
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Toggle (Light / Dark)
  const themeToggle = document.getElementById('themeToggle') || document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      
      const themeText = themeToggle.querySelector('.theme-text');
      if (themeText) {
        themeText.textContent = isDark ? 'Light Mode' : 'Dark Mode';
      }
      const icon = themeToggle.querySelector('.material-symbols-rounded');
      if (icon) {
        icon.textContent = isDark ? 'light_mode' : 'dark_mode';
      }
    });
  }

  // 2. Segmented Controls (Draft / Final, Student / Admin)
  document.querySelectorAll('.m3-segmented').forEach(group => {
    const items = group.querySelectorAll('.m3-segmented__item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        items.forEach(i => i.setAttribute('aria-pressed', 'false'));
        item.setAttribute('aria-pressed', 'true');
      });
    });
  });

  // 3. Toggle Buttons
  document.querySelectorAll('.js-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const isPressed = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', (!isPressed).toString());
      btn.classList.toggle('is-selected', !isPressed);
    });
  });

  // 4. Split Button Dropdown
  const splitBtn = document.getElementById('split-button-demo');
  if (splitBtn) {
    const trailing = splitBtn.querySelector('.m3e-split-trailing');
    trailing.addEventListener('click', (e) => {
      e.stopPropagation();
      splitBtn.classList.toggle('is-open');
    });

    splitBtn.querySelectorAll('.m3e-dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const text = item.querySelector('span:last-child').textContent;
        const leadingText = splitBtn.querySelector('.m3e-split-leading span:last-child');
        if (leadingText) leadingText.textContent = text;
        splitBtn.classList.remove('is-open');
      });
    });

    document.addEventListener('click', () => {
      splitBtn.classList.remove('is-open');
    });
  }

  // 5. Chips Toggle & Dismiss
  document.querySelectorAll('.m3-chip, .m3e-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      if (e.target.classList.contains('m3-chip__remove') || e.target.classList.contains('m3e-chip-close')) {
        chip.style.display = 'none';
        return;
      }
      chip.classList.toggle('m3-chip--selected');
      chip.classList.toggle('is-selected');
    });
  });

  // 6. Modal Dialog Trigger
  const dialogScrim = document.getElementById('m3e-dialog-demo') || document.getElementById('dialogScrim');
  const openDialogBtn = document.getElementById('open-dialog-btn') || document.getElementById('openDialogBtn');
  const closeDialogBtns = document.querySelectorAll('.js-close-dialog');

  if (openDialogBtn && dialogScrim) {
    openDialogBtn.addEventListener('click', () => {
      dialogScrim.classList.add('is-open');
    });
    closeDialogBtns.forEach(b => {
      b.addEventListener('click', () => {
        dialogScrim.classList.remove('is-open');
      });
    });
    dialogScrim.addEventListener('click', (e) => {
      if (e.target === dialogScrim) {
        dialogScrim.classList.remove('is-open');
      }
    });
  }

  // 7. Snackbar Trigger
  const snackbar = document.getElementById('m3e-snackbar-demo') || document.getElementById('snackbarDemo');
  const openSnackbarBtn = document.getElementById('open-snackbar-btn') || document.getElementById('openSnackbarBtn');
  if (openSnackbarBtn && snackbar) {
    openSnackbarBtn.addEventListener('click', () => {
      snackbar.classList.add('is-visible');
      setTimeout(() => {
        snackbar.classList.remove('is-visible');
      }, 4000);
    });
    const actionBtn = snackbar.querySelector('.m3-snackbar__action, .m3e-snackbar__action');
    if (actionBtn) {
      actionBtn.addEventListener('click', () => {
        snackbar.classList.remove('is-visible');
      });
    }
  }

  // 8. Table Row Selection
  const selectAllCheckbox = document.getElementById('table-select-all');
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', (e) => {
      document.querySelectorAll('.js-row-select').forEach(cb => {
        cb.checked = e.target.checked;
        const row = cb.closest('tr');
        if (row) row.setAttribute('aria-selected', e.target.checked ? 'true' : 'false');
      });
    });
  }
  document.querySelectorAll('.js-row-select').forEach(cb => {
    cb.addEventListener('change', () => {
      const row = cb.closest('tr');
      if (row) row.setAttribute('aria-selected', cb.checked ? 'true' : 'false');
    });
  });

  // 9. Floating Toolbar Active Item Toggle
  document.querySelectorAll('.m3e-toolbar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.parentElement) {
        btn.parentElement.querySelectorAll('.m3e-toolbar-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
      }
    });
  });

  // 10. Navigation Tabs
  document.querySelectorAll('.m3-tabs__item').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabs = tab.parentElement.querySelectorAll('.m3-tabs__item');
      tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
      tab.setAttribute('aria-selected', 'true');
    });
  });

  // 11. Smooth Navigation Scroll
  document.querySelectorAll('.side a, .m3e-showcase-nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElem = document.getElementById(targetId);
      if (targetElem) {
        targetElem.scrollIntoView({ behavior: 'smooth' });
        document.querySelectorAll('.side a, .m3e-nav-item').forEach(i => i.classList.remove('active'));
        this.parentElement.classList.add('active');
      }
    });
  });
});
