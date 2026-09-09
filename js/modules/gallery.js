/**
 * Interactive 3D Model Gallery Module
 * Handles category filtering and loads model presets into the instant quote calculator.
 */

import { loadSampleToCalculator } from './calculator.js';

export function initGallery() {
  const filterButtons = document.querySelectorAll('#gallery-filters .filter-btn');
  const cards = document.querySelectorAll('.model-card');

  // Filter Buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('bg-neon-cyan', 'text-cyber-950');
        b.classList.add('bg-cyber-850', 'text-metal-300', 'border', 'border-cyber-700');
      });
      btn.classList.add('bg-neon-cyan', 'text-cyber-950');
      btn.classList.remove('bg-cyber-850', 'text-metal-300', 'border-cyber-700');

      const filter = btn.getAttribute('data-filter');
      cards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Action buttons inside gallery cards
  const simulateButtons = document.querySelectorAll('.model-card button[data-sample-name]');
  simulateButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-sample-name');
      const weight = parseFloat(btn.getAttribute('data-sample-weight')) || 100;
      const mat = btn.getAttribute('data-sample-mat') || 'PLA';
      loadSampleToCalculator(name, weight, mat);
    });
  });

  // Expose to window for backwards compatibility if needed
  window.loadSampleToViewer = function(name, weight, matCategory) {
    loadSampleToCalculator(name, weight, matCategory);
  };
}
