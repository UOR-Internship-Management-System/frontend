document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('auth-body');
  const form = document.querySelector('form');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    window.showAppModal('Login request completed successfully.', { variant: 'success', title: 'Success', hideActions: true, blocking: true });
    setTimeout(() => { window.location.href = '06-student-profile.html'; }, 800);
  });
});
