/**
 * Safe DOM manipulation helpers - prevents XSS by never using innerHTML
 * @module helpers
 */

/**
 * Creates a DOM element with attributes and children, safely.
 * @param {string} tag - HTML tag name
 * @param {Object} attrs - Attributes to set (class, id, aria-*, data-*, etc.)
 * @param {...(string|Node)} children - Text strings or DOM nodes to append
 * @returns {HTMLElement}
 */
export function createElement(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'textContent') {
      el.textContent = value;
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'dataset') {
      for (const [dk, dv] of Object.entries(value)) {
        el.dataset[dk] = dv;
      }
    } else {
      el.setAttribute(key, value);
    }
  }
  for (const child of children) {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  }
  return el;
}

/**
 * Sanitizes user input string by stripping HTML tags and trimming.
 * @param {string} input - Raw user input
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * Safely sets text content of an element.
 * @param {HTMLElement} el - Target element
 * @param {string} text - Text to set
 */
export function setTextContent(el, text) {
  if (el && typeof text === 'string') {
    el.textContent = text;
  }
}

/**
 * Formats a number as currency (INR by default).
 * @param {number} amount
 * @param {string} currency - Currency code
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a date string to readable format.
 * @param {string} dateStr - ISO date string
 * @param {string} locale
 * @returns {string}
 */
export function formatDate(dateStr, locale = 'en-IN') {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Debounce function for event handlers.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Gets weather icon SVG string based on WMO weather code.
 * @param {number} code - WMO weather code
 * @returns {string} Weather description
 */
export function getWeatherDescription(code) {
  const descriptions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return descriptions[code] || 'Unknown';
}

/**
 * Returns a weather emoji based on WMO code.
 * @param {number} code
 * @returns {string}
 */
export function getWeatherEmoji(code) {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌦️';
  if (code <= 65) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌧️';
  if (code <= 86) return '🌨️';
  if (code >= 95) return '⛈️';
  return '🌤️';
}

/**
 * Shows a toast notification.
 * @param {string} message
 * @param {'success'|'warning'|'error'|'info'} type
 * @param {number} duration - in ms
 */
export function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = createElement('div', { className: `toast ${type}`, role: 'alert' },
    createElement('span', { className: 'toast-message' }, message)
  );
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Stores data in localStorage safely.
 * @param {string} key
 * @param {*} value
 */
export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage save failed:', e);
  }
}

/**
 * Retrieves data from localStorage.
 * @param {string} key
 * @param {*} defaultValue
 * @returns {*}
 */
export function loadFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn('Storage load failed:', e);
    return defaultValue;
  }
}
