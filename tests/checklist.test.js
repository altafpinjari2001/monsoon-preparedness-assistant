/**
 * Unit tests for the checklist module
 */

import { describe, it, expect } from 'vitest';
import {
  getDefaultChecklist, toggleItem, getCategoryProgress,
  getOverallProgress, getItemsByPriority, resetChecklist,
} from '../src/modules/checklist.js';

describe('getDefaultChecklist', () => {
  it('should return an array of categories', () => {
    const checklist = getDefaultChecklist();
    expect(Array.isArray(checklist)).toBe(true);
    expect(checklist.length).toBeGreaterThan(0);
  });

  it('should have required fields in each category', () => {
    const checklist = getDefaultChecklist();
    for (const category of checklist) {
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('icon');
      expect(category).toHaveProperty('items');
      expect(Array.isArray(category.items)).toBe(true);
    }
  });

  it('should have required fields in each item', () => {
    const checklist = getDefaultChecklist();
    for (const category of checklist) {
      for (const item of category.items) {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('text');
        expect(item).toHaveProperty('checked');
        expect(item).toHaveProperty('priority');
        expect(typeof item.text).toBe('string');
        expect(typeof item.checked).toBe('boolean');
        expect(['high', 'medium', 'low']).toContain(item.priority);
      }
    }
  });

  it('should have all items unchecked by default', () => {
    const checklist = getDefaultChecklist();
    for (const category of checklist) {
      for (const item of category.items) {
        expect(item.checked).toBe(false);
      }
    }
  });

  it('should have unique IDs for all items', () => {
    const checklist = getDefaultChecklist();
    const allIds = checklist.flatMap(c => c.items.map(i => i.id));
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });
});

describe('toggleItem', () => {
  it('should toggle an item from unchecked to checked', () => {
    const checklist = getDefaultChecklist();
    const categoryId = checklist[0].id;
    const itemId = checklist[0].items[0].id;
    const result = toggleItem(checklist, categoryId, itemId);
    const item = result.find(c => c.id === categoryId).items.find(i => i.id === itemId);
    expect(item.checked).toBe(true);
  });

  it('should toggle an item from checked to unchecked', () => {
    let checklist = getDefaultChecklist();
    const categoryId = checklist[0].id;
    const itemId = checklist[0].items[0].id;
    checklist = toggleItem(checklist, categoryId, itemId); // check
    checklist = toggleItem(checklist, categoryId, itemId); // uncheck
    const item = checklist.find(c => c.id === categoryId).items.find(i => i.id === itemId);
    expect(item.checked).toBe(false);
  });

  it('should not modify other items', () => {
    const checklist = getDefaultChecklist();
    const categoryId = checklist[0].id;
    const itemId = checklist[0].items[0].id;
    const result = toggleItem(checklist, categoryId, itemId);
    // Second item should still be unchecked
    expect(result[0].items[1].checked).toBe(false);
  });

  it('should not mutate the original checklist', () => {
    const checklist = getDefaultChecklist();
    const categoryId = checklist[0].id;
    const itemId = checklist[0].items[0].id;
    toggleItem(checklist, categoryId, itemId);
    expect(checklist[0].items[0].checked).toBe(false);
  });
});

describe('getCategoryProgress', () => {
  it('should return 0% for no items checked', () => {
    const category = { items: [{ checked: false }, { checked: false }] };
    const progress = getCategoryProgress(category);
    expect(progress.percentage).toBe(0);
    expect(progress.checked).toBe(0);
    expect(progress.total).toBe(2);
  });

  it('should return 100% for all items checked', () => {
    const category = { items: [{ checked: true }, { checked: true }] };
    const progress = getCategoryProgress(category);
    expect(progress.percentage).toBe(100);
    expect(progress.checked).toBe(2);
  });

  it('should return 50% for half items checked', () => {
    const category = { items: [{ checked: true }, { checked: false }] };
    const progress = getCategoryProgress(category);
    expect(progress.percentage).toBe(50);
  });

  it('should handle empty items array', () => {
    const category = { items: [] };
    const progress = getCategoryProgress(category);
    expect(progress.percentage).toBe(0);
    expect(progress.total).toBe(0);
  });
});

describe('getOverallProgress', () => {
  it('should calculate across all categories', () => {
    const checklist = [
      { items: [{ checked: true }, { checked: false }] },
      { items: [{ checked: true }, { checked: true }] },
    ];
    const progress = getOverallProgress(checklist);
    expect(progress.checked).toBe(3);
    expect(progress.total).toBe(4);
    expect(progress.percentage).toBe(75);
  });

  it('should return 0% for default checklist', () => {
    const checklist = getDefaultChecklist();
    const progress = getOverallProgress(checklist);
    expect(progress.percentage).toBe(0);
    expect(progress.checked).toBe(0);
    expect(progress.total).toBeGreaterThan(0);
  });
});

describe('getItemsByPriority', () => {
  it('should filter high priority items', () => {
    const checklist = getDefaultChecklist();
    const highItems = getItemsByPriority(checklist, 'high');
    expect(highItems.length).toBeGreaterThan(0);
    for (const entry of highItems) {
      expect(entry.item.priority).toBe('high');
    }
  });

  it('should include category name in results', () => {
    const checklist = getDefaultChecklist();
    const highItems = getItemsByPriority(checklist, 'high');
    for (const entry of highItems) {
      expect(typeof entry.category).toBe('string');
      expect(entry.category.length).toBeGreaterThan(0);
    }
  });

  it('should return empty array for non-existent priority', () => {
    const checklist = getDefaultChecklist();
    const items = getItemsByPriority(checklist, 'ultra');
    expect(items).toEqual([]);
  });
});

describe('resetChecklist', () => {
  it('should uncheck all items', () => {
    let checklist = getDefaultChecklist();
    // Check some items
    checklist = toggleItem(checklist, checklist[0].id, checklist[0].items[0].id);
    checklist = toggleItem(checklist, checklist[1].id, checklist[1].items[0].id);
    // Reset
    const result = resetChecklist(checklist);
    const progress = getOverallProgress(result);
    expect(progress.checked).toBe(0);
  });

  it('should not mutate original', () => {
    let checklist = getDefaultChecklist();
    checklist = toggleItem(checklist, checklist[0].id, checklist[0].items[0].id);
    const before = checklist[0].items[0].checked;
    resetChecklist(checklist);
    expect(checklist[0].items[0].checked).toBe(before);
  });
});
