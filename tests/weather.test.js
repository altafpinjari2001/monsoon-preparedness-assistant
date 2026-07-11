/**
 * Unit tests for the weather module
 */

import { describe, it, expect } from 'vitest';
import { parseWeatherData, calculateMonsoonRisk } from '../src/modules/weather.js';

describe('parseWeatherData', () => {
  it('should parse raw API data into structured format', () => {
    const raw = {
      current: {
        temperature_2m: 28.5,
        relative_humidity_2m: 85,
        weathercode: 63,
        windspeed_10m: 18.2,
        precipitation: 12.4,
      },
      daily: {
        time: ['2026-07-15', '2026-07-16'],
        temperature_2m_max: [31.0, 29.5],
        temperature_2m_min: [24.0, 23.8],
        precipitation_sum: [45.0, 15.2],
        precipitation_probability_max: [80, 40],
        weathercode: [65, 61],
        windspeed_10m_max: [35.0, 20.0],
      },
    };

    const parsed = parseWeatherData(raw);
    expect(parsed.current.temperature).toBe(28.5);
    expect(parsed.current.humidity).toBe(85);
    expect(parsed.current.description).toBe('Moderate rain');
    expect(parsed.daily).toHaveLength(2);
    expect(parsed.daily[0].tempMax).toBe(31.0);
    expect(parsed.daily[0].precipitation).toBe(45.0);
  });

  it('should handle missing fields gracefully', () => {
    const parsed = parseWeatherData({});
    expect(parsed.current.temperature).toBe('--');
    expect(parsed.daily).toEqual([]);
  });
});

describe('calculateMonsoonRisk', () => {
  it('should calculate low risk for clear weather', () => {
    const weatherData = {
      daily: [
        { precipitation: 0, windSpeed: 10, weatherCode: 0 },
        { precipitation: 2, windSpeed: 12, weatherCode: 1 },
      ],
    };
    const risk = calculateMonsoonRisk(weatherData);
    expect(risk.level).toBe('low');
    expect(risk.score).toBeLessThan(20);
  });

  it('should calculate critical risk for extreme rainfall and wind', () => {
    const weatherData = {
      daily: [
        { precipitation: 60, windSpeed: 65, weatherCode: 95 },
        { precipitation: 50, windSpeed: 45, weatherCode: 95 },
        { precipitation: 40, windSpeed: 30, weatherCode: 95 },
      ],
    };
    const risk = calculateMonsoonRisk(weatherData);
    expect(risk.level).toBe('critical');
    expect(risk.score).toBeGreaterThanOrEqual(60);
    expect(risk.factors.length).toBeGreaterThan(0);
  });
});
