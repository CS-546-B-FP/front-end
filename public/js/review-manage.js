(function () {
  'use strict';

  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

  function apiFetch(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    return fetch(url, { ...options, headers, credentials: 'same-origin' });
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Edit toggle
    document.querySelectorAll('[data-review-edit-trigger]').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.review-card');
        const display = card.querySelector('[data-review-display]');
        const form = card.querySelector('[data-review-edit-form]');
        if (display && form) {
          display.hidden = true;
          form.hidden = false;
          btn.hidden = true;
        }
      });
    });

    // Edit cancel
    document.querySelectorAll('[data-review-edit-cancel]').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.review-card');
        const display = card.querySelector('[data-review-display]');
        const form = card.querySelector('[data-review-edit-form]');
        const editBtn = card.querySelector('[data-review-edit-trigger]');
        if (display && form) {
          display.hidden = false;
          form.hidden = true;
          if (editBtn) editBtn.hidden = false;
        }
      });
    });

    // Edit submit
    document.querySelectorAll('[data-review-edit-form]').forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const card = form.closest('.review-card');
        const reviewId = card?.dataset.reviewId;
        if (!reviewId) return;

        const errorEl = form.querySelector('[data-review-edit-error]');
        const submitBtn = form.querySelector('button[type="submit"]');
        const origText = submitBtn?.textContent;

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Saving...';
        }
        if (errorEl) errorEl.hidden = true;

        try {
          const rating = Number(form.querySelector('[name="rating"]').value);
          const reviewText = form.querySelector('[name="reviewText"]').value.trim();

          if (!reviewText) {
            throw new Error('Review text is required.');
          }
          if (!rating || rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5.');
          }

          const res = await apiFetch(`/api/reviews/${reviewId}`, {
            method: 'PUT',
            body: JSON.stringify({ reviewText, rating })
          });
          const data = await res.json();

          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to update review.');
          }

          window.location.reload();
        } catch (err) {
          if (errorEl) {
            errorEl.textContent = err.message || 'An error occurred.';
            errorEl.hidden = false;
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = origText;
          }
        }
      });
    });

    // Delete via dialog confirmation
    document.querySelectorAll('[data-review-delete-confirm]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const reviewId = btn.dataset.reviewId;
        if (!reviewId) return;

        btn.disabled = true;
        btn.textContent = 'Deleting...';

        try {
          const res = await apiFetch(`/api/reviews/${reviewId}`, {
            method: 'DELETE'
          });
          const data = await res.json();

          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to delete review.');
          }

          window.location.reload();
        } catch (err) {
          btn.disabled = false;
          btn.textContent = 'Delete';
          alert(err.message || 'Failed to delete review.');
        }
      });
    });
  });
})();
