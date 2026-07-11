/**
 * Simulated Real-Time UI Alert Engine (Before / During / After phase alerts)
 * @module modules/alert-engine
 */

/**
 * Evaluate phase alert status from live weather metrics.
 * @param {Object} weather - Open-Meteo current conditions
 * @param {Object} flood - River discharge / flood probability
 * @returns {Array<Object>}
 */
export function evaluatePhaseAlerts(weather = {}, flood = {}) {
  const alerts = [];
  const rain = weather.precipitation || 0;
  const wind = weather.windSpeed || 0;
  const discharge = flood.discharge || 0;

  // 1. DURING EVENT ALERT
  if (rain > 12 || wind > 45 || discharge > 15000) {
    alerts.push({
      id: 'during-heavy-rain',
      phase: 'DURING EVENT',
      severity: 'CRITICAL',
      title: '🚨 Active Severe Monsoon Event in Pune',
      description: `Live rainfall at ${rain} mm/h with wind gusts up to ${wind} km/h. River discharge at ${discharge} cusecs. Stay indoors on upper floors. Do not attempt to cross submerged roads or Bhide Bridge.`,
      action: 'Check Emergency Action Checklist immediately.',
    });
  }

  // 2. BEFORE EVENT ALERT (Precautionary warning)
  if (rain > 3 && rain <= 12) {
    alerts.push({
      id: 'before-monsoon-spell',
      phase: 'BEFORE EVENT',
      severity: 'MODERATE',
      title: '⚠️ Approaching Moderate/Heavy Rain Advisory',
      description: `Rainfall rate increasing (${rain} mm/h). Prepare emergency drinking water, charge flashlights/power banks, and elevate ground-floor electronics.`,
      action: 'Inspect balcony drainage & window seals.',
    });
  }

  // 3. AFTER EVENT ALERT (Post-storm health & sanitation)
  alerts.push({
    id: 'after-event-health',
    phase: 'AFTER EVENT / ONGOING',
    severity: 'ADVISORY',
    title: '🏥 Post-Rainfall Sanitation & Leptospirosis Advisory',
    description: 'Avoid wading through stagnant water. Boil drinking water for 10 minutes and eliminate standing water in coolers/pots to prevent Dengue mosquito breeding.',
    action: 'Review Health & Medical RAG Guidelines.',
  });

  return alerts;
}
