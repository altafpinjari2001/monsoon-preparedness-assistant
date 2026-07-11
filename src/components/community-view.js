/**
 * Citizen Community Waterlogging & Hazard Reporting Map View
 * @module components/community-view
 */

import { createElement, showToast } from '../modules/helpers.js';
import { getCommunityReports, addCommunityReport } from '../modules/community-map.js';

/**
 * Render the Community Reporting Map view.
 * @param {HTMLElement} container
 */
export function renderCommunityMap(container) {
  container.textContent = '';
  const reports = getCommunityReports();

  const wrapper = createElement('div', { className: 'community-view' });

  // Header
  const header = createElement('div', { className: 'glass-panel community-header' });
  header.appendChild(createElement('h2', { className: 'section-title' }, '📍 Pune Citizen Waterlogging & Hazard Map'));
  header.appendChild(
    createElement(
      'p',
      { className: 'section-subtitle' },
      'Crowdsourced monsoon incident reporting across Pune. Pin waterlogging, fallen trees, and drain blockages to alert your community.'
    )
  );
  wrapper.appendChild(header);

  // Map & Form Layout
  const mainGrid = createElement('div', { className: 'community-grid' });

  // Map Panel (OpenStreetMap embed focused on Pune + active hazard overlays)
  const mapPanel = createElement('div', { className: 'glass-panel map-panel' });
  mapPanel.appendChild(createElement('h3', { className: 'section-title' }, '🗺️ Live Pune OpenStreetMap Canvas'));

  const mapFrameContainer = createElement('div', { className: 'osm-frame-container' });
  const iframe = createElement('iframe', {
    className: 'osm-iframe',
    title: 'Pune OpenStreetMap Waterlogging Canvas',
    src: 'https://www.openstreetmap.org/export/embed.html?bbox=73.74%2C18.45%2C73.94%2C18.60&layer=mapnik',
    loading: 'lazy',
  });
  mapFrameContainer.appendChild(iframe);
  mapPanel.appendChild(mapFrameContainer);

  mainGrid.appendChild(mapPanel);

  // Report Form Panel
  const formPanel = createElement('div', { className: 'glass-panel report-form-panel' });
  formPanel.appendChild(createElement('h3', { className: 'section-title' }, '📢 Submit Hazard Report'));

  const form = createElement('form', { className: 'hazard-form' });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const typeSelect = form.querySelector('#hazard-type');
    const locInput = form.querySelector('#hazard-loc');
    const detailsInput = form.querySelector('#hazard-details');
    const sevSelect = form.querySelector('#hazard-sev');

    if (!locInput.value.trim() || !detailsInput.value.trim()) return;

    addCommunityReport({
      type: typeSelect.value,
      locationName: locInput.value.trim(),
      details: detailsInput.value.trim(),
      severity: sevSelect.value,
    });

    showToast('Report pinned to citizen hazard map!', 'success');
    renderCommunityMap(container);
  });

  // Type
  const typeGroup = createElement('div', { className: 'form-group' });
  typeGroup.appendChild(createElement('label', { 'for': 'hazard-type' }, 'Hazard Type'));
  const typeSelect = createElement('select', { id: 'hazard-type' });
  const types = ['Waterlogging (6+ inches)', 'Blocked Drain / Overflow', 'Fallen Tree Branch', 'Submerged Electrical Pole', 'Bridge Flooding'];
  for (const t of types) {
    typeSelect.appendChild(createElement('option', { value: t }, t));
  }
  typeGroup.appendChild(typeSelect);
  form.appendChild(typeGroup);

  // Location Name
  const locGroup = createElement('div', { className: 'form-group' });
  locGroup.appendChild(createElement('label', { 'for': 'hazard-loc' }, 'Pune Locality / Landmark'));
  locGroup.appendChild(createElement('input', { type: 'text', id: 'hazard-loc', placeholder: 'e.g., Bhide Bridge, Kothrud Stand', required: 'true' }));
  form.appendChild(locGroup);

  // Severity
  const sevGroup = createElement('div', { className: 'form-group' });
  sevGroup.appendChild(createElement('label', { 'for': 'hazard-sev' }, 'Urgency Level'));
  const sevSelect = createElement('select', { id: 'hazard-sev' });
  sevSelect.appendChild(createElement('option', { value: 'high' }, '🔴 Critical / Impassable'));
  sevSelect.appendChild(createElement('option', { value: 'moderate' }, '🟡 Moderate / Cautious Transit'));
  sevSelect.appendChild(createElement('option', { value: 'low' }, '🟢 Minor Accumulation'));
  sevGroup.appendChild(sevSelect);
  form.appendChild(sevGroup);

  // Details
  const detGroup = createElement('div', { className: 'form-group' });
  detGroup.appendChild(createElement('label', { 'for': 'hazard-details' }, 'Details'));
  detGroup.appendChild(createElement('input', { type: 'text', id: 'hazard-details', placeholder: 'e.g., Water covering knee level', required: 'true' }));
  form.appendChild(detGroup);

  form.appendChild(
    createElement(
      'button',
      {
        type: 'submit',
        className: 'btn btn-primary',
      },
      '📌 Pin Report'
    )
  );

  formPanel.appendChild(form);
  mainGrid.appendChild(formPanel);

  wrapper.appendChild(mainGrid);

  // Reports Feed
  const feedPanel = createElement('div', { className: 'glass-panel community-feed-panel' });
  feedPanel.appendChild(createElement('h3', { className: 'section-title' }, `📢 Recent Citizen Reports (${reports.length})`));

  const list = createElement('div', { className: 'reports-list' });
  for (const rep of reports) {
    const card = createElement('div', { className: `report-card border-${rep.severity}` });

    const topRow = createElement(
      'div',
      { className: 'report-top-row' },
      createElement('strong', { className: 'report-type' }, rep.type),
      createElement('span', { className: `badge badge-${rep.severity}` }, rep.timestamp)
    );
    card.appendChild(topRow);

    card.appendChild(createElement('div', { className: 'report-loc' }, `📍 ${rep.locationName}`));
    card.appendChild(createElement('p', { className: 'report-details' }, rep.details));

    list.appendChild(card);
  }

  feedPanel.appendChild(list);
  wrapper.appendChild(feedPanel);

  container.appendChild(wrapper);
}
