// Auth logic for login.html — uses the shared supabaseClient from supabase-client.js
document.addEventListener('DOMContentLoaded', () => {
  const tabLogin = document.getElementById('tabLogin');
  const tabSignup = document.getElementById('tabSignup');
  const loginPanel = document.getElementById('loginPanel');
  const signupPanel = document.getElementById('signupPanel');
  const statusEl = document.getElementById('authStatus');

  function showStatus(message, isError = false) {
    statusEl.textContent = message;
    statusEl.hidden = false;
    statusEl.classList.toggle('is-error', isError);
    statusEl.classList.toggle('is-success', !isError);
  }

  function switchTab(target) {
    const showLogin = target === 'login';
    tabLogin.classList.toggle('is-active', showLogin);
    tabSignup.classList.toggle('is-active', !showLogin);
    tabLogin.setAttribute('aria-selected', showLogin);
    tabSignup.setAttribute('aria-selected', !showLogin);
    loginPanel.hidden = !showLogin;
    signupPanel.hidden = showLogin;
    statusEl.hidden = true;
  }

  tabLogin.addEventListener('click', () => switchTab('login'));
  tabSignup.addEventListener('click', () => switchTab('signup'));

  // If already logged in, skip straight to account area
  supabaseClient.auth.getSession().then(({ data }) => {
    if (data.session) {
      showStatus("You're already logged in — redirecting…");
      setTimeout(() => { window.location.href = 'programs.html'; }, 1200);
    }
  });

  // LOGIN
  loginPanel.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('loginSubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in…';

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    submitBtn.disabled = false;
    submitBtn.textContent = 'Log in';

    if (error) {
      showStatus(error.message, true);
      return;
    }

    showStatus('Logged in — redirecting…');

    // Route admins straight to the dashboard, everyone else to programs
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('is_admin')
      .eq('id', data.user.id)
      .single();

    setTimeout(() => {
      window.location.href = profile?.is_admin ? 'admin.html' : 'programs.html';
    }, 800);
  });

  // SIGNUP
  signupPanel.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('signupSubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account…';

    const fullName = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });

    submitBtn.disabled = false;
    submitBtn.textContent = 'Create free account';

    if (error) {
      showStatus(error.message, true);
      return;
    }

    showStatus('Account created! Check your email to confirm, then log in.');
    signupPanel.reset();
    setTimeout(() => switchTab('login'), 2500);
  });
});
