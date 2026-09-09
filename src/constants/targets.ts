import { TargetCategory, MetricType, TargetStatus } from '@/types/target';

export interface FinancialYearOption {
  value: string;
  label: string;
  isCurrent?: boolean;
}

export const FINANCIAL_YEAR_OPTIONS: FinancialYearOption[] = [
  { value: '2024-2025', label: 'FY 2024-2025' },
  { value: '2025-2026', label: 'FY 2025-2026' },
  { value: '2026-2027', label: 'FY 2026-2027', isCurrent: true },
  { value: '2027-2028', label: 'FY 2027-2028' },
];

export const CURRENT_FINANCIAL_YEAR = '2026-2027';

export interface MonthOption {
  value: number;
  label: string;
  calendarMonth: number; // 1-12 calendar month (e.g. 4 for April)
}

// India Post Financial Year Month mapping (Month 1 = April ... Month 12 = March)
export const FISCAL_MONTH_OPTIONS: MonthOption[] = [
  { value: 1, label: 'Month 1 - April', calendarMonth: 4 },
  { value: 2, label: 'Month 2 - May', calendarMonth: 5 },
  { value: 3, label: 'Month 3 - June', calendarMonth: 6 },
  { value: 4, label: 'Month 4 - July', calendarMonth: 7 },
  { value: 5, label: 'Month 5 - August', calendarMonth: 8 },
  { value: 6, label: 'Month 6 - September', calendarMonth: 9 },
  { value: 7, label: 'Month 7 - October', calendarMonth: 10 },
  { value: 8, label: 'Month 8 - November', calendarMonth: 11 },
  { value: 9, label: 'Month 9 - December', calendarMonth: 12 },
  { value: 10, label: 'Month 10 - January', calendarMonth: 1 },
  { value: 11, label: 'Month 11 - February', calendarMonth: 2 },
  { value: 12, label: 'Month 12 - March', calendarMonth: 3 },
];

export const TARGET_CATEGORY_OPTIONS: { value: TargetCategory; label: string; description: string }[] = [
  { value: 'POSB', label: 'POSB Savings & Deposits', description: 'Savings, RD, TD, MIS, SCSS, PPF, SSA, etc.' },
  { value: 'PLI', label: 'Postal Life Insurance (PLI)', description: 'Government & institutional life insurance policies' },
  { value: 'RPLI', label: 'Rural Postal Life Insurance (RPLI)', description: 'Rural life coverage & Gram Suraksha policies' },
];

export const METRIC_TYPE_OPTIONS: { value: MetricType; label: string; applicableTo: TargetCategory[] }[] = [
  { value: 'ACCOUNTS_COUNT', label: 'Number of Accounts Opened', applicableTo: ['POSB'] },
  { value: 'POLICIES_COUNT', label: 'Number of Policies Sourced', applicableTo: ['PLI', 'RPLI'] },
  { value: 'SUM_ASSURED', label: 'Total Sum Assured (₹)', applicableTo: ['PLI', 'RPLI'] },
  { value: 'INITIAL_PREMIUM', label: 'Initial Premium Collected (₹)', applicableTo: ['PLI', 'RPLI'] },
];

export const TARGET_STATUS_CONFIG: Record<
  TargetStatus,
  {
    label: TargetStatus;
    badgeClass: string;
    progressClass: string;
    borderClass: string;
    bgClass: string;
    textClass: string;
  }
> = {
  Achieved: {
    label: 'Achieved',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    progressClass: 'bg-emerald-500',
    borderClass: 'border-emerald-500/20',
    bgClass: 'bg-emerald-950/20',
    textClass: 'text-emerald-400',
  },
  'On Track': {
    label: 'On Track',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    progressClass: 'bg-blue-500',
    borderClass: 'border-blue-500/20',
    bgClass: 'bg-blue-950/20',
    textClass: 'text-blue-400',
  },
  'Needs Attention': {
    label: 'Needs Attention',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    progressClass: 'bg-amber-500',
    borderClass: 'border-amber-500/20',
    bgClass: 'bg-amber-950/20',
    textClass: 'text-amber-400',
  },
  Critical: {
    label: 'Critical',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    progressClass: 'bg-rose-500',
    borderClass: 'border-rose-500/20',
    bgClass: 'bg-rose-950/20',
    textClass: 'text-rose-400',
  },
};
