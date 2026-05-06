(function () {
  document.addEventListener('submit', async (e) => {
    const form = e.target.closest('form[action*="/reviews"]');
    if (!form || form.method.toUpperCase() !== 'POST') return;

    const action = form.getAttribute('action') || '';
    const match = action.match(/\/buildings\/([^/]+)\/reviews/);
    if (!match) return;

    e.preventDefault();

    const buildingId = match[1];
    const formData = new FormData(form);
    const body = {
      reviewText: formData.get('text') || formData.get('reviewText') || '',
      rating: Number(formData.get('rating')),
      issueTags: formData.getAll('issueTags')
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await fetch(`/api/buildings/${buildingId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.success) {
        window.location.reload();
      } else {
        const msg = data.error || 'Failed to submit review.';
        alert(msg);
      }
    } catch {
      form.submit();
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();
