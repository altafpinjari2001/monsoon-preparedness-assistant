/**
 * Budget planner module for monsoon preparedness expenses
 * @module budget
 */

import { saveToStorage, loadFromStorage, sanitizeInput } from './helpers.js';

const STORAGE_KEY = 'monsoonguard_budget';

/**
 * Default suggested items with estimated costs (INR).
 */
export const SUGGESTED_ITEMS = [
  { category: 'Water & Food', name: 'Drinking water (7-day supply)', cost: 500 },
  { category: 'Water & Food', name: 'Non-perishable food kit', cost: 2000 },
  { category: 'Water & Food', name: 'Water purification tablets', cost: 150 },
  { category: 'Medical', name: 'First aid kit', cost: 800 },
  { category: 'Medical', name: 'Prescription medicines (30-day)', cost: 1500 },
  { category: 'Medical', name: 'ORS packets (pack of 10)', cost: 100 },
  { category: 'Medical', name: 'Mosquito nets', cost: 400 },
  { category: 'Safety', name: 'Flashlight with batteries', cost: 350 },
  { category: 'Safety', name: 'Power bank (20000 mAh)', cost: 1200 },
  { category: 'Safety', name: 'Waterproof tarpaulin', cost: 600 },
  { category: 'Safety', name: 'Sandbags (pack of 10)', cost: 500 },
  { category: 'Safety', name: 'Rain gear set (2 people)', cost: 800 },
  { category: 'Communication', name: 'Battery-powered radio', cost: 700 },
  { category: 'Communication', name: 'Emergency whistle', cost: 100 },
  { category: 'Transport', name: 'Emergency go-bag', cost: 1500 },
  { category: 'Transport', name: 'Vehicle fuel top-up', cost: 2000 },
];

/**
 * Load saved budget data.
 * @returns {{budget: number, expenses: Array<{id: string, name: string, cost: number, category: string}>}}
 */
export function loadBudget() {
  const saved = loadFromStorage(STORAGE_KEY);
  if (saved && typeof saved === 'object') return saved;
  return { budget: 10000, expenses: [] };
}

/**
 * Save budget data.
 * @param {Object} budgetData
 */
export function saveBudget(budgetData) {
  saveToStorage(STORAGE_KEY, budgetData);
}

/**
 * Set the total budget amount.
 * @param {Object} budgetData
 * @param {number} amount
 * @returns {Object} Updated budget data
 */
export function setBudget(budgetData, amount) {
  const sanitizedAmount = Math.max(0, Math.round(Number(amount) || 0));
  return { ...budgetData, budget: sanitizedAmount };
}

/**
 * Add an expense item.
 * @param {Object} budgetData
 * @param {string} name
 * @param {number} cost
 * @param {string} category
 * @returns {Object} Updated budget data
 */
export function addExpense(budgetData, name, cost, category = 'Other') {
  const sanitizedName = sanitizeInput(name);
  if (!sanitizedName) throw new Error('Expense name is required');
  const sanitizedCost = Math.max(0, Math.round(Number(cost) || 0));
  if (sanitizedCost <= 0) throw new Error('Cost must be greater than 0');

  const expense = {
    id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: sanitizedName,
    cost: sanitizedCost,
    category: sanitizeInput(category) || 'Other',
  };
  return {
    ...budgetData,
    expenses: [...budgetData.expenses, expense],
  };
}

/**
 * Remove an expense by ID.
 * @param {Object} budgetData
 * @param {string} expenseId
 * @returns {Object} Updated budget data
 */
export function removeExpense(budgetData, expenseId) {
  return {
    ...budgetData,
    expenses: budgetData.expenses.filter(e => e.id !== expenseId),
  };
}

/**
 * Calculate remaining budget.
 * @param {number} budget
 * @param {Array} expenses
 * @returns {number}
 */
export function calculateRemaining(budget, expenses) {
  const totalSpent = expenses.reduce((sum, e) => sum + (e.cost || 0), 0);
  return budget - totalSpent;
}

/**
 * Get total amount spent.
 * @param {Array} expenses
 * @returns {number}
 */
export function getTotalSpent(expenses) {
  return expenses.reduce((sum, e) => sum + (e.cost || 0), 0);
}

/**
 * Get spending breakdown by category.
 * @param {Array} expenses
 * @returns {Object<string, number>}
 */
export function getCategoryBreakdown(expenses) {
  const breakdown = {};
  for (const expense of expenses) {
    const cat = expense.category || 'Other';
    breakdown[cat] = (breakdown[cat] || 0) + expense.cost;
  }
  return breakdown;
}

/**
 * Get budget utilization percentage.
 * @param {number} budget
 * @param {Array} expenses
 * @returns {number} Percentage 0-100+
 */
export function getUtilization(budget, expenses) {
  if (budget <= 0) return 0;
  const spent = getTotalSpent(expenses);
  return Math.round((spent / budget) * 100);
}

/**
 * Check if budget is exceeded.
 * @param {number} budget
 * @param {Array} expenses
 * @returns {boolean}
 */
export function isBudgetExceeded(budget, expenses) {
  return calculateRemaining(budget, expenses) < 0;
}
