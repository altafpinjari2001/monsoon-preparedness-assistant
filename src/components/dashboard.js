/**
 * Dashboard component - main view with weather, flood risk, and quick stats
 * @module components/dashboard
 */

import { createElement, formatDate } from '../modules/helpers.js';
import { fetchForecast, calculateMonsoonRisk } from '../modules/weather.js';
import { fetchFloodData } from '../modules/flood.js';
import { getOverallProgress, loadChecklist } from '../modules/checklist.js';
import { loadBudget, calculateRemaining, getTotalSpent, getUtilization } from '../modules/budget.js';
import { t, getCurrentLanguage } from '../modules/i18n.js';
import { loadFromStorage } from '../modules/helpers.js';

/**
 * Render the dashboard view.
 * @param {HTMLElement} container
 */
export async function renderDashboard(container) {
  container.textContent = '';
  const lang = getCurrentLanguage();

  const grid = createElement('div', { className: 'dashboard-grid' });

  // Loading state
  const loadingSection = createElement('div', { className: 'dashboard-section glass-panel loading-state' },
    createElement('div', { className: 'loading-skeleton shimmer', 'aria-label': 'Loading weather data' }),
    createElement('p', { className: 'loading-text' }, t('loading', lang))
  );
  grid.appendChild(loadingSection);
  container.appendChild(grid);

  // Load data
  try {
    const location = loadFromStorage('monsoonguard_location', null);
    let coords;
    let locationName = 'Mumbai, India';

    if (location && location.latitude) {
      coords = { latitude: location.latitude, longitude: location.longitude };
      locationName = location.name || 'Your Location';
    } else {
      // Default to Mumbai
      coords = { latitude: 19.076, longitude: 72.8777 };
    }

    const [weatherData, floodData] = await Promise.all([
      fetchForecast(coords.latitude, coords.longitude),
      fetchFloodData(coords.latitude, coords.longitude),
    ]);

    const monsoonRisk = calculateMonsoonRisk(weatherData);
    const checklistProgress = getOverallProgress(loadChecklist());
    const budgetData = loadBudget();

    // Clear loading state
    grid.textContent = '';

    // Build dashboard sections
    renderCurrentWeather(grid, weatherData, locationName, lang);
    renderMonsoonRiskCard(grid, monsoonRisk, lang);
    renderFloodAlert(grid, floodData, lang);
    renderForecast(grid, weatherData, lang);
    renderQuickStats(grid, checklistProgress, budgetData, lang);
    renderEmergencyNumbers(grid, lang);

  } catch (error) {
    grid.textContent = '';
    const errorSection = createElement('div', { className: 'dashboard-section glass-panel' },
      createElement('h2', { className: 'section-title' }, '⚠️ ' + t('noData', lang)),
      createElement('p', {}, error.message || 'Failed to load weather data. Please check your location in Settings.'),
      createElement('button', {
        className: 'btn btn-primary',
        'aria-label': 'Open settings to set location',
        onClick: () => document.getElementById('settings-btn')?.click()
      }, '⚙️ Open Settings')
    );
    grid.appendChild(errorSection);
  }
}

function renderCurrentWeather(container, weatherData, locationName, lang) {
  const { current } = weatherData;
  const section = createElement('div', { className: 'dashboard-section glass-panel current-weather-card' });

  const header = createElement('div', { className: 'section-header' },
    createElement('h2', { className: 'section-title' }, t('currentWeather', lang)),
    createElement('span', { className: 'location-badge' }, `📍 ${locationName}`)
  );
  section.appendChild(header);

  const weatherMain = createElement('div', { className: 'weather-main' });

  const tempDisplay = createElement('div', { className: 'temp-display' },
    createElement('span', { className: 'weather-emoji', 'aria-hidden': 'true' }, current.emoji),
    createElement('span', { className: 'temp-value', 'aria-label': `Temperature ${current.temperature} degrees celsius` }, `${current.temperature}°C`),
    createElement('span', { className: 'weather-desc' }, current.description)
  );
  weatherMain.appendChild(tempDisplay);

  const statsGrid = createElement('div', { className: 'weather-stats-grid' });

  const stats = [
    { label: t('humidity', lang), value: `${current.humidity}%`, icon: '💧' },
    { label: t('windSpeed', lang), value: `${current.windSpeed} km/h`, icon: '💨' },
    { label: t('precipitation', lang), value: `${current.precipitation} mm`, icon: '🌧️' },
  ];

  for (const stat of stats) {
    const statEl = createElement('div', { className: 'weather-stat' },
      createElement('span', { className: 'stat-icon', 'aria-hidden': 'true' }, stat.icon),
      createElement('span', { className: 'stat-value' }, stat.value),
      createElement('span', { className: 'stat-label' }, stat.label)
    );
    statsGrid.appendChild(statEl);
  }

  weatherMain.appendChild(statsGrid);
  section.appendChild(weatherMain);
  container.appendChild(section);
}

