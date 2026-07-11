/**
 * MonsoonGuard - AI-powered Monsoon Preparedness Assistant
 * Main application entry point
 * @module main
 */

import './style.css';
import { renderDashboard } from './components/dashboard.js';
import { renderChecklist } from './components/checklist-view.js';
import { renderBudget } from './components/budget-view.js';
import { renderAdvisor } from './components/advisor-view.js';
import { renderTravel } from './components/travel-view.js';
import { renderCommunityMap } from './components/community-view.js';
import { initRainAnimation } from './modules/rain.js';
import { setLanguage, getCurrentLanguage } from './modules/i18n.js';
import { saveToStorage, loadFromStorage, showToast, sanitizeInput } from './modules/helpers.js';
import { geocodeCity, getCurrentPosition } from './modules/weather.js';
import { isOnboarded } from './modules/profiles.js';
import { openOnboardingModal } from './components/onboarding-modal.js';

// Current view state
let currentView = 'dashboard';
let rainController = null;

/**
 * Initialize the application.
 */
function init() {
  setupNavigation();
  setupSettings();
  setupLanguageSelector();
  initializeRain();
  navigateTo('dashboard');

  if (!isOnboarded()) {
    setTimeout(() => {
      openOnboardingModal(() => {
        navigateTo('dashboard');
      });
    }, 400);
  }
}

/**
 * Set up navigation button event listeners.
 */
function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  for (const btn of navButtons) {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if (view) navigateTo(view);
    });
  }
}

/**
 * Navigate to a view.
 * @param {string} view - View name ('dashboard', 'checklist', 'travel', 'community', 'budget', 'advisor')
 */
function navigateTo(view) {
  currentView = view;
  const container = document.getElementById('app-view');
  if (!container) return;

  // Update active nav button
  const navButtons = document.querySelectorAll('.nav-btn');
  for (const btn of navButtons) {
    btn.classList.toggle('active', btn.dataset.view === view);
    btn.setAttribute('aria-current', btn.dataset.view === view ? 'page' : 'false');
  }

  // Render the selected view
  switch (view) {
    case 'dashboard':
      renderDashboard(container);
      break;
    case 'checklist':
      renderChecklist(container);
      break;
    case 'travel':
      renderTravel(container);
      break;
    case 'community':
      renderCommunityMap(container);
      break;
    case 'budget':
      renderBudget(container);
      break;
    case 'advisor':
      renderAdvisor(container);
      break;
    default:
      renderDashboard(container);
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Initialize rain animation.
 */
function initializeRain() {
  const canvas = document.getElementById('rain-canvas');
  if (canvas) {
    rainController = initRainAnimation(canvas);
    rainController.start();
    rainController.setIntensity('light');
  }
}

/**
 * Set up settings modal.
 */
function setupSettings() {
  const settingsBtn = document.getElementById('settings-btn');
  const modal = document.getElementById('settings-modal');
  const closeBtn = document.getElementById('close-settings-btn');
  const saveApiKeyBtn = document.getElementById('save-api-key');
  const useGpsBtn = document.getElementById('use-gps-btn');

  if (settingsBtn && modal) {
    settingsBtn.addEventListener('click', () => {
      modal.hidden = false;
      loadSettingsValues();
      // Focus trap
      const firstInput = modal.querySelector('input, button, select');
      if (firstInput) firstInput.focus();
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.hidden = true;
      saveSettingsValues();
      settingsBtn?.focus();
    });
  }

  // Close on overlay click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.hidden = true;
        saveSettingsValues();
      }
    });

    // Close on Escape
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        modal.hidden = true;
        saveSettingsValues();
        settingsBtn?.focus();
      }
    });
  }

  // Save API Key
  if (saveApiKeyBtn) {
    saveApiKeyBtn.addEventListener('click', () => {
      const input = document.getElementById('gemini-api-key');
      if (input && input.value.trim()) {
        saveToStorage('monsoonguard_api_key', input.value.trim());
        showToast('API key saved successfully!', 'success');
      } else {
        saveToStorage('monsoonguard_api_key', null);
        showToast('API key removed', 'info');
      }
    });
  }

  // Use GPS
  if (useGpsBtn) {
    useGpsBtn.addEventListener('click', async () => {
      try {
        useGpsBtn.disabled = true;
        useGpsBtn.textContent = '⏳ Getting location...';
        const position = await getCurrentPosition();
        const locationInput = document.getElementById('location-input');
        saveToStorage('monsoonguard_location', {
          latitude: position.latitude,
          longitude: position.longitude,
          name: `${position.latitude.toFixed(2)}, ${position.longitude.toFixed(2)}`,
        });
        if (locationInput) locationInput.value = `GPS: ${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`;
        showToast('Location set via GPS!', 'success');
      } catch (err) {
        showToast('Could not get GPS location: ' + err.message, 'error');
      } finally {
        useGpsBtn.disabled = false;
        useGpsBtn.textContent = '📍 GPS';
      }
    });
  }

  // Location input with city search
  const locationInput = document.getElementById('location-input');
  if (locationInput) {
    locationInput.addEventListener('change', async () => {
      const city = sanitizeInput(locationInput.value);
      if (!city) return;
      try {
        const result = await geocodeCity(city);
        saveToStorage('monsoonguard_location', {
          latitude: result.latitude,
          longitude: result.longitude,
          name: `${result.name}, ${result.country}`,
        });
        locationInput.value = `${result.name}, ${result.country}`;
        showToast(`Location set to ${result.name}, ${result.country}`, 'success');
      } catch (err) {
        console.error('Geocoding error:', err);
        showToast('City not found. Try another name.', 'error');
      }
    });
  }
}

