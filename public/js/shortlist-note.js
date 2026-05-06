(function () {
  document.addEventListener('submit', async (e) => {
    const form = e.target.closest('.note-form');
    if (!form) return;

    e.preventDefault();

    const action = form.getAttribute('action') || '';
    const match = action.match(/\/shortlists\/([^/]+)\/items\/([^/]+)\/note/);
    if (!match) return;

    const [, shortlistId, buildingId] = match;
    const formData = new FormData(form);
    const note = formData.get('note') || '';

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await fetch(`/api/shortlists/${shortlistId}/items/${buildingId}/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privateNote: note })
      });
      const data = await res.json();

      if (data.success && submitBtn) {
        const original = submitBtn.textContent;
        submitBtn.textContent = 'Saved!';
        setTimeout(() => { submitBtn.textContent = original; }, 2000);
      }
    } catch {
      form.submit();
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();
