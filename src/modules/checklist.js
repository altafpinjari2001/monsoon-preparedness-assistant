/**
 * Emergency preparedness checklist module
 * @module checklist
 */

import { saveToStorage, loadFromStorage } from './helpers.js';

const STORAGE_KEY = 'monsoonguard_checklist';

/**
 * Default checklist categories and items.
 * @returns {Array<{id: string, name: string, icon: string, items: Array<{id: string, text: string, checked: boolean, priority: string}>}>}
 */
export function getDefaultChecklist() {
  return [
    {
      id: 'water-food',
      name: 'Water & Food Supplies',
      icon: '💧',
      items: [
        { id: 'wf1', text: 'Store 4 liters of drinking water per person per day (7-day supply)', checked: false, priority: 'high' },
        { id: 'wf2', text: 'Stock non-perishable food items (rice, dal, canned goods)', checked: false, priority: 'high' },
        { id: 'wf3', text: 'Water purification tablets or filter', checked: false, priority: 'high' },
        { id: 'wf4', text: 'Manual can opener', checked: false, priority: 'medium' },
        { id: 'wf5', text: 'Cooking fuel (gas cylinder/stove)', checked: false, priority: 'medium' },
        { id: 'wf6', text: 'Baby food/formula (if applicable)', checked: false, priority: 'high' },
        { id: 'wf7', text: 'Pet food (if applicable)', checked: false, priority: 'medium' },
      ],
    },
    {
      id: 'documents',
      name: 'Important Documents',
      icon: '📄',
      items: [
        { id: 'doc1', text: 'Aadhaar cards (waterproof copies)', checked: false, priority: 'high' },
        { id: 'doc2', text: 'Insurance policies (home, health, vehicle)', checked: false, priority: 'high' },
        { id: 'doc3', text: 'Property documents in waterproof bag', checked: false, priority: 'high' },
        { id: 'doc4', text: 'Bank passbooks and ATM cards', checked: false, priority: 'medium' },
        { id: 'doc5', text: 'Digital copies on cloud storage', checked: false, priority: 'medium' },
        { id: 'doc6', text: 'Emergency contact list (printed)', checked: false, priority: 'high' },
      ],
    },
    {
      id: 'first-aid',
      name: 'First Aid & Medical',
      icon: '🏥',
      items: [
        { id: 'fa1', text: 'First aid kit (bandages, antiseptic, scissors)', checked: false, priority: 'high' },
        { id: 'fa2', text: 'Prescription medications (30-day supply)', checked: false, priority: 'high' },
        { id: 'fa3', text: 'ORS packets and electrolyte solutions', checked: false, priority: 'high' },
        { id: 'fa4', text: 'Mosquito repellent and nets', checked: false, priority: 'medium' },
        { id: 'fa5', text: 'Anti-diarrheal and anti-fever medicines', checked: false, priority: 'medium' },
        { id: 'fa6', text: 'Waterproof bandages', checked: false, priority: 'low' },
      ],
    },
    {
      id: 'shelter',
      name: 'Shelter & Safety',
      icon: '🏠',
      items: [
        { id: 'sh1', text: 'Identify nearest flood shelter / elevated area', checked: false, priority: 'high' },
        { id: 'sh2', text: 'Waterproof tarpaulin sheets', checked: false, priority: 'medium' },
        { id: 'sh3', text: 'Sandbags for doorways (if in flood zone)', checked: false, priority: 'medium' },
        { id: 'sh4', text: 'Secure outdoor furniture and loose items', checked: false, priority: 'medium' },
        { id: 'sh5', text: 'Clear drains and gutters around home', checked: false, priority: 'high' },
        { id: 'sh6', text: 'Move valuables to upper floors', checked: false, priority: 'high' },
      ],
    },
    {
      id: 'communication',
      name: 'Communication & Power',
      icon: '📱',
      items: [
        { id: 'cm1', text: 'Fully charged power banks', checked: false, priority: 'high' },
        { id: 'cm2', text: 'Battery-powered or hand-crank radio', checked: false, priority: 'medium' },
        { id: 'cm3', text: 'Flashlights with extra batteries', checked: false, priority: 'high' },
        { id: 'cm4', text: 'Candles and waterproof matches', checked: false, priority: 'medium' },
        { id: 'cm5', text: 'Emergency numbers saved (NDRF: 011-24363260)', checked: false, priority: 'high' },
        { id: 'cm6', text: 'Whistle for signaling', checked: false, priority: 'low' },
      ],
    },
    {
      id: 'transport',
      name: 'Transportation & Evacuation',
      icon: '🚗',
      items: [
        { id: 'tr1', text: 'Vehicle fuel tank full', checked: false, priority: 'high' },
        { id: 'tr2', text: 'Know 2+ evacuation routes from your area', checked: false, priority: 'high' },
        { id: 'tr3', text: 'Emergency go-bag packed and accessible', checked: false, priority: 'high' },
        { id: 'tr4', text: 'Rain gear (raincoats, gumboots, umbrellas)', checked: false, priority: 'medium' },
        { id: 'tr5', text: 'Life jackets (if in severe flood zone)', checked: false, priority: 'medium' },
        { id: 'tr6', text: 'Rope (30+ feet, nylon)', checked: false, priority: 'low' },
      ],
    },
  ];
}

