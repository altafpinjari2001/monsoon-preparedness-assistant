/**
 * Unit tests for the budget module
 */

import { describe, it, expect } from 'vitest';
import {
  calculateRemaining, addExpense, removeExpense,
  getTotalSpent, getCategoryBreakdown, getUtilization,
  isBudgetExceeded, setBudget, SUGGESTED_ITEMS,
} from '../src/modules/budget.js';

describe('calculateRemaining', () => {
  it('should calculate remaining budget correctly', () => {
    const expenses = [
      { id: '1', name: 'Water', cost: 500, category: 'Food' },
      { id: '2', name: 'Kit', cost: 800, category: 'Medical' },
    ];
    expect(calculateRemaining(5000, expenses)).toBe(3700);
  });

  it('should return full budget when no expenses', () => {
    expect(calculateRemaining(10000, [])).toBe(10000);
  });

  it('should return negative when over budget', () => {
    const expenses = [{ id: '1', name: 'Expensive', cost: 15000, category: 'Other' }];
    expect(calculateRemaining(10000, expenses)).toBe(-5000);
  });

  it('should return zero when exactly at budget', () => {
    const expenses = [{ id: '1', name: 'Item', cost: 5000, category: 'Other' }];
    expect(calculateRemaining(5000, expenses)).toBe(0);
  });

  it('should handle empty expenses array', () => {
    expect(calculateRemaining(0, [])).toBe(0);
  });
});

describe('addExpense', () => {
  it('should add a valid expense', () => {
    const data = { budget: 10000, expenses: [] };
    const result = addExpense(data, 'First Aid Kit', 800, 'Medical');
    expect(result.expenses).toHaveLength(1);
    expect(result.expenses[0].name).toBe('First Aid Kit');
    expect(result.expenses[0].cost).toBe(800);
    expect(result.expenses[0].category).toBe('Medical');
  });

  it('should throw error for empty name', () => {
    const data = { budget: 10000, expenses: [] };
    expect(() => addExpense(data, '', 100)).toThrow('Expense name is required');
  });

  it('should throw error for zero cost', () => {
    const data = { budget: 10000, expenses: [] };
    expect(() => addExpense(data, 'Item', 0)).toThrow('Cost must be greater than 0');
  });

  it('should throw error for negative cost', () => {
    const data = { budget: 10000, expenses: [] };
    expect(() => addExpense(data, 'Item', -100)).toThrow('Cost must be greater than 0');
  });

  it('should sanitize HTML in expense name', () => {
    const data = { budget: 10000, expenses: [] };
    const result = addExpense(data, '<script>alert("xss")</script>Water', 500);
    expect(result.expenses[0].name).not.toContain('<script>');
  });

  it('should generate unique IDs', () => {
    let data = { budget: 10000, expenses: [] };
    data = addExpense(data, 'Item 1', 100);
    data = addExpense(data, 'Item 2', 200);
    expect(data.expenses[0].id).not.toBe(data.expenses[1].id);
  });

  it('should default category to Other', () => {
    const data = { budget: 10000, expenses: [] };
    const result = addExpense(data, 'Test', 100);
    expect(result.expenses[0].category).toBe('Other');
  });
});

describe('removeExpense', () => {
  it('should remove an expense by ID', () => {
    const data = {
      budget: 10000,
      expenses: [
        { id: 'a1', name: 'Water', cost: 500, category: 'Food' },
        { id: 'b2', name: 'Kit', cost: 800, category: 'Medical' },
      ],
    };
    const result = removeExpense(data, 'a1');
    expect(result.expenses).toHaveLength(1);
    expect(result.expenses[0].id).toBe('b2');
  });

  it('should return same data if ID not found', () => {
    const data = { budget: 10000, expenses: [{ id: 'a1', name: 'Water', cost: 500, category: 'Food' }] };
    const result = removeExpense(data, 'nonexistent');
    expect(result.expenses).toHaveLength(1);
  });
});

describe('getTotalSpent', () => {
  it('should sum all expense costs', () => {
    const expenses = [
      { id: '1', name: 'A', cost: 100, category: 'X' },
      { id: '2', name: 'B', cost: 250, category: 'Y' },
      { id: '3', name: 'C', cost: 350, category: 'Z' },
    ];
    expect(getTotalSpent(expenses)).toBe(700);
  });

  it('should return 0 for empty array', () => {
    expect(getTotalSpent([])).toBe(0);
  });
});

describe('getCategoryBreakdown', () => {
  it('should group expenses by category', () => {
    const expenses = [
      { id: '1', name: 'A', cost: 100, category: 'Food' },
      { id: '2', name: 'B', cost: 200, category: 'Medical' },
      { id: '3', name: 'C', cost: 300, category: 'Food' },
    ];
    const breakdown = getCategoryBreakdown(expenses);
    expect(breakdown.Food).toBe(400);
    expect(breakdown.Medical).toBe(200);
  });

  it('should handle expenses without category', () => {
    const expenses = [{ id: '1', name: 'A', cost: 100 }];
    const breakdown = getCategoryBreakdown(expenses);
    expect(breakdown.Other).toBe(100);
  });
});

describe('getUtilization', () => {
  it('should calculate percentage correctly', () => {
    const expenses = [{ id: '1', name: 'A', cost: 2500, category: 'X' }];
    expect(getUtilization(10000, expenses)).toBe(25);
  });

  it('should return 0 for zero budget', () => {
    expect(getUtilization(0, [])).toBe(0);
  });

  it('should handle over 100% utilization', () => {
    const expenses = [{ id: '1', name: 'A', cost: 15000, category: 'X' }];
    expect(getUtilization(10000, expenses)).toBe(150);
  });
});

describe('isBudgetExceeded', () => {
  it('should return true when over budget', () => {
    const expenses = [{ id: '1', name: 'A', cost: 15000, category: 'X' }];
    expect(isBudgetExceeded(10000, expenses)).toBe(true);
  });

  it('should return false when under budget', () => {
    const expenses = [{ id: '1', name: 'A', cost: 5000, category: 'X' }];
    expect(isBudgetExceeded(10000, expenses)).toBe(false);
  });

  it('should return false when exactly at budget', () => {
    const expenses = [{ id: '1', name: 'A', cost: 10000, category: 'X' }];
    expect(isBudgetExceeded(10000, expenses)).toBe(false);
  });
});

describe('setBudget', () => {
  it('should update budget amount', () => {
    const data = { budget: 5000, expenses: [] };
    const result = setBudget(data, 15000);
    expect(result.budget).toBe(15000);
  });

  it('should handle negative values by clamping to 0', () => {
    const data = { budget: 5000, expenses: [] };
    const result = setBudget(data, -1000);
    expect(result.budget).toBe(0);
  });

  it('should handle NaN by setting to 0', () => {
    const data = { budget: 5000, expenses: [] };
    const result = setBudget(data, 'not a number');
    expect(result.budget).toBe(0);
  });
});

describe('SUGGESTED_ITEMS', () => {
  it('should contain items with required fields', () => {
    expect(SUGGESTED_ITEMS.length).toBeGreaterThan(0);
    for (const item of SUGGESTED_ITEMS) {
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('cost');
      expect(item).toHaveProperty('category');
      expect(typeof item.name).toBe('string');
      expect(typeof item.cost).toBe('number');
      expect(item.cost).toBeGreaterThan(0);
    }
  });
});
