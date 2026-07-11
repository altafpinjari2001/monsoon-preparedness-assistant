/**
 * Checklist view component - interactive emergency preparedness checklist
 * @module components/checklist-view
 */

import { createElement, showToast } from '../modules/helpers.js';
import {
  loadChecklist, saveChecklist, toggleItem,
  getCategoryProgress, getOverallProgress, resetChecklist,
} from '../modules/checklist.js';
import { t, getCurrentLanguage } from '../modules/i18n.js';
import { generatePreparednessPlan } from '../modules/gemini.js';
import { getActiveProfile } from '../modules/profiles.js';

let currentChecklist = [];

/**
 * Render the checklist view.
 * @param {HTMLElement} container
 */
export function renderChecklist(container) {
  container.textContent = '';
  const lang = getCurrentLanguage();
  currentChecklist = loadChecklist();

  const wrapper = createElement('div', { className: 'checklist-view' });

  // Header with overall progress
  const overallProgress = getOverallProgress(currentChecklist);
  const header = createElement('div', { className: 'glass-panel checklist-header-panel' });

  header.appendChild(createElement('h2', { className: 'section-title' }, `✅ ${t('checklist', lang)}`));

  // Overall progress bar
  const progressSection = createElement('div', { className: 'overall-progress' });
  const progressBar = createElement('div', { className: 'progress-bar progress-bar-large' });
  const progressFill = createElement('div', {
    className: 'progress-fill',
    role: 'progressbar',
    'aria-label': `Overall preparedness: ${overallProgress.percentage}% complete`,
    'aria-valuenow': String(overallProgress.percentage),
    'aria-valuemin': '0',
    'aria-valuemax': '100',
  });
  progressFill.style.width = `${overallProgress.percentage}%`;
  progressBar.appendChild(progressFill);
  progressSection.appendChild(progressBar);
  progressSection.appendChild(createElement('p', { className: 'progress-text-large' },
    `${overallProgress.checked} / ${overallProgress.total} ${t('itemsCompleted', lang)} (${overallProgress.percentage}%)`
  ));
  header.appendChild(progressSection);

  // Buttons Row
  const btnsRow = createElement('div', { className: 'checklist-actions-row' });

  // Generate AI Plan Button
  const genBtn = createElement(
    'button',
    {
      className: 'btn btn-primary',
      id: 'generate-ai-plan-btn',
      onClick: async () => {
        showToast('Generating AI Personalized Preparedness Plan...', 'info');
        try {
          const profile = getActiveProfile();
          const aiPlan = await generatePreparednessPlan(profile);
          const formattedChecklist = [
            { id: 'documents', name: 'Documents & Essentials', icon: '📄', items: aiPlan.documents || [] },
            { id: 'supplies', name: 'Supplies & Rations', icon: '🎒', items: aiPlan.supplies || [] },
            { id: 'homeSafety', name: 'Home & Structural Safety', icon: '🏠', items: aiPlan.homeSafety || [] },
            { id: 'health', name: 'Health & Medical', icon: '🏥', items: aiPlan.health || [] },
            { id: 'communication', name: 'Communication & Power', icon: '📱', items: aiPlan.communication || [] },
          ];
          saveChecklist(formattedChecklist);
          renderChecklist(container);
          showToast('Personalized Preparedness Plan loaded!', 'success');
        } catch (err) {
          console.error(err);
          showToast('Could not generate plan. Please check API settings.', 'error');
        }
      },
    },
    '✨ Generate AI Personalized Plan'
  );
  btnsRow.appendChild(genBtn);

  // Reset button
  const resetBtn = createElement('button', {
    className: 'btn btn-secondary',
    'aria-label': 'Reset all checklist items',
    id: 'reset-checklist-btn',
    onClick: () => {
      currentChecklist = resetChecklist(currentChecklist);
      saveChecklist(currentChecklist);
      renderChecklist(container);
      showToast('Checklist has been reset', 'info');
    },
  }, `🔄 ${t('reset', lang)}`);
  btnsRow.appendChild(resetBtn);

  header.appendChild(btnsRow);
  wrapper.appendChild(header);

  // Category sections
  for (const category of currentChecklist) {
    const categorySection = renderCategory(category, container);
    wrapper.appendChild(categorySection);
  }

  container.appendChild(wrapper);
}

function renderCategory(category, rootContainer) {
  const progress = getCategoryProgress(category);

  const section = createElement('div', { className: 'glass-panel checklist-category' });

  // Category header using details/summary for accessibility
  const details = createElement('details', { className: 'category-details' });
  details.setAttribute('open', '');

  const summary = createElement('summary', { className: 'category-header' });

  const titleRow = createElement('div', { className: 'category-title-row' },
    createElement('span', { className: 'category-icon', 'aria-hidden': 'true' }, category.icon),
    createElement('h3', { className: 'category-name' }, category.name),
    createElement('span', { className: 'category-badge' }, `${progress.checked}/${progress.total}`)
  );
  summary.appendChild(titleRow);

  // Category progress bar
  const catProgress = createElement('div', { className: 'progress-bar progress-bar-small' });
  const catFill = createElement('div', {
    className: 'progress-fill',
    role: 'progressbar',
    'aria-label': `${category.name}: ${progress.percentage}% complete`,
    'aria-valuenow': String(progress.percentage),
    'aria-valuemin': '0',
    'aria-valuemax': '100',
  });
  catFill.style.width = `${progress.percentage}%`;
  catProgress.appendChild(catFill);
  summary.appendChild(catProgress);

  details.appendChild(summary);

  // Items list
  const itemsList = createElement('ul', { className: 'checklist-items', 'aria-label': `${category.name} checklist items` });

  for (const item of category.items) {
    const li = createElement('li', { className: `checklist-item ${item.checked ? 'checked' : ''} priority-${item.priority}` });

    const checkbox = createElement('input', {
      type: 'checkbox',
      id: `check-${item.id}`,
      className: 'checklist-checkbox',
      'aria-label': `${item.text} - Priority: ${item.priority}`,
    });
    checkbox.checked = item.checked;
    checkbox.addEventListener('change', () => {
      currentChecklist = toggleItem(currentChecklist, category.id, item.id);
      saveChecklist(currentChecklist);
      renderChecklist(rootContainer);
    });

    const label = createElement('label', {
      'for': `check-${item.id}`,
      className: 'checklist-label',
    }, item.text);

    const priorityBadge = createElement('span', {
      className: `priority-badge ${item.priority}`,
      'aria-label': `Priority: ${item.priority}`,
    }, item.priority);

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(priorityBadge);
    itemsList.appendChild(li);
  }

  details.appendChild(itemsList);
  section.appendChild(details);

  return section;
}
