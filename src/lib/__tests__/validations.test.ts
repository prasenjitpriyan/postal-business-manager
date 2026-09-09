import { describe, it, expect } from 'vitest';
import {
  clampPagination,
  officialSchema,
  contributionSchema,
  insuranceSchema,
} from '../validations';

describe('Validation Schemas & Utilities', () => {
  describe('clampPagination', () => {
    it('defaults to page 1 and limit 10 when empty', () => {
      const result = clampPagination();
      expect(result).toEqual({ page: 1, limit: 10 });
    });

    it('parses valid numeric strings', () => {
      const result = clampPagination('3', '25');
      expect(result).toEqual({ page: 3, limit: 25 });
    });

    it('clamps negative or zero page and limit to safe defaults', () => {
      const result = clampPagination('-5', '0');
      expect(result).toEqual({ page: 1, limit: 10 });
    });

    it('clamps limit exceeding maxLimit (100)', () => {
      const result = clampPagination('1', '500');
      expect(result).toEqual({ page: 1, limit: 100 });
    });
  });

  describe('officialSchema', () => {
    it('validates a correct official payload', () => {
      const valid = {
        name: 'Rajesh Kumar',
        designation: 'Postal Assistant',
        office: 'GPO New Delhi',
        phone: '9876543210',
        email: 'rajesh@indiapost.gov.in',
        joiningDate: '2023-01-15',
        status: 'ACTIVE',
      };
      const result = officialSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('fails when phone is under 10 digits', () => {
      const invalid = {
        name: 'Rajesh Kumar',
        designation: 'Postal Assistant',
        office: 'GPO New Delhi',
        phone: '12345',
        joiningDate: '2023-01-15',
      };
      const result = officialSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('fails when name is too short', () => {
      const invalid = {
        name: 'R',
        designation: 'Postal Assistant',
        office: 'GPO New Delhi',
        phone: '9876543210',
        joiningDate: '2023-01-15',
      };
      const result = officialSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('contributionSchema', () => {
    it('validates a correct business contribution payload', () => {
      const valid = {
        officialId: '507f1f77bcf86cd799439011',
        contributionDate: '2026-03-01',
        contributeOffice: 'Sub Post Office Aliganj',
        accountType: 'Savings Bank (SB)',
        accountsOpened: 15,
        remarks: 'Special drive',
      };
      const result = contributionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('fails for invalid officialId format', () => {
      const invalid = {
        officialId: 'invalid-id-123',
        contributionDate: '2026-03-01',
        contributeOffice: 'Sub Post Office Aliganj',
        accountType: 'Savings Bank (SB)',
        accountsOpened: 5,
      };
      const result = contributionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('fails when accountsOpened is zero or negative', () => {
      const invalid = {
        officialId: '507f1f77bcf86cd799439011',
        contributionDate: '2026-03-01',
        contributeOffice: 'Sub Post Office Aliganj',
        accountType: 'Savings Bank (SB)',
        accountsOpened: 0,
      };
      const result = contributionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('insuranceSchema', () => {
    it('validates a correct PLI insurance payload', () => {
      const valid = {
        officialId: '507f1f77bcf86cd799439011',
        contributionDate: '2026-03-01',
        officeOfIndexing: 'Head Post Office Kanpur',
        insuranceType: 'PLI',
        sumAssured: 500000,
        initialPremium: 2500,
      };
      const result = insuranceSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('fails when insuranceType is not PLI or RPLI', () => {
      const invalid = {
        officialId: '507f1f77bcf86cd799439011',
        contributionDate: '2026-03-01',
        officeOfIndexing: 'Head Post Office Kanpur',
        insuranceType: 'TERM_LIFE',
        sumAssured: 500000,
        initialPremium: 2500,
      };
      const result = insuranceSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('fails when sumAssured is negative', () => {
      const invalid = {
        officialId: '507f1f77bcf86cd799439011',
        contributionDate: '2026-03-01',
        officeOfIndexing: 'Head Post Office Kanpur',
        insuranceType: 'RPLI',
        sumAssured: -1000,
        initialPremium: 500,
      };
      const result = insuranceSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
