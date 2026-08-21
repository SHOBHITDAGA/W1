// Enrollment gate — shared by course-web-development.html and assessment-web-development.html
// Requires: PROGRAM_NAME and PROGRAM_CATEGORY set on window before this script runs
document.addEventListener('DOMContentLoaded', async () => {
  const gateSection = document.getElementById('enrollGate');
  const gateCard = document.getElementById('enrollCard');
  const content = document.getElementById('courseContent');

  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    renderLoggedOutGate(gateCard);
    return;
  }

  const enrolled = await checkEnrollment(session.user.id);

  if (enrolled) {
    revealContent(gateSection, content);
  } else {
    renderEnrollButton(gateCard, session.user.id, gateSection, content);
  }
});

async function checkEnrollment(userId) {
  const { data } = await supabaseClient
    .from('program_enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('program_name', window.PROGRAM_NAME)
    .limit(1);

  return data && data.length > 0;
}

function renderLoggedOutGate(gateCard) {
  gateCard.innerHTML = '';
  const p = document.createElement('p');
  p.textContent = 'Log in or create a free account to enroll and unlock this course.';
  const a = document.createElement('a');
  a.href = 'login.html';
  a.className = 'btn btn-primary';
  a.textContent = 'Log in to enroll';
  gateCard.appendChild(p);
  gateCard.appendChild(a);
}

function renderEnrollButton(gateCard, userId, gateSection, content) {
  gateCard.innerHTML = '';
  const p = document.createElement('p');
  p.textContent = "You're logged in but not yet enrolled in this track. Enroll to unlock the full course.";
  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = 'Enroll Now — it\'s free';
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = 'Enrolling…';
    const { error } = await supabaseClient.from('program_enrollments').insert({
      user_id: userId,
      program_name: window.PROGRAM_NAME,
      category: window.PROGRAM_CATEGORY,
      status: 'enrolled'
    });
    if (error) {
      btn.disabled = false;
      btn.textContent = 'Enroll Now — it\'s free';
      p.textContent = "Something went wrong — please try again.";
      return;
    }
    revealContent(gateSection, content);
  });
  gateCard.appendChild(p);
  gateCard.appendChild(btn);
}

function revealContent(gateSection, content) {
  gateSection.hidden = true;
  content.hidden = false;
}
