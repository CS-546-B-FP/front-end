(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const applyBtn = document.getElementById('apply-weights');
    const resetBtn = document.getElementById('reset-weights');
    if (!applyBtn) return;

    const sliders = document.querySelectorAll('[data-weight]');
    const grid = document.querySelector('.building-grid');
    if (!grid) return;

    const sortOrderSelect = document.getElementById('sortOrder');
    const sortBySelect = document.getElementById('sortBy');
    const riskLevelSelect = document.getElementById('riskLevel');
    const originalOrder = Array.from(grid.querySelectorAll('.building-card'));
    let weightsActive = false;

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

    function applyWeights() {
      weightsActive = true;
      const weights = getWeights();
      const order = sortOrderSelect ? sortOrderSelect.value : 'desc';
      const riskFilter = riskLevelSelect ? riskLevelSelect.value : '';
      const cards = Array.from(grid.querySelectorAll('.building-card'));

      const scored = cards.map((card, idx) => {
        const score = computeScore(card, weights);
        const level = getRiskLevel(score);
        return { card, score, level, originalIndex: idx };
      });

      scored.sort((a, b) => {
        if (a.score !== b.score) {
          return order === 'asc' ? a.score - b.score : b.score - a.score;
        }
        return a.originalIndex - b.originalIndex;
      });

      scored.forEach(({ card, score, level }) => {
        if (riskFilter) {
          card.style.display = level === riskFilter.toLowerCase() ? '' : 'none';
        } else {
          card.style.display = '';
        }

        grid.appendChild(card);

        const badge = card.querySelector('.risk-badge');
        if (badge) {
          badge.className = `risk-badge risk-badge--${level}`;
          badge.textContent = `${level.charAt(0).toUpperCase() + level.slice(1)} (${score})`;
        }
      });

      const visible = scored.filter(s => s.card.style.display !== 'none').length;
      const status = document.getElementById('global-status');
      if (status) {
        status.textContent = `${visible} buildings sorted by custom weights.`;
      }
    }

    sliders.forEach(slider => {
      slider.addEventListener('input', () => {
        const label = document.querySelector(`[data-weight-value="${slider.dataset.weight}"]`);
        if (label) label.textContent = slider.value;
        applyWeights();
      });
    });

    applyBtn.addEventListener('click', applyWeights);

    if (sortOrderSelect) {
      sortOrderSelect.addEventListener('change', () => {
        if (weightsActive) applyWeights();
      });
    }

    if (sortBySelect) {
      sortBySelect.addEventListener('change', () => {
        if (weightsActive) applyWeights();
      });
    }

    if (riskLevelSelect) {
      riskLevelSelect.addEventListener('change', () => {
        if (weightsActive) applyWeights();
      });
    }

    resetBtn.addEventListener('click', () => {
      weightsActive = false;
      const defaults = { complaints: 1, violations: 2, bedbugs: 3, litigations: 4 };
      sliders.forEach(slider => {
        slider.value = defaults[slider.dataset.weight] || 1;
        const label = document.querySelector(`[data-weight-value="${slider.dataset.weight}"]`);
        if (label) label.textContent = slider.value;
      });

      originalOrder.forEach(card => {
        card.style.display = '';
        grid.appendChild(card);
      });

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
