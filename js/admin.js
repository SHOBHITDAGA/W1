// Admin dashboard — gated to users with is_admin = true in their profile
document.addEventListener('DOMContentLoaded', async () => {
  const gateSection = document.getElementById('gateMessage');
  const gateHeading = document.getElementById('gateHeading');
  const gateText = document.getElementById('gateText');
  const dashboard = document.getElementById('dashboardContent');

  const { data: { session } } = await supabaseClient.auth.getSession();

  // Not logged in at all
  if (!session) {
    gateHeading.textContent = 'Log in required';
    gateText.textContent = "You need to be logged in with an admin account to view this page.";
    setTimeout(() => { window.location.href = 'login.html'; }, 1800);
    return;
  }

  // Logged in — check admin flag
  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('is_admin, full_name')
    .eq('id', session.user.id)
    .single();

  if (profileError || !profile?.is_admin) {
    gateHeading.textContent = "This area is admin-only";
    gateText.textContent = "Your account doesn't have admin access. If you believe this is a mistake, contact the site owner.";
    return;
  }

  // Access confirmed — load the dashboard
  gateSection.hidden = true;
  dashboard.hidden = false;

  loadMessages();
  loadEnrollments();
});

async function loadMessages() {
  const tbody = document.getElementById('messagesBody');
  const statEl = document.getElementById('statMessages');

  const { data, error } = await supabaseClient
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="5" class="table-empty">Couldn't load messages.</td></tr>`;
    return;
  }

  statEl.textContent = data.length;

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="table-empty">No messages yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(row => `
    <tr>
      <td>${escapeHtml(row.name)}</td>
      <td>${escapeHtml(row.email)}</td>
      <td>${escapeHtml(row.subject || '—')}</td>
      <td class="msg-cell">${escapeHtml(row.message)}</td>
      <td>${formatDate(row.created_at)}</td>
    </tr>
  `).join('');
}

async function loadEnrollments() {
  const tbody = document.getElementById('enrollmentsBody');
  const statEl = document.getElementById('statEnrollments');
  const learnersEl = document.getElementById('statLearners');

  const { data, error } = await supabaseClient
    .from('program_enrollments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="4" class="table-empty">Couldn't load enrollments.</td></tr>`;
  } else {
    statEl.textContent = data.length;

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="table-empty">No enrollments yet.</td></tr>`;
    } else {
      tbody.innerHTML = data.map(row => `
        <tr>
          <td>${escapeHtml(row.program_name)}</td>
          <td>${escapeHtml(row.category)}</td>
          <td>${escapeHtml(row.status)}</td>
          <td>${formatDate(row.created_at)}</td>
        </tr>
      `).join('');
    }
  }

  // Registered learners count (profiles table)
  const { count } = await supabaseClient
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  learnersEl.textContent = count ?? '—';
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}
