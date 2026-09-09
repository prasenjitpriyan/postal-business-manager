export type TargetCategory = 'PLI' | 'RPLI' | 'POSB';

export type MetricType = 
  | 'POLICIES_COUNT' 
  | 'SUM_ASSURED' 
  | 'INITIAL_PREMIUM' 
  | 'ACCOUNTS_COUNT';

export type TargetStatus = 'On Track' | 'Needs Attention' | 'Critical' | 'Achieved';

export interface TargetDocument {
  _id: string;
  title?: string;
  financialYear: string; // e.g. "2026-2027"
  month?: number | null; // 1 (April) to 12 (March), or null for Full FY
  division: string;
  subDivision?: string;
  office?: string;
  officialId?: {
    _id: string;
    name: string;
    designation: string;
    office: string;
  } | string | null;
  category: TargetCategory;
  metricType: MetricType;
  schemeType?: string;
  targetValue: number;
  notes?: string;
  createdBy?: {
    _id: string;
    name: string;
    email?: string;
  } | string;
  createdAt: string;
  updatedAt: string;
}

export interface TargetWithActuals extends TargetDocument {
  actual: number;
  achievementPercentage: number;
  remaining: number;
  status: TargetStatus;
  periodLabel: string;
  metricLabel: string;
}

export interface GetTargetsQuery {
  page?: number;
  limit?: number;
  financialYear?: string;
  month?: number | 'ALL';
  category?: TargetCategory | 'ALL';
  office?: string;
  officialId?: string;
  status?: TargetStatus | 'ALL';
  search?: string;
  sortArray?: { id: string; desc: boolean }[];
}

export interface TargetSummaryStats {
  totalTargets: number;
  achievedCount: number;
  onTrackCount: number;
  needsAttentionCount: number;
  criticalCount: number;
  overallAchievementPercentage: number;
  posbTargetsCount: number;
  insuranceTargetsCount: number;
}
