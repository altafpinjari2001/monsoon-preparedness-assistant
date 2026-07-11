/**
 * Live Citizen Onboarding Modal Component
 * Asks for user details & requests browser GPS permission to fetch live location data.
 * @module components/onboarding-modal
 */

import { createElement, showToast } from '../modules/helpers.js';
import { getActiveProfile, saveActiveProfile, setOnboarded, isOnboarded } from '../modules/profiles.js';
import { getCurrentPosition } from '../modules/weather.js';

/**
 * Open the live citizen onboarding modal.
 * @param {Function} [onComplete] Callback when user saves profile
 */
export function openOnboardingModal(onComplete) {
  let modal = document.getElementById('citizen-onboarding-modal');
  if (modal) {
    modal.remove();
  }

  const active = getActiveProfile();

  modal = createElement('div', {
    className: 'modal-overlay onboarding-overlay active',
    id: 'citizen-onboarding-modal',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': 'onboarding-title',
  });

  const card = createElement('div', { className: 'modal-content glass-panel onboarding-card' });

  // Header
  const header = createElement('div', { className: 'modal-header' });
  header.appendChild(createElement('h2', { id: 'onboarding-title' }, '📍 Live Citizen Onboarding & GPS Setup'));
  if (isOnboarded()) {
    const closeBtn = createElement('button', { className: 'modal-close', 'aria-label': 'Close modal' }, '×');
    closeBtn.addEventListener('click', () => {
      modal.remove();
      if (onComplete) onComplete();
    });
    header.appendChild(closeBtn);
  }
  card.appendChild(header);

  // Subtitle
  card.appendChild(
    createElement(
      'p',
      { className: 'onboarding-subtitle' },
      'Allow live GPS location detection and enter your household details so MonsoonMitra delivers 100% real-time weather forecasts, flood alerts, and custom AI plans for your exact area.'
    )
  );

  const form = createElement('form', { className: 'onboarding-form' });

  // 1. Live GPS Button Section
  const gpsSection = createElement('div', { className: 'onboarding-gps-section' });
  const gpsStatus = createElement('span', { className: 'gps-status-text' }, 'Status: Coordinates not yet detected');

  const gpsBtn = createElement(
    'button',
    {
      type: 'button',
      className: 'btn btn-secondary gps-detect-btn',
    },
    '📍 Detect Live GPS Location (Browser Permission)'
  );

  gpsBtn.addEventListener('click', async () => {
    gpsBtn.disabled = true;
    gpsBtn.textContent = '⏳ Requesting GPS Permission...';
    try {
      const coords = await getCurrentPosition();
      latInput.value = coords.latitude.toFixed(4);
      lonInput.value = coords.longitude.toFixed(4);
      gpsStatus.textContent = `✅ Live GPS Detected: (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`;
      gpsStatus.className = 'gps-status-text text-success';
      showToast('Live GPS coordinates acquired!', 'success');
    } catch (err) {
      console.warn('GPS detection failed or permission denied:', err);
      gpsStatus.textContent = '⚠️ Permission denied or unavailable. You can enter your City/Pincode manually.';
      gpsStatus.className = 'gps-status-text text-warning';
      showToast('Could not detect GPS automatically. Please enter your location.', 'warning');
    } finally {
      gpsBtn.disabled = false;
      gpsBtn.textContent = '📍 Re-detect Live GPS Location';
    }
  });

  gpsSection.appendChild(gpsBtn);
  gpsSection.appendChild(gpsStatus);
  form.appendChild(gpsSection);

  // 2. Name & Location Grid
  const grid = createElement('div', { className: 'onboarding-grid' });

  // Name
  const nameGroup = createElement('div', { className: 'form-group' });
  nameGroup.appendChild(createElement('label', { 'for': 'ob-name' }, '👤 Your Full Name'));
  const nameInput = createElement('input', {
    type: 'text',
    id: 'ob-name',
    value: active.name || '',
    placeholder: 'e.g., Altaf Citizen',
    required: 'true',
  });
  nameGroup.appendChild(nameInput);
  grid.appendChild(nameGroup);

  // City / Location
  const locGroup = createElement('div', { className: 'form-group' });
  locGroup.appendChild(createElement('label', { 'for': 'ob-location' }, '🏙️ City / Locality Name'));
  const locInput = createElement('input', {
    type: 'text',
    id: 'ob-location',
    value: active.location || 'Pune, Maharashtra',
    placeholder: 'e.g., Pune, Mumbai, Kolkata',
    required: 'true',
  });
  locGroup.appendChild(locInput);
  grid.appendChild(locGroup);

  // Lat / Lon inputs
  const latGroup = createElement('div', { className: 'form-group' });
  latGroup.appendChild(createElement('label', { 'for': 'ob-lat' }, '🌐 Latitude'));
  const latInput = createElement('input', {
    type: 'number',
    step: 'any',
    id: 'ob-lat',
    value: active.latitude || 18.5314,
    required: 'true',
  });
  latGroup.appendChild(latInput);
  grid.appendChild(latGroup);

  const lonGroup = createElement('div', { className: 'form-group' });
  lonGroup.appendChild(createElement('label', { 'for': 'ob-lon' }, '🌐 Longitude'));
  const lonInput = createElement('input', {
    type: 'number',
    step: 'any',
    id: 'ob-lon',
    value: active.longitude || 73.8446,
    required: 'true',
  });
  lonGroup.appendChild(lonInput);
  grid.appendChild(lonGroup);

  // Pincode & Household Size
  const pinGroup = createElement('div', { className: 'form-group' });
  pinGroup.appendChild(createElement('label', { 'for': 'ob-pin' }, '📮 Pincode'));
  const pinInput = createElement('input', {
    type: 'text',
    id: 'ob-pin',
    value: active.pincode || '411005',
    placeholder: 'e.g., 411005',
  });
  pinGroup.appendChild(pinInput);
  grid.appendChild(pinGroup);

  const sizeGroup = createElement('div', { className: 'form-group' });
  sizeGroup.appendChild(createElement('label', { 'for': 'ob-size' }, '👨‍👩‍👧 Household Members Count'));
  const sizeInput = createElement('input', {
    type: 'number',
    id: 'ob-size',
    min: '1',
    max: '25',
    value: active.familySize || 4,
  });
  sizeGroup.appendChild(sizeInput);
  grid.appendChild(sizeGroup);

  form.appendChild(grid);

  // 3. Housing Structure
  const housingGroup = createElement('div', { className: 'onboarding-housing-group' });
  housingGroup.appendChild(createElement('label', {}, '🏡 Residence Structure & Floor Level'));
  const hGrid = createElement('div', { className: 'onboarding-grid' });

  const typeSelect = createElement('select', { id: 'ob-type' });
  typeSelect.appendChild(createElement('option', { value: 'independent_house' }, 'Independent House / Bungalow'));
  typeSelect.appendChild(createElement('option', { value: 'apartment' }, 'Apartment / High-rise'));
  typeSelect.value = active.householdType || 'apartment';
  hGrid.appendChild(typeSelect);

  const floorSelect = createElement('select', { id: 'ob-floor' });
  floorSelect.appendChild(createElement('option', { value: 'ground' }, 'Ground Floor (Higher Waterlogging Risk)'));
  floorSelect.appendChild(createElement('option', { value: 'upper' }, 'Upper Floor (High Wind Exposure)'));
  floorSelect.value = active.floor || 'ground';
  hGrid.appendChild(floorSelect);

  housingGroup.appendChild(hGrid);
  form.appendChild(housingGroup);

  // Submit Button
  const submitBtn = createElement(
    'button',
    {
      type: 'submit',
      className: 'btn btn-primary onboarding-submit-btn',
    },
    '🚀 Save Live Profile & Launch Real-Time Dashboard'
  );
  form.appendChild(submitBtn);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const updatedProfile = {
      name: nameInput.value.trim(),
      location: locInput.value.trim(),
      pincode: pinInput.value.trim(),
      latitude: parseFloat(latInput.value) || 18.5314,
      longitude: parseFloat(lonInput.value) || 73.8446,
      householdType: typeSelect.value,
      floor: floorSelect.value,
      familySize: parseInt(sizeInput.value, 10) || 4,
      vulnerableMembers: active.vulnerableMembers || [],
    };

    saveActiveProfile(updatedProfile);
    setOnboarded(true);
    modal.remove();
    showToast(`Live profile saved for ${updatedProfile.name} in ${updatedProfile.location}!`, 'success');
    if (onComplete) onComplete();
  });

  card.appendChild(form);
  modal.appendChild(card);
  document.body.appendChild(modal);
}
