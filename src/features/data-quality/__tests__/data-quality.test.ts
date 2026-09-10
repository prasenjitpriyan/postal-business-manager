import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataQualityService } from '../services/data-quality.service';
import { Official } from '@/models/Official';
import { InsuranceContribution } from '@/models/InsuranceContribution';
import { BusinessContribution } from '@/models/BusinessContribution';

vi.mock('@/models/Official', () => ({
  Official: {
    aggregate: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock('@/models/InsuranceContribution', () => ({
  InsuranceContribution: {
    aggregate: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock('@/models/BusinessContribution', () => ({
  BusinessContribution: {
    aggregate: vi.fn(),
    find: vi.fn(),
  },
}));

function mockQuery(result: unknown[] = []) {
  return {
    lean: vi.fn().mockResolvedValue(result),
  };
}

describe('Data Quality Service - Forensic Audit & Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Duplicate Detection', () => {
    it('detects duplicate insurance policies with exact same parameters', async () => {
      vi.mocked(InsuranceContribution.aggregate).mockResolvedValueOnce([
        {
          _id: {
            officialId: 'off-101',
            contributionDate: new Date('2026-09-01'),
            insuranceType: 'PLI',
            sumAssured: 1000000,
            initialPremium: 25000,
          },
          count: 2,
          ids: ['ins-dup-1', 'ins-dup-2'],
        },
      ]);
      vi.mocked(BusinessContribution.aggregate).mockResolvedValueOnce([]);
      vi.mocked(Official.aggregate).mockResolvedValueOnce([]);

      const issues = await DataQualityService.detectDuplicates();

      expect(issues.length).toBe(2);
      expect(issues[0].ruleId).toBe('DUP-INSURANCE-EXACT');
      expect(issues[0].severity).toBe('Critical');
      expect(issues[0].category).toBe('duplicate_record');
      expect(issues[0].recordId).toBe('ins-dup-1');
      expect(issues[1].recordId).toBe('ins-dup-2');
    });

    it('detects duplicate POSB journal entries for same date, office, and scheme', async () => {
      vi.mocked(InsuranceContribution.aggregate).mockResolvedValueOnce([]);
      vi.mocked(BusinessContribution.aggregate).mockResolvedValueOnce([
        {
          _id: {
            officialId: 'off-102',
            contributionDate: new Date('2026-09-02'),
            contributeOffice: 'Park Street SO',
            accountType: 'SB',
          },
          count: 2,
          ids: ['posb-dup-1', 'posb-dup-2'],
        },
      ]);
      vi.mocked(Official.aggregate).mockResolvedValueOnce([]);

      const issues = await DataQualityService.detectDuplicates();

      expect(issues.length).toBe(2);
      expect(issues[0].ruleId).toBe('DUP-POSB-JOURNAL-ENTRY');
      expect(issues[0].severity).toBe('High');
      expect(issues[0].category).toBe('duplicate_record');
    });

    it('detects duplicate official employee IDs across multiple profiles', async () => {
      vi.mocked(InsuranceContribution.aggregate).mockResolvedValueOnce([]);
      vi.mocked(BusinessContribution.aggregate).mockResolvedValueOnce([]);
      vi.mocked(Official.aggregate).mockResolvedValueOnce([
        {
          _id: '10045231',
          count: 2,
          ids: ['off-1', 'off-2'],
          names: ['Rajesh Sharma', 'R. Sharma'],
        },
      ]);

      const issues = await DataQualityService.detectDuplicates();

      expect(issues.length).toBe(2);
      expect(issues[0].ruleId).toBe('DUP-OFFICIAL-IDENTITY');
      expect(issues[0].severity).toBe('Critical');
      expect(issues[0].details).toContain('Rajesh Sharma, R. Sharma');
    });

    it('returns empty list when no duplicates exist', async () => {
      vi.mocked(InsuranceContribution.aggregate).mockResolvedValueOnce([]);
      vi.mocked(BusinessContribution.aggregate).mockResolvedValueOnce([]);
      vi.mocked(Official.aggregate).mockResolvedValueOnce([]);

      const issues = await DataQualityService.detectDuplicates();
      expect(issues).toEqual([]);
    });
  });

  describe('Missing Fields Detection', () => {
    it('detects officials with missing employee ID, phone, or assigned office', async () => {
      vi.mocked(Official.find).mockReturnValue(
        mockQuery([
          { _id: 'off-inc-1', name: 'Sunil Das', employeeId: '', phone: null, office: 'Alipore HO' },
          { _id: 'off-inc-2', name: 'Amit Roy', employeeId: '109988', phone: '9876543210', office: '' },
        ]) as never
      );
      vi.mocked(InsuranceContribution.find).mockReturnValue(mockQuery([]) as never);
      vi.mocked(BusinessContribution.find).mockReturnValue(mockQuery([]) as never);

      const issues = await DataQualityService.detectMissingFields();

      expect(issues.length).toBe(2);
      expect(issues[0].ruleId).toBe('REQ-OFFICIAL-INCOMPLETE');
      expect(issues[0].severity).toBe('Medium');
      expect(issues[0].details).toContain('Employee ID');
      expect(issues[0].details).toContain('Phone');
      expect(issues[1].details).toContain('Office');
    });

    it('detects insurance records missing an indexing office', async () => {
      vi.mocked(Official.find).mockReturnValue(mockQuery([]) as never);
      vi.mocked(InsuranceContribution.find).mockReturnValue(
        mockQuery([
          { _id: 'ins-no-off-1', insuranceType: 'PLI', sumAssured: 500000, officeOfIndexing: 'UNKNOWN' },
        ]) as never
      );
      vi.mocked(BusinessContribution.find).mockReturnValue(mockQuery([]) as never);

      const issues = await DataQualityService.detectMissingFields();

      expect(issues.length).toBe(1);
      expect(issues[0].ruleId).toBe('REQ-INSURANCE-NO-INDEXING-OFFICE');
      expect(issues[0].severity).toBe('High');
      expect(issues[0].category).toBe('missing_fields');
    });

    it('detects POSB contributions missing a physical contribute office', async () => {
      vi.mocked(Official.find).mockReturnValue(mockQuery([]) as never);
      vi.mocked(InsuranceContribution.find).mockReturnValue(mockQuery([]) as never);
      vi.mocked(BusinessContribution.find).mockReturnValue(
        mockQuery([
          { _id: 'posb-no-off-1', accountType: 'RD', accountsOpened: 5, contributeOffice: 'ALL' },
        ]) as never
      );

      const issues = await DataQualityService.detectMissingFields();

      expect(issues.length).toBe(1);
      expect(issues[0].ruleId).toBe('REQ-POSB-NO-OFFICE');
      expect(issues[0].severity).toBe('High');
    });
  });

  describe('Invalid Records Detection', () => {
    it('detects future contribution dates and historical timestamps prior to 2000', async () => {
      const futureDate = new Date(Date.now() + 86400000 * 30); // 30 days in future
      const ancientDate = new Date('1995-05-12T00:00:00.000Z');

      vi.mocked(InsuranceContribution.find)
        .mockReturnValueOnce(
          mockQuery([
            { _id: 'ins-fut-1', insuranceType: 'PLI', sumAssured: 500000, contributionDate: futureDate },
            { _id: 'ins-anc-1', insuranceType: 'RPLI', sumAssured: 200000, contributionDate: ancientDate },
          ]) as never
        )
        .mockReturnValue(mockQuery([]) as never);

      vi.mocked(BusinessContribution.find).mockReturnValue(mockQuery([]) as never);

      const issues = await DataQualityService.detectInvalidRecords();

      const futureIssue = issues.find((i) => i.ruleId === 'DAT-FUTURE-CONTRIBUTION');
      const ancientIssue = issues.find((i) => i.ruleId === 'DAT-PRE-SYSTEM-BOUNDARY');

      expect(futureIssue).toBeDefined();
      expect(futureIssue?.severity).toBe('Critical');
      expect(futureIssue?.details).toContain('in the future');

      expect(ancientIssue).toBeDefined();
      expect(ancientIssue?.severity).toBe('Critical');
      expect(ancientIssue?.details).toContain('prior to year 2000');
    });

    it('detects zero, negative, and inverted monetary values in insurance', async () => {
      vi.mocked(InsuranceContribution.find)
        .mockReturnValueOnce(mockQuery([]) as never) // dates
        .mockReturnValueOnce(
          mockQuery([
            { _id: 'ins-zero-sa', insuranceType: 'PLI', sumAssured: 0, initialPremium: 500 },
            { _id: 'ins-neg-prem', insuranceType: 'RPLI', sumAssured: 100000, initialPremium: -50 },
            { _id: 'ins-inv', insuranceType: 'PLI', sumAssured: 10000, initialPremium: 15000 },
          ]) as never
        ) // monetary
        .mockReturnValue(mockQuery([]) as never);

      vi.mocked(BusinessContribution.find).mockReturnValue(mockQuery([]) as never);

      const issues = await DataQualityService.detectInvalidRecords();

      const monetaryIssues = issues.filter((i) => i.ruleId === 'MON-INSURANCE-INVALID-VALUE');
      expect(monetaryIssues.length).toBe(3);
      expect(monetaryIssues[0].details).toContain('Sum Assured must be greater than 0');
      expect(monetaryIssues[1].details).toContain('Initial Premium must be greater than 0');
      expect(monetaryIssues[2].details).toContain('cannot be equal to or greater than Sum Assured');
    });

    it('detects statutory cap breaches for RPLI (>10L) and PLI (>50L)', async () => {
      vi.mocked(InsuranceContribution.find)
        .mockReturnValueOnce(mockQuery([]) as never) // dates
        .mockReturnValueOnce(mockQuery([]) as never) // monetary
        .mockReturnValueOnce(
          mockQuery([
            { _id: 'rpli-cap', insuranceType: 'RPLI', sumAssured: 1500000 },
            { _id: 'pli-cap', insuranceType: 'PLI', sumAssured: 7500000 },
          ]) as never
        ) // statutory breaches
        .mockReturnValue(mockQuery([]) as never);

      vi.mocked(BusinessContribution.find).mockReturnValue(mockQuery([]) as never);

      const issues = await DataQualityService.detectInvalidRecords();

      const rpliIssue = issues.find((i) => i.ruleId === 'SUS-RPLI-STATUTORY-CAP');
      const pliIssue = issues.find((i) => i.ruleId === 'SUS-PLI-MAX-CEILING');

      expect(rpliIssue).toBeDefined();
      expect(rpliIssue?.severity).toBe('Critical');
      expect(rpliIssue?.details).toContain('exceeds statutory maximum limit of ₹10,00,000');

      expect(pliIssue).toBeDefined();
      expect(pliIssue?.severity).toBe('Critical');
      expect(pliIssue?.details).toContain('exceeds statutory maximum limit of ₹50,00,000');
    });

    it('detects non-standard POSB scheme codes and abnormal daily account volume spikes (>250)', async () => {
      vi.mocked(InsuranceContribution.find).mockReturnValue(mockQuery([]) as never);

      vi.mocked(BusinessContribution.find)
        .mockReturnValueOnce(mockQuery([]) as never) // dates
        .mockReturnValueOnce(
          mockQuery([
            { _id: 'posb-bad-scheme', accountType: 'CRYPTO_SAVINGS' },
          ]) as never
        ) // nonStandardPOSB
        .mockReturnValueOnce(
          mockQuery([
            { _id: 'posb-spike', accountType: 'SB', accountsOpened: 500 },
          ]) as never
        ); // volumeSpikes

      const issues = await DataQualityService.detectInvalidRecords();

      const schemeIssue = issues.find((i) => i.ruleId === 'TYP-POSB-UNKNOWN-SCHEME');
      const spikeIssue = issues.find((i) => i.ruleId === 'SUS-POSB-VOLUME-SPIKE');

      expect(schemeIssue).toBeDefined();
      expect(schemeIssue?.severity).toBe('High');
      expect(schemeIssue?.details).toContain('does not match recognized India Post small savings accounts catalog');

      expect(spikeIssue).toBeDefined();
      expect(spikeIssue?.severity).toBe('Medium');
      expect(spikeIssue?.details).toContain('exceeds normal daily operational threshold (>250)');
    });
  });

  describe('Full Diagnostic Runner', () => {
    it('executes full audit and compiles severity distribution accurately', async () => {
      // 1 duplicate (Critical)
      vi.mocked(InsuranceContribution.aggregate).mockImplementation((async (pipeline: unknown[]) => {
        const stages = pipeline as Array<{ $group?: { _id?: { insuranceType?: string } } }>;
        const first = stages[0] || {};
        if (first.$group?._id?.insuranceType !== undefined) {
          return [
            {
              _id: { officialId: 'off-1', insuranceType: 'PLI', sumAssured: 100000 },
              count: 2,
              ids: ['dup-1'],
            },
          ];
        }
        return [];
      }) as never);

      vi.mocked(BusinessContribution.aggregate).mockResolvedValue([]);
      vi.mocked(Official.aggregate).mockResolvedValue([]);

      // 1 missing field (High)
      vi.mocked(Official.find).mockReturnValue(mockQuery([]) as never);
      vi.mocked(BusinessContribution.find).mockReturnValue(mockQuery([]) as never);
      vi.mocked(InsuranceContribution.find).mockImplementation((filter: unknown) => {
        const typedFilter = filter as { $or?: Array<{ officeOfIndexing?: unknown }> };
        if (typedFilter?.$or?.some((clause) => clause.officeOfIndexing)) {
          return mockQuery([
            { _id: 'missing-off-1', officeOfIndexing: 'UNKNOWN', insuranceType: 'PLI', sumAssured: 100000 },
          ]) as never;
        }
        return mockQuery([]) as never;
      });

      const diagnostic = await DataQualityService.runFullDiagnostic();

      expect(diagnostic.totalIssues).toBeGreaterThanOrEqual(2);
      expect(diagnostic.scannedAt).toBeInstanceOf(Date);
      expect(diagnostic.issuesBySeverity.Critical).toBeGreaterThanOrEqual(1);
      expect(diagnostic.issuesBySeverity.High).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(diagnostic.issues)).toBe(true);
    });
  });
});
