/**
 * Flood monitoring module - uses Open-Meteo Flood API
 * @module flood
 */

const FLOOD_API = 'https://flood-api.open-meteo.com/v1/flood';

/**
 * Fetch river discharge forecast data.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<Object>} Parsed flood data
 */
export async function fetchFloodData(latitude, longitude) {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      daily: 'river_discharge',
      forecast_days: '7',
    });
    const response = await fetch(`${FLOOD_API}?${params}`);
    if (!response.ok) throw new Error(`Flood API error: ${response.status}`);
    const data = await response.json();
    return parseFloodData(data);
  } catch (error) {
    console.error('Flood data fetch error:', error);
    // Return safe default when API fails
    return {
      dischargeValues: [],
      maxDischarge: 0,
      avgDischarge: 0,
      riskLevel: 'unknown',
      riskMessage: 'Flood data unavailable for this location.',
    };
  }
}

/**
 * Parse raw flood API response.
 * @param {Object} raw
 * @returns {Object}
 */
export function parseFloodData(raw) {
  const dischargeValues = raw.daily?.river_discharge || [];
  const validValues = dischargeValues.filter(v => v !== null && v !== undefined);
  
  if (validValues.length === 0) {
    return {
      dischargeValues: [],
      maxDischarge: 0,
      avgDischarge: 0,
      riskLevel: 'unknown',
      riskMessage: 'No river discharge data available for this location.',
    };
  }

  const maxDischarge = Math.max(...validValues);
  const avgDischarge = validValues.reduce((a, b) => a + b, 0) / validValues.length;
  const riskLevel = calculateFloodRisk(maxDischarge);

  return {
    dischargeValues: validValues,
    dates: raw.daily?.time || [],
    maxDischarge: Math.round(maxDischarge * 100) / 100,
    avgDischarge: Math.round(avgDischarge * 100) / 100,
    riskLevel: riskLevel.level,
    riskMessage: riskLevel.message,
  };
}

/**
 * Calculate flood risk based on river discharge.
 * Uses general thresholds (actual thresholds vary by river).
 * @param {number} discharge - Max river discharge in m³/s
 * @returns {{level: string, message: string}}
 */
export function calculateFloodRisk(discharge) {
  if (discharge >= 5000) {
    return {
      level: 'critical',
      message: 'CRITICAL: Extremely high river discharge detected. Severe flooding possible. Evacuate low-lying areas immediately.',
    };
  }
  if (discharge >= 2000) {
    return {
      level: 'high',
      message: 'HIGH RISK: Significant river discharge levels. Flooding likely in flood-prone areas. Prepare for evacuation.',
    };
  }
  if (discharge >= 500) {
    return {
      level: 'moderate',
      message: 'MODERATE: Elevated river discharge. Monitor conditions closely. Prepare emergency supplies.',
    };
  }
  return {
    level: 'low',
    message: 'LOW: Normal river discharge levels. No immediate flood risk. Stay prepared for monsoon season.',
  };
}