/**
 * Load saved settings into the form.
 */
function loadSettingsValues() {
  const apiKeyInput = document.getElementById('gemini-api-key');
  const locationInput = document.getElementById('location-input');
  const familySizeInput = document.getElementById('family-size');

  const savedKey = loadFromStorage('monsoonguard_api_key', '');
  if (apiKeyInput && savedKey) apiKeyInput.value = savedKey;

  const savedLocation = loadFromStorage('monsoonguard_location', null);
  if (locationInput && savedLocation) locationInput.value = savedLocation.name || '';

  const savedFamilySize = loadFromStorage('monsoonguard_family_size', 4);
  if (familySizeInput) familySizeInput.value = savedFamilySize;

  // Load vulnerabilities
  const savedVulnerabilities = loadFromStorage('monsoonguard_vulnerabilities', []);
  const checkboxes = document.querySelectorAll('input[name="vulnerabilities"]');
  for (const cb of checkboxes) {
    cb.checked = savedVulnerabilities.includes(cb.value);
  }
}

/**
 * Save settings from the form.
 */
function saveSettingsValues() {
  const familySizeInput = document.getElementById('family-size');
  if (familySizeInput) {
    saveToStorage('monsoonguard_family_size', parseInt(familySizeInput.value, 10) || 4);
  }

  const checkboxes = document.querySelectorAll('input[name="vulnerabilities"]:checked');
  const vulnerabilities = Array.from(checkboxes).map(cb => cb.value);
  saveToStorage('monsoonguard_vulnerabilities', vulnerabilities);

  // Refresh current view
  const container = document.getElementById('app-view');
  if (container && currentView === 'dashboard') {
    renderDashboard(container);
  }
}

/**
 * Set up language selector.
 */
function setupLanguageSelector() {
  const langSelect = document.getElementById('language-select');
  if (!langSelect) return;

  // Set current language
  langSelect.value = getCurrentLanguage();

  langSelect.addEventListener('change', () => {
    setLanguage(langSelect.value);
    // Re-render current view with new language
    const container = document.getElementById('app-view');
    if (container) {
      navigateTo(currentView);
    }
    showToast('Language updated!', 'success');
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
