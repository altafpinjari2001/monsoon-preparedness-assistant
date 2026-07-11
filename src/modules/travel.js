/**
 * Pune Localities Travel Advisory Module
 * Calculates weather-aware route risk between Pune localities.
 * @module modules/travel
 */

export const PUNE_LOCALITIES = [
  { name: 'Shivaji Nagar', lat: 18.5314, lon: 73.8446, floodProne: true, riskReason: 'Low-lying underpasses & Mutha riverside proximity' },
  { name: 'Kothrud', lat: 18.5074, lon: 73.8077, floodProne: true, riskReason: 'Karve Road drain bottlenecks & Bhide bridge flooding' },
  { name: 'Hinjewadi Phase 1', lat: 18.5913, lon: 73.7389, floodProne: false, riskReason: 'Wakad flyover & IT park traffic choke points during heavy rain' },
  { name: 'Baner', lat: 18.559, lon: 73.7868, floodProne: false, riskReason: 'Ram Nadi overflow risk near Baner road' },
  { name: 'Wakad', lat: 18.5987, lon: 73.765, floodProne: false, riskReason: 'Highway service road waterlogging' },
  { name: 'Hadapsar', lat: 18.5089, lon: 73.926, floodProne: true, riskReason: 'Solapur highway low-lying stretch & canal overflow' },
  { name: 'Viman Nagar', lat: 18.5679, lon: 73.9143, floodProne: false, riskReason: 'Airport road waterlogging during sudden cloudbursts' },
  { name: 'Sinhagad Road', lat: 18.4735, lon: 73.8302, floodProne: true, riskReason: 'Direct Khadakwasla dam Mutha riverside overflow zone' },
  { name: 'Camp / MG Road', lat: 18.5158, lon: 73.8772, floodProne: false, riskReason: 'Old tree fall risks and narrow cantonment drains' },
  { name: 'Swargate', lat: 18.5018, lon: 73.8636, floodProne: true, riskReason: 'Jedhe Chowk underpass water accumulation' },
  { name: 'Pimpri-Chinchwad (PCMC)', lat: 18.6298, lon: 73.7997, floodProne: true, riskReason: 'Pavana river discharge inundation zones' },
];

/**
 * Calculate route safety advisory between source and destination.
 * @param {string} sourceName
 * @param {string} destName
 * @param {Object} weather - Current Open-Meteo weather object
 * @returns {Object}
 */
export function calculateRouteAdvisory(sourceName, destName, weather = {}) {
  const source = PUNE_LOCALITIES.find((l) => l.name === sourceName) || PUNE_LOCALITIES[0];
  const dest = PUNE_LOCALITIES.find((l) => l.name === destName) || PUNE_LOCALITIES[1];

  const rainMm = weather.precipitation || 0;
  const windKmh = weather.windSpeed || 0;

  let riskLevel = 'LOW';
  let colorClass = 'text-success';
  let advice = 'Route is clear for normal transit. Drive cautiously.';

  const isEitherFloodProne = source.floodProne || dest.floodProne;

  if (rainMm > 15 || windKmh > 50) {
    riskLevel = 'CRITICAL';
    colorClass = 'text-danger';
    advice = `CRITICAL ALERT: Heavy rain (${rainMm} mm) and wind squalls (${windKmh} km/h). Avoid non-essential travel between ${source.name} and ${dest.name}. Underpasses and river bridges may be closed.`;
  } else if (rainMm > 5 || isEitherFloodProne) {
    riskLevel = 'MODERATE';
    colorClass = 'text-warning';
    advice = `MODERATE CAUTION: Expect slow movement and localized waterlogging around ${isEitherFloodProne ? source.floodProne ? source.name : dest.name : 'low-lying junctions'}. Avoid low-clearance 2-wheelers.`;
  }

  const routeDetails = [
    `• Source (${source.name}): ${source.riskReason}`,
    `• Destination (${dest.name}): ${dest.riskReason}`,
    `• Meteorological Factor: Precipitation rate ${rainMm} mm/h | Gust speed ${windKmh} km/h`,
  ];

  return {
    source: source.name,
    destination: dest.name,
    riskLevel,
    colorClass,
    advice,
    routeDetails,
  };
}
