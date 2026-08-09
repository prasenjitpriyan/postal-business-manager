'use client';

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type TooltipValue = number | string | ReadonlyArray<number | string> | undefined;
type TooltipName = number | string | undefined;

interface ReportsTrendsChartsProps {
  summary: {
    contributionsOverTime: Array<{ date: string; accounts: number; entries: number }>;
    insuranceOverTime?: Array<{ date: string; totalSumAssured: number; totalInitialPremium: number; policies: number }>;
  };
}

export function ReportsTrendsCharts({ summary }: ReportsTrendsChartsProps) {
  const accountsTimeData = summary.contributionsOverTime || [];
  const insuranceTimeData = summary.insuranceOverTime || [];

  const formatCurrencyShort = (val: TooltipValue) => {
    const num = typeof val === 'number' ? val : Number(val) || 0;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}k`;
    return `₹${num}`;
  };

  return (
    <div className="space-y-6">
      {/* Account Volume Trend */}
      <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 p-4">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white flex items-center justify-between">
            <span>Account Contributions Velocity</span>
            <span className="text-xs font-normal text-sky-400">Daily Accounts Opened</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">Timeline of total business accounts opened per date</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {accountsTimeData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-500">No account trend data available for this range</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accountsTimeData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorAccounts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} allowDecimals={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '12px' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Area type="monotone" dataKey="accounts" name="Accounts Opened" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorAccounts)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Insurance Revenue Trend */}
      <Card className="bg-slate-950/50 backdrop-blur-md border border-emerald-500/20 text-slate-100 p-4">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white flex items-center justify-between">
            <span>Insurance Revenue & Sum Assured Trend</span>
            <span className="text-xs font-normal text-emerald-400">PLI / RPLI Financial Flow</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">Timeline of Insurance Sum Assured and Initial Premium collected</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {insuranceTimeData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-500">No insurance trend data available for this range</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insuranceTimeData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis yAxisId="left" stroke="rgba(16, 185, 129, 0.6)" fontSize={11} tickFormatter={formatCurrencyShort} />
                <YAxis yAxisId="right" orientation="right" stroke="rgba(99, 102, 241, 0.6)" fontSize={11} tickFormatter={formatCurrencyShort} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#fff', borderRadius: '12px' }}
                  formatter={(val: TooltipValue, name: TooltipName) => [formatCurrencyShort(val), String(name || '')]}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar yAxisId="left" dataKey="totalSumAssured" name="Sum Assured" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="totalInitialPremium" name="Initial Premium" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
