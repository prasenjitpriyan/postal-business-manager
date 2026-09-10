/* cspell:ignore nin */
import { Official } from '@/models/Official';
import { InsuranceContribution } from '@/models/InsuranceContribution';
import { BusinessContribution } from '@/models/BusinessContribution';

export interface DataQualityIssue {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category:
    | 'duplicate_record'
    | 'missing_fields'
    | 'invalid_dates'
    | 'invalid_monetary'
    | 'invalid_types'
    | 'suspicious_values'
    | 'orphaned_records';
  collectionName: 'officials' | 'insurancecontributions' | 'businesscontributions' | 'targets';
  recordId: string;
  recordIdentifier: string;
  details: string;
  currentValues?: Record<string, unknown>;
  correctionStrategy: string;
}

export class DataQualityService {
  /**
   * Detects duplicate records across insurance policies, POSB daily journals, and official profiles.
   */
  static async detectDuplicates(): Promise<DataQualityIssue[]> {
    const issues: DataQualityIssue[] = [];

    // 1. Exact Duplicate Insurance Policies
    const duplicateInsurance = await InsuranceContribution.aggregate([
      {
        $group: {
          _id: {
            officialId: '$officialId',
            contributionDate: '$contributionDate',
            insuranceType: '$insuranceType',
            sumAssured: '$sumAssured',
            initialPremium: '$initialPremium',
          },
          count: { $sum: 1 },
          ids: { $push: '$_id' },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);

    for (const dup of duplicateInsurance) {
      for (const recordId of dup.ids) {
        issues.push({
          id: `dup-ins-${recordId}`,
          ruleId: 'DUP-INSURANCE-EXACT',
          ruleName: 'Exact Duplicate Insurance Policy',
          severity: 'Critical',
          category: 'duplicate_record',
          collectionName: 'insurancecontributions',
          recordId: recordId.toString(),
          recordIdentifier: `${dup._id.insuranceType} Policy (₹${dup._id.sumAssured})`,
          details: `Found ${dup.count} duplicate insurance policy records with identical date, official, sum assured, and initial premium.`,
          currentValues: dup._id,
          correctionStrategy: 'Verify counter receipt and delete the redundant duplicate record.',
        });
      }
    }

    // 2. Duplicate POSB Daily Contributions
    const duplicatePOSB = await BusinessContribution.aggregate([
      {
        $group: {
          _id: {
            officialId: '$officialId',
            contributionDate: '$contributionDate',
            contributeOffice: '$contributeOffice',
            accountType: '$accountType',
          },
          count: { $sum: 1 },
          ids: { $push: '$_id' },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);

    for (const dup of duplicatePOSB) {
      for (const recordId of dup.ids) {
        issues.push({
          id: `dup-posb-${recordId}`,
          ruleId: 'DUP-POSB-JOURNAL-ENTRY',
          ruleName: 'Duplicate POSB Daily Entry',
          severity: 'High',
          category: 'duplicate_record',
          collectionName: 'businesscontributions',
          recordId: recordId.toString(),
          recordIdentifier: `${dup._id.accountType} at ${dup._id.contributeOffice}`,
          details: `Found ${dup.count} duplicate account contributions logged for the same official, office, scheme, and date.`,
          currentValues: dup._id,
          correctionStrategy: 'Reconcile daily counter scroll and merge into a single daily record.',
        });
      }
    }

    // 3. Duplicate Official Employee ID or Phone Number
    const duplicateOfficials = await Official.aggregate([
      {
        $match: {
          $or: [
            { employeeId: { $exists: true, $nin: [null, ''] } },
            { phone: { $exists: true, $nin: [null, ''] } },
          ],
        },
      },
      {
        $group: {
          _id: '$employeeId',
          count: { $sum: 1 },
          ids: { $push: '$_id' },
          names: { $push: '$name' },
        },
      },
      { $match: { count: { $gt: 1 }, _id: { $nin: [null, ''] } } },
    ]);

    for (const dup of duplicateOfficials) {
      for (const recordId of dup.ids) {
        issues.push({
          id: `dup-off-${recordId}`,
          ruleId: 'DUP-OFFICIAL-IDENTITY',
          ruleName: 'Duplicate Official Identity (Employee ID)',
          severity: 'Critical',
          category: 'duplicate_record',
          collectionName: 'officials',
          recordId: recordId.toString(),
          recordIdentifier: `Employee ID: ${dup._id}`,
          details: `Multiple officials (${dup.names.join(', ')}) share the exact same employee ID (${dup._id}).`,
          correctionStrategy: 'Merge profiles or update the incorrect CSI employee ID.',
        });
      }
    }

    return issues;
  }

  /**
   * Detects missing mandatory and critical fields.
   */
  static async detectMissingFields(): Promise<DataQualityIssue[]> {
    const issues: DataQualityIssue[] = [];

    // 1. Official Missing Employee ID, Phone, or Office
    const incompleteOfficials = await Official.find({
      $or: [
        { employeeId: { $in: [null, ''] } },
        { phone: { $in: [null, ''] } },
        { office: { $in: [null, ''] } },
      ],
    }).lean();

    for (const off of incompleteOfficials) {
      const missing: string[] = [];
      if (!off.employeeId) missing.push('Employee ID');
      if (!off.phone) missing.push('Phone');
      if (!off.office) missing.push('Office');

      issues.push({
        id: `missing-off-${off._id}`,
        ruleId: 'REQ-OFFICIAL-INCOMPLETE',
        ruleName: 'Incomplete Official Profile',
        severity: 'Medium',
        category: 'missing_fields',
        collectionName: 'officials',
        recordId: off._id.toString(),
        recordIdentifier: off.name,
        details: `Official record is missing required fields: ${missing.join(', ')}.`,
        correctionStrategy: 'Update official profile with verified postal employment details.',
      });
    }

    // 2. Insurance Record Missing Indexing Office
    const incompleteInsurance = await InsuranceContribution.find({
      $or: [
        { officeOfIndexing: { $in: [null, '', 'N/A', 'UNKNOWN', 'TBD'] } },
      ],
    }).lean();

    for (const ins of incompleteInsurance) {
      issues.push({
        id: `missing-ins-office-${ins._id}`,
        ruleId: 'REQ-INSURANCE-NO-INDEXING-OFFICE',
        ruleName: 'Missing Insurance Indexing Office',
        severity: 'High',
        category: 'missing_fields',
        collectionName: 'insurancecontributions',
        recordId: ins._id.toString(),
        recordIdentifier: `${ins.insuranceType} Policy (₹${ins.sumAssured})`,
        details: 'Policy entry lacks a designated Indexing Head/Sub Post Office.',
        correctionStrategy: 'Assign the Head Post Office or CPC where the policy was indexed.',
      });
    }

    // 3. Business Contribution Missing Contribute Office
    const incompleteContributions = await BusinessContribution.find({
      $or: [
        { contributeOffice: { $in: [null, '', 'N/A', 'ALL'] } },
      ],
    }).lean();

    for (const c of incompleteContributions) {
      issues.push({
        id: `missing-posb-office-${c._id}`,
        ruleId: 'REQ-POSB-NO-OFFICE',
        ruleName: 'Missing Contribution Office',
        severity: 'High',
        category: 'missing_fields',
        collectionName: 'businesscontributions',
        recordId: c._id.toString(),
        recordIdentifier: `${c.accountType} (${c.accountsOpened} accounts)`,
        details: 'Contribution record lacks a designated branch/sub-office location.',
        correctionStrategy: 'Assign the physical Post Office where accounts were opened.',
      });
    }

    return issues;
  }

  /**
   * Detects invalid dates, invalid monetary values, invalid scheme types, and suspicious limits.
   */
  static async detectInvalidRecords(): Promise<DataQualityIssue[]> {
    const issues: DataQualityIssue[] = [];
    const now = new Date();
    const minDate = new Date('2000-01-01T00:00:00.000Z');

    // 1. Future Dates & Corrupt Timestamps in Insurance
    const futureInsurance = await InsuranceContribution.find({
      $or: [
        { contributionDate: { $gt: now } },
        { contributionDate: { $lt: minDate } },
      ],
    }).lean();

    for (const ins of futureInsurance) {
      const isFuture = ins.contributionDate ? new Date(ins.contributionDate) > now : false;
      const formattedDate =
        ins.contributionDate && !isNaN(new Date(ins.contributionDate).getTime())
          ? new Date(ins.contributionDate).toISOString().split('T')[0]
          : 'Invalid Date';
      issues.push({
        id: `inv-date-ins-${ins._id}`,
        ruleId: isFuture ? 'DAT-FUTURE-CONTRIBUTION' : 'DAT-PRE-SYSTEM-BOUNDARY',
        ruleName: isFuture ? 'Future Contribution Date' : 'Historical Date Out-of-Bounds',
        severity: 'Critical',
        category: 'invalid_dates',
        collectionName: 'insurancecontributions',
        recordId: ins._id.toString(),
        recordIdentifier: `${ins.insuranceType || 'Insurance'} Policy (₹${ins.sumAssured || 0})`,
        details: `Recorded contribution date (${formattedDate}) is ${isFuture ? 'in the future' : 'prior to year 2000'}.`,
        correctionStrategy: 'Correct the policy entry date to match the counter receipt date.',
      });
    }

    // 2. Future Dates in POSB
    const futurePOSB = await BusinessContribution.find({
      $or: [
        { contributionDate: { $gt: now } },
        { contributionDate: { $lt: minDate } },
      ],
    }).lean();

    for (const posb of futurePOSB) {
      const isFuture = posb.contributionDate ? new Date(posb.contributionDate) > now : false;
      const formattedDate =
        posb.contributionDate && !isNaN(new Date(posb.contributionDate).getTime())
          ? new Date(posb.contributionDate).toISOString().split('T')[0]
          : 'Invalid Date';
      issues.push({
        id: `inv-date-posb-${posb._id}`,
        ruleId: isFuture ? 'DAT-FUTURE-CONTRIBUTION' : 'DAT-PRE-SYSTEM-BOUNDARY',
        ruleName: isFuture ? 'Future Contribution Date' : 'Historical Date Out-of-Bounds',
        severity: 'Critical',
        category: 'invalid_dates',
        collectionName: 'businesscontributions',
        recordId: posb._id.toString(),
        recordIdentifier: `${posb.accountType || 'POSB'} at ${posb.contributeOffice || 'Office'}`,
        details: `Contribution date (${formattedDate}) is ${isFuture ? 'in the future' : 'prior to year 2000'}.`,
        correctionStrategy: 'Correct the journal entry date.',
      });
    }

    // 3. Monetary Violations (Negative, Zero, or Inverted Premium)
    const invalidMonetaryInsurance = await InsuranceContribution.find({
      $or: [
        { sumAssured: { $lte: 0 } },
        { initialPremium: { $lte: 0 } },
        { $expr: { $gte: ['$initialPremium', '$sumAssured'] } },
      ],
    }).lean();

    for (const ins of invalidMonetaryInsurance) {
      let detailMsg = '';
      if (ins.sumAssured <= 0) detailMsg = `Sum Assured must be greater than 0 (recorded: ₹${ins.sumAssured}).`;
      else if (ins.initialPremium <= 0) detailMsg = `Initial Premium must be greater than 0 (recorded: ₹${ins.initialPremium}).`;
      else if (ins.initialPremium >= ins.sumAssured) {
        detailMsg = `Initial Premium (₹${ins.initialPremium}) cannot be equal to or greater than Sum Assured (₹${ins.sumAssured}).`;
      }

      issues.push({
        id: `inv-mon-ins-${ins._id}`,
        ruleId: 'MON-INSURANCE-INVALID-VALUE',
        ruleName: 'Invalid Monetary Amount',
        severity: 'Critical',
        category: 'invalid_monetary',
        collectionName: 'insurancecontributions',
        recordId: ins._id.toString(),
        recordIdentifier: `${ins.insuranceType} Policy`,
        details: detailMsg,
        currentValues: { sumAssured: ins.sumAssured, initialPremium: ins.initialPremium },
        correctionStrategy: 'Verify with policy schedule bond and enter accurate sum assured & premium figures.',
      });
    }

    // 4. Statutory Ceilings (RPLI > ₹10,00,000, PLI > ₹50,00,000)
    const statutoryBreaches = await InsuranceContribution.find({
      $or: [
        { insuranceType: 'RPLI', sumAssured: { $gt: 1000000 } },
        { insuranceType: 'PLI', sumAssured: { $gt: 5000000 } },
      ],
    }).lean();

    for (const b of statutoryBreaches) {
      const isRPLI = b.insuranceType === 'RPLI';
      const cap = isRPLI ? 1000000 : 5000000;
      issues.push({
        id: `sus-stat-limit-${b._id}`,
        ruleId: isRPLI ? 'SUS-RPLI-STATUTORY-CAP' : 'SUS-PLI-MAX-CEILING',
        ruleName: `${b.insuranceType} Statutory Limit Breach`,
        severity: 'Critical',
        category: 'suspicious_values',
        collectionName: 'insurancecontributions',
        recordId: b._id.toString(),
        recordIdentifier: `${b.insuranceType} Policy - ₹${b.sumAssured.toLocaleString('en-IN')}`,
        details: `Sum Assured (₹${b.sumAssured.toLocaleString('en-IN')}) exceeds statutory maximum limit of ₹${cap.toLocaleString('en-IN')} for ${b.insuranceType}.`,
        currentValues: { insuranceType: b.insuranceType, sumAssured: b.sumAssured },
        correctionStrategy: isRPLI
          ? 'Reclassify as PLI if government-eligible, or correct typo in Sum Assured.'
          : 'Audit policy bond and split multiple proposals if combined into single record.',
      });
    }

    // 5. Invalid Scheme / Non-standard POSB Type
    const validPOSBSchemes = ['SB', 'RD', 'TD', 'MIS', 'SCSS', 'PPF', 'SSA', 'KVP', 'NSC', 'MSSC'];
    const nonStandardPOSB = await BusinessContribution.find({
      accountType: { $nin: validPOSBSchemes },
    }).lean();

    for (const p of nonStandardPOSB) {
      issues.push({
        id: `inv-scheme-${p._id}`,
        ruleId: 'TYP-POSB-UNKNOWN-SCHEME',
        ruleName: 'Unknown POSB Scheme',
        severity: 'High',
        category: 'invalid_types',
        collectionName: 'businesscontributions',
        recordId: p._id.toString(),
        recordIdentifier: `Scheme: "${p.accountType}"`,
        details: `Scheme type "${p.accountType}" does not match recognized India Post small savings accounts catalog.`,
        currentValues: { accountType: p.accountType },
        correctionStrategy: 'Remap to standard scheme code (e.g. Sukanya -> SSA, Time Deposit -> TD).',
      });
    }

    // 6. Suspicious POSB Volume Spike
    const volumeSpikes = await BusinessContribution.find({
      accountsOpened: { $gt: 250 },
    }).lean();

    for (const spike of volumeSpikes) {
      issues.push({
        id: `sus-spike-${spike._id}`,
        ruleId: 'SUS-POSB-VOLUME-SPIKE',
        ruleName: 'Abnormal Daily Account Spike',
        severity: 'Medium',
        category: 'suspicious_values',
        collectionName: 'businesscontributions',
        recordId: spike._id.toString(),
        recordIdentifier: `${spike.accountType} (${spike.accountsOpened} accounts)`,
        details: `Single daily entry of ${spike.accountsOpened} accounts opened exceeds normal daily operational threshold (>250).`,
        currentValues: { accountsOpened: spike.accountsOpened },
        correctionStrategy: 'Verify that monetary deposit value in rupees was not accidentally entered as account count.',
      });
    }

    return issues;
  }

  /**
   * Detects orphaned records with dangling foreign keys.
   */
  static async detectOrphanedRecords(): Promise<DataQualityIssue[]> {
    const issues: DataQualityIssue[] = [];

    // Orphaned Insurance
    const orphanedInsurance = await InsuranceContribution.aggregate([
      {
        $lookup: {
          from: 'officials',
          localField: 'officialId',
          foreignField: '_id',
          as: 'official',
        },
      },
      { $match: { 'official.0': { $exists: false } } },
    ]);

    for (const ins of orphanedInsurance) {
      issues.push({
        id: `orph-ins-${ins._id}`,
        ruleId: 'ORP-INSURANCE-DANGLING-OFFICIAL',
        ruleName: 'Orphaned Insurance Record',
        severity: 'Critical',
        category: 'orphaned_records',
        collectionName: 'insurancecontributions',
        recordId: ins._id.toString(),
        recordIdentifier: `${ins.insuranceType} Policy (₹${ins.sumAssured})`,
        details: `Policy record references non-existent official ID: ${ins.officialId}.`,
        correctionStrategy: 'Re-link record to active official or restore the deleted official record.',
      });
    }

    // Orphaned POSB
    const orphanedPOSB = await BusinessContribution.aggregate([
      {
        $lookup: {
          from: 'officials',
          localField: 'officialId',
          foreignField: '_id',
          as: 'official',
        },
      },
      { $match: { 'official.0': { $exists: false } } },
    ]);

    for (const posb of orphanedPOSB) {
      issues.push({
        id: `orph-posb-${posb._id}`,
        ruleId: 'ORP-POSB-DANGLING-OFFICIAL',
        ruleName: 'Orphaned POSB Contribution',
        severity: 'Critical',
        category: 'orphaned_records',
        collectionName: 'businesscontributions',
        recordId: posb._id.toString(),
        recordIdentifier: `${posb.accountType} at ${posb.contributeOffice}`,
        details: `Contribution references non-existent official ID: ${posb.officialId}.`,
        correctionStrategy: 'Re-assign contribution to verified staff member.',
      });
    }

    return issues;
  }

  /**
   * Runs the complete diagnostic audit across all 4 detection suites.
   */
  static async runFullDiagnostic(): Promise<{
    scannedAt: Date;
    totalIssues: number;
    issuesBySeverity: Record<string, number>;
    issues: DataQualityIssue[];
  }> {
    const [duplicates, missing, invalid, orphaned] = await Promise.all([
      this.detectDuplicates(),
      this.detectMissingFields(),
      this.detectInvalidRecords(),
      this.detectOrphanedRecords(),
    ]);

    const issues = [...duplicates, ...missing, ...invalid, ...orphaned];

    const issuesBySeverity = {
      Critical: issues.filter((i) => i.severity === 'Critical').length,
      High: issues.filter((i) => i.severity === 'High').length,
      Medium: issues.filter((i) => i.severity === 'Medium').length,
      Low: issues.filter((i) => i.severity === 'Low').length,
    };

    return {
      scannedAt: new Date(),
      totalIssues: issues.length,
      issuesBySeverity,
      issues,
    };
  }
}
