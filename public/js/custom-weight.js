(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const applyBtn = document.getElementById('apply-weights');
    const resetBtn = document.getElementById('reset-weights');
    if (!applyBtn) return;

    const sliders = document.querySelectorAll('[data-weight]');
    const grid = document.querySelector('.building-grid');
    if (!grid) return;

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

    function computeScore(card, weights) {
      const c = Number(card.dataset.complaints || 0);
      const v = Number(card.dataset.violations || 0);
      const b = Number(card.dataset.bedbugs || 0);
      const l = Number(card.dataset.litigations || 0);
      return c * weights.complaints + v * weights.violations + b * weights.bedbugs + l * weights.litigations;
    }

    function getRiskLevel(score) {
      if (score < 6) return 'low';
      if (score <= 15) return 'medium';
      return 'high';
    }

    applyBtn.addEventListener('click', () => {
      const weights = getWeights();
      const cards = Array.from(grid.querySelectorAll('.building-card'));

      const scored = cards.map(card => ({
        card,
        score: computeScore(card, weights)
      }));

      scored.sort((a, b) => a.score - b.score);

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
      window.location.reload();
    });
  });
})();
