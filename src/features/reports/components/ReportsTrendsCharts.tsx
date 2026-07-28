'use client';

import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ReportsTrendsChartsProps {
  summary: {
    contributionsOverTime: Array<{ date: string; accounts: number }>;
  };
}

export function ReportsTrendsCharts({ summary }: ReportsTrendsChartsProps) {
  return (
    <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 p-4">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Contribution Growth Over Time</CardTitle>
        <CardDescription className="text-xs text-slate-400">Timeline of total accounts opened per date</CardDescription>
      </CardHeader>
      <CardContent className="h-96">
        {summary.contributionsOverTime.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">No trend data available for this range</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={summary.contributionsOverTime}
              margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorAccounts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Area type="monotone" dataKey="accounts" name="Accounts Opened" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorAccounts)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
