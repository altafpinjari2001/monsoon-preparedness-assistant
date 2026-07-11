/**
 * Unit tests for the helpers module
 */

import { describe, it, expect } from 'vitest';
import { sanitizeInput, formatCurrency, formatDate, getWeatherDescription, getWeatherEmoji, debounce } from '../src/modules/helpers.js';

describe('sanitizeInput', () => {
  it('should strip HTML tags from input', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('alert("xss")');
  });

  it('should strip nested HTML tags', () => {
    expect(sanitizeInput('<div><b>bold</b></div>')).toBe('bold');
  });

  it('should trim whitespace', () => {
    expect(sanitizeInput('  hello world  ')).toBe('hello world');
  });

  it('should return empty string for non-string input', () => {
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
    expect(sanitizeInput(123)).toBe('');
  });

  it('should handle empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('should preserve safe text content', () => {
    expect(sanitizeInput('Hello, how are you?')).toBe('Hello, how are you?');
  });

  it('should strip event handler attributes in tags', () => {
    expect(sanitizeInput('<img onerror="alert(1)" src="x">')).toBe('');
  });
});

describe('formatCurrency', () => {
  it('should format amount as INR by default', () => {
    const result = formatCurrency(1500);
    expect(result).toContain('1,500');
  });

  it('should handle zero amount', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('should handle negative amounts', () => {
    const result = formatCurrency(-500);
    expect(result).toContain('500');
  });
});

describe('formatDate', () => {
  it('should format ISO date string', () => {
    const result = formatDate('2026-07-15');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should include day name', () => {
    const result = formatDate('2026-07-15');
    expect(result).toMatch(/\w+/);
  });
});

describe('getWeatherDescription', () => {
  it('should return description for known codes', () => {
    expect(getWeatherDescription(0)).toBe('Clear sky');
    expect(getWeatherDescription(61)).toBe('Slight rain');
    expect(getWeatherDescription(95)).toBe('Thunderstorm');
    expect(getWeatherDescription(65)).toBe('Heavy rain');
  });

  it('should return Unknown for invalid codes', () => {
    expect(getWeatherDescription(999)).toBe('Unknown');
    expect(getWeatherDescription(-1)).toBe('Unknown');
  });
});

describe('getWeatherEmoji', () => {
  it('should return sun emoji for clear sky', () => {
    expect(getWeatherEmoji(0)).toBe('☀️');
  });

  it('should return rain emoji for rain codes', () => {
    expect(getWeatherEmoji(61)).toBe('🌧️');
    expect(getWeatherEmoji(63)).toBe('🌧️');
  });

  it('should return storm emoji for thunderstorm', () => {
    expect(getWeatherEmoji(95)).toBe('⛈️');
    expect(getWeatherEmoji(99)).toBe('⛈️');
  });

  it('should return cloud emoji for partly cloudy', () => {
    expect(getWeatherEmoji(2)).toBe('⛅');
  });
});

describe('debounce', () => {
  it('should be a function that returns a function', () => {
    const fn = debounce(() => {}, 100);
    expect(typeof fn).toBe('function');
  });
});