/**
 * Load saved checklist or return defaults.
 * @returns {Array}
 */
export function loadChecklist() {
  const saved = loadFromStorage(STORAGE_KEY);
  if (saved && Array.isArray(saved)) return saved;
  return getDefaultChecklist();
}

/**
 * Save checklist to localStorage.
 * @param {Array} checklist
 */
export function saveChecklist(checklist) {
  saveToStorage(STORAGE_KEY, checklist);
}

/**
 * Toggle a checklist item's checked state.
 * @param {Array} checklist
 * @param {string} categoryId
 * @param {string} itemId
 * @returns {Array} Updated checklist
 */
export function toggleItem(checklist, categoryId, itemId) {
  return checklist.map(category => {
    if (category.id !== categoryId) return category;
    return {
      ...category,
      items: category.items.map(item => {
        if (item.id !== itemId) return item;
        return { ...item, checked: !item.checked };
      }),
    };
  });
}

/**
 * Calculate progress for a category.
 * @param {Object} category
 * @returns {{checked: number, total: number, percentage: number}}
 */
export function getCategoryProgress(category) {
  const total = category.items.length;
  const checked = category.items.filter(i => i.checked).length;
  return {
    checked,
    total,
    percentage: total > 0 ? Math.round((checked / total) * 100) : 0,
  };
}

/**
 * Calculate overall progress across all categories.
 * @param {Array} checklist
 * @returns {{checked: number, total: number, percentage: number}}
 */
export function getOverallProgress(checklist) {
  let checked = 0;
  let total = 0;
  for (const category of checklist) {
    for (const item of category.items) {
      total++;
      if (item.checked) checked++;
    }
  }
  return {
    checked,
    total,
    percentage: total > 0 ? Math.round((checked / total) * 100) : 0,
  };
}

/**
 * Get items filtered by priority.
 * @param {Array} checklist
 * @param {string} priority - 'high', 'medium', or 'low'
 * @returns {Array<{category: string, item: Object}>}
 */
export function getItemsByPriority(checklist, priority) {
  const results = [];
  for (const category of checklist) {
    for (const item of category.items) {
      if (item.priority === priority) {
        results.push({ category: category.name, item });
      }
    }
  }
  return results;
}

/**
 * Reset all items to unchecked.
 * @param {Array} checklist
 * @returns {Array}
 */
export function resetChecklist(checklist) {
  return checklist.map(category => ({
    ...category,
    items: category.items.map(item => ({ ...item, checked: false })),
  }));
}
