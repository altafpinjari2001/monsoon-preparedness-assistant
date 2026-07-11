/**
 * Budget planner view component
 * @module components/budget-view
 */

import { createElement, formatCurrency, showToast } from '../modules/helpers.js';
import {
  loadBudget, saveBudget, setBudget, addExpense, removeExpense,
  calculateRemaining, getTotalSpent, getCategoryBreakdown,
  getUtilization, isBudgetExceeded, SUGGESTED_ITEMS,
} from '../modules/budget.js';
import { t, getCurrentLanguage } from '../modules/i18n.js';

let budgetData = {};

/**
 * Render the budget planner view.
 * @param {HTMLElement} container
 */
export function renderBudget(container) {
  container.textContent = '';
  const lang = getCurrentLanguage();
  budgetData = loadBudget();

  const wrapper = createElement('div', { className: 'budget-view' });

  // Budget Overview Card
  renderBudgetOverview(wrapper, lang);

  // Add Expense Form
  renderAddExpenseForm(wrapper, container, lang);

  // Suggested Items
  renderSuggestedItems(wrapper, container, lang);

  // Expense List
  renderExpenseList(wrapper, container, lang);

  // Category Breakdown
  renderCategoryBreakdown(wrapper);

  container.appendChild(wrapper);
}

function renderBudgetOverview(wrapper, lang) {
  const remaining = calculateRemaining(budgetData.budget, budgetData.expenses);
  const spent = getTotalSpent(budgetData.expenses);
  const utilization = getUtilization(budgetData.budget, budgetData.expenses);
  const exceeded = isBudgetExceeded(budgetData.budget, budgetData.expenses);

  const section = createElement('div', { className: 'glass-panel budget-overview' });
  section.appendChild(createElement('h2', { className: 'section-title' }, `💰 ${t('budgetOverview', lang)}`));

  // Budget Input
  const budgetInputGroup = createElement('div', { className: 'budget-input-group' });
  const budgetLabel = createElement('label', { 'for': 'total-budget-input' }, t('totalBudget', lang));
  const budgetInput = createElement('input', {
    type: 'number',
    id: 'total-budget-input',
    className: 'budget-input',
    'aria-label': 'Set total budget amount in rupees',
    min: '0',
    step: '500',
  });
  budgetInput.value = budgetData.budget;
  budgetInput.addEventListener('change', (e) => {
    budgetData = setBudget(budgetData, e.target.value);
    saveBudget(budgetData);
    const overviewEl = wrapper.closest('.budget-view');
    if (overviewEl) renderBudget(overviewEl.parentElement);
  });
  budgetInputGroup.appendChild(budgetLabel);
  budgetInputGroup.appendChild(budgetInput);
  section.appendChild(budgetInputGroup);

  // Stats Row
  const statsRow = createElement('div', { className: 'budget-stats-row' });

  const statItems = [
    { label: t('totalBudget', lang), value: formatCurrency(budgetData.budget), class: '' },
    { label: t('spent', lang), value: formatCurrency(spent), class: 'text-warning' },
    { label: t('remaining', lang), value: formatCurrency(remaining), class: exceeded ? 'text-danger' : 'text-success' },
  ];

  for (const stat of statItems) {
    statsRow.appendChild(createElement('div', { className: `budget-stat ${stat.class}` },
      createElement('span', { className: 'stat-label' }, stat.label),
      createElement('span', { className: 'stat-value' }, stat.value)
    ));
  }
  section.appendChild(statsRow);

  // Budget Meter
  const meter = createElement('div', { className: 'budget-meter' });
  const fill = createElement('div', {
    className: `budget-fill ${exceeded ? 'exceeded' : utilization > 75 ? 'warning' : ''}`,
    role: 'meter',
    'aria-label': `Budget utilization: ${utilization}%`,
    'aria-valuenow': String(Math.min(utilization, 100)),
    'aria-valuemin': '0',
    'aria-valuemax': '100',
  });
  fill.style.width = `${Math.min(utilization, 100)}%`;
  meter.appendChild(fill);
  section.appendChild(meter);
  section.appendChild(createElement('p', { className: 'utilization-text' }, `${utilization}% utilized`));

  wrapper.appendChild(section);
}

