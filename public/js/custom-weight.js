(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const applyBtn = document.getElementById('apply-weights');
    const resetBtn = document.getElementById('reset-weights');
    if (!applyBtn) return;

    const sliders = document.querySelectorAll('[data-weight]');
    const grid = document.querySelector('.building-grid');
    if (!grid) return;

    const originalOrder = Array.from(grid.querySelectorAll('.building-card'));

    sliders.forEach(slider => {
      slider.addEventListener('input', () => {
        const label = document.querySelector(`[data-weight-value="${slider.dataset.weight}"]`);
        if (label) label.textContent = slider.value;
      });
    });

    function getWeights() {
      const weights = {};
      sliders.forEach(slider => {
        weights[slider.dataset.weight] = Number(slider.value);
      });
      return weights;
    }

    function getSortOrder() {
      const select = document.getElementById('sortOrder');
      return select ? select.value : 'desc';
    }

    function computeScore(card, weights) {
      const c = Number(card.dataset.complaints || 0);
      const v = Number(card.dataset.violations || 0);
      const b = Number(card.dataset.bedbugs || 0);
      const l = Number(card.dataset.litigations || 0);
      return c * (weights.complaints || 0)
           + v * (weights.violations || 0)
           + b * (weights.bedbugs || 0)
           + l * (weights.litigations || 0);
    }

    function getRiskLevel(score) {
      if (score < 6) return 'low';
      if (score <= 15) return 'medium';
      return 'high';
    }

    applyBtn.addEventListener('click', () => {
      const weights = getWeights();
      const order = getSortOrder();
      const cards = Array.from(grid.querySelectorAll('.building-card'));

      const scored = cards.map((card, idx) => ({
        card,
        score: computeScore(card, weights),
        originalIndex: idx
      }));

      scored.sort((a, b) => {
        if (a.score !== b.score) {
          return order === 'asc' ? a.score - b.score : b.score - a.score;
        }
        return a.originalIndex - b.originalIndex;
      });

      scored.forEach(({ card, score }) => {
        grid.appendChild(card);

        const badge = card.querySelector('.risk-badge');
        if (badge) {
          const level = getRiskLevel(score);
          badge.className = `risk-badge risk-badge--${level}`;
          badge.textContent = `${level.charAt(0).toUpperCase() + level.slice(1)} (${score})`;
        }
      });

      const status = document.getElementById('global-status');
      if (status) {
        status.textContent = `Buildings reordered by custom weights. ${cards.length} buildings sorted.`;
      }
    });

    resetBtn.addEventListener('click', () => {
      const defaults = { complaints: 1, violations: 2, bedbugs: 3, litigations: 4 };
      sliders.forEach(slider => {
        slider.value = defaults[slider.dataset.weight] || 1;
        const label = document.querySelector(`[data-weight-value="${slider.dataset.weight}"]`);
        if (label) label.textContent = slider.value;
      });

      originalOrder.forEach(card => grid.appendChild(card));

      const badges = grid.querySelectorAll('.risk-badge');
      badges.forEach(badge => {
        const card = badge.closest('.building-card');
        if (card) {
          const score = computeScore(card, defaults);
          const level = getRiskLevel(score);
          badge.className = `risk-badge risk-badge--${level}`;
          badge.textContent = `${level.charAt(0).toUpperCase() + level.slice(1)}`;
        }
      });
    });
  });
})();
