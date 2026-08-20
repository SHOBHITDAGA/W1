// Web Development assessment — client-side graded (see fairness note on the page) + certificate unlock
const ASSESSMENT_QUESTIONS = [
  { q: "Which tag is used to define the largest heading in HTML?", options: ["<h6>", "<h1>", "<head>", "<heading>"], correct: 1 },
  { q: "Which HTML tag is used to create a hyperlink?", options: ["<link>", "<a>", "<href>", "<nav>"], correct: 1 },
  { q: "In CSS, which property controls the space inside an element's border?", options: ["margin", "spacing", "padding", "border-gap"], correct: 2 },
  { q: "Which CSS layout method arranges items in a single row or column easily?", options: ["Float", "Flexbox", "Table", "Position"], correct: 1 },
  { q: "What does 'responsive design' primarily aim to do?", options: ["Make sites load faster", "Adapt layout to different screen sizes", "Add animations", "Improve SEO ranking"], correct: 1 },
  { q: "In JavaScript, which keyword declares a variable that can be reassigned?", options: ["const", "let", "final", "static"], correct: 1 },
  { q: "Which JavaScript method adds a click event listener to a button?", options: ["button.onClick()", "button.addEventListener('click', fn)", "button.click.add(fn)", "button.event('click')"], correct: 1 },
  { q: "What is the correct file extension for a CSS file?", options: [".css", ".style", ".csss", ".stylesheet"], correct: 0 },
  { q: "Which CSS unit scales relative to the viewport width?", options: ["px", "em", "vw", "pt"], correct: 2 },
  { q: "What does 'DOM' stand for?", options: ["Document Object Model", "Data Object Method", "Display Order Manager", "Document Order Model"], correct: 0 }
];

const PASS_THRESHOLD = 0.7;
let currentQ = 0;
const userAnswers = [];

document.addEventListener('DOMContentLoaded', () => {
  renderAssessmentQuestion();

  document.getElementById('btnRetakeAssessment').addEventListener('click', () => {
    currentQ = 0;
    userAnswers.length = 0;
    document.getElementById('assessmentResult').hidden = true;
    document.getElementById('assessmentCard').hidden = false;
    renderAssessmentQuestion();
  });

  document.getElementById('btnPrintCert').addEventListener('click', () => {
    window.print();
  });

  checkExistingCertificate();
});

function renderAssessmentQuestion() {
  const q = ASSESSMENT_QUESTIONS[currentQ];
  const container = document.getElementById('assessmentQuestions');
  document.getElementById('assessStepLabel').textContent = `Question ${currentQ + 1} of ${ASSESSMENT_QUESTIONS.length}`;
  document.getElementById('assessProgressBar').style.width = `${(currentQ / ASSESSMENT_QUESTIONS.length) * 100}%`;

  // Build via DOM methods (not innerHTML string interpolation) so option text
  // like "<a>" or "<link>" displays as literal text instead of being parsed as HTML.
  container.innerHTML = '';

  const heading = document.createElement('h3');
  heading.className = 'quiz-prompt';
  heading.textContent = q.q;
  container.appendChild(heading);

  const optionsWrap = document.createElement('div');
  optionsWrap.className = 'quiz-options';

  q.options.forEach((optText, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.dataset.index = i;
    btn.textContent = optText; // textContent — always safe, never parsed as HTML
    btn.addEventListener('click', () => {
      userAnswers.push(i === q.correct);
      currentQ++;
      if (currentQ < ASSESSMENT_QUESTIONS.length) {
        renderAssessmentQuestion();
      } else {
        finishAssessment();
      }
    });
    optionsWrap.appendChild(btn);
  });

  container.appendChild(optionsWrap);
}

async function finishAssessment() {
  document.getElementById('assessProgressBar').style.width = '100%';
  const correctCount = userAnswers.filter(Boolean).length;
  const score = correctCount / ASSESSMENT_QUESTIONS.length;
  const passed = score >= PASS_THRESHOLD;

  document.getElementById('assessmentCard').hidden = true;
  const resultEl = document.getElementById('assessmentResult');
  resultEl.hidden = false;
  resultEl.classList.toggle('is-pass', passed);
  resultEl.classList.toggle('is-fail', !passed);

  document.getElementById('assessResultTitle').textContent = passed
    ? `Passed — ${correctCount}/${ASSESSMENT_QUESTIONS.length}`
    : `Not yet — ${correctCount}/${ASSESSMENT_QUESTIONS.length}`;

  document.getElementById('assessResultText').textContent = passed
    ? "You've cleared the assessment. Scroll down to claim your certificate."
    : `You need at least ${Math.ceil(PASS_THRESHOLD * ASSESSMENT_QUESTIONS.length)}/${ASSESSMENT_QUESTIONS.length} to pass. Review the course modules and try again.`;

  if (passed) {
    await unlockCertificate();
  }
}

async function unlockCertificate() {
  const gate = document.getElementById('certGate');
  const cert = document.getElementById('certificate');

  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    gate.innerHTML = '';
    const p = document.createElement('p');
    p.textContent = "You passed! Log in (or create a free account) to save this and generate your certificate.";
    const a = document.createElement('a');
    a.href = 'login.html';
    a.className = 'btn btn-primary';
    a.textContent = 'Log in to claim certificate';
    gate.appendChild(p);
    gate.appendChild(a);
    return;
  }

  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('full_name')
    .eq('id', session.user.id)
    .single();

  const displayName = profile?.full_name || session.user.email;

  await supabaseClient.from('program_enrollments').insert({
    user_id: session.user.id,
    program_name: 'Web Development',
    category: 'it',
    status: 'certified'
  });

  gate.hidden = true;
  cert.hidden = false;
  document.getElementById('certName').textContent = displayName;
  document.getElementById('certDate').textContent = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

async function checkExistingCertificate() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return;

  const { data } = await supabaseClient
    .from('program_enrollments')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('program_name', 'Web Development')
    .eq('status', 'certified')
    .limit(1);

  if (data && data.length > 0) {
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('full_name')
      .eq('id', session.user.id)
      .single();

    document.getElementById('certGate').hidden = true;
    const cert = document.getElementById('certificate');
    cert.hidden = false;
    document.getElementById('certName').textContent = profile?.full_name || session.user.email;
    document.getElementById('certDate').textContent = new Date(data[0].created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
