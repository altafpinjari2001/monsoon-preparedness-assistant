/**
 * AI Advisor chat component - Gemini-powered monsoon advisor
 * @module components/advisor-view
 */

import { createElement, sanitizeInput, showToast, loadFromStorage } from '../modules/helpers.js';
import { sendMessage, isApiConfigured } from '../modules/gemini.js';
import { t, getCurrentLanguage } from '../modules/i18n.js';

const chatHistory = [];
let isProcessing = false;

/**
 * Render the AI advisor chat view.
 * @param {HTMLElement} container
 */
export function renderAdvisor(container) {
  container.textContent = '';
  const lang = getCurrentLanguage();

  const wrapper = createElement('div', { className: 'advisor-view' });

  // Header
  const header = createElement('div', { className: 'glass-panel advisor-header' });
  header.appendChild(createElement('h2', { className: 'section-title' }, `🤖 ${t('advisor', lang)}`));

  if (!isApiConfigured()) {
    const hint = createElement('div', { className: 'api-hint', role: 'alert' },
      createElement('span', { className: 'hint-icon', 'aria-hidden': 'true' }, '💡'),
      createElement('p', {},
        'Add your free Gemini API key in Settings for personalized AI responses. Without a key, you\'ll get helpful pre-built guidance.'
      )
    );
    header.appendChild(hint);
  } else {
    header.appendChild(createElement('p', { className: 'api-status connected' }, '✅ Gemini AI Connected'));
  }
  wrapper.appendChild(header);

  // Quick action buttons
  const quickActions = createElement('div', { className: 'quick-actions' });
  const actions = [
    { text: '🌊 Flood Safety Tips', prompt: 'What should I do to prepare for flooding in my area?' },
    { text: '✅ Preparation Checklist', prompt: 'Create a detailed monsoon preparation checklist for my family' },
    { text: '💰 Budget Planning', prompt: 'Help me plan a budget for monsoon preparedness supplies' },
    { text: '🚗 Travel Advisory', prompt: 'What are the travel safety tips during monsoon season?' },
    { text: '🏥 Health Precautions', prompt: 'What health precautions should I take during monsoon?' },
    { text: '📱 Emergency Contacts', prompt: 'List all important emergency numbers and resources for monsoon disasters in India' },
  ];

  for (const action of actions) {
    const btn = createElement('button', {
      className: 'btn btn-secondary quick-action-btn',
      'aria-label': action.text,
      onClick: () => handleSendMessage(action.prompt),
    }, action.text);
    quickActions.appendChild(btn);
  }
  wrapper.appendChild(quickActions);

  // Chat messages area
  const chatContainer = createElement('div', {
    className: 'glass-panel chat-container',
    id: 'chat-container',
  });

  const messagesArea = createElement('div', {
    className: 'chat-messages',
    id: 'chat-messages',
    'aria-label': 'Chat messages',
    'aria-live': 'polite',
    role: 'log',
  });

  // Welcome message or restore history
  if (chatHistory.length === 0) {
    const welcomeMsg = createElement('div', { className: 'chat-message ai' },
      createElement('div', { className: 'message-avatar', 'aria-hidden': 'true' }, '🤖'),
      createElement('div', { className: 'message-content' },
        createElement('p', { className: 'message-text' }, t('welcomeMessage', lang))
      )
    );
    messagesArea.appendChild(welcomeMsg);
  } else {
    for (const msg of chatHistory) {
      messagesArea.appendChild(createMessageBubble(msg.role, msg.text));
    }
  }

  chatContainer.appendChild(messagesArea);

  // Input area
  const inputArea = createElement('div', { className: 'chat-input-area' });

  const inputLabel = createElement('label', { 'for': 'chat-input', className: 'visually-hidden' }, 'Type your question about monsoon preparedness');
  inputArea.appendChild(inputLabel);

  const chatInput = createElement('input', {
    type: 'text',
    id: 'chat-input',
    className: 'chat-input',
    placeholder: t('chatPlaceholder', lang),
    'aria-label': 'Type your question about monsoon preparedness',
    autocomplete: 'off',
  });

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(chatInput.value);
      chatInput.value = '';
    }
  });
  inputArea.appendChild(chatInput);

  const sendBtn = createElement('button', {
    className: 'btn btn-primary chat-send-btn',
    id: 'chat-send-btn',
    'aria-label': 'Send message',
    onClick: () => {
      handleSendMessage(chatInput.value);
      chatInput.value = '';
    },
  }, t('send', lang));
  inputArea.appendChild(sendBtn);

  chatContainer.appendChild(inputArea);
  wrapper.appendChild(chatContainer);

  container.appendChild(wrapper);
}

