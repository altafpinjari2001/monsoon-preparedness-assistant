/**
 * User Onboarding & Pune Demo Profiles Management
 * @module modules/profiles
 */

import { saveToStorage, loadFromStorage } from './helpers.js';

export const PUNE_DEMO_PROFILES = [
  {
    id: 'ramesh_kothrud',
    name: 'Ramesh & Family (Kothrud near Mutha River)',
    location: 'Kothrud, Pune',
    pincode: '411038',
    latitude: 18.5074,
    longitude: 73.8077,
    householdType: 'independent_house',
    floor: 'ground',
    familySize: 5,
    vulnerableMembers: ['elderly', 'pets'],
    vehicleOwnership: 'car_bike',
    language: 'mr',
    description: 'Ground floor independent house near Mutha riverside. Extreme flood vulnerability during Khadakwasla dam discharge.',
  },
  {
    id: 'priya_hinjewadi',
    name: 'Priya (IT Professional, Hinjewadi Apartment)',
    location: 'Hinjewadi Phase 1, Pune',
    pincode: '411057',
    latitude: 18.5913,
    longitude: 73.7389,
    householdType: 'apartment',
    floor: 'upper',
    familySize: 2,
    vulnerableMembers: [],
    vehicleOwnership: 'car',
    language: 'en',
    description: 'Upper floor high-rise apartment. High wind squalls exposure & daily commute waterlogging risk.',
  },
  {
    id: 'vikram_sinhagad',
    name: 'Vikram (Sinhagad Road Low-Lying Area)',
    location: 'Sinhagad Road, Pune',
    pincode: '411051',
    latitude: 18.4735,
    longitude: 73.8302,
    householdType: 'independent_house',
    floor: 'ground',
    familySize: 4,
    vulnerableMembers: ['children'],
    vehicleOwnership: 'bike',
    language: 'hi',
    description: 'Low-lying ground settlement. Rapid river inundation & power outage risk.',
  },
  {
    id: 'sunita_shivajinagar',
    name: 'Sunita (Senior Citizen, Shivaji Nagar)',
    location: 'Shivaji Nagar, Pune',
    pincode: '411005',
    latitude: 18.5314,
    longitude: 73.8446,
    householdType: 'apartment',
    floor: 'ground',
    familySize: 1,
    vulnerableMembers: ['elderly', 'disabled', 'medical'],
    vehicleOwnership: 'none',
    language: 'en',
    description: 'Single senior citizen with mobility challenges and essential prescription medicine needs.',
  },
];

const DEFAULT_PROFILE = {
  name: 'Pune Citizen',
  location: 'Shivaji Nagar, Pune',
  pincode: '411005',
  latitude: 18.5314,
  longitude: 73.8446,
  householdType: 'apartment',
  floor: 'ground',
  familySize: 4,
  vulnerableMembers: ['elderly'],
  vehicleOwnership: 'car',
  language: 'en',
};

/**
 * Get current active user onboarding profile from storage.
 * @returns {Object}
 */
export function getActiveProfile() {
  return loadFromStorage('monsoonmitra_user_profile', DEFAULT_PROFILE);
}

/**
 * Save user onboarding profile to storage.
 * @param {Object} profile
 */
export function saveActiveProfile(profile) {
  saveToStorage('monsoonmitra_user_profile', {
    ...DEFAULT_PROFILE,
    ...profile,
  });
}

/**
 * Switch active profile to one of the demo profiles.
 * @param {string} profileId
 * @returns {Object|null}
 */
export function selectDemoProfile(profileId) {
  const found = PUNE_DEMO_PROFILES.find((p) => p.id === profileId);
  if (!found) return null;
  saveActiveProfile(found);
  return found;
}
