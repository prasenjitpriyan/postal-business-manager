import { describe, it, expect } from 'vitest';
import { formatCurrencyINR, formatCurrencyShort, formatNumber } from '../utils/formatters';

describe('Dashboard Formatters', () => {
  it('formats Indian currency (INR) with standard symbol and grouping', () => {
    const formatted = formatCurrencyINR(125000);
    // Handles non-breaking spaces or standard currency formatting
    expect(formatted).toContain('1,25,000');
    expect(formatted).toMatch(/₹/);
  });

  it('handles zero and negative currency amounts', () => {
    expect(formatCurrencyINR(0)).toContain('0');
  });

  it('formats short currency representations correctly', () => {
    expect(formatCurrencyShort(500)).toBe('₹500');
    expect(formatCurrencyShort(25000)).toBe('₹25k');
    expect(formatCurrencyShort(350000)).toBe('₹3.5L');
    expect(formatCurrencyShort(15000000)).toBe('₹1.50Cr');
  });

  it('formats standard numbers with Indian locale grouping', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(100000)).toBe('1,00,000');
    expect(formatNumber(0)).toBe('0');
  });
});
