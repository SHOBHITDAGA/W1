// Find Your Skill Path — fully client-side, no backend needed
const QUIZ_QUESTIONS = [
  {
    prompt: "Which of these sounds most like a good afternoon?",
    options: [
      { text: "Fixing something broken — a device, a plan, a process", cat: "it" },
      { text: "Helping someone who's unwell or in discomfort", cat: "health" },
      { text: "Being outdoors, working with land, plants, or animals", cat: "agri" },
      { text: "Building or repairing something with your hands", cat: "trades" }
    ]
  },
  {
    prompt: "Pick the tool you'd rather get really good at using.",
    options: [
      { text: "A laptop and a code editor", cat: "it" },
      { text: "A blood pressure monitor and a patient chart", cat: "health" },
      { text: "A soil testing kit", cat: "agri" },
      { text: "A wiring tester and a toolkit", cat: "trades" },
      { text: "A camera or design software", cat: "design" }
    ]
  },
  {
    prompt: "How do you prefer to solve a problem?",
    options: [
      { text: "Break it into logical steps and test each one", cat: "it" },
      { text: "Talk to the person affected and understand their needs first", cat: "health" },
      { text: "Observe patterns over time and adjust gradually", cat: "agri" },
      { text: "Get hands-on and figure it out by doing", cat: "trades" }
    ]
  },
  {
    prompt: "Which compliment would mean the most to you?",
    options: [
      { text: "'This looks and feels genuinely well designed.'", cat: "design" },
      { text: "'You explained that so clearly, it just made sense.'", cat: "it" },
      { text: "'You made me feel cared for.'", cat: "health" },
      { text: "'That repair is going to last for years.'", cat: "trades" }
    ]
  },
  {
    prompt: "Pick a work environment.",
    options: [
      { text: "Quiet, screen-based, mostly independent", cat: "it" },
      { text: "A clinic or someone's home, working directly with people", cat: "health" },
      { text: "Open land, seasonal, hands-on with nature", cat: "agri" },
      { text: "A workshop or site, building things that last", cat: "trades" },
      { text: "A studio, creating things people will see and use", cat: "design" }
    ]
  }
];

const RESULTS = {
  it: {
    title: "IT & Software",
    program: "Web Development",
    why: "You think in steps and like a problem that has a clear, buildable solution. The Web Development track takes you from your first line of HTML to a live, deployed site — the same kind of hands-on building this quiz just showed you enjoy."
  },
  health: {
    title: "Healthcare",
    program: "Community Health Worker",
    why: "You lean toward understanding people and helping directly. The Community Health Worker track combines real patient-facing practice with structured training, built for people who'd rather work with people than screens alone."
  },
  agri: {
    title: "Agriculture",
    program: "Precision Farming Basics",
    why: "You're drawn to working with land and noticing patterns over time. Precision Farming Basics turns that instinct into a practical skill set — soil testing, irrigation planning, and mobile record-keeping that make a real farm run better."
  },
  trades: {
    title: "Trades",
    program: "Electrical Fundamentals",
    why: "You like building or fixing things you can see the result of immediately. Electrical Fundamentals turns hands-on ability into a certified, employable skill — with real safety training built in."
  },
  design: {
    title: "Design & Media",
    program: "Graphic Design Foundations",
    why: "You care about how things look and feel to the people using them. Graphic Design Foundations gives you the layout, typography, and tool skills to turn that eye into paid work."
  }
};

const CATEGORY_TO_FILTER = { it: "it", health: "health", agri: "agri", trades: "trades", design: "design" };

let currentQuestion = 0;
const answers = [];

document.addEventListener('DOMContentLoaded', () => {
  renderQuestion();

  document.getElementById('btnBack').addEventListener('click', () => {
    if (currentQuestion > 0) {
      currentQuestion--;
      answers.pop();
      renderQuestion();
    }
  });

  document.getElementById('btnRetake').addEventListener('click', () => {
    currentQuestion = 0;
    answers.length = 0;
    document.getElementById('resultCard').hidden = true;
    document.getElementById('quizCard').hidden = false;
    renderQuestion();
  });
});

function renderQuestion() {
  const q = QUIZ_QUESTIONS[currentQuestion];
  const container = document.getElementById('quizQuestions');
  const stepLabel = document.getElementById('stepLabel');
  const progressBar = document.getElementById('progressBar');
  const btnBack = document.getElementById('btnBack');

  stepLabel.textContent = `Question ${currentQuestion + 1} of ${QUIZ_QUESTIONS.length}`;
  progressBar.style.width = `${(currentQuestion / QUIZ_QUESTIONS.length) * 100}%`;
  btnBack.hidden = currentQuestion === 0;

  container.innerHTML = `
    <h2 class="quiz-prompt">${q.prompt}</h2>
    <div class="quiz-options">
      ${q.options.map((opt, i) => `
        <button class="quiz-option" data-cat="${opt.cat}" data-index="${i}">${opt.text}</button>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => {
      answers.push(btn.dataset.cat);
      currentQuestion++;
      if (currentQuestion < QUIZ_QUESTIONS.length) {
        renderQuestion();
      } else {
        showResult();
      }
    });
  });
}

function showResult() {
  document.getElementById('progressBar').style.width = '100%';

  const tally = {};
  answers.forEach(cat => { tally[cat] = (tally[cat] || 0) + 1; });

  const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  const topCat = sorted[0][0];
  const secondCat = sorted[1] ? sorted[1][0] : null;

  const result = RESULTS[topCat];

  document.getElementById('quizCard').hidden = true;
  const resultCard = document.getElementById('resultCard');
  resultCard.hidden = false;

  document.getElementById('resultTitle').textContent = `${result.title} — try "${result.program}"`;
  document.getElementById('resultWhy').textContent = result.why;

  const cta = document.getElementById('resultCta');
  cta.href = `programs.html?cat=${CATEGORY_TO_FILTER[topCat]}`;

  const altEl = document.getElementById('resultAlt');
  if (secondCat) {
    altEl.textContent = `Close second: ${RESULTS[secondCat].title}. Worth browsing too if this doesn't feel quite right.`;
  } else {
    altEl.textContent = '';
  }
}