function renderAddExpenseForm(wrapper, rootContainer, lang) {
  const section = createElement('div', { className: 'glass-panel expense-add-form' });
  section.appendChild(createElement('h3', { className: 'section-title' }, `➕ ${t('addExpense', lang)}`));

  const form = createElement('form', { className: 'expense-form' });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = form.querySelector('#expense-name');
    const costInput = form.querySelector('#expense-cost');
    const categorySelect = form.querySelector('#expense-category');

    try {
      budgetData = addExpense(
        budgetData,
        nameInput.value,
        costInput.value,
        categorySelect.value
      );
      saveBudget(budgetData);
      renderBudget(rootContainer);
      showToast('Expense added successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Name input
  const nameGroup = createElement('div', { className: 'form-group' });
  nameGroup.appendChild(createElement('label', { 'for': 'expense-name' }, t('expenseName', lang)));
  nameGroup.appendChild(createElement('input', {
    type: 'text',
    id: 'expense-name',
    required: 'true',
    placeholder: 'e.g., First Aid Kit',
    'aria-label': 'Expense name',
  }));
  form.appendChild(nameGroup);

  // Cost input
  const costGroup = createElement('div', { className: 'form-group' });
  costGroup.appendChild(createElement('label', { 'for': 'expense-cost' }, t('expenseCost', lang)));
  costGroup.appendChild(createElement('input', {
    type: 'number',
    id: 'expense-cost',
    required: 'true',
    min: '1',
    placeholder: '500',
    'aria-label': 'Expense cost in rupees',
  }));
  form.appendChild(costGroup);

  // Category select
  const catGroup = createElement('div', { className: 'form-group' });
  catGroup.appendChild(createElement('label', { 'for': 'expense-category' }, t('expenseCategory', lang)));
  const select = createElement('select', { id: 'expense-category', 'aria-label': 'Expense category' });
  const categories = ['Water & Food', 'Medical', 'Safety', 'Communication', 'Transport', 'Other'];
  for (const cat of categories) {
    select.appendChild(createElement('option', { value: cat }, cat));
  }
  catGroup.appendChild(select);
  form.appendChild(catGroup);

  form.appendChild(createElement('button', {
    type: 'submit',
    className: 'btn btn-primary',
    'aria-label': 'Add expense',
  }, t('addExpense', lang)));

  section.appendChild(form);
  wrapper.appendChild(section);
}

function renderSuggestedItems(wrapper, rootContainer, lang) {
  const section = createElement('div', { className: 'glass-panel' });
  section.appendChild(createElement('h3', { className: 'section-title' }, `💡 ${t('suggestedItems', lang)}`));

  const grid = createElement('div', { className: 'suggested-items-grid' });

  for (const item of SUGGESTED_ITEMS) {
    const itemCard = createElement('button', {
      className: 'suggested-item btn btn-secondary',
      'aria-label': `Add ${item.name} for ${formatCurrency(item.cost)}`,
      onClick: () => {
        try {
          budgetData = addExpense(budgetData, item.name, item.cost, item.category);
          saveBudget(budgetData);
          renderBudget(rootContainer);
          showToast(`Added: ${item.name}`, 'success');
        } catch (err) {
          showToast(err.message, 'error');
        }
      },
    },
      createElement('span', { className: 'suggested-name' }, item.name),
      createElement('span', { className: 'suggested-cost' }, formatCurrency(item.cost))
    );
    grid.appendChild(itemCard);
  }

  section.appendChild(grid);
  wrapper.appendChild(section);
}

function renderExpenseList(wrapper, rootContainer, lang) {
  const section = createElement('div', { className: 'glass-panel' });
  section.appendChild(createElement('h3', { className: 'section-title' }, `📋 Expenses (${budgetData.expenses.length})`));

  if (budgetData.expenses.length === 0) {
    section.appendChild(createElement('p', { className: 'empty-state' }, t('noExpenses', lang)));
    wrapper.appendChild(section);
    return;
  }

  const list = createElement('ul', { className: 'expense-list', 'aria-label': 'List of expenses' });
  const fragment = document.createDocumentFragment();

  for (const expense of budgetData.expenses) {
    const item = createElement('li', { className: 'expense-item' });

    const info = createElement('div', { className: 'expense-info' },
      createElement('span', { className: 'expense-name-text' }, expense.name),
      createElement('span', { className: 'expense-category-tag' }, expense.category)
    );
    item.appendChild(info);

    const actions = createElement('div', { className: 'expense-actions' },
      createElement('span', { className: 'expense-cost-text' }, formatCurrency(expense.cost)),
      createElement('button', {
        className: 'btn btn-danger btn-small',
        'aria-label': `Remove expense: ${expense.name}`,
        onClick: () => {
          budgetData = removeExpense(budgetData, expense.id);
          saveBudget(budgetData);
          renderBudget(rootContainer);
          showToast(`Removed: ${expense.name}`, 'info');
        },
      }, '✕')
    );
    item.appendChild(actions);

    fragment.appendChild(item);
  }
  
  list.appendChild(fragment);
  section.appendChild(list);
  wrapper.appendChild(section);
}

function renderCategoryBreakdown(wrapper) {
  if (budgetData.expenses.length === 0) return;

  const section = createElement('div', { className: 'glass-panel' });
  section.appendChild(createElement('h3', { className: 'section-title' }, '📊 Category Breakdown'));

  const breakdown = getCategoryBreakdown(budgetData.expenses);
  const total = getTotalSpent(budgetData.expenses);
  const breakdownList = createElement('div', { className: 'category-breakdown' });

  for (const [category, amount] of Object.entries(breakdown).sort((a, b) => b[1] - a[1])) {
    const percent = total > 0 ? Math.round((amount / total) * 100) : 0;
    const row = createElement('div', { className: 'breakdown-row' });

    row.appendChild(createElement('div', { className: 'breakdown-header' },
      createElement('span', { className: 'breakdown-category' }, category),
      createElement('span', { className: 'breakdown-amount' }, `${formatCurrency(amount)} (${percent}%)`)
    ));

    const bar = createElement('div', { className: 'progress-bar progress-bar-small' });
    const barFill = createElement('div', {
      className: 'progress-fill',
      role: 'progressbar',
      'aria-label': `${category}: ${percent}% of total spending`,
      'aria-valuenow': String(percent),
      'aria-valuemin': '0',
      'aria-valuemax': '100',
    });
    barFill.style.width = `${percent}%`;
    bar.appendChild(barFill);
    row.appendChild(bar);

    breakdownList.appendChild(row);
  }

  section.appendChild(breakdownList);
  wrapper.appendChild(section);
}
