// Contact form — writes to Supabase, then emails the submitter a confirmation via EmailJS
const EMAILJS_SERVICE_ID = 'service_kk43tnp';
const EMAILJS_TEMPLATE_ID = 'template_geig3zz';
const EMAILJS_PUBLIC_KEY = 'nRTUmYtSxUcLkoq4X';

document.addEventListener('DOMContentLoaded', () => {
  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

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

    if (error) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';
      showStatus("Something went wrong — please try again in a moment.", true);
      console.error(error);
      return;
    }

    // Send a confirmation email to the person who filled the form (not to us)
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        email: payload.email,
        name: payload.name,
        subject: payload.subject,
        message: payload.message
      });
    } catch (emailError) {
      // Message is already saved in Supabase either way — email failure shouldn't block the user
      console.error('Confirmation email failed to send:', emailError);
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Send message';
    showStatus("Message sent! Check your inbox for a confirmation — we'll follow up within 2 working days.");
    form.reset();
  });
});
