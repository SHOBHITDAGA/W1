// Password reset — Supabase automatically establishes a temporary "recovery" session
// when the user arrives here via the emailed reset link, so we just need to call updateUser().
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('resetForm');
  const statusEl = document.getElementById('resetStatus');
  const submitBtn = document.getElementById('resetSubmit');

  function showStatus(message, isError = false) {
    statusEl.textContent = message;
    statusEl.hidden = false;
    statusEl.classList.toggle('is-error', isError);
    statusEl.classList.toggle('is-success', !isError);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
      showStatus("Passwords don't match — please re-check both fields.", true);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating…';

    const { error } = await supabaseClient.auth.updateUser({ password: newPassword });

    submitBtn.disabled = false;
    submitBtn.textContent = 'Set new password';

    if (error) {
      showStatus(error.message, true);
      return;
    }

    showStatus('Password updated! Redirecting to login…');
    form.reset();
    setTimeout(() => { window.location.href = 'login.html'; }, 1800);
  });
});
