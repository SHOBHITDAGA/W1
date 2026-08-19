// Programs directory filter — client-side only, no backend required
document.addEventListener('DOMContentLoaded', () => {
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
});
