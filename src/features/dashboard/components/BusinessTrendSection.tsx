'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Activity, 
  CalendarDays,
  ShieldCheck
} from 'lucide-react';
import { ExecutiveDailyTrendPoint, ExecutiveTrendMetric } from '@/types/dashboard';
import { formatCurrencyShort } from '@/features/dashboard/utils/formatters';

type ChartMetric = 'accounts' | 'premium' | 'policies';

interface BusinessTrendSectionProps {
  timelineTrends: ExecutiveDailyTrendPoint[];
  pliTrend: ExecutiveTrendMetric;
  rpliTrend: ExecutiveTrendMetric;
  accountsTrend: ExecutiveTrendMetric;
}

export function BusinessTrendSection({
  timelineTrends,
  pliTrend,
  rpliTrend,
  accountsTrend,
}: BusinessTrendSectionProps) {
  const [metricView, setMetricView] = useState<ChartMetric>('premium');

  const hasData = timelineTrends.some(
    (t) => t.accounts > 0 || t.initialPremium > 0 || t.totalPolicies > 0
  );

  return (
    <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-xl space-y-5 flex flex-col justify-between">
      <div>
        {/* Header and Metric View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Activity className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">14-Day Business Velocity & Trend</h3>
              <p className="text-xs text-slate-400">Rolling volume and financial momentum across division</p>
            </div>
          </div>

          {/* Metric Selector Tabs */}
          <div 
            className="flex items-center p-1 bg-slate-950/80 border border-white/10 rounded-xl self-start sm:self-auto"
            role="tablist"
            aria-label="Trend Metric Switcher"
          >
            <button
              type="button"
              role="tab"
              aria-selected={metricView === 'premium'}
              onClick={() => setMetricView('premium')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                metricView === 'premium'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Premium (₹)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={metricView === 'accounts'}
              onClick={() => setMetricView('accounts')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                metricView === 'accounts'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Accounts
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={metricView === 'policies'}
              onClick={() => setMetricView('policies')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                metricView === 'policies'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Policies
            </button>
          </div>
        </div>

        {/* Direction Indicator Banner (Answers: Is PLI/RPLI business increasing or decreasing?) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3">
          {/* PLI Momentum */}
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
              <span>PLI Momentum:</span>
            </div>
            <span className="font-bold flex items-center">
              {pliTrend.direction === 'increasing' ? (
                <span className="text-emerald-400 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" aria-hidden="true" />
                  +{pliTrend.percentage}% (Rising)
                </span>
              ) : pliTrend.direction === 'decreasing' ? (
                <span className="text-rose-400 flex items-center">
                  <TrendingDown className="w-3 h-3 mr-1" aria-hidden="true" />
                  -{pliTrend.percentage}% (Declining)
                </span>
              ) : (
                <span className="text-slate-400 flex items-center">
                  <Minus className="w-3 h-3 mr-1" aria-hidden="true" />
                  Stable
                </span>
              )}
            </span>
          </div>

          {/* RPLI Momentum */}
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
              <span>RPLI Momentum:</span>
            </div>
            <span className="font-bold flex items-center">
              {rpliTrend.direction === 'increasing' ? (
                <span className="text-emerald-400 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" aria-hidden="true" />
                  +{rpliTrend.percentage}% (Rising)
                </span>
              ) : rpliTrend.direction === 'decreasing' ? (
                <span className="text-rose-400 flex items-center">
                  <TrendingDown className="w-3 h-3 mr-1" aria-hidden="true" />
                  -{rpliTrend.percentage}% (Declining)
                </span>
              ) : (
                <span className="text-slate-400 flex items-center">
                  <Minus className="w-3 h-3 mr-1" aria-hidden="true" />
                  Stable
                </span>
              )}
            </span>
          </div>

          {/* Accounts Momentum */}
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <CalendarDays className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
              <span>POSB Velocity:</span>
            </div>
            <span className="font-bold flex items-center">
              {accountsTrend.direction === 'increasing' ? (
                <span className="text-emerald-400 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" aria-hidden="true" />
                  +{accountsTrend.percentage}% (Rising)
                </span>
              ) : accountsTrend.direction === 'decreasing' ? (
                <span className="text-rose-400 flex items-center">
                  <TrendingDown className="w-3 h-3 mr-1" aria-hidden="true" />
                  -{accountsTrend.percentage}% (Declining)
                </span>
              ) : (
                <span className="text-slate-400 flex items-center">
                  <Minus className="w-3 h-3 mr-1" aria-hidden="true" />
                  Stable
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Chart View */}
        <div className="h-68 sm:h-74 pt-4 w-full">
          {!hasData ? (
            <div className="flex h-full items-center justify-center flex-col text-slate-500 text-xs">
              <Activity className="w-8 h-8 mb-2 opacity-30" />
              <p>No transactions recorded in the past 14 days.</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Logged contributions will automatically chart daily trends.</p>
            </div>
          ) : metricView === 'premium' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineTrends} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickFormatter={(v) => formatCurrencyShort(v)} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'rgba(2, 6, 23, 0.95)',
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                    color: '#fff',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(val: number | string | ReadonlyArray<number | string> | undefined) => [
                    formatCurrencyShort(Number(val) || 0),
                    'Initial Premium',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="initialPremium"
                  name="Premium Collected"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPremium)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : metricView === 'accounts' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineTrends} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAccounts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} allowDecimals={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'rgba(2, 6, 23, 0.95)',
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    color: '#fff',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(val: number | string | ReadonlyArray<number | string> | undefined) => [
                    Number(val || 0).toLocaleString(),
                    'Accounts Opened',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="accounts"
                  name="Accounts Opened"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAccounts)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineTrends} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} allowDecimals={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'rgba(2, 6, 23, 0.95)',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    color: '#fff',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="pliPolicies" name="PLI Policies" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rpliPolicies" name="RPLI Policies" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
