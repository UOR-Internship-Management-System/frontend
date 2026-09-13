/**
 * Material Design 3 Expressive (M3E) - Interactive Playground Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Toggle (Light / Dark)
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      themeToggle.querySelector('.material-symbols-rounded').textContent = 
        next === 'dark' ? 'light_mode' : 'dark_mode';
      themeToggle.querySelector('.theme-text').textContent = 
        next === 'dark' ? 'Light Mode' : 'Dark Mode';
    });
  }

  // 2. Toggle Buttons
  document.querySelectorAll('.js-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const isPressed = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', (!isPressed).toString());
      btn.classList.toggle('is-selected', !isPressed);
    });
  });

  // 3. Split Button Dropdown
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
        splitBtn.querySelector('.m3e-split-leading span:last-child').textContent = text;
        splitBtn.classList.remove('is-open');
      });
    });

    document.addEventListener('click', () => {
      splitBtn.classList.remove('is-open');
    });
  }

  // 4. Chip Toggles & Dismiss
  document.querySelectorAll('.js-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      if (e.target.classList.contains('m3e-chip-close')) {
        chip.style.display = 'none';
        return;
      }
      chip.classList.toggle('is-selected');
    });
  });

  // 5. Modal Dialog Trigger
  const dialogScrim = document.getElementById('m3e-dialog-demo');
  const openDialogBtn = document.getElementById('open-dialog-btn');
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

  // 6. Snackbar Trigger
  const snackbar = document.getElementById('m3e-snackbar-demo');
  const openSnackbarBtn = document.getElementById('open-snackbar-btn');
  if (openSnackbarBtn && snackbar) {
    openSnackbarBtn.addEventListener('click', () => {
      snackbar.classList.add('is-visible');
      setTimeout(() => {
        snackbar.classList.remove('is-visible');
      }, 4000);
    });
    const actionBtn = snackbar.querySelector('.m3e-snackbar__action');
    if (actionBtn) {
      actionBtn.addEventListener('click', () => {
        snackbar.classList.remove('is-visible');
      });
    }
  }

  // 7. Spring Physics Simulator
  document.querySelectorAll('.m3e-spring-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const targetId = trigger.getAttribute('data-target');
      const target = document.getElementById(targetId);
      if (target) {
        target.classList.remove('animate');
        void target.offsetWidth;
        target.classList.add('animate');
      }
    });
  });

  // 8. Floating Toolbar Active Item Toggle
  document.querySelectorAll('.m3e-toolbar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.parentElement) {
        btn.parentElement.querySelectorAll('.m3e-toolbar-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
      }
    });
  });

  // 9. Table Row Selection
  const selectAllCheckbox = document.getElementById('table-select-all');
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', (e) => {
      document.querySelectorAll('.js-row-select').forEach(cb => {
        cb.checked = e.target.checked;
      });
    });
  }

  // 10. Canonical Layout Viewport Switcher
  const frame = document.getElementById('canonical-frame');
  const viewportBtns = document.querySelectorAll('.js-viewport-btn');
  viewportBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewportBtns.forEach(b => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      const mode = btn.getAttribute('data-mode');
      if (frame) {
        frame.className = `m3e-canonical-frame m3e-frame--${mode}`;
        if (mode === 'compact') {
          frame.style.maxWidth = '375px';
        } else if (mode === 'medium') {
          frame.style.maxWidth = '768px';
        } else {
          frame.style.maxWidth = '100%';
        }
      }
    });
  });

  // 11. Smooth Scroll for Sidebar Navigation
  document.querySelectorAll('.m3e-showcase-nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElem = document.getElementById(targetId);
      if (targetElem) {
        targetElem.scrollIntoView({ behavior: 'smooth' });
        document.querySelectorAll('.m3e-nav-item').forEach(i => i.classList.remove('active'));
        this.parentElement.classList.add('active');
      }
    });
  });
});
