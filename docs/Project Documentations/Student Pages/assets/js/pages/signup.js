document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('auth-body');
  const form = document.querySelector('form');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = Array.from(form.querySelectorAll('md-outlined-text-field'));
    const indexNumber = fields[1]?.value?.trim();
    const email = fields[2]?.value?.trim();
    window.showAppModal('Your details are verifying …', { variant: 'loading', title: 'Verifying', loading: true, hideActions: true, blocking: true });
    setTimeout(() => {
      const valid = Boolean(indexNumber && email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
      if (valid) {
        window.showAppModal('Your details are verified ..', { variant: 'success', title: 'Verified', hideActions: true, blocking: true });
        setTimeout(() => { window.location.href = '02-verify-otp.html'; }, 850);
      } else {
        window.showAppModal('There is an issue with your entered details. Please consider them again and try again..', { variant: 'danger', title: 'Verification Failed' });
      }
    }, 900);
  }, { once: false });
});
