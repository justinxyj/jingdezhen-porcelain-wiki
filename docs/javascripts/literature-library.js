(() => {
  const init = () => {
    const root = document.getElementById('literature-library');
    const input = document.getElementById('literature-search');
    if (!root || !input) return;
    const items = [...root.querySelectorAll('.literature-item')];
    let category = 'all';
    const apply = () => {
      const q = input.value.trim().toLowerCase();
      items.forEach(item => {
        const matchCategory = category === 'all' || item.dataset.category === category;
        const matchText = !q || (item.dataset.search || '').toLowerCase().includes(q);
        item.hidden = !(matchCategory && matchText);
      });
    };
    input.addEventListener('input', apply);
    document.querySelectorAll('[data-library-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        category = btn.dataset.libraryFilter;
        document.querySelectorAll('[data-library-filter]').forEach(b => b.classList.toggle('is-active', b === btn));
        apply();
      });
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
