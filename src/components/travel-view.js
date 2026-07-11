/**
 * Pune Localities Travel Advisory view component
 * @module components/travel-view
 */

import { createElement } from '../modules/helpers.js';
import { PUNE_LOCALITIES, calculateRouteAdvisory } from '../modules/travel.js';

let selectedSource = PUNE_LOCALITIES[0].name;
let selectedDest = PUNE_LOCALITIES[2].name;

/**
 * Render the travel advisory view.
 * @param {HTMLElement} container
 * @param {Object} [weatherData]
 */
export function renderTravel(container, weatherData = {}) {
  container.textContent = '';

  const wrapper = createElement('div', { className: 'travel-view' });

  // Header
  const header = createElement('div', { className: 'glass-panel travel-header' });
  header.appendChild(createElement('h2', { className: 'section-title' }, '🚗 Pune Localities Travel Advisory'));
  header.appendChild(
    createElement(
      'p',
      { className: 'section-subtitle' },
      'Select your commute source and destination across Pune for weather-aware route safety & waterlogging risk guidance.'
    )
  );
  wrapper.appendChild(header);

  // Selector Panel
  const formPanel = createElement('div', { className: 'glass-panel travel-selector-panel' });

  const formGrid = createElement('div', { className: 'route-select-grid' });

  // Source Selector
  const sourceGroup = createElement('div', { className: 'form-group' });
  sourceGroup.appendChild(createElement('label', { 'for': 'route-source' }, '📍 Source Locality'));
  const sourceSelect = createElement('select', { id: 'route-source', className: 'route-select' });
  for (const loc of PUNE_LOCALITIES) {
    const opt = createElement('option', { value: loc.name }, `${loc.name} ${loc.floodProne ? '(Low-Lying)' : ''}`);
    if (loc.name === selectedSource) opt.selected = true;
    sourceSelect.appendChild(opt);
  }
  sourceSelect.addEventListener('change', (e) => {
    selectedSource = e.target.value;
    renderTravel(container, weatherData);
  });
  sourceGroup.appendChild(sourceSelect);
  formGrid.appendChild(sourceGroup);

  // Arrow
  formGrid.appendChild(createElement('div', { className: 'route-arrow', 'aria-hidden': 'true' }, '➡️'));

  // Dest Selector
  const destGroup = createElement('div', { className: 'form-group' });
  destGroup.appendChild(createElement('label', { 'for': 'route-dest' }, '🏁 Destination Locality'));
  const destSelect = createElement('select', { id: 'route-dest', className: 'route-select' });
  for (const loc of PUNE_LOCALITIES) {
    const opt = createElement('option', { value: loc.name }, `${loc.name} ${loc.floodProne ? '(Low-Lying)' : ''}`);
    if (loc.name === selectedDest) opt.selected = true;
    destSelect.appendChild(opt);
  }
  destSelect.addEventListener('change', (e) => {
    selectedDest = e.target.value;
    renderTravel(container, weatherData);
  });
  destGroup.appendChild(destSelect);
  formGrid.appendChild(destGroup);

  formPanel.appendChild(formGrid);
  wrapper.appendChild(formPanel);

  // Calculate & Display Advisory
  const advisory = calculateRouteAdvisory(selectedSource, selectedDest, weatherData);

  const resultCard = createElement('div', { className: `glass-panel route-result-card border-${advisory.riskLevel.toLowerCase()}` });

  const titleRow = createElement(
    'div',
    { className: 'route-result-header' },
    createElement('h3', { className: 'route-title' }, `${advisory.source}  ↔  ${advisory.destination}`),
    createElement('span', { className: `badge badge-${advisory.riskLevel.toLowerCase()}` }, `${advisory.riskLevel} RISK`)
  );
  resultCard.appendChild(titleRow);

  resultCard.appendChild(createElement('p', { className: `route-advice-main ${advisory.colorClass}` }, advisory.advice));

  const detailsList = createElement('ul', { className: 'route-details-list' });
  for (const detail of advisory.routeDetails) {
    detailsList.appendChild(createElement('li', { className: 'route-detail-item' }, detail));
  }
  resultCard.appendChild(detailsList);

  wrapper.appendChild(resultCard);
  container.appendChild(wrapper);
}
