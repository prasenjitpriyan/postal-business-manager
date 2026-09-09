import { describe, it, expect } from 'vitest';
import { targetSchema, updateTargetSchema } from '../validations/target';

describe('Target Validation Schemas', () => {
  it('validates a correct POSB target payload', () => {
    const valid = {
      title: 'April Savings Account Drive',
      financialYear: '2026-2027',
      month: 1,
      division: 'Kolkata South Division',
      office: 'Ballygunge SO (33660195)',
      category: 'POSB',
      metricType: 'ACCOUNTS_COUNT',
      schemeType: 'Sukanya Samriddhi Account (SSA)',
      targetValue: 75,
      notes: 'Focus on school enrollment camp',
    };

    const result = targetSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('validates a correct PLI Insurance target payload', () => {
    const valid = {
      title: 'Annual PLI Sum Assured Goal',
      financialYear: '2026-2027',
      division: 'Kolkata South Division',
      category: 'PLI',
      metricType: 'SUM_ASSURED',
      targetValue: 5000000,
    };

    const result = targetSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('fails when targetValue is zero or negative', () => {
    const invalid = {
      financialYear: '2026-2027',
      category: 'POSB',
      metricType: 'ACCOUNTS_COUNT',
      targetValue: 0,
    };

    const result = targetSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('fails for invalid financial year format', () => {
    const invalid = {
      financialYear: '2026-27', // must be YYYY-YYYY e.g. 2026-2027
      category: 'PLI',
      metricType: 'POLICIES_COUNT',
      targetValue: 20,
    };

    const result = targetSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('fails when month is out of fiscal boundary (1 to 12)', () => {
    const invalid = {
      financialYear: '2026-2027',
      month: 15,
      category: 'RPLI',
      metricType: 'POLICIES_COUNT',
      targetValue: 10,
    };

    const result = targetSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('allows partial updates with updateTargetSchema', () => {
    const validUpdate = {
      targetValue: 120,
      notes: 'Revised upward after midterm review',
    };

    const result = updateTargetSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });
});
