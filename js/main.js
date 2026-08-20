// Mobile nav toggle — shared across all pages
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('primaryNav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a link is clicked (mobile)
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Reflect login state in the nav bar (runs on every page that loads supabase-client.js first)
  if (typeof supabaseClient !== 'undefined') {
    updateNavForAuthState();
  }
});

async function updateNavForAuthState() {
  const navCta = document.querySelector('.nav-cta');
  if (!navCta) return;

  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    // Logged out — leave the default "Log in" link as-is
    return;
  }

  // Logged in — replace the Log in link with name + logout
  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('full_name, is_admin')
    .eq('id', session.user.id)
    .single();

  const displayName = profile?.full_name || session.user.email.split('@')[0];

  navCta.textContent = `Hi, ${displayName}`;
  navCta.removeAttribute('href');
  navCta.style.cursor = 'default';

  // Build a small logout link right after it
  const logoutLink = document.createElement('a');
  logoutLink.href = '#';
  logoutLink.className = 'nav-cta nav-logout';
  logoutLink.textContent = 'Log out';
  logoutLink.addEventListener('click', async (e) => {
    e.preventDefault();
    await supabaseClient.auth.signOut();
    window.location.href = 'index.html';
  });
  navCta.insertAdjacentElement('afterend', logoutLink);

  // Optional: show an Admin link in nav if this user is an admin
  if (profile?.is_admin) {
    const adminLink = document.createElement('a');
    adminLink.href = 'admin.html';
    adminLink.textContent = 'Admin';
    navCta.insertAdjacentElement('beforebegin', adminLink);
  }
}
