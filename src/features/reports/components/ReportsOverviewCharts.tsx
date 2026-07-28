'use client';

import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const COLORS = ['#4f46e5', '#ec4899', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6'];

interface ReportsOverviewChartsProps {
  summary: {
    accountsByType: Array<{ name: string; value: number }>;
    accountsByOfficial: Array<{ name: string; accounts: number }>;
  };
}

export function ReportsOverviewCharts({ summary }: ReportsOverviewChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart: Accounts by Type */}
      <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 p-4">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Accounts Distribution by Type</CardTitle>
          <CardDescription className="text-xs text-slate-400">Ratio of business account products</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {summary.accountsByType.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">No account data found</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.accountsByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {summary.accountsByType.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Bar Chart: Top Officials */}
      <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 p-4">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Top Performing Officials</CardTitle>
          <CardDescription className="text-xs text-slate-400">Total accounts opened per official</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {summary.accountsByOfficial.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">No official data found</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={summary.accountsByOfficial}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <YAxis dataKey="name" type="category" width={110} stroke="rgba(255,255,255,0.4)" tick={{fill: 'rgba(255,255,255,0.8)', fontSize: 11}} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="accounts" name="Accounts Opened" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
