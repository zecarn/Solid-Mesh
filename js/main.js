/**
 * Main Application Entry Point
 * Orchestrates and initializes all modules upon DOM ready.
 */

import { init3DHeroCanvas } from './modules/hero3d.js';
import { initGallery } from './modules/gallery.js';
import { initQuoteCalculator } from './modules/calculator.js';
import { initContactForm } from './modules/contact.js';
import { initNavbar } from './modules/navbar.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Header Navigation
  initNavbar();

  // Initialize Interactive 3D Canvas
  init3DHeroCanvas();

  // Initialize Real-Time Quote Calculator & Dropzone
  initQuoteCalculator();

  // Initialize Interactive Model Gallery
  initGallery();

  // Initialize Engineering Contact Form
  initContactForm();

  console.log('🚀 Solid Mesh Studio 3D initialized successfully.');
});
