// Programs directory filter — client-side only, no backend required
document.addEventListener('DOMContentLoaded', () => {
  sortCardsByEnrollDate();

  const chips = document.querySelectorAll('.filter-chip');
  const cards = document.querySelectorAll('.prog-card');
  const countEl = document.getElementById('resultsCount');
  const noResultsEl = document.getElementById('noResults');
  const total = cards.length;

  function applyFilter(filter) {
    let visibleCount = 0;

    cards.forEach(card => {
      const matches = filter === 'all' || card.dataset.category === filter;
      card.hidden = !matches;
      if (matches) visibleCount++;
    });

    countEl.textContent = `Showing ${visibleCount} of ${total} tracks`;
    noResultsEl.hidden = visibleCount !== 0;
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      applyFilter(chip.dataset.filter);
    });
  });

  // If arriving from the Skill Quiz result link (programs.html?cat=it), pre-select that filter
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('cat');
  if (catParam) {
    const matchingChip = document.querySelector(`.filter-chip[data-filter="${catParam}"]`);
    if (matchingChip) {
      chips.forEach(c => c.classList.remove('is-active'));
      matchingChip.classList.add('is-active');
      applyFilter(catParam);
      matchingChip.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
});

// Sort program cards so the soonest upcoming enrollment date appears first
function sortCardsByEnrollDate() {
  const grid = document.getElementById('programsGrid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.prog-card'));
  cards.sort((a, b) => new Date(a.dataset.enroll) - new Date(b.dataset.enroll));
  cards.forEach(card => grid.appendChild(card));
}
