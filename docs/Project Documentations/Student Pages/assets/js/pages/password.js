document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('auth-body');
  const form = document.getElementById('password-form');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fields = Array.from(form.querySelectorAll('md-outlined-text-field'));
    const password = fields[0]?.value || '';
    const confirmPassword = fields[1]?.value || '';
    if (!password || password !== confirmPassword) {
      await window.showAppModal('There is an issue with your entered details. Please consider them again and try again..', { variant: 'danger', title: 'Password Mismatch' });
      return;
    }
    window.showAppModal('Password created successfully.', { variant: 'success', title: 'Success', hideActions: true, blocking: true });
    setTimeout(() => { window.location.href = '04-student-login.html'; }, 800);
  });
});
