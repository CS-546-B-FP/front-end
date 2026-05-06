(function () {
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.watchlist-btn');
    if (!btn) return;

    const form = btn.closest('form');
    if (!form) return;

    e.preventDefault();

    const action = form.getAttribute('action') || '';
    const match = action.match(/\/watchlist\/(.+)/);
    if (!match) return;

    const buildingId = match[1];
    btn.disabled = true;

    try {
      const res = await fetch('/api/watchlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buildingId })
      });
      const data = await res.json();

      if (data.success) {
        const watching = data.data.watching;
        btn.setAttribute('aria-pressed', String(watching));
        btn.textContent = watching ? 'Watching' : 'Watch';
      }
    } catch {
      form.submit();
    } finally {
      btn.disabled = false;
    }
  });
})();
