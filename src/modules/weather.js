/**
 * Weather module - fetches forecast data from Open-Meteo API
 * @module weather
 */

import { getWeatherDescription, getWeatherEmoji } from './helpers.js';

const FORECAST_API = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';

/**
 * Geocode a city name to coordinates.
 * @param {string} cityName
 * @returns {Promise<{latitude: number, longitude: number, name: string, country: string}>}
 */
export async function geocodeCity(cityName) {
  try {
    const url = `${GEOCODING_API}?name=${encodeURIComponent(cityName)}&count=1&language=en`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Geocoding failed: ${response.status}`);
    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      throw new Error('City not found');
    }
    const result = data.results[0];
    return {
      latitude: result.latitude,
      longitude: result.longitude,
      name: result.name,
      country: result.country,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

/**
 * Fetch 7-day weather forecast.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<Object>} Parsed forecast data
 */
export async function fetchForecast(latitude, longitude) {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,windspeed_10m_max,precipitation_probability_max',
      current: 'temperature_2m,relative_humidity_2m,weathercode,windspeed_10m,precipitation',
      timezone: 'auto',
      forecast_days: '7',
    });
    const response = await fetch(`${FORECAST_API}?${params}`);
    if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
    const data = await response.json();
    return parseWeatherData(data);
  } catch (error) {
    console.error('Weather fetch error:', error);
    throw error;
  }
}

/**
 * Parse raw API response into structured data.
 * @param {Object} raw - Raw Open-Meteo response
 * @returns {Object} Parsed weather data
 */
export function parseWeatherData(raw) {
  const current = {
    temperature: raw.current?.temperature_2m ?? '--',
    humidity: raw.current?.relative_humidity_2m ?? '--',
    weatherCode: raw.current?.weathercode ?? 0,
    windSpeed: raw.current?.windspeed_10m ?? '--',
    precipitation: raw.current?.precipitation ?? 0,
    description: getWeatherDescription(raw.current?.weathercode ?? 0),
    emoji: getWeatherEmoji(raw.current?.weathercode ?? 0),
  };

  const daily = (raw.daily?.time || []).map((date, i) => ({
    date,
    tempMax: raw.daily.temperature_2m_max?.[i] ?? '--',
    tempMin: raw.daily.temperature_2m_min?.[i] ?? '--',
    precipitation: raw.daily.precipitation_sum?.[i] ?? 0,
    precipProbability: raw.daily.precipitation_probability_max?.[i] ?? 0,
    weatherCode: raw.daily.weathercode?.[i] ?? 0,
    windSpeed: raw.daily.windspeed_10m_max?.[i] ?? '--',
    description: getWeatherDescription(raw.daily.weathercode?.[i] ?? 0),
    emoji: getWeatherEmoji(raw.daily.weathercode?.[i] ?? 0),
  }));

  return { current, daily, units: raw.daily_units || {} };
}

/**
 * Calculate monsoon risk level based on weather data.
 * @param {Object} weatherData - Parsed weather data
 * @returns {{level: string, score: number, factors: string[]}}
 */
export function calculateMonsoonRisk(weatherData) {
  let score = 0;
  const factors = [];

  if (!weatherData || !Array.isArray(weatherData.daily)) {
    return { level: 'low', score: 0, factors: [] };
  }

  const totalPrecip = weatherData.daily.reduce((sum, d) => sum + (d.precipitation || 0), 0);
  if (totalPrecip > 100) { score += 40; factors.push('Very heavy rainfall expected (>100mm)'); }
  else if (totalPrecip > 50) { score += 25; factors.push('Heavy rainfall expected (>50mm)'); }
  else if (totalPrecip > 20) { score += 10; factors.push('Moderate rainfall expected'); }

  const maxWind = Math.max(...weatherData.daily.map(d => d.windSpeed || 0));
  if (maxWind > 60) { score += 30; factors.push('Dangerously high winds (>60 km/h)'); }
  else if (maxWind > 40) { score += 15; factors.push('Strong winds expected (>40 km/h)'); }

  const thunderDays = weatherData.daily.filter(d => d.weatherCode >= 95).length;
  if (thunderDays >= 3) { score += 20; factors.push(`${thunderDays} days of thunderstorms predicted`); }
  else if (thunderDays >= 1) { score += 10; factors.push(`${thunderDays} day(s) of thunderstorms predicted`); }

  const heavyRainDays = weatherData.daily.filter(d => d.precipitation > 30).length;
  if (heavyRainDays >= 2) { score += 10; factors.push(`${heavyRainDays} days of very heavy rain (>30mm/day)`); }

  let level;
  if (score >= 60) level = 'critical';
  else if (score >= 40) level = 'high';
  else if (score >= 20) level = 'moderate';
  else level = 'low';

  return { level, score: Math.min(score, 100), factors };
}

/**
 * Get user's current position via Geolocation API.
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  });
}
