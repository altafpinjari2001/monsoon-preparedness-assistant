/**
 * Citizen Community Waterlogging & Hazard Reporting Map Module
 * @module modules/community-map
 */

import { saveToStorage, loadFromStorage } from './helpers.js';

export const INITIAL_REPORTS = [
  {
    id: 'rep_1',
    type: 'Waterlogging (6+ inches)',
    locationName: 'Bhide Bridge, Deccan Gymkhana',
    lat: 18.5173,
    lon: 73.8415,
    timestamp: '25 mins ago',
    details: 'River water overflowing over bridge carriageway. Police barricaded.',
    severity: 'high',
  },
  {
    id: 'rep_2',
    type: 'Blocked Drain / Overflow',
    locationName: 'Jedhe Chowk Underpass, Swargate',
    lat: 18.5018,
    lon: 73.8636,
    timestamp: '1 hour ago',
    details: 'Stormwater drain overflowing causing 1 foot water stagnation.',
    severity: 'moderate',
  },
  {
    id: 'rep_3',
    type: 'Fallen Tree Branch',
    locationName: 'Karve Road near Kothrud Stand',
    lat: 18.5074,
    lon: 73.8077,
    timestamp: '2 hours ago',
    details: 'Old banyan branch partially blocking left carriageway.',
    severity: 'moderate',
  },
];

/**
 * Get all community hazard reports.
 * @returns {Array<Object>}
 */
export function getCommunityReports() {
  return loadFromStorage('monsoonmitra_community_reports', INITIAL_REPORTS);
}

/**
 * Add a new community report.
 * @param {Object} report
 * @returns {Array<Object>}
 */
export function addCommunityReport(report) {
  const current = getCommunityReports();
  const newReport = {
    id: 'rep_' + Date.now(),
    timestamp: 'Just now',
    ...report,
  };
  const updated = [newReport, ...current];
  saveToStorage('monsoonmitra_community_reports', updated);
  return updated;
}
