// Contact form — writes directly into Supabase, works for logged-in and anonymous visitors
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('contactStatus');
  const submitBtn = document.getElementById('contactSubmit');

  if (!form) return;

  function showStatus(message, isError = false) {
    statusEl.textContent = message;
    statusEl.hidden = false;
    statusEl.classList.toggle('is-error', isError);
    statusEl.classList.toggle('is-success', !isError);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    const payload = {
      name: document.getElementById('contactName').value.trim(),
      email: document.getElementById('contactEmail').value.trim(),
      subject: document.getElementById('contactSubject').value,
      message: document.getElementById('contactMessage').value.trim()
    };

    const { error } = await supabaseClient.from('contact_messages').insert(payload);

    submitBtn.disabled = false;
    submitBtn.textContent = 'Send message';

    if (error) {
      showStatus("Something went wrong — please try again in a moment.", true);
      console.error(error);
      return;
    }

    showStatus("Message sent! We'll get back to you within 2 working days.");
    form.reset();
  });
});
