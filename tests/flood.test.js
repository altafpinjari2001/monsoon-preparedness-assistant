/**
 * Unit tests for the flood module
 */

import { describe, it, expect } from 'vitest';
import { parseFloodData, calculateFloodRisk } from '../src/modules/flood.js';

describe('calculateFloodRisk', () => {
  it('should return critical risk for discharge >= 5000', () => {
    const risk = calculateFloodRisk(5500);
    expect(risk.level).toBe('critical');
    expect(risk.message).toContain('CRITICAL');
  });

  it('should return high risk for discharge >= 2000', () => {
    const risk = calculateFloodRisk(2500);
    expect(risk.level).toBe('high');
  });

  it('should return moderate risk for discharge >= 500', () => {
    const risk = calculateFloodRisk(800);
    expect(risk.level).toBe('moderate');
  });

  it('should return low risk for low discharge', () => {
    const risk = calculateFloodRisk(150);
    expect(risk.level).toBe('low');
  });
});

describe('parseFloodData', () => {
  it('should parse raw discharge values correctly', () => {
    const raw = {
      daily: {
        time: ['2026-07-15', '2026-07-16'],
        river_discharge: [400, 2100],
      },
    };
    const parsed = parseFloodData(raw);
    expect(parsed.maxDischarge).toBe(2100);
    expect(parsed.avgDischarge).toBe(1250);
    expect(parsed.riskLevel).toBe('high');
  });

  it('should handle empty or missing discharge data safely', () => {
    const parsed = parseFloodData({});
    expect(parsed.maxDischarge).toBe(0);
    expect(parsed.riskLevel).toBe('unknown');
  });
});
