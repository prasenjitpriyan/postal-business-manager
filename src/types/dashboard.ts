import { TargetStatus } from './target';

export type TrendDirection = 'increasing' | 'decreasing' | 'neutral';

export interface ExecutiveTrendMetric {
  direction: TrendDirection;
  percentage: number;
  currentPeriodValue: number;
  previousPeriodValue: number;
}

export interface ExecutiveTodayStats {
  accountsOpened: number;
  policiesCount: number;
  sumAssured: number;
  initialPremium: number;
  accountsChangeVsYesterday: number;
  premiumChangeVsYesterday: number;
}

export interface ExecutiveMTDStats {
  accountsOpened: number;
  policiesCount: number;
  sumAssured: number;
  initialPremium: number;
  pliCount: number;
  rpliCount: number;
  pliSumAssured: number;
  pliInitialPremium: number;
  rpliSumAssured: number;
  rpliInitialPremium: number;
}

export interface TargetProgressItem {
  category: 'POSB' | 'PLI' | 'RPLI';
  title: string;
  metricType: string;
  metricLabel: string;
  targetValue: number;
  actualValue: number;
  achievementPercentage: number;
  remaining: number;
  status: TargetStatus;
}

export interface ExecutiveTargetSummary {
  totalTargetsCount: number;
  overallAchievementPercentage: number;
  status: TargetStatus;
  achievedCount: number;
  onTrackCount: number;
  needsAttentionCount: number;
  criticalCount: number;
  categories: {
    posb: TargetProgressItem;
    pli: TargetProgressItem;
    rpli: TargetProgressItem;
  };
}

export interface ExecutiveDailyTrendPoint {
  date: string;
  label: string;
  accounts: number;
  pliPolicies: number;
  rpliPolicies: number;
  totalPolicies: number;
  initialPremium: number;
  sumAssured: number;
}

export interface ExecutiveOfficeRanking {
  rank: number;
  office: string;
  accountsOpened: number;
  policiesCount: number;
  initialPremium: number;
  sumAssured: number;
  sharePercentage: number;
}

export interface ExecutiveOfficialAttentionItem {
  id: string;
  name: string;
  office: string;
  designation: string;
  phone?: string;
  email?: string;
  daysInactive: number;
  lastContributionDate: string | null;
  mtdAccounts: number;
  mtdPolicies: number;
  urgency: 'Critical' | 'High' | 'Moderate';
}

export interface ExecutiveActionItem {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  badge: string;
  actionUrl: string;
  actionLabel: string;
}

export interface RecentContributionActivity {
  _id?: string | { toString(): string } | unknown;
  contributionDate?: string | Date;
  officialId?: {
    name?: string;
    office?: string;
    designation?: string;
  };
  contributeOffice?: string;
  accountType?: string;
  accountsOpened?: number;
}

export interface RecentInsuranceActivity {
  _id?: string | { toString(): string } | unknown;
  contributionDate?: string | Date;
  officialId?: {
    name?: string;
    office?: string;
    designation?: string;
  };
  officeOfIndexing?: string;
  insuranceType?: string;
  sumAssured?: number;
  initialPremium?: number;
}

export interface TopOfficialStat {
  id?: string;
  name?: string;
  designation?: string;
  office?: string;
  totalAccounts?: number;
}

export interface TopInsuranceOfficialStat {
  id?: string;
  name?: string;
  designation?: string;
  office?: string;
  totalSumAssured?: number;
  totalInitialPremium?: number;
  policies?: number;
}

export interface TopInsuranceOfficeStat {
  office?: string;
  totalSumAssured?: number;
  totalInitialPremium?: number;
  policies?: number;
}

export interface AccountTypeStat {
  type: string;
  count: number;
  percentage: number;
  formattedPercentage?: string;
}

export interface ExecutiveDashboardData {
  // Executive Overview Blocks
  currentFiscalYear: string;
  currentFiscalMonthLabel: string;
  daysElapsedInMonth: number;
  totalDaysInMonth: number;
  monthRunRatePercentage: number;
  
  // The 11 Operational Sections
  today: ExecutiveTodayStats;
  mtd: ExecutiveMTDStats;
  targetsSummary: ExecutiveTargetSummary;
  pliTrend: ExecutiveTrendMetric;
  rpliTrend: ExecutiveTrendMetric;
  accountsTrend: ExecutiveTrendMetric;
  timelineTrends: ExecutiveDailyTrendPoint[];
  officeRankings: ExecutiveOfficeRanking[];
  officialsNeedingAttention: ExecutiveOfficialAttentionItem[];
  actionItems: ExecutiveActionItem[];

  // Preserved Existing Stats (Backward Compatibility)
  totalContributions: number;
  totalAccountsOpened: number;
  totalOfficials: number;
  topOffice: string;
  recentActivity: RecentContributionActivity[];
  topOfficials: TopOfficialStat[];
  accountsByType: AccountTypeStat[];
  insuranceStats: {
    totalSumAssured: number;
    totalInitialPremium: number;
    totalInsuranceEntries: number;
    pliCount: number;
    rpliCount: number;
    pliSumAssured: number;
    pliInitialPremium: number;
    rpliSumAssured: number;
    rpliInitialPremium: number;
  };
  topInsuranceOfficials: TopInsuranceOfficialStat[];
  topInsuranceOffices: TopInsuranceOfficeStat[];
  recentInsuranceActivity: RecentInsuranceActivity[];
}

