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

  initScrollReveal();
  initStatCountUp();
});

// Fade/slide-in elements as they scroll into view — applies automatically, no per-page markup needed
function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.section, .page-hero, .hero, .prog-card, .story-card, .recognition-card, .module, .quiz-card'
  );
  if (!targets.length || !('IntersectionObserver' in window)) return;

  targets.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
}

// Animate the homepage hero stat numbers counting up on load
function initStatCountUp() {
  const stats = document.querySelectorAll('.hero-stats dd[data-count]');
  stats.forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = current.toLocaleString('en-IN') + suffix;
    }, 25);
  });
}

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
