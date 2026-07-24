document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('auth-body');
  const form = document.querySelector('form');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = form.querySelector('md-outlined-text-field')?.value?.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      await window.showAppModal('There is an issue with your entered details. Please consider them again and try again..', { variant: 'danger', title: 'Invalid Email' });
      return;
    }
    window.showAppModal('OTP request submitted successfully.', { variant: 'success', title: 'OTP Sent', hideActions: true, blocking: true });
    setTimeout(() => { window.location.href = '02-verify-otp.html'; }, 800);
  });
});