function renderMonsoonRiskCard(container, risk, lang) {
  const section = createElement('div', {
    className: `dashboard-section glass-panel alert-card ${risk.level}`,
    role: 'alert',
    'aria-live': 'polite',
  });

  const riskLabels = { low: t('low', lang), moderate: t('moderate', lang), high: t('high', lang), critical: t('critical', lang) };

  const header = createElement('div', { className: 'section-header' },
    createElement('h2', { className: 'section-title' }, t('monsoonRisk', lang)),
    createElement('span', { className: `risk-badge ${risk.level}` }, riskLabels[risk.level] || t('unknown', lang))
  );
  section.appendChild(header);

  // Risk score meter
  const meterContainer = createElement('div', { className: 'risk-meter-container' });
  const meter = createElement('div', { className: 'risk-meter' });
  const fill = createElement('div', {
    className: `risk-meter-fill ${risk.level}`,
    role: 'meter',
    'aria-label': `Monsoon risk score: ${risk.score} out of 100`,
    'aria-valuenow': String(risk.score),
    'aria-valuemin': '0',
    'aria-valuemax': '100',
  });
  fill.style.width = `${risk.score}%`;
  meter.appendChild(fill);
  meterContainer.appendChild(meter);

  const scoreText = createElement('span', { className: 'risk-score-text' }, `${risk.score}/100`);
  meterContainer.appendChild(scoreText);
  section.appendChild(meterContainer);

  if (risk.factors.length > 0) {
    const factorsList = createElement('ul', { className: 'risk-factors' });
    for (const factor of risk.factors) {
      factorsList.appendChild(createElement('li', {}, factor));
    }
    section.appendChild(factorsList);
  }

  container.appendChild(section);
}

function renderFloodAlert(container, floodData, lang) {
  const section = createElement('div', {
    className: `dashboard-section glass-panel alert-card ${floodData.riskLevel}`,
    role: 'alert',
    'aria-live': 'polite',
  });

  const riskLabels = { low: t('low', lang), moderate: t('moderate', lang), high: t('high', lang), critical: t('critical', lang), unknown: t('unknown', lang) };

  const header = createElement('div', { className: 'section-header' },
    createElement('h2', { className: 'section-title' }, `🌊 ${t('floodRisk', lang)}`),
    createElement('span', { className: `risk-badge ${floodData.riskLevel}` }, riskLabels[floodData.riskLevel] || t('unknown', lang))
  );
  section.appendChild(header);

  section.appendChild(createElement('p', { className: 'flood-message' }, floodData.riskMessage));

  if (floodData.maxDischarge > 0) {
    const statsRow = createElement('div', { className: 'flood-stats' },
      createElement('div', { className: 'flood-stat' },
        createElement('span', { className: 'stat-label' }, 'Max Discharge'),
        createElement('span', { className: 'stat-value' }, `${floodData.maxDischarge} m³/s`)
      ),
      createElement('div', { className: 'flood-stat' },
        createElement('span', { className: 'stat-label' }, 'Avg Discharge'),
        createElement('span', { className: 'stat-value' }, `${floodData.avgDischarge} m³/s`)
      )
    );
    section.appendChild(statsRow);
  }

  container.appendChild(section);
}

function renderForecast(container, weatherData, lang) {
  const section = createElement('div', { className: 'dashboard-section glass-panel forecast-section' });

  const header = createElement('div', { className: 'section-header' },
    createElement('h2', { className: 'section-title' }, `📅 ${t('forecast', lang)}`)
  );
  section.appendChild(header);

  const forecastGrid = createElement('div', { className: 'weather-grid' });

  for (const day of weatherData.daily) {
    const dayCard = createElement('div', {
      className: 'forecast-day',
      'aria-label': `${formatDate(day.date)}: ${day.description}, high ${day.tempMax}°C, low ${day.tempMin}°C, ${day.precipitation}mm rain`,
    });

    dayCard.appendChild(createElement('span', { className: 'forecast-date' }, formatDate(day.date)));
    dayCard.appendChild(createElement('span', { className: 'weather-icon', 'aria-hidden': 'true' }, day.emoji));
    dayCard.appendChild(createElement('div', { className: 'temp-range' },
      createElement('span', { className: 'temp-high' }, `${day.tempMax}°`),
      createElement('span', { className: 'temp-low' }, `${day.tempMin}°`)
    ));

    // Precipitation bar
    const precipPercent = Math.min(day.precipProbability, 100);
    const precipBar = createElement('div', { className: 'precipitation-bar' });
    const precipFill = createElement('div', {
      className: 'precip-fill',
      role: 'progressbar',
      'aria-label': `${precipPercent}% chance of rain`,
      'aria-valuenow': String(precipPercent),
      'aria-valuemin': '0',
      'aria-valuemax': '100',
    });
    precipFill.style.width = `${precipPercent}%`;
    precipBar.appendChild(precipFill);
    dayCard.appendChild(precipBar);
    dayCard.appendChild(createElement('span', { className: 'precip-text' }, `${day.precipitation}mm`));

    forecastGrid.appendChild(dayCard);
  }

  section.appendChild(forecastGrid);
  container.appendChild(section);
}

