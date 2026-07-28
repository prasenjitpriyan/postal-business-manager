'use client';

import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ReportsOfficesChartsProps {
  summary: {
    accountsByOffice: Array<{ name: string; accounts: number }>;
  };
}

export function ReportsOfficesCharts({ summary }: ReportsOfficesChartsProps) {
  return (
    <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 p-4">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Postal Office Performance Ranking</CardTitle>
        <CardDescription className="text-xs text-slate-400">Total volume of accounts opened across offices</CardDescription>
      </CardHeader>
      <CardContent className="h-96">
        {summary.accountsByOffice.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">No office data available</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={summary.accountsByOffice}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} angle={-25} textAnchor="end" />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px' }}
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
              />
              <Bar dataKey="accounts" name="Accounts Opened" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
