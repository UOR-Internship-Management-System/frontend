document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('auth-body');
  const fields = Array.from(document.querySelectorAll('.otp-inputs md-outlined-text-field'));
  fields.forEach((field, index) => {
    field.addEventListener('input', () => {
      field.value = String(field.value || '').replace(/\D/g, '').slice(0, 1);
      if (field.value.length === 1 && index < fields.length - 1) fields[index + 1].focus();
    });
    field.addEventListener('paste', (event) => {
      event.preventDefault();
      const digits = (event.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, fields.length).split('');
      digits.forEach((digit, i) => { if (fields[i]) fields[i].value = digit; });
      fields[Math.min(digits.length, fields.length) - 1]?.focus();
    });
  });
  const form = document.getElementById('otp-form');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const code = fields.map(f => f.value || '').join('');
    if (code.length !== fields.length) {
      await window.showAppModal('There is an issue with your entered details. Please consider them again and try again..', { variant: 'danger', title: 'Invalid OTP' });
      return;
    }
    window.showAppModal('Your details are verified ..', { variant: 'success', title: 'Verified', hideActions: true, blocking: true });
    setTimeout(() => { window.location.href = '03-create-new-password.html'; }, 800);
  });
  document.querySelector('.resend-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    window.showAppModal('OTP request submitted successfully.', { variant: 'success', title: 'OTP Sent' });
  });
});