function renderQuickStats(container, checklistProgress, budgetData, lang) {
  const section = createElement('div', { className: 'dashboard-section glass-panel' });

  section.appendChild(createElement('h2', { className: 'section-title' }, '📊 Quick Stats'));

  const statsGrid = createElement('div', { className: 'quick-stats-grid' });

  // Preparedness Progress
  const prepCard = createElement('div', { className: 'stat-card' });
  prepCard.appendChild(createElement('h3', { className: 'stat-card-title' }, t('preparednessProgress', lang)));

  const progressContainer = createElement('div', { className: 'checklist-progress' });
  const progressBar = createElement('div', { className: 'progress-bar' });
  const progressFill = createElement('div', {
    className: 'progress-fill',
    role: 'progressbar',
    'aria-label': `Preparedness progress: ${checklistProgress.percentage}%`,
    'aria-valuenow': String(checklistProgress.percentage),
    'aria-valuemin': '0',
    'aria-valuemax': '100',
  });
  progressFill.style.width = `${checklistProgress.percentage}%`;
  progressBar.appendChild(progressFill);
  progressContainer.appendChild(progressBar);
  progressContainer.appendChild(createElement('span', { className: 'progress-text' },
    `${checklistProgress.checked}/${checklistProgress.total} ${t('itemsCompleted', lang)} (${checklistProgress.percentage}%)`
  ));
  prepCard.appendChild(progressContainer);
  statsGrid.appendChild(prepCard);

  // Budget Status
  const remaining = calculateRemaining(budgetData.budget, budgetData.expenses);
  const utilization = getUtilization(budgetData.budget, budgetData.expenses);
  const budgetCard = createElement('div', { className: `stat-card ${remaining < 0 ? 'danger' : ''}` });
  budgetCard.appendChild(createElement('h3', { className: 'stat-card-title' }, t('budgetOverview', lang)));

  const budgetInfo = createElement('div', { className: 'budget-quick-info' });
  budgetInfo.appendChild(createElement('div', { className: 'budget-stat' },
    createElement('span', { className: 'stat-label' }, t('totalBudget', lang)),
    createElement('span', { className: 'stat-value' }, `₹${budgetData.budget.toLocaleString('en-IN')}`)
  ));
  budgetInfo.appendChild(createElement('div', { className: 'budget-stat' },
    createElement('span', { className: 'stat-label' }, t('spent', lang)),
    createElement('span', { className: 'stat-value' }, `₹${getTotalSpent(budgetData.expenses).toLocaleString('en-IN')}`)
  ));
  budgetInfo.appendChild(createElement('div', { className: `budget-stat ${remaining < 0 ? 'text-danger' : 'text-success'}` },
    createElement('span', { className: 'stat-label' }, t('remaining', lang)),
    createElement('span', { className: 'stat-value' }, `₹${remaining.toLocaleString('en-IN')}`)
  ));

  const budgetMeter = createElement('div', { className: 'budget-meter' });
  const budgetFill = createElement('div', {
    className: `budget-fill ${utilization > 100 ? 'exceeded' : utilization > 75 ? 'warning' : ''}`,
    role: 'meter',
    'aria-label': `Budget utilization: ${utilization}%`,
    'aria-valuenow': String(Math.min(utilization, 100)),
    'aria-valuemin': '0',
    'aria-valuemax': '100',
  });
  budgetFill.style.width = `${Math.min(utilization, 100)}%`;
  budgetMeter.appendChild(budgetFill);

  budgetCard.appendChild(budgetInfo);
  budgetCard.appendChild(budgetMeter);
  statsGrid.appendChild(budgetCard);

  section.appendChild(statsGrid);
  container.appendChild(section);
}

function renderEmergencyNumbers(container, lang) {
  const section = createElement('div', { className: 'dashboard-section glass-panel emergency-section' });

  section.appendChild(createElement('h2', { className: 'section-title' }, `🚨 ${t('emergencyNumbers', lang)}`));

  const numbersGrid = createElement('div', { className: 'emergency-grid' });

  const numbers = [
    { name: 'National Emergency', number: '112', icon: '🆘' },
    { name: 'NDRF Helpline', number: '011-24363260', icon: '🛟' },
    { name: 'Disaster Management', number: '1078', icon: '⚡' },
    { name: 'Ambulance', number: '108', icon: '🚑' },
    { name: 'Fire Brigade', number: '101', icon: '🚒' },
    { name: 'Police', number: '100', icon: '🚔' },
  ];

  for (const item of numbers) {
    const card = createElement('div', { className: 'emergency-card' },
      createElement('span', { className: 'emergency-icon', 'aria-hidden': 'true' }, item.icon),
      createElement('span', { className: 'emergency-name' }, item.name),
      createElement('a', {
        href: `tel:${item.number}`,
        className: 'emergency-number',
        'aria-label': `Call ${item.name} at ${item.number}`,
      }, item.number)
    );
    numbersGrid.appendChild(card);
  }

  section.appendChild(numbersGrid);
  container.appendChild(section);
}