/**
 * Handle sending a message.
 * @param {string} message
 */
async function handleSendMessage(message) {
  const sanitized = sanitizeInput(message);
  if (!sanitized || isProcessing) return;

  isProcessing = true;
  const messagesArea = document.getElementById('chat-messages');
  const sendBtn = document.getElementById('chat-send-btn');

  if (sendBtn) sendBtn.disabled = true;

  // Add user message
  chatHistory.push({ role: 'user', text: sanitized });
  messagesArea.appendChild(createMessageBubble('user', sanitized));

  // Add typing indicator
  const typingIndicator = createElement('div', { className: 'chat-message ai typing', id: 'typing-indicator' },
    createElement('div', { className: 'message-avatar', 'aria-hidden': 'true' }, '🤖'),
    createElement('div', { className: 'message-content' },
      createElement('div', { className: 'typing-indicator', 'aria-label': 'AI is thinking' },
        createElement('span', { className: 'typing-dot' }),
        createElement('span', { className: 'typing-dot' }),
        createElement('span', { className: 'typing-dot' })
      )
    )
  );
  messagesArea.appendChild(typingIndicator);
  scrollToBottom(messagesArea);

  try {
    // Build context
    const location = loadFromStorage('monsoonguard_location', {});
    const familySize = loadFromStorage('monsoonguard_family_size', 4);
    const vulnerabilities = loadFromStorage('monsoonguard_vulnerabilities', []);
    const lang = getCurrentLanguage();

    const context = {
      location: location.name || 'Not specified',
      familySize,
      vulnerabilities,
      weather: 'Check dashboard for current conditions',
      floodRisk: 'Check dashboard for current risk level',
      language: lang,
    };

    const response = await sendMessage(sanitized, context, chatHistory);

    // Remove typing indicator
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();

    // Add AI response
    chatHistory.push({ role: 'model', text: response });
    messagesArea.appendChild(createMessageBubble('ai', response));

  } catch (error) {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();

    messagesArea.appendChild(createMessageBubble('ai', `⚠️ Error: ${error.message}. Please try again.`));
    showToast(error.message, 'error');
  }

  isProcessing = false;
  if (sendBtn) sendBtn.disabled = false;
  scrollToBottom(messagesArea);

  // Focus back on input
  const chatInput = document.getElementById('chat-input');
  if (chatInput) chatInput.focus();
}

/**
 * Create a chat message bubble.
 * @param {'user'|'ai'} role
 * @param {string} text
 * @returns {HTMLElement}
 */
function createMessageBubble(role, text) {
  const isUser = role === 'user';
  const bubble = createElement('div', { className: `chat-message ${isUser ? 'user' : 'ai'}` });

  if (!isUser) {
    bubble.appendChild(createElement('div', { className: 'message-avatar', 'aria-hidden': 'true' }, '🤖'));
  }

  const content = createElement('div', { className: 'message-content' });

  // Parse simple markdown-like formatting safely
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.startsWith('# ')) {
      content.appendChild(createElement('h3', { className: 'message-heading' }, line.slice(2)));
    } else if (line.startsWith('## ') || line.startsWith('**') && line.endsWith('**')) {
      const cleanText = line.replace(/^##\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '');
      content.appendChild(createElement('h4', { className: 'message-subheading' }, cleanText));
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      content.appendChild(createElement('p', { className: 'message-list-item' }, `• ${line.slice(2)}`));
    } else if (line.match(/^\d+\.\s/)) {
      content.appendChild(createElement('p', { className: 'message-list-item' }, line));
    } else if (line.startsWith('|')) {
      // Simple table row - render as text
      content.appendChild(createElement('p', { className: 'message-table-row' }, line));
    } else if (line.trim() === '') {
      content.appendChild(createElement('br'));
    } else {
      // Clean bold/italic markers from plain text
      const cleanLine = line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
      content.appendChild(createElement('p', { className: 'message-text' }, cleanLine));
    }
  }

  bubble.appendChild(content);

  if (isUser) {
    bubble.appendChild(createElement('div', { className: 'message-avatar user-avatar', 'aria-hidden': 'true' }, '👤'));
  }

  return bubble;
}

function scrollToBottom(element) {
  requestAnimationFrame(() => {
    element.scrollTop = element.scrollHeight;
  });
}
